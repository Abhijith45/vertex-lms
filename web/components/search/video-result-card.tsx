import Link from "next/link";
import { Play, Video, ArrowRight } from "lucide-react";

interface VideoResultCardProps {
  videoMoment: {
    lessonTitle: string;
    lessonSlug: string;
    courseTitle: string;
    courseIcon?: string;
    description: string;
    startSeconds: number;
    thumbnailUrl?: string;
    clipLength?: string;
  };
}

function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoResultCard({ videoMoment }: VideoResultCardProps) {
  return (
    <Link
      href={`/lessons/${videoMoment.lessonSlug}?start=${videoMoment.startSeconds}`}
      className="group block w-full rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs transition-all duration-200 hover:border-primary-300 hover:shadow-md"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-purple-600">
          <Video className="h-3.5 w-3.5" />
          <span>Video Moment</span>
          <span className="text-neutral-300">•</span>
          <span className="font-normal text-neutral-500">
            {videoMoment.courseTitle} / {videoMoment.lessonTitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
            <Play className="h-2.5 w-2.5 fill-current" />
            {formatSeconds(videoMoment.startSeconds)}
          </span>
          <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-primary-500 transition-colors">
            <span>Watch</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-neutral-900 transition-colors duration-150 group-hover:text-primary-500">
        {videoMoment.description}
      </h3>
      
      <p className="text-sm text-neutral-500">
        From lesson: <span className="font-medium text-neutral-700">{videoMoment.lessonTitle}</span>
      </p>
    </Link>
  );
}
