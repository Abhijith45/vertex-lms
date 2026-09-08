"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Filter } from "lucide-react";
import { HomeCourseCard } from "@/components/home/home-course-card";
import { CourseIcon } from "@/components/home/course-icons";
import posthog from "posthog-js";

export interface CourseCatalogItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  level: string;
  duration: string;
  modulesCount: number;
  popular?: boolean;
  studentCount?: number;
  category?: {
    title: string;
    slug: string;
  };
}

export interface CategoryItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

interface CoursesCatalogViewProps {
  courses: CourseCatalogItem[];
  categories: CategoryItem[];
}

export function CoursesCatalogView({
  courses,
  categories,
}: CoursesCatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  function handleCategorySelect(slug: string, label: string) {
    setSelectedCategory(slug);
    posthog.capture("course_catalog_filtered", {
      category_slug: slug,
      category_label: label,
    });
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (value.trim().length > 2) {
      posthog.capture("course_catalog_searched", {
        query_length: value.trim().length,
      });
    }
  }

  function handleResetFilters() {
    setSelectedCategory("all");
    setSearchQuery("");
    posthog.capture("course_filters_reset", {
      previous_category: selectedCategory,
      had_search_query: searchQuery.trim().length > 0,
    });
  }

  // Calculate course counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: courses.length };
    courses.forEach((c) => {
      const catSlug = c.category?.slug;
      if (catSlug) {
        counts[catSlug] = (counts[catSlug] || 0) + 1;
      }
    });
    return counts;
  }, [courses]);

  // Filter courses based on active category and search query
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Category filter
      if (selectedCategory !== "all" && course.category?.slug !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesSummary = course.summary?.toLowerCase().includes(query);
        const matchesCategory = course.category?.title?.toLowerCase().includes(query);
        return matchesTitle || matchesSummary || matchesCategory;
      }

      return true;
    });
  }, [courses, selectedCategory, searchQuery]);

  return (
    <div>
      {/* ──────────────────────────────────────────────────────────
         SEARCH & FILTER TOOLBAR
         ────────────────────────────────────────────────────────── */}
      <div className="mb-10 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400 dark:text-neutral-500">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search courses by title, topic, or keyword..."
            className="w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 py-3.5 pl-11 pr-10 text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-2xs transition-all focus:border-primary-400 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-3 focus:ring-primary-100 dark:focus:ring-primary-950"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
          {/* "All" button */}
          <button
            type="button"
            onClick={() => handleCategorySelect("all", "All Courses")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
              selectedCategory === "all"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs"
                : "border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <span>All Courses</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] font-semibold ${
                selectedCategory === "all"
                  ? "bg-neutral-700 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-800"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {categoryCounts.all || 0}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = categoryCounts[cat.slug] || 0;

            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategorySelect(cat.slug, cat.title)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#EA580C] text-white shadow-xs"
                    : "border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <span>{cat.title}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[11px] font-semibold ${
                      isSelected
                        ? "bg-[#C2410C] text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
         RESULTS COUNT & SUMMARY
         ────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
        <span>
          Showing <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">{filteredCourses.length}</strong>{" "}
          {filteredCourses.length === 1 ? "course" : "courses"}
          {selectedCategory !== "all" && (
            <>
              {" "}in{" "}
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {categories.find((c) => c.slug === selectedCategory)?.title}
              </span>
            </>
          )}
        </span>

        {(selectedCategory !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
         COURSES GRID
         ────────────────────────────────────────────────────────── */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCourses.map((c) => (
            <HomeCourseCard
              key={c.slug}
              href={`/courses/${c.slug}`}
              icon={<CourseIcon slug={c.slug} title={c.title} />}
              title={c.title}
              description={c.summary}
              level={c.level}
              duration={c.duration}
              modules={c.modulesCount}
              category={c.category?.title}
              popular={c.popular}
            />
          ))}
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────
           EMPTY STATE
           ────────────────────────────────────────────────────────── */
        <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-12 text-center my-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 mb-4">
            <Filter className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            No courses found
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mx-auto mb-6">
            We couldn&apos;t find any courses matching &ldquo;{searchQuery}&rdquo; in this category.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer shadow-xs transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
