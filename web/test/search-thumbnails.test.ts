import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveFallbackThumbnailType } from "../lib/utils/search.ts";

describe("resolveFallbackThumbnailType", () => {
  describe("Next.js topic matching", () => {
    test("detects Next.js from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("Next.js App Router In-Depth", "Introduction", "intro"),
        "nextjs"
      );
      assert.equal(
        resolveFallbackThumbnailType("Next.js for Production", "Server Actions", "server-actions"),
        "nextjs"
      );
    });

    test("detects Next.js from lessonTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("Full-Stack Frameworks", "Next.js Rendering Strategies", "rendering-strategies"),
        "nextjs"
      );
    });

    test("detects Next.js from lessonSlug", () => {
      assert.equal(
        resolveFallbackThumbnailType("Web Development", "Dynamic Routing", "nextjs-dynamic-routing"),
        "nextjs"
      );
    });

    test("prioritizes Next.js over React when both appear (e.g. Next.js with React 19)", () => {
      assert.equal(
        resolveFallbackThumbnailType("Next.js & React 19 Full-Stack Mastery", "Setup", "setup"),
        "nextjs"
      );
    });
  });

  describe("Docker & DevOps topic matching", () => {
    test("detects Docker from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("DevOps with Docker and Kubernetes", "Introduction", "intro"),
        "docker"
      );
      assert.equal(
        resolveFallbackThumbnailType("DevOps Essentials", "Containerizing Applications", "containers"),
        "docker"
      );
    });

    test("detects Docker from lessonTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("Cloud Infrastructure", "Docker Compose Multi-Stage Builds", "compose-builds"),
        "docker"
      );
    });

    test("detects Docker from lessonSlug", () => {
      assert.equal(
        resolveFallbackThumbnailType("Containers 101", "Pod Scaling", "docker-pod-scaling"),
        "docker"
      );
    });
  });

  describe("TypeScript topic matching", () => {
    test("detects TypeScript from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("TypeScript for Application Developers", "Generics & Conditional Types", "generics"),
        "typescript"
      );
    });
  });

  describe("React topic matching", () => {
    test("detects React from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("React Performance Engineering", "Code Splitting", "code-splitting"),
        "react"
      );
    });

    test("detects React from lessonTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("Frontend Architecture", "React Hook Form Mastery", "hook-form"),
        "react"
      );
    });

    test("detects React from lessonSlug", () => {
      assert.equal(
        resolveFallbackThumbnailType("State Management", "Context vs Zustand", "react-context-vs-zustand"),
        "react"
      );
    });
  });

  describe("Python topic matching", () => {
    test("detects Python from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("Python for Data Work", "DataFrames with Pandas", "pandas-dataframes"),
        "python"
      );
    });
  });

  describe("PostgreSQL topic matching", () => {
    test("detects PostgreSQL from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("PostgreSQL for Developers", "Query Indexing Strategies", "indexing"),
        "postgres"
      );
    });
  });

  describe("AI & LLM topic matching", () => {
    test("detects AI from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("Building AI Apps with LLMs", "Prompt Engineering", "prompting"),
        "ai"
      );
    });
  });

  describe("System Design topic matching", () => {
    test("detects System Design from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("System Design Foundations", "Load Balancing", "load-balancing"),
        "system-design"
      );
    });
  });

  describe("Security topic matching", () => {
    test("detects Security from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("Practical Web Security", "Preventing XSS", "xss"),
        "security"
      );
    });
  });

  describe("RAG topic matching", () => {
    test("detects RAG from courseTitle", () => {
      assert.equal(
        resolveFallbackThumbnailType("Retrieval-Augmented Generation from Scratch", "Vector Embeddings", "embeddings"),
        "rag"
      );
    });
  });

  describe("Default code icon matching for unmatched topics", () => {
    test("returns default for unknown subjects", () => {
      assert.equal(
        resolveFallbackThumbnailType("General Computer Science", "Algorithms", "algorithms"),
        "default"
      );
    });

    test("returns default when all inputs are undefined or empty", () => {
      assert.equal(resolveFallbackThumbnailType(), "default");
      assert.equal(resolveFallbackThumbnailType(undefined, undefined, undefined), "default");
      assert.equal(resolveFallbackThumbnailType("", "", ""), "default");
      assert.equal(resolveFallbackThumbnailType("   ", "   ", "   "), "default");
    });
  });
});
