"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface CourseViewTrackerProps {
  courseSlug: string;
  courseTitle: string;
  modulesCount?: number;
  level?: string;
}

export function CourseViewTracker({
  courseSlug,
  courseTitle,
  modulesCount,
  level,
}: CourseViewTrackerProps) {
  useEffect(() => {
    posthog.capture("course_viewed", {
      course_slug: courseSlug,
      course_title: courseTitle,
      modules_count: modulesCount,
      level,
    });
  }, [courseSlug, courseTitle, modulesCount, level]);

  return null;
}
