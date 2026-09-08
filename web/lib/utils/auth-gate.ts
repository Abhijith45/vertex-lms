/**
 * Video Auth Gating Utilities
 * Restricts video playback to signed-in/signed-up users only.
 */

export interface AuthState {
  isAuthLoaded: boolean;
  isSignedIn?: boolean | null;
}

/**
 * Determines whether the user is authorized to play lesson/course videos.
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
