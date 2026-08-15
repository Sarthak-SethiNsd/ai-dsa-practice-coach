/**
 * contestEngine.ts — Pure analytics computation for Contest Intelligence.
 * No side effects. All functions take data in → produce metrics out.
 */

import {
  ContestEntry,
  ContestGoal,
  ContestDashboardMetrics,
  RatingProgressAnalytics,
  RatingDataPoint,
  MonthlyRatingGain,
  PerformanceTrendPoint,
  WeaknessDetectionResult,
  WeakTopic,
  SlowArea,
  MistakePattern,
  WeaknessSeverity,
  TopicContestPerformance,
  ImprovementTrend,
  ContestReadinessScore,
  ContestReadinessLevel,
  ReadinessFactor,
  VirtualContestPlan,
  WeeklyContestPlan,
  RatingGoalMilestone,
  ContestCoachAdvice,
  CoachingAdvice,
  RatingRoadmapMilestone,
  FullContestIntelligence,
  ContestPlatform,
} from "./contestTypes";

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTEST_TOPICS = [
  "Arrays",
  "Strings",
  "Sorting",
  "Binary Search",
  "Recursion",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Math",
  "Bit Manipulation",
];

const CF_RATING_MILESTONES: { rating: number; label: string }[] = [
  { rating: 1200, label: "Pupil" },
  { rating: 1400, label: "Specialist" },
  { rating: 1600, label: "Expert" },
  { rating: 1900, label: "Candidate Master" },
  { rating: 2100, label: "Master" },
  { rating: 2300, label: "International Master" },
  { rating: 2400, label: "Grandmaster" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function getMonthLabel(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleString("default", { month: "short", year: "numeric" });
}

function sortedByDate(entries: ContestEntry[]): ContestEntry[] {
  return [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
}

// ─── 1. Dashboard Metrics ──────────────────────────────────────────────────────

export function computeContestDashboard(
  entries: ContestEntry[]
): ContestDashboardMetrics {
  if (entries.length === 0) {
    return {
      currentRating: 1200,
      peakRating: 1200,
      totalContests: 0,
      averageRank: 0,
      bestRank: 0,
      worstRank: 0,
      ratingGrowth30d: 0,
      ratingGrowthAllTime: 0,
      winRateTop25Pct: 0,
      avgProblemsPerContest: 0,
      avgTimePerContest: 0,
    };
  }

  const sorted = sortedByDate(entries);
  const latest = sorted[sorted.length - 1];
  const currentRating = latest.ratingAfter;
  const peakRating = Math.max(...entries.map((e) => e.ratingAfter));

  const ranks = entries.map((e) => e.rank);
  const bestRank = Math.min(...ranks);
  const worstRank = Math.max(...ranks);
  const averageRank = Math.round(avg(ranks));

  // 30-day rating growth
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEntries = entries.filter(
    (e) => new Date(e.date) >= thirtyDaysAgo
  );
  const ratingGrowth30d = recentEntries.reduce(
    (sum, e) => sum + e.ratingChange,
    0
  );

  const ratingGrowthAllTime = latest.ratingAfter - sorted[0].ratingBefore;

  const winRateTop25Pct =
    entries.length === 0
      ? 0
      : Math.round(
          (entries.filter(
            (e) => e.rank / Math.max(e.totalParticipants, 1) <= 0.25
          ).length /
            entries.length) *
            100
        );

  const avgProblemsPerContest = Math.round(
    avg(entries.map((e) => e.problemsSolved))
  );
  const avgTimePerContest = Math.round(
    avg(entries.map((e) => e.timeSpentMinutes))
  );

  return {
    currentRating,
    peakRating,
    totalContests: entries.length,
    averageRank,
    bestRank,
    worstRank,
    ratingGrowth30d,
    ratingGrowthAllTime,
    winRateTop25Pct,
    avgProblemsPerContest,
    avgTimePerContest,
  };
}

// ─── 2. Rating Progress Analytics ─────────────────────────────────────────────

export function computeRatingProgressAnalytics(
  entries: ContestEntry[]
): RatingProgressAnalytics {
  const sorted = sortedByDate(entries);

  // Rating over time
  const ratingOverTime: RatingDataPoint[] = [];
  sorted.forEach((e) => {
    ratingOverTime.push({
      date: e.date,
      rating: e.ratingAfter,
      contestName: e.contestName,
      platform: e.platform,
    });
    runningRating = e.ratingAfter;
  });

  // Monthly gain
  const monthMap = new Map<string, { gain: number; contests: number }>();
  sorted.forEach((e) => {
    const key = getMonthLabel(e.date);
    const existing = monthMap.get(key) ?? { gain: 0, contests: 0 };
    monthMap.set(key, {
      gain: existing.gain + e.ratingChange,
      contests: existing.contests + 1,
    });
  });
  const monthlyGain: MonthlyRatingGain[] = Array.from(monthMap.entries()).map(
    ([month, data]) => ({ month, ...data })
  );

  // Performance trend
  const performanceTrend: PerformanceTrendPoint[] = sorted.map((e) => ({
    date: e.date,
    performanceScore: e.performanceScore,
    rank: e.rank,
    contestName: e.contestName,
  }));

  // Average rank trend (rolling 3)
  const avgRankTrend: { date: string; avgRank: number }[] = sorted.map(
    (e, i) => {
      const window = sorted.slice(Math.max(0, i - 2), i + 1);
      return {
        date: e.date,
        avgRank: Math.round(avg(window.map((w) => w.rank))),
      };
    }
  );

  // Participation consistency: % of months in date range with at least 1 contest
  let participationConsistency = 0;
  let longestActiveStreak = 0;
  if (sorted.length >= 2) {
    const firstDate = new Date(sorted[0].date);
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const totalMonths =
      (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
      (lastDate.getMonth() - firstDate.getMonth()) +
      1;
    participationConsistency = Math.min(
      100,
      Math.round((monthMap.size / Math.max(totalMonths, 1)) * 100)
    );
    longestActiveStreak = Math.max(...Array.from(monthMap.values()).map((v) => v.contests));
  } else {
    participationConsistency = sorted.length > 0 ? 50 : 0;
  }

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthContests = entries.filter((e) =>
    e.date.startsWith(thisMonth)
  ).length;

  return {
    ratingOverTime,
    monthlyGain,
    performanceTrend,
    avgRankTrend,
    participationConsistency,
    longestActiveStreak,
    currentMonthContests,
  };
}

// ─── 3. Weakness Detection ─────────────────────────────────────────────────────

export function computeWeaknessDetection(
  entries: ContestEntry[]
): WeaknessDetectionResult {
  if (entries.length === 0) {
    return {
      weakTopics: [],
      slowAreas: [],
      difficultyBottleneck: "None",
      paceIssues: [],
      mistakePatterns: [],
      overallWeaknessScore: 0,
      aiInsights: ["Add contest history to detect weaknesses."],
    };
  }

  // Topic success rate from problem breakdowns
  const topicAttempts = new Map<string, { solved: number; attempts: number }>();
  entries.forEach((e) => {
    e.problemBreakdown.topicsAttempted.forEach((topic) => {
      const normalized = CONTEST_TOPICS.find(
        (t) => t.toLowerCase() === topic.toLowerCase()
      ) ?? topic;
      const existing = topicAttempts.get(normalized) ?? { solved: 0, attempts: 0 };
      topicAttempts.set(normalized, {
        solved: existing.solved + 1,
        attempts: existing.attempts + 1,
      });
    });
  });

  const weakTopics: WeakTopic[] = [];
  topicAttempts.forEach((data, topic) => {
    const successRate = Math.round((data.solved / Math.max(data.attempts, 1)) * 100);
    if (successRate < 60 && data.attempts >= 2) {
      const severity: WeaknessSeverity =
        successRate < 30 ? "critical" : successRate < 45 ? "high" : "medium";
      weakTopics.push({
        topic,
        successRate,
        contestAppearances: data.attempts,
        severity,
        recommendation: `Practice more ${topic} problems and focus on ${
          successRate < 30 ? "fundamentals" : "medium-difficulty variants"
        }.`,
      });
    }
  });
  weakTopics.sort((a, b) => a.successRate - b.successRate);

  // Slow areas (time efficiency)
  const avgTimeEff = avg(entries.map((e) => e.problemBreakdown.timeEfficiencyScore));
  const slowAreas: SlowArea[] = [];
  if (avgTimeEff < 60) {
    slowAreas.push({
      area: "Overall Contest Pacing",
      avgTimeMinutes: Math.round(avg(entries.map((e) => e.timeSpentMinutes / Math.max(e.problemsSolved, 1)))),
      benchmarkMinutes: 20,
      overagePercent: Math.round(((100 - avgTimeEff) / 100) * 50),
    });
  }

  // Difficulty bottleneck
  const hardAttempted = entries.reduce((s, e) => s + e.problemBreakdown.hardAttempted, 0);
  const hardSolved = entries.reduce((s, e) => s + e.problemBreakdown.hardSolved, 0);
  const mediumAttempted = entries.reduce((s, e) => s + e.problemBreakdown.mediumAttempted, 0);
  const mediumSolved = entries.reduce((s, e) => s + e.problemBreakdown.mediumSolved, 0);

  let difficultyBottleneck: "Easy" | "Medium" | "Hard" | "None" = "None";
  if (hardAttempted > 0 && hardSolved / hardAttempted < 0.2) {
    difficultyBottleneck = "Hard";
  } else if (mediumAttempted > 0 && mediumSolved / mediumAttempted < 0.4) {
    difficultyBottleneck = "Medium";
  }

  // Pacing issues
  const paceIssues: string[] = [];
  const avgPenalty = avg(entries.map((e) => e.problemBreakdown.penaltyMinutes));
  if (avgPenalty > 20) {
    paceIssues.push(`High average penalty time (${Math.round(avgPenalty)} min) — avoid wrong submissions.`);
  }
  const avgMissed = avg(entries.map((e) => e.problemBreakdown.missedOpportunities));
  if (avgMissed > 1) {
    paceIssues.push(`Averaging ${avgMissed.toFixed(1)} missed problem opportunities per contest — improve time allocation.`);
  }

  // Mistake patterns
  const mistakePatterns: MistakePattern[] = [];
  const totalPenalty = entries.reduce((s, e) => s + e.problemBreakdown.penaltyMinutes, 0);
  if (totalPenalty > 0) {
    mistakePatterns.push({
      pattern: "Wrong Answer / Penalty Submissions",
      frequency: entries.filter((e) => e.problemBreakdown.penaltyMinutes > 10).length,
      description: "Submitting without sufficient testing leads to penalty time.",
      suggestedFix: "Dry-run code mentally before submitting, especially for edge cases.",
    });
  }
  if (difficultyBottleneck !== "None") {
    mistakePatterns.push({
      pattern: `${difficultyBottleneck} Problem Ceiling`,
      frequency: entries.filter((e) => e.problemBreakdown.hardAttempted > 0).length,
      description: `Difficulty ceiling at ${difficultyBottleneck} level. Struggling to make breakthroughs.`,
      suggestedFix: `Dedicate daily practice sessions to ${difficultyBottleneck} problems from past contests.`,
    });
  }

  // AI Insights
  const aiInsights: string[] = [];
  if (weakTopics.length > 0) {
    aiInsights.push(`Focus on ${weakTopics.slice(0, 2).map((t) => t.topic).join(" and ")} — these topics have the lowest contest success rates.`);
  }
  if (difficultyBottleneck !== "None") {
    aiInsights.push(`Your difficulty ceiling appears to be at the ${difficultyBottleneck} level. Targeted practice can help break through.`);
  }
  if (avgPenalty > 20) {
    aiInsights.push("High penalty time suggests hasty submissions. Consider a 2-minute review before every submit.");
  }
  if (entries.length < 5) {
    aiInsights.push("More contest data needed for accurate weakness detection. Participate in at least 10 contests.");
  }
  if (aiInsights.length === 0) {
    aiInsights.push("Your contest patterns look solid! Keep up the consistent participation.");
  }

  const overallWeaknessScore = clamp(
    weakTopics.length * 12 + (avgPenalty > 20 ? 20 : 0) + (difficultyBottleneck !== "None" ? 15 : 0),
    0,
    100
  );

  return {
    weakTopics,
    slowAreas,
    difficultyBottleneck,
    paceIssues,
    mistakePatterns,
    overallWeaknessScore,
    aiInsights,
  };
}

// ─── 4. Topic Performance Matrix ──────────────────────────────────────────────

export function computeTopicMatrix(
  entries: ContestEntry[]
): TopicContestPerformance[] {
  const sorted = sortedByDate(entries);
  const recentHalf = sorted.slice(Math.floor(sorted.length / 2));

  return CONTEST_TOPICS.map((topic) => {
    const appearances = entries.filter((e) =>
      e.problemBreakdown.topicsAttempted.some(
        (t) => t.toLowerCase() === topic.toLowerCase()
      )
    );
    const recentAppearances = recentHalf.filter((e) =>
      e.problemBreakdown.topicsAttempted.some(
        (t) => t.toLowerCase() === topic.toLowerCase()
      )
    );

    const totalAppearances = appearances.length;
    const solvedCount = appearances.reduce((s, e) => s + e.problemsSolved, 0);
    const successRate =
      totalAppearances === 0
        ? 0
        : clamp(
            Math.round(
              (appearances.filter((e) => e.problemsSolved > 0).length /
                totalAppearances) *
                100
            ),
            0,
            100
          );

    const contestContribution =
      entries.length === 0
        ? 0
        : Math.round((totalAppearances / entries.length) * 100);

    // Improvement trend: compare recent success rate to overall
    const earlierAppearances = sorted.slice(0, Math.floor(sorted.length / 2)).filter((e) =>
      e.problemBreakdown.topicsAttempted.some(
        (t) => t.toLowerCase() === topic.toLowerCase()
      )
    );
    const recentSuccessRate =
      recentAppearances.length === 0
        ? successRate
        : Math.round(
            (recentAppearances.filter((e) => e.problemsSolved > 0).length /
              recentAppearances.length) *
              100
          );
    const earlierSuccessRate =
      earlierAppearances.length === 0
        ? successRate
        : Math.round(
            (earlierAppearances.filter((e) => e.problemsSolved > 0).length /
              earlierAppearances.length) *
              100
          );
    let improvementTrend: ImprovementTrend = "flat";
    if (recentSuccessRate > earlierSuccessRate + 10) improvementTrend = "up";
    else if (recentSuccessRate < earlierSuccessRate - 10) improvementTrend = "down";

    // Avg difficulty solved (heuristic from mediums/hards solved)
    const avgDifficultySolved: "Easy" | "Medium" | "Hard" | "None" =
      totalAppearances === 0
        ? "None"
        : appearances.some((e) => e.problemBreakdown.hardSolved > 0)
        ? "Hard"
        : appearances.some((e) => e.problemBreakdown.mediumSolved > 0)
        ? "Medium"
        : solvedCount > 0
        ? "Easy"
        : "None";

    return {
      topic,
      successRate,
      avgDifficultySolved,
      contestContribution,
      improvementTrend,
      totalAppearances,
      solvedCount,
    };
  });
}

// ─── 5. Contest Readiness Score ───────────────────────────────────────────────

export function computeContestReadiness(
  entries: ContestEntry[],
  dashboard: ContestDashboardMetrics
): ContestReadinessScore {
  if (entries.length === 0) {
    return {
      score: 10,
      level: "Beginner",
      factors: [],
      contestsNeededForNextLevel: 5,
      nextLevel: "Developing",
      strengthSummary: "Start participating in contests to build your profile.",
      improvementSummary: "No contest history yet.",
    };
  }

  const factors: ReadinessFactor[] = [];

  // Factor 1: Recent contest activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = entries.filter(
    (e) => new Date(e.date) >= thirtyDaysAgo
  ).length;
  const activityScore = clamp(recentCount * 20, 0, 100);
  factors.push({
    factor: "Recent Activity",
    score: activityScore,
    weight: 0.25,
    impact: activityScore >= 60 ? "positive" : activityScore >= 30 ? "neutral" : "needs_attention",
    description: `${recentCount} contest(s) in last 30 days`,
  });

  // Factor 2: Problem-solving consistency
  const avgSolved = avg(entries.map((e) => e.problemsSolved));
  const avgTotal = avg(entries.map((e) => e.totalProblems));
  const solveRate = avgTotal > 0 ? (avgSolved / avgTotal) * 100 : 0;
  const consistencyScore = clamp(Math.round(solveRate), 0, 100);
  factors.push({
    factor: "Problem-Solving Rate",
    score: consistencyScore,
    weight: 0.25,
    impact: consistencyScore >= 50 ? "positive" : consistencyScore >= 30 ? "neutral" : "needs_attention",
    description: `${avgSolved.toFixed(1)} problems solved per contest on average`,
  });

  // Factor 3: Rating progression
  const ratingScore = clamp(
    Math.round(
      ((dashboard.currentRating - 1200) / (2400 - 1200)) * 100 +
        (dashboard.ratingGrowth30d > 0 ? 20 : 0)
    ),
    0,
    100
  );
  factors.push({
    factor: "Rating Progression",
    score: ratingScore,
    weight: 0.30,
    impact: ratingScore >= 50 ? "positive" : ratingScore >= 25 ? "neutral" : "needs_attention",
    description: `Current: ${dashboard.currentRating}, Peak: ${dashboard.peakRating}`,
  });

  // Factor 4: Performance score trend
  const recentPerf = entries
    .slice()
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 5);
  const avgRecentPerf = avg(recentPerf.map((e) => e.performanceScore));
  const perfScore = clamp(Math.round(avgRecentPerf), 0, 100);
  factors.push({
    factor: "Recent Performance",
    score: perfScore,
    weight: 0.20,
    impact: perfScore >= 65 ? "positive" : perfScore >= 45 ? "neutral" : "needs_attention",
    description: `Avg performance score: ${Math.round(avgRecentPerf)}/100 (last 5 contests)`,
  });

  // Compute weighted score
  const weightedScore = clamp(
    Math.round(
      factors.reduce((sum, f) => sum + f.score * f.weight, 0)
    ),
    0,
    100
  );

  // Determine level
  let level: ContestReadinessLevel = "Beginner";
  let nextLevel: ContestReadinessLevel = "Developing";
  if (weightedScore >= 85) { level = "Expert"; nextLevel = "Expert"; }
  else if (weightedScore >= 70) { level = "Advanced"; nextLevel = "Expert"; }
  else if (weightedScore >= 55) { level = "Competitive"; nextLevel = "Advanced"; }
  else if (weightedScore >= 35) { level = "Developing"; nextLevel = "Competitive"; }

  const levelThresholds: Record<ContestReadinessLevel, number> = {
    Beginner: 35,
    Developing: 55,
    Competitive: 70,
    Advanced: 85,
    Expert: 100,
  };

  const pointsToNext = levelThresholds[nextLevel] - weightedScore;
  const contestsNeeded = Math.max(1, Math.ceil(pointsToNext / 5));

  const strengthSummary =
    factors.filter((f) => f.impact === "positive").map((f) => f.factor).join(", ") ||
    "Building foundation";
  const improvementSummary =
    factors.filter((f) => f.impact === "needs_attention").map((f) => f.factor).join(", ") ||
    "Keep consistent participation";

  return {
    score: weightedScore,
    level,
    factors,
    contestsNeededForNextLevel: contestsNeeded,
    nextLevel,
    strengthSummary,
    improvementSummary,
  };
}

// ─── 6. Virtual Contest Planner ───────────────────────────────────────────────

export function computeVirtualContestPlan(
  entries: ContestEntry[],
  readiness: ContestReadinessScore,
  dashboard: ContestDashboardMetrics
): VirtualContestPlan {
  // Recommended frequency based on level
  const freqMap: Record<ContestReadinessLevel, number> = {
    Beginner: 1,
    Developing: 2,
    Competitive: 3,
    Advanced: 4,
    Expert: 5,
  };
  const recommendedFrequency = freqMap[readiness.level];
  const recommendedFrequencyReason = `Based on your ${readiness.level} level, ${recommendedFrequency} contest(s) per week will drive optimal rating growth without burnout.`;

  // Rating milestones
  const currentRating = dashboard.currentRating;
  const ratingMilestones: RatingGoalMilestone[] = CF_RATING_MILESTONES.filter(
    (m) => m.rating > currentRating
  )
    .slice(0, 4)
    .map((m) => {
      const gap = m.rating - currentRating;
      const contestsNeeded = Math.ceil(gap / Math.max(1, dashboard.ratingGrowth30d / 4));
      const daysEstimate = Math.ceil(contestsNeeded / recommendedFrequency) * 7;
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + daysEstimate);
      return {
        targetRating: m.rating,
        estimatedDate: estimatedDate.toLocaleDateString("default", {
          month: "short",
          year: "numeric",
        }),
        contestsNeeded,
        currentGap: gap,
      };
    });

  // Target topics (top weaknesses)
  const targetTopics = CONTEST_TOPICS.slice(0, 5); // simplified

  // Weekly plan (next 4 weeks)
  const weeklyPlan: WeeklyContestPlan[] = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekLabel = `Week ${i + 1} — ${weekStart.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
    })}`;
    const platform: ContestPlatform = i % 2 === 0 ? "codeforces" : "leetcode";
    return {
      weekLabel,
      recommendedContests: recommendedFrequency,
      focusTopics: targetTopics.slice(i, i + 2),
      targetRatingGain: Math.round((dashboard.ratingGrowth30d / 4) * 1.1),
      suggestedPlatform: platform,
    };
  });

  // Monthly goals (next 3 months)
  const monthlyGoals = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i + 1);
    const month = d.toLocaleString("default", { month: "long", year: "numeric" });
    return {
      month,
      targetContests: recommendedFrequency * 4,
      targetRatingGain: Math.round((dashboard.ratingGrowth30d / 1) * 1.1),
      focusArea: targetTopics[i % targetTopics.length],
    };
  });

  return {
    recommendedFrequency,
    recommendedFrequencyReason,
    ratingMilestones,
    targetTopics,
    weeklyPlan,
    monthlyGoals,
  };
}

