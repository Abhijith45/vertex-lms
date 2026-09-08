"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { BottomGraphic } from "@/components/home/bottom-graphic";
import { SearchInput } from "@/components/search/search-input";
import { LessonResultCard } from "@/components/search/lesson-result-card";
import { VideoResultCard } from "@/components/search/video-result-card";
import { Loader2, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";

interface SearchLessonItem {
  title: string;
  slug: string;
  description: string;
  courseTitle: string;
  moduleLabel?: string;
  keyPoints?: string[];
}

interface SearchVideoMomentItem {
  lessonTitle: string;
  lessonSlug: string;
  courseTitle: string;
  courseIcon?: string;
  description: string;
  startSeconds: number;
  thumbnailUrl?: string;
  clipLength?: string;
}

interface SearchResults {
  lessons: SearchLessonItem[];
  videoMoments: SearchVideoMomentItem[];
}

type SearchItem =
  | { type: "video"; data: SearchVideoMomentItem }
  | { type: "lesson"; data: SearchLessonItem };

const ITEMS_PER_PAGE = 6;

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    async function fetchResults() {
      if (!query.trim()) {
        setResults(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      setCurrentPage(1); // Reset to page 1 on new search
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          
          // Handle Render cold start gracefully
          if (res.status === 503 && errData.status === "waking_up") {
            if (isMounted) {
              setIsWakingUp(true);
              timeoutId = setTimeout(fetchResults, 5000);
            }
            return; // Return early, don't set loading to false or throw error
          }
          
          throw new Error(errData.message || errData.error || "Failed to fetch search results");
        }
        
        if (!isMounted) return;
        setIsWakingUp(false);
        const data = await res.json();
        const lessons = data.lessons || [];
        const videoMoments = data.videoMoments || [];
        setResults({
          lessons,
          videoMoments,
        });

        // Capture client-side search_performed event
        posthog.capture("search_performed", {
          query: query.trim(),
          query_length: query.trim().length,
          results_count: lessons.length + videoMoments.length,
          lessons_count: lessons.length,
          video_moments_count: videoMoments.length,
          has_results: lessons.length + videoMoments.length > 0,
          source: "search_page",
        });
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch search results");
          setIsWakingUp(false);
        }
      } finally {
        if (isMounted && !timeoutId) {
          setIsLoading(false);
        }
      }
    }

    fetchResults();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  // Combine items for ordered pagination
  const allItems: SearchItem[] = [];
  if (results) {
    results.videoMoments.forEach((vm) => allItems.push({ type: "video", data: vm }));
    results.lessons.forEach((l) => allItems.push({ type: "lesson", data: l }));
  }

  const totalResults = allItems.length;
  const uniqueCoursesCount = new Set(allItems.map((item) => item.data.courseTitle)).size;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalResults);
  const currentItems = allItems.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500">
      {/* Centered White Canvas with 1440px maximum width */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between">
        <div>
          {/* Top Header / Navigation (Consistent with application) */}
          <Navbar activePath="/search" />

          {/* Main Content Area */}
          <main className="px-6 sm:px-12 lg:px-16 pt-8 pb-20">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center">
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Link
                  href="/"
                  className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
                >
                  Home
                </Link>
                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                  Search
                </span>
              </div>
            </nav>

            {/* Page Title & Search Input Header (Centered) */}
            <div className="mb-10 text-center flex flex-col items-center">
              <span className="mb-4 inline-flex rounded-full bg-primary-50 dark:bg-primary-950/40 px-3.5 py-1 text-xs font-bold tracking-widest text-primary-500 dark:text-primary-400 uppercase">
                Search Results
              </span>
              <h1 className="text-display-2 sm:text-display-1 text-neutral-900 dark:text-neutral-100 mb-3">
                Results for <span className="text-primary-500">&quot;{query}&quot;</span>
              </h1>
              <p className="text-body-lg text-neutral-500 dark:text-neutral-400 mb-10">
                Found {totalResults} result{totalResults === 1 ? "" : "s"} across {uniqueCoursesCount} course{uniqueCoursesCount === 1 ? "" : "s"}
              </p>
              <div className="w-full max-w-4xl mx-auto">
                <SearchInput initialQuery={query} />
              </div>
            </div>

            {/* Loading Skeleton State */}
            {isWakingUp ? (
              <div className="w-full py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
                <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
                  Content is loading...
                </p>
              </div>
            ) : isLoading ? (
              <div className="w-full space-y-4">
                {/* Result Count and Sort Selector Skeleton */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-4 animate-pulse">
                  <div className="h-7 w-36 rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
                  <div className="h-9 w-36 rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
                </div>

                {/* 4 Skeleton Dual-Column Result Cards */}
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row w-full overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs"
                    >
                      {/* Left Preview Box Skeleton */}
                      <div className="relative w-full sm:w-[330px] lg:w-[350px] shrink-0 bg-neutral-100/70 dark:bg-neutral-800/60 p-6 flex flex-col justify-center border-r border-neutral-100 dark:border-neutral-800 animate-pulse space-y-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
                          <div className="h-3.5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
                          <div className="h-3.5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
                          <div className="h-3.5 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="absolute bottom-4 right-4 h-4.5 w-4.5 rounded-full border border-neutral-300/80 dark:border-neutral-700" />
                      </div>

                      {/* Right Content Skeleton */}
                      <div className="flex flex-col justify-between p-5 sm:p-6 w-full space-y-4 animate-pulse">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded bg-neutral-200 dark:bg-neutral-800" />
                              <div className="h-4 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
                            </div>
                            <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="h-6 w-3/5 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800/50" />
                            <div className="h-4 w-4/5 rounded bg-neutral-100 dark:bg-neutral-800/50" />
                          </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
                          <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                          <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-6 text-red-600 dark:text-red-400 shadow-xs">
                <p className="font-semibold">Search Unavailable</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : results ? (
              totalResults > 0 ? (
                <div className="w-full space-y-4">
                  {/* Result Count and Summary (Compact, no divider lines) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-4">
                    <h2 className="text-heading-3 text-neutral-900 dark:text-neutral-100">
                      {totalResults} result{totalResults === 1 ? "" : "s"}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <select className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 shadow-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option>Most Relevant</option>
                        <option>Newest First</option>
                        <option>Oldest First</option>
                      </select>
                    </div>
                  </div>

                  {/* Full-Width Meta Result Cards */}
                  <div className="flex flex-col gap-4">
                    {currentItems.map((item, idx) => (
                      <div key={idx} className="w-full">
                        {item.type === "video" ? (
                          <VideoResultCard
                            videoMoment={item.data}
                            query={query}
                            positionIndex={startIndex + idx + 1}
                          />
                        ) : (
                          <LessonResultCard
                            lesson={item.data}
                            query={query}
                            positionIndex={startIndex + idx + 1}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-6">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 shadow-2xs transition hover:bg-neutral-50 dark:hover:bg-neutral-700/60 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-9 w-9 rounded-xl text-sm font-medium transition cursor-pointer ${
                              pageNum === currentPage
                                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs"
                                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 shadow-2xs transition hover:bg-neutral-50 dark:hover:bg-neutral-700/60 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Can't find what you're looking for? */}
                  <div className="mt-12 w-full rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950/40">
                        <SearchX className="h-6 w-6 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Can&apos;t find what you&apos;re looking for?</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Try different keywords or browse our full course catalog.</p>
                      </div>
                    </div>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-2 rounded-full border border-primary-100 dark:border-primary-900/50 bg-white dark:bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-primary-500 dark:text-primary-400 shadow-xs transition hover:bg-primary-50 dark:hover:bg-primary-950/50"
                    >
                      Browse all courses
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <SearchX className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    No results found for &quot;{query}&quot;
                  </h3>
                  <p className="mb-6 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                    We couldn&apos;t find anything matching your search. Try adjusting your keywords or browse our full catalog.
                  </p>
                  <Link
                    href="/courses"
                    className="rounded-full bg-neutral-900 dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 shadow-2xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
                  >
                    Browse Catalog
                  </Link>
                </div>
              )
            ) : (
              <div className="py-20 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Enter a search term to find lessons, courses, and video moments.
              </div>
            )}
          </main>
        </div>

        {/* Ambient Bottom Skyline Graphic Footer */}
        <BottomGraphic />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
