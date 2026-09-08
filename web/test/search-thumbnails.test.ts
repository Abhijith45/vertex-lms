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

  describe("Default code icon matching for other topics", () => {
    test("returns default for TypeScript topics", () => {
      assert.equal(
        resolveFallbackThumbnailType("TypeScript for Application Developers", "Generics & Conditional Types", "generics"),
        "default"
      );
    });

    test("returns default for Docker & DevOps topics", () => {
      assert.equal(
        resolveFallbackThumbnailType("DevOps Essentials", "Containerizing with Docker", "docker-basics"),
        "default"
      );
    });

    test("returns default for Python & Machine Learning topics", () => {
      assert.equal(
        resolveFallbackThumbnailType("Python for AI", "NumPy & Pandas", "numpy-pandas"),
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
