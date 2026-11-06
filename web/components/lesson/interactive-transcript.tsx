"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Volume2, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { useLessonPlayback } from "./lesson-playback-context";
import { formatVideoTime } from "@/lib/utils/video";

export interface TranscriptCue {
  id?: string;
  start: number;
  end?: number;
  text: string;
  chapter?: string;
}

interface InteractiveTranscriptProps {
  cues?: TranscriptCue[];
  chapters?: Array<{ startSeconds: number; label: string }>;
  lessonTitle?: string;
}

// Built-in fallback cues derived from core Next.js architecture curriculum
const DEFAULT_FALLBACK_CUES: TranscriptCue[] = [
  {
    start: 0,
    end: 25,
    chapter: "Introduction & Overview",
    text: "Welcome to this lesson. In this module, we're exploring deep architectural data fetching and caching patterns in Next.js App Router.",
  },
  {
    start: 25,
    end: 60,
    chapter: "Server Component Fundamentals",
    text: "By default, every component inside the app directory is a React Server Component. This means fetching code runs strictly on the server with zero client bundle overhead.",
  },
  {
    start: 60,
    end: 110,
    chapter: "Fetch API & Request Deduplication",
    text: "Next.js extends the native fetch API to include automatic request memoization. If three components fetch the same URL in one tree, it executes exactly once.",
  },
  {
    start: 110,
    end: 175,
    chapter: "Time-based & On-demand Revalidation",
    text: "You can control cache invalidation using time-based revalidation with next: { revalidate: 3600 } or on-demand cache tags using revalidateTag in server actions.",
  },
  {
    start: 175,
    end: 240,
    chapter: "Streaming & Suspense Boundaries",
    text: "Instead of blocking page render waiting for slow data, wrap slower database queries in React Suspense boundaries to stream partial UI instantly to the client.",
  },
  {
    start: 240,
    end: 320,
    chapter: "Dynamic vs. Static Rendering",
    text: "When a route accesses dynamic functions like cookies, headers, or unmemoized searchParams, Next.js automatically opts that route into dynamic server-rendered mode.",
  },
  {
    start: 320,
    end: 420,
    chapter: "Production Best Practices & Wrap-up",
    text: "To wrap up: always prefer Server Components for initial fetches, leverage tag-based cache purging on mutations, and use loading skeletons for sub-second perceived performance.",
  },
];

const DEFAULT_EMPTY_CHAPTERS: Array<{ startSeconds: number; label: string }> = [];

export function InteractiveTranscript({
  cues,
  chapters = DEFAULT_EMPTY_CHAPTERS,
  lessonTitle,
}: InteractiveTranscriptProps) {
  const { currentTime, seekTo } = useLessonPlayback();
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize transcript cues: use provided cues, or derive from chapters, or use default cues
  const resolvedCues = useMemo<TranscriptCue[]>(() => {
    if (cues && cues.length > 0) {
      return cues.map((c, idx) => ({
        ...c,
        id: c.id || `cue-${idx}`,
        end: c.end || (cues[idx + 1] ? cues[idx + 1].start : c.start + 30),
      }));
    }

    if (chapters && chapters.length > 0) {
      return chapters.map((ch, idx) => ({
        id: `ch-${idx}`,
        start: ch.startSeconds,
        end: chapters[idx + 1] ? chapters[idx + 1].startSeconds : ch.startSeconds + 60,
        chapter: ch.label,
        text: `In this section: ${ch.label}. Follow along with the code demonstration and implementation steps.`,
      }));
    }

    return DEFAULT_FALLBACK_CUES.map((c, idx) => ({ ...c, id: `fallback-${idx}` }));
  }, [cues, chapters]);

  // Find active cue index based on currentTime
  const activeCueIndex = useMemo(() => {
    if (resolvedCues.length === 0) return -1;
    for (let i = 0; i < resolvedCues.length; i++) {
      const cue = resolvedCues[i];
      const nextCue = resolvedCues[i + 1];
      const cueEnd = cue.end ?? (nextCue ? nextCue.start : Infinity);
      if (currentTime >= cue.start && currentTime < cueEnd) {
        return i;
      }
    }
    // If past all cues, mark last cue active
    if (currentTime >= resolvedCues[resolvedCues.length - 1].start) {
      return resolvedCues.length - 1;
    }
    return 0;
  }, [currentTime, resolvedCues]);

  // Smoothly scroll active cue into view when autoScroll is enabled
  useEffect(() => {
    if (!autoScroll || isUserScrollingRef.current) return;
    if (activeItemRef.current && containerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeCueIndex, autoScroll]);

  // Pause auto-scroll temporarily if user manually scrolls the container
  const handleScroll = () => {
    isUserScrollingRef.current = true;
    if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
    userScrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  // Filter cues by search query
  const filteredCues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return resolvedCues;
    return resolvedCues.filter(
      (c) =>
        c.text.toLowerCase().includes(q) ||
        (c.chapter && c.chapter.toLowerCase().includes(q))
    );
  }, [resolvedCues, searchQuery]);

  const handleCopy = (cue: TranscriptCue, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`[${formatVideoTime(cue.start)}] ${cue.text}`).catch(() => {});
    if (cue.id) {
      setCopiedId(cue.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden transition-all">
      {/* Header with Search and Controls */}
      <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within transcript..."
            aria-label="Search within transcript"
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:border-[#E05A36] focus:ring-1 focus:ring-[#E05A36]/30 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear transcript search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              autoScroll
                ? "border-[#E05A36]/30 bg-[#FFF5EE] dark:bg-[#E05A36]/10 text-[#E05A36]"
                : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
            }`}
            title="Automatically scroll to follow video playback"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{autoScroll ? "Sync Active" : "Sync Paused"}</span>
          </button>
        </div>
      </div>

      {/* Transcript List View */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="max-h-[500px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 p-2 sm:p-3 scroll-smooth"
      >
        {filteredCues.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500">
            No transcript cues matched &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredCues.map((cue, idx) => {
            const isOriginalActive = resolvedCues[activeCueIndex]?.id === cue.id;

            return (
              <div
                key={cue.id || idx}
                ref={isOriginalActive ? activeItemRef : null}
                onClick={() => seekTo(cue.start)}
                className={`group relative p-3 sm:p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                  isOriginalActive
                    ? "bg-[#FFF5EE]/70 dark:bg-[#E05A36]/10 border border-[#E05A36]/30 shadow-2xs"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40 border border-transparent"
                }`}
              >
                {/* Timestamp Seek Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    seekTo(cue.start);
                  }}
                  className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                    isOriginalActive
                      ? "bg-[#E05A36] text-white shadow-2xs"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-[#E05A36]/15 group-hover:text-[#E05A36]"
                  }`}
                >
                  <Volume2 className="h-3 w-3" />
                  <span>{formatVideoTime(cue.start)}</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {cue.chapter && (
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#E05A36] mb-1">
                      {cue.chapter}
                    </div>
                  )}
                  <p
                    className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                      isOriginalActive
                        ? "text-neutral-900 dark:text-neutral-100 font-medium"
                        : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    {cue.text}
                  </p>
                </div>

                {/* Copy / Jump Action */}
                <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(cue, e)}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    title="Copy timestamp and sentence"
                  >
                    {copiedId === cue.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/90 border-t border-neutral-200/70 dark:border-neutral-800 text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center justify-between">
        <span>Click any sentence to seek video</span>
        <span>{filteredCues.length} cues</span>
      </div>
    </div>
  );
}
