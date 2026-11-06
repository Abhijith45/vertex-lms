import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  PLATFORM_PRICING,
  grantCourseAccess,
  grantAllAccess,
  setSubscription,
} from "@/lib/entitlements";
import { getPostHogClient } from "@/lib/posthog-server";
import { getStripeClient, isStripeConfigured, isStripeTestMode } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const [{ userId }, user] = await Promise.all([auth(), currentUser()]);

    const body = await req.json();
    const { courseSlug, courseTitle, tier = "course" } = body;

    const pricing = PLATFORM_PRICING[tier] || PLATFORM_PRICING.course;
    const recipientUserId = userId || "demo_learner";
    const recipientEmail =
      user?.primaryEmailAddress?.emailAddress || "learner@vertex.dev";

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const stripe = getStripeClient();

    const isSubscription = tier === "all-access" || tier === "monthly";

    // 1. If Stripe keys are configured (either Test or Live mode), construct Stripe Checkout Session
    if (stripe && isStripeConfigured()) {
      try {
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name:
                    tier === "all-access"
                      ? "Vertex All-Access Annual Pass"
                      : tier === "monthly"
                      ? "Vertex All-Access Monthly Pass"
                      : `${courseTitle || "Vertex Course"} Lifetime Access`,
                  description:
                    "Interactive video intelligence, AI Copilot, checkpoints, and verified certification.",
                },
                unit_amount: pricing.priceCents,
                ...(isSubscription
                  ? {
                      recurring: {
                        interval: tier === "monthly" ? "month" : "year",
                      },
                    }
                  : {}),
              },
              quantity: 1,
            },
          ],
          mode: isSubscription ? "subscription" : "payment",
          customer_email: recipientEmail,
          metadata: {
            userId: recipientUserId,
            courseSlug: courseSlug || "",
            courseTitle: courseTitle || "",
            tier,
          },
          success_url: `${origin}/my-learning?checkout=success&course=${encodeURIComponent(courseSlug || "")}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/courses/${encodeURIComponent(courseSlug || "")}?checkout=cancelled`,
        });

        if (session.url) {
          return NextResponse.json({
            url: session.url,
            sessionId: session.id,
            mode: "stripe",
            testMode: isStripeTestMode(),
          });
        }
      } catch (stripeErr) {
        console.warn(
          "Stripe Checkout Session creation failed, falling back to simulated grant:",
          stripeErr
        );
      }
    }

    // 2. Zero-Failure Local / Dev Mode Simulation:
    // When no Stripe keys are configured or fallback is triggered, instantly provision access
    if (tier === "all-access") {
      grantAllAccess(recipientUserId);
    } else if (tier === "monthly") {
      setSubscription({
        userId: recipientUserId,
        plan: "monthly",
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } else if (courseSlug) {
      grantCourseAccess(recipientUserId, courseSlug);
    }

    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: recipientUserId,
        event: "course_purchased_demo",
        properties: {
          course_slug: courseSlug,
          tier,
          price: pricing.priceFormatted,
          test_mode: true,
        },
      });
    } catch {
      // Telemetry error suppressed safely
    }

    const successRedirectUrl = `/my-learning?checkout=success&course=${encodeURIComponent(courseSlug || "")}&mock=true`;

    return NextResponse.json({
      url: successRedirectUrl,
      sessionId: `cs_simulated_${Date.now()}`,
      mockMode: true,
      testMode: true,
      message: `Enrolled successfully via Vertex Instant Development Mode!`,
    });
  } catch (err: unknown) {
    console.error("Error initiating checkout:", err);
    return NextResponse.json(
      { error: "Failed to initiate checkout" },
      { status: 500 }
    );
  }
}
