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
      className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md cursor-pointer relative"
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>{icon}</div>
          {popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5EE] border border-[#FED7AA] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">
              <Sparkles className="h-2.5 w-2.5" />
              Popular
            </span>
          )}
        </div>

        {category && (
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2 block">
            {category}
          </span>
        )}

        <h3 className="font-display text-[22px] font-bold text-neutral-900 tracking-tight leading-snug group-hover:text-primary-500 transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 text-[14px] text-neutral-500 leading-relaxed line-clamp-3 min-h-[46px]">
          {description}
        </p>
      </div>

      <div className="mt-8 border-t border-neutral-100 pt-4">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
            <span>{level}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
            <span>{duration}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
            <span>{modules} modules</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
