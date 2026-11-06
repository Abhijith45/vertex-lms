# Implementation Prompt: Comprehensive Content Entitlement & Subscription Playback Flow

## Goal
Implement a production-grade content entitlement and playback access-control engine according to the senior system design specifications:
1. **Strict Auth Gate**: Disable video playback for non-logged-in users. When a guest clicks play, intercept immediately and show the authentication dialog with a direct sign-in CTA (preserving target lesson and seek time).
2. **First 2 Lessons Free Tier**: Logged-in unpaid users can watch lesson index 1 and lesson 2 of every course. Lessons 3+ are locked behind a paywall card / enrollment dialog.
3. **Post-Payment Permission Allocation**: When payment completes (either via Stripe webhook or checkout return), immediately allocate video playback permissions.
4. **Subscription Lifecycle & Renewal Prompt (Monthly & Yearly)**: Support Monthly ($19/mo) and Yearly ($199/yr) subscriptions alongside Single Course Lifetime ($49). When a subscription is past due or expired, invoke grace period logic (3 days with warning banner) and lock lesson 3+ with a renewal prompt asking users to complete payment.

---

## Inspected Code & Architecture
1. **`web/lib/utils/auth-gate.ts`**: Contains `shouldAllowPlayback(auth)` and `getVideoAuthGatingState(auth)`. Currently only checks `auth.isSignedIn`.
2. **`web/components/lesson/video-embed.tsx`**: Renders custom player controls and iframe fallback. Currently has basic `requiresAuth` check that opens `AuthPromptModal`. Needs paywall & subscription renewal modal integration when user is signed in but lesson is locked (index > 2 without entitlement).
3. **`web/lib/entitlements.ts`**:
   - `PLATFORM_PRICING`: Has `course` ($49) and `all-access` ($199/yr). Needs `monthly` ($19/mo) plan added.
   - `hasCourseAccess`: Checks `isFreePreview`, `ALL_ACCESS_SUBSCRIBERS`, and `ENTITLEMENTS_STORE`. Needs to accept `lessonIndex` or lesson order and evaluate `lessonIndex <= 2` as free for signed-in users.
   - Subscription store: Needs to support `plan` ("monthly" | "yearly"), `status` ("active" | "past_due" | "unpaid" | "canceled"), `currentPeriodEnd`, and 3-day grace period check.
4. **`web/app/api/checkout/route.ts`**: Creates Checkout Sessions. Needs support for `monthly` tier (`interval: "month"`) in addition to `course` and `all-access`.
5. **`web/components/course/course-pricing-card.tsx`**: Currently displays 2 tiers (`course` and `all-access`). Update to support flexible 3-tier view: Single Course ($49), Monthly Pass ($19/mo), and Yearly Pass ($199/yr).
6. **`web/app/lessons/[slug]/page.tsx`**: Passes lesson data to `VideoEmbed`. Needs to pass `lessonIndex` (or resolved order in course) and learner's entitlement status.

---

## Technical Decisions
1. **Access Evaluation Pipeline**:
   ```typescript
   export type PlaybackAccessDecision =
     | { allowed: true; reason: "FREE_PREVIEW" | "LIFETIME_PURCHASE" | "ACTIVE_SUBSCRIPTION" | "GRACE_PERIOD" }
     | { allowed: false; reason: "REQUIRE_AUTH" | "PAYWALL_UNPAID" | "SUBSCRIPTION_EXPIRED" };
   ```
2. **Deterministic Lesson Free Preview Rule**:
   - For guests: `allowed = false`, `reason = "REQUIRE_AUTH"`.
   - For authenticated users: if `lessonIndex <= 2`, `allowed = true`, `reason = "FREE_PREVIEW"`.
   - For authenticated users on `lessonIndex > 2`: evaluate course purchase or active monthly/yearly pass.
3. **Grace Period Calculation**:
   - If subscription `status === 'past_due'` and `now - currentPeriodEnd <= 3 days`, allow playback with a persistent warning banner ("Payment Past Due: Update billing method within 3 days").
   - If grace period exceeded, `allowed = false`, `reason = "SUBSCRIPTION_EXPIRED"`.
4. **Paywall & Renewal UI**:
   - Add `EnrollmentPromptModal` (or extend `AuthPromptModal`) to display either:
     - Login prompt (for guests).
     - Course Paywall / Subscription prompt (for unpaid users on Lesson 3+).
     - Renewal / Update Payment prompt (for expired or past-due subscriptions).

---

## Files to Touch
1. `web/lib/entitlements.ts` — Add monthly pricing, update subscription schema, add `evaluatePlaybackAccess` with lesson index <= 2 and grace period rules.
2. `web/lib/utils/auth-gate.ts` — Update gating helper to work with full access evaluation state.
3. `web/app/api/checkout/route.ts` — Support `monthly` subscription mode (`interval: "month"`).
4. `web/components/course/course-pricing-card.tsx` — Add Monthly ($19/mo) pricing option.
5. `web/components/lesson/video-embed.tsx` — Integrate paywall lock overlay and renewal modal when lesson is gated.
6. `web/app/lessons/[slug]/page.tsx` — Calculate `lessonIndex` within course modules and pass to `VideoEmbed`.
7. `web/test/saas-monetization.test.ts` & `web/test/auth-gate.test.ts` — Add comprehensive unit tests verifying all 4 flows.

---

## Acceptance Criteria
1. Non-logged-in visitors cannot play any video; clicking play opens login dialog with redirect tracking.
2. Logged-in unpaid users can play Lesson 1 and Lesson 2 of any course without restrictions.
3. Logged-in unpaid users are blocked on Lesson 3+ and presented with an enrollment paywall dialog with payment buttons.
4. Active course or subscription (monthly or yearly) holders can play all lessons.
5. Expired/past-due subscriptions prompt renewal and block playback beyond the 3-day grace period.
6. All existing and new unit tests pass (`npm test`).
7. `npm run type-check`, `npm run lint`, and `npm run build` pass with 0 errors.
8. No code will be committed or pushed until the user explicitly commands it.

---

## Verification & Manual Test Steps
1. Run `npm --prefix web test` to verify automated test assertions for all 4 flows.
2. Test in browser as guest: go to `/lessons/[slug]`, click play, verify auth modal appears.
3. Test as authenticated user without payment on Lesson 1/2: verify video plays.
4. Test on Lesson 3 without payment: verify video halts and enrollment paywall modal opens.
5. Test with course or subscription entitlement: verify unrestricted playback.
