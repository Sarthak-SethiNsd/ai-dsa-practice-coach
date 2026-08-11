import { ReviewHistoryEntry } from "./ai/aiTypes";
import { ReviewCollection } from "./collectionTypes";
import { RecommendationSnapshot, TopicPerformance } from "./recommendationTypes";
import { Platform, Difficulty } from "./types";
import {
  PracticeTask,
  DailyMission,
  WeeklyRoadmap,
  MonthlyGoal,
  PracticeRoadmap,
  RoadmapProgress,
  RoadmapAnalytics,
  CompletionTrendPoint,
  TopicAnalyticsItem,
  WeeklyTopicTarget,
  MasteryTarget,
  TopicMastery,
  TaskStatus,
} from "./roadmapTypes";

// ─── Static problem bank for deterministic task generation ───────────────────
// Each entry maps a topic to representative problems on LeetCode and Codeforces

interface ProblemTemplate {
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  url: string;
  platformProblemId: string;
  estimatedTime: string;
}

const PROBLEM_BANK: Record<string, ProblemTemplate[]> = {
  "Arrays": [
    { title: "Two Sum", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/", platformProblemId: "1", estimatedTime: "15 mins" },
    { title: "Best Time to Buy and Sell Stock", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", platformProblemId: "121", estimatedTime: "20 mins" },
    { title: "Contains Duplicate", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/contains-duplicate/", platformProblemId: "217", estimatedTime: "15 mins" },
    { title: "Product of Array Except Self", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/product-of-array-except-self/", platformProblemId: "238", estimatedTime: "30 mins" },
    { title: "Maximum Subarray", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/", platformProblemId: "53", estimatedTime: "25 mins" },
    { title: "Merge Intervals", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/merge-intervals/", platformProblemId: "56", estimatedTime: "30 mins" },
    { title: "Trapping Rain Water", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/", platformProblemId: "42", estimatedTime: "45 mins" },
  ],
  "Binary Search": [
    { title: "Binary Search", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/binary-search/", platformProblemId: "704", estimatedTime: "15 mins" },
    { title: "Search Insert Position", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/search-insert-position/", platformProblemId: "35", estimatedTime: "15 mins" },
    { title: "Find Minimum in Rotated Sorted Array", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", platformProblemId: "153", estimatedTime: "25 mins" },
    { title: "Search in Rotated Sorted Array", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", platformProblemId: "33", estimatedTime: "30 mins" },
    { title: "Median of Two Sorted Arrays", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", platformProblemId: "4", estimatedTime: "50 mins" },
  ],
  "Dynamic Programming": [
    { title: "Climbing Stairs", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/climbing-stairs/", platformProblemId: "70", estimatedTime: "20 mins" },
    { title: "House Robber", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/", platformProblemId: "198", estimatedTime: "25 mins" },
    { title: "Coin Change", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/", platformProblemId: "322", estimatedTime: "35 mins" },
    { title: "Longest Increasing Subsequence", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/", platformProblemId: "300", estimatedTime: "35 mins" },
    { title: "0/1 Knapsack", platform: "codeforces", difficulty: "Medium", url: "https://codeforces.com/problemset/problem/864/E", platformProblemId: "864E", estimatedTime: "40 mins" },
    { title: "Word Break", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/word-break/", platformProblemId: "139", estimatedTime: "35 mins" },
    { title: "Edit Distance", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/edit-distance/", platformProblemId: "72", estimatedTime: "50 mins" },
  ],
  "Trees & BST": [
    { title: "Maximum Depth of Binary Tree", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", platformProblemId: "104", estimatedTime: "15 mins" },
    { title: "Invert Binary Tree", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/invert-binary-tree/", platformProblemId: "226", estimatedTime: "15 mins" },
    { title: "Validate Binary Search Tree", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/validate-binary-search-tree/", platformProblemId: "98", estimatedTime: "30 mins" },
    { title: "Lowest Common Ancestor of a BST", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", platformProblemId: "235", estimatedTime: "25 mins" },
    { title: "Binary Tree Level Order Traversal", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", platformProblemId: "102", estimatedTime: "30 mins" },
    { title: "Serialize and Deserialize Binary Tree", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", platformProblemId: "297", estimatedTime: "55 mins" },
  ],
  "Graphs": [
    { title: "Number of Islands", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/", platformProblemId: "200", estimatedTime: "30 mins" },
    { title: "Clone Graph", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/clone-graph/", platformProblemId: "133", estimatedTime: "30 mins" },
    { title: "Course Schedule", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/", platformProblemId: "207", estimatedTime: "35 mins" },
    { title: "Word Ladder", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/word-ladder/", platformProblemId: "127", estimatedTime: "50 mins" },
    { title: "Dijkstra Shortest Path", platform: "codeforces", difficulty: "Medium", url: "https://codeforces.com/problemset/problem/20/C", platformProblemId: "20C", estimatedTime: "40 mins" },
  ],
  "Strings": [
    { title: "Valid Anagram", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/valid-anagram/", platformProblemId: "242", estimatedTime: "15 mins" },
    { title: "Valid Palindrome", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome/", platformProblemId: "125", estimatedTime: "15 mins" },
    { title: "Longest Substring Without Repeating Characters", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", platformProblemId: "3", estimatedTime: "30 mins" },
    { title: "Group Anagrams", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/", platformProblemId: "49", estimatedTime: "25 mins" },
    { title: "Minimum Window Substring", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-window-substring/", platformProblemId: "76", estimatedTime: "50 mins" },
  ],
  "Two Pointers": [
    { title: "Valid Palindrome II", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome-ii/", platformProblemId: "680", estimatedTime: "20 mins" },
    { title: "3Sum", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/", platformProblemId: "15", estimatedTime: "30 mins" },
    { title: "Container With Most Water", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/container-with-most-water/", platformProblemId: "11", estimatedTime: "25 mins" },
    { title: "Sort Colors", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/sort-colors/", platformProblemId: "75", estimatedTime: "20 mins" },
  ],
  "Sliding Window": [
    { title: "Maximum Average Subarray I", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/maximum-average-subarray-i/", platformProblemId: "643", estimatedTime: "20 mins" },
    { title: "Longest Repeating Character Replacement", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", platformProblemId: "424", estimatedTime: "35 mins" },
    { title: "Permutation in String", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/permutation-in-string/", platformProblemId: "567", estimatedTime: "30 mins" },
    { title: "Sliding Window Maximum", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-maximum/", platformProblemId: "239", estimatedTime: "45 mins" },
  ],
  "Edge Cases": [
    { title: "Missing Number", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/missing-number/", platformProblemId: "268", estimatedTime: "15 mins" },
    { title: "Single Number", platform: "leetcode", difficulty: "Easy", url: "https://leetcode.com/problems/single-number/", platformProblemId: "136", estimatedTime: "15 mins" },
    { title: "Find All Duplicates in an Array", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/find-all-duplicates-in-an-array/", platformProblemId: "442", estimatedTime: "25 mins" },
    { title: "First Missing Positive", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/first-missing-positive/", platformProblemId: "41", estimatedTime: "45 mins" },
  ],
  "Optimization": [
    { title: "Jump Game", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/jump-game/", platformProblemId: "55", estimatedTime: "25 mins" },
    { title: "Task Scheduler", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/task-scheduler/", platformProblemId: "621", estimatedTime: "30 mins" },
    { title: "Minimum Number of Arrows to Burst Balloons", platform: "leetcode", difficulty: "Medium", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/", platformProblemId: "452", estimatedTime: "30 mins" },
    { title: "Largest Rectangle in Histogram", platform: "leetcode", difficulty: "Hard", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", platformProblemId: "84", estimatedTime: "50 mins" },
  ],
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function masteryFromScore(score: number, reviews: number): TopicMastery {
  if (score >= 85 && reviews >= 3) return "Mastered";
  if (score >= 75) return "Proficient";
  if (score >= 60) return "Developing";
  return "Needs Attention";
}

function nextMastery(current: TopicMastery): TopicMastery {
  if (current === "Needs Attention") return "Developing";
  if (current === "Developing") return "Proficient";
  if (current === "Proficient") return "Mastered";
  return "Mastered";
}

function questionsNeededForNextLevel(current: TopicMastery): number {
  if (current === "Needs Attention") return 5;
  if (current === "Developing") return 4;
  if (current === "Proficient") return 3;
  return 2;
}

function selectProblems(
  topic: string,
  count: number,
  difficultyBias: "Easy" | "Medium" | "Hard" | "Balanced",
  excludeUrls: Set<string>
): ProblemTemplate[] {
  const pool = PROBLEM_BANK[topic] ?? PROBLEM_BANK["Arrays"];
  const filtered = pool.filter((p) => !excludeUrls.has(p.url));

  if (difficultyBias === "Balanced" || filtered.length <= count) {
    return filtered.slice(0, count);
  }

  const prioritized =
    difficultyBias === "Easy"
      ? filtered.filter((p) => p.difficulty === "Easy").concat(filtered.filter((p) => p.difficulty !== "Easy"))
      : difficultyBias === "Hard"
      ? filtered.filter((p) => p.difficulty === "Hard").concat(filtered.filter((p) => p.difficulty !== "Hard"))
      : filtered.filter((p) => p.difficulty === "Medium").concat(filtered.filter((p) => p.difficulty !== "Medium"));

  return prioritized.slice(0, count);
}

function taskFromTemplate(
  template: ProblemTemplate,
  topic: string,
  priority: PracticeTask["priority"],
  assignedDate: string,
  idSuffix: string
): PracticeTask {
  return {
    id: `task_${topic.replace(/\s+/g, "_").toLowerCase()}_${template.platformProblemId}_${idSuffix}`,
    title: template.title,
    platform: template.platform,
    difficulty: template.difficulty,
    topic,
    estimatedTime: template.estimatedTime,
    priority,
    status: "Not Started" as TaskStatus,
    problemUrl: template.url,
    platformProblemId: template.platformProblemId,
    assignedDate,
  };
}

// ─── Adaptive Difficulty Bias ─────────────────────────────────────────────────

function computeDifficultyBias(
  readinessScore: number,
  topicScore: number
): "Easy" | "Medium" | "Hard" | "Balanced" {
  const combined = (readinessScore + topicScore) / 2;
  if (combined < 60) return "Easy";
  if (combined < 72) return "Balanced";
  if (combined < 85) return "Medium";
  return "Hard";
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export function generatePracticeRoadmap(
  recommendation: RecommendationSnapshot,
  entries: ReviewHistoryEntry[],
  _collections: ReviewCollection[]
): PracticeRoadmap {
  const now = new Date();
  const today = getTodayString();
  const overallScore = recommendation.overallReadinessScore;

  const topicPerf = recommendation.topicPerformance;
  const weakTopics = recommendation.weakTopics;
  const learningPlan = recommendation.learningPlan;

  // Build a score map keyed by topic name
  const scoreMap = new Map<string, number>();
  topicPerf.forEach((tp) => {
    scoreMap.set(tp.topic, tp.avgScore);
  });

  // Build a mastery map
  const masteryMap = new Map<string, TopicMastery>();
  topicPerf.forEach((tp) => {
    masteryMap.set(tp.topic, masteryFromScore(tp.avgScore, tp.totalReviews));
  });

  // Track already-used problem URLs to avoid duplicates
  const usedUrls = new Set<string>();
  // Also factor in review history problem titles already solved
  const solvedTitles = new Set(
    entries.filter((e) => e.problemTitle).map((e) => e.problemTitle!.toLowerCase())
  );

  // ─── Determine ordered priority topics ──────────────────────────────────────
  const primaryTopic = weakTopics.weakestTopic?.name ?? learningPlan.today.focusArea ?? "Arrays";
  const secondaryTopic = weakTopics.secondWeakestTopic?.name ?? learningPlan.thisWeek.topTopicsToStudy[1] ?? "Binary Search";
  const tertiaryTopic = weakTopics.mostNeglectedTopic?.name ?? learningPlan.thisWeek.topTopicsToStudy[2] ?? "Dynamic Programming";
  const weekTopics = [primaryTopic, secondaryTopic, tertiaryTopic];

  // Adaptive level
  let adaptationLevel: PracticeRoadmap["adaptationLevel"] = "Intermediate";
  if (overallScore < 60) adaptationLevel = "Beginner";
  else if (overallScore >= 80) adaptationLevel = "Advanced";

  // ─── 1. Daily Mission (2–4 tasks, primary topic focus) ──────────────────────
  const primaryScore = scoreMap.get(primaryTopic) ?? 65;
  const dailyDiffBias = computeDifficultyBias(overallScore, primaryScore);
  const dailyTaskCount = overallScore < 60 ? 2 : overallScore < 80 ? 3 : 4;

  const dailyTemplates = selectProblems(primaryTopic, dailyTaskCount, dailyDiffBias, usedUrls);
  const dailyTasks: PracticeTask[] = dailyTemplates
    .filter((t) => !solvedTitles.has(t.title.toLowerCase()))
    .map((tmpl, idx) =>
      taskFromTemplate(tmpl, primaryTopic, "High", today, `d${idx}`)
    );
  dailyTasks.forEach((t) => usedUrls.add(t.problemUrl));

  const dailyEstMins = dailyTasks.reduce((acc, t) => {
    const mins = parseInt(t.estimatedTime) || 20;
    return acc + mins;
  }, 0);
  const dailyEstHrs = dailyEstMins >= 60 ? `${(dailyEstMins / 60).toFixed(1)} hrs` : `${dailyEstMins} mins`;

  const dailyMission: DailyMission = {
    date: today,
    focusTopic: primaryTopic,
    targetQuestions: dailyTasks.length,
    tasks: dailyTasks,
    estimatedDuration: dailyEstHrs,
    completedCount: 0,
    isComplete: false,
    motivationalNote: `Focus on ${primaryTopic} today — consistency builds mastery. You've got this!`,
  };

  // ─── 2. Weekly Roadmap (15–25 tasks across 3 priority topics) ───────────────
  const weekStart = getWeekStart(now);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = addDays(weekStartStr, 6);

  const weeklyTasks: PracticeTask[] = [];
  const topicTargets: WeeklyTopicTarget[] = [];
  const diffCounts = { easy: 0, medium: 0, hard: 0 };

  weekTopics.forEach((topic, idx) => {
    const tScore = scoreMap.get(topic) ?? 65;
    const bias = computeDifficultyBias(overallScore, tScore);
    const count = idx === 0 ? 6 : idx === 1 ? 5 : 4;
    const priority = idx === 0 ? "High" : idx === 1 ? "Medium" : "Low";
    const dayOffset = idx * 2;

    const templates = selectProblems(topic, count, bias, usedUrls);
    const tasks = templates
      .filter((t) => !solvedTitles.has(t.title.toLowerCase()))
      .map((tmpl, i) =>
        taskFromTemplate(tmpl, topic, priority as PracticeTask["priority"], addDays(weekStartStr, dayOffset + Math.floor(i / 2)), `w${idx}${i}`)
      );

    tasks.forEach((t) => {
      usedUrls.add(t.problemUrl);
      if (t.difficulty === "Easy") diffCounts.easy++;
      else if (t.difficulty === "Medium") diffCounts.medium++;
      else diffCounts.hard++;
    });

    weeklyTasks.push(...tasks);
    topicTargets.push({
      topic,
      targetCount: tasks.length,
      completedCount: 0,
      mastery: masteryMap.get(topic) ?? "Needs Attention",
    });
  });

  const weeklyEstHrs = parseFloat(
    (weeklyTasks.reduce((acc, t) => acc + (parseInt(t.estimatedTime) || 20), 0) / 60).toFixed(1)
  );

  const weeklyRoadmap: WeeklyRoadmap = {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    priorityTopics: weekTopics,
    topicTargets,
    assignedTasks: weeklyTasks,
    completionTarget: weeklyTasks.length,
    completedCount: 0,
    difficultyMix: diffCounts,
    estimatedStudyHours: weeklyEstHrs,
  };

  // ─── 3. Monthly Goal ─────────────────────────────────────────────────────────
  const monthLabel = formatMonthLabel(now);
  const monthTopics = recommendation.learningPlan.thisWeek.topTopicsToStudy.slice(0, 3);
  const targetReadiness = recommendation.learningPlan.thisMonth.targetReadinessScore;

  const masteryTargets: MasteryTarget[] = monthTopics.map((topic) => {
    const currentMastery = masteryMap.get(topic) ?? "Needs Attention";
    return {
      topic,
      currentMastery,
      targetMastery: nextMastery(currentMastery),
      questionsNeeded: questionsNeededForNextLevel(currentMastery) * 4,
      questionsCompleted: 0,
    };
  });

  const totalMonthlyQuestions = masteryTargets.reduce((acc, m) => acc + m.questionsNeeded, 0);

  const monthlyGoal: MonthlyGoal = {
    monthLabel,
    targetTopics: monthTopics,
    totalQuestions: totalMonthlyQuestions,
    completedQuestions: 0,
    improvementObjective: recommendation.learningPlan.thisMonth.longTermTarget,
    targetReadinessScore: targetReadiness,
    currentReadinessScore: overallScore,
    masteryTargets,
  };

  // ─── 4. All tasks flat list ──────────────────────────────────────────────────
  const uniqueTaskMap = new Map<string, PracticeTask>();
  [...dailyTasks, ...weeklyTasks].forEach((t) => {
    if (!uniqueTaskMap.has(t.id)) uniqueTaskMap.set(t.id, t);
  });
  const allTasks = Array.from(uniqueTaskMap.values());

  return {
    id: `roadmap_${now.getTime()}`,
    generatedAt: now.toISOString(),
    basedOnReadinessScore: overallScore,
    dailyMission,
    weeklyRoadmap,
    monthlyGoal,
    allTasks,
    adaptationLevel,
    summaryNote: `Roadmap generated from ${entries.length} review entries targeting ${primaryTopic}, ${secondaryTopic}, and ${tertiaryTopic}.`,
  };
}

// ─── Progress Calculator ──────────────────────────────────────────────────────

export function computeRoadmapProgress(
  allTasks: PracticeTask[],
  completedTaskIds: Set<string>
): RoadmapProgress {
  const total = allTasks.length;
  const completed = allTasks.filter((t) => completedTaskIds.has(t.id)).length;
  const skipped = allTasks.filter((t) => t.status === "Skipped").length;
  const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Difficulty average
  const completedTasks = allTasks.filter((t) => completedTaskIds.has(t.id));
  const diffScores = completedTasks.map((t) =>
    t.difficulty === "Easy" ? 1 : t.difficulty === "Medium" ? 2 : 3
  );
  const avgDiff =
    diffScores.length > 0
      ? diffScores.reduce((a, b) => a + b, 0) / diffScores.length
      : 1;
  const averageDifficulty =
    avgDiff < 1.5 ? "Easy" : avgDiff < 2.5 ? "Medium" : "Hard";

  // Streak: count consecutive days with at least one completion
  const dateSet = new Set<string>();
  allTasks
    .filter((t) => completedTaskIds.has(t.id) && t.completedDate)
    .forEach((t) => dateSet.add(t.completedDate!.split("T")[0]));

  const sortedDates = Array.from(dateSet).sort().reverse();
  let streak = 0;
  let lastActiveDate: string | null = null;
  if (sortedDates.length > 0) {
    lastActiveDate = sortedDates[0];
    const today = new Date().toISOString().split("T")[0];
    let check = today;
    for (const d of sortedDates) {
      if (d === check) {
        streak++;
        const prev = new Date(check);
        prev.setDate(prev.getDate() - 1);
        check = prev.toISOString().split("T")[0];
      } else {
        break;
      }
    }
  }

  const consistencyScore = Math.min(100, Math.round(streak * 14 + completionRate * 0.3));

  return {
    totalAssigned: total,
    completed,
    skipped,
    inProgress,
    completionRate,
    averageDifficulty,
    streak,
    consistencyScore,
    lastActiveDate,
  };
}

// ─── Analytics Calculator ─────────────────────────────────────────────────────

export function computeRoadmapAnalytics(
  allTasks: PracticeTask[],
  completedTaskIds: Set<string>,
  topicPerformance: TopicPerformance[]
): RoadmapAnalytics {
  // Per topic breakdown
  const topicMap = new Map<string, { assigned: number; completed: number; diffs: number[] }>();
  allTasks.forEach((t) => {
    if (!topicMap.has(t.topic)) topicMap.set(t.topic, { assigned: 0, completed: 0, diffs: [] });
    const entry = topicMap.get(t.topic)!;
    entry.assigned++;
    if (completedTaskIds.has(t.id)) {
      entry.completed++;
      entry.diffs.push(t.difficulty === "Easy" ? 1 : t.difficulty === "Medium" ? 2 : 3);
    }
  });

  const topicBreakdown: TopicAnalyticsItem[] = Array.from(topicMap.entries()).map(
    ([topic, data]) => {
      const rate = data.assigned > 0 ? Math.round((data.completed / data.assigned) * 100) : 0;
      const avgD =
        data.diffs.length > 0
          ? data.diffs.reduce((a, b) => a + b, 0) / data.diffs.length
          : 1;
      return {
        topic,
        assigned: data.assigned,
        completed: data.completed,
        completionRate: rate,
        avgDifficulty: avgD < 1.5 ? "Easy" : avgD < 2.5 ? "Medium" : "Hard",
      };
    }
  );

  const sorted = [...topicBreakdown].sort((a, b) => b.completionRate - a.completionRate);
  const strongestImprovement = sorted[0]?.topic ?? null;
  const weakestImprovement = sorted[sorted.length - 1]?.topic ?? null;

  const sortedByCompleted = [...topicBreakdown].sort((a, b) => b.completed - a.completed);
  const mostSolvedTopic = sortedByCompleted[0]?.topic ?? null;
  const leastSolvedTopic = sortedByCompleted[sortedByCompleted.length - 1]?.topic ?? null;

  // Completion trend
  const dateMap = new Map<string, { completed: number; assigned: number }>();
  allTasks.forEach((t) => {
    const d = t.assignedDate;
    if (!dateMap.has(d)) dateMap.set(d, { completed: 0, assigned: 0 });
    dateMap.get(d)!.assigned++;
    if (completedTaskIds.has(t.id)) dateMap.get(d)!.completed++;
  });

  let cumulative = 0;
  const completionTrend: CompletionTrendPoint[] = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => {
      cumulative += data.completed;
      return { date, completed: data.completed, assigned: data.assigned, cumulativeCompleted: cumulative };
    });

  // Estimated readiness increase (5 pts per 10 tasks completed)
  const completedCount = allTasks.filter((t) => completedTaskIds.has(t.id)).length;
  const estimatedReadinessIncrease = Math.min(20, Math.round((completedCount / 10) * 5));

  // Difficulty breakdown across all tasks
  const diffBreakdown = { easy: 0, medium: 0, hard: 0 };
  allTasks.forEach((t) => {
    if (t.difficulty === "Easy") diffBreakdown.easy++;
    else if (t.difficulty === "Medium") diffBreakdown.medium++;
    else diffBreakdown.hard++;
  });

  void topicPerformance; // acknowledged, used for future adaptive scoring

  return {
    strongestImprovement,
    weakestImprovement,
    mostSolvedTopic,
    leastSolvedTopic,
    completionTrend,
    estimatedReadinessIncrease,
    topicBreakdown,
    difficultyBreakdown: diffBreakdown,
  };
}
