import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { checkRateLimit } from "@/lib/rate-limit";

interface ProgressRequestBody {
  lessonSlug: string;
  courseSlug?: string;
  positionSeconds?: number;
  completed?: boolean;
}

/** Sanitize a slug value: only allow alphanumeric, hyphens, underscores */
function sanitizeSlug(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 200);
}

export async function POST(req: Request) {
  // Rate limit: 60 requests/minute per client
  const rateLimit = checkRateLimit(req, 60, 60 * 1000, "progress");
  if (!rateLimit.success && rateLimit.response) {
    return rateLimit.response;
  }

  // Require authentication — middleware gates this, but double-check here
  let userId: string | null = null;
  try {
    const authData = await auth();
    userId = authData?.userId || null;
  } catch {
    // auth() failed — treat as unauthenticated
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be signed in to save progress." },
      { status: 401 }
    );
  }

  let body: ProgressRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // Validate required fields
  if (!body.lessonSlug || typeof body.lessonSlug !== "string") {
    return NextResponse.json({ error: "Missing or invalid lessonSlug" }, { status: 400 });
  }

  // Validate positionSeconds if provided
  if (body.positionSeconds !== undefined) {
    if (typeof body.positionSeconds !== "number" || !Number.isFinite(body.positionSeconds) || body.positionSeconds < 0) {
      return NextResponse.json({ error: "positionSeconds must be a non-negative number" }, { status: 400 });
    }
  }

  // Validate completed if provided
  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "completed must be a boolean" }, { status: 400 });
  }

  // Sanitize slug values
  const lessonSlug = sanitizeSlug(body.lessonSlug);
  const courseSlug = sanitizeSlug(body.courseSlug);
  const positionSeconds = body.positionSeconds !== undefined ? Math.floor(body.positionSeconds) : undefined;
  const completed = Boolean(body.completed);

  if (!lessonSlug) {
    return NextResponse.json({ error: "lessonSlug is empty after sanitization" }, { status: 400 });
  }

  // Capture server-side analytics with PostHog
  try {
    const posthog = getPostHogClient();

    if (completed) {
      posthog.capture({
        distinctId: userId,
        event: "lesson_completed",
        properties: {
          lesson_slug: lessonSlug,
          course_slug: courseSlug,
          duration: positionSeconds || 0,
          source: "server_api",
        },
      });
    }

    if (typeof positionSeconds === "number") {
      posthog.capture({
        distinctId: userId,
        event: "progress_updated",
        properties: {
          lesson_slug: lessonSlug,
          course_slug: courseSlug,
          position_seconds: positionSeconds,
          completed,
          source: "server_api",
        },
      });
    }
  } catch (err) {
    console.error("Error capturing server-side progress analytics:", err);
  }

  return NextResponse.json({
    success: true,
    saved: {
      lessonSlug,
      courseSlug,
      positionSeconds,
      completed,
      userId: "authenticated",
    },
  });
}
