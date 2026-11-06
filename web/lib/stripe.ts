import { createHmac, timingSafeEqual } from "crypto";
import Stripe from "stripe";

export interface StripeEventPayload {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      customer?: string;
      customer_email?: string;
      amount_total?: number;
      metadata?: {
        userId?: string;
        courseSlug?: string;
        courseTitle?: string;
        tier?: "course" | "monthly" | "all-access";
      };
      subscription?: string;
      payment_status?: string;
    };
  };
}

export function getStripeWebhookSecret(overrideSecret?: string): string {
  if (overrideSecret) return overrideSecret;
  if (process.env.STRIPE_WEBHOOK_SECRET) return process.env.STRIPE_WEBHOOK_SECRET;
  if (process.env.NODE_ENV === "production") {
    console.warn("CRITICAL: STRIPE_WEBHOOK_SECRET is not configured in production environment.");
  }
  return "whsec_vertex_dev_test_secret_2026";
}

let cachedStripeInstance: Stripe | null = null;

/**
 * Returns a configured Stripe SDK client or null if no valid secret key is set.
 */
export function getStripeClient(apiKey?: string): Stripe | null {
  const key = apiKey || process.env.STRIPE_SECRET_KEY;
  if (!key || key === "mock-key" || !key.startsWith("sk_")) {
    return null;
  }

  if (!apiKey && cachedStripeInstance) {
    return cachedStripeInstance;
  }

  const client = new Stripe(key, {
    typescript: true,
  });

  if (!apiKey) {
    cachedStripeInstance = client;
  }

  return client;
}

/**
 * Checks whether Stripe is configured with a valid secret key.
 */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key !== "mock-key" && key.startsWith("sk_"));
}

/**
 * Checks whether Stripe is operating in Test / Sandbox mode.
 * Returns true if the key begins with sk_test_ or if no live key is set in non-production.
 */
export function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  if (key && key.startsWith("sk_test_")) return true;
  if (key && key.startsWith("sk_live_")) return false;
  return true; // Defaults to test/sandbox development mode
}

/**
 * Checks whether Stripe is operating with real live keys.
 */
export function isStripeLiveMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key.startsWith("sk_live_"));
}

/**
 * Safely constructs and validates a Stripe webhook event, using either
 * the official Stripe SDK or the cryptographic HMAC fallback.
 */
export function constructStripeWebhookEvent(
  rawBody: string,
  signature: string | null,
  secret?: string
): StripeEventPayload | Stripe.Event | null {
  if (!signature || !rawBody) return null;

  const resolvedSecret = getStripeWebhookSecret(secret);
  const stripe = getStripeClient();
  if (stripe && resolvedSecret) {
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, resolvedSecret);
    } catch {
      // Fall through to HMAC fallback
    }
  }

  const isVerified = verifyStripeWebhookSignature(rawBody, signature, resolvedSecret);
  if (!isVerified) return null;

  try {
    return JSON.parse(rawBody) as StripeEventPayload;
  } catch {
    return null;
  }
}

/**
 * Verifies the authenticity of a Stripe webhook payload against its signature header.
 * Follows Stripe's standard signature scheme: t=timestamp,v1=signature
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret?: string,
  toleranceSeconds = 300
): boolean {
  if (!signatureHeader || !rawBody) return false;
  const resolvedSecret = getStripeWebhookSecret(secret);

  const items = signatureHeader.split(",");
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const item of items) {
    const [key, value] = item.trim().split("=");
    if (key === "t") {
      timestamp = value;
    } else if (key === "v1") {
      signatures.push(value);
    }
  }

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  // Check timestamp drift / replay tolerance
  const nowSeconds = Math.floor(Date.now() / 1000);
  const eventTime = parseInt(timestamp, 10);
  if (isNaN(eventTime) || Math.abs(nowSeconds - eventTime) > toleranceSeconds) {
    // Expired or from far future
    return false;
  }

  // Recompute HMAC-SHA256: timestamp + '.' + rawBody
  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = createHmac("sha256", resolvedSecret)
    .update(signedPayload, "utf-8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

  // Verify if any of the provided v1 signatures matches the expected signature
  return signatures.some((sig) => {
    const sigBuffer = Buffer.from(sig, "utf-8");
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return timingSafeEqual(expectedBuffer, sigBuffer);
  });
}

/**
 * Helper to generate a valid test signature header for automated tests and webhooks.
 */
export function generateTestStripeSignature(
  rawBody: string,
  secret?: string,
  timestamp = Math.floor(Date.now() / 1000)
): string {
  const resolvedSecret = getStripeWebhookSecret(secret);
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = createHmac("sha256", resolvedSecret)
    .update(signedPayload, "utf-8")
    .digest("hex");

  return `t=${timestamp},v1=${hmac}`;
}
