"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle, ArrowRight } from "lucide-react";
import posthog from "posthog-js";
import { HighlightedText } from "./highlighted-text";
import { SearchResultLogo } from "./search-result-logo";

interface VideoResultCardProps {
  videoMoment: {
    lessonTitle: string;
    lessonSlug: string;
    courseTitle: string;
    courseIcon?: string;
    description: string;
    startSeconds: number;
    thumbnailUrl?: string;
    clipLength?: string;
  };
  query?: string;
  positionIndex?: number;
}

function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoResultCard({ videoMoment, query, positionIndex }: VideoResultCardProps) {
  const [hasImgError, setHasImgError] = useState(false);

  const handleClick = () => {
    posthog.capture("search_result_opened", {
      result_type: "video",
      query: query || "",
      lesson_slug: videoMoment.lessonSlug,
      lesson_title: videoMoment.lessonTitle,
      course_title: videoMoment.courseTitle,
      start_seconds: videoMoment.startSeconds,
      position_index: positionIndex,
    });
  };

  return (
    <Link
      href={`/lessons/${videoMoment.lessonSlug}?start=${videoMoment.startSeconds}`}
      onClick={handleClick}
      className="group flex flex-col sm:flex-row h-full w-full overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md"
    >
      {/* Left side: Thumbnail & Video Preview */}
      <div className="relative w-full sm:w-[200px] md:w-[210px] lg:w-[220px] shrink-0 bg-[#0F172A] dark:bg-black overflow-hidden flex items-center justify-center min-h-[160px] sm:min-h-full">
        <div className="aspect-video sm:aspect-auto w-full h-full flex items-center justify-center bg-[#0F172A] dark:bg-black">
          {videoMoment.thumbnailUrl && !hasImgError ? (
            <img 
              src={videoMoment.thumbnailUrl} 
              alt={videoMoment.lessonTitle} 
              onError={() => setHasImgError(true)}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full p-4 sm:p-5">
              <SearchResultLogo
                courseTitle={videoMoment.courseTitle}
                lessonTitle={videoMoment.lessonTitle}
                lessonSlug={videoMoment.lessonSlug}
                className="w-14 h-14 sm:w-16 sm:h-16"
              />
            </div>
          )}
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs pointer-events-none">
          {videoMoment.clipLength || formatSeconds(videoMoment.startSeconds)}
        </div>
      </div>

      {/* Right side: Content */}
      <div className="flex flex-col justify-between p-4 sm:p-5 w-full min-w-0">
        <div className="flex flex-col gap-1.5">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 min-w-0">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-[10px]">
                {videoMoment.courseTitle ? videoMoment.courseTitle.charAt(0) : "C"}
              </div>
              <span className="truncate">
                <HighlightedText text={videoMoment.courseTitle} query={query} />
              </span>
            </div>
            <span className="rounded-full bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 text-[10px] font-bold tracking-widest text-primary-500 dark:text-primary-400 uppercase shrink-0">
              Video
            </span>
          </div>
          
          {/* Title and description */}
          <div className="mt-1">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors line-clamp-1">
              <HighlightedText text={videoMoment.lessonTitle} query={query} />
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              <HighlightedText text={videoMoment.description} query={query} />
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Video Match</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 shrink-0">
            <PlayCircle className="h-3.5 w-3.5" />
            <span>Watch from {formatSeconds(videoMoment.startSeconds)}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
