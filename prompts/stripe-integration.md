# Implementation Prompt: Complete Stripe API Integration & Development Mode

## Goal
Fully integrate Stripe API for payment processing with support for development mode (and sandbox test cards on production/staging), install the official `stripe` SDK dependency, configure typed server helpers and webhooks, provide a test-mode UI indicator for sandbox checkout, celebrate checkout success on `/my-learning`, and provide exact guidance on when and how to supply Stripe test API keys.

---

## Inspected Code & Current State
1. **Missing SDK Dependency**: `stripe` package is not listed in `web/package.json`. In `web/app/api/checkout/route.ts`, a dynamic `require("stripe")` generated a Turbopack compilation warning (`Module not found: Can't resolve 'stripe'`).
2. **Checkout Route (`web/app/api/checkout/route.ts`)**: Contains logic for creating Checkout Sessions but lacks clean Stripe client initialization, typed errors, and mode configuration.
3. **Webhook Route (`web/app/api/webhooks/stripe/route.ts`)**: Verifies signatures using custom HMAC verification, extracts session metadata, enforces idempotency via `isIdempotencyKeyProcessed`, and grants course/all-access entitlements.
4. **Entitlements Data Layer (`web/lib/entitlements.ts`)**: Defines `PLATFORM_PRICING` ($49 course lifetime, $199 all-access annual pass), `hasCourseAccess`, `grantCourseAccess`, `grantAllAccess`, and idempotency guards.
5. **Course Pricing Card (`web/components/course/course-pricing-card.tsx`)**: Triggers POST to `/api/checkout` and redirects to the returned `url`. Currently lacks test-mode badges or card testing hints.
6. **My Learning Page (`web/app/my-learning/page.tsx`)**: Lacks visual confirmation banner when arriving from successful Stripe checkout (`?checkout=success`).
7. **Environment Config (`web/.env.example`)**: Contains `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, but lacks `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

---

## Decisions & Architecture
1. **Official `stripe` Package**: Install `stripe` (^17.x or ^18.x) in `web/package.json` with TypeScript types built-in.
2. **Centralized Stripe Client (`web/lib/stripe.ts`)**:
   - Provide `getStripeClient(): Stripe | null` with cached singleton instance, Node runtime targeting, and API version `2025-01-27.acacia` (or latest stable).
   - Provide `isStripeTestMode(): boolean` (checks for `sk_test_`).
   - Provide `isStripeConfigured(): boolean` (checks if a valid Stripe secret key exists).
   - Retain HMAC signature verifier `verifyStripeWebhookSignature` and `generateTestStripeSignature` to ensure backward compatibility and 100% test pass rate in CI/CD without network calls.
3. **Robust Dual-Mode Checkout (`web/app/api/checkout/route.ts`)**:
   - **Mode A (Stripe Active - Test or Live)**: When `STRIPE_SECRET_KEY` is present, construct official Stripe Checkout Session (`payment_method_types: ["card"]`, `line_items`, `mode: tier === "all-access" ? "subscription" : "payment"`, `metadata`, `success_url`, `cancel_url`), returning `session.url`.
   - **Mode B (Instant Dev / Fallback Simulation)**: When no Stripe key is configured or in offline sandbox demo, grant immediate entitlement, record simulated telemetry, and return `/my-learning?checkout=success&course=...` so the application never breaks or blocks local testing.
4. **Webhook Handler (`web/app/api/webhooks/stripe/route.ts`)**:
   - Use `stripe.webhooks.constructEvent` when Stripe client and webhook secret are configured; fall back gracefully to our HMAC verifier for unit tests and local simulations.
   - Guard against duplicate event IDs via `isIdempotencyKeyProcessed`.
   - Grant access via `grantCourseAccess` / `grantAllAccess`.
5. **Test Mode Visual Feedback & UX**:
   - On `web/components/course/course-pricing-card.tsx`, show a subtle sandbox badge and test card helper tooltip ("Stripe Test Mode / Sandbox: Use 4242 4242 4242 4242 with any future MM/YY and CVC") so testers know real money is not charged.
   - On `web/app/my-learning/page.tsx`, if `checkout === 'success'`, show an attractive animated confirmation banner: "🎉 Enrollment Successful! Your access is confirmed and curriculum unlocked."
6. **Key Provisioning Guidance**:
   - Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `web/.env.example`.
   - Add clear step-by-step instructions in the completion report explaining where the user can obtain `STRIPE_SECRET_KEY` (`sk_test_...`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_...`), and `STRIPE_WEBHOOK_SECRET` (`whsec_...`) from Stripe Dashboard.

---

## Files to Touch
- `web/package.json` — Add `stripe` dependency.
- `web/lib/stripe.ts` — Export `getStripeClient`, `isStripeConfigured`, `isStripeTestMode`, and signature verification.
- `web/app/api/checkout/route.ts` — Import typed `getStripeClient`, handle session creation with test/live support, and fallback simulation.
- `web/app/api/webhooks/stripe/route.ts` — Update to verify with `stripe.webhooks.constructEvent` or HMAC fallback, record idempotency, and provision access.
- `web/components/course/course-pricing-card.tsx` — Add test mode indicator and test card helper.
- `web/app/my-learning/page.tsx` — Display checkout success banner when `?checkout=success` is present in URL.
- `web/.env.example` — Document `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- `web/test/saas-monetization.test.ts` / `web/test/stripe-api.test.ts` — Add test coverage for Stripe client initialization, test mode checks, and checkout parameters.

---

## Security & Reliability Considerations
- **No Secret Leakage**: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are never prefixed with `NEXT_PUBLIC_` and never bundled into client JavaScript.
- **Node.js Runtime Only**: All Stripe SDK calls run in server-only Node runtime (`export const runtime = "nodejs"`).
- **Idempotency Guard**: Prevents replay attacks or double-granting if Stripe sends duplicate webhook retries.
- **Zero-Failure Fallback**: If Stripe test keys are absent, checkout falls back to instant simulated access rather than throwing a 500 error, guaranteeing an uninterrupted dev & demo experience.

---

## Acceptance Criteria
1. `stripe` SDK installed and imported cleanly without runtime or compile errors.
2. Production build (`npm run build`) runs with zero warnings about unresolved `stripe` module.
3. Test suite (`npm test`) passes 100% of tests.
4. Type check (`npm run type-check`) and lint (`npm run lint`) pass with 0 errors.
5. User is provided clear notification on where to add their Stripe test keys.

---

## Verification & Checks
1. `npm --prefix web run type-check` (0 errors)
2. `npm --prefix web run lint` (0 errors)
3. `npm --prefix web test` (all tests pass)
4. `npm --prefix web run build` (Next.js production build exits code 0)
