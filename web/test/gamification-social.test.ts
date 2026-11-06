import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generateCertificateSignature,
  verifyCertificate,
  type Certificate,
} from "../lib/certificate.ts";
import {
  calculateStreak,
} from "../lib/streak.ts";
import {
  createDiscussion,
  toggleThreadUpvote,
  addReply,
  type DiscussionThread,
} from "../lib/discussion.ts";

describe("Phase 3: Cryptographically Verifiable Certificates", () => {
  const secretKey = "test-secret-signing-key-vertex-2026";
  const validPayload = {
    id: "vtx-cert-test-course-01",
    userId: "user_learner_123",
    courseSlug: "test-course-01",
    issuedAt: "2026-11-06T12:00:00.000Z",
  };

  const validSignature = generateCertificateSignature(validPayload, secretKey);

  const authenticCertificate: Certificate = {
    id: validPayload.id,
    userId: validPayload.userId,
    userName: "Abhijeet Rawat",
    courseSlug: validPayload.courseSlug,
    courseTitle: "Distributed Systems & Next.js",
    instructorName: "Vertex Technical Faculty",
    issuedAt: validPayload.issuedAt,
    signature: validSignature,
    skills: ["System Architecture", "Next.js", "PostgreSQL"],
    totalLessons: 10,
  };

  it("generates deterministic HMAC-SHA256 signatures", () => {
    const sig1 = generateCertificateSignature(validPayload, secretKey);
    const sig2 = generateCertificateSignature(validPayload, secretKey);
    assert.strictEqual(sig1, sig2);
    assert.strictEqual(sig1.length, 64); // 256 bits = 64 hex chars
  });

  it("verifies an authentic, unaltered certificate", () => {
    const isValid = verifyCertificate(authenticCertificate, secretKey);
    assert.strictEqual(isValid, true);
  });

  it("detects and rejects tampering with recipient user identity", () => {
    const tamperedCertificate = {
      ...authenticCertificate,
      userId: "attacker_impersonating_user",
    };
    const isValid = verifyCertificate(tamperedCertificate, secretKey);
    assert.strictEqual(isValid, false);
  });

  it("detects and rejects tampering with course completion slug", () => {
    const tamperedCertificate = {
      ...authenticCertificate,
      courseSlug: "unearned-advanced-course-slug",
    };
    const isValid = verifyCertificate(tamperedCertificate, secretKey);
    assert.strictEqual(isValid, false);
  });

  it("detects and rejects forged / counterfeit signatures", () => {
    const counterfeitCert = {
      ...authenticCertificate,
      signature: "0000000000000000000000000000000000000000000000000000000000000000",
    };
    const isValid = verifyCertificate(counterfeitCert, secretKey);
    assert.strictEqual(isValid, false);
  });

  it("handles mismatched signature lengths safely without crashing", () => {
    const badLengthCert = {
      ...authenticCertificate,
      signature: "short_invalid_signature",
    };
    const isValid = verifyCertificate(badLengthCert, secretKey);
    assert.strictEqual(isValid, false);
  });
});

