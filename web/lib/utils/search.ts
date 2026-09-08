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

export type FallbackThumbnailType =
  | "docker"
  | "nextjs"
  | "react"
  | "python"
  | "postgres"
  | "ai"
  | "security"
  | "system-design"
  | "typescript"
  | "rag"
  | "default";

/**
 * Resolves which fallback thumbnail icon to use based on course and lesson context.
 * Matches specific course categories (Docker, Next.js, React, Python, Postgres, AI, Security, System Design, TypeScript, RAG),
 * falling back to "default" (code icon) when no specific match is found.
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
  if (combined.includes("docker") || combined.includes("kubernetes") || combined.includes("devops")) {
    return "docker";
  }
  if (combined.includes("typescript")) {
    return "typescript";
  }
  if (combined.includes("react")) {
    return "react";
  }
  if (combined.includes("python") || combined.includes("pandas")) {
    return "python";
  }
  if (combined.includes("postgres") || combined.includes("database") || combined.includes("sql")) {
    return "postgres";
  }
  if (combined.includes("rag") || combined.includes("retrieval-augmented") || combined.includes("retrieval augmented")) {
    return "rag";
  }
  if (combined.includes("ai") || combined.includes("llm") || combined.includes("prompt")) {
    return "ai";
  }
  if (combined.includes("system-design") || combined.includes("system design") || combined.includes("distributed system")) {
    return "system-design";
  }
  if (combined.includes("security") || combined.includes("vulnerabilit")) {
    return "security";
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

const COMMON_STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "with", "from",
  "by", "about", "how", "what", "is", "are", "of", "and", "or", "can",
  "you", "do", "does", "i", "we", "my", "your", "find", "show", "me"
]);

const SYNONYM_MAP: Record<string, string[]> = {
  docker: ["container", "dockerfile", "compose", "devops"],
  container: ["docker", "kubernetes", "k8s"],
  k8s: ["kubernetes", "cluster", "container"],
  kubernetes: ["k8s", "cluster", "container"],
  auth: ["authentication", "clerk", "login", "session", "jwt"],
  authentication: ["auth", "clerk", "login", "session"],
  clerk: ["auth", "authentication", "login"],
  next: ["nextjs", "react", "app router", "server components"],
  nextjs: ["next", "react", "app router", "server components"],
  postgres: ["postgresql", "sql", "database"],
  postgresql: ["postgres", "sql", "database"],
  database: ["postgres", "postgresql", "sql"],
  sql: ["postgres", "postgresql", "database"],
  ai: ["llm", "openai", "rag", "prompt"],
  llm: ["ai", "openai", "prompt", "rag"],
  security: ["vulnerability", "auth", "owasp", "encryption"],
  ts: ["typescript"],
  typescript: ["ts"],
  py: ["python"],
  python: ["py"],
};

export interface ProcessedSearchQuery {
  rawQuery: string;
  cleanTokens: string[];
  queryPattern: string;
  orConditions: string[];
  expandedTerms: string[];
}

/**
 * Preprocesses a raw search query by stripping stop words, tokenizing,
 * and expanding with domain-specific technical synonyms.
 */
export function processSearchQuery(rawQuery: string): ProcessedSearchQuery {
  const normalized = normalizeSearchQuery(rawQuery);
  const words = normalized
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const nonStopWords = words.filter((w) => !COMMON_STOP_WORDS.has(w));
  const effectiveWords = nonStopWords.length > 0 ? nonStopWords : words;

  const synonymSet = new Set<string>();
  for (const word of effectiveWords) {
    const syns = SYNONYM_MAP[word];
    if (syns) {
      syns.forEach((s) => synonymSet.add(s));
    }
  }

  const cleanTokens = effectiveWords;
  const queryPattern = cleanTokens.length > 0 ? `*${cleanTokens.join("*")}*` : `*${normalized}*`;
  const allTerms = Array.from(new Set([...cleanTokens, ...synonymSet]));
  const orConditions = allTerms.map((t) => `*${t}*`);

  return {
    rawQuery: normalized,
    cleanTokens,
    queryPattern,
    orConditions,
    expandedTerms: allTerms,
  };
}
