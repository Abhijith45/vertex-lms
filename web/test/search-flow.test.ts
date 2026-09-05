import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSearchQuery,
  formatSearchUrl,
  shouldShowSuggestions,
  calculatePagination,
  getLessonUrl,
  getSearchResultBackUrl,
  getHomeUrl,
} from "../lib/utils/search.ts";

describe("normalizeSearchQuery", () => {
  test("returns empty string for null, undefined, or empty query", () => {
    assert.equal(normalizeSearchQuery(null), "");
    assert.equal(normalizeSearchQuery(undefined), "");
    assert.equal(normalizeSearchQuery(""), "");
    assert.equal(normalizeSearchQuery("   "), "");
  });

  test("trims leading and trailing whitespace", () => {
    assert.equal(normalizeSearchQuery("  react query  "), "react query");
  });

  test("collapses multiple consecutive spaces into single space", () => {
    assert.equal(
      normalizeSearchQuery("react   server    components"),
      "react server components"
    );
  });
});

describe("formatSearchUrl", () => {
  test("returns base /search when query is empty", () => {
    assert.equal(formatSearchUrl(""), "/search");
    assert.equal(formatSearchUrl("   "), "/search");
  });

  test("properly URI encodes special characters and spaces", () => {
    assert.equal(
      formatSearchUrl("react & next.js"),
      "/search?q=react%20%26%20next.js"
    );
    assert.equal(formatSearchUrl("c++"), "/search?q=c%2B%2B");
  });
});

describe("shouldShowSuggestions state machine (Auto-collapse & Focus requirements)", () => {
  test("does NOT show suggestions when input is not focused (landing on result page)", () => {
    // Landing on /search?q=react: query exists and has suggestions, but user is not focused
    const showOnLanding = shouldShowSuggestions("react", false, true);
    assert.equal(showOnLanding, false, "Suggestions must remain collapsed on page load");
  });

  test("does NOT show suggestions when query is shorter than 2 characters", () => {
    assert.equal(shouldShowSuggestions("r", true, true), false);
    assert.equal(shouldShowSuggestions(" ", true, true), false);
  });

  test("does NOT show suggestions when no suggestions match", () => {
    assert.equal(shouldShowSuggestions("nonexistentquery", true, false), false);
  });

  test("SHOWS suggestions when focused, query >= 2 chars, and suggestions exist", () => {
    assert.equal(shouldShowSuggestions("next.js", true, true), true);
  });

  test("COLLAPSES suggestions immediately when clear button 'X' is clicked", () => {
    // When X is clicked, query resets to empty string
    const clearedQuery = "";
    const showAfterClear = shouldShowSuggestions(clearedQuery, true, false);
    assert.equal(showAfterClear, false, "Clearing query must collapse the dropdown");
  });

  test("COLLAPSES suggestions immediately on submit/navigation (blurring input)", () => {
    // When submitting, isFocused becomes false and dropdown closes
    const showAfterSubmit = shouldShowSuggestions("react", false, true);
    assert.equal(showAfterSubmit, false, "Submitting query must blur and close dropdown");
  });
});

describe("calculatePagination", () => {
  test("handles 0 total results gracefully", () => {
    const result = calculatePagination(0, 1, 6);
    assert.equal(result.totalPages, 1);
    assert.equal(result.currentPage, 1);
    assert.equal(result.startIndex, 0);
    assert.equal(result.endIndex, 0);
    assert.equal(result.hasNextPage, false);
    assert.equal(result.hasPrevPage, false);
  });

  test("calculates first page for 14 items (itemsPerPage = 6)", () => {
    const result = calculatePagination(14, 1, 6);
    assert.equal(result.totalPages, 3);
    assert.equal(result.currentPage, 1);
    assert.equal(result.startIndex, 0);
    assert.equal(result.endIndex, 6);
    assert.equal(result.hasNextPage, true);
    assert.equal(result.hasPrevPage, false);
  });

  test("calculates second page for 14 items", () => {
    const result = calculatePagination(14, 2, 6);
    assert.equal(result.currentPage, 2);
    assert.equal(result.startIndex, 6);
    assert.equal(result.endIndex, 12);
    assert.equal(result.hasNextPage, true);
    assert.equal(result.hasPrevPage, true);
  });

  test("calculates last page for 14 items", () => {
    const result = calculatePagination(14, 3, 6);
    assert.equal(result.currentPage, 3);
    assert.equal(result.startIndex, 12);
    assert.equal(result.endIndex, 14);
    assert.equal(result.hasNextPage, false);
    assert.equal(result.hasPrevPage, true);
  });

  test("clamps out-of-bounds page requests", () => {
    const clampedHigh = calculatePagination(14, 99, 6);
    assert.equal(clampedHigh.currentPage, 3);

    const clampedLow = calculatePagination(14, -5, 6);
    assert.equal(clampedLow.currentPage, 1);
  });
});

describe("Complete Search Journey Navigation Flow", () => {
  test("simulates Home -> Search Result -> Lesson -> Back to Search -> Back to Home", () => {
    // 1. User starts on Home Page
    const homeUrl = getHomeUrl();
    assert.equal(homeUrl, "/");

    // 2. User searches for 'Next.js App Router'
    const searchQuery = "Next.js App Router";
    const searchUrl = formatSearchUrl(searchQuery);
    assert.equal(searchUrl, "/search?q=Next.js%20App%20Router");

    // 3. User navigates to result page with initialQuery
    // Dropdown should be collapsed on landing
    const isDropdownOpenOnLanding = shouldShowSuggestions(searchQuery, false, true);
    assert.equal(isDropdownOpenOnLanding, false);

    // 4. User clicks a lesson result card (e.g. video moment at 145 seconds)
    const lessonUrl = getLessonUrl("server-actions", 145);
    assert.equal(lessonUrl, "/lessons/server-actions?start=145");

    // 5. User navigates without timestamp
    const standardLessonUrl = getLessonUrl("server-actions");
    assert.equal(standardLessonUrl, "/lessons/server-actions");

    // 6. User navigates back to Search Results page
    const backToSearchUrl = getSearchResultBackUrl(searchQuery);
    assert.equal(backToSearchUrl, "/search?q=Next.js%20App%20Router");

    // 7. User navigates back to Home page
    const backToHomeUrl = getHomeUrl();
    assert.equal(backToHomeUrl, "/");
  });
});

describe("Result Card Target Routing (404 Prevention)", () => {
  test("lesson result card always routes to /lessons/[slug] and not /courses/[slug]", () => {
    const lessonSlug = "react-performance-engineering-code-splitting";
    const targetUrl = getLessonUrl(lessonSlug);
    assert.equal(targetUrl, `/lessons/${lessonSlug}`);
    assert.equal(targetUrl.startsWith("/courses/"), false, "Must never route to /courses/ for a lesson slug");
  });

  test("video moment card routes to /lessons/[slug] with ?start= parameter", () => {
    const videoSlug = "react-performance-engineering-code-splitting";
    const targetUrl = getLessonUrl(videoSlug, 95);
    assert.equal(targetUrl, `/lessons/${videoSlug}?start=95`);
    assert.ok(targetUrl.includes("?start=95"), "Must include start parameter for video player seek");
  });
});
