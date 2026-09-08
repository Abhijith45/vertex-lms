"use client";

import React from "react";
import Image from "next/image";
import {
  DockerIcon,
  NextJsIcon,
  ReactIcon,
  TypeScriptIcon,
  PythonIcon,
  PostgreSqlIcon,
  AiLlmIcon,
  SystemDesignIcon,
  SecurityIcon,
} from "@/components/home/course-icons";
import { resolveFallbackThumbnailType, type FallbackThumbnailType } from "@/lib/utils/search";
import codeIcon from "@/app/assets/pngtree-code-line-icon.png";

interface SearchResultLogoProps {
  courseTitle?: string;
  lessonTitle?: string;
  lessonSlug?: string;
  className?: string;
  size?: number;
}

export function SearchResultLogo({
  courseTitle,
  lessonTitle,
  lessonSlug,
  className = "w-14 h-14 sm:w-16 sm:h-16",
  size = 64,
}: SearchResultLogoProps) {
  const type: FallbackThumbnailType = resolveFallbackThumbnailType(
    courseTitle,
    lessonTitle,
    lessonSlug
  );

  switch (type) {
    case "docker":
      return <DockerIcon className={className} />;
    case "nextjs":
      return <NextJsIcon className={className} />;
    case "react":
      return <ReactIcon className={className} />;
    case "python":
      return <PythonIcon className={className} />;
    case "postgres":
      return <PostgreSqlIcon className={className} />;
    case "ai":
      return <AiLlmIcon className={className} />;
    case "system-design":
      return <SystemDesignIcon className={className} />;
    case "security":
      return <SecurityIcon className={className} />;
    case "typescript":
      return <TypeScriptIcon className={className} />;
    case "rag":
      return (
        <div
          className={`rounded-[14px] bg-[#0F172A] flex items-center justify-center text-white font-bold text-2xl font-display shadow-xs ${className}`}
          aria-label="RAG logo"
        >
          R
        </div>
      );
    case "default":
    default:
      return (
        <div className={`flex items-center bg-[#0F172A] justify-center ${className}`}>
          <Image
            src={codeIcon}
            alt="Code icon"
            width={size}
            height={size}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      );
  }
}
