import { createHmac, timingSafeEqual } from "crypto";

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
        tier?: "course" | "all-access";
      };
      subscription?: string;
      payment_status?: string;
    };
  };
}

const DEFAULT_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_vertex_production_test_secret_2026";

/**
 * Verifies the authenticity of a Stripe webhook payload against its signature header.
 * Follows Stripe's standard signature scheme: t=timestamp,v1=signature
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret = DEFAULT_WEBHOOK_SECRET,
  toleranceSeconds = 300
): boolean {
  if (!signatureHeader || !rawBody) return false;

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
  const expectedSignature = createHmac("sha256", secret)
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
  secret = DEFAULT_WEBHOOK_SECRET,
  timestamp = Math.floor(Date.now() / 1000)
): string {
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = createHmac("sha256", secret)
    .update(signedPayload, "utf-8")
    .digest("hex");

  return `t=${timestamp},v1=${hmac}`;
}
