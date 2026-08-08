import { ReviewHistoryEntry, ReviewCategory } from "./ai/aiTypes";
import { ReviewCollection } from "./collectionTypes";
import {
  DashboardFiltersState,
  DashboardStats,
  TimeSeriesPoint,
  Distributions,
  DistributionItem,
  ImprovementAnalytics,
  CollectionAnalyticsItem,
  CollectionAnalytics,
  AchievementBadge,
} from "./dashboardTypes";

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

/**
 * Calculates a derived 0-100 Quality/Progress score for a review entry.
 */
export function calculateEntryScore(entry: ReviewHistoryEntry): number {
  let score = 85;

  const suggestionsCount = entry.response.optimizationSuggestions?.length || 0;
  score -= Math.min(suggestionsCount * 5, 25);

  const edgeCasesCount = entry.response.edgeCases?.length || 0;
  score -= Math.min(edgeCasesCount * 4, 20);

  if (entry.response.optimalCode && entry.response.optimalCode.trim().length > 0) {
    score += 10;
  }

  if (
    entry.category === "OPTIMAL_FULL_SOLUTION" ||
    entry.category === "OPTIMAL_COMPLEXITY"
  ) {
    score += 5;
  }

  // Factor in learning tips (rewards comprehensive review)
  const tipsCount = entry.response.learningTips?.length || 0;
  if (tipsCount > 0) {
    score += Math.min(tipsCount * 2, 6);
  }

  return Math.min(100, Math.max(30, Math.round(score)));
}

/**
 * Filters entries based on the current active Dashboard filters.
 */
export function filterEntries(
  entries: ReviewHistoryEntry[],
  collections: ReviewCollection[],
  filters: DashboardFiltersState
): ReviewHistoryEntry[] {
  const now = Date.now();

  return entries.filter((entry) => {
    const entryTime = new Date(entry.timestamp).getTime();

    // Date range filter
    if (filters.dateRange === "7d" && now - entryTime > 7 * 86400 * 1000) return false;
    if (filters.dateRange === "30d" && now - entryTime > 30 * 86400 * 1000) return false;
    if (filters.dateRange === "90d" && now - entryTime > 90 * 86400 * 1000) return false;
    if (filters.dateRange === "year" && now - entryTime > 365 * 86400 * 1000) return false;

    // Language filter
    if (filters.language !== "all" && entry.language !== filters.language) return false;

    // Category filter
    if (filters.category !== "all" && entry.category !== filters.category) return false;

    // Provider filter
    if (filters.provider !== "all") {
      const providerName = (entry.usage?.service || entry.model || "").toLowerCase();
      if (!providerName.includes(filters.provider.toLowerCase())) return false;
    }

    // Model filter
    if (filters.model !== "all" && entry.model !== filters.model) return false;

    // Collection filter
    if (filters.collectionId !== "all") {
      const targetCol = collections.find((c) => c.id === filters.collectionId);
      if (!targetCol || !targetCol.reviewIds.includes(entry.id)) return false;
    }

    return true;
  });
}

/**
 * Computes top-level stats for the Dashboard cards.
 */
export function computeDashboardStats(
  entries: ReviewHistoryEntry[],
  collections: ReviewCollection[]
): DashboardStats {
  if (entries.length === 0) {
    return {
      totalReviews: 0,
      reviewsThisWeek: 0,
      reviewsThisMonth: 0,
      avgScore: 0,
      bestScore: 0,
      avgTokens: 0,
      avgDurationMs: 0,
      totalCodingTimeMs: 0,
      collectionsCount: collections.length,
      mostActiveLanguage: "None",
      mostActiveCategory: "None",
    };
  }

  const now = Date.now();
  const weekMs = 7 * 86400 * 1000;
  const monthMs = 30 * 86400 * 1000;

  let reviewsThisWeek = 0;
  let reviewsThisMonth = 0;
  let totalTokens = 0;
  let totalDuration = 0;
  let totalScore = 0;
  let bestScore = 0;

  const langCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};

  entries.forEach((e) => {
    const t = new Date(e.timestamp).getTime();
    if (now - t <= weekMs) reviewsThisWeek++;
    if (now - t <= monthMs) reviewsThisMonth++;

    const tokens = e.usage?.totalTokens || 0;
    totalTokens += tokens;
    totalDuration += e.durationMs || 0;

    const score = calculateEntryScore(e);
    totalScore += score;
    if (score > bestScore) bestScore = score;

    langCounts[e.language] = (langCounts[e.language] || 0) + 1;
    const catLabel = CATEGORY_LABELS[e.category] || e.category;
    catCounts[catLabel] = (catCounts[catLabel] || 0) + 1;
  });

  const mostActiveLanguage =
    Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
  const mostActiveCategory =
    Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  // Total coding time analyzed estimation: durationMs + lines of code * 30 seconds
  const totalCodingTimeMs = entries.reduce((acc, e) => {
    const lineCount = e.code ? e.code.split("\n").length : 10;
    return acc + (e.durationMs || 0) + lineCount * 15000;
  }, 0);

  return {
    totalReviews: entries.length,
    reviewsThisWeek,
    reviewsThisMonth,
    avgScore: Math.round(totalScore / entries.length),
    bestScore,
    avgTokens: Math.round(totalTokens / entries.length),
    avgDurationMs: Math.round(totalDuration / entries.length),
    totalCodingTimeMs,
    collectionsCount: collections.length,
    mostActiveLanguage,
    mostActiveCategory,
  };
}

