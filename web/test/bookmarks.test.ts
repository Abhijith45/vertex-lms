import { test, describe } from "node:test";
import assert from "node:assert/strict";

/** Sanitize Sanity document ID matching /api/bookmarks */
function sanitizeDocId(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 128);
}

/** Pure helper to resolve next bookmark state */
function resolveNextBookmarkState(
  currentList: Array<{ _ref: string; _key?: string }>,
  targetCourseId: string,
  explicitState?: boolean
): {
  isCurrentlyBookmarked: boolean;
  nextState: boolean;
  updatedList: Array<{ _ref: string; _key?: string }>;
} {
  const isCurrentlyBookmarked = currentList.some((ref) => ref._ref === targetCourseId);
  const nextState = explicitState !== undefined ? Boolean(explicitState) : !isCurrentlyBookmarked;

  let updatedList: Array<{ _ref: string; _key?: string }>;
  if (nextState) {
    if (isCurrentlyBookmarked) {
      updatedList = [...currentList];
    } else {
      updatedList = [...currentList, { _ref: targetCourseId, _key: `key_${targetCourseId}` }];
    }
  } else {
    updatedList = currentList.filter((ref) => ref._ref !== targetCourseId);
  }

  return { isCurrentlyBookmarked, nextState, updatedList };
}

describe("Bookmarks Architecture & Logic Unit Tests", () => {
  describe("sanitizeDocId", () => {
    test("cleanses standard alphanumeric Sanity IDs", () => {
      assert.equal(sanitizeDocId("course_123_abc"), "course_123_abc");
      assert.equal(sanitizeDocId("c-uuid-456.drafts"), "c-uuid-456.drafts");
    });

    test("strips dangerous and invalid characters", () => {
      assert.equal(sanitizeDocId("course$123<script>"), "course123script");
      assert.equal(sanitizeDocId("'; DROP TABLE courses;--"), "DROPTABLEcourses--");
    });

    test("handles non-string or empty inputs", () => {
      assert.equal(sanitizeDocId(null), "");
      assert.equal(sanitizeDocId(undefined), "");
      assert.equal(sanitizeDocId(12345), "");
      assert.equal(sanitizeDocId({}), "");
    });
  });

  describe("resolveNextBookmarkState", () => {
    const sampleList = [
      { _ref: "course-nextjs", _key: "k1" },
      { _ref: "course-docker", _key: "k2" },
    ];

    test("toggles an unbookmarked course to bookmarked", () => {
      const result = resolveNextBookmarkState(sampleList, "course-ai");
      assert.equal(result.isCurrentlyBookmarked, false);
      assert.equal(result.nextState, true);
      assert.equal(result.updatedList.length, 3);
      assert.equal(result.updatedList.some((r) => r._ref === "course-ai"), true);
    });

    test("toggles an already bookmarked course to unbookmarked", () => {
      const result = resolveNextBookmarkState(sampleList, "course-docker");
      assert.equal(result.isCurrentlyBookmarked, true);
      assert.equal(result.nextState, false);
      assert.equal(result.updatedList.length, 1);
      assert.equal(result.updatedList.some((r) => r._ref === "course-docker"), false);
      assert.equal(result.updatedList[0]._ref, "course-nextjs");
    });

    test("idempotently adds when explicitState is true", () => {
      const result = resolveNextBookmarkState(sampleList, "course-nextjs", true);
      assert.equal(result.isCurrentlyBookmarked, true);
      assert.equal(result.nextState, true);
      // Shouldn't add duplicate
      assert.equal(result.updatedList.length, 2);
    });

    test("idempotently removes when explicitState is false", () => {
      const result = resolveNextBookmarkState(sampleList, "course-unknown", false);
      assert.equal(result.isCurrentlyBookmarked, false);
      assert.equal(result.nextState, false);
      assert.equal(result.updatedList.length, 2);
    });
  });
});
