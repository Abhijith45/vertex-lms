"use client";

import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import posthog from "posthog-js";

interface BookmarkButtonProps {
  courseId: string;
}

export function BookmarkButton({ courseId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  function handleBookmarkToggle() {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    posthog.capture("course_bookmarked", {
      course_id: courseId,
      bookmarked: nextState,
    });
  }

  return (
    <button
      type="button"
      onClick={handleBookmarkToggle}
      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3.5 text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${
        isBookmarked
          ? "border-primary-400 bg-primary-50 text-primary-600 shadow-xs"
          : "border-neutral-200/90 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 shadow-2xs"
      }`}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this course"}
    >
      <Bookmark
        className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
          isBookmarked ? "fill-primary-500 text-primary-500" : "text-neutral-700"
        }`}
        strokeWidth={1.75}
      />
      <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </button>
  );
}