/**
 * Computes time series data for line & area charts.
 */
export function computeTimeSeriesData(entries: ReviewHistoryEntry[]): TimeSeriesPoint[] {
  if (entries.length === 0) return [];

  // Group entries by date YYYY-MM-DD
  const map = new Map<
    string,
    { date: string; timestamp: number; count: number; totalScore: number; tokens: number; totalDuration: number }
  >();

  // Oldest first for line chart progression
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  sorted.forEach((e) => {
    const dt = new Date(e.timestamp);
    const dateKey = dt.toISOString().split("T")[0];
    const score = calculateEntryScore(e);
    const tokens = e.usage?.totalTokens || 0;
    const duration = e.durationMs || 0;

    const existing = map.get(dateKey);
    if (existing) {
      existing.count += 1;
      existing.totalScore += score;
      existing.tokens += tokens;
      existing.totalDuration += duration;
    } else {
      map.set(dateKey, {
        date: dateKey,
        timestamp: dt.getTime(),
        count: 1,
        totalScore: score,
        tokens,
        totalDuration: duration,
      });
    }
  });

  return Array.from(map.values()).map((v) => ({
    date: new Date(v.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    timestamp: v.timestamp,
    reviewCount: v.count,
    avgScore: Math.round(v.totalScore / v.count),
    totalTokens: v.tokens,
    avgDurationMs: Math.round(v.totalDuration / v.count),
  }));
}

/**
 * Computes distributions for Pie & Bar charts.
 */
export function computeDistributions(entries: ReviewHistoryEntry[]): Distributions {
  const total = entries.length || 1;

  const buildDist = (items: string[]): DistributionItem[] => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const key = item.trim() || "Unspecified";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  const languages = buildDist(entries.map((e) => e.language));
  const categories = buildDist(
    entries.map((e) => CATEGORY_LABELS[e.category] || e.category)
  );

  const timeComplexities = buildDist(
    entries
      .map((e) => e.response.timeComplexity)
      .filter((tc): tc is string => Boolean(tc && tc.trim()))
  );

  const spaceComplexities = buildDist(
    entries
      .map((e) => e.response.spaceComplexity)
      .filter((sc): sc is string => Boolean(sc && sc.trim()))
  );

  const providers = buildDist(
    entries.map((e) => e.usage?.service || "ReviewAI")
  );

  const models = buildDist(entries.map((e) => e.model || "Default Model"));

  return {
    languages,
    categories,
    timeComplexities,
    spaceComplexities,
    providers,
    models,
  };
}

/**
 * Computes Improvement Analytics insights.
 */
export function computeImprovementAnalytics(entries: ReviewHistoryEntry[]): ImprovementAnalytics {
  if (entries.length === 0) {
    return {
      scoreImprovementPct: 0,
      avgImprovementLast7: 0,
      weakestTopics: [],
      strongestTopics: [],
      frequentlyRepeatedMistakes: [],
      mostImprovedCategory: "N/A",
      suggestedNextFocus: "Complete more AI reviews to unlock insights.",
    };
  }

  // Sort chronological (oldest to newest)
  const chrono = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const scores = chrono.map(calculateEntryScore);

  // Overall Score improvement percentage comparing first half to second half
  let scoreImprovementPct = 0;
  if (scores.length >= 2) {
    const half = Math.floor(scores.length / 2);
    const firstHalfAvg =
      scores.slice(0, half).reduce((a, b) => a + b, 0) / (half || 1);
    const secondHalfAvg =
      scores.slice(half).reduce((a, b) => a + b, 0) / (scores.length - half || 1);

    if (firstHalfAvg > 0) {
      scoreImprovementPct = Math.round(
        ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
      );
    }
  }

  // Average improvement over last 7 reviews
  const last7 = scores.slice(-7);
  let avgImprovementLast7 = 0;
  if (last7.length >= 2) {
    const diff = last7[last7.length - 1] - last7[0];
    avgImprovementLast7 = Math.round(diff);
  }

  // Extract common optimization suggestions & edge cases for repeated mistakes
  const mistakeCounts: Record<string, number> = {};
  entries.forEach((e) => {
    e.response.optimizationSuggestions?.forEach((s) => {
      const normalized = s.split(":")[0].trim().substring(0, 60);
      if (normalized.length > 5) {
        mistakeCounts[normalized] = (mistakeCounts[normalized] || 0) + 1;
      }
    });
    e.response.edgeCases?.forEach((ec) => {
      const normalized = ec.split(":")[0].trim().substring(0, 60);
      if (normalized.length > 5) {
        mistakeCounts[normalized] = (mistakeCounts[normalized] || 0) + 1;
      }
    });
  });

  const frequentlyRepeatedMistakes = Object.entries(mistakeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([m]) => m);

  // Analyze strongest vs weakest categories/topics
  const catScores: Record<string, { total: number; count: number }> = {};
  entries.forEach((e) => {
    const label = CATEGORY_LABELS[e.category] || e.category;
    const sc = calculateEntryScore(e);
    if (!catScores[label]) catScores[label] = { total: 0, count: 0 };
    catScores[label].total += sc;
    catScores[label].count += 1;
  });

  const catAverages = Object.entries(catScores).map(([cat, d]) => ({
    category: cat,
    avgScore: Math.round(d.total / d.count),
  }));

  const strongestTopics = [...catAverages]
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)
    .map((c) => `${c.category} (${c.avgScore} pts)`);

  const weakestTopics = [...catAverages]
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3)
    .map((c) => `${c.category} (${c.avgScore} pts)`);

  const mostImprovedCategory =
    catAverages.sort((a, b) => b.avgScore - a.avgScore)[0]?.category || "None";

  // Derive suggested next focus area
  let suggestedNextFocus = "Practice more Edge Case Analysis and Space Optimizations.";
  if (weakestTopics.length > 0) {
    suggestedNextFocus = `Focus on improving ${weakestTopics[0].split("(")[0].trim()} solutions.`;
  }

  return {
    scoreImprovementPct,
    avgImprovementLast7,
    weakestTopics,
    strongestTopics,
    frequentlyRepeatedMistakes,
    mostImprovedCategory,
    suggestedNextFocus,
  };
}

