"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, Clock, BookOpen, Sparkles } from "lucide-react";
import posthog from "posthog-js";

export interface HomeCourseCardProps {
  href?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
  category?: string;
  popular?: boolean;
  progressPercentage?: number;
}

export function HomeCourseCard({
  href = "#",
  icon,
  title,
  description,
  level,
  duration,
  modules,
  category,
  popular,
  progressPercentage,
}: HomeCourseCardProps) {
  function handleClick() {
    posthog.capture("course_card_clicked", {
      course_title: title,
      course_level: level,
      course_duration: duration,
      course_modules: modules,
      course_category: category ?? null,
      is_popular: popular ?? false,
    });
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md cursor-pointer relative"
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>{icon}</div>
          {popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5EE] dark:bg-primary-500/10 border border-[#FED7AA] dark:border-primary-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#EA580C] dark:text-primary-400">
              <Sparkles className="h-2.5 w-2.5" />
              Popular
            </span>
          )}
        </div>

        {category && (
          <span className="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider mb-2 block">
            {category}
          </span>
        )}

        <h3 className="font-display text-[22px] font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3 min-h-[46px]">
          {description}
        </p>
      </div>

      <div className="mt-8 border-t border-neutral-100 dark:border-neutral-800 pt-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
            <span>{level}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
            <span>{duration}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
            <span>{modules} modules</span>
          </span>
        </div>

        {typeof progressPercentage === "number" && progressPercentage > 0 && (
          <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-neutral-600 dark:text-neutral-300">
                {progressPercentage >= 100 ? "Completed" : "In Progress"}
              </span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPercentage >= 100 ? "bg-emerald-500" : "bg-[#E05A36]"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
