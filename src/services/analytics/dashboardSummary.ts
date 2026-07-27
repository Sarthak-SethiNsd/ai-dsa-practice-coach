import { DailyPracticeSession } from "@/services/types";
import { parseEstimatedMinutes, formatTotalTime } from "./analyticsUtils";
import { calculateStreaks } from "./streakCalculator";
import { getTodayDateString } from "@/utils/dateUtils";

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  label: string; // "Mon", "Tue", etc.
  dayNum: string; // "Jul 26"
  completed: number;
  total: number;
  pct: number;
  goalMet: boolean;
}

export interface PlatformBreakdown {
  platform: string; // "leetcode" | "codeforces"
  label: string; // "LeetCode" | "Codeforces"
  completed: number;
  total: number;
  pct: number;
}

export interface TopicStat {
  topic: string;
  count: number;
}

export interface DashboardSummary {
  totalSessions: number;
  totalCompleted: number;
  totalSkipped: number;
  avgCompletionPct: number;
  currentStreak: number;
  longestStreak: number;
  todayCompleted: number;
  todayTotal: number;
  todayRemaining: number;
  todayPct: number;
  weeklyActivity: DailyActivity[];
  platformBreakdown: PlatformBreakdown[];
  topTopics: TopicStat[];
  recentSessions: DailyPracticeSession[];
  totalPracticeTimeFormatted: string;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatShortDate(dateStr: string): { label: string; dayNum: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const label = WEEKDAY_NAMES[date.getDay()];
  const dayNum = `${MONTH_NAMES[date.getMonth()]} ${d}`;
  return { label, dayNum };
}

/**
 * Generates an array of date strings (YYYY-MM-DD) for the last 7 days ending on today.
 */
function getLast7DaysDates(todayStr: string): string[] {
  const [y, m, d] = todayStr.split("-").map(Number);
  const dates: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

/**
 * Pure function that computes all analytics metrics for the Dashboard.
 */
export function computeDashboardSummary(
  archivedSessions: DailyPracticeSession[],
  liveDailySession: DailyPracticeSession | null
): DashboardSummary {
  const todayStr = getTodayDateString();

  // Combine archive and live session seamlessly
  const sessionMap = new Map<string, DailyPracticeSession>();
  archivedSessions.forEach(s => sessionMap.set(s.date, s));
  if (liveDailySession) {
    sessionMap.set(liveDailySession.date, liveDailySession);
  }

  const allSessions = Array.from(sessionMap.values()).sort((a, b) => b.date.localeCompare(a.date));

  // 1. Overall Stats
  const totalSessions = allSessions.length;
  let totalQuestions = 0;
  let totalCompleted = 0;
  let totalSkipped = 0;
  let totalMinutes = 0;

  const platformMap = new Map<string, { completed: number; total: number }>();
  platformMap.set("leetcode", { completed: 0, total: 0 });
  platformMap.set("codeforces", { completed: 0, total: 0 });

  const topicCountMap = new Map<string, number>();

  allSessions.forEach(session => {
    totalQuestions += session.metadata.totalQuestions;
    totalCompleted += session.metadata.completedCount;
    totalSkipped += session.metadata.skippedCount;

    session.questions.forEach(q => {
      totalMinutes += parseEstimatedMinutes(q.estimated);

      // Platform stats
      const pStats = platformMap.get(q.platform) || { completed: 0, total: 0 };
      pStats.total++;
      if (q.status === "Completed") {
        pStats.completed++;
      }
      platformMap.set(q.platform, pStats);

      // Topic stats
      q.topics.forEach(t => {
        topicCountMap.set(t, (topicCountMap.get(t) || 0) + 1);
      });
    });
  });

  const avgCompletionPct =
    totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;

  // 2. Streaks
  const { currentStreak, longestStreak } = calculateStreaks(allSessions);

  // 3. Today's Progress
  const todaySession = sessionMap.get(todayStr) || null;
  const todayCompleted = todaySession ? todaySession.metadata.completedCount : 0;
  const todayTotal = todaySession ? todaySession.metadata.totalQuestions : 0;
  const todayRemaining = Math.max(0, todayTotal - todayCompleted);
  const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // 4. Platform Breakdown
  const platformBreakdown: PlatformBreakdown[] = [
    {
      platform: "leetcode",
      label: "LeetCode",
      completed: platformMap.get("leetcode")?.completed || 0,
      total: platformMap.get("leetcode")?.total || 0,
      pct:
        (platformMap.get("leetcode")?.total || 0) > 0
          ? Math.round(
              ((platformMap.get("leetcode")?.completed || 0) /
                (platformMap.get("leetcode")?.total || 1)) *
                100
            )
          : 0,
    },
    {
      platform: "codeforces",
      label: "Codeforces",
      completed: platformMap.get("codeforces")?.completed || 0,
      total: platformMap.get("codeforces")?.total || 0,
      pct:
        (platformMap.get("codeforces")?.total || 0) > 0
          ? Math.round(
              ((platformMap.get("codeforces")?.completed || 0) /
                (platformMap.get("codeforces")?.total || 1)) *
                100
            )
          : 0,
    },
  ];

  // 5. Top Topics (Top 8 sorted by count desc)
  const topTopics: TopicStat[] = Array.from(topicCountMap.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 6. Weekly Activity (Last 7 Days)
  const last7Dates = getLast7DaysDates(todayStr);
  const weeklyActivity: DailyActivity[] = last7Dates.map(dateStr => {
    const session = sessionMap.get(dateStr);
    const completed = session ? session.metadata.completedCount : 0;
    const total = session ? session.metadata.totalQuestions : 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const goalMet = total > 0 && completed === total;
    const { label, dayNum } = formatShortDate(dateStr);

    return {
      date: dateStr,
      label,
      dayNum,
      completed,
      total,
      pct,
      goalMet,
    };
  });

  // 7. Recent Sessions (5 most recent)
  const recentSessions = allSessions.slice(0, 5);

  return {
    totalSessions,
    totalCompleted,
    totalSkipped,
    avgCompletionPct,
    currentStreak,
    longestStreak,
    todayCompleted,
    todayTotal,
    todayRemaining,
    todayPct,
    weeklyActivity,
    platformBreakdown,
    topTopics,
    recentSessions,
    totalPracticeTimeFormatted: formatTotalTime(totalMinutes),
  };
}