// ─── 7. AI Contest Coach ──────────────────────────────────────────────────────

export function computeContestCoach(
  entries: ContestEntry[],
  weakness: WeaknessDetectionResult,
  readiness: ContestReadinessScore,
  dashboard: ContestDashboardMetrics
): ContestCoachAdvice {
  const improvementAdvice: CoachingAdvice[] = [
    {
      id: "adv_1",
      category: "preparation",
      title: "Upsolve After Every Contest",
      advice: "After each contest, spend 30–60 minutes solving the problems you couldn't complete during the contest. This is the single highest-ROI activity for competitive programmers.",
      priority: "high",
      actionable: true,
    },
    {
      id: "adv_2",
      category: "strategy",
      title: "Read All Problems First",
      advice: "Spend the first 5 minutes of every contest reading all problem statements. Identify the easiest path to maximum points before starting to code.",
      priority: "high",
      actionable: true,
    },
    {
      id: "adv_3",
      category: "timing",
      title: "Set Per-Problem Time Limits",
      advice: "Allocate a maximum time budget per problem (e.g., 20 minutes for A, 30 for B). If you exceed it, move on and return later.",
      priority: "medium",
      actionable: true,
    },
    {
      id: "adv_4",
      category: "topic",
      title: `Focus on ${weakness.weakTopics[0]?.topic ?? "Dynamic Programming"}`,
      advice: `Your analysis shows ${weakness.weakTopics[0]?.topic ?? "DP"} has the lowest success rate. Dedicate 30 minutes daily to this topic using Codeforces problemset with tags.`,
      priority: "high",
      actionable: true,
    },
    {
      id: "adv_5",
      category: "mindset",
      title: "Track Your Rating Graph",
      advice: "Rating fluctuations are normal. Focus on 3-month trends rather than individual contest results. Consistent participation matters more than any single contest.",
      priority: "low",
      actionable: false,
    },
    {
      id: "adv_6",
      category: "preparation",
      title: "Virtual Contests for Practice",
      advice: "Use Codeforces' virtual contest feature to simulate past contests under real time pressure. Treat them with the same seriousness as rated contests.",
      priority: "medium",
      actionable: true,
    },
  ];

  const strategyTips: CoachingAdvice[] = [
    {
      id: "strat_1",
      category: "strategy",
      title: "Penalty Reduction Strategy",
      advice: `Your average penalty is high. Mentally verify your solution for at least 2 edge cases before submitting to reduce wrong answers.`,
      priority: "high",
      actionable: true,
    },
    {
      id: "strat_2",
      category: "strategy",
      title: "Binary Search Everything",
      advice: "If a problem asks for the 'minimum/maximum value such that X is possible,' try binary search on the answer. This pattern covers ~20% of contest problems.",
      priority: "medium",
      actionable: true,
    },
    {
      id: "strat_3",
      category: "strategy",
      title: "Greedy Over Brute Force",
      advice: "Before reaching for recursion/DP, ask if a greedy approach works. Greedy solutions are faster to code and debug in contest time.",
      priority: "medium",
      actionable: true,
    },
  ];

  // Topic priorities (weakest first)
  const topicPriorities = weakness.weakTopics.length > 0
    ? weakness.weakTopics.slice(0, 5).map((t, i) => ({
        rank: i + 1,
        topic: t.topic,
        reason: `Only ${t.successRate}% success rate across ${t.contestAppearances} contest appearances`,
      }))
    : CONTEST_TOPICS.slice(0, 5).map((topic, i) => ({
        rank: i + 1,
        topic,
        reason: "Build foundational strength in this core topic",
      }));

  // Rating roadmap
  const currentRating = dashboard.currentRating;
  const ratingRoadmap: RatingRoadmapMilestone[] = CF_RATING_MILESTONES.map((m) => {
    const daysToReach =
      m.rating <= currentRating
        ? 0
        : Math.ceil(
            ((m.rating - currentRating) / Math.max(1, dashboard.ratingGrowth30d)) * 30
          );
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + daysToReach);
    return {
      rating: m.rating,
      label: m.label,
      estimatedDate:
        m.rating <= currentRating
          ? "Achieved"
          : estDate.toLocaleDateString("default", { month: "short", year: "numeric" }),
      contestsAway: Math.max(0, Math.ceil(daysToReach / 14)),
      status: m.rating <= currentRating ? "achieved" : m.rating <= currentRating + 200 ? "upcoming" : "future",
    };
  });

  // Next milestone
  const nextMilestone = CF_RATING_MILESTONES.find((m) => m.rating > currentRating);
  const gap = nextMilestone ? nextMilestone.rating - currentRating : 0;
  const daysToNext =
    gap === 0
      ? 0
      : Math.ceil((gap / Math.max(1, dashboard.ratingGrowth30d)) * 30);
  const nextMilestoneDate = new Date();
  nextMilestoneDate.setDate(nextMilestoneDate.getDate() + daysToNext);

  const nextMilestonePrediction = {
    targetRating: nextMilestone?.rating ?? currentRating,
    estimatedDate: nextMilestone
      ? nextMilestoneDate.toLocaleDateString("default", { month: "long", year: "numeric" })
      : "Achieved",
    confidencePercent: clamp(
      Math.round(readiness.score * 0.8 + (dashboard.totalContests > 5 ? 20 : 0)),
      40,
      90
    ),
    requiredConsistency:
      readiness.level === "Expert"
        ? "Maintain current performance"
        : `${Math.ceil(gap / 50)} contests at current avg performance`,
  };

  return {
    improvementAdvice,
    strategyTips,
    topicPriorities,
    ratingRoadmap,
    nextMilestonePrediction,
  };
}

