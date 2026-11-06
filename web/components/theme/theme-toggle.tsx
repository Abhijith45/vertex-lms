"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    // Placeholder to prevent hydration mismatch while retaining layout footprint
    return (
      <div
        className={`h-9 w-9 rounded-full border border-neutral-200/80 bg-neutral-100/50 dark:border-neutral-800 dark:bg-neutral-800/50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/90 bg-white/80 dark:border-neutral-700/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 shadow-xs transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:scale-105 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 cursor-pointer overflow-hidden ${className}`}
    >
      {/* Sun Icon (Visible in light mode) */}
      <Sun
        className={`h-4.5 w-4.5 text-amber-500 transition-transform duration-300 ease-in-out ${
          isDark ? "rotate-90 scale-0 opacity-0 absolute" : "rotate-0 scale-100 opacity-100"
        }`}
        strokeWidth={2}
      />

      {/* Moon Icon (Visible in dark mode) */}
      <Moon
        className={`h-4 w-4 text-primary-400 transition-transform duration-300 ease-in-out ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0 absolute"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
