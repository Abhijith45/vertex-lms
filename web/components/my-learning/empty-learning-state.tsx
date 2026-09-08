"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Compass, ArrowRight } from "lucide-react";

export function EmptyLearningState() {
  return (
    <div className="mx-auto max-w-lg text-center py-16 px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF5EE] dark:bg-primary-500/10 border border-[#FED7AA] dark:border-primary-500/30 text-[#E05A36] dark:text-primary-400 mb-6 shadow-xs">
        <Compass className="h-8 w-8" />
      </div>

      <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-2.5">
        No courses in progress yet
      </h2>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
        You haven&apos;t started any courses yet. Browse our comprehensive curriculum to start learning and your progress will automatically appear here.
      </p>

      <Link
        href="/courses"
        className="inline-flex items-center gap-2 rounded-xl bg-[#E05A36] hover:bg-[#C2410C] text-white px-6 py-3 text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-150 group"
      >
        <BookOpen className="h-4 w-4" />
        <span>Explore All Courses</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
