import React from "react";

/* ──────────────────────────────────────────────────────────
   PROGRESS BAR
   ────────────────────────────────────────────────────────── */

interface ProgressBarProps {
  /** Value between 0 and 100 */
  value: number;
  /** Show the percentage label */
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = true,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-small font-medium text-neutral-700 whitespace-nowrap">
          {clamped}% complete
        </span>
      )}
    </div>
  );
}
