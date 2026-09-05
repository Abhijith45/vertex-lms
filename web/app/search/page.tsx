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

interface SearchResults {
  lessons: any[];
  videoMoments: any[];
}

const ITEMS_PER_PAGE = 6;

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
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
          throw new Error(errData.message || errData.error || "Failed to fetch search results");
        }
        const data = await res.json();
        setResults({
          lessons: data.lessons || [],
          videoMoments: data.videoMoments || [],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  // Combine items for ordered pagination
  const allItems: Array<{ type: "video" | "lesson"; data: any }> = [];
  if (results) {
    results.videoMoments.forEach((vm) => allItems.push({ type: "video", data: vm }));
    results.lessons.forEach((l) => allItems.push({ type: "lesson", data: l }));
  }

  const totalResults = allItems.length;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalResults);
  const currentItems = allItems.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] font-sans text-neutral-900 selection:bg-primary-100 selection:text-primary-500">
      {/* Centered White Canvas with 1440px maximum width */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white shadow-xs flex flex-col justify-between">
        <div>
          {/* Top Header / Navigation (Consistent with application) */}
          <Navbar activePath="/search" />

          {/* Main Content Area */}
          <main className="px-6 sm:px-12 lg:px-16 pt-8 pb-20">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Link
                  href="/"
                  className="transition-colors hover:text-neutral-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
                >
                  Home
                </Link>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-800 font-medium" aria-current="page">
                  Search
                </span>
              </div>
            </nav>

            {/* Page Title & Search Input Header (Centered) */}
            <div className="mb-6 text-center">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-5">
                Search Results
              </h1>
              <div className="w-full max-w-3xl mx-auto">
                <SearchInput initialQuery={query} />
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary-500" />
                <p className="text-sm font-medium">Searching lessons, courses, and video moments...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-xs">
                <p className="font-semibold">Search Unavailable</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : results ? (
              totalResults > 0 ? (
                <div className="w-full space-y-4">
                  {/* Result Count and Summary (Compact, no divider lines) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
                    <p className="text-sm text-neutral-600">
                      Found <span className="font-semibold text-neutral-900">{totalResults}</span> result{totalResults === 1 ? "" : "s"} for{" "}
                      <span className="font-semibold text-neutral-900">"{query}"</span>
                    </p>
                    <p className="text-xs text-neutral-500">
                      Showing {startIndex + 1}–{endIndex} of {totalResults} items
                    </p>
                  </div>

                  {/* Full-Width Meta Result Cards */}
                  <div className="flex flex-col gap-4">
                    {currentItems.map((item, idx) => (
                      <div key={idx} className="w-full">
                        {item.type === "video" ? (
                          <VideoResultCard videoMoment={item.data} />
                        ) : (
                          <LessonResultCard lesson={item.data} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-2xs transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
                                ? "bg-neutral-900 text-white shadow-2xs"
                                : "text-neutral-600 hover:bg-neutral-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-2xs transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                    <SearchX className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                    No results found for "{query}"
                  </h3>
                  <p className="mb-6 max-w-md text-sm text-neutral-500">
                    We couldn't find anything matching your search. Try adjusting your keywords or browse our full catalog.
                  </p>
                  <Link
                    href="/courses"
                    className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-neutral-800 transition"
                  >
                    Browse Catalog
                  </Link>
                </div>
              )
            ) : (
              <div className="py-20 text-center text-sm text-neutral-500">
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
        <div className="min-h-screen w-full bg-[#FAF9F6] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
