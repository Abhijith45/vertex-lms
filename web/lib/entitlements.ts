export interface CourseEntitlement {
  userId: string;
  courseSlug: string;
  tier: "course" | "all-access" | "monthly";
  grantedAt: string;
  expiresAt?: string;
}

export type SubscriptionStatus = "active" | "past_due" | "unpaid" | "canceled";

export interface UserSubscription {
  userId: string;
  plan: "monthly" | "yearly";
  status: SubscriptionStatus;
  currentPeriodEnd: string; // ISO date string
  cancelAtPeriodEnd?: boolean;
}

export interface PricingPlan {
  id: "course" | "monthly" | "all-access";
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
  monthly: {
    id: "monthly",
    title: "Monthly All-Access Pass",
    priceFormatted: "$19",
    priceCents: 1900,
    period: "month",
    features: [
      "Full access to ALL current courses & future modules",
      "Interactive video intelligence & AI Copilot",
      "Verifiable certificate on every course completion",
      "Active Discord / community instructor Q&A",
      "Cancel anytime with zero lock-in",
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
      "Save 15% compared to monthly billing",
    ],
  },
};

// In-memory entitlement registry: key format `${userId}:${courseSlug}`
const ENTITLEMENTS_STORE = new Map<string, CourseEntitlement>();

// Subscriptions store: key format `${userId}`
const SUBSCRIPTIONS_STORE = new Map<string, UserSubscription>();

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

export type PlaybackAccessReason =
  | "REQUIRE_AUTH"
  | "FREE_PREVIEW"
  | "LIFETIME_PURCHASE"
  | "ACTIVE_SUBSCRIPTION"
  | "GRACE_PERIOD"
  | "PAYWALL_COURSE"
  | "SUBSCRIPTION_EXPIRED";

export interface PlaybackAccessDecision {
  allowed: boolean;
  reason: PlaybackAccessReason;
  gracePeriodExpiresAt?: string;
}

/**
 * Three-day grace period in milliseconds for past-due subscriptions
 */
export const SUBSCRIPTION_GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Senior System Design Access Controller:
 * Evaluates whether a user can play a given lesson.
 * 
 * Rules:
 * 1. Non-logged-in users cannot play any lesson (reason: REQUIRE_AUTH).
 * 2. Logged-in unpaid users can play the first 2 lessons of every course (reason: FREE_PREVIEW).
 * 3. Logged-in users who bought the course can play all lessons (reason: LIFETIME_PURCHASE).
 * 4. Active monthly or yearly subscribers can play all lessons (reason: ACTIVE_SUBSCRIPTION).
 * 5. Past-due subscribers are granted a 3-day grace period (reason: GRACE_PERIOD); thereafter blocked (reason: SUBSCRIPTION_EXPIRED).
 * 6. Other unpaid users attempting Lesson 3+ are blocked (reason: PAYWALL_COURSE).
 */
export function evaluatePlaybackAccess({
  userId,
  courseSlug,
  lessonIndex,
  isExplicitFreePreview = false,
  now = new Date(),
}: {
  userId: string | null | undefined;
  courseSlug: string;
  lessonIndex?: number;
  isExplicitFreePreview?: boolean;
  now?: Date;
}): PlaybackAccessDecision {
  // 1. Guest / Non-logged-in users are strictly blocked
  if (!userId) {
    return { allowed: false, reason: "REQUIRE_AUTH" };
  }

  // 2. Unpaid logged-in users: First 2 lessons are free preview
  const isFirstTwoLessons = typeof lessonIndex === "number" && lessonIndex <= 2 && lessonIndex > 0;
  if (isFirstTwoLessons || isExplicitFreePreview) {
    return { allowed: true, reason: "FREE_PREVIEW" };
  }

  // 3. Check Lifetime Course Ownership
  const courseKey = `${userId}:${courseSlug}`;
  if (ENTITLEMENTS_STORE.has(courseKey)) {
    return { allowed: true, reason: "LIFETIME_PURCHASE" };
  }

  // 4. Check Global All-Access Flag (fallback/legacy)
  if (ALL_ACCESS_SUBSCRIBERS.has(userId)) {
    return { allowed: true, reason: "ACTIVE_SUBSCRIPTION" };
  }

  // 5. Check Subscription Store (Monthly or Yearly)
  const subscription = SUBSCRIPTIONS_STORE.get(userId);
  if (subscription) {
    const periodEnd = new Date(subscription.currentPeriodEnd).getTime();
    const currentTime = now.getTime();

    if (subscription.status === "active") {
      if (currentTime <= periodEnd) {
        return { allowed: true, reason: "ACTIVE_SUBSCRIPTION" };
      }
      // If active period expired without renewal
      return { allowed: false, reason: "SUBSCRIPTION_EXPIRED" };
    }

    if (subscription.status === "past_due") {
      const graceEnd = periodEnd + SUBSCRIPTION_GRACE_PERIOD_MS;
      if (currentTime <= graceEnd) {
        return {
          allowed: true,
          reason: "GRACE_PERIOD",
          gracePeriodExpiresAt: new Date(graceEnd).toISOString(),
        };
      }
      return { allowed: false, reason: "SUBSCRIPTION_EXPIRED" };
    }

    if (subscription.status === "unpaid" || subscription.status === "canceled") {
      return { allowed: false, reason: "SUBSCRIPTION_EXPIRED" };
    }
  }

  // 6. Blocked: User is unpaid and attempting Lesson 3+
  return { allowed: false, reason: "PAYWALL_COURSE" };
}

/**
 * Backward-compatible helper for existing code paths
 */
export function hasCourseAccess(
  userId: string | null | undefined,
  courseSlug: string,
  isFreePreview = false
): boolean {
  if (isFreePreview) return true;
  if (!userId) return false;
  if (ALL_ACCESS_SUBSCRIBERS.has(userId)) return true;

  const subscription = SUBSCRIPTIONS_STORE.get(userId);
  if (subscription && subscription.status === "active") return true;

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
 * Provisions All-Access yearly subscription to all courses.
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

  SUBSCRIPTIONS_STORE.set(userId, {
    userId,
    plan: "yearly",
    status: "active",
    currentPeriodEnd: entitlement.expiresAt!,
  });

  return entitlement;
}

/**
 * Sets or updates a recurring subscription (Monthly or Yearly)
 */
export function setSubscription(subscription: UserSubscription): void {
  SUBSCRIPTIONS_STORE.set(subscription.userId, subscription);
  if (subscription.status === "active") {
    ALL_ACCESS_SUBSCRIBERS.add(subscription.userId);
  } else {
    ALL_ACCESS_SUBSCRIBERS.delete(subscription.userId);
  }
}

/**
 * Retrieves the current subscription state of a user.
 */
export function getSubscription(userId: string): UserSubscription | null {
  return SUBSCRIPTIONS_STORE.get(userId) || null;
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
  ENTITLEMENTS_STORE.clear();
  SUBSCRIPTIONS_STORE.clear();
  ALL_ACCESS_SUBSCRIBERS.clear();

  // Re-seed demo entitlement
  ENTITLEMENTS_STORE.set(`${seedUserId}:${seedCourseSlug}`, {
    userId: seedUserId,
    courseSlug: seedCourseSlug,
    tier: "course",
    grantedAt: "2026-11-01T12:00:00.000Z",
  });
}
