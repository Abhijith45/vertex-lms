"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import posthog from "posthog-js";

interface BookmarkButtonProps {
  courseId: string;
  initialIsBookmarked?: boolean;
  courseTitle?: string;
  onToggle?: (bookmarked: boolean) => void;
  className?: string;
  size?: "default" | "sm";
}

export function BookmarkButton({
  courseId,
  initialIsBookmarked = false,
  courseTitle,
  onToggle,
  className = "",
  size = "default",
}: BookmarkButtonProps) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialIsBookmarked);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Synchronize state if initialIsBookmarked changes from SSR
  useEffect(() => {
    setIsBookmarked(initialIsBookmarked);
  }, [initialIsBookmarked]);

  async function handleBookmarkToggle() {
    // If user is guest, trigger Clerk sign-in modal
    if (!isSignedIn) {
      if (openSignIn) {
        openSignIn();
      }
      return;
    }

    const nextState = !isBookmarked;
    const previousState = isBookmarked;

    // 1. Optimistic UI update
    setIsBookmarked(nextState);
    if (onToggle) {
      onToggle(nextState);
    }

    // 2. Client analytics
    posthog.capture("course_bookmarked", {
      course_id: courseId,
      course_title: courseTitle,
      bookmarked: nextState,
      source: "bookmark_button",
    });

    // 3. Persist to Sanity via server route
    setIsSaving(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          bookmarked: nextState,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save bookmark: status ${res.status}`);
      }

      const data = await res.json();
      if (typeof data.bookmarked === "boolean") {
        setIsBookmarked(data.bookmarked);
        if (onToggle) {
          onToggle(data.bookmarked);
        }
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      // Revert optimistic update on failure
      setIsBookmarked(previousState);
      if (onToggle) {
        onToggle(previousState);
      }
    } finally {
      setIsSaving(false);
    }
  }

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={handleBookmarkToggle}
      disabled={isSaving}
      className={`inline-flex items-center gap-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.98] select-none ${
        isSmall
          ? "px-3 py-1.5 text-xs font-medium"
          : "px-5 py-3.5 text-sm sm:text-base font-medium"
      } ${
        isBookmarked
          ? "border-primary-400 dark:border-primary-500/40 bg-primary-50/90 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 shadow-xs"
          : "border-neutral-200/90 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 hover:border-neutral-300 dark:hover:border-neutral-600 shadow-2xs"
      } ${className}`}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this course"}
    >
      {isSaving ? (
        <Loader2
          className={`${isSmall ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5"} animate-spin text-primary-500`}
        />
      ) : (
        <Bookmark
          className={`${
            isSmall ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5"
          } transition-colors ${
            isBookmarked
              ? "fill-primary-500 text-primary-500 dark:fill-primary-400 dark:text-primary-400"
              : "text-neutral-700 dark:text-neutral-300"
          }`}
          strokeWidth={1.75}
        />
      )}
      <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </button>
  );
}
