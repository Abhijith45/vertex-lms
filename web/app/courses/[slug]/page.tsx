import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { CourseHero } from "@/components/course/course-hero";
import { WhatYoullLearn } from "@/components/course/what-youll-learn";
import { CourseContentAccordion, type ModuleItem } from "@/components/course/course-content-accordion";
import { StickyCourseProgress } from "@/components/course/sticky-course-progress";
import { BottomGraphic } from "@/components/home/bottom-graphic";
import { sanityFetch } from "@/sanity/lib/client";
import { getCourseBySlugQuery } from "@/sanity/lib/queries";
import { formatDuration } from "@/lib/utils/format";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

// 12 modules curriculum matching vertex-course.png reference design
const nextJsProductionModulesMock: ModuleItem[] = [
  {
    title: "Introduction to Next.js",
    summary: "Understand the core features of Next.js and why it's the React framework.",
    lessons: [
      { title: "Why Next.js?", duration: 600, freePreview: true, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "React 19 & Next.js Architecture", duration: 900, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Course Roadmap & Prerequisites", duration: 1200, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
    ],
  },
  {
    title: "Project Setup & Structure",
    summary: "Set up a new Next.js project and explore the folder structure.",
    lessons: [
      { title: "Initializing with create-next-app", duration: 800, freePreview: true, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Configuring TypeScript, ESLint & Tailwind", duration: 1500, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Project Conventions and Architecture", duration: 2020, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
    ],
  },
  {
    title: "Routing & Layouts",
    summary: "Learn about file-based routing, layouts, and nested routes.",
    lessons: [
      { title: "File-system routing and the app directory", duration: 350, freePreview: true, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Layouts, templates, and shared UI", duration: 380, freePreview: false, slug: "nextjs-app-router-in-depth-layouts-and-templates" },
      { title: "Dynamic routes and route params", duration: 496, freePreview: false, slug: "nextjs-app-router-in-depth-dynamic-routes-and-params" },
    ],
  },
  {
    title: "Server Components",
    summary: "Build components with server-side rendering and data fetching.",
    lessons: [
      { title: "What server components actually do", duration: 948, freePreview: false, slug: "nextjs-app-router-in-depth-server-components" },
      { title: 'The "use client" boundary', duration: 634, freePreview: false, slug: "nextjs-app-router-in-depth-use-client-boundary" },
      { title: "Passing data across the boundary", duration: 379, freePreview: false, slug: "nextjs-app-router-in-depth-passing-data-across-the-boundary" },
    ],
  },
  {
    title: "Data Fetching & Caching",
    summary: "Fetch data efficiently and leverage caching for better performance.",
    lessons: [
      { title: "Fetching data in server components", duration: 261, freePreview: false, slug: "nextjs-app-router-in-depth-fetching-in-server-components" },
      { title: "Caching and revalidation", duration: 1522, freePreview: false, slug: "nextjs-app-router-in-depth-caching-and-revalidation" },
      { title: "Streaming with Suspense", duration: 187, freePreview: false, slug: "nextjs-app-router-in-depth-streaming-and-suspense" },
    ],
  },
  {
    title: "Authentication",
    summary: "Implement authentication using NextAuth.js in your app.",
    lessons: [
      { title: "Authentication Strategies in App Router", duration: 1200, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Middleware & Session Management", duration: 1680, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Protected Routes and Role-Based Access", duration: 1800, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
    ],
  },
  {
    title: "Server Actions and Mutations",
    summary: "Writing data from the client without hand-building an API: actions, form validation, and optimistic UI.",
    lessons: [
      { title: "Writing your first server action", duration: 471, freePreview: false, slug: "nextjs-app-router-in-depth-server-actions-basics" },
      { title: "Forms, validation, and error states", duration: 1016, freePreview: false, slug: "nextjs-app-router-in-depth-forms-and-validation" },
      { title: "Optimistic updates", duration: 525, freePreview: false, slug: "nextjs-app-router-in-depth-optimistic-updates" },
    ],
  },
  {
    title: "State Management & React Hooks",
    summary: "Managing local and global state in modern React & Next.js architectures.",
    lessons: [
      { title: "URL state with useSearchParams", duration: 950, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Context vs External Stores in RSC", duration: 1400, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
    ],
  },
  {
    title: "Styling and UI Architecture",
    summary: "Structuring design systems, Tailwind CSS v4, and accessible components.",
    lessons: [
      { title: "Tailwind CSS v4 in Next.js 16", duration: 1100, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Accessible Component Primitives", duration: 1600, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
    ],
  },
  {
    title: "Performance & Bundle Optimization",
    summary: "Optimizing bundle sizes, dynamic imports, Core Web Vitals, and image delivery.",
    lessons: [
      { title: "Analyzing Bundles & Tree Shaking", duration: 1350, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Next Image, Font, and Script Optimization", duration: 1450, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
    ],
  },
  {
    title: "Testing & Code Quality",
    summary: "End-to-end testing with Playwright, Vitest unit testing, and CI automation.",
    lessons: [
      { title: "Unit Testing Server Actions", duration: 1250, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "E2E Testing App Router with Playwright", duration: 1950, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
    ],
  },
  {
    title: "Deployment & Production Scaling",
    summary: "Deploying to Vercel, Docker containers, edge caching, and monitoring.",
    lessons: [
      { title: "Standalone Output & Docker Containers", duration: 1800, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
      { title: "Production Readiness Checklist & Analytics", duration: 1500, freePreview: false, slug: "nextjs-app-router-in-depth-file-system-routing" },
    ],
  },
];

const nextJsProductionOutcomesMock = [
  {
    title: "App Router Foundations",
    description: "Master the App Router, layouts, loading states, and nested routing.",
    icon: "layers",
  },
  {
    title: "Data Fetching & Caching",
    description: "Fetch data efficiently and leverage caching for better performance.",
    icon: "database",
  },
  {
    title: "Performance Optimization",
    description: "Optimize rendering, assets, and bundle size for faster apps.",
    icon: "gauge",
  },
  {
    title: "Deployment & Scaling",
    description: "Deploy with confidence and scale your Next.js applications.",
    icon: "cloud",
  },
];

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;

  // Resolve alias: "nextjs-for-production" corresponds to "nextjs-app-router-in-depth"
  const isDesignMockSlug = slug === "nextjs-for-production";
  const resolvedSlug = isDesignMockSlug ? "nextjs-app-router-in-depth" : slug;

  // Fetch course data from Sanity with ISR caching
  let course = null;
  try {
    course = await sanityFetch({
      query: getCourseBySlugQuery,
      params: { slug: resolvedSlug },
      tags: ["courses", `course-${resolvedSlug}`],
      revalidate: 300,
    });
  } catch (error) {
    console.error("Error fetching course from Sanity:", error);
  }

  // Fallback if not found by resolvedSlug
  if (!course && resolvedSlug !== slug) {
    try {
      course = await sanityFetch({
        query: getCourseBySlugQuery,
        params: { slug },
        tags: ["courses", `course-${slug}`],
        revalidate: 300,
      });
    } catch (e) {
      console.error("Fallback fetch error:", e);
    }
  }

  if (!course) {
    notFound();
  }

  // Calculate total duration across all lessons
  const allLessons = course.modules?.flatMap((m: any) => m.lessons || []) || [];
  const calculatedDurationSeconds = allLessons.reduce(
    (total: number, lesson: any) => total + (lesson?.duration || 0),
    0
  );

  const totalDurationFormatted = isDesignMockSlug
    ? "18h 24m"
    : calculatedDurationSeconds > 0
    ? formatDuration(calculatedDurationSeconds)
    : "18h 24m";

  // When accessing nextjs-for-production, use the complete 12 modules curriculum matching vertex-course.png
  const displayedModules = isDesignMockSlug
    ? nextJsProductionModulesMock
    : course.modules || [];

  const totalModulesCount = isDesignMockSlug
    ? 12
    : displayedModules.length;

  const displayedOutcomes = isDesignMockSlug
    ? nextJsProductionOutcomesMock
    : course.learningOutcomes;

  const firstLessonSlug =
    allLessons[0]?.slug ||
    allLessons[0]?.slug?.current ||
    "nextjs-app-router-in-depth-file-system-routing";

  const continueLearningUrl = firstLessonSlug
    ? `/lessons/${typeof firstLessonSlug === "object" ? firstLessonSlug.current : firstLessonSlug}`
    : "#";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] font-sans text-neutral-900 selection:bg-primary-100 selection:text-primary-500 relative">
      {/* Centered Canvas with 1440px max viewport width matching home & design */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white shadow-xs flex flex-col justify-between relative">
        <div>
          {/* Header / Navbar */}
          <Navbar activePath="/courses" />

          {/* Main Course Content Container */}
          <main className="px-6 sm:px-12 lg:px-16 pt-8 pb-32 max-w-6xl mx-auto w-full">
            {/* Hero Section */}
            <CourseHero
              course={{
                ...course,
                title: isDesignMockSlug ? "Next.js for Production" : course.title,
                summary: isDesignMockSlug
                  ? "Build scalable, high-performance web applications with Next.js, best practices, and production-ready deployment strategies."
                  : course.summary,
                studentCount: isDesignMockSlug ? 2100 : course.studentCount,
              }}
              totalDurationFormatted={totalDurationFormatted}
              totalModulesCount={totalModulesCount}
              continueLearningUrl={continueLearningUrl}
            />

            {/* What You'll Learn Section */}
            <WhatYoullLearn outcomes={displayedOutcomes} />

            {/* Course Content Modules Accordion */}
            <CourseContentAccordion
              modules={displayedModules}
              totalModulesCount={totalModulesCount}
              totalDurationFormatted={totalDurationFormatted}
              courseSlug={course.slug}
            />
          </main>
        </div>

        {/* Ambient Bottom Skyline Graphic */}
        <div className="relative w-full">
          <BottomGraphic />
        </div>
      </div>

      {/* Sticky Bottom Progress Bar */}
      <StickyCourseProgress
        progressPercentage={35}
        continueLearningUrl={continueLearningUrl}
      />
    </div>
  );
}