/**
 * Computes collection analytics.
 */
export function computeCollectionAnalytics(
  entries: ReviewHistoryEntry[],
  collections: ReviewCollection[]
): CollectionAnalytics {
  if (collections.length === 0) {
    return {
      collections: [],
      mostActiveCollection: null,
      bestPerformingCollection: null,
    };
  }

  const entryMap = new Map(entries.map((e) => [e.id, e]));

  const result: CollectionAnalyticsItem[] = collections.map((col) => {
    const colEntries = col.reviewIds
      .map((id) => entryMap.get(id))
      .filter((e): e is ReviewHistoryEntry => Boolean(e));

    const reviewCount = colEntries.length;
    const totalScore = colEntries.reduce((a, b) => a + calculateEntryScore(b), 0);
    const totalTokens = colEntries.reduce((a, b) => a + (b.usage?.totalTokens || 0), 0);
    const langs = Array.from(new Set(colEntries.map((e) => e.language)));

    return {
      id: col.id,
      name: col.name,
      color: col.color,
      reviewCount,
      avgScore: reviewCount > 0 ? Math.round(totalScore / reviewCount) : 0,
      avgTokens: reviewCount > 0 ? Math.round(totalTokens / reviewCount) : 0,
      languages: langs,
    };
  });

  const sortedByCount = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
  const sortedByScore = [...result].sort((a, b) => b.avgScore - a.avgScore);

  return {
    collections: result,
    mostActiveCollection: sortedByCount[0]?.reviewCount > 0 ? sortedByCount[0].name : null,
    bestPerformingCollection: sortedByScore[0]?.avgScore > 0 ? sortedByScore[0].name : null,
  };
}

