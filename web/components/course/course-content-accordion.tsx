"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Play, Sparkles, CheckCircle2 } from "lucide-react";
import { formatDuration } from "@/lib/utils/format";
import posthog from "posthog-js";

export interface LessonItem {
  _id?: string;
  title: string;
  slug?: { current?: string } | string;
  duration?: number;
  freePreview?: boolean;
}

export interface ModuleItem {
  title: string;
  summary?: string;
  lessons?: LessonItem[];
}

interface CourseContentAccordionProps {
  modules?: ModuleItem[];
  totalModulesCount: number;
  totalDurationFormatted: string;
  courseSlug: string;
  completedLessonIds?: string[];
}

export function CourseContentAccordion({
  modules = [],
  totalModulesCount,
  totalDurationFormatted,
  courseSlug,
  completedLessonIds = [],
}: CourseContentAccordionProps) {
  const completedLessonSet = new Set(completedLessonIds);
  // Set first module open by default or track open modules
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [showAll, setShowAll] = useState<boolean>(false);

  const toggleModule = (index: number, moduleTitle: string) => {
    const isCurrentlyOpen = openIndices.includes(index);
    setOpenIndices((prev) =>
      isCurrentlyOpen ? prev.filter((i) => i !== index) : [...prev, index]
    );
    if (!isCurrentlyOpen) {
      posthog.capture("course_accordion_module_expanded", {
        module_index: index + 1,
        module_title: moduleTitle,
        course_slug: courseSlug,
      });
    }
  };

  const initialVisibleLimit = 6;
  const hasMore = modules.length > initialVisibleLimit;
  const visibleModules = showAll ? modules : modules.slice(0, initialVisibleLimit);

  return (
    <section className="mb-24">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl sm:text-[28px] font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Course Content
        </h2>
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {totalModulesCount} modules • {totalDurationFormatted}
        </span>
      </div>

      {/* Module List */}
      <div className="space-y-3">
        {visibleModules.map((module, idx) => {
          const isOpen = openIndices.includes(idx);
          const moduleNumber = idx + 1;

          // Compute module duration from lessons if available
          const moduleDurationSeconds =
            module.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;
          const moduleDurationText =
            moduleDurationSeconds > 0
              ? formatDuration(moduleDurationSeconds)
              : "1h 15m";

          return (
            <div
              key={idx}
              className="group rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs overflow-hidden"
            >
              {/* Module Header / Trigger */}
              <button
                type="button"
                onClick={() => toggleModule(idx, module.title)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                  {/* Circle Number Badge */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {moduleNumber}
                  </div>

                  {/* Title and Summary */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                      {module.title}
                    </h3>
                    {module.summary && (
                      <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400 leading-normal line-clamp-1 sm:line-clamp-2">
                        {module.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration & Expand Chevron */}
                <div className="flex items-center gap-3 shrink-0 text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                  <span className="hidden xs:inline whitespace-nowrap">
                    {moduleDurationText}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-neutral-700 dark:text-neutral-300" : "group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible Lessons List */}
              {isOpen && module.lessons && module.lessons.length > 0 && (
                <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 px-5 sm:px-6 py-3 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {module.lessons.map((lesson, lIdx) => {
                    const lessonSlug =
                      typeof lesson.slug === "object"
                        ? lesson.slug?.current
                        : lesson.slug;
                    const lessonHref = lessonSlug
                      ? `/lessons/${lessonSlug}`
                      : `#`;

                    const isCompleted = Boolean(lesson._id && completedLessonSet.has(lesson._id));

                    return (
                      <div
                        key={lesson._id || lIdx}
                        className="py-2.5 px-2 -mx-2 rounded-lg transition-colors hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isCompleted ? (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                              <Play className="h-3 w-3 fill-neutral-600 dark:fill-neutral-400 text-neutral-600 dark:text-neutral-400 ml-0.5" />
                            </div>
                          )}
                          <Link
                            href={lessonHref}
                            className={`font-medium transition-colors truncate ${
                              isCompleted
                                ? "text-neutral-600 dark:text-neutral-400 line-through decoration-neutral-300 dark:decoration-neutral-600"
                                : "text-neutral-800 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400"
                            }`}
                          >
                            {lesson.title}
                          </Link>
                          {isCompleted ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                              Completed
                            </span>
                          ) : lesson.freePreview ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                              <Sparkles className="h-2.5 w-2.5" />
                              Free preview
                            </span>
                          ) : null}
                        </div>

                        <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0 font-mono">
                          {formatDuration(lesson.duration || 300)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show All / Show Less Toggle Button */}
      {hasMore && (
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer shadow-2xs transition-colors"
          >
            <span>
              {showAll
                ? "Show less modules"
                : `Show all ${modules.length} modules`}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showAll ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </section>
  );
}
