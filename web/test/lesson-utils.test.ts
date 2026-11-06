import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseVideoUrl } from "../lib/utils/video.ts";
import { resolveCurriculum, type CurriculumCourse } from "../lib/utils/curriculum.ts";

describe("parseVideoUrl", () => {
  test("parses standard YouTube watch URL", () => {
    const parsed = parseVideoUrl("https://www.youtube.com/watch?v=9602Yzvd7ik");
    assert.ok(parsed);
    assert.equal(parsed.provider, "youtube");
    assert.equal(parsed.id, "9602Yzvd7ik");
    assert.ok(parsed.embedUrl.includes("https://www.youtube-nocookie.com/embed/9602Yzvd7ik"));
  });

  test("parses short YouTube URL with start seconds", () => {
    const parsed = parseVideoUrl("https://youtu.be/k48WMdl2eUc", 125);
    assert.ok(parsed);
    assert.equal(parsed.provider, "youtube");
    assert.equal(parsed.id, "k48WMdl2eUc");
    assert.ok(parsed.embedUrl.includes("&start=125"));
  });

  test("parses Vimeo URL", () => {
    const parsed = parseVideoUrl("https://vimeo.com/76979871", 45);
    assert.ok(parsed);
    assert.equal(parsed.provider, "vimeo");
    assert.equal(parsed.id, "76979871");
    assert.ok(parsed.embedUrl.includes("player.vimeo.com/video/76979871#t=45s"));
  });

  test("returns null for undefined URL", () => {
    const parsed = parseVideoUrl(undefined);
    assert.equal(parsed, null);
  });
});

describe("resolveCurriculum", () => {
  const mockCourse: CurriculumCourse = {
    title: "Next.js for Production",
    slug: "nextjs-for-production",
    modules: [
      {
        title: "Module 1",
        lessons: [
          { title: "Lesson 1.1", slug: "lesson-1-1", duration: 300 },
          { title: "Lesson 1.2", slug: "lesson-1-2", duration: 400 },
        ],
      },
      {
        title: "Module 2",
        lessons: [
          { title: "Lesson 2.1", slug: "lesson-2-1", duration: 500 },
        ],
      },
    ],
  };

  test("correctly resolves first lesson and adjacent navigation", () => {
    const result = resolveCurriculum(mockCourse, "lesson-1-1");
    assert.equal(result.lessonLabel, "Lesson 1.1");
    assert.equal(result.moduleNumber, 1);
    assert.equal(result.prevLesson, null);
    assert.ok(result.nextLesson);
    assert.equal(result.nextLesson?.lesson.slug, "lesson-1-2");
  });

  test("correctly resolves across module boundary", () => {
    const result = resolveCurriculum(mockCourse, "lesson-1-2");
    assert.equal(result.lessonLabel, "Lesson 1.2");
    assert.equal(result.prevLesson?.lesson.slug, "lesson-1-1");
    assert.equal(result.nextLesson?.lesson.slug, "lesson-2-1");
    assert.equal(result.nextLesson?.module.title, "Module 2");
  });

  test("handles last lesson with null nextLesson", () => {
    const result = resolveCurriculum(mockCourse, "lesson-2-1");
    assert.equal(result.lessonLabel, "Lesson 2.1");
    assert.equal(result.nextLesson, null);
    assert.equal(result.prevLesson?.lesson.slug, "lesson-1-2");
  });
});
