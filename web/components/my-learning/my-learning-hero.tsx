import React from "react";
import { BookOpen, CheckCircle2, Clock, Bookmark } from "lucide-react";

interface MyLearningHeroProps {
  userName?: string | null;
  activeCoursesCount: number;
  completedLessonsCount: number;
  completedCoursesCount: number;
  savedCoursesCount?: number;
}

export function MyLearningHero({
  userName,
  activeCoursesCount,
  completedLessonsCount,
  completedCoursesCount,
  savedCoursesCount = 0,
}: MyLearningHeroProps) {
  const greeting = userName ? `Welcome back, ${userName}` : "Welcome back";

  return (
    <section className="border-b border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#0F172A] px-6 py-10 sm:px-10 lg:px-16 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center rounded-full border border-[#FED7AA] dark:border-primary-500/30 bg-[#FFF5EE] dark:bg-primary-500/10 px-3.5 py-1 text-[11px] font-bold tracking-widest text-[#EA580C] dark:text-primary-400 uppercase select-none mb-3">
            LEARNER DASHBOARD
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
            {greeting}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
            Pick up right where you left off, review your completed lessons, and continue advancing your skills.
          </p>
        </div>

        {/* Learning Metric Summary Badges */}
        <div className="flex flex-wrap items-center gap-3 select-none">
          {/* Active Courses */}
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-[#FAF9F6] dark:bg-neutral-900/80 px-4 py-2.5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF5EE] dark:bg-primary-500/15 text-[#E05A36] dark:text-primary-400">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-none">
                {activeCoursesCount}
              </span>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                In Progress
              </span>
            </div>
          </div>

          {/* Completed Lessons */}
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-[#FAF9F6] dark:bg-neutral-900/80 px-4 py-2.5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-none">
                {completedLessonsCount}
              </span>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Lessons Done
              </span>
            </div>
          </div>

          {/* Completed Courses */}
          {completedCoursesCount > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-[#FAF9F6] dark:bg-neutral-900/80 px-4 py-2.5 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-none">
                  {completedCoursesCount}
                </span>
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Completed
                </span>
              </div>
            </div>
          )}

          {/* Saved / Bookmarked Courses */}
          {savedCoursesCount > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-[#FAF9F6] dark:bg-neutral-900/80 px-4 py-2.5 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400">
                <Bookmark className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-none">
                  {savedCoursesCount}
                </span>
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Saved
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
