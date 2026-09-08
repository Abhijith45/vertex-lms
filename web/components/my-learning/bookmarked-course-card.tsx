"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, Trash2 } from "lucide-react";
import { CourseIcon } from "@/components/home/course-icons";
import posthog from "posthog-js";

export interface BookmarkedCourseData {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  category?: string;
  level: string;
  summary?: string;
  totalDurationText: string;
  totalLessons: number;
}

interface BookmarkedCourseCardProps {
  course: BookmarkedCourseData;
  onRemove?: (courseId: string) => void;
}

export function BookmarkedCourseCard({
  course,
  onRemove,
}: BookmarkedCourseCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsRemoving(true);
    // Optimistic removal
    setIsRemoved(true);
    if (onRemove) {
      onRemove(course.courseId);
    }

    posthog.capture("course_bookmarked", {
      course_id: course.courseId,
      course_title: course.courseTitle,
      bookmarked: false,
      source: "my_learning_bookmarked_card",
    });

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.courseId,
          bookmarked: false,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove bookmark");
      }
    } catch (err) {
      console.error("Error removing bookmark:", err);
      // Revert if request failed
      setIsRemoved(false);
    } finally {
      setIsRemoving(false);
    }
  };

  if (isRemoved) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-6 sm:p-7 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group">
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <CourseIcon slug={course.courseSlug} />
            <div>
              {course.category && (
                <span className="text-[11px] font-semibold text-[#E05A36] dark:text-primary-400 uppercase tracking-wider block">
                  {course.category}
                </span>
              )}
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                {course.level}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="rounded-lg p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Remove from bookmarks"
            aria-label={`Remove ${course.courseTitle} from bookmarks`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Course Title */}
        <Link
          href={`/courses/${course.courseSlug}`}
          className="font-display text-xl sm:text-[22px] font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#E05A36] dark:hover:text-primary-400 transition-colors line-clamp-1 block mb-2"
        >
          {course.courseTitle}
        </Link>

        {/* Course Summary */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-6">
          {course.summary || "Master this topic with hands-on lessons, real-world examples, and expert instruction."}
        </p>
      </div>

      {/* Footer Details & Action */}
      <div>
        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span>{course.totalDurationText}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
            <span>{course.totalLessons} lessons</span>
          </div>
        </div>

        <Link
          href={`/courses/${course.courseSlug}`}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-neutral-900 dark:bg-neutral-100 px-4 py-2.5 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          <span>View Course</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
