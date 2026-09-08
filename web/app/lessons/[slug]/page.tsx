import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, BarChart2, Users } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { VideoEmbed } from "@/components/lesson/video-embed";
import { LessonViewTracker } from "@/components/lesson/lesson-view-tracker";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LessonContentTabs } from "@/components/lesson/lesson-content-tabs";
import { LessonFooterNav } from "@/components/lesson/lesson-footer-nav";
import { BookmarkButton } from "@/components/course/bookmark-button";
import { sanityFetch } from "@/sanity/lib/client";
import { getLessonWithCourseQuery, getCourseBySlugQuery } from "@/sanity/lib/queries";
import { resolveCurriculum } from "@/lib/utils/curriculum";
import { formatDuration } from "@/lib/utils/format";

interface LessonPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ start?: string }>;
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { slug } = await params;
  return {
    title: `Lesson: ${slug.replace(/-/g, " ")} — Vertex`,
    description: "Watch and learn with Vertex interactive lessons.",
  };
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const rawStart = search?.start ? parseInt(search.start, 10) : 0;
  // Validate: must be a non-negative integer; clamp to 0 if invalid
  const startSeconds = Number.isFinite(rawStart) && rawStart > 0 ? Math.floor(rawStart) : 0;

  // Fetch lesson data and reverse-referenced parent course with ISR caching
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lesson: any = null;
  try {
    lesson = await sanityFetch({
      query: getLessonWithCourseQuery,
      params: { slug },
      tags: ["lessons", `lesson-${slug}`],
      revalidate: 300,
    });
  } catch (err) {
    console.error("Error fetching lesson from Sanity:", err);
  }

  if (!lesson) {
    notFound();
  }

  // If lesson does not have parent course resolved via reverse reference,
  // load the flagship Next.js course as context
  let course = lesson.course;
  if (!course) {
    try {
      course = await sanityFetch({
        query: getCourseBySlugQuery,
        params: { slug: "nextjs-app-router-in-depth" },
        tags: ["courses", "course-nextjs-app-router-in-depth"],
        revalidate: 300,
      });
    } catch (e) {
      console.error("Error fetching fallback course:", e);
    }
  }

  // Resolve curriculum numbering and navigation
  const {
    moduleIndex,
    lessonLabel,
    currentModule,
    prevLesson,
    nextLesson,
  } = resolveCurriculum(course, slug);

  const durationFormatted = lesson.duration
    ? formatDuration(lesson.duration)
    : "18m";

  const studentCountDisplay = lesson.studentCount
    ? `${lesson.studentCount.toLocaleString()} students`
    : "3,426 students";

  const levelDisplay = course?.level
    ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
    : "Intermediate";

  // Fetch progress if authenticated
  let progressPercentage = 0;
  let completedLessonIdsList: string[] = [];
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const authData = await auth();
    const userId = authData?.userId;
    
    if (userId) {
      const progressDoc = await sanityFetch({
        query: `*[_type == "progress" && clerkUserId == $userId][0] { completedLessons }`,
        params: { userId },
        tags: [`progress-${userId}`],
        revalidate: 0,
      }) as any;
      
      if (progressDoc && Array.isArray(progressDoc.completedLessons) && course?.modules) {
        completedLessonIdsList = progressDoc.completedLessons.map((ref: any) => ref._ref).filter(Boolean);
        const completedLessonIdsSet = new Set(completedLessonIdsList);
        const courseLessonIds = course.modules.flatMap((m: any) => m.lessons || []).map((l: any) => l._id).filter(Boolean);
        
        if (courseLessonIds.length > 0) {
          let completedInCourse = 0;
          for (const id of courseLessonIds) {
            if (completedLessonIdsSet.has(id)) {
              completedInCourse++;
            }
          }
          progressPercentage = Math.round((completedInCourse / courseLessonIds.length) * 100);
        }
      }
    }
  } catch (e) {
    console.error("Error fetching progress:", e);
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      {/* Centered Canvas matching 1440px viewport width */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Navbar */}
          <Navbar activePath="/courses" />

          {/* Main 2-Column Layout */}
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
            {/* Left Curriculum Sidebar */}
            <LessonSidebar
              course={course || { title: "Next.js for Production", slug: "nextjs-for-production" }}
              currentLessonSlug={slug}
              activeModuleIndex={moduleIndex}
              progressPercentage={progressPercentage > 0 ? progressPercentage : 0}
              completedLessonIds={completedLessonIdsList}
            />

            {/* Right Lesson Content Area */}
            <main className="flex-1 p-6 sm:p-10 lg:p-12 max-w-5xl">
              {/* ──────────────────────────────────────────────────────────
                 BREADCRUMB
                 ────────────────────────────────────────────────────────── */}
              <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                <Link href="/courses" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  All Courses
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                <Link
                  href={`/courses/${course?.slug || "nextjs-for-production"}`}
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors truncate max-w-[160px] sm:max-w-none"
                >
                  {course?.title || "Next.js for Production"}
                </Link>
                {currentModule && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                    <span className="truncate max-w-[160px] sm:max-w-none">
                      {currentModule.title}
                    </span>
                  </>
                )}
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate" aria-current="page">
                  {lesson.title}
                </span>
              </nav>

              {/* ──────────────────────────────────────────────────────────
                 LESSON HEADER & BADGE
                 ────────────────────────────────────────────────────────── */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="inline-flex items-center rounded-md border border-[#FED7AA] dark:border-primary-500/30 bg-[#FFF5EE] dark:bg-primary-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-[#EA580C] dark:text-primary-400 uppercase select-none">
                    {lessonLabel}
                  </div>
                  <BookmarkButton courseId={lesson._id} />
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight mb-3">
                  {lesson.title}
                </h1>

                {/* Subtitle / intro text */}
                <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg leading-relaxed max-w-3xl mb-5">
                  Learn how Next.js handles data fetching and caching in both Server and Client Components.
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-5 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                    <span>{durationFormatted}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                    <span>{levelDisplay}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                    <span>{studentCountDisplay}</span>
                  </div>
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────────
                 VIDEO PLAYER EMBED
                 ────────────────────────────────────────────────────────── */}
              <LessonViewTracker
                lessonSlug={slug}
                lessonTitle={lesson.title}
                courseSlug={course?.slug}
                duration={lesson.duration}
                startSeconds={startSeconds}
              />
              <div className="mb-8">
                <VideoEmbed
                  videoUrl={lesson.videoUrl}
                  title={lesson.title}
                  startSeconds={startSeconds}
                  nextLessonSlug={nextLesson?.lesson.slug}
                  lessonSlug={slug}
                  courseSlug={course?.slug}
                  freePreview={Boolean(lesson.freePreview)}
                />
              </div>

              {/* ──────────────────────────────────────────────────────────
                 TABS & RICH OVERVIEW CONTENT
                 ────────────────────────────────────────────────────────── */}
              <LessonContentTabs
                overviewNotes={lesson.notes}
                keyPoints={lesson.keyPoints}
                proTip={lesson.proTip}
                resources={lesson.resources}
                lessonSlug={slug}
              />

              {/* ──────────────────────────────────────────────────────────
                 PREVIOUS / NEXT LESSON FOOTER NAV
                 ────────────────────────────────────────────────────────── */}
              <LessonFooterNav prevLesson={prevLesson} nextLesson={nextLesson} courseSlug={course?.slug} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
