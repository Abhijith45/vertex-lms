"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface LessonViewTrackerProps {
  lessonSlug: string;
  lessonTitle: string;
  courseSlug?: string;
  duration?: number;
  startSeconds?: number;
}

export function LessonViewTracker({
  lessonSlug,
  lessonTitle,
  courseSlug,
  duration = 0,
  startSeconds = 0,
}: LessonViewTrackerProps) {
  useEffect(() => {
    posthog.capture("lesson_viewed", {
      lesson_slug: lessonSlug,
      lesson_title: lessonTitle,
      course_slug: courseSlug || "",
      duration,
      has_start_param: startSeconds > 0,
      start_seconds: startSeconds,
    });
  }, [lessonSlug, lessonTitle, courseSlug, duration, startSeconds]);

  return null;
}
