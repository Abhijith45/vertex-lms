"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, ArrowRight } from "lucide-react";
import posthog from "posthog-js";
import { resolveFallbackThumbnailType } from "@/lib/utils/search";
import { HighlightedText } from "./highlighted-text";
import reactIcon from "@/app/assets/React-icon.webp";
import nextjsIcon from "@/app/assets/next_js_logo.webp";
import codeIcon from "@/app/assets/pngtree-code-line-icon.png";

const FALLBACK_CONFIG = {
  nextjs: {
    src: nextjsIcon,
    alt: "Next.js logo",
  },
  react: {
    src: reactIcon,
    alt: "React logo",
  },
  default: {
    src: codeIcon,
    alt: "Code icon",
  },
};

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

  const fallbackType = resolveFallbackThumbnailType(
    videoMoment.courseTitle,
    videoMoment.lessonTitle,
    videoMoment.lessonSlug
  );
  const fallback = FALLBACK_CONFIG[fallbackType];

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
      className="group flex flex-col sm:flex-row w-full overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md"
    >
      {/* Left side: Thumbnail & Video Preview */}
      <div className="relative w-full sm:w-[330px] lg:w-[350px] shrink-0 bg-neutral-900 dark:bg-black overflow-hidden">
        <div className="aspect-video w-full h-full flex items-center justify-center bg-neutral-900 dark:bg-black">
          {videoMoment.thumbnailUrl && !hasImgError ? (
            <img 
              src={videoMoment.thumbnailUrl} 
              alt={videoMoment.lessonTitle} 
              onError={() => setHasImgError(true)}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full p-6">
              <Image
                src={fallback.src}
                alt={fallback.alt}
                width={80}
                height={80}
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </div>
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <PlayCircle className="h-12 w-12 text-white opacity-85 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 drop-shadow-md" />
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs pointer-events-none">
          {videoMoment.clipLength || formatSeconds(videoMoment.startSeconds)}
        </div>
      </div>

      {/* Right side: Content */}
      <div className="flex flex-col justify-between p-5 sm:p-6 w-full">
        <div className="flex flex-col gap-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-[10px]">
                {videoMoment.courseTitle ? videoMoment.courseTitle.charAt(0) : "C"}
              </div>
              <span className="truncate max-w-[280px] sm:max-w-md">
                <HighlightedText text={videoMoment.courseTitle} query={query} />
              </span>
            </div>
            <span className="rounded-full bg-primary-50 dark:bg-primary-950/40 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-primary-500 dark:text-primary-400 uppercase shrink-0">
              Video
            </span>
          </div>
          
          {/* Title and description */}
          <div className="mt-2">
            <h3 className="text-heading-3 text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
              <HighlightedText text={videoMoment.lessonTitle} query={query} />
            </h3>
            <p className="mt-1.5 text-body text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">
              <HighlightedText text={videoMoment.description} query={query} />
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Video Match</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-500">
            <PlayCircle className="h-4 w-4" />
            <span>Watch from {formatSeconds(videoMoment.startSeconds)}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
