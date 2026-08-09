import { ReviewCollection, CollectionColor } from "@/services/collectionTypes";
import { ReviewHistoryEntry, ReviewCategory } from "@/services/ai/aiTypes";
import { calculateEntryScore } from "@/services/dashboardAnalytics";

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  OPTIMAL_COMPLEXITY: "Optimal Complexity",
  OPTIMAL_HINTS: "Optimal Hints",
  OPTIMAL_FULL_SOLUTION: "Optimal Full Solution",
  MY_COMPLEXITY: "My Complexity",
  CORRECTNESS_CHECK: "Correctness Check",
  EDGE_CASE_ANALYSIS: "Edge Case Analysis",
  MY_HINTS: "My Hints",
  FULL_CODE_REVIEW: "Full Code Review",
};

export interface CollectionAnalyticsResult {
  totalReviews: number;
  avgScore: number;
  avgTokens: number;
  avgDurationMs: number;
  languages: string[];
  categories: string[];
  strongestTopic: string | null;
  weakestTopic: string | null;
  mostCommonMistakeCategory: string | null;
  firstReviewDate: string | null;
  latestReviewDate: string | null;
}

/** Compute per-collection analytics from full history entries */
export function computeCollectionItemAnalytics(
  entries: ReviewHistoryEntry[]
): CollectionAnalyticsResult {
  if (entries.length === 0) {
    return {
      totalReviews: 0,
      avgScore: 0,
      avgTokens: 0,
      avgDurationMs: 0,
      languages: [],
      categories: [],
      strongestTopic: null,
      weakestTopic: null,
      mostCommonMistakeCategory: null,
      firstReviewDate: null,
      latestReviewDate: null,
    };
  }

  const totalScore = entries.reduce((acc, e) => acc + calculateEntryScore(e), 0);
  const totalTokens = entries.reduce((acc, e) => acc + (e.usage?.totalTokens || 0), 0);
  const totalDuration = entries.reduce((acc, e) => acc + (e.durationMs || 0), 0);

  const languages = Array.from(new Set(entries.map((e) => e.language)));
  const categories = Array.from(new Set(entries.map((e) => CATEGORY_LABELS[e.category] || e.category)));

  // Per-category score averages
  const catScores: Record<string, { total: number; count: number }> = {};
  entries.forEach((e) => {
    const label = CATEGORY_LABELS[e.category] || e.category;
    if (!catScores[label]) catScores[label] = { total: 0, count: 0 };
    catScores[label].total += calculateEntryScore(e);
    catScores[label].count += 1;
  });

  const catAverages = Object.entries(catScores)
    .map(([cat, d]) => ({ cat, avg: Math.round(d.total / d.count) }))
    .sort((a, b) => b.avg - a.avg);

  const strongestTopic = catAverages[0]?.cat ?? null;
  const weakestTopic = catAverages[catAverages.length - 1]?.cat ?? null;

  // Most common mistake category = most suggestions
  const mistakeCounts: Record<string, number> = {};
  entries.forEach((e) => {
    const label = CATEGORY_LABELS[e.category] || e.category;
    const sugCount = e.response.optimizationSuggestions?.length || 0;
    mistakeCounts[label] = (mistakeCounts[label] || 0) + sugCount;
  });
  const mostCommonMistakeCategory =
    Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const sortedTimes = entries
    .map((e) => new Date(e.timestamp).getTime())
    .filter((t) => !isNaN(t))
    .sort((a, b) => a - b);

  return {
    totalReviews: entries.length,
    avgScore: Math.round(totalScore / entries.length),
    avgTokens: Math.round(totalTokens / entries.length),
    avgDurationMs: Math.round(totalDuration / entries.length),
    languages,
    categories,
    strongestTopic,
    weakestTopic,
    mostCommonMistakeCategory,
    firstReviewDate: sortedTimes.length > 0 ? new Date(sortedTimes[0]).toISOString() : null,
    latestReviewDate: sortedTimes.length > 0 ? new Date(sortedTimes[sortedTimes.length - 1]).toISOString() : null,
  };
}

export type CollectionSortKey = "name" | "updated" | "created" | "questionCount" | "avgScore";

export function sortCollections(
  collections: ReviewCollection[],
  sortKey: CollectionSortKey,
  analyticsMap: Map<string, CollectionAnalyticsResult>
): ReviewCollection[] {
  return [...collections].sort((a, b) => {
    switch (sortKey) {
      case "name":
        return a.name.localeCompare(b.name);
      case "updated":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "created":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "questionCount":
        return b.reviewIds.length - a.reviewIds.length;
      case "avgScore": {
        const aScore = analyticsMap.get(a.id)?.avgScore ?? 0;
        const bScore = analyticsMap.get(b.id)?.avgScore ?? 0;
        return bScore - aScore;
      }
      default:
        return 0;
    }
  });
}

export const COLOR_PALETTE: Record<CollectionColor, { bg: string; text: string; border: string; dot: string }> = {
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  dot: "bg-purple-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    dot: "bg-cyan-500" },
  slate:   { bg: "bg-slate-100",  text: "text-slate-700",   border: "border-slate-200",   dot: "bg-slate-500" },
};
