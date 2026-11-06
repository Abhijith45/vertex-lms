"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

/**
 * Identifies the signed-in Clerk user with PostHog.
 * Renders nothing — mount it once inside the ClerkProvider tree.
 */
export function PostHogIdentity() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      posthog.identify(user.id, {
        // PII goes on the person via identify, not in capture() properties
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
    } else {
      // Reset on sign-out so the next visitor starts fresh
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
