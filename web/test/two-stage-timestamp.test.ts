import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  resolveVideoMomentsTwoStage,
  type ChapterMatch,
  type ChunkMatch,
  getLessonUrl,
} from "../lib/utils/search.ts";
import { parseVideoUrl } from "../lib/utils/video.ts";

describe("Two-Stage Timestamp Resolution", () => {
  describe("Stage 1 Priority: Chapters First", () => {
    test("returns chapter markers when both chapters and chunks match", () => {
      const matchedChapters: ChapterMatch[] = [
        { startSeconds: 120, label: "Request Memoization in fetch()" },
        { startSeconds: 310, label: "Data Cache and Tag-Based Revalidation" },
      ];
      const matchedChunks: ChunkMatch[] = [
        { startSeconds: 45, text: "We can also talk about memoization here in this sentence." },
        { startSeconds: 210, text: "Revalidation is explained in this speech segment." },
      ];

      const results = resolveVideoMomentsTwoStage(matchedChapters, matchedChunks);

      assert.equal(results.length, 2);
      assert.equal(results[0].sourceType, "chapter");
      assert.equal(results[0].startSeconds, 120);
      assert.equal(results[0].description, "Request Memoization in fetch()");
      assert.equal(results[0].clipLength, "2-5 mins");

      assert.equal(results[1].sourceType, "chapter");
      assert.equal(results[1].startSeconds, 310);
      assert.equal(results[1].description, "Data Cache and Tag-Based Revalidation");
    });

    test("limits returned chapter moments to maxMoments", () => {
      const chapters: ChapterMatch[] = [
        { startSeconds: 10, label: "Chapter 1" },
        { startSeconds: 60, label: "Chapter 2" },
        { startSeconds: 120, label: "Chapter 3" },
        { startSeconds: 180, label: "Chapter 4" },
        { startSeconds: 240, label: "Chapter 5" },
      ];

      const results = resolveVideoMomentsTwoStage(chapters, [], 3);
      assert.equal(results.length, 3);
      assert.equal(results[2].startSeconds, 120);
    });
  });

  describe("Stage 2 Fallback: Transcript Matching", () => {
    test("falls back to transcript chunks ONLY when no chapters match", () => {
      const emptyChapters: ChapterMatch[] = [];
      const matchedChunks: ChunkMatch[] = [
        { startSeconds: 85, text: "In Next.js, every folder inside the app directory defines a route segment." },
        { startSeconds: 290, text: "Route groups wrapped in parentheses allow organizing routes." },
      ];

      const results = resolveVideoMomentsTwoStage(emptyChapters, matchedChunks);

      assert.equal(results.length, 2);
      assert.equal(results[0].sourceType, "transcript");
      assert.equal(results[0].startSeconds, 85);
      assert.equal(results[0].description, "In Next.js, every folder inside the app directory defines a route segment.");
      assert.equal(results[0].clipLength, "1-2 mins");

      assert.equal(results[1].sourceType, "transcript");
      assert.equal(results[1].startSeconds, 290);
    });

    test("truncates long transcript chunks cleanly with ellipsis", () => {
      const longText = "A".repeat(160);
      const chunks: ChunkMatch[] = [{ startSeconds: 50, text: longText }];

      const results = resolveVideoMomentsTwoStage([], chunks);
      assert.equal(results.length, 1);
      assert.ok(results[0].description.endsWith("..."));
      assert.equal(results[0].description.length, 140);
    });

    test("handles null or undefined chapter arrays gracefully", () => {
      const chunks: ChunkMatch[] = [{ startSeconds: 30, text: "Fallback text chunk" }];
      const results = resolveVideoMomentsTwoStage(null, chunks);
      assert.equal(results.length, 1);
      assert.equal(results[0].sourceType, "transcript");
    });

    test("returns empty array if neither chapters nor chunks match", () => {
      assert.deepEqual(resolveVideoMomentsTwoStage([], []), []);
      assert.deepEqual(resolveVideoMomentsTwoStage(null, null), []);
      assert.deepEqual(resolveVideoMomentsTwoStage(undefined, undefined), []);
    });
  });

  describe("Timestamp Clamping and Deep Linking", () => {
    test("clamps negative timestamps to 0", () => {
      const chapters: ChapterMatch[] = [{ startSeconds: -15, label: "Intro" }];
      const results = resolveVideoMomentsTwoStage(chapters, []);
      assert.equal(results[0].startSeconds, 0);
    });

    test("floats are floored to clean integer seconds", () => {
      const chapters: ChapterMatch[] = [{ startSeconds: 125.75, label: "Part 2" }];
      const results = resolveVideoMomentsTwoStage(chapters, []);
      assert.equal(results[0].startSeconds, 125);
    });

    test("generates deep link with start timestamp query parameter", () => {
      const urlWithStart = getLessonUrl("server-actions-basics", 145);
      assert.equal(urlWithStart, "/lessons/server-actions-basics?start=145");

      const urlWithoutStart = getLessonUrl("server-actions-basics", 0);
      assert.equal(urlWithoutStart, "/lessons/server-actions-basics");
    });
  });

  describe("On-Site Video Provider Seek URLs", () => {
    test("YouTube: appends start parameter for on-site seek", () => {
      const parsed = parseVideoUrl("https://www.youtube.com/watch?v=9602Yzvd7ik", 145);
      assert.ok(parsed);
      assert.equal(parsed.provider, "youtube");
      assert.ok(parsed.embedUrl.includes("&start=145"));
    });

    test("Vimeo: appends time hash #t=Xs for on-site seek", () => {
      const parsed = parseVideoUrl("https://vimeo.com/123456789", 90);
      assert.ok(parsed);
      assert.equal(parsed.provider, "vimeo");
      assert.ok(parsed.embedUrl.includes("#t=90s"));
    });

    test("Bunny: appends ?t=X parameter for on-site seek", () => {
      const parsed = parseVideoUrl("https://iframe.mediadelivery.net/embed/12345/abc-def-789", 60);
      assert.ok(parsed);
      assert.equal(parsed.provider, "bunny");
      assert.ok(parsed.embedUrl.includes("?t=60"));
    });
  });
});
