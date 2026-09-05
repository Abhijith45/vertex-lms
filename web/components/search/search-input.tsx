"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, BookOpen, ArrowRight, X } from "lucide-react";

interface CourseSuggestion {
  title: string;
  slug: string;
  category: string;
}

export function SearchInput({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [courses, setCourses] = useState<CourseSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Map<string, { keywords: string[]; courses: CourseSuggestion[] }>>(new Map());
  const router = useRouter();

  // Sync initialQuery when it changes externally (e.g. navigation), without opening dropdown
  useEffect(() => {
    setQuery(initialQuery);
    setIsOpen(false);
  }, [initialQuery]);

  // Debounced search suggestion fetch with instant client-side cache
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setKeywords([]);
      setCourses([]);
      setIsOpen(false);
      return;
    }

    // Only fetch suggestions if user is actively focused in the search input
    if (!isFocused) {
      setIsOpen(false);
      return;
    }

    const cacheKey = trimmed.toLowerCase();
    const cached = cacheRef.current.get(cacheKey);

    // Instant cache hit: render immediately without network delay or spinner
    if (cached) {
      setKeywords(cached.keywords);
      setCourses(cached.courses);
      if (document.activeElement === inputRef.current) {
        setIsOpen(cached.keywords.length > 0 || cached.courses.length > 0);
      }
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
          cacheRef.current.set(cacheKey, { keywords: nextKeywords, courses: nextCourses });
          setKeywords(nextKeywords);
          setCourses(nextCourses);
          // Only display dropdown if the input is still active/focused
          if (document.activeElement === inputRef.current) {
            setIsOpen(nextKeywords.length > 0 || nextCourses.length > 0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isFocused]);

  // Click outside to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allItems = [
    ...keywords.map((k) => ({ type: "keyword" as const, value: k })),
    ...courses.map((c) => ({ type: "course" as const, value: c })),
  ];

  const handleClear = () => {
    setQuery("");
    setKeywords([]);
    setCourses([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelectKeyword = (selectedText: string) => {
    setQuery(selectedText);
    setIsOpen(false);
    setIsFocused(false);
    inputRef.current?.blur();
    router.push(`/search?q=${encodeURIComponent(selectedText)}`);
  };

  const handleSelectCourse = (slug: string) => {
    setIsOpen(false);
    setIsFocused(false);
    inputRef.current?.blur();
    router.push(`/courses/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    setIsFocused(false);
    inputRef.current?.blur();
    if (selectedIndex >= 0 && selectedIndex < allItems.length) {
      const selected = allItems[selectedIndex];
      if (selected.type === "keyword") {
        handleSelectKeyword(selected.value);
      } else {
        handleSelectCourse(selected.value.slug);
      }
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || allItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (keywords.length > 0 || courses.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            // Keep blur soft to allow item click events to register
            setTimeout(() => {
              if (document.activeElement !== inputRef.current) {
                setIsFocused(false);
              }
            }, 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for concepts, courses, or specific moments..."
          className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-5 pr-20 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        
        {/* Actions container: Clear 'X' button + Submit search button */}
        <div className="absolute right-1 top-0 flex h-full items-center gap-1 pr-2.5">
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search query"
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            aria-label="Search"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (keywords.length > 0 || courses.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Keywords Section */}
          {keywords.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Suggested Keywords
              </div>
              <ul className="space-y-0.5">
                {keywords.map((kw, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectKeyword(kw)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                      idx === selectedIndex
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="h-3.5 w-3.5 text-gray-400" />
                      <span>{kw}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">Search</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Courses Section */}
          {courses.length > 0 && (
            <div className={keywords.length > 0 ? "mt-2 border-t border-gray-100 pt-2" : ""}>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Courses
              </div>
              <ul className="space-y-1">
                {courses.map((course, idx) => {
                  const overallIndex = keywords.length + idx;
                  const isSelected = selectedIndex === overallIndex;
                  return (
                    <li
                      key={course.slug || idx}
                      onClick={() => handleSelectCourse(course.slug)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-sm transition-all border ${
                        isSelected
                          ? "border-blue-300 bg-blue-50/50"
                          : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {course.title}
                          </p>
                          <p className="text-[11px] text-gray-500">{course.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
