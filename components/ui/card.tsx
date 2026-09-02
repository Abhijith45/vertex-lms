import React from "react";
import {
  BarChart3,
  Clock,
  BookOpen,
  PlayCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Badge } from "./badge";

/* ──────────────────────────────────────────────────────────
   COURSE CARD
   ────────────────────────────────────────────────────────── */

interface CourseCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
  className?: string;
}

export function CourseCard({
  icon,
  title,
  description,
  level,
  duration,
  modules,
  className = "",
}: CourseCardProps) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-[var(--radius-md)] border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-neutral-900 text-white text-lg font-bold">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-heading-3 text-neutral-900 truncate">{title}</h3>
          <p className="text-body text-neutral-500 mt-1 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-small text-neutral-500 border-t border-neutral-100 pt-3">
        <span className="inline-flex items-center gap-1">
          <BarChart3 className="h-3.5 w-3.5" />
          {level}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {duration}
        </span>
        <span className="inline-flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          {modules} modules
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   LESSON CARD (VIDEO)
   ────────────────────────────────────────────────────────── */

interface LessonVideoCardProps {
  title: string;
  description: string;
  lessonLabel: string;
  duration: string;
  timestamp?: string;
  className?: string;
}

export function LessonVideoCard({
  title,
  description,
  lessonLabel,
  duration,
  timestamp,
  className = "",
}: LessonVideoCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[var(--radius-md)] border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md ${className}`}
    >
      <Badge type="video" />
      <h3 className="text-heading-3 text-neutral-900">{title}</h3>
      <p className="text-body text-neutral-500 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-small text-neutral-500">
          {lessonLabel} · {duration}
        </span>
        {timestamp && (
          <button className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-[#E8660F] transition-colors">
            <PlayCircle className="h-4 w-4" />
            Watch from {timestamp}
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   LESSON CARD (LESSON)
   ────────────────────────────────────────────────────────── */

interface LessonCardProps {
  title: string;
  description: string;
  moduleLabel: string;
  className?: string;
}

export function LessonCard({
  title,
  description,
  moduleLabel,
  className = "",
}: LessonCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[var(--radius-md)] border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md ${className}`}
    >
      <Badge type="lesson" />
      <h3 className="text-heading-3 text-neutral-900">{title}</h3>
      <p className="text-body text-neutral-500 line-clamp-3">{description}</p>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-small text-neutral-500">{moduleLabel}</span>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-[#E8660F] transition-colors">
          View lesson
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   RESOURCE CARD
   ────────────────────────────────────────────────────────── */

interface ResourceCardProps {
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  className?: string;
}

export function ResourceCard({
  title,
  description,
  fileType,
  fileSize,
  className = "",
}: ResourceCardProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[var(--radius-md)] border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-neutral-100 text-neutral-500">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-heading-3 text-neutral-900 truncate">{title}</h3>
        <p className="text-body text-neutral-500 mt-1 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-small text-neutral-500">
            {fileType} · {fileSize}
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-primary-500" />
        </div>
      </div>
    </div>
  );
}