// ─── 8. Goal Enrichment ───────────────────────────────────────────────────────

export function enrichContestGoals(
  goals: ContestGoal[],
  entries: ContestEntry[],
  dashboard: ContestDashboardMetrics
): ContestGoal[] {
  return goals.map((goal) => {
    let currentValue = goal.currentValue;

    if (goal.category === "rating") {
      currentValue = dashboard.currentRating;
    } else if (goal.category === "participation") {
      currentValue = entries.length;
    } else if (goal.category === "consistency") {
      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      currentValue = entries.filter((e) => e.date.startsWith(thisMonth)).length;
    }

    const pct = goal.targetValue > 0
      ? Math.min(100, Math.round((currentValue / goal.targetValue) * 100))
      : 0;
    const status: "in_progress" | "completed" | "at_risk" =
      pct >= 100
        ? "completed"
        : new Date(goal.targetDate) < new Date() && pct < 80
        ? "at_risk"
        : "in_progress";

    return { ...goal, currentValue, completionPercentage: pct, status };
  });
}

// ─── 9. Master Aggregator ─────────────────────────────────────────────────────

export function computeFullContestIntelligence(
  entries: ContestEntry[],
  goals: ContestGoal[]
): FullContestIntelligence {
  const sorted = sortedByDate(entries);
  const dashboard = computeContestDashboard(sorted);
  const ratingProgress = computeRatingProgressAnalytics(sorted);
  const weakness = computeWeaknessDetection(sorted);
  const topicMatrix = computeTopicMatrix(sorted);
  const readiness = computeContestReadiness(sorted, dashboard);
  const virtualPlan = computeVirtualContestPlan(sorted, readiness, dashboard);
  const coach = computeContestCoach(sorted, weakness, readiness, dashboard);
  const enrichedGoals = enrichContestGoals(goals, sorted, dashboard);

  return {
    dashboard,
    entries: [...sorted].reverse(), // newest first for display
    ratingProgress,
    weakness,
    topicMatrix,
    readiness,
    virtualPlan,
    coach,
    goals: enrichedGoals,
    lastUpdated: new Date().toISOString(),
  };
}
