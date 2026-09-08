"use client";

import React from "react";
import Link from "next/link";
import { Play, ArrowRight, BookOpen, Clock } from "lucide-react";
import { formatVideoTime } from "@/lib/utils/video";
import { CourseIcon } from "@/components/home/course-icons";
import posthog from "posthog-js";

export interface InProgressCourseData {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  category?: string;
  level: string;
  totalDurationText: string;
  totalLessons: number;
  completedLessonsCount: number;
  progressPercentage: number;
  resumeLesson?: {
    title: string;
    slug: string;
    positionSeconds: number;
  } | null;
}

export function InProgressCard({ course }: { course: InProgressCourseData }) {
  const resumeUrl = course.resumeLesson
    ? `/lessons/${course.resumeLesson.slug}${
        course.resumeLesson.positionSeconds > 0
          ? `?start=${course.resumeLesson.positionSeconds}`
          : ""
      }`
    : `/courses/${course.courseSlug}`;

  const handleResumeClick = () => {
    posthog.capture("my_learning_resume_clicked", {
      course_id: course.courseId,
      course_slug: course.courseSlug,
      course_title: course.courseTitle,
      lesson_slug: course.resumeLesson?.slug,
      position_seconds: course.resumeLesson?.positionSeconds || 0,
      progress_percentage: course.progressPercentage,
    });
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-6 sm:p-7 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200">
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <CourseIcon slug={course.courseSlug} />
            <div>
              {course.category && (
                <span className="text-[11px] font-semibold text-[#E05A36] dark:text-primary-400 uppercase tracking-wider block">
                  {course.category}
                </span>
              )}
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                {course.level}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span>{course.totalDurationText}</span>
          </span>
        </div>

        {/* Course Title */}
        <Link
          href={`/courses/${course.courseSlug}`}
          className="font-display text-xl sm:text-[22px] font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#E05A36] dark:hover:text-primary-400 transition-colors line-clamp-1 block mb-3"
        >
          {course.courseTitle}
        </Link>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-neutral-900 dark:text-neutral-200 font-semibold">
              {course.progressPercentage}% complete
            </span>
            <span className="text-neutral-500 dark:text-neutral-400">
              {course.completedLessonsCount} of {course.totalLessons} lessons
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#E05A36] transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, course.progressPercentage))}%` }}
            />
          </div>
        </div>

        {/* Resume Target Card */}
        {course.resumeLesson && (
          <div className="rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-[#FAF9F6] dark:bg-neutral-950/60 p-3.5 sm:p-4 mb-4">
            <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
              <span>Next Up / In Progress</span>
              {course.resumeLesson.positionSeconds > 0 && (
                <span>Paused at {formatVideoTime(course.resumeLesson.positionSeconds)}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
              {course.resumeLesson.title}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <Link
          href={resumeUrl}
          onClick={handleResumeClick}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E05A36] hover:bg-[#C2410C] text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer group"
        >
          <Play className="h-4 w-4 fill-white text-white translate-x-0.5" />
          <span>Resume Lesson</span>
        </Link>

        <Link
          href={`/courses/${course.courseSlug}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-colors"
          title="View full course syllabus"
        >
          <BookOpen className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          <span className="hidden sm:inline">Overview</span>
        </Link>
      </div>
    </div>
  );
}
