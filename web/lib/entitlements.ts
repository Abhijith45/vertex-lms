export interface CourseEntitlement {
  userId: string;
  courseSlug: string;
  tier: "course" | "all-access";
  grantedAt: string;
  expiresAt?: string;
}

export interface PricingPlan {
  id: "course" | "all-access";
  title: string;
  priceFormatted: string;
  priceCents: number;
  period?: "one-time" | "year" | "month";
  features: string[];
  popular?: boolean;
}

export const PLATFORM_PRICING: Record<string, PricingPlan> = {
  course: {
    id: "course",
    title: "Lifetime Course Access",
    priceFormatted: "$49",
    priceCents: 4900,
    period: "one-time",
    features: [
      "Instant access to all modules and HD videos",
      "Interactive comprehension checkpoints & quizzes",
      "In-Video Contextual AI Copilot assistant",
      "Synchronized interactive transcripts & notes",
      "Cryptographically verifiable completion certificate",
      "Lifetime updates and course community Q&A",
    ],
  },
  "all-access": {
    id: "all-access",
    title: "All-Access Engineering Pass",
    priceFormatted: "$199",
    priceCents: 19900,
    period: "year",
    popular: true,
    features: [
      "Unlimited access to ALL current and future courses",
      "Full Next.js, LLM AI, Docker & Kubernetes curriculum",
      "Priority AI Copilot token allocation",
      "Verified certification for every mastered track",
      "Direct instructor Q&A endorsement badges",
      "Downloadable source repositories & cheatsheets",
    ],
  },
};

// In-memory entitlement registry: key format `${userId}:${courseSlug}`
const ENTITLEMENTS_STORE = new Map<string, CourseEntitlement>();

// Global All-Access subscribers: set of userIds
const ALL_ACCESS_SUBSCRIBERS = new Set<string>();

// Idempotency keys set for Stripe webhooks
const PROCESSED_IDEMPOTENCY_KEYS = new Set<string>();

// Pre-seed demo entitlements for the flagship learner and course
const seedUserId = "user_seed_learner_01";
const seedCourseSlug = "nextjs-app-router-in-depth";
ENTITLEMENTS_STORE.set(`${seedUserId}:${seedCourseSlug}`, {
  userId: seedUserId,
  courseSlug: seedCourseSlug,
  tier: "course",
  grantedAt: "2026-11-01T12:00:00.000Z",
});

/**
 * Evaluates whether a learner has access to play a lesson video.
 * Access is granted if:
 * 1. The lesson is marked as a free preview.
 * 2. The user has an All-Access Pass.
 * 3. The user has purchased this specific course.
 */
export function hasCourseAccess(
  userId: string | null | undefined,
  courseSlug: string,
  isFreePreview = false
): boolean {
  // Free preview lessons are open to all visitors
  if (isFreePreview) return true;

  if (!userId) return false;

  // Check All-Access platform pass
  if (ALL_ACCESS_SUBSCRIBERS.has(userId)) return true;

  // Check course-specific purchase
  const key = `${userId}:${courseSlug}`;
  return ENTITLEMENTS_STORE.has(key);
}

/**
 * Provisions lifetime access to a single course.
 */
export function grantCourseAccess(
  userId: string,
  courseSlug: string
): CourseEntitlement {
  const entitlement: CourseEntitlement = {
    userId,
    courseSlug,
    tier: "course",
    grantedAt: new Date().toISOString(),
  };

  ENTITLEMENTS_STORE.set(`${userId}:${courseSlug}`, entitlement);
  return entitlement;
}

/**
 * Provisions All-Access annual subscription to all courses.
 */
export function grantAllAccess(userId: string): CourseEntitlement {
  ALL_ACCESS_SUBSCRIBERS.add(userId);

  const entitlement: CourseEntitlement = {
    userId,
    courseSlug: "*",
    tier: "all-access",
    grantedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return entitlement;
}

/**
 * Checks if a Stripe event ID has already been processed to guarantee idempotency.
 */
export function isIdempotencyKeyProcessed(eventId: string): boolean {
  return PROCESSED_IDEMPOTENCY_KEYS.has(eventId);
}

/**
 * Records a Stripe event ID into the idempotency store.
 */
export function recordIdempotencyKey(eventId: string): void {
  PROCESSED_IDEMPOTENCY_KEYS.add(eventId);
}

/**
 * Reset store (useful for unit testing).
 */
export function resetEntitlementsForTesting(): void {
  PROCESSED_IDEMPOTENCY_KEYS.clear();
}
