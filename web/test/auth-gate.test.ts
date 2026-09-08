import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  shouldAllowPlayback,
  getVideoAuthGatingState,
} from "../lib/utils/auth-gate.ts";

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

  describe("Play button interaction simulation", () => {
    test("clicking play while unauthenticated intercepts playback and opens auth modal", () => {
      let isPlaying = false;
      let modalOpen = false;

      const userAuth = { isAuthLoaded: true, isSignedIn: false };
      const gating = getVideoAuthGatingState(userAuth);

      // Simulate togglePlay handler
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

      // Simulate togglePlay handler
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
});
