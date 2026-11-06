"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";

export function ExploreCoursesButton() {
  return (
    <Link
      href="/courses"
      onClick={() => posthog.capture("explore_courses_clicked")}
      className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-7 py-3.5 text-base font-medium text-white shadow-md shadow-orange-500/25 transition-all duration-200 hover:bg-[#EA580C] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] cursor-pointer"
    >
      <span>Explore Courses</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2} />
    </Link>
  );
}
