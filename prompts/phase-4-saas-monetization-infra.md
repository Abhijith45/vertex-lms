# Implementation Prompt: Phase 4 — SaaS Monetization, Idempotent Stripe Webhooks & Dynamic OG Infrastructure

## 1. Goal
Implement Phase 4 of the Vertex SaaS roadmap:
1. **Idempotent Stripe Webhook & Access Entitlement Pipeline**: Process subscription and purchase webhooks securely, verifying Stripe HMAC signatures and preventing duplicate event processing.
2. **Access Entitlements & Pricing Tier Architecture**: Distinguish between free preview lessons and full courses ($49) / All-Access Annual Pass ($199/yr).
3. **Dynamic OpenGraph Image Generation (`/api/og`)**: Generate 1200x630 social share cards using Next.js `ImageResponse` with edge caching.
4. **Production Observability & Tracing**: Distributed span latency tracking across API requests.
5. **Comprehensive Automated Test Suite**: Verify webhook signature security, idempotency, entitlement access, and tracing duration.

---

## 2. Inspected Code & Architecture

- **Course Hero & Accordion** (`web/components/course/course-hero.tsx`): Displays modules, metadata, and lesson previews.
- **Next.js ImageResponse** (`next/og`): Native edge image synthesis tool in Next.js 16.
- **Auth Layer** (`@clerk/nextjs/server`): Identifies authenticated user for checkout metadata and access checks.
- **PostHog Telemetry** (`web/lib/posthog-server.ts`): Server-side event tracking.

---

## 3. Files to Touch / Create

1. **`web/lib/entitlements.ts`** *(New)*: Entitlement management, pricing tiers, and idempotency key deduplication.
2. **`web/lib/stripe.ts`** *(New)*: Stripe HMAC-SHA256 timestamped signature verification helper.
3. **`web/app/api/checkout/route.ts`** *(New)*: Checkout initiation endpoint supporting live and simulated testing.
4. **`web/app/api/webhooks/stripe/route.ts`** *(New)*: Idempotent Stripe webhook receiver with access granting.
5. **`web/app/api/og/route.tsx`** *(New)*: Dynamic OpenGraph 1200x630 image generator via `ImageResponse`.
6. **`web/lib/telemetry.ts`** *(New)*: Performance tracing span wrapper.
7. **`web/components/course/course-pricing-card.tsx`** *(New)*: Pricing card component for courses.
8. **`web/components/course/course-hero.tsx`** *(Modify)*: Add pricing badge.
9. **`web/test/saas-monetization.test.ts`** *(New)*: Unit tests for signatures, idempotency, and entitlements.
10. **`web/package.json`** *(Modify)*: Add test file to `test` script.

---

## 4. Acceptance Criteria & Checks

1. `/api/og?type=course&slug=nextjs-app-router-in-depth` returns an image with `Content-Type: image/png` and 1200x630 dimensions.
2. POST `/api/webhooks/stripe` verifies `stripe-signature` and rejects forged or tampered signatures.
3. Replaying an identical webhook event returns `{ idempotentDuplicate: true }` without duplicate processing.
4. Entitlement checks accurately allow access for free previews, enrolled courses, and all-access subscribers.
5. TypeScript check (`npm run type-check`) passes with 0 errors.
6. Full test suite (`npm test`) passes with 100% success rate.
