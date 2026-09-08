import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { BottomGraphic } from "@/components/home/bottom-graphic";
import { Footer } from "@/components/layout/footer";
import { MyLearningHero } from "@/components/my-learning/my-learning-hero";
import { InProgressCard, type InProgressCourseData } from "@/components/my-learning/in-progress-card";
import { CompletedCourseCard, type CompletedCourseData } from "@/components/my-learning/completed-course-card";
import { BookmarkedCourseCard, type BookmarkedCourseData } from "@/components/my-learning/bookmarked-course-card";
import { EmptyLearningState } from "@/components/my-learning/empty-learning-state";
import { serverClient } from "@/sanity/lib/client";
import { formatDuration } from "@/lib/utils/format";

export const metadata = {
  title: "My Learning — Vertex",
  description: "Track your course progress, resume lessons, and manage your learning journey.",
};

interface ProgressQueryResponse {
  progress?: {
    _id?: string;
    completedLessons?: Array<{
      _id: string;
      title: string;
      slug: string;
      duration?: number;
    }>;
    resumePositions?: Array<{
      _key: string;
      positionSeconds: number;
      lesson?: {
        _id: string;
        title: string;
        slug: string;
        duration?: number;
        course?: {
          _id: string;
          title: string;
          slug: string;
        };
      };
    }>;
    bookmarkedCourses?: Array<{
      _id: string;
      title: string;
      slug: string;
      summary?: string;
      level?: string;
      category?: {
        title?: string;
      };
      modules?: Array<{
        lessons?: Array<{
          _id: string;
          duration?: number;
        }>;
      }>;
    }>;
  } | null;
  courses: Array<{
    _id: string;
    title: string;
    slug: string;
    summary?: string;
    level?: string;
    category?: {
      title?: string;
    };
    modules?: Array<{
      title: string;
      lessons?: Array<{
        _id: string;
        title: string;
        slug: string;
        duration?: number;
      }>;
    }>;
  }>;
}

const myLearningQuery = `
{
  "progress": *[_type == "progress" && clerkUserId == $userId][0] {
    _id,
    completedLessons[]->{
      _id,
      title,
      "slug": slug.current,
      duration
    },
    resumePositions[]{
      _key,
      positionSeconds,
      lesson->{
        _id,
        title,
        "slug": slug.current,
        duration,
        "course": *[_type == "course" && references(^._id)][0]{
          _id,
          title,
          "slug": slug.current
        }
      }
    },
    "bookmarkedCourses": coalesce(bookmarkedCourses[]->{
      _id,
      title,
      "slug": slug.current,
      summary,
      level,
      category->{
        title
      },
      modules[]{
        lessons[]->{
          _id,
          duration
        }
      }
    }, [])
  },
  "courses": *[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    level,
    category->{
      title
    },
    modules[]{
      title,
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        duration
      }
    }
  }
}
`;

