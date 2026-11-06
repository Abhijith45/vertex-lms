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
} from "@/lib/entitlements";
import { getPostHogClient } from "@/lib/posthog-server";

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
      } else if (courseSlug) {
        grantCourseAccess(userId, courseSlug);
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
