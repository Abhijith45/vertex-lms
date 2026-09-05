"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";

interface StickyCourseProgressProps {
  progressPercentage?: number;
  continueLearningUrl?: string;
}

export function StickyCourseProgress({
  progressPercentage = 35,
  continueLearningUrl = "#",
}: StickyCourseProgressProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-[1400px] rounded-2xl border border-neutral-200/90 bg-white/95 backdrop-blur-md px-6 py-4 shadow-xl shadow-neutral-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        {/* Left: Progress Label */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div>
            <span className="block text-xs font-semibold text-neutral-500 tracking-wider">
              Your Progress
            </span>
            <span className="text-base font-bold text-neutral-900 font-sans">
              {progressPercentage}% complete
            </span>
          </div>

          {/* Mobile progress bar (inline) */}
          <div className="sm:hidden flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E05A36] rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Center: Desktop Progress Bar */}
        <div className="hidden sm:block flex-1 max-w-md mx-6">
          <div className="h-2 w-full bg-neutral-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E05A36] rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Right: Continue Learning CTA */}
        <div className="w-full sm:w-auto shrink-0 flex justify-end">
          <Link
            href={continueLearningUrl}
            onClick={() =>
              posthog.capture("course_started", {
                progress_percentage: progressPercentage,
              })
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#E05A36] px-6 py-3 text-sm font-medium text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:bg-[#C2410C] hover:shadow-lg active:scale-[0.99] cursor-pointer"
          >
            <span>Continue Learning</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
