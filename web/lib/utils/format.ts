/**
 * Format duration in seconds to human readable string (e.g. "18h 24m" or "45m")
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
  }

  return `${minutes}m`;
}

/**
 * Format student count (e.g. 18240 -> "18.2k", 2100 -> "2.1k")
 */
export function formatStudentCount(count: number): string {
  if (!count) return "0";
  if (count >= 1000) {
    const formatted = (count / 1000).toFixed(1);
    return `${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted}k`;
  }
  return count.toLocaleString();
}
