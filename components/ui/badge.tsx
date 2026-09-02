import React from "react";

/* ──────────────────────────────────────────────────────────
   BADGE
   Types: video | lesson | popular
   ────────────────────────────────────────────────────────── */

type BadgeType = "video" | "lesson" | "popular";

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeStyles: Record<BadgeType, string> = {
  video:
    "border-primary-500 text-primary-500",
  lesson:
    "border-success text-success",
  popular:
    "border-error text-error",
};

const badgeLabels: Record<BadgeType, string> = {
  video: "VIDEO",
  lesson: "LESSON",
  popular: "POPULAR",
};

export function Badge({ type, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        badgeStyles[type],
        className,
      ].join(" ")}
    >
      {badgeLabels[type]}
    </span>
  );
}
