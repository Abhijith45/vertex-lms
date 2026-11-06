export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  totalActiveDays: number;
  milestone: number;
  daysToMilestone: number;
}

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current learning streak, longest streak, and active status.
 *
 * Algorithm:
 * 1. Normalize dates into unique sorted descending list.
 * 2. Check if active today. If not, check if active yesterday (streak grace period).
 * 3. Count consecutive preceding days backwards.
 * 4. Scan the full sorted timeline to calculate historical longest streak.
 */
export function calculateStreak(
  activityDateStrings: string[],
  referenceDate: Date = new Date()
): StreakState {
  if (!activityDateStrings || activityDateStrings.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isActiveToday: false,
      totalActiveDays: 0,
      milestone: 7,
      daysToMilestone: 7,
    };
  }

  // Deduplicate and filter valid YYYY-MM-DD
  const dateSet = new Set(
    activityDateStrings
      .map((d) => d.slice(0, 10))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
  );

  const totalActiveDays = dateSet.size;
  if (totalActiveDays === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isActiveToday: false,
      totalActiveDays: 0,
      milestone: 7,
      daysToMilestone: 7,
    };
  }

  const todayStr = formatDateKey(referenceDate);

  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateKey(yesterday);

  const isActiveToday = dateSet.has(todayStr);
  const isActiveYesterday = dateSet.has(yesterdayStr);

  let currentStreak = 0;

  if (isActiveToday || isActiveYesterday) {
    // Determine starting anchor for backwards scan
    let checkDate = new Date(referenceDate);
    if (!isActiveToday && isActiveYesterday) {
      checkDate = yesterday;
    }

    while (true) {
      const key = formatDateKey(checkDate);
      if (dateSet.has(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate Historical Longest Streak across all dates
  const sortedDates = Array.from(dateSet).sort();
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDateObj: Date | null = null;

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const currentDateObj = new Date(y, m - 1, d);

    if (prevDateObj) {
      const diffMs = currentDateObj.getTime() - prevDateObj.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    } else {
      runningStreak = 1;
    }

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }

    prevDateObj = currentDateObj;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Milestone targets: 3, 7, 14, 30, 60, 100 days
  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > currentStreak) || currentStreak + 10;
  const daysToMilestone = Math.max(1, nextMilestone - currentStreak);

  return {
    currentStreak,
    longestStreak,
    isActiveToday,
    totalActiveDays,
    milestone: nextMilestone,
    daysToMilestone,
  };
}

// Built-in activity history generator for authenticated demo learners
export function getDemoActivityDates(): string[] {
  const dates: string[] = [];
  const now = new Date();

  // Active today, yesterday, and 2 days ago = 3-day active streak
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(formatDateKey(d));
  }

  // A couple of past dates from previous week
  const past1 = new Date(now);
  past1.setDate(past1.getDate() - 6);
  dates.push(formatDateKey(past1));

  const past2 = new Date(now);
  past2.setDate(past2.getDate() - 7);
  dates.push(formatDateKey(past2));

  return dates;
}
