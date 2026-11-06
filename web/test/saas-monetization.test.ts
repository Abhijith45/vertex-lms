import { describe, it } from "node:test";
import assert from "node:assert";
import {
  verifyStripeWebhookSignature,
  generateTestStripeSignature,
  getStripeClient,
  isStripeConfigured,
  isStripeTestMode,
  isStripeLiveMode,
  constructStripeWebhookEvent,
} from "../lib/stripe.ts";
import {
  hasCourseAccess,
  grantCourseAccess,
  grantAllAccess,
  isIdempotencyKeyProcessed,
  recordIdempotencyKey,
  resetEntitlementsForTesting,
} from "../lib/entitlements.ts";
import { traceSpan } from "../lib/telemetry.ts";

describe("Phase 4: SaaS Stripe Webhook Signature Verification", () => {
  const secretKey = "whsec_test_secret_stripe_webhook_2026";
  const testPayload = JSON.stringify({
    id: "evt_test_checkout_01",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_session_01",
        amount_total: 4900,
        metadata: {
          userId: "user_test_buyer_01",
          courseSlug: "nextjs-app-router-in-depth",
          tier: "course",
        },
      },
    },
  });

  it("verifies a valid timestamped Stripe HMAC signature", () => {
    const signatureHeader = generateTestStripeSignature(testPayload, secretKey);
    const isValid = verifyStripeWebhookSignature(testPayload, signatureHeader, secretKey);

    assert.strictEqual(isValid, true);
  });

  it("rejects when raw payload body was tampered with in transit", () => {
    const signatureHeader = generateTestStripeSignature(testPayload, secretKey);
    const tamperedPayload = testPayload.replace("4900", "0"); // Attacker changed amount
    const isValid = verifyStripeWebhookSignature(tamperedPayload, signatureHeader, secretKey);

    assert.strictEqual(isValid, false);
  });

  it("rejects when signature was generated with wrong secret key", () => {
    const signatureHeader = generateTestStripeSignature(testPayload, "wrong_secret_key");
    const isValid = verifyStripeWebhookSignature(testPayload, signatureHeader, secretKey);

    assert.strictEqual(isValid, false);
  });

  it("rejects expired timestamps exceeding tolerance window (replay protection)", () => {
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600; // 600s > 300s tolerance
    const expiredSignature = generateTestStripeSignature(testPayload, secretKey, tenMinutesAgo);
    const isValid = verifyStripeWebhookSignature(testPayload, expiredSignature, secretKey, 300);

    assert.strictEqual(isValid, false);
  });

  it("handles empty or malformed signature headers gracefully", () => {
    assert.strictEqual(verifyStripeWebhookSignature(testPayload, null, secretKey), false);
    assert.strictEqual(verifyStripeWebhookSignature(testPayload, "malformed_header", secretKey), false);
    assert.strictEqual(verifyStripeWebhookSignature("", "t=123,v1=abc", secretKey), false);
  });
});

describe("Phase 4: Webhook Idempotency & Deduplication", () => {
  it("safely ignores duplicate webhook delivery retries with identical event ID", () => {
    resetEntitlementsForTesting();

    const eventId = "evt_duplicate_retry_test_999";
    assert.strictEqual(isIdempotencyKeyProcessed(eventId), false);

    // First delivery: processes and records key
    recordIdempotencyKey(eventId);
    assert.strictEqual(isIdempotencyKeyProcessed(eventId), true);

    // Second delivery (Stripe retry): detected as duplicate
    assert.strictEqual(isIdempotencyKeyProcessed(eventId), true);
  });
});

