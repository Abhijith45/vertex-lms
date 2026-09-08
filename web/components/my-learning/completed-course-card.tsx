"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { CourseIcon } from "@/components/home/course-icons";

export interface CompletedCourseData {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  category?: string;
  level: string;
  totalLessons: number;
  firstLessonSlug?: string;
}

export function CompletedCourseCard({ course }: { course: CompletedCourseData }) {
  const replayUrl = course.firstLessonSlug
    ? `/lessons/${course.firstLessonSlug}`
    : `/courses/${course.courseSlug}`;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-6 sm:p-7 shadow-xs">
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <CourseIcon slug={course.courseSlug} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Completed</span>
          </span>
        </div>

        <Link
          href={`/courses/${course.courseSlug}`}
          className="font-display text-xl font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#E05A36] dark:hover:text-primary-400 transition-colors line-clamp-1 block mb-2"
        >
          {course.courseTitle}
        </Link>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-6">
          All {course.totalLessons} lessons completed
        </span>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <Link
          href={`/courses/${course.courseSlug}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors"
        >
          <span>View Course</span>
        </Link>
        <Link
          href={replayUrl}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 p-2.5 transition-colors"
          title="Rewatch from beginning"
        >
          <RotateCcw className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
