import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   PAGINATION
   ────────────────────────────────────────────────────────── */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={`inline-flex items-center gap-1 ${className}`}
    >
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 disabled:text-neutral-300 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-neutral-500"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange?.(p as number)}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-sm font-medium transition-colors",
              p === currentPage
                ? "border border-primary-500 bg-primary-500 text-white"
                : "border border-neutral-200 text-neutral-700 hover:bg-neutral-100",
            ].join(" ")}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 disabled:text-neutral-300 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/** Build a page list like [1, 2, 3, "...", 8] */
function buildPageList(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
