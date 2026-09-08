import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { writeClient } from "@/sanity/lib/write-client";
import { serverClient } from "@/sanity/lib/client";
import { revalidateTag } from "next/cache";
import crypto from "crypto";

interface BookmarkRequestBody {
  courseId: string;
  bookmarked?: boolean;
}

/** Sanitize Sanity document ID */
function sanitizeDocId(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 128);
}

/** GET /api/bookmarks - Returns list of bookmarked course IDs for authenticated user */
export async function GET(req: Request) {
  const rateLimit = checkRateLimit(req, 60, 60 * 1000, "bookmarks_get");
  if (!rateLimit.success && rateLimit.response) {
    return rateLimit.response;
  }

  let userId: string | null = null;
  try {
    const authData = await auth();
    userId = authData?.userId || null;
  } catch {
    // Unauthenticated
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be signed in to view bookmarks." },
      { status: 401 }
    );
  }

  try {
    const result = await serverClient.fetch<{ bookmarkedCourseIds: string[] }>(
      `*[_type == "progress" && clerkUserId == $userId][0]{
        "bookmarkedCourseIds": coalesce(bookmarkedCourses[]->_id, [])
      }`,
      { userId },
      { cache: "no-store" }
    );

    return NextResponse.json({
      bookmarkedCourseIds: result?.bookmarkedCourseIds || [],
    });
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

/** POST /api/bookmarks - Add or remove bookmark for a course */
export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, 60, 60 * 1000, "bookmarks_post");
  if (!rateLimit.success && rateLimit.response) {
    return rateLimit.response;
  }

  let userId: string | null = null;
  try {
    const authData = await auth();
    userId = authData?.userId || null;
  } catch {
    // Unauthenticated
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be signed in to manage bookmarks." },
      { status: 401 }
    );
  }

  let body: BookmarkRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const courseId = sanitizeDocId(body.courseId);
  if (!courseId) {
    return NextResponse.json({ error: "Missing or invalid courseId" }, { status: 400 });
  }

  try {
    // Verify course exists in Sanity
    const courseDoc = await serverClient.fetch<{ _id: string; title: string; slug: { current?: string } | string } | null>(
      `*[_type == "course" && _id == $courseId][0]{
        _id,
        title,
        slug
      }`,
      { courseId },
      { cache: "no-store" }
    );

    if (!courseDoc) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch user's progress document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let progressDoc: any = await serverClient.fetch(
      `*[_type == "progress" && clerkUserId == $userId][0]`,
      { userId },
      { cache: "no-store" }
    );

    if (!progressDoc) {
      progressDoc = await writeClient.create({
        _type: "progress",
        clerkUserId: userId,
        completedLessons: [],
        resumePositions: [],
        bookmarkedCourses: [],
      });
    }

    const currentBookmarks: Array<{ _ref: string; _key?: string }> =
      progressDoc.bookmarkedCourses || [];
    const isCurrentlyBookmarked = currentBookmarks.some(
      (ref) => ref?._ref === courseId
    );

    const targetBookmarkState =
      body.bookmarked !== undefined ? Boolean(body.bookmarked) : !isCurrentlyBookmarked;

    if (targetBookmarkState !== isCurrentlyBookmarked) {
      const tx = writeClient.transaction();

      if (targetBookmarkState) {
        // Add course reference
        const newRef = {
          _type: "reference",
          _ref: courseId,
          _key: crypto.randomBytes(6).toString("hex"),
        };
        tx.patch(progressDoc._id, (p) =>
          p.setIfMissing({ bookmarkedCourses: [] }).append("bookmarkedCourses", [newRef])
        );
      } else {
        // Remove course reference
        const updatedList = currentBookmarks.filter((ref) => ref?._ref !== courseId);
        tx.patch(progressDoc._id, (p) => p.set({ bookmarkedCourses: updatedList }));
      }

      await tx.commit();

      try {
        revalidateTag(`progress-${userId}`, "max");
        revalidateTag(`bookmarks-${userId}`, "max");
      } catch (e) {
        console.warn("revalidateTag warning for bookmarks:", e);
      }
    }

    // Capture server analytics with PostHog
    try {
      const posthogServer = getPostHogClient();
      posthogServer.capture({
        distinctId: userId,
        event: "course_bookmarked",
        properties: {
          course_id: courseId,
          course_title: courseDoc.title,
          bookmarked: targetBookmarkState,
          source: "server_api",
        },
      });
    } catch (analyticsErr) {
      console.error("Error capturing server-side bookmark analytics:", analyticsErr);
    }

    return NextResponse.json({
      success: true,
      bookmarked: targetBookmarkState,
      courseId,
    });
  } catch (err) {
    console.error("Error updating bookmark:", err);
    return NextResponse.json(
      { error: "Failed to update bookmark", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
