/**
 * Video Auth Gating Utilities
 * Restricts video playback to signed-in/signed-up users only,
 * with awareness of content entitlement and free preview rules.
 */

export interface AuthState {
  isAuthLoaded: boolean;
  isSignedIn?: boolean | null;
  userId?: string | null;
}

/**
 * Determines whether the user is authorized to play lesson/course videos based on auth state alone.
 * Only signed-in users are allowed to start playback.
 */
export function shouldAllowPlayback(auth: AuthState): boolean {
  if (!auth.isAuthLoaded) return false;
  return Boolean(auth.isSignedIn);
}

/**
 * Computes full auth-gating state for video components.
 */
export function getVideoAuthGatingState(auth: AuthState): {
  requiresAuth: boolean;
  canPlay: boolean;
  promptModal: boolean;
} {
  const requiresAuth = auth.isAuthLoaded ? !auth.isSignedIn : true;
  const canPlay = shouldAllowPlayback(auth);
  return {
    requiresAuth,
    canPlay,
    promptModal: requiresAuth && !canPlay,
  };
}

/**
 * Senior System Designer Access Decision Pipeline:
 * Evaluates both Authentication and Monetization/Subscription status.
 */
export function getFullPlaybackAccessState({
  auth,
  isAllowed = false,
  reason = "PAYWALL_COURSE",
}: {
  auth: AuthState;
  isAllowed?: boolean;
  reason?: string;
}): {
  canPlay: boolean;
  promptModal: "AUTH" | "PAYWALL" | "RENEWAL" | null;
} {
  // If Clerk auth is still loading, wait safely
  if (!auth.isAuthLoaded) {
    return {
      canPlay: false,
      promptModal: null,
    };
  }

  // Not signed in
  if (!auth.isSignedIn || !auth.userId) {
    return {
      canPlay: false,
      promptModal: "AUTH",
    };
  }

  // Signed in: verify entitlement permission
  if (isAllowed) {
    return {
      canPlay: true,
      promptModal: null,
    };
  }

  // Handle specific blocked reasons
  if (reason === "SUBSCRIPTION_EXPIRED") {
    return {
      canPlay: false,
      promptModal: "RENEWAL",
    };
  }

  return {
    canPlay: false,
    promptModal: "PAYWALL",
  };
}
