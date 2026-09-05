import React from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { HeroSearch } from "@/components/home/hero-search";
import { HomeCourseCard } from "@/components/home/home-course-card";
import { CourseIcon } from "@/components/home/course-icons";
import { BottomGraphic } from "@/components/home/bottom-graphic";
import { ExploreCoursesButton } from "@/components/home/explore-courses-button";
import { sanityFetch } from "@/sanity/lib/client";
import { getCoursesQuery } from "@/sanity/lib/queries";
import { formatDuration } from "@/lib/utils/format";

export default async function HomePage() {
  // Fetch live courses from Sanity with ISR caching
  let courses: any[] = [];
  try {
    courses = await sanityFetch({
      query: getCoursesQuery,
      tags: ["courses"],
      revalidate: 300,
    });
  } catch (error) {
    console.error("Error fetching courses for home page:", error);
  }

  // Fallback courses if Sanity fetch fails or is empty
  const fallbackCourses = [
    {
      title: "Next.js for Production",
      slug: "nextjs-app-router-in-depth",
      summary: "Build scalable, high-performance web applications with Next.js.",
      level: "Intermediate",
      duration: "18h 24m",
      modulesCount: 12,
      popular: true,
      category: "Web Development",
    },
    {
      title: "DevOps with Docker & Kubernetes",
      slug: "devops-with-docker-and-kubernetes",
      summary: "Containerize applications and streamline your development workflow.",
      level: "Beginner",
      duration: "10h 12m",
      modulesCount: 8,
      popular: false,
      category: "Backend & Infrastructure",
    },
    {
      title: "TypeScript for Application Developers",
      slug: "typescript-for-application-developers",
      summary: "Go beyond the basics and write safer, more expressive code.",
      level: "Intermediate",
      duration: "14h 36m",
      modulesCount: 10,
      popular: false,
      category: "Languages",
    },
  ];

  // Select 3 featured courses for the home page (prioritize Next.js, Docker, TypeScript if available)
  const displayCourses =
    courses && courses.length > 0
      ? courses.slice(0, 3).map((c) => {
          // Compute total duration from lessons
          const totalSeconds =
            c.modules?.flatMap((m: any) => m.lessons || []).reduce(
              (acc: number, l: any) => acc + (l?.duration || 0),
              0
            ) || 0;

          const levelDisplay = c.level
            ? c.level.charAt(0).toUpperCase() + c.level.slice(1)
            : "Intermediate";

          return {
            title: c.title,
            slug: c.slug,
            summary: c.summary,
            level: levelDisplay,
            duration: totalSeconds > 0 ? formatDuration(totalSeconds) : "12h 30m",
            modulesCount: c.modulesCount || c.modules?.length || 4,
            popular: c.popular,
            category: c.category?.title,
          };
        })
      : fallbackCourses;

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] font-sans text-neutral-900 selection:bg-primary-100 selection:text-primary-500">
      {/* Centered White Canvas with 1440px viewport width */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white shadow-xs flex flex-col justify-between">
        <div>
          {/* Top Header / Navigation (Search input removed on home page) */}
          <Navbar activePath="/" showSearch={false} />

          {/* ──────────────────────────────────────────────────────────
             HERO SECTION
             ────────────────────────────────────────────────────────── */}
          <section className="px-6 pt-16 pb-14 text-center sm:px-12 lg:px-16 md:pt-20 md:pb-16">
            {/* Intelligent Learning Pill */}
            <div className="inline-flex items-center rounded-full border border-[#FED7AA] bg-[#FFF5EE] px-4 py-1.5 text-[11px] font-bold tracking-widest text-[#EA580C] uppercase shadow-2xs mb-7 select-none">
              INTELLIGENT LEARNING
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-[62px] leading-[1.14] max-w-4xl mx-auto">
              Search your learning <br className="hidden sm:inline" />
              in plain English.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Vertex understands what you want to learn and finds the exact
              lessons across all your courses.
            </p>

            {/* Explore Courses Button */}
            <div className="mt-8 flex justify-center">
              <ExploreCoursesButton />
            </div>

            {/* Interactive Search Bar */}
            <HeroSearch />
          </section>

          {/* ──────────────────────────────────────────────────────────
             ALL COURSES SECTION (Wired to Sanity)
             ────────────────────────────────────────────────────────── */}
          <section className="px-6 py-8 sm:px-12 lg:px-16">
            {/* Section Title & Link */}
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-display text-2xl sm:text-[28px] font-bold text-neutral-900 tracking-tight">
                All Courses
              </h2>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 transition-colors hover:text-[#EA580C] group"
              >
                <span>View all courses</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {displayCourses.map((c, idx) => (
                <HomeCourseCard
                  key={c.slug || idx}
                  href={`/courses/${c.slug}`}
                  icon={<CourseIcon slug={c.slug} title={c.title} />}
                  title={c.title}
                  description={c.summary}
                  level={c.level}
                  duration={c.duration}
                  modules={c.modulesCount}
                  category={c.category}
                  popular={c.popular}
                />
              ))}
            </div>

            {/* ──────────────────────────────────────────────────────────
               WEEKLY UPDATES DIVIDER
               ────────────────────────────────────────────────────────── */}
            <div className="relative my-16 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-neutral-200/80" />
              </div>
              <div className="relative flex items-center gap-2 bg-white px-5 text-sm text-neutral-600 font-normal">
                <Star
                  className="h-4 w-4 text-primary-500 fill-transparent"
                  strokeWidth={1.75}
                />
                <span>New courses and lessons added every week.</span>
              </div>
            </div>
          </section>
        </div>

        {/* ──────────────────────────────────────────────────────────
           BOTTOM SKYLINE ARTWORK
           ────────────────────────────────────────────────────────── */}
        <BottomGraphic />
      </div>
    </div>
  );
}
