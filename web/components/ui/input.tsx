import React from "react";
import { Search, ChevronDown } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   INPUT — Search / Text Input
   ────────────────────────────────────────────────────────── */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Show a search icon on the left and ⌘K badge on the right */
  isSearch?: boolean;
}

export function Input({
  isSearch = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {isSearch && (
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      )}
      <input
        className={[
          "h-11 w-full rounded-[var(--radius-md)] border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-500",
          "outline-none transition-colors duration-150",
          "focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20",
          isSearch ? "pl-10 pr-16" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {isSearch && (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-[var(--radius-xs)] border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs text-neutral-500">
          ⌘K
        </kbd>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   SELECT
   ────────────────────────────────────────────────────────── */

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        className={[
          "h-11 w-full appearance-none rounded-[var(--radius-md)] border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900",
          "outline-none transition-colors duration-150",
          "focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20",
          className,
        ].join(" ")}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
    </div>
  );
}
