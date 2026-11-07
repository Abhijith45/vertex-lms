import { NextResponse } from "next/server";
import {
  constructStripeWebhookEvent,
  verifyStripeWebhookSignature,
  type StripeEventPayload,
} from "@/lib/stripe";
import {
  isIdempotencyKeyProcessed,
  recordIdempotencyKey,
  grantCourseAccess,
  grantAllAccess,
  setSubscription,
} from "@/lib/entitlements";
import { getPostHogClient } from "@/lib/posthog-server";
import { serverClient } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    // 1. Verify Cryptographic Stripe Signature (Stripe SDK or HMAC fallback)
    let event: StripeEventPayload | null = null;
    const constructed = constructStripeWebhookEvent(rawBody, signature);

    if (constructed) {
      event = constructed as unknown as StripeEventPayload;
    } else {
      // Direct HMAC verification fallback
      const isHmacVerified = verifyStripeWebhookSignature(rawBody, signature);
      if (!isHmacVerified) {
        console.warn("Stripe webhook signature verification failed.");
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
      try {
        event = JSON.parse(rawBody) as StripeEventPayload;
      } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
      }
    }

    if (!event || !event.id) {
      return NextResponse.json({ error: "Unable to parse Stripe event" }, { status: 400 });
    }

    // 2. Idempotency Guard (Guarantee duplicate delivery retries are safely ignored)
    if (isIdempotencyKeyProcessed(event.id)) {
      return NextResponse.json(
        {
          received: true,
          idempotentDuplicate: true,
          message: `Event ${event.id} already processed. Skipping duplicate mutations.`,
        },
        { status: 200 }
      );
    }

    // Record Event ID to prevent future duplicate processing
    recordIdempotencyKey(event.id);

    // 3. Handle Event Types
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const metadata = session?.metadata || {};
      const userId = metadata.userId || session?.customer_email || "anonymous_purchaser";
      const courseSlug = metadata.courseSlug;
      const tier = metadata.tier || "course";

      if (tier === "all-access") {
        grantAllAccess(userId);
      } else if (tier === "monthly") {
        setSubscription({
          userId,
          plan: "monthly",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else if (courseSlug) {
        grantCourseAccess(userId, courseSlug);
      }

      // Persist to Sanity document for cross-session/re-login continuity
      try {
        if (userId && userId !== "anonymous_purchaser") {
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
              purchasedCourses: [],
            });
          }

          const tx = writeClient.transaction();
          if (tier === "all-access") {
            tx.patch(progressDoc._id, (p) =>
              p.set({
                subscription: {
                  plan: "yearly",
                  status: "active",
                  currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                  isAllAccess: true,
                },
              })
            );
          } else if (tier === "monthly") {
            tx.patch(progressDoc._id, (p) =>
              p.set({
                subscription: {
                  plan: "monthly",
                  status: "active",
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  isAllAccess: true,
                },
              })
            );
          } else if (courseSlug) {
            const courseDoc = await serverClient.fetch<{ _id: string } | null>(
              `*[_type == "course" && slug.current == $courseSlug][0]{ _id }`,
              { courseSlug },
              { cache: "no-store" }
            );

            if (courseDoc?._id) {
              const existing = (progressDoc.purchasedCourses || []).map(
                (ref: { _ref: string }) => ref?._ref
              );
              if (!existing.includes(courseDoc._id)) {
                tx.patch(progressDoc._id, (p) =>
                  p
                    .setIfMissing({ purchasedCourses: [] })
                    .append("purchasedCourses", [
                      {
                        _type: "reference",
                        _ref: courseDoc._id,
                        _key: Math.random().toString(36).substring(2, 9),
                      },
                    ])
                );
              }
            }
          }
          await tx.commit();
        }
      } catch (sanityErr) {
        console.warn("Failed to persist Stripe entitlement to Sanity:", sanityErr);
      }

      // Track purchase telemetry event
      try {
        const posthog = getPostHogClient();
        posthog.capture({
          distinctId: userId,
          event: "course_purchased",
          properties: {
            session_id: session?.id,
            amount_total: session?.amount_total,
            course_slug: courseSlug,
            tier,
            event_id: event.id,
          },
        });
      } catch (err) {
        console.warn("Telemetry capture failed:", err);
      }

      return NextResponse.json({
        received: true,
        processed: true,
        tier,
        courseSlug,
        userId,
      });
    }

    // Unhandled event type acknowledged safely
    return NextResponse.json({ received: true, unhandledType: event.type });
  } catch (err: unknown) {
    console.error("Error processing Stripe webhook:", err);
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}
