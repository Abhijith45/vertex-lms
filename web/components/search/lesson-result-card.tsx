"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import posthog from "posthog-js";
import { HighlightedText } from "./highlighted-text";
import { SearchResultLogo } from "./search-result-logo";

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
  // Ensure we have preview bullet points if available
  let previewPoints = lesson.keyPoints || [];
  if (previewPoints.length === 0 && lesson.description) {
    // Gracefully derive preview bullet points from description sentences
    const sentences = lesson.description
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10 && !s.toLowerCase().startsWith("what this lesson covers"));
    if (sentences.length > 0) {
      previewPoints = sentences.slice(0, 2);
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
      className="group flex flex-col sm:flex-row h-full w-full overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md"
    >
      {/* Left side: Course Logo / Image Area */}
      <div className="relative w-full sm:w-[200px] md:w-[210px] lg:w-[220px] shrink-0 bg-[#0F172A] dark:bg-black overflow-hidden flex items-center justify-center min-h-[160px] sm:min-h-full border-b sm:border-b-0 sm:border-r border-neutral-800/60 p-4 sm:p-5">
        <SearchResultLogo
          courseTitle={lesson.courseTitle}
          lessonTitle={lesson.title}
          lessonSlug={lesson.slug}
          className="w-14 h-14 sm:w-16 sm:h-16"
        />
        <div className="absolute bottom-3 right-3">
          <CheckCircle2 className="h-4 w-4 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
        </div>
      </div>

      {/* Right side: Content & Metadata */}
      <div className="flex flex-col justify-between p-4 sm:p-5 w-full min-w-0">
        <div className="flex flex-col gap-1.5">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 min-w-0">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-[10px]">
                {lesson.courseTitle ? lesson.courseTitle.charAt(0) : "C"}
              </div>
              <span className="truncate">
                <HighlightedText text={lesson.courseTitle} query={query} />
              </span>
            </div>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase shrink-0">
              Lesson
            </span>
          </div>
          
          {/* Title and description */}
          <div className="mt-1">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors line-clamp-1">
              <HighlightedText text={lesson.title} query={query} />
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              <HighlightedText text={lesson.description} query={query} />
            </p>
          </div>

          {/* Key points tags (compact single pill) */}
          {previewPoints.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {previewPoints.slice(0, 1).map((point, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-600 dark:text-neutral-300 truncate max-w-full"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-500 shrink-0" />
                  <span className="truncate">
                    <HighlightedText text={point} query={query} />
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer row */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-3 text-xs">
          <div className="text-neutral-500 dark:text-neutral-400 text-xs truncate">
            <span>{lesson.moduleLabel || "Lesson Match"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 shrink-0">
            <span>View lesson</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