describe("Phase 4: Course Entitlements & Access Gating", () => {
  const testUser = "user_entitlement_test_student";
  const courseA = "nextjs-app-router-in-depth";
  const courseB = "building-ai-apps-with-llms";

  it("allows free preview lessons for all visitors including unauthenticated users", () => {
    // Unauthenticated user
    assert.strictEqual(hasCourseAccess(null, courseA, true), true);
    assert.strictEqual(hasCourseAccess(undefined, courseA, true), true);

    // Authenticated user
    assert.strictEqual(hasCourseAccess("random_user", courseA, true), true);
  });

  it("denies access to premium lessons if user has not purchased", () => {
    assert.strictEqual(hasCourseAccess(testUser, courseA, false), false);
    assert.strictEqual(hasCourseAccess(null, courseA, false), false);
  });

  it("grants and validates course-specific lifetime access", () => {
    assert.strictEqual(hasCourseAccess(testUser, courseA, false), false);

    grantCourseAccess(testUser, courseA);

    // Now has access to course A
    assert.strictEqual(hasCourseAccess(testUser, courseA, false), true);

    // But NOT yet to course B
    assert.strictEqual(hasCourseAccess(testUser, courseB, false), false);
  });

  it("grants All-Access pass unlocking all current and future courses", () => {
    const subscriber = "user_subscriber_annual";
    assert.strictEqual(hasCourseAccess(subscriber, courseB, false), false);

    grantAllAccess(subscriber);

    // Now has access to course B, course A, and any arbitrary course
    assert.strictEqual(hasCourseAccess(subscriber, courseA, false), true);
    assert.strictEqual(hasCourseAccess(subscriber, courseB, false), true);
    assert.strictEqual(hasCourseAccess(subscriber, "future-distributed-systems", false), true);
  });
});

describe("Phase 4: Performance Telemetry Spans", () => {
  it("accurately tracks execution duration of async functions", async () => {
    const { result, durationMs } = await traceSpan(
      "test.simulated_api_call",
      async () => {
        await new Promise((r) => setTimeout(r, 25));
        return { data: "success" };
      }
    );

    assert.deepStrictEqual(result, { data: "success" });
    assert.ok(durationMs >= 20, `Duration was ${durationMs}ms`);
  });

  it("propagates inner errors while measuring failed span duration", async () => {
    await assert.rejects(
      async () => {
        await traceSpan("test.failing_span", async () => {
          throw new Error("Simulated upstream service error");
        });
      },
      { message: "Simulated upstream service error" }
    );
  });
});

describe("Phase 4: Stripe API SDK Client & Development Mode", () => {
  it("returns null when no secret key or mock-key is present", () => {
    const originalKey = process.env.STRIPE_SECRET_KEY;
    try {
      delete process.env.STRIPE_SECRET_KEY;
      assert.strictEqual(getStripeClient(), null);
      assert.strictEqual(isStripeConfigured(), false);

      process.env.STRIPE_SECRET_KEY = "mock-key";
      assert.strictEqual(getStripeClient(), null);
      assert.strictEqual(isStripeConfigured(), false);
    } finally {
      process.env.STRIPE_SECRET_KEY = originalKey;
    }
  });

  it("initializes Stripe client with valid test key sk_test_...", () => {
    const testClient = getStripeClient("sk_test_fake_sandbox_key_12345");
    assert.ok(testClient !== null);
    assert.ok(typeof testClient.checkout === "object");
    assert.ok(typeof testClient.checkout.sessions === "object");
  });

  it("identifies test / sandbox mode vs live mode accurately", () => {
    const originalKey = process.env.STRIPE_SECRET_KEY;
    try {
      process.env.STRIPE_SECRET_KEY = "sk_test_abc123456";
      assert.strictEqual(isStripeTestMode(), true);
      assert.strictEqual(isStripeLiveMode(), false);

      process.env.STRIPE_SECRET_KEY = "sk_live_abc123456";
      assert.strictEqual(isStripeTestMode(), false);
      assert.strictEqual(isStripeLiveMode(), true);
    } finally {
      process.env.STRIPE_SECRET_KEY = originalKey;
    }
  });

  it("constructs and verifies webhook payload safely", () => {
    const rawPayload = JSON.stringify({
      id: "evt_test_event_999",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_999" } },
    });
    const secret = "whsec_test_secret_for_construct_event";
    const sigHeader = generateTestStripeSignature(rawPayload, secret);

    const event = constructStripeWebhookEvent(rawPayload, sigHeader, secret);
    assert.ok(event !== null);
    assert.strictEqual(event?.id, "evt_test_event_999");
    assert.strictEqual(event?.type, "checkout.session.completed");
  });
});