export default async function MyLearningPage() {
  const authData = await auth();
  const userId = authData?.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser().catch(() => null);
  const userName = clerkUser?.firstName || clerkUser?.username || null;

  let queryData: ProgressQueryResponse = { progress: null, courses: [] };
  try {
    queryData = await serverClient.fetch<ProgressQueryResponse>(
      myLearningQuery,
      { userId },
      { cache: "no-store" }
    );
  } catch (err) {
    console.error("Error loading My Learning data:", err);
  }

  const { progress, courses } = queryData;

  // Build sets & maps for fast lookups
  const completedLessonIdSet = new Set(
    (progress?.completedLessons || []).map((l) => l._id).filter(Boolean)
  );

  const resumeMapByLessonId = new Map<string, number>();
  for (const pos of progress?.resumePositions || []) {
    if (pos.lesson?._id && typeof pos.positionSeconds === "number") {
      resumeMapByLessonId.set(pos.lesson._id, pos.positionSeconds);
    }
  }

  const inProgressList: InProgressCourseData[] = [];
  const completedList: CompletedCourseData[] = [];

  for (const c of courses) {
    const courseLessons = (c.modules || [])
      .flatMap((m) => m.lessons || [])
      .filter((l): l is { _id: string; title: string; slug: string; duration?: number } => Boolean(l && l._id));

    if (courseLessons.length === 0) continue;

    // Calculate duration
    const totalDurationSeconds = courseLessons.reduce(
      (acc, l) => acc + (l.duration || 0),
      0
    );
    const totalDurationText =
      totalDurationSeconds > 0 ? formatDuration(totalDurationSeconds) : "2h 30m";

    // Calculate completed count
    let completedInCourse = 0;
    for (const l of courseLessons) {
      if (completedLessonIdSet.has(l._id)) {
        completedInCourse++;
      }
    }

    // Find resume target
    let courseResumeLesson: InProgressCourseData["resumeLesson"] = null;

    // Check if any lesson in this course has a tracked resume position
    for (const l of courseLessons) {
      if (resumeMapByLessonId.has(l._id)) {
        courseResumeLesson = {
          title: l.title,
          slug: l.slug,
          positionSeconds: resumeMapByLessonId.get(l._id) || 0,
        };
        break;
      }
    }

    // If no resume position but user completed some lessons, target the first uncompleted lesson
    if (!courseResumeLesson && completedInCourse > 0 && completedInCourse < courseLessons.length) {
      const nextUncompleted = courseLessons.find((l) => !completedLessonIdSet.has(l._id));
      if (nextUncompleted) {
        courseResumeLesson = {
          title: nextUncompleted.title,
          slug: nextUncompleted.slug,
          positionSeconds: 0,
        };
      }
    }

    const progressPercentage = Math.round((completedInCourse / courseLessons.length) * 100);
    const levelDisplay = c.level
      ? c.level.charAt(0).toUpperCase() + c.level.slice(1)
      : "Intermediate";

    if (completedInCourse === courseLessons.length) {
      completedList.push({
        courseId: c._id,
        courseTitle: c.title,
        courseSlug: c.slug,
        category: c.category?.title,
        level: levelDisplay,
        totalLessons: courseLessons.length,
        firstLessonSlug: courseLessons[0]?.slug,
      });
    } else if (completedInCourse > 0 || courseResumeLesson) {
      inProgressList.push({
        courseId: c._id,
        courseTitle: c.title,
        courseSlug: c.slug,
        category: c.category?.title,
        level: levelDisplay,
        totalDurationText,
        totalLessons: courseLessons.length,
        completedLessonsCount: completedInCourse,
        progressPercentage,
        resumeLesson: courseResumeLesson,
      });
    }
  }

  const bookmarkedList: BookmarkedCourseData[] = (progress?.bookmarkedCourses || []).map((c) => {
    const courseLessons = (c.modules || []).flatMap((m) => m.lessons || []).filter(Boolean);
    const totalDurationSeconds = courseLessons.reduce(
      (acc, l) => acc + (l.duration || 0),
      0
    );
    const totalDurationText =
      totalDurationSeconds > 0 ? formatDuration(totalDurationSeconds) : "2h 30m";
    const levelDisplay = c.level
      ? c.level.charAt(0).toUpperCase() + c.level.slice(1)
      : "Intermediate";

    return {
      courseId: c._id,
      courseTitle: c.title,
      courseSlug: c.slug,
      category: c.category?.title,
      level: levelDisplay,
      summary: c.summary,
      totalDurationText,
      totalLessons: courseLessons.length || 10,
    };
  });

  const hasAnyLearning = inProgressList.length > 0 || completedList.length > 0 || bookmarkedList.length > 0;
  const totalCompletedLessons = progress?.completedLessons?.length || 0;

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      {/* Centered Canvas matching 1440px viewport width */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header Navbar */}
          <Navbar activePath="/my-learning" />

          {/* Hero Header */}
          <MyLearningHero
            userName={userName}
            activeCoursesCount={inProgressList.length}
            completedLessonsCount={totalCompletedLessons}
            completedCoursesCount={completedList.length}
            savedCoursesCount={bookmarkedList.length}
          />

          {/* Main Content Area */}
          <main className="px-6 py-10 sm:px-10 lg:px-16">
            {!hasAnyLearning ? (
              <EmptyLearningState />
            ) : (
              <div className="space-y-12">
                {/* ──────────────────────────────────────────────────────────
                   IN PROGRESS COURSES SECTION
                   ────────────────────────────────────────────────────────── */}
                {inProgressList.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2.5">
                        <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                          In Progress
                        </h2>
                        <span className="flex h-5 items-center justify-center rounded-full bg-[#FFF5EE] dark:bg-primary-500/20 border border-[#FED7AA] dark:border-primary-500/30 px-2 text-xs font-bold text-[#EA580C] dark:text-primary-400">
                          {inProgressList.length}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inProgressList.map((course) => (
                        <InProgressCard key={course.courseId} course={course} />
                      ))}
                    </div>
                  </section>
                )}

                {/* ──────────────────────────────────────────────────────────
                   COMPLETED COURSES SECTION
                   ────────────────────────────────────────────────────────── */}
                {completedList.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2.5 mb-6">
                      <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Completed Courses
                      </h2>
                      <span className="flex h-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 px-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {completedList.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedList.map((course) => (
                        <CompletedCourseCard key={course.courseId} course={course} />
                      ))}
                    </div>
                  </section>
                )}

                {/* ──────────────────────────────────────────────────────────
                   SAVED / BOOKMARKED COURSES SECTION
                   ────────────────────────────────────────────────────────── */}
                {bookmarkedList.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2.5 mb-6">
                      <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Saved for Later
                      </h2>
                      <span className="flex h-5 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/20 border border-primary-200 dark:border-primary-500/30 px-2 text-xs font-bold text-primary-700 dark:text-primary-400">
                        {bookmarkedList.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bookmarkedList.map((course) => (
                        <BookmarkedCourseCard key={course.courseId} course={course} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <Footer />

        {/* Bottom Graphic Graphic Banner */}
        <BottomGraphic />
      </div>
    </div>
  );
}
