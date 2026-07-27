import { DailyPracticeSession } from "@/services/types";

/**
 * Parses an estimated-time string like "20 min", "1.5 hrs", "45 mins" etc.
 * Returns the value in minutes.
 */
export function parseEstimatedMinutes(estimated: string): number {
  if (!estimated) return 0;
  const lower = estimated.toLowerCase();
  const num = parseFloat(lower.replace(/[^0-9.]/g, "")) || 0;
  if (lower.includes("hr") || lower.includes("hour")) return Math.round(num * 60);
  return Math.round(num);
}

/**
 * Formats total minutes into a human readable duration like "2h 30m" or "45 min".
 */
export function formatTotalTime(totalMinutes: number): string {
  if (totalMinutes === 0) return "0 min";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculates the completion percentage (0-100) for a given session.
 */
export function completionPct(session: DailyPracticeSession): number {
  const { totalQuestions, completedCount } = session.metadata;
  return totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
}
