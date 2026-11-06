"use client";

import React, { useState, useEffect } from "react";
import { Flame, Sparkles, Trophy } from "lucide-react";
import { calculateStreak, getDemoActivityDates, type StreakState } from "@/lib/streak";

export function StreakBadge() {
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // In production, pulls from learner progress document or localStorage
    const saved = localStorage.getItem("vertex_activity_dates");
    let dates: string[] = [];

    if (saved) {
      try {
        dates = JSON.parse(saved);
      } catch {
        dates = getDemoActivityDates();
      }
    } else {
      dates = getDemoActivityDates();
      localStorage.setItem("vertex_activity_dates", JSON.stringify(dates));
    }

    const calculated = calculateStreak(dates);
    setStreak(calculated);
  }, []);

  if (!streak || streak.currentStreak <= 0) {
    return null;
  }

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        aria-label={`${streak.currentStreak}-day learning streak`}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-gradient-to-r from-amber-500/10 to-orange-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:border-amber-500/60 transition-all cursor-pointer shadow-2xs"
      >
        <Flame
          className={`h-3.5 w-3.5 text-[#E05A36] ${
            streak.isActiveToday ? "animate-bounce" : ""
          }`}
          fill="currentColor"
        />
        <span>{streak.currentStreak}d</span>
      </button>

      {/* Floating Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 z-50 w-56 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xl text-left animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-[#E05A36]" fill="currentColor" />
              <span>{streak.currentStreak}-Day Streak!</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold">
              {streak.isActiveToday ? "Active Today" : "Grace Period"}
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
            {streak.isActiveToday
              ? "You've practiced today! Keep your learning momentum going tomorrow."
              : "Complete a lesson or quiz today to keep your streak alive!"}
          </p>

          <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-500" />
              <span>Best: {streak.longestStreak} days</span>
            </span>
            <span>{streak.daysToMilestone}d to {streak.milestone}d badge</span>
          </div>
        </div>
      )}
    </div>
  );
}
