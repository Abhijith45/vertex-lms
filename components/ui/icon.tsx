import React from "react";
import { LucideIcon } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   ICON — thin wrapper around Lucide icons
   ────────────────────────────────────────────────────────── */

interface IconProps {
  icon: LucideIcon;
  /** px size (width & height) — defaults to 24 */
  size?: number;
  /** "outline" uses the default Lucide 2px stroke; "filled" fills the shape */
  variant?: "outline" | "filled";
  className?: string;
}

export function Icon({
  icon: LucideComponent,
  size = 24,
  variant = "outline",
  className = "",
}: IconProps) {
  return (
    <LucideComponent
      className={[
        variant === "filled" ? "fill-current" : "",
        className,
      ].join(" ")}
      width={size}
      height={size}
      strokeWidth={2}
    />
  );
}
