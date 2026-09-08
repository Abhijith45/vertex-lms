/**
 * Search and navigation helper utilities for Vertex
 */

export interface PaginationResult {
  totalPages: number;
  currentPage: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Normalizes a raw search query by trimming, stripping control characters,
 * collapsing multiple spaces, and limiting length to 500 characters.
 */
export function normalizeSearchQuery(raw: string | null | undefined): string {
  if (!raw) return "";
  // Strip control characters (U+0000–U+001F, U+007F–U+009F) except space
  const sanitized = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
  return sanitized.trim().replace(/\s+/g, " ").slice(0, 500);
}

/**
 * Formats a search URL with URI-encoded query parameter.
 */
export function formatSearchUrl(query: string): string {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return "/search";
  return `/search?q=${encodeURIComponent(normalized)}`;
}

/**
 * Determines whether suggestions dropdown should be displayed.
 * Suggestions only show when the user has actively focused the input and has typed at least 2 characters.
 */
export function shouldShowSuggestions(
  query: string,
  isFocused: boolean,
  hasSuggestions: boolean
): boolean {
  const trimmed = normalizeSearchQuery(query);
  return isFocused && trimmed.length >= 2 && hasSuggestions;
}

/**
 * Calculates pagination boundaries and navigation flags.
 */
export function calculatePagination(
  totalItems: number,
  currentPage: number,
  itemsPerPage = 6
): PaginationResult {
  const safeTotal = Math.max(0, totalItems);
  const totalPages = Math.max(1, Math.ceil(safeTotal / itemsPerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, safeTotal);

  return {
    totalPages,
    currentPage: safePage,
    startIndex,
    endIndex,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}

/**
 * Generates the lesson URL, optionally including a seek start timestamp.
 */
export function getLessonUrl(slug: string, startSeconds?: number): string {
  const cleanSlug = encodeURIComponent(slug.trim());
  if (typeof startSeconds === "number" && startSeconds > 0) {
    return `/lessons/${cleanSlug}?start=${Math.floor(startSeconds)}`;
  }
  return `/lessons/${cleanSlug}`;
}

/**
 * Generates the return URL back to search results with the preserved query.
 */
export function getSearchResultBackUrl(query: string): string {
  return formatSearchUrl(query);
}

/**
 * Generates the URL back to the Home page.
 */
export function getHomeUrl(): string {
  return "/";
}

export type FallbackThumbnailType = "nextjs" | "react" | "default";

/**
 * Resolves which fallback thumbnail icon to use based on course and lesson context.
 * 1. Next.js logo: if courseTitle, lessonTitle, or lessonSlug contains "next"
 * 2. React logo: if courseTitle, lessonTitle, or lessonSlug contains "react"
 * 3. Default code logo: any other topic
 */
export function resolveFallbackThumbnailType(
  courseTitle?: string,
  lessonTitle?: string,
  lessonSlug?: string
): FallbackThumbnailType {
  const combined = `${courseTitle || ""} ${lessonTitle || ""} ${lessonSlug || ""}`.toLowerCase();
  if (combined.includes("next")) {
    return "nextjs";
  }
  if (combined.includes("react")) {
    return "react";
  }
  return "default";
}

export interface ChapterMatch {
  startSeconds: number;
  label: string;
}

export interface ChunkMatch {
  startSeconds: number;
  text: string;
}

export interface ResolvedVideoMoment {
  startSeconds: number;
  description: string;
  sourceType: "chapter" | "transcript";
  clipLength: string;
}

/**
 * Two-stage timestamp resolution:
 * Stage 1 (Chapters First): If a video has matching chapters, use chapter timestamps and labels.
 * Stage 2 (Transcript Fallback): ONLY if NO chapters matched for that video, fall back to matching transcript chunks.
 * This guarantees clean, curated chapter markers take precedence over noisier transcript text.
 */
export function resolveVideoMomentsTwoStage(
  matchedChapters?: ChapterMatch[] | null,
  matchedChunks?: ChunkMatch[] | null,
  maxMoments: number = 3
): ResolvedVideoMoment[] {
  // Stage 1: Chapters first
  if (matchedChapters && matchedChapters.length > 0) {
    return matchedChapters.slice(0, maxMoments).map((ch) => ({
      startSeconds: Math.max(0, Math.floor(ch.startSeconds || 0)),
      description: ch.label?.trim() || "Chapter Marker",
      sourceType: "chapter",
      clipLength: "2-5 mins",
    }));
  }

  // Stage 2: Transcript fallback
  if (matchedChunks && matchedChunks.length > 0) {
    return matchedChunks.slice(0, maxMoments).map((ck) => {
      const text = ck.text?.trim() || "";
      const description = text.length > 140 ? `${text.slice(0, 137)}...` : text;
      return {
        startSeconds: Math.max(0, Math.floor(ck.startSeconds || 0)),
        description: description || "Video Transcript",
        sourceType: "transcript",
        clipLength: "1-2 mins",
      };
    });
  }

  return [];
}

