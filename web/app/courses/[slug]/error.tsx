"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";

export default function CourseError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error, {
      source: "course_detail_error_boundary",
      error_digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex items-center justify-center px-6 transition-colors duration-200">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            We couldn&apos;t load this course
          </h1>
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The course content is temporarily unavailable. Try again in a moment.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex items-center rounded-xl bg-primary-500 px-6 py-3 text-sm font-medium text-white shadow-md shadow-orange-500/25 transition-all duration-200 hover:bg-[#EA580C] cursor-pointer"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 px-6 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:border-primary-300 dark:hover:border-primary-600/70"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
