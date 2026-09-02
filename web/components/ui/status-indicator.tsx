import React from "react";
import { Check, Circle, Lock } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   STATUS INDICATOR
   Statuses: in-progress | completed | now-playing | locked
   ────────────────────────────────────────────────────────── */

type Status = "in-progress" | "completed" | "now-playing" | "locked";

interface StatusIndicatorProps {
  status: Status;
  className?: string;
}

export function StatusIndicator({
  status,
  className = "",
}: StatusIndicatorProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm ${className}`}
    >
      {status === "in-progress" && (
        <>
          <span className="relative flex h-4 w-4 items-center justify-center">
            <svg viewBox="0 0 16 16" className="h-4 w-4 text-neutral-500">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="20.4 20.4"
                strokeDashoffset="10.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-neutral-700">In Progress</span>
        </>
      )}

      {status === "completed" && (
        <>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="text-neutral-700">Completed</span>
        </>
      )}

      {status === "now-playing" && (
        <>
          <span className="relative flex h-4 w-4 items-center justify-center">
            <Circle className="h-4 w-4 fill-error text-error" />
            <span className="absolute inset-0 animate-ping rounded-full bg-error/30" />
          </span>
          <span className="text-neutral-700">Now Playing</span>
        </>
      )}

      {status === "locked" && (
        <>
          <Lock className="h-4 w-4 text-neutral-500" />
          <span className="text-neutral-500">Locked</span>
        </>
      )}
    </span>
  );
}
