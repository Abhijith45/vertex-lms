import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { BottomGraphic } from "@/components/home/bottom-graphic";
import { CoursesCatalogView, type CourseCatalogItem, type CategoryItem } from "@/components/courses/courses-catalog-view";
import { sanityFetch } from "@/sanity/lib/client";
import { getCoursesQuery, getCategoriesQuery } from "@/sanity/lib/queries";
import { formatDuration } from "@/lib/utils/format";

export const metadata = {
  title: "All Courses | Vertex",
  description: "Browse the complete catalog of in-depth engineering courses.",
};

export default async function AllCoursesPage() {
  // Fetch courses and categories in parallel from Sanity with ISR caching
  let rawCourses: any[] = [];
  let rawCategories: any[] = [];

  try {
    const [coursesRes, categoriesRes] = await Promise.all([
      sanityFetch({ query: getCoursesQuery, tags: ["courses"], revalidate: 300 }),
      sanityFetch({ query: getCategoriesQuery, tags: ["categories"], revalidate: 300 }),
    ]);
    rawCourses = coursesRes || [];
    rawCategories = categoriesRes || [];
  } catch (error) {
    console.error("Error fetching courses catalog data from Sanity:", error);
  }

  // Format courses data for client view
  const processedCourses: CourseCatalogItem[] = rawCourses.map((c) => {
    const totalSeconds =
      c.modules?.flatMap((m: any) => m.lessons || []).reduce(
        (acc: number, l: any) => acc + (l?.duration || 0),
        0
      ) || 0;

    const levelDisplay = c.level
      ? c.level.charAt(0).toUpperCase() + c.level.slice(1)
      : "Intermediate";

    return {
      _id: c._id,
      title: c.title,
      slug: c.slug,
      summary: c.summary,
      level: levelDisplay,
      duration: totalSeconds > 0 ? formatDuration(totalSeconds) : "12h 30m",
      modulesCount: c.modulesCount || c.modules?.length || 4,
      popular: c.popular,
      studentCount: c.studentCount,
      category: c.category
        ? {
            title: c.category.title,
            slug: c.category.slug,
          }
        : undefined,
    };
  });

  const categories: CategoryItem[] = rawCategories.map((cat) => ({
    _id: cat._id,
    title: cat.title,
    slug: cat.slug,
    description: cat.description,
  }));

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      {/* Centered White Canvas with 1440px viewport width */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header / Navigation */}
          <Navbar activePath="/courses" />

          {/* Main Content Area */}
          <main className="px-6 sm:px-12 lg:px-16 pt-8 pb-24">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link
                href="/"
                className="transition-colors hover:text-neutral-900 dark:hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
              >
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                Courses
              </span>
            </nav>

            {/* Page Title & Intro */}
            <div className="mb-10 max-w-3xl">
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-4">
                All Courses
              </h1>
              <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Explore in-depth engineering courses covering modern frontend architecture, AI systems, backend infrastructure, and security.
              </p>
            </div>

            {/* Interactive Catalog View */}
            <CoursesCatalogView
              courses={processedCourses}
              categories={categories}
            />
          </main>
        </div>

        {/* Ambient Bottom Skyline Graphic */}
        <BottomGraphic />
      </div>
    </div>
  );
}
