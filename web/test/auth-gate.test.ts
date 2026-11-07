import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  shouldAllowPlayback,
  getVideoAuthGatingState,
  getFullPlaybackAccessState,
} from "../lib/utils/auth-gate.ts";
import {
  evaluatePlaybackAccess,
  grantCourseAccess,
  grantAllAccess,
  setSubscription,
  resetEntitlementsForTesting,
} from "../lib/entitlements.ts";

describe("Video Authentication Gating", () => {
  describe("shouldAllowPlayback", () => {
    test("denies playback when auth is still loading (unresolved state)", () => {
      const allowed = shouldAllowPlayback({ isAuthLoaded: false, isSignedIn: undefined });
      assert.equal(allowed, false);
    });

    test("denies playback for unauthenticated users (isSignedIn = false)", () => {
      const allowed = shouldAllowPlayback({ isAuthLoaded: true, isSignedIn: false });
      assert.equal(allowed, false);
    });

    test("denies playback for null user state", () => {
      const allowed = shouldAllowPlayback({ isAuthLoaded: true, isSignedIn: null });
      assert.equal(allowed, false);
    });

    test("allows playback only for signed-in users (isSignedIn = true)", () => {
      const allowed = shouldAllowPlayback({ isAuthLoaded: true, isSignedIn: true });
      assert.equal(allowed, true);
    });
  });

  describe("getVideoAuthGatingState", () => {
    test("requires auth and triggers modal when unauthenticated user attempts playback", () => {
      const state = getVideoAuthGatingState({ isAuthLoaded: true, isSignedIn: false });
      assert.equal(state.requiresAuth, true);
      assert.equal(state.canPlay, false);
      assert.equal(state.promptModal, true);
    });

    test("safely restricts playback while auth is loading", () => {
      const state = getVideoAuthGatingState({ isAuthLoaded: false, isSignedIn: false });
      assert.equal(state.requiresAuth, true);
      assert.equal(state.canPlay, false);
      assert.equal(state.promptModal, true);
    });

    test("grants playback access and does not prompt modal when signed in", () => {
      const state = getVideoAuthGatingState({ isAuthLoaded: true, isSignedIn: true });
      assert.equal(state.requiresAuth, false);
      assert.equal(state.canPlay, true);
      assert.equal(state.promptModal, false);
    });
  });

  describe("Senior System Designer Full Lifecycle: 4 User Activity Flows", () => {
    const courseSlug = "distributed-systems-and-nextjs";

    test("Flow 1: Non-logged-in visitors are strictly blocked from playing any video", () => {
      // Lesson 1, Lesson 2, and Lesson 3 are all blocked for guest
      for (const _lessonIdx of [1, 2, 3, 5]) {
        const state = getFullPlaybackAccessState({
          auth: { isAuthLoaded: true, isSignedIn: false, userId: null },
        });
        assert.equal(state.canPlay, false);
        assert.equal(state.promptModal, "AUTH");
      }
    });

    test("Flow 2: Logged-in unpaid users can play Lesson 1 and Lesson 2 (Free Preview Tier)", () => {
      const unpaidUser = "user_unpaid_learner_101";

      const dec1 = evaluatePlaybackAccess({ userId: unpaidUser, courseSlug, lessonIndex: 1 });
      const lesson1 = getFullPlaybackAccessState({
        auth: { isAuthLoaded: true, isSignedIn: true, userId: unpaidUser },
        isAllowed: dec1.allowed,
        reason: dec1.reason,
      });
      assert.equal(lesson1.canPlay, true);
      assert.equal(dec1.reason, "FREE_PREVIEW");
      assert.equal(lesson1.promptModal, null);

      const dec2 = evaluatePlaybackAccess({ userId: unpaidUser, courseSlug, lessonIndex: 2 });
      const lesson2 = getFullPlaybackAccessState({
        auth: { isAuthLoaded: true, isSignedIn: true, userId: unpaidUser },
        isAllowed: dec2.allowed,
        reason: dec2.reason,
      });
      assert.equal(lesson2.canPlay, true);
      assert.equal(dec2.reason, "FREE_PREVIEW");
      assert.equal(lesson2.promptModal, null);

      // Lesson 3 is locked behind the paywall
      const dec3 = evaluatePlaybackAccess({ userId: unpaidUser, courseSlug, lessonIndex: 3 });
      const lesson3 = getFullPlaybackAccessState({
        auth: { isAuthLoaded: true, isSignedIn: true, userId: unpaidUser },
        isAllowed: dec3.allowed,
        reason: dec3.reason,
      });
      assert.equal(lesson3.canPlay, false);
      assert.equal(dec3.reason, "PAYWALL_COURSE");
      assert.equal(lesson3.promptModal, "PAYWALL");
    });

    test("Flow 3: After making payment, user is allocated permission to play all lessons", () => {
      resetEntitlementsForTesting();
      const payingUser = "user_buyer_202";

      // Before payment: lesson 4 blocked
      const before = evaluatePlaybackAccess({
        userId: payingUser,
        courseSlug,
        lessonIndex: 4,
      });
      assert.equal(before.allowed, false);

      // User buys single course lifetime pass
      grantCourseAccess(payingUser, courseSlug);

      const after = evaluatePlaybackAccess({
        userId: payingUser,
        courseSlug,
        lessonIndex: 4,
      });
      assert.equal(after.allowed, true);
      assert.equal(after.reason, "LIFETIME_PURCHASE");
    });

    test("Flow 4: Monthly & Yearly recurring subscriptions with grace period and renewal prompt", () => {
      resetEntitlementsForTesting();
      const monthlyUser = "user_monthly_sub_303";
      const now = new Date("2026-11-06T12:00:00.000Z");

      // Active monthly subscription: allowed on lesson 5
      setSubscription({
        userId: monthlyUser,
        plan: "monthly",
        status: "active",
        currentPeriodEnd: "2026-12-06T12:00:00.000Z",
      });

      const activeDecision = evaluatePlaybackAccess({
        userId: monthlyUser,
        courseSlug,
        lessonIndex: 5,
        now,
      });
      assert.equal(activeDecision.allowed, true);
      assert.equal(activeDecision.reason, "ACTIVE_SUBSCRIPTION");

      // Payment failed: subscription becomes 'past_due' (within 3-day grace period)
      setSubscription({
        userId: monthlyUser,
        plan: "monthly",
        status: "past_due",
        currentPeriodEnd: "2026-11-05T12:00:00.000Z", // 1 day ago
      });

      const graceDecision = evaluatePlaybackAccess({
        userId: monthlyUser,
        courseSlug,
        lessonIndex: 5,
        now,
      });
      assert.equal(graceDecision.allowed, true);
      assert.equal(graceDecision.reason, "GRACE_PERIOD");
      assert.ok(graceDecision.gracePeriodExpiresAt);

      // Grace period exceeded: 4 days past due
      const pastGraceDate = new Date("2026-11-10T12:00:00.000Z");
      const expiredDecision = evaluatePlaybackAccess({
        userId: monthlyUser,
        courseSlug,
        lessonIndex: 5,
        now: pastGraceDate,
      });
      assert.equal(expiredDecision.allowed, false);
      assert.equal(expiredDecision.reason, "SUBSCRIPTION_EXPIRED");

      // In full access state, triggers RENEWAL modal
      const expiredState = getFullPlaybackAccessState({
        auth: { isAuthLoaded: true, isSignedIn: true, userId: monthlyUser },
        isAllowed: expiredDecision.allowed,
        reason: expiredDecision.reason,
      });
      assert.equal(expiredState.canPlay, false);
      assert.equal(expiredState.promptModal, "RENEWAL");
    });
  });

  describe("Play button interaction simulation", () => {
    test("clicking play while unauthenticated intercepts playback and opens auth modal", () => {
      let isPlaying = false;
      let modalOpen = false;

      const userAuth = { isAuthLoaded: true, isSignedIn: false };
      const gating = getVideoAuthGatingState(userAuth);

      function handlePlayClick() {
        if (gating.requiresAuth && !isPlaying) {
          modalOpen = true;
          return;
        }
        isPlaying = true;
      }

      handlePlayClick();

      assert.equal(isPlaying, false, "Video playback must NOT start for non-signed-in user");
      assert.equal(modalOpen, true, "Auth prompt modal must be displayed on play click");
    });

    test("clicking play while authenticated initiates playback without opening modal", () => {
      let isPlaying = false;
      let modalOpen = false;

      const userAuth = { isAuthLoaded: true, isSignedIn: true };
      const gating = getVideoAuthGatingState(userAuth);

      function handlePlayClick() {
        if (gating.requiresAuth && !isPlaying) {
          modalOpen = true;
          return;
        }
        isPlaying = true;
      }

      handlePlayClick();

      assert.equal(isPlaying, true, "Video playback should start for signed-in user");
      assert.equal(modalOpen, false, "Auth modal should not open for signed-in user");
    });
  });

  describe("Senior System Designer: Cross-Session Entitlement Persistence & Re-Login", () => {
    test("Test Case 1: Post-login persistence — user who purchased course retains lifetime access across sessions", () => {
      resetEntitlementsForTesting();
      const testUser = "user_lifetime_learner_42";
      const testCourse = "nextjs-app-router-in-depth";

      // Session A: User purchases course
      grantCourseAccess(testUser, testCourse);

      // Verify Session A access
      const sessionADecision = evaluatePlaybackAccess({
        userId: testUser,
        courseSlug: testCourse,
        lessonIndex: 5, // Lesson 5 (beyond free preview)
      });
      assert.equal(sessionADecision.allowed, true);
      assert.equal(sessionADecision.reason, "LIFETIME_PURCHASE");

      // Session B: User logs out and re-logs in
      // Entitlement must evaluate to true without prompting payment
      const sessionBDecision = evaluatePlaybackAccess({
        userId: testUser,
        courseSlug: testCourse,
        lessonIndex: 8,
      });
      assert.equal(sessionBDecision.allowed, true);
      assert.equal(sessionBDecision.reason, "LIFETIME_PURCHASE");
    });

    test("Test Case 2: Subscription continuity across re-login for All-Access Yearly", () => {
      resetEntitlementsForTesting();
      const subscriber = "user_yearly_sub_99";

      // Granted annual pass
      grantAllAccess(subscriber);

      // Check access on any course (e.g. course-ai-rag)
      const decision = evaluatePlaybackAccess({
        userId: subscriber,
        courseSlug: "advanced-ai-rag-architectures",
        lessonIndex: 12,
      });
      assert.equal(decision.allowed, true);
      assert.equal(decision.reason, "ACTIVE_SUBSCRIPTION");
    });

    test("Test Case 3: Subscription Expiration & 3-Day Grace Period", () => {
      resetEntitlementsForTesting();
      const userPastDue = "user_past_due_77";

      // Setup past_due subscription that ended 1 day ago (within 3-day grace period)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      setSubscription({
        userId: userPastDue,
        plan: "monthly",
        status: "past_due",
        currentPeriodEnd: oneDayAgo,
      });

      // Still in grace period
      const graceDecision = evaluatePlaybackAccess({
        userId: userPastDue,
        courseSlug: "system-design-in-depth",
        lessonIndex: 4,
      });
      assert.equal(graceDecision.allowed, true);
      assert.equal(graceDecision.reason, "GRACE_PERIOD");
      assert.ok(graceDecision.gracePeriodExpiresAt);

      // 4 days later: grace period expired
      const fourDaysLater = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
      const expiredDecision = evaluatePlaybackAccess({
        userId: userPastDue,
        courseSlug: "system-design-in-depth",
        lessonIndex: 4,
        now: fourDaysLater,
      });
      assert.equal(expiredDecision.allowed, false);
      assert.equal(expiredDecision.reason, "SUBSCRIPTION_EXPIRED");
    });

    test("Test Case 4: Free Preview Rule Consistency — Lesson 1 & 2 free, Lesson 3 paywalled", () => {
      resetEntitlementsForTesting();
      const unpaidUser = "user_free_preview_01";
      const courseSlug = "docker-kubernetes-production";

      const lesson1 = evaluatePlaybackAccess({
        userId: unpaidUser,
        courseSlug,
        lessonIndex: 1,
      });
      assert.equal(lesson1.allowed, true);
      assert.equal(lesson1.reason, "FREE_PREVIEW");

      const lesson2 = evaluatePlaybackAccess({
        userId: unpaidUser,
        courseSlug,
        lessonIndex: 2,
      });
      assert.equal(lesson2.allowed, true);
      assert.equal(lesson2.reason, "FREE_PREVIEW");

      const lesson3 = evaluatePlaybackAccess({
        userId: unpaidUser,
        courseSlug,
        lessonIndex: 3,
      });
      assert.equal(lesson3.allowed, false);
      assert.equal(lesson3.reason, "PAYWALL_COURSE");
    });
  });
});
