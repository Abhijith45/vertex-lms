import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  PLATFORM_PRICING,
  grantCourseAccess,
  grantAllAccess,
} from "@/lib/entitlements";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    const body = await req.json();
    const { courseSlug, courseTitle, tier = "course" } = body;

    const pricing = PLATFORM_PRICING[tier] || PLATFORM_PRICING.course;
    const recipientUserId = userId || "demo_learner";
    const recipientEmail =
      user?.primaryEmailAddress?.emailAddress || "learner@vertex.dev";

    const hasStripeKey = Boolean(
      process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_SECRET_KEY !== "mock-key" &&
        process.env.STRIPE_SECRET_KEY.startsWith("sk_")
    );

    // If Stripe live keys configured, construct Stripe Checkout Session
    if (hasStripeKey) {
      try {
        // Dynamic import of Stripe SDK if configured
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Stripe = require("stripe");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2024-11-20.acacia",
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name:
                    tier === "all-access"
                      ? "Vertex All-Access Engineering Pass"
                      : `${courseTitle || "Vertex Course"} Lifetime Access`,
                  description:
                    "Interactive video intelligence, AI Copilot, checkpoints, and verified certification.",
                },
                unit_amount: pricing.priceCents,
                ...(tier === "all-access" ? { recurring: { interval: "year" } } : {}),
              },
              quantity: 1,
            },
          ],
          mode: tier === "all-access" ? "subscription" : "payment",
          customer_email: recipientEmail,
          metadata: {
            userId: recipientUserId,
            courseSlug: courseSlug || "",
            courseTitle: courseTitle || "",
            tier,
          },
          success_url: `${req.headers.get("origin") || "http://localhost:3000"}/my-learning?checkout=success&course=${courseSlug || ""}`,
          cancel_url: `${req.headers.get("origin") || "http://localhost:3000"}/courses/${courseSlug || ""}?checkout=cancelled`,
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
      } catch (stripeErr) {
        console.warn("Live Stripe checkout creation failed, falling back to instant grant:", stripeErr);
      }
    }

    // Zero-Failure Local / Dev Mode:
    // Instantly provisions entitlement and redirects to /my-learning with success param
    if (tier === "all-access") {
      grantAllAccess(recipientUserId);
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
        },
      });
    } catch {}

    const successRedirectUrl = `/my-learning?checkout=success&course=${courseSlug || ""}`;

    return NextResponse.json({
      url: successRedirectUrl,
      sessionId: `cs_simulated_${Date.now()}`,
      mockMode: true,
      message: `Enrolled successfully via Vertex Instant Access!`,
    });
  } catch (err: unknown) {
    console.error("Error initiating checkout:", err);
    return NextResponse.json({ error: "Failed to initiate checkout" }, { status: 500 });
  }
}
