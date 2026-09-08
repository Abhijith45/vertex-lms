import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── PostHog Event Taxonomy & Validation ───

export const TRACKED_EVENTS = [
  "search_performed",
  "search_result_opened",
  "search_submitted",
  "search_suggestion_selected",
  "video_played",
  "video_paused",
  "video_watch_depth",
  "resume_used",
  "lesson_completed",
  "lesson_viewed",
  "course_viewed",
  "lesson_tab_switched",
  "lesson_navigated",
] as const;

export type TrackedEventName = (typeof TRACKED_EVENTS)[number];

// Prohibited PII property keys that must NEVER appear in event properties
const PROHIBITED_PII_KEYS = new Set([
  "email",
  "user_email",
  "name",
  "user_name",
  "full_name",
  "first_name",
  "last_name",
  "phone",
  "phone_number",
  "ip",
  "ip_address",
  "ssn",
]);

export function calculateWatchDepthMilestones(
  currentTime: number,
  duration: number,
  alreadyReached: Set<number>
): number[] {
  if (duration <= 0 || currentTime < 0) return [];
  const percent = Math.floor((currentTime / duration) * 100);
  const candidateMilestones = [25, 50, 75, 90, 100];
  const newMilestones: number[] = [];

  for (const m of candidateMilestones) {
    if (percent >= m && !alreadyReached.has(m)) {
      alreadyReached.add(m);
      newMilestones.push(m);
    }
  }

  return newMilestones;
}

export function validateEventPayload(event: string, properties: Record<string, unknown>) {
  // 1. Check snake_case event name
  assert.match(
    event,
    /^[a-z]+(_[a-z0-9]+)*$/,
    `Event name "${event}" must be lowercase snake_case`
  );

  // 2. Ensure no PII in properties
  for (const key of Object.keys(properties)) {
    assert.equal(
      PROHIBITED_PII_KEYS.has(key.toLowerCase()),
      false,
      `Prohibited PII property "${key}" found in event "${event}"`
    );

    // Also check string values don't look like email addresses
    if (typeof properties[key] === "string") {
      assert.equal(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(properties[key]),
        false,
        `Property "${key}" in event "${event}" contains what appears to be an email address: ${properties[key]}`
      );
    }
  }

  return true;
}

// ─── Test Suites ───

describe("PostHog Analytics Event Taxonomy & Naming", () => {
  it("all event names follow snake_case format", () => {
    for (const evt of TRACKED_EVENTS) {
      assert.match(evt, /^[a-z]+(_[a-z0-9]+)*$/);
    }
  });

  it("includes all user-specified core events", () => {
    const required = [
      "search_performed",
      "search_result_opened",
      "video_played",
      "video_watch_depth",
      "resume_used",
      "lesson_completed",
    ];
    for (const req of required) {
      assert.ok(
        TRACKED_EVENTS.includes(req as TrackedEventName),
        `Missing required event: ${req}`
      );
    }
  });
});

describe("Search Event Payload Validation", () => {
  it("validates search_performed payload", () => {
    const payload = {
      query: "server components",
      query_length: 17,
      results_count: 5,
      lessons_count: 3,
      video_moments_count: 2,
      has_results: true,
      source: "search_page",
      is_cached: false,
    };
    assert.ok(validateEventPayload("search_performed", payload));
    assert.equal(payload.query, "server components");
    assert.equal(payload.results_count, 5);
  });

  it("validates search_result_opened for video moment", () => {
    const payload = {
      result_type: "video",
      query: "routing",
      lesson_slug: "nextjs-app-router-in-depth-file-system-routing",
      lesson_title: "File-system routing and the app directory",
      course_title: "Next.js for Production",
      start_seconds: 142,
      position_index: 1,
    };
    assert.ok(validateEventPayload("search_result_opened", payload));
    assert.equal(payload.result_type, "video");
    assert.equal(payload.start_seconds, 142);
  });

  it("validates search_result_opened for lesson match", () => {
    const payload = {
      result_type: "lesson",
      query: "routing",
      lesson_slug: "nextjs-app-router-in-depth-dynamic-routes-and-params",
      lesson_title: "Dynamic routes and route params",
      course_title: "Next.js for Production",
      position_index: 2,
    };
    assert.ok(validateEventPayload("search_result_opened", payload));
    assert.equal(payload.result_type, "lesson");
    assert.equal(payload.position_index, 2);
  });
});

