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
 * Normalizes a raw search query by trimming and collapsing multiple spaces.
 */
export function normalizeSearchQuery(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.trim().replace(/\s+/g, " ");
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
