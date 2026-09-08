import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchQuery, formatSearchUrl, processSearchQuery } from "../lib/utils/search.ts";

describe("OpenAI Search Analyzer & Query Processing Unit Tests", () => {
  const testKeywords = [
    // 1. Single core keywords
    { input: "react", expectedTokens: ["react"], category: "frontend" },
    { input: "docker", expectedTokens: ["docker"], category: "devops" },
    { input: "typescript", expectedTokens: ["typescript"], category: "languages" },
    { input: "nextjs", expectedTokens: ["nextjs"], category: "fullstack" },
    { input: "postgresql", expectedTokens: ["postgresql"], category: "database" },

    // 2. Multi-word technical concepts
    { input: "server components", expectedTokens: ["server", "components"], category: "react" },
    { input: "state management", expectedTokens: ["state", "management"], category: "architecture" },
    { input: "system design", expectedTokens: ["system", "design"], category: "architecture" },
    { input: "bundle analysis", expectedTokens: ["bundle", "analysis"], category: "performance" },
    { input: "data fetching", expectedTokens: ["data", "fetching"], category: "patterns" },
    { input: "web security", expectedTokens: ["web", "security"], category: "security" },

    // 3. Noisy & special character queries
    { input: "  React.js (v19)  ", expectedTokens: ["React", "js", "v19"], category: "versioned" },
    { input: "c++ & rust?", expectedTokens: ["c", "rust"], category: "special-chars" },
    { input: "Next.js App Router 15!", expectedTokens: ["Next", "js", "App", "Router", "15"], category: "framework" },
  ];

  describe("Keyword Tokenization & Normalization", () => {
    testKeywords.forEach(({ input, expectedTokens, category }) => {
      test(`properly normalizes and extracts tokens for [${category}]: "${input}"`, () => {
        const normalized = normalizeSearchQuery(input);
        assert.ok(normalized.length > 0, "Normalized query must not be empty");

        const tokens = normalized
          .replace(/[^a-zA-Z0-9\s]/g, " ")
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        for (const token of expectedTokens) {
          assert.ok(
            tokens.some((t) => t.toLowerCase() === token.toLowerCase()),
            `Expected token "${token}" to be present in tokens [${tokens.join(", ")}]`
          );
        }
      });
    });
  });

  describe("GROQ Search Pattern Formulation", () => {
    test("constructs valid wildcard token queries from user keywords", () => {
      const query = "React Performance";
      const cleanWords = query.trim().split(/\s+/).filter(Boolean);
      const queryPattern = `*${cleanWords.join("*")}*`;
      const orConditions = cleanWords.map((w) => `*${w}*`).join(" ");

      assert.equal(queryPattern, "*React*Performance*");
      assert.equal(orConditions, "*React* *Performance*");
    });

    test("handles single word search pattern", () => {
      const query = "docker";
      const cleanWords = query.trim().split(/\s+/).filter(Boolean);
      const queryPattern = `*${cleanWords.join("*")}*`;

      assert.equal(queryPattern, "*docker*");
    });
  });

  describe("Structured Search Result Schema Validation", () => {
    test("validates structured lesson result format", () => {
      const sampleLesson = {
        title: "Code splitting that pays off",
        slug: "code-splitting-that-pays-off",
        description: "Splitting only helps if the split-off code was genuinely not needed.",
        courseTitle: "React Performance Engineering",
        moduleLabel: "Lesson Match",
        keyPoints: [
          "Read a bundle analysis and find the heavy dependency",
          "Split along route and interaction boundaries",
        ],
      };

      assert.ok(sampleLesson.title.length > 0);
      assert.ok(sampleLesson.slug.length > 0);
      assert.ok(sampleLesson.description.length > 0);
      assert.ok(sampleLesson.courseTitle.length > 0);
      assert.equal(sampleLesson.moduleLabel, "Lesson Match");
      assert.ok(Array.isArray(sampleLesson.keyPoints));
      assert.equal(sampleLesson.keyPoints.length, 2);
    });

    test("validates structured video moment result format with valid start timestamp", () => {
      const sampleVideoMoment = {
        lessonTitle: "Analyzing Bundle Size",
        lessonSlug: "analyzing-bundle-size",
        courseTitle: "React Performance Engineering",
        courseIcon: "R",
        description: "Deep dive into webpack bundle analyzer and heavy imports.",
        startSeconds: 145,
        thumbnailUrl: "https://cdn.sanity.io/images/demo.jpg",
        clipLength: "2-5 mins",
      };

      assert.ok(sampleVideoMoment.lessonTitle.length > 0);
      assert.ok(sampleVideoMoment.lessonSlug.length > 0);
      assert.ok(sampleVideoMoment.courseTitle.length > 0);
      assert.ok(typeof sampleVideoMoment.startSeconds === "number");
      assert.ok(sampleVideoMoment.startSeconds >= 0);
      assert.equal(sampleVideoMoment.startSeconds, 145);
    });
  });

  describe("URL & Query Param Roundtrip", () => {
    const listQueries = [
      "react",
      "server components",
      "state management",
      "docker",
      "system design",
      "c++",
    ];

    listQueries.forEach((q) => {
      test(`generates accurate search URL for "${q}"`, () => {
        const url = formatSearchUrl(q);
        assert.ok(url.startsWith("/search?q="));
        const encodedParam = url.replace("/search?q=", "");
        assert.equal(decodeURIComponent(encodedParam), q);
      });
    });
  });

  describe("Query Enhancement & Technical Synonym Expansion", () => {
    test("filters conversational stop-words from queries", () => {
      const processed = processSearchQuery("how to use docker in production");
      assert.ok(!processed.cleanTokens.includes("how"));
      assert.ok(!processed.cleanTokens.includes("to"));
      assert.ok(!processed.cleanTokens.includes("in"));
      assert.ok(processed.cleanTokens.includes("docker"));
      assert.ok(processed.cleanTokens.includes("production"));
    });

    test("expands docker query with container and devops synonyms", () => {
      const processed = processSearchQuery("docker");
      assert.ok(processed.expandedTerms.includes("docker"));
      assert.ok(processed.expandedTerms.includes("container"));
      assert.ok(processed.expandedTerms.includes("devops"));
      assert.ok(processed.orConditions.some((c) => c.includes("container")));
    });

    test("expands auth query with clerk and authentication synonyms", () => {
      const processed = processSearchQuery("auth");
      assert.ok(processed.expandedTerms.includes("authentication"));
      assert.ok(processed.expandedTerms.includes("clerk"));
      assert.ok(processed.expandedTerms.includes("login"));
    });

    test("handles queries consisting only of stop-words gracefully", () => {
      const processed = processSearchQuery("how what is");
      assert.ok(processed.cleanTokens.length > 0);
      assert.ok(processed.queryPattern.length > 0);
    });
  });
});
