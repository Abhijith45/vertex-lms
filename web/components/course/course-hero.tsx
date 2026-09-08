"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  BookOpen,
  Users,
  ArrowRight,
  BarChart2,
} from "lucide-react";
import posthog from "posthog-js";
import { CourseCoverArt } from "./course-cover-art";
import { BookmarkButton } from "./bookmark-button";

interface CourseHeroProps {
  course: {
    _id: string;
    title: string;
    slug: string;
    summary?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coverImage?: any;
    level?: string;
    popular?: boolean;
    studentCount?: number;
    modules?: Array<{
      title: string;
      summary?: string;
      lessons?: Array<{
        title: string;
        duration?: number;
        slug?: { current?: string } | string;
      }>;
    }>;
  };
  totalDurationFormatted: string;
  totalModulesCount: number;
  continueLearningUrl?: string;
}

export function CourseHero({
  course,
  totalDurationFormatted,
  totalModulesCount,
  continueLearningUrl = "#",
}: CourseHeroProps) {
  // Format level string (e.g. "intermediate" -> "Intermediate")
  const levelDisplay = course.level
    ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
    : "Intermediate";

  const studentDisplay = course.studentCount
    ? `${(course.studentCount >= 1000
        ? (course.studentCount / 1000).toFixed(1) + "k"
        : course.studentCount)} students`
    : "2.1k students";

  return (
    <section className="mb-14">
      {/* ──────────────────────────────────────────────────────────
         BREADCRUMB
         ────────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Link
          href="/"
          className="transition-colors hover:text-neutral-900 dark:hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
        >
          All Courses
        </Link>
        <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
          {course.title}
        </span>
      </nav>

      {/* ──────────────────────────────────────────────────────────
         HERO MAIN LAYOUT (2 Columns on Desktop)
         ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
        {/* Left: Cover Art */}
        <CourseCoverArt
          coverImage={course.coverImage}
          title={course.title}
          slug={course.slug}
        />

        {/* Right: Info & Actions */}
        <div className="flex-1">
          {/* Popular Badge */}
          {course.popular && (
            <div className="mb-4 inline-flex items-center rounded-md border border-[#FED7AA] dark:border-primary-500/30 bg-[#FFF5EE] dark:bg-primary-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-[#EA580C] dark:text-primary-400 uppercase select-none">
              POPULAR
            </div>
          )}

          {/* Course Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-bold text-neutral-900 dark:text-neutral-50 tracking-tight leading-[1.12] mb-4">
            {course.title}
          </h1>

          {/* Summary / Subtitle */}
          <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
            {course.summary ||
              "Build scalable, high-performance web applications with Next.js, best practices, and production-ready deployment strategies."}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-9">
            {/* Level */}
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-neutral-400 dark:text-neutral-500" strokeWidth={1.75} />
              <span>{levelDisplay}</span>
            </div>

            {/* Total Duration */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400 dark:text-neutral-500" strokeWidth={1.75} />
              <span>{totalDurationFormatted}</span>
            </div>

            {/* Module Count */}
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-neutral-400 dark:text-neutral-500" strokeWidth={1.75} />
              <span>{totalModulesCount} modules</span>
            </div>

            {/* Student Count */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-400 dark:text-neutral-500" strokeWidth={1.75} />
              <span>{studentDisplay}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={continueLearningUrl}
              onClick={() => {
                posthog.capture("resume_used", {
                  course_slug: course.slug,
                  course_title: course.title,
                  continue_url: continueLearningUrl,
                  source: "course_hero",
                });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E05A36] px-6 py-3.5 text-sm sm:text-base font-medium text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:bg-[#C2410C] hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              <span>Continue Learning</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
            </Link>

            <BookmarkButton courseId={course._id} />
          </div>
        </div>
      </div>
    </section>
  );
}