describe("Video Watch Depth & Milestone Calculations", () => {
  it("detects no milestone before 25%", () => {
    const reached = new Set<number>();
    const milestones = calculateWatchDepthMilestones(20, 100, reached);
    assert.deepEqual(milestones, []);
    assert.equal(reached.size, 0);
  });

  it("detects 25% milestone once", () => {
    const reached = new Set<number>();
    const m1 = calculateWatchDepthMilestones(25, 100, reached);
    assert.deepEqual(m1, [25]);
    assert.ok(reached.has(25));

    // Subsequent tick at same time doesn't re-fire
    const m2 = calculateWatchDepthMilestones(26, 100, reached);
    assert.deepEqual(m2, []);
  });

  it("detects 50%, 75%, 90%, 100% progressively without duplicate triggers", () => {
    const reached = new Set<number>();

    // Jump from 0 to 55% -> fires 25 and 50
    const m1 = calculateWatchDepthMilestones(55, 100, reached);
    assert.deepEqual(m1, [25, 50]);

    // Scrub backwards to 30% -> no new milestones
    const m2 = calculateWatchDepthMilestones(30, 100, reached);
    assert.deepEqual(m2, []);

    // Continue to 95% -> fires 75 and 90
    const m3 = calculateWatchDepthMilestones(95, 100, reached);
    assert.deepEqual(m3, [75, 90]);

    // Finish video at 100% -> fires 100
    const m4 = calculateWatchDepthMilestones(100, 100, reached);
    assert.deepEqual(m4, [100]);
  });
});

describe("Resume Used & Lesson Completed Validation", () => {
  it("validates resume_used from timestamp offset", () => {
    const payload = {
      lesson_slug: "nextjs-app-router-in-depth-layouts-and-templates",
      lesson_title: "Layouts, templates, and shared UI",
      course_slug: "nextjs-for-production",
      start_seconds: 180,
      source: "video_player",
    };
    assert.ok(validateEventPayload("resume_used", payload));
    assert.equal(payload.start_seconds, 180);
    assert.equal(payload.source, "video_player");
  });

  it("validates resume_used from Course Hero CTA", () => {
    const payload = {
      course_slug: "nextjs-for-production",
      course_title: "Next.js for Production",
      continue_url: "/lessons/nextjs-app-router-in-depth-file-system-routing",
      source: "course_hero",
    };
    assert.ok(validateEventPayload("resume_used", payload));
    assert.equal(payload.source, "course_hero");
  });

  it("validates lesson_completed payload", () => {
    const payload = {
      lesson_slug: "nextjs-app-router-in-depth-caching-and-revalidation",
      lesson_title: "Caching and revalidation",
      course_slug: "nextjs-for-production",
      duration: 1522,
      source: "video_ended",
    };
    assert.ok(validateEventPayload("lesson_completed", payload));
    assert.equal(payload.source, "video_ended");
    assert.equal(payload.duration, 1522);
  });
});

describe("Privacy & PII Prevention", () => {
  it("rejects payloads containing prohibited PII property names", () => {
    const badPayload = {
      lesson_slug: "test",
      email: "learner@example.com",
    };
    assert.throws(() => validateEventPayload("lesson_completed", badPayload));
  });

  it("rejects payloads containing email addresses in values", () => {
    const badPayload = {
      lesson_slug: "test",
      author_contact: "instructor@vertex.dev",
    };
    assert.throws(() => validateEventPayload("lesson_viewed", badPayload));
  });
});
