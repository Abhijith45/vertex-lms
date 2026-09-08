"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import posthog from "posthog-js";
import { HighlightedText } from "./highlighted-text";

interface LessonResultCardProps {
  lesson: {
    title: string;
    slug: string;
    description: string;
    courseTitle: string;
    moduleLabel?: string;
    keyPoints?: string[];
  };
  query?: string;
  positionIndex?: number;
}

export function LessonResultCard({ lesson, query, positionIndex }: LessonResultCardProps) {
  // Ensure we always have 2-3 preview bullet points for display
  let previewPoints = lesson.keyPoints || [];
  if (previewPoints.length === 0 && lesson.description) {
    // Gracefully derive preview bullet points from description sentences
    const sentences = lesson.description
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10 && !s.toLowerCase().startsWith("what this lesson covers"));
    if (sentences.length > 0) {
      previewPoints = sentences.slice(0, 3);
    }
  }

  const handleClick = () => {
    posthog.capture("search_result_opened", {
      result_type: "lesson",
      query: query || "",
      lesson_slug: lesson.slug,
      lesson_title: lesson.title,
      course_title: lesson.courseTitle,
      position_index: positionIndex,
    });
  };

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      onClick={handleClick}
      className="group flex flex-col sm:flex-row w-full overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md"
    >
      {/* Left side: Preview Box with Key Points */}
      <div className="relative w-full sm:w-[330px] lg:w-[350px] shrink-0 bg-neutral-50/70 dark:bg-neutral-950/60 p-6 flex flex-col justify-center border-r border-neutral-100 dark:border-neutral-800">
        {previewPoints.length > 0 ? (
          <ul className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 pr-4">
            {previewPoints.slice(0, 3).map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" />
                <span className="leading-snug">
                  <HighlightedText text={point} query={query} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full opacity-30 py-4">
            <BookOpen className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
        <div className="absolute bottom-4 right-4">
          <CheckCircle2 className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
        </div>
      </div>

      {/* Right side: Content & Metadata */}
      <div className="flex flex-col justify-between p-5 sm:p-6 w-full">
        <div className="flex flex-col gap-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-[10px]">
                {lesson.courseTitle ? lesson.courseTitle.charAt(0) : "C"}
              </div>
              <span className="truncate max-w-[280px] sm:max-w-md">
                <HighlightedText text={lesson.courseTitle} query={query} />
              </span>
            </div>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase shrink-0">
              Lesson
            </span>
          </div>
          
          {/* Title and description */}
          <div className="mt-2">
            <h3 className="text-heading-3 text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
              <HighlightedText text={lesson.title} query={query} />
            </h3>
            <p className="mt-1.5 text-body text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">
              <HighlightedText text={lesson.description} query={query} />
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            <span>{lesson.moduleLabel || "Lesson Match"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-500">
            <span>View lesson</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

