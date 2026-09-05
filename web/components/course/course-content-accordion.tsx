"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Play, Sparkles } from "lucide-react";
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
}

export function CourseContentAccordion({
  modules = [],
  totalModulesCount,
  totalDurationFormatted,
  courseSlug,
}: CourseContentAccordionProps) {
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
        <h2 className="font-display text-2xl sm:text-[28px] font-bold text-neutral-900 tracking-tight">
          Course Content
        </h2>
        <span className="text-sm font-medium text-neutral-500">
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
              className="group rounded-2xl border border-neutral-200/80 bg-white transition-all duration-200 hover:border-neutral-300 shadow-2xs overflow-hidden"
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
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50/70 text-sm font-semibold text-neutral-700">
                    {moduleNumber}
                  </div>

                  {/* Title and Summary */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-base font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors leading-snug">
                      {module.title}
                    </h3>
                    {module.summary && (
                      <p className="mt-0.5 text-sm text-neutral-500 leading-normal line-clamp-1 sm:line-clamp-2">
                        {module.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration & Expand Chevron */}
                <div className="flex items-center gap-3 shrink-0 text-neutral-500 text-sm font-medium">
                  <span className="hidden xs:inline whitespace-nowrap">
                    {moduleDurationText}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-neutral-700" : "group-hover:text-neutral-600"
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible Lessons List */}
              {isOpen && module.lessons && module.lessons.length > 0 && (
                <div className="border-t border-neutral-100 bg-neutral-50/40 px-5 sm:px-6 py-3 divide-y divide-neutral-100">
                  {module.lessons.map((lesson, lIdx) => {
                    const lessonSlug =
                      typeof lesson.slug === "object"
                        ? lesson.slug?.current
                        : lesson.slug;
                    const lessonHref = lessonSlug
                      ? `/lessons/${lessonSlug}`
                      : `#`;

                    return (
                      <div
                        key={lesson._id || lIdx}
                        className="py-3 flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200/60 text-neutral-600">
                            <Play className="h-3 w-3 fill-neutral-600 text-neutral-600 ml-0.5" />
                          </div>
                          <Link
                            href={lessonHref}
                            className="font-medium text-neutral-800 hover:text-primary-600 transition-colors truncate"
                          >
                            {lesson.title}
                          </Link>
                          {lesson.freePreview && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/80 shrink-0">
                              <Sparkles className="h-2.5 w-2.5" />
                              Free preview
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-neutral-400 shrink-0 font-mono">
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
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer"
          >
            <span>
              {showAll
                ? "Show less modules"
                : `Show all ${totalModulesCount} modules`}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                showAll ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </section>
  );
}
