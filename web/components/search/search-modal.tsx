"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, TrendingUp, BookOpen, ArrowRight, CornerDownLeft } from "lucide-react";
import posthog from "posthog-js";

interface CourseSuggestion {
  title: string;
  slug: string;
  category: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function SearchModal({ isOpen, onClose, initialQuery = "" }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [courses, setCourses] = useState<CourseSuggestion[]>([]);
  const [trending, setTrending] = useState<string[]>([
    "Next.js",
    "Docker",
    "TypeScript",
    "System Design",
    "Server Components",
    "AI Engineering",
    "PostgreSQL",
    "Web Security",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Map<string, { keywords: string[]; courses: CourseSuggestion[]; trending?: string[] }>>(new Map());

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Fetch suggestions with instant client cache & debounce
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setKeywords([]);
      setCourses([]);
      return;
    }

    const cacheKey = trimmed.toLowerCase();
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setKeywords(cached.keywords);
      setCourses(cached.courses);
      if (cached.trending) setTrending(cached.trending);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          const nextKeywords = data.keywords || [];
          const nextCourses = data.courses || [];
          cacheRef.current.set(cacheKey, {
            keywords: nextKeywords,
            courses: nextCourses,
            trending: data.trending,
          });
          setKeywords(nextKeywords);
          setCourses(nextCourses);
          if (data.trending) setTrending(data.trending);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten items for keyboard navigation
  const allItems: Array<{ type: "keyword" | "course"; value: any }> = [
    ...keywords.map((k) => ({ type: "keyword" as const, value: k })),
    ...courses.map((c) => ({ type: "course" as const, value: c })),
  ];

  const handleSelectKeyword = (keyword: string) => {
    posthog.capture("search_suggestion_selected", {
      suggestion_type: "keyword",
      value: keyword,
      query: query.trim(),
      source: "search_modal",
    });
    onClose();
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const handleSelectCourse = (slug: string) => {
    posthog.capture("search_suggestion_selected", {
      suggestion_type: "course",
      course_slug: slug,
      query: query.trim(),
      source: "search_modal",
    });
    onClose();
    router.push(`/courses/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < allItems.length) {
      const selected = allItems[selectedIndex];
      if (selected.type === "keyword") {
        handleSelectKeyword(selected.value);
      } else {
        handleSelectCourse(selected.value.slug);
      }
    } else if (query.trim()) {
      posthog.capture("search_submitted", {
        query: query.trim(),
        query_length: query.trim().length,
        source: "search_modal",
      });
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (allItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:pt-24 backdrop-blur-sm bg-black/40 transition-opacity animate-in fade-in duration-150">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal dialog */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center border-b border-neutral-100 px-5 py-4"
        >
          <Search className="h-5 w-5 text-neutral-400 shrink-0 mr-3" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search for lessons, topics, courses, or moments..."
            className="w-full bg-transparent text-base text-neutral-900 placeholder:text-neutral-400 outline-none font-normal"
          />
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-primary-500 shrink-0 mr-2" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded-md transition-colors mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-mono text-neutral-400 hover:text-neutral-600 select-none"
          >
            ESC
          </button>
        </form>

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-100">
          {/* Default / Trending Searches when query is empty or short */}
          {query.trim().length < 2 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectKeyword(item);
                    }}
                    onClick={() => handleSelectKeyword(item)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 cursor-pointer"
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Search Suggestions */}
          {query.trim().length >= 2 && (
            <div className="space-y-4">
              {/* Section 1: Keywords */}
              {keywords.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                    Keywords & Lessons
                  </div>
                  <ul className="space-y-1">
                    {keywords.map((kw, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <li
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectKeyword(kw);
                          }}
                          onClick={() => handleSelectKeyword(kw)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary-50 text-primary-600 font-medium"
                              : "text-neutral-800 hover:bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                            <span>{kw}</span>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-neutral-400">
                            Search <CornerDownLeft className="h-3 w-3" />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Section 2: Courses */}
              {courses.length > 0 && (
                <div className="pt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                    Courses
                  </div>
                  <ul className="space-y-1.5">
                    {courses.map((course, idx) => {
                      const overallIndex = keywords.length + idx;
                      const isSelected = selectedIndex === overallIndex;
                      return (
                        <li
                          key={course.slug || idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectCourse(course.slug);
                          }}
                          onClick={() => handleSelectCourse(course.slug)}
                          className={`flex items-center justify-between rounded-xl p-3 text-sm cursor-pointer border transition-all ${
                            isSelected
                              ? "border-primary-300 bg-primary-50/50 shadow-xs"
                              : "border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900 leading-tight">
                                {course.title}
                              </p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                {course.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-primary-500">
                            <span>Open course</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Empty state when query produces no matches */}
              {!isLoading && keywords.length === 0 && courses.length === 0 && (
                <div className="py-8 text-center text-sm text-neutral-500">
                  <p>No direct suggestions found for "{query}".</p>
                  <button
                    type="button"
                    onClick={() => handleSelectKeyword(query)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:underline cursor-pointer"
                  >
                    <span>Press Enter to perform full search</span>
                    <CornerDownLeft className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/70 px-5 py-3 text-xs text-neutral-400">
          <span>Search Vertex learning catalog</span>
          <div className="flex items-center gap-3">
            <span>Navigate <kbd className="font-mono">↑↓</kbd></span>
            <span>Select <kbd className="font-mono">↵</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}
