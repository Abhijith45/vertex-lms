import React from "react";
import { ChevronRight } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   BREADCRUMB
   ────────────────────────────────────────────────────────── */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            )}
            {i < items.length - 1 ? (
              <a
                href={item.href ?? "#"}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-neutral-900 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
