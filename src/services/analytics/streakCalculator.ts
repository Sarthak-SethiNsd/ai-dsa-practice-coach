import { DailyPracticeSession } from "@/services/types";
import { getTodayDateString } from "@/utils/dateUtils";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Returns a YYYY-MM-DD date string shifted by `offsetDays` from a base date string.
 */
function getShiftedDate(baseDateStr: string, offsetDays: number): string {
  const [y, m, d] = baseDateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current and longest practice streak in days.
 * A day is considered active if it has a DailyPracticeSession with completedCount > 0.
 */
export function calculateStreaks(sessions: DailyPracticeSession[]): StreakResult {
  // Extract unique active dates where completedCount > 0
  const activeDatesSet = new Set<string>();
  sessions.forEach(s => {
    if (s.metadata.completedCount > 0) {
      activeDatesSet.add(s.date);
    }
  });

  if (activeDatesSet.size === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Convert set to array and sort descending
  const sortedDates = Array.from(activeDatesSet).sort((a, b) => b.localeCompare(a));

  const todayStr = getTodayDateString();
  const yesterdayStr = getShiftedDate(todayStr, -1);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let startDate: string | null = null;

  if (activeDatesSet.has(todayStr)) {
    startDate = todayStr;
  } else if (activeDatesSet.has(yesterdayStr)) {
    startDate = yesterdayStr;
  }

  if (startDate) {
    let checkDate = startDate;
    while (activeDatesSet.has(checkDate)) {
      currentStreak++;
      checkDate = getShiftedDate(checkDate, -1);
    }
  }

  // 2. Calculate Longest Streak
  let longestStreak = 0;
  let currentRun = 0;

  // Process sorted dates (newest to oldest)
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const prevDate = sortedDates[i - 1];
      const expectedPrev = getShiftedDate(sortedDates[i], 1);
      if (prevDate === expectedPrev) {
        currentRun++;
      } else {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  return {
    currentStreak,
    longestStreak,
  };
}
