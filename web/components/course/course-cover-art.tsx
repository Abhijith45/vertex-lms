import React from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
interface CourseCoverArtProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  title: string;
  slug: string;
}

export function CourseCoverArt({ coverImage, title, slug }: CourseCoverArtProps) {
  // If it's a Next.js course or if there's no custom cover image, render the iconic metallic Next.js card
  const isNextJs =
    slug.includes("nextjs") ||
    slug.includes("next-js") ||
    title.toLowerCase().includes("next.js");

  if (isNextJs) {
    return (
      <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] shrink-0 overflow-hidden rounded-2xl bg-black p-6 sm:p-8 flex items-center justify-center shadow-lg shadow-black/20 border border-neutral-900">
        {/* Metallic Chrome Next.js N Logo */}
        <svg
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient
              id="chrome-n"
              x1="64"
              y1="40"
              x2="116"
              y2="140"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#D4D4D8" />
              <stop offset="55%" stopColor="#71717A" />
              <stop offset="100%" stopColor="#27272A" />
            </linearGradient>
            <linearGradient
              id="diagonal-reflection"
              x1="90"
              y1="40"
              x2="140"
              y2="140"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#A1A1AA" />
              <stop offset="40%" stopColor="#E4E4E7" />
              <stop offset="70%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#3F3F46" />
            </linearGradient>
          </defs>

          {/* Left Vertical Bar */}
          <path
            d="M50 40H66V140H50V40Z"
            fill="url(#chrome-n)"
          />

          {/* Right Vertical Bar */}
          <path
            d="M114 40H130V140H114V40Z"
            fill="#E4E4E7"
          />

          {/* Diagonal Slanted Bar with Metallic Sheen */}
          <path
            d="M62 40L126 138H110L50 46V40H62Z"
            fill="url(#diagonal-reflection)"
          />
        </svg>
      </div>
    );
  }

  // If cover image exists from Sanity — compute URL outside JSX so errors are catchable
  if (coverImage) {
    let imageUrl: string | null = null;
    try {
      imageUrl = urlFor(coverImage).width(600).height(600).url();
    } catch {
      // Fallback below
    }
    if (imageUrl) {
      return (
        <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] shrink-0 overflow-hidden rounded-2xl bg-neutral-900 shadow-md">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
            priority
          />
        </div>
      );
    }
  }

  // Default fallback card
  return (
    <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] shrink-0 overflow-hidden rounded-2xl bg-neutral-900 p-8 flex items-center justify-center text-white font-bold text-3xl font-display shadow-md">
      {title.charAt(0)}
    </div>
  );
}
