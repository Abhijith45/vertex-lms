import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadFirstCourse } from "../lib/utils/course-load.ts";

describe("Course detail loading", () => {
  test("returns the first course that exists", async () => {
    const tried: string[] = [];
    const course = await loadFirstCourse(["alias", "real"], async (slug) => {
      tried.push(slug);
      return slug === "real" ? { slug } : null;
    });
    assert.deepEqual(course, { slug: "real" });
    assert.deepEqual(tried, ["alias", "real"]);
  });

  test("returns null only when every slug is missing", async () => {
    const course = await loadFirstCourse(["missing"], async () => null);
    assert.equal(course, null);
  });

  test("propagates fetch errors instead of reporting the course as missing", async () => {
    await assert.rejects(
      loadFirstCourse(["devops-with-docker-and-kubernetes"], async () => {
        throw new Error("Unauthorized - Session not found");
      }),
      /Unauthorized/
    );
  });
});
