"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import posthog from "posthog-js";
import { formatDuration } from "@/lib/utils/format";
import { type CurriculumLesson, type CurriculumModule } from "@/lib/utils/curriculum";

interface LessonFooterNavProps {
  prevLesson?: { lesson: CurriculumLesson; module: CurriculumModule } | null;
  nextLesson?: { lesson: CurriculumLesson; module: CurriculumModule } | null;
  courseSlug?: string;
}

export function LessonFooterNav({ prevLesson, nextLesson, courseSlug }: LessonFooterNavProps) {
  return (
    <div className="mt-14 pt-8 border-t border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Previous Lesson */}
      {prevLesson ? (
        <div className="flex items-center gap-4 w-full sm:w-auto justify-start">
          <Link
            href={`/lessons/${prevLesson.lesson.slug}`}
            onClick={() => {
              posthog.capture("lesson_navigated", {
                direction: "prev",
                target_lesson_slug: prevLesson.lesson.slug,
                target_lesson_title: prevLesson.lesson.title,
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200/90 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 shadow-2xs hover:bg-neutral-50 dark:hover:bg-neutral-700/80 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            <span>Previous Lesson</span>
          </Link>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">
              {prevLesson.lesson.title}
            </span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {formatDuration(prevLesson.lesson.duration || 300)}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full sm:w-auto" />
      )}

      {/* Next Lesson */}
      {nextLesson ? (
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="hidden md:block text-right">
            <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">
              {nextLesson.lesson.title}
            </span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {formatDuration(nextLesson.lesson.duration || 300)}
            </span>
          </div>
          <Link
            href={`/lessons/${nextLesson.lesson.slug}`}
            onClick={() => {
              posthog.capture("lesson_navigated", {
                direction: "next",
                target_lesson_slug: nextLesson.lesson.slug,
                target_lesson_title: nextLesson.lesson.title,
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E05A36] px-6 py-3 text-sm font-medium text-white shadow-md shadow-orange-500/20 hover:bg-[#C2410C] hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <span>Next Lesson</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      ) : courseSlug ? (
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 dark:bg-emerald-700 px-6 py-3 text-sm font-medium text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            <span>Course Overview</span>
          </Link>
        </div>
      ) : (
        <div className="w-full sm:w-auto" />
      )}
    </div>
  );
}
