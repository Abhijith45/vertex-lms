import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { serverClient } from "@/sanity/lib/client";
import {
  evaluatePlaybackAccess,
  grantCourseAccess,
  grantAllAccess,
  setSubscription,
} from "@/lib/entitlements";

export const runtime = "nodejs";

/**
 * GET /api/entitlements
 * Returns the current authenticated user's persistent entitlement & subscription status.
 * Automatically synchronizes Sanity persistent entitlements with the memory cache.
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        isSignedIn: false,
        purchasedCourseSlugs: [],
        subscription: null,
        isAllAccess: false,
      });
    }

    const { searchParams } = new URL(req.url);
    const courseSlug = searchParams.get("courseSlug");
    const lessonIndexStr = searchParams.get("lessonIndex");
    const lessonIndex = lessonIndexStr ? parseInt(lessonIndexStr, 10) : undefined;

    // Fetch persistent progress & entitlements from Sanity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressDoc: any = await serverClient.fetch(
      `*[_type == "progress" && clerkUserId == $userId][0]{
        _id,
        "purchasedCourseSlugs": coalesce(purchasedCourses[]->slug.current, []),
        subscription {
          plan,
          status,
          currentPeriodEnd,
          isAllAccess
        }
      }`,
      { userId },
      { cache: "no-store" }
    );

    const purchasedCourseSlugs: string[] = progressDoc?.purchasedCourseSlugs || [];
    const subscription = progressDoc?.subscription || null;
    const isAllAccess = Boolean(subscription?.isAllAccess || subscription?.plan === "yearly");

    // Hydrate memory cache from persistent database
    for (const slug of purchasedCourseSlugs) {
      grantCourseAccess(userId, slug);
    }

    if (isAllAccess) {
      grantAllAccess(userId);
    } else if (subscription && subscription.status === "active") {
      setSubscription({
        userId,
        plan: subscription.plan || "monthly",
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Evaluate access for specific course/lesson if requested
    let decision = null;
    if (courseSlug) {
      decision = evaluatePlaybackAccess({
        userId,
        courseSlug,
        lessonIndex,
      });
    }

    return NextResponse.json({
      isSignedIn: true,
      userId,
      purchasedCourseSlugs,
      subscription,
      isAllAccess,
      decision,
    });
  } catch (err: unknown) {
    console.error("Error retrieving entitlements:", err);
    return NextResponse.json(
      { error: "Failed to evaluate entitlements" },
      { status: 500 }
    );
  }
}