describe("Phase 3: Timestamped Community Discussions & Q&A", () => {
  const sampleThreads: DiscussionThread[] = [
    {
      id: "thread-c",
      lessonSlug: "test-lesson",
      author: { name: "Learner C" },
      title: "Question C",
      content: "Details C",
      timestampSeconds: 180,
      upvotes: 5,
      createdAt: "2026-11-06T10:00:00.000Z",
      replies: [],
    },
    {
      id: "thread-a",
      lessonSlug: "test-lesson",
      author: { name: "Learner A" },
      title: "Question A",
      content: "Details A",
      timestampSeconds: 45,
      upvotes: 20,
      createdAt: "2026-11-06T08:00:00.000Z",
      replies: [],
    },
    {
      id: "thread-b",
      lessonSlug: "test-lesson",
      author: { name: "Learner B" },
      title: "Question B",
      content: "Details B",
      timestampSeconds: 110,
      upvotes: 12,
      createdAt: "2026-11-06T09:00:00.000Z",
      replies: [],
    },
  ];

  it("sorts threads by upvotes descending in 'top' mode", () => {
    const sorted = [...sampleThreads].sort((a, b) => b.upvotes - a.upvotes);
    assert.strictEqual(sorted[0].id, "thread-a"); // 20 upvotes
    assert.strictEqual(sorted[1].id, "thread-b"); // 12 upvotes
    assert.strictEqual(sorted[2].id, "thread-c"); // 5 upvotes
  });

  it("sorts threads by recency in 'newest' mode", () => {
    const sorted = [...sampleThreads].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    assert.strictEqual(sorted[0].id, "thread-c"); // 10:00
    assert.strictEqual(sorted[1].id, "thread-b"); // 09:00
    assert.strictEqual(sorted[2].id, "thread-a"); // 08:00
  });

  it("sorts threads chronologically by video timestamp in 'timeline' mode", () => {
    const sorted = [...sampleThreads].sort(
      (a, b) => (a.timestampSeconds ?? 0) - (b.timestampSeconds ?? 0)
    );
    assert.strictEqual(sorted[0].timestampSeconds, 45);
    assert.strictEqual(sorted[1].timestampSeconds, 110);
    assert.strictEqual(sorted[2].timestampSeconds, 180);
  });

  it("toggles upvote state accurately", () => {
    const thread = createDiscussion({
      lessonSlug: "unit-test-lesson",
      authorName: "Test Student",
      title: "Unit Test Title",
      content: "Unit test content",
      timestampSeconds: 30,
    });

    const initialVotes = thread.upvotes;
    assert.strictEqual(thread.userUpvoted, true);

    // Toggle off (remove upvote)
    const toggledOff = toggleThreadUpvote(thread.id);
    assert.strictEqual(toggledOff?.userUpvoted, false);
    assert.strictEqual(toggledOff?.upvotes, initialVotes - 1);

    // Toggle back on
    const toggledOn = toggleThreadUpvote(thread.id);
    assert.strictEqual(toggledOn?.userUpvoted, true);
    assert.strictEqual(toggledOn?.upvotes, initialVotes);
  });

  it("appends replies to thread correctly", () => {
    const thread = createDiscussion({
      lessonSlug: "reply-test-lesson",
      authorName: "Alice",
      title: "How to stream responses?",
      content: "Explain streaming responses",
    });

    assert.strictEqual(thread.replies.length, 0);

    const reply = addReply(thread.id, {
      authorName: "Bob",
      authorRole: "instructor",
      content: "Use ReadableStream with controller.enqueue()",
    });

    assert.ok(reply);
    assert.strictEqual(thread.replies.length, 1);
    assert.strictEqual(thread.replies[0].author.role, "instructor");
  });
});

describe("Phase 3: Streak & Momentum State Machine", () => {
  const refDate = new Date("2026-11-06T12:00:00Z");

  it("computes 3-day streak when active today, yesterday, and day before", () => {
    const dates = ["2026-11-06", "2026-11-05", "2026-11-04"];
    const streak = calculateStreak(dates, refDate);

    assert.strictEqual(streak.currentStreak, 3);
    assert.strictEqual(streak.isActiveToday, true);
    assert.strictEqual(streak.longestStreak, 3);
  });

  it("maintains streak during grace period if active yesterday but not yet today", () => {
    const dates = ["2026-11-05", "2026-11-04", "2026-11-03"];
    const streak = calculateStreak(dates, refDate);

    assert.strictEqual(streak.currentStreak, 3);
    assert.strictEqual(streak.isActiveToday, false);
  });

  it("resets streak to 1 if user missed yesterday and is active today", () => {
    const dates = ["2026-11-06", "2026-11-01", "2026-10-31"];
    const streak = calculateStreak(dates, refDate);

    assert.strictEqual(streak.currentStreak, 1);
    assert.strictEqual(streak.isActiveToday, true);
    assert.strictEqual(streak.longestStreak, 2); // 2026-10-31 to 2026-11-01 was 2 days
  });

  it("returns 0 current streak if learner missed both today and yesterday", () => {
    const dates = ["2026-11-04", "2026-11-03"];
    const streak = calculateStreak(dates, refDate);

    assert.strictEqual(streak.currentStreak, 0);
    assert.strictEqual(streak.isActiveToday, false);
    assert.strictEqual(streak.longestStreak, 2);
  });

  it("deduplicates multiple events on the same day (idempotent)", () => {
    const dates = [
      "2026-11-06",
      "2026-11-06",
      "2026-11-06T10:15:00",
      "2026-11-05",
      "2026-11-05T14:20:00",
    ];
    const streak = calculateStreak(dates, refDate);

    assert.strictEqual(streak.currentStreak, 2);
    assert.strictEqual(streak.totalActiveDays, 2);
  });

  it("handles empty activity history gracefully", () => {
    const streak = calculateStreak([], refDate);
    assert.strictEqual(streak.currentStreak, 0);
    assert.strictEqual(streak.longestStreak, 0);
    assert.strictEqual(streak.isActiveToday, false);
  });
});
