import React from "react";
import Link from "next/link";
import { BarChart3, Clock, BookOpen } from "lucide-react";

interface HomeCourseCardProps {
  href?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
}

export function HomeCourseCard({
  href = "#",
  icon,
  title,
  description,
  level,
  duration,
  modules,
}: HomeCourseCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md cursor-pointer"
    >
      <div>
        <div className="mb-6">{icon}</div>
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