/**
 * Computes achievement badges status.
 */
export function computeAchievements(entries: ReviewHistoryEntry[]): AchievementBadge[] {
  const total = entries.length;

  // Compute streak days
  const uniqueDates = Array.from(
    new Set(entries.map((e) => new Date(e.timestamp).toISOString().split("T")[0]))
  ).sort();

  let streak7 = false;
  let streak30 = false;
  let currentStreak = 0;
  let maxStreak = 0;

  if (uniqueDates.length > 0) {
    currentStreak = 1;
    maxStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]).getTime();
      const curr = new Date(uniqueDates[i]).getTime();
      if (curr - prev <= 86400 * 1000 * 2) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 1;
      }
    }
  }

  streak7 = maxStreak >= 7;
  streak30 = maxStreak >= 30;

  // Optimization & Edge case counts
  const optCount = entries.filter((e) => e.category.includes("OPTIMAL")).length;
  const edgeCaseCount = entries.filter((e) => e.category === "EDGE_CASE_ANALYSIS").length;

  // Improvement check
  const improvement = computeImprovementAnalytics(entries);
  const scoreImpUnlocked = improvement.scoreImprovementPct >= 10;

  const badges: AchievementBadge[] = [
    {
      id: "first_review",
      title: "First Step",
      description: "Submitted your first code review to AI Coach",
      iconName: "Sparkles",
      unlocked: total >= 1,
      progress: Math.min(100, (total / 1) * 100),
      criteria: "1 AI Review",
    },
    {
      id: "reviews_10",
      title: "Consistent Learner",
      description: "Completed 10 AI code reviews",
      iconName: "Award",
      unlocked: total >= 10,
      progress: Math.min(100, (total / 10) * 100),
      criteria: "10 AI Reviews",
    },
    {
      id: "reviews_50",
      title: "Dedicated Coder",
      description: "Completed 50 AI code reviews",
      iconName: "Medal",
      unlocked: total >= 50,
      progress: Math.min(100, (total / 50) * 100),
      criteria: "50 AI Reviews",
    },
    {
      id: "reviews_100",
      title: "Algorithm Master",
      description: "Completed 100 AI code reviews",
      iconName: "Trophy",
      unlocked: total >= 100,
      progress: Math.min(100, (total / 100) * 100),
      criteria: "100 AI Reviews",
    },
    {
      id: "streak_7",
      title: "7-Day Streak",
      description: "Reviewed code across 7 active practice days",
      iconName: "Flame",
      unlocked: streak7,
      progress: Math.min(100, (maxStreak / 7) * 100),
      criteria: "7 Days Active",
    },
    {
      id: "streak_30",
      title: "Monthly Streak",
      description: "Reviewed code across 30 active practice days",
      iconName: "Zap",
      unlocked: streak30,
      progress: Math.min(100, (maxStreak / 30) * 100),
      criteria: "30 Days Active",
    },
    {
      id: "score_improvement",
      title: "Score Level Up",
      description: "Achieved a 10%+ average quality score improvement",
      iconName: "TrendingUp",
      unlocked: scoreImpUnlocked,
      progress: Math.min(100, Math.max(0, (improvement.scoreImprovementPct / 10) * 100)),
      criteria: "+10% Score Increase",
    },
    {
      id: "optimization_expert",
      title: "Optimization Expert",
      description: "Completed 5+ Optimal Complexity or Optimal Solution reviews",
      iconName: "Cpu",
      unlocked: optCount >= 5,
      progress: Math.min(100, (optCount / 5) * 100),
      criteria: "5 Optimal Reviews",
    },
    {
      id: "edge_case_master",
      title: "Edge Case Master",
      description: "Completed 5+ Edge Case Analysis reviews",
      iconName: "ShieldAlert",
      unlocked: edgeCaseCount >= 5,
      progress: Math.min(100, (edgeCaseCount / 5) * 100),
      criteria: "5 Edge Case Reviews",
    },
  ];

  return badges;
}
