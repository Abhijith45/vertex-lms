"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Play,
} from "lucide-react";
import { formatDuration } from "@/lib/utils/format";
import { type CurriculumCourse } from "@/lib/utils/curriculum";
import posthog from "posthog-js";

interface LessonSidebarProps {
  course: CurriculumCourse;
  currentLessonSlug: string;
  activeModuleIndex: number;
  progressPercentage?: number;
  completedLessonIds?: string[];
}

export function LessonSidebar({
  course,
  currentLessonSlug,
  activeModuleIndex = 0,
  progressPercentage = 0,
  completedLessonIds = [],
}: LessonSidebarProps) {
  const completedSet = new Set(completedLessonIds);
  // State for expanded module indices (active module open by default)
  const [expandedIndices, setExpandedIndices] = useState<number[]>([activeModuleIndex]);

  const toggleModule = (idx: number) => {
    setExpandedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const modules = course.modules || [];
  const totalModules = modules.length;

  return (
    <aside className="w-full lg:w-80 xl:w-96 shrink-0 border-r border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#0B1120] p-6 flex flex-col justify-between lg:self-start lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:overscroll-contain z-20">
      <div>
        {/* Back to course link */}
        <Link
          href={`/courses/${course.slug || "nextjs-for-production"}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E05A36] hover:text-[#C2410C] transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to course</span>
        </Link>

        {/* Course card info */}
        <div className="flex items-center gap-3.5 pb-6 border-b border-neutral-100 dark:border-neutral-800/60">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black dark:bg-white dark:text-black text-white font-bold text-base shadow-xs">
            N
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-sans font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug truncate">
              {course.title || "Next.js for Production"}
            </h2>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block mt-0.5">
              {progressPercentage}% complete
            </span>
          </div>
        </div>

        {/* Curriculum module counter */}
        <div className="flex items-center justify-between py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          <span>
            Module {activeModuleIndex + 1} of {totalModules || 12}
          </span>
          <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        </div>

        {/* Module list */}
        <div className="space-y-2 mt-1">
          {modules.map((module, mIdx) => {
            const isExpanded = expandedIndices.includes(mIdx);
            const isActiveModule = mIdx === activeModuleIndex;
            const isCompleted =
              Boolean(module.lessons &&
              module.lessons.length > 0 &&
              module.lessons.every((l) => l._id && completedSet.has(l._id)));
            const moduleNumber = mIdx + 1;

            const modDurationSeconds =
              module.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;
            const modDurationText =
              modDurationSeconds > 0 ? formatDuration(modDurationSeconds) : "1h 15m";

            return (
              <div
                key={mIdx}
                className={`rounded-xl transition-colors ${
                  isActiveModule
                    ? "bg-[#FFF9F6] dark:bg-[#E05A36]/10 border border-[#FFEDD5] dark:border-[#E05A36]/30"
                    : "border border-transparent hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50"
                }`}
              >
                {/* Module row trigger */}
                <button
                  type="button"
                  onClick={() => toggleModule(mIdx)}
                  className="w-full text-left p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Circle badge */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        isActiveModule
                          ? "bg-[#E05A36] text-white shadow-2xs"
                          : "border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {moduleNumber}
                    </div>

                    {/* Title and duration */}
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-sm font-semibold truncate leading-tight ${
                          isActiveModule ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        {module.title}
                      </h3>
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block mt-0.5">
                        {modDurationText}
                      </span>
                    </div>
                  </div>

                  {/* Completed checkmark or chevron */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-[#E05A36]" />
                    ) : (
                      <ChevronDown
                        className={`h-4 w-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </button>

                {/* Lessons list inside expanded module */}
                {isExpanded && module.lessons && module.lessons.length > 0 && (
                  <div className="pb-3 pt-1 px-3 space-y-1.5 pl-9 border-t border-neutral-100/60 dark:border-neutral-800/60">
                    {module.lessons.map((lesson) => {
                      const lessonSlug =
                        typeof lesson.slug === "object" && lesson.slug !== null
                          ? (lesson.slug as { current?: string })?.current || ""
                          : lesson.slug;
                      const isCurrentLesson = lessonSlug === currentLessonSlug;
                      const isLessonCompleted = Boolean(lesson._id && completedSet.has(lesson._id));

                      return (
                        <Link
                          key={lessonSlug}
                          href={`/lessons/${lessonSlug}`}
                          onClick={() => {
                            if (!isCurrentLesson) {
                              posthog.capture("lesson_navigated", {
                                direction: "sidebar_select",
                                target_lesson_slug: lessonSlug,
                                target_lesson_title: lesson.title,
                                course_slug: course.slug || "",
                              });
                            }
                          }}
                          className={`flex items-center justify-between gap-2.5 p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            isCurrentLesson
                              ? "bg-white dark:bg-neutral-900 shadow-xs font-semibold text-neutral-900 dark:text-neutral-100 border border-[#FED7AA] dark:border-[#E05A36]/40"
                              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Dot or Checkmark indicator */}
                            {isLessonCompleted && !isCurrentLesson ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#E05A36] shrink-0" />
                            ) : (
                              <div
                                className={`h-2 w-2 rounded-full shrink-0 ${
                                  isCurrentLesson
                                    ? "bg-[#E05A36]"
                                    : "border border-neutral-300 dark:border-neutral-600 bg-transparent"
                                }`}
                              />
                            )}
                            <div className="min-w-0 truncate">
                              <span className={`block truncate ${isLessonCompleted && !isCurrentLesson ? "text-neutral-500 dark:text-neutral-400" : ""}`}>
                                {lesson.title}
                              </span>
                              {isCurrentLesson && (
                                <span className="text-[10px] font-semibold text-[#E05A36] block">
                                  Now playing
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
                            {isCurrentLesson ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E05A36] text-white">
                                <Play className="h-2.5 w-2.5 fill-white text-white ml-0.2" />
                              </div>
                            ) : (
                              <span>{formatDuration(lesson.duration || 300)}</span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
