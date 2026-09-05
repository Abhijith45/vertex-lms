import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

interface LessonResultCardProps {
  lesson: {
    title: string;
    slug: string;
    description: string;
    courseTitle: string;
    moduleLabel?: string;
    keyPoints?: string[];
  };
}

export function LessonResultCard({ lesson }: LessonResultCardProps) {
  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="group block w-full rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs transition-all duration-200 hover:border-primary-300 hover:shadow-md"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-primary-500">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Lesson Match</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-500 font-normal">
            {lesson.courseTitle} {lesson.moduleLabel ? `/ ${lesson.moduleLabel}` : ""}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-primary-500 transition-colors">
          <span>View lesson</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-900 transition-colors duration-150 group-hover:text-primary-500">
        {lesson.title}
      </h3>
      <p className="text-sm leading-relaxed text-neutral-600 line-clamp-2">
        {lesson.description}
      </p>
    </Link>
  );
}

