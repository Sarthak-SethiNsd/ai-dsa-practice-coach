import {
  RecommendationHistoryItem,
  RecommendationFeedbackAction,
  RecommendationMode,
  AdaptiveProblemRecommendation,
} from "./recommendationTypes";
import { Platform, Difficulty } from "@/services/types";

const HISTORY_KEY = "dsa_adaptive_rec_history";
const DISMISSED_KEY = "dsa_adaptive_rec_dismissed";
const COOLDOWN_KEY = "dsa_adaptive_rec_cooldown";
const MAX_HISTORY = 200;

// ─── Storage helpers ─────────────────────────────────────────────────────────

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getRecommendationHistory(): RecommendationHistoryItem[] {
  if (!isClient()) return buildSeedHistory();
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      const seed = buildSeedHistory();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : buildSeedHistory();
  } catch {
    return buildSeedHistory();
  }
}

export function saveRecommendationHistory(items: RecommendationHistoryItem[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch (err) {
    console.error("[recommendationHistory] Save error:", err);
  }
}

export function logRecommendationFeedback(
  rec: AdaptiveProblemRecommendation,
  action: RecommendationFeedbackAction
): void {
  const existing = getRecommendationHistory();
  const historyItem: RecommendationHistoryItem = {
    id: `${rec.problemId}-${Date.now()}`,
    problemId: rec.problemId,
    platformProblemId: rec.platformProblemId,
    platform: rec.platform,
    title: rec.title,
    url: rec.url,
    difficulty: rec.difficulty,
    topics: rec.topics,
    targetSkill: rec.targetSkill,
    targetPattern: rec.targetPattern,
    recommendationScore: rec.recommendationScore,
    reason: rec.reason,
    action,
    mode: rec.mode,
    timestamp: new Date().toISOString(),
  };
  saveRecommendationHistory([historyItem, ...existing]);
}

// ─── Dismissed / Cooldown tracking ───────────────────────────────────────────

export function getDismissedProblemIds(): Set<number> {
  if (!isClient()) return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

export function dismissProblem(problemId: number): void {
  if (!isClient()) return;
  const existing = getDismissedProblemIds();
  existing.add(problemId);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(existing)));
}

export function clearDismissals(): void {
  if (!isClient()) return;
  localStorage.removeItem(DISMISSED_KEY);
}

// ─── Recent topic / pattern tracking from history ─────────────────────────────

export function getRecentHistoryTopics(lastN = 15): string[] {
  const history = getRecommendationHistory();
  return history
    .slice(0, lastN)
    .flatMap((h) => h.topics);
}

export function getRecentHistoryPatterns(lastN = 15): string[] {
  const history = getRecommendationHistory();
  return history
    .slice(0, lastN)
    .map((h) => h.targetPattern)
    .filter(Boolean);
}

// ─── Feedback Analytics ───────────────────────────────────────────────────────

export function getRecommendationAnalytics(history: RecommendationHistoryItem[]) {
  const total = history.length;
  const solved = history.filter((h) => h.action === "solved" || h.action === "solved_independently" || h.action === "solved_with_hints").length;
  const failed = history.filter((h) => h.action === "failed").length;
  const skipped = history.filter((h) => h.action === "skipped").length;
  const dismissed = history.filter((h) => h.action === "dismissed").length;
  const addedToRevision = history.filter((h) => h.action === "added_to_revision").length;
  const solvedIndependently = history.filter((h) => h.action === "solved_independently").length;
  const solveRate = total > 0 ? Math.round((solved / total) * 100) : 0;

  // Topic distribution
  const topicCounts: Record<string, number> = {};
  history.forEach((h) => {
    h.topics.forEach((t) => {
      topicCounts[t] = (topicCounts[t] ?? 0) + 1;
    });
  });

  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  return {
    total,
    solved,
    failed,
    skipped,
    dismissed,
    addedToRevision,
    solvedIndependently,
    solveRate,
    topTopics,
  };
}

// ─── Seed history ─────────────────────────────────────────────────────────────

function buildSeedHistory(): RecommendationHistoryItem[] {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  return [
    {
      id: "seed-1",
      problemId: 1,
      platformProblemId: "1",
      platform: "leetcode",
      title: "Two Sum Optimization",
      url: "https://leetcode.com/problems/two-sum/",
      difficulty: "Easy",
      topics: ["Arrays", "Hashing"],
      targetSkill: "Hashing",
      targetPattern: "Hash Map / Hash Set",
      recommendationScore: 88,
      reason: "Arrays is a high-impact weak foundational prerequisite.",
      action: "solved_independently",
      mode: "smart_practice",
      timestamp: daysAgo(3),
    },
    {
      id: "seed-2",
      problemId: 107,
      platformProblemId: "560",
      platform: "leetcode",
      title: "Subarray Sum Equals K",
      url: "https://leetcode.com/problems/subarray-sum-equals-k/",
      difficulty: "Medium",
      topics: ["Prefix Sum", "Hashing", "Arrays"],
      targetSkill: "Prefix Sum",
      targetPattern: "Prefix Sum",
      recommendationScore: 76,
      reason: "Prefix Sum is an under-practiced pattern in your recent history.",
      action: "solved_with_hints",
      mode: "pattern_practice",
      timestamp: daysAgo(5),
    },
    {
      id: "seed-3",
      problemId: 103,
      platformProblemId: "11",
      platform: "leetcode",
      title: "Container With Most Water",
      url: "https://leetcode.com/problems/container-with-most-water/",
      difficulty: "Medium",
      topics: ["Two Pointers", "Arrays"],
      targetSkill: "Two Pointers",
      targetPattern: "Two Pointers",
      recommendationScore: 82,
      reason: "Two Pointers is a weak prerequisite for Sliding Window.",
      action: "failed",
      mode: "weakness_repair",
      timestamp: daysAgo(7),
    },
    {
      id: "seed-4",
      problemId: 105,
      platformProblemId: "704",
      platform: "leetcode",
      title: "Binary Search",
      url: "https://leetcode.com/problems/binary-search/",
      difficulty: "Easy",
      topics: ["Binary Search", "Arrays"],
      targetSkill: "Binary Search",
      targetPattern: "Binary Search",
      recommendationScore: 65,
      reason: "Binary Search revision due for spaced repetition.",
      action: "added_to_revision",
      mode: "revision",
      timestamp: daysAgo(10),
    },
  ];
}
