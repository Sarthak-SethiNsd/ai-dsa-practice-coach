import {
  RevisionItem,
  RevisionFeedback,
  RevisionHistoryRecord,
  TopicRetentionMetric,
  RevisionCalendarDay,
  AiRevisionCoachReport,
  RevisionNotification,
  RevisionDashboardMetrics,
  FullSpacedRepetitionData,
} from "./revisionTypes";
import { Difficulty } from "@/services/types";

const ALL_DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Sorting",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Math",
  "Bit Manipulation",
  "Hash Table",
  "Heaps",
];

// Base initial intervals by difficulty (in days)
const INITIAL_INTERVALS: Record<Difficulty, number[]> = {
  Easy: [3, 14, 30, 60],
  Medium: [1, 7, 21, 45],
  Hard: [1, 3, 7, 14, 30],
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Computes memory strength (0-100%) using Ebbinghaus forgetting curve decay model.
 * S = 100 * e^(-daysElapsed / (interval * easeFactor))
 */
export function calculateMemoryStrength(
  lastRevisedDateStr: string,
  intervalDays: number,
  easeFactor: number
): number {
  const lastDate = new Date(lastRevisedDateStr);
  const now = new Date();
  const daysElapsed = Math.max(
    0,
    (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const halfLife = Math.max(1, intervalDays * easeFactor);
  const strength = 100 * Math.exp((-0.5 * daysElapsed) / halfLife);
  return clamp(Math.round(strength), 5, 100);
}

/**
 * SuperMemo SM-2 inspired adaptive scheduling function.
 * Given feedback ('remembered' | 'forgotten' | 'hard' | 'easy'), returns new SRS state.
 */
export function computeNextRevisionState(
  item: RevisionItem,
  feedback: RevisionFeedback,
  aiScore?: number
): {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  memoryStrength: number;
  nextDueDate: string;
  successRate: number;
  newHistoryRecord: RevisionHistoryRecord;
} {
  let { repetitions, easeFactor } = item;
  const difficultyBase = INITIAL_INTERVALS[item.difficulty] || INITIAL_INTERVALS.Medium;

  let quality = 3; // 0-5 scale in SM-2
  if (feedback === "easy") quality = 5;
  else if (feedback === "remembered") quality = 4;
  else if (feedback === "hard") quality = 3;
  else if (feedback === "forgotten") quality = 1;

  // Adjust quality slightly with AI review score if present
  if (aiScore !== undefined) {
    if (aiScore >= 90 && quality >= 3) quality = Math.min(5, quality + 1);
    else if (aiScore < 60) quality = Math.max(1, quality - 1);
  }

  // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easeFactor = clamp(easeFactor + efDelta, 1.3, 3.2);

  let newInterval = 1;

  if (quality < 3) {
    // Reset repetitions on failure
    repetitions = 0;
    newInterval = 1;
  } else {
    repetitions += 1;
    if (repetitions <= difficultyBase.length) {
      newInterval = difficultyBase[repetitions - 1];
    } else {
      newInterval = Math.round(item.intervalDays * easeFactor);
    }
  }

  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + newInterval);
  const nextDueDateStr = formatDate(nextDue);
  const nowIso = new Date().toISOString();

  // Success rate update
  const totalHistory = item.history.length + 1;
  const prevSuccesses = item.history.filter(
    (h) => h.feedback === "remembered" || h.feedback === "easy"
  ).length;
  const currentSuccess = quality >= 3 ? 1 : 0;
  const newSuccessRate = Math.round(((prevSuccesses + currentSuccess) / totalHistory) * 100);

  const memoryStrengthAfter = quality >= 3 ? Math.min(100, 85 + quality * 3) : 30;

  const newHistoryRecord: RevisionHistoryRecord = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    revisedAt: nowIso,
    feedback,
    aiScore,
    intervalDays: newInterval,
    memoryStrengthAfter,
  };

  return {
    repetitions,
    intervalDays: newInterval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    memoryStrength: memoryStrengthAfter,
    nextDueDate: nextDueDateStr,
    successRate: newSuccessRate,
    newHistoryRecord,
  };
}

/**
 * Computes Dashboard Metrics across all revision items.
 */
export function computeRevisionDashboardMetrics(
  items: RevisionItem[]
): RevisionDashboardMetrics {
  const todayStr = formatDate(new Date());

  let dueTodayCount = 0;
  let overdueCount = 0;
  let upcoming7DaysCount = 0;
  let totalRevisionsCompleted = 0;

  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in7DaysStr = formatDate(in7Days);

  items.forEach((item) => {
    totalRevisionsCompleted += item.history.length;

    if (item.nextDueDate === todayStr) {
      dueTodayCount++;
    } else if (item.nextDueDate < todayStr) {
      overdueCount++;
    } else if (item.nextDueDate > todayStr && item.nextDueDate <= in7DaysStr) {
      upcoming7DaysCount++;
    }
  });

  const totalStrengths = items.reduce(
    (sum, item) =>
      sum +
      calculateMemoryStrength(
        item.lastRevisedAt || item.lastSolvedAt,
        item.intervalDays,
        item.easeFactor
      ),
    0
  );

  const overallRetentionScore =
    items.length > 0 ? Math.round(totalStrengths / items.length) : 100;

  // Streak: consecutive days with at least 1 revision completed
  let revisionStreak = 0;
  const historyDates = new Set<string>();
  items.forEach((item) =>
    item.history.forEach((h) => historyDates.add(h.revisedAt.split("T")[0]))
  );

  const checkDate = new Date();
  while (historyDates.has(formatDate(checkDate))) {
    revisionStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    dueTodayCount,
    overdueCount,
    upcoming7DaysCount,
    revisionStreak,
    totalRevisionsCompleted,
    overallRetentionScore,
    memoryDecayRate30d: clamp(100 - overallRetentionScore, 5, 40),
  };
}

/**
 * Computes Topic Retention Metrics per DSA topic.
 */
export function computeTopicRetentionMetrics(
  items: RevisionItem[]
): TopicRetentionMetric[] {
  const todayStr = formatDate(new Date());

  return ALL_DSA_TOPICS.map((topic) => {
    const matching = items.filter((i) =>
      i.topics.some((t) => t.toLowerCase() === topic.toLowerCase())
    );

    if (matching.length === 0) {
      return {
        topic,
        retentionPercentage: 80,
        forgettingRate: 20,
        totalRevisions: 0,
        avgMemoryStrength: 80,
        dueCount: 0,
        overdueCount: 0,
        status: "strong",
      };
    }

    const totalRevisions = matching.reduce((s, i) => s + i.history.length, 0);
    const avgMemoryStrength = Math.round(
      matching.reduce(
        (s, i) =>
          s +
          calculateMemoryStrength(
            i.lastRevisedAt || i.lastSolvedAt,
            i.intervalDays,
            i.easeFactor
          ),
        0
      ) / matching.length
    );

    const retentionPercentage = Math.round(
      matching.reduce((s, i) => s + i.successRate, 0) / matching.length
    );

    const dueCount = matching.filter((i) => i.nextDueDate === todayStr).length;
    const overdueCount = matching.filter((i) => i.nextDueDate < todayStr).length;

    let status: "strong" | "moderate" | "at_risk" = "strong";
    if (retentionPercentage < 60 || overdueCount >= 2) status = "at_risk";
    else if (retentionPercentage < 80 || dueCount >= 2) status = "moderate";

    return {
      topic,
      retentionPercentage,
      forgettingRate: 100 - retentionPercentage,
      totalRevisions,
      avgMemoryStrength,
      dueCount,
      overdueCount,
      status,
    };
  });
}

/**
 * Computes Monthly Revision Calendar Grid.
 */
export function computeRevisionCalendarGrid(
  items: RevisionItem[],
  year?: number,
  month?: number
): RevisionCalendarDay[] {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth(); // 0-indexed

  const firstDay = new Date(targetYear, targetMonth, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const calendarDays: RevisionCalendarDay[] = [];
  const todayStr = formatDate(now);

  // Pre-fill 35-day or 42-day grid
  const startDate = new Date(targetYear, targetMonth, 1 - startDayOfWeek);

  for (let i = 0; i < 35; i++) {
    const curr = new Date(startDate);
    curr.setDate(startDate.getDate() + i);
    const dateStr = formatDate(curr);

    const dayItems = items.filter((item) => item.nextDueDate === dateStr);
    const dueCount = dayItems.filter((i) => i.nextDueDate >= todayStr).length;
    const missedCount = dayItems.filter((i) => i.nextDueDate < todayStr).length;
    const completedCount = items.filter((item) =>
      item.history.some((h) => h.revisedAt.startsWith(dateStr))
    ).length;

    calendarDays.push({
      date: dateStr,
      dayOfMonth: curr.getDate(),
      isCurrentMonth: curr.getMonth() === targetMonth,
      isToday: dateStr === todayStr,
      dueCount,
      completedCount,
      missedCount,
      items: dayItems,
    });
  }

  return calendarDays;
}

/**
 * Computes AI Revision Coach report.
 */
export function computeAiRevisionCoachReport(
  items: RevisionItem[],
  topicMetrics: TopicRetentionMetric[]
): AiRevisionCoachReport {
  const todayStr = formatDate(new Date());

  const weakTopics = topicMetrics
    .filter((t) => t.status === "at_risk" || t.retentionPercentage < 75)
    .map((t) => t.topic);

  // Identify forgotten concepts
  const forgottenItems = items.filter((i) =>
    i.history.some((h) => h.feedback === "forgotten") || i.nextDueDate < todayStr
  );

  const forgottenConcepts = forgottenItems.slice(0, 4).map((item) => ({
    topic: item.topics[0] || "General",
    conceptName: item.problemTitle,
    lastFailedDate: item.lastRevisedAt || item.lastSolvedAt,
    associatedProblems: [item.problemTitle],
    recommendation: `Re-implement ${item.problemTitle} from scratch and review takeaways.`,
  }));

  // Recommended revision order: overdue first, then lowest memory strength
  const recommendedRevisionOrder = [...items].sort((a, b) => {
    const aOverdue = a.nextDueDate < todayStr ? 1 : 0;
    const bOverdue = b.nextDueDate < todayStr ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    const aStrength = calculateMemoryStrength(a.lastRevisedAt || a.lastSolvedAt, a.intervalDays, a.easeFactor);
    const bStrength = calculateMemoryStrength(b.lastRevisedAt || b.lastSolvedAt, b.intervalDays, b.easeFactor);
    return aStrength - bStrength;
  });

  const avgMastery =
    items.length > 0
      ? Math.round(
          items.reduce((s, i) => s + i.successRate * (i.memoryStrength / 100), 0) /
            items.length
        )
      : 80;

  const coachingNotes = [
    weakTopics.length > 0
      ? `Prioritize reviewing ${weakTopics.slice(0, 2).join(" and ")} to rebuild memory decay.`
      : "Your memory retention is performing well across all active topics!",
    "Short 15-minute daily revision sessions beat long weekly cramming sessions.",
    "Solve problems without looking at prior solutions first to trigger active recall.",
  ];

  return {
    weakTopics,
    forgottenConcepts,
    recommendedRevisionOrder,
    estimatedOverallMastery: avgMastery,
    coachingNotes,
  };
}

/**
 * Computes in-app notifications based on SRS state.
 */
export function computeRevisionNotifications(
  dashboard: RevisionDashboardMetrics,
  overdueItems: RevisionItem[]
): RevisionNotification[] {
  const notifs: RevisionNotification[] = [];
  const todayIso = new Date().toISOString();

  if (dashboard.dueTodayCount > 0) {
    notifs.push({
      id: "notif_due_today",
      type: "due_today",
      title: `${dashboard.dueTodayCount} Revision${dashboard.dueTodayCount > 1 ? "s" : ""} Due Today`,
      message: `Keep your memory strength high by completing today's revision queue.`,
      severity: "info",
      date: todayIso,
      read: false,
    });
  }

  if (overdueItems.length > 0) {
    notifs.push({
      id: "notif_overdue",
      type: "overdue",
      title: `${overdueItems.length} Overdue Revision${overdueItems.length > 1 ? "s" : ""}`,
      message: `Problems like "${overdueItems[0].problemTitle}" are slipping on the forgetting curve.`,
      severity: "warning",
      date: todayIso,
      read: false,
    });
  }

  if (dashboard.revisionStreak > 0) {
    notifs.push({
      id: "notif_streak",
      type: "streak_risk",
      title: `${dashboard.revisionStreak}-Day Revision Streak!`,
      message: `Complete 1 revision today to maintain your active SRS streak.`,
      severity: "success",
      date: todayIso,
      read: false,
    });
  }

  return notifs;
}

/**
 * Master computation aggregator.
 */
export function computeFullSpacedRepetitionData(
  items: RevisionItem[],
  customNotifs: RevisionNotification[] = []
): FullSpacedRepetitionData {
  const todayStr = formatDate(new Date());

  // Set items status dynamically
  const updatedItems: RevisionItem[] = items.map((item) => {
    let status = item.status;
    if (item.nextDueDate < todayStr) status = "overdue";
    else if (item.nextDueDate === todayStr) status = "due";
    else status = "upcoming";

    const memoryStrength = calculateMemoryStrength(
      item.lastRevisedAt || item.lastSolvedAt,
      item.intervalDays,
      item.easeFactor
    );

    return { ...item, status, memoryStrength };
  });

  const dueTodayItems = updatedItems.filter((i) => i.status === "due");
  const overdueItems = updatedItems.filter((i) => i.status === "overdue");
  const upcomingItems = updatedItems.filter((i) => i.status === "upcoming");

  const dashboard = computeRevisionDashboardMetrics(updatedItems);
  const topicMetrics = computeTopicRetentionMetrics(updatedItems);
  const calendarDays = computeRevisionCalendarGrid(updatedItems);
  const coachReport = computeAiRevisionCoachReport(updatedItems, topicMetrics);
  const autoNotifs = computeRevisionNotifications(dashboard, overdueItems);

  // Combine custom & auto notifications uniquely
  const notifMap = new Map<string, RevisionNotification>();
  autoNotifs.forEach((n) => notifMap.set(n.id, n));
  customNotifs.forEach((n) => notifMap.set(n.id, n));

  return {
    dashboard,
    dueTodayItems,
    overdueItems,
    upcomingItems,
    allItems: updatedItems,
    topicMetrics,
    calendarDays,
    coachReport,
    notifications: Array.from(notifMap.values()),
    lastUpdated: new Date().toISOString(),
  };
}
