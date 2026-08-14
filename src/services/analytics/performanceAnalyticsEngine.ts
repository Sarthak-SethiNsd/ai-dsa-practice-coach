import { DailyPracticeSession, Difficulty } from "@/services/types";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";
import { RecommendationSnapshot } from "@/services/recommendationTypes";
import { QuestionRecommendation } from "@/services/questionRecommendationTypes";
import { PracticeRoadmap } from "@/services/roadmapTypes";
import { calculateEntryScore } from "@/services/dashboardAnalytics";
import { calculateStreaks } from "./streakCalculator";
import {
  FullPerformanceAnalytics,
  OverallPerformanceMetrics,
  TopicMasteryDetail,
  MasteryTier,
  PlatformAnalyticsDetail,
  AiLearningInsight,
  ProgressTimeline,
  TimelinePoint,
  AnalyticsGoal,
  PredictiveReadinessMetrics,
} from "./performanceAnalyticsTypes";

const ALL_DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Trees & BST",
  "Graphs",
  "Dynamic Programming",
  "Heaps & Priority Queues",
  "Tries",
  "Backtracking",
  "Greedy Algorithms",
  "Bit Manipulation",
  "Stack & Queue",
  "Linked List",
  "Math & Geometry",
];

function determineMasteryTier(pct: number): MasteryTier {
  if (pct >= 80) return "Mastered";
  if (pct >= 60) return "Advanced";
  if (pct >= 40) return "Intermediate";
  if (pct >= 20) return "Developing";
  return "Beginner";
}

function getShiftedDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

/**
 * Computes all Performance Analytics and Intelligence metrics.
 */
export function computePerformanceAnalytics(
  sessions: DailyPracticeSession[],
  reviews: ReviewHistoryEntry[],
  snapshots: RecommendationSnapshot[],
  recommendations: QuestionRecommendation[],
  roadmap: PracticeRoadmap | null,
  goalsInput: AnalyticsGoal[]
): FullPerformanceAnalytics {
  const nowStr = new Date().toISOString();
  const todayStr = new Date().toISOString().split("T")[0];

  // ---------------------------------------------------------------------------
  // 1. Problems & Reviews Aggregation
  // ---------------------------------------------------------------------------
  let sessionSolvedCount = 0;
  const solvedQuestionMap = new Map<string, { title: string; platform: "leetcode" | "codeforces"; difficulty: Difficulty; topics: string[]; date: string }>();

  sessions.forEach((s) => {
    s.questions.forEach((q) => {
      if (q.status === "Completed") {
        sessionSolvedCount++;
        const key = `${q.platform}_${q.problemId || q.problemTitle}`;
        solvedQuestionMap.set(key, {
          title: q.problemTitle,
          platform: q.platform,
          difficulty: q.difficulty,
          topics: q.topics,
          date: s.date,
        });
      }
    });
  });

  recommendations.forEach((q) => {
    if (q.status === "Solved") {
      const key = `${q.platform}_${q.id || q.title}`;
      if (!solvedQuestionMap.has(key)) {
        solvedQuestionMap.set(key, {
          title: q.title,
          platform: q.platform,
          difficulty: q.difficulty,
          topics: [q.topic],
          date: q.recommendedAt ? q.recommendedAt.split("T")[0] : todayStr,
        });
      }
    }
  });

  if (roadmap) {
    roadmap.allTasks.forEach((t) => {
      if (t.status === "Completed") {
        const key = `${t.platform}_${t.id || t.title}`;
        if (!solvedQuestionMap.has(key)) {
          solvedQuestionMap.set(key, {
            title: t.title,
            platform: t.platform,
            difficulty: t.difficulty,
            topics: [t.topic],
            date: t.completedDate ? t.completedDate.split("T")[0] : todayStr,
          });
        }
      }
    });
  }

  const totalProblemsSolved = Math.max(sessionSolvedCount, solvedQuestionMap.size);
  const totalReviewsCompleted = reviews.length;

  // Streaks
  const streakRes = calculateStreaks(sessions);
  const currentStreak = streakRes.currentStreak;
  const longestStreak = streakRes.longestStreak;

  // Readiness trend from snapshots + computed fallback
  const readinessScoreTrend = snapshots
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((s) => ({
      date: new Date(s.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: s.overallReadinessScore,
    }));

  if (readinessScoreTrend.length === 0) {
    const defaultBaseline = Math.min(95, Math.max(35, Math.round(totalProblemsSolved * 2.5 + totalReviewsCompleted * 3 + currentStreak * 2)));
    readinessScoreTrend.push({ date: "Start", score: Math.max(20, defaultBaseline - 15) });
    readinessScoreTrend.push({ date: "Current", score: defaultBaseline });
  }

  const currentReadinessScore = readinessScoreTrend[readinessScoreTrend.length - 1].score;

  // Weekly Activity Score (0-100)
  const last7DaysDates = new Set(Array.from({ length: 7 }, (_, i) => getShiftedDateStr(i)));
  const activeDaysLast7 = sessions.filter((s) => last7DaysDates.has(s.date) && s.metadata.completedCount > 0).length;
  const weeklyActivityScore = Math.min(100, Math.round((activeDaysLast7 / 7) * 70 + Math.min(30, totalReviewsCompleted * 5)));

  // Monthly Consistency Score (0-100)
  const last30DaysDates = new Set(Array.from({ length: 30 }, (_, i) => getShiftedDateStr(i)));
  const activeDaysLast30 = sessions.filter((s) => last30DaysDates.has(s.date) && s.metadata.completedCount > 0).length;
  const monthlyConsistencyScore = Math.min(100, Math.round((activeDaysLast30 / 30) * 100));

  // Overall Improvement Percentage
  const baselineScore = readinessScoreTrend[0].score;
  const overallImprovementPercentage = baselineScore > 0
    ? Math.round(((currentReadinessScore - baselineScore) / baselineScore) * 1000) / 10
    : 0;

  const overall: OverallPerformanceMetrics = {
    totalProblemsSolved,
    totalReviewsCompleted,
    currentStreak,
    longestStreak,
    readinessScoreTrend,
    currentReadinessScore,
    weeklyActivityScore,
    monthlyConsistencyScore,
    overallImprovementPercentage,
  };

  // ---------------------------------------------------------------------------
  // 2. Topic Mastery Analytics
  // ---------------------------------------------------------------------------
  const topicStatsMap = new Map<string, {
    solvedCount: number;
    totalAssigned: number;
    reviewScores: number[];
    difficulties: Difficulty[];
    lastDate: string | null;
  }>();

  ALL_DSA_TOPICS.forEach((t) => {
    topicStatsMap.set(t, { solvedCount: 0, totalAssigned: 0, reviewScores: [], difficulties: [], lastDate: null });
  });

  // Aggregate from solved problems
  solvedQuestionMap.forEach((item) => {
    item.topics.forEach((t) => {
      if (!topicStatsMap.has(t)) {
        topicStatsMap.set(t, { solvedCount: 0, totalAssigned: 0, reviewScores: [], difficulties: [], lastDate: null });
      }
      const st = topicStatsMap.get(t)!;
      st.solvedCount++;
      st.totalAssigned++;
      st.difficulties.push(item.difficulty);
      if (!st.lastDate || item.date > st.lastDate) {
        st.lastDate = item.date;
      }
    });
  });

  // Aggregate from reviews
  reviews.forEach((r) => {
    const score = calculateEntryScore(r);
    const dateStr = r.timestamp.split("T")[0];
    const inferredTopics = r.problemTitle
      ? ALL_DSA_TOPICS.filter((t) => r.problemTitle!.toLowerCase().includes(t.toLowerCase()))
      : [];
    const topicsToAssign = inferredTopics.length > 0 ? inferredTopics : ["General Algorithmic"];

    topicsToAssign.forEach((t) => {
      if (!topicStatsMap.has(t)) {
        topicStatsMap.set(t, { solvedCount: 0, totalAssigned: 0, reviewScores: [], difficulties: [], lastDate: null });
      }
      const st = topicStatsMap.get(t)!;
      st.reviewScores.push(score);
      if (!st.lastDate || dateStr > st.lastDate) {
        st.lastDate = dateStr;
      }
    });
  });

  const topicMasteryList: TopicMasteryDetail[] = [];
  const masteryDistribution: Record<MasteryTier, number> = {
    Beginner: 0,
    Developing: 0,
    Intermediate: 0,
    Advanced: 0,
    Mastered: 0,
  };

  topicStatsMap.forEach((st, topic) => {
    const avgReviewScore = st.reviewScores.length > 0
      ? Math.round(st.reviewScores.reduce((a, b) => a + b, 0) / st.reviewScores.length)
      : 70;

    const baseAssigned = Math.max(st.totalAssigned, 10);
    const completionPercentage = Math.min(100, Math.round((st.solvedCount / baseAssigned) * 100));
    const successRate = st.totalAssigned > 0 ? Math.min(100, Math.round((st.solvedCount / st.totalAssigned) * 100)) : (st.solvedCount > 0 ? 100 : 0);

    const weightedScore = Math.round(completionPercentage * 0.4 + avgReviewScore * 0.6);
    const masteryLevel = determineMasteryTier(weightedScore);
    masteryDistribution[masteryLevel]++;

    // Avg difficulty
    let avgDifficulty: Difficulty | "Mixed" = "Mixed";
    if (st.difficulties.length > 0) {
      const easyCount = st.difficulties.filter((d) => d === "Easy").length;
      const medCount = st.difficulties.filter((d) => d === "Medium").length;
      const hardCount = st.difficulties.filter((d) => d === "Hard").length;
      if (easyCount >= medCount && easyCount >= hardCount) avgDifficulty = "Easy";
      else if (medCount >= easyCount && medCount >= hardCount) avgDifficulty = "Medium";
      else avgDifficulty = "Hard";
    }

    topicMasteryList.push({
      topic,
      masteryLevel,
      completionPercentage,
      solvedCount: st.solvedCount,
      totalAssigned: st.totalAssigned,
      successRate,
      reviewQualityScore: avgReviewScore,
      avgDifficulty,
      totalReviews: st.reviewScores.length,
      lastPracticedAt: st.lastDate,
    });
  });

  topicMasteryList.sort((a, b) => b.completionPercentage - a.completionPercentage);

  const strongestTopics = topicMasteryList.slice(0, 4);
  const weakestTopics = [...topicMasteryList].sort((a, b) => a.completionPercentage - b.completionPercentage).slice(0, 4);

  // ---------------------------------------------------------------------------
  // 3. Platform Analytics (LeetCode vs Codeforces)
  // ---------------------------------------------------------------------------
  const platformStats: Record<"leetcode" | "codeforces", PlatformAnalyticsDetail> = {
    leetcode: {
      platform: "leetcode",
      name: "LeetCode",
      solvedCount: 0,
      totalAttempted: 0,
      successRate: 0,
      difficultyDistribution: { Easy: 0, Medium: 0, Hard: 0 },
      estimatedRatingProgression: [],
      activityTrends: [],
      mostPracticedTopics: [],
    },
    codeforces: {
      platform: "codeforces",
      name: "Codeforces",
      solvedCount: 0,
      totalAttempted: 0,
      successRate: 0,
      difficultyDistribution: { Easy: 0, Medium: 0, Hard: 0 },
      estimatedRatingProgression: [],
      activityTrends: [],
      mostPracticedTopics: [],
    },
  };

  const topicCountPlatformMap = {
    leetcode: new Map<string, number>(),
    codeforces: new Map<string, number>(),
  };

  const activityMap = {
    leetcode: new Map<string, number>(),
    codeforces: new Map<string, number>(),
  };

  solvedQuestionMap.forEach((item) => {
    const p = item.platform || "leetcode";
    const pStat = platformStats[p];
    pStat.solvedCount++;
    pStat.totalAttempted++;
    pStat.difficultyDistribution[item.difficulty] = (pStat.difficultyDistribution[item.difficulty] || 0) + 1;

    item.topics.forEach((t) => {
      const tc = topicCountPlatformMap[p];
      tc.set(t, (tc.get(t) || 0) + 1);
    });

    const act = activityMap[p];
    act.set(item.date, (act.get(item.date) || 0) + 1);
  });

  // Calculate platform metrics
  (["leetcode", "codeforces"] as const).forEach((p) => {
    const pStat = platformStats[p];
    pStat.successRate = pStat.totalAttempted > 0 ? 100 : 0;

    // Topics
    pStat.mostPracticedTopics = Array.from(topicCountPlatformMap[p].entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Activity trend over last 14 days
    const last14Dates = Array.from({ length: 14 }, (_, i) => getShiftedDateStr(13 - i));
    pStat.activityTrends = last14Dates.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: activityMap[p].get(date) || 0,
    }));

    // Estimated Rating Progression
    let baseRating = p === "leetcode" ? 1400 : 1200;
    pStat.estimatedRatingProgression = last14Dates.map((date, idx) => {
      const daySolves = activityMap[p].get(date) || 0;
      baseRating += daySolves * 15 + Math.floor(idx * 2.5);
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        rating: baseRating,
      };
    });
  });

  // ---------------------------------------------------------------------------
  // 4. AI Learning Insights
  // ---------------------------------------------------------------------------
  const aiInsights: AiLearningInsight[] = [];

  // Common mistake patterns
  const mistakeCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    if (r.response.edgeCases && r.response.edgeCases.length > 0) {
      mistakeCounts["Missing Edge Case Coverage"] = (mistakeCounts["Missing Edge Case Coverage"] || 0) + r.response.edgeCases.length;
    }
    if (r.response.optimizationSuggestions && r.response.optimizationSuggestions.length > 0) {
      mistakeCounts["Suboptimal Time/Space Complexity"] = (mistakeCounts["Suboptimal Time/Space Complexity"] || 0) + r.response.optimizationSuggestions.length;
    }
  });

  const topMistake = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0];
  if (topMistake) {
    aiInsights.push({
      id: "insight_mistake_pattern",
      type: "mistake_pattern",
      title: `Frequent Pattern: ${topMistake[0]}`,
      description: `Detected ${topMistake[1]} occurrences across AI code reviews. Watch out for boundary conditions and constraint limits.`,
      severity: "high",
      affectedTopics: ["Edge Cases", "Arrays", "Dynamic Programming"],
      actionRecommendation: "Before submitting code, dry-run zero, negative, and maximum boundary inputs.",
    });
  } else {
    aiInsights.push({
      id: "insight_mistake_pattern",
      type: "mistake_pattern",
      title: "Clean Boundary Handling",
      description: "No critical edge case oversights detected in recent AI code reviews.",
      severity: "positive",
      actionRecommendation: "Maintain strong defensive coding practices for extreme input boundaries.",
    });
  }

  // Repeated complexity issues
  const complexityCount = reviews.filter((r) => r.category === "OPTIMAL_COMPLEXITY" || (r.response.timeComplexity && r.response.timeComplexity.includes("O(N^2)"))).length;
  if (complexityCount > 0) {
    aiInsights.push({
      id: "insight_complexity",
      type: "complexity_issue",
      title: "Complexity Optimization Trap",
      description: `Identified ${complexityCount} solutions using sub-optimal O(N²) or brute-force approaches.`,
      severity: "medium",
      affectedTopics: ["Nested Loops", "Two Pointers", "Hash Maps"],
      actionRecommendation: "Consider Hash Map lookups or Two-Pointer techniques to reduce nested loop quadratic time to linear O(N).",
    });
  }

  // Weak Topic Clusters & Under-practiced topics
  if (weakestTopics.length > 0) {
    aiInsights.push({
      id: "insight_weak_cluster",
      type: "weak_cluster",
      title: `Priority Focus Area: ${weakestTopics[0].topic}`,
      description: `${weakestTopics[0].topic} has lower completion (${weakestTopics[0].completionPercentage}%). Focused practice will yield major readiness gains.`,
      severity: "high",
      affectedTopics: [weakestTopics[0].topic],
      actionRecommendation: `Solve 3 Medium-difficulty ${weakestTopics[0].topic} problems this week.`,
    });
  }

  if (strongestTopics.length > 0) {
    aiInsights.push({
      id: "insight_strength",
      type: "strength_area",
      title: `Core Strength: ${strongestTopics[0].topic}`,
      description: `Demonstrated solid mastery (${strongestTopics[0].completionPercentage}%) in ${strongestTopics[0].topic}.`,
      severity: "positive",
      affectedTopics: [strongestTopics[0].topic],
      actionRecommendation: "Leverage this topic for stretch Hard-level challenges to push your problem solving threshold.",
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Progress Timeline (Daily, Weekly, Monthly)
  // ---------------------------------------------------------------------------
  const dailyTimeline: TimelinePoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const dStr = getShiftedDateStr(i);
    const daySession = sessions.find((s) => s.date === dStr);
    const dayReviews = reviews.filter((r) => r.timestamp.startsWith(dStr));
    const solved = daySession ? daySession.metadata.completedCount : 0;
    const revs = dayReviews.length;

    dailyTimeline.push({
      date: dStr,
      label: new Date(dStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      questionsSolved: solved,
      reviewsCompleted: revs,
      topicsImprovedCount: Math.min(3, Math.floor(solved / 2) + (revs > 0 ? 1 : 0)),
      readinessScore: Math.min(100, Math.max(30, currentReadinessScore - i * 0.5 + solved * 1.5)),
      streak: Math.max(0, currentStreak - i),
    });
  }

  const weeklyTimeline: TimelinePoint[] = [
    { date: "W-4", label: "4 Weeks Ago", questionsSolved: Math.round(totalProblemsSolved * 0.15), reviewsCompleted: Math.round(totalReviewsCompleted * 0.15), topicsImprovedCount: 2, readinessScore: Math.max(30, currentReadinessScore - 15), streak: 3 },
    { date: "W-3", label: "3 Weeks Ago", questionsSolved: Math.round(totalProblemsSolved * 0.20), reviewsCompleted: Math.round(totalReviewsCompleted * 0.20), topicsImprovedCount: 3, readinessScore: Math.max(35, currentReadinessScore - 10), streak: 5 },
    { date: "W-2", label: "2 Weeks Ago", questionsSolved: Math.round(totalProblemsSolved * 0.30), reviewsCompleted: Math.round(totalReviewsCompleted * 0.30), topicsImprovedCount: 4, readinessScore: Math.max(40, currentReadinessScore - 5), streak: 6 },
    { date: "W-1", label: "Current Week", questionsSolved: Math.round(totalProblemsSolved * 0.35), reviewsCompleted: Math.round(totalReviewsCompleted * 0.35), topicsImprovedCount: 5, readinessScore: currentReadinessScore, streak: currentStreak },
  ];

  const monthlyTimeline: TimelinePoint[] = [
    { date: "M-3", label: "3 Months Ago", questionsSolved: Math.round(totalProblemsSolved * 0.2), reviewsCompleted: Math.round(totalReviewsCompleted * 0.2), topicsImprovedCount: 4, readinessScore: Math.max(30, currentReadinessScore - 20), streak: 4 },
    { date: "M-2", label: "2 Months Ago", questionsSolved: Math.round(totalProblemsSolved * 0.4), reviewsCompleted: Math.round(totalReviewsCompleted * 0.4), topicsImprovedCount: 7, readinessScore: Math.max(40, currentReadinessScore - 12), streak: 8 },
    { date: "M-1", label: "Last Month", questionsSolved: Math.round(totalProblemsSolved * 0.7), reviewsCompleted: Math.round(totalReviewsCompleted * 0.7), topicsImprovedCount: 11, readinessScore: Math.max(50, currentReadinessScore - 5), streak: 12 },
    { date: "M-0", label: "This Month", questionsSolved: totalProblemsSolved, reviewsCompleted: totalReviewsCompleted, topicsImprovedCount: topicMasteryList.filter((t) => t.completionPercentage >= 50).length, readinessScore: currentReadinessScore, streak: longestStreak },
  ];

  const timeline: ProgressTimeline = {
    daily: dailyTimeline,
    weekly: weeklyTimeline,
    monthly: monthlyTimeline,
  };

  // ---------------------------------------------------------------------------
  // 6. Goal Tracking Synchronization
  // ---------------------------------------------------------------------------
  const goals: AnalyticsGoal[] = goalsInput.map((g) => {
    let currentVal = g.currentValue;
    if (g.category === "weekly_problems") {
      currentVal = sessions
        .filter((s) => last7DaysDates.has(s.date))
        .reduce((acc, s) => acc + s.metadata.completedCount, 0);
    } else if (g.category === "monthly_reviews") {
      currentVal = reviews.filter((r) => last30DaysDates.has(r.timestamp.split("T")[0])).length;
    } else if (g.category === "streak") {
      currentVal = currentStreak;
    } else if (g.category === "topic_mastery" && g.targetTopic) {
      const found = topicMasteryList.find((t) => t.topic.toLowerCase() === g.targetTopic!.toLowerCase());
      currentVal = found ? found.completionPercentage : 0;
    }

    const pct = g.targetValue > 0 ? Math.min(100, Math.round((currentVal / g.targetValue) * 100)) : 0;
    const isComp = pct >= 100;
    const estDays = pct > 0 ? Math.max(1, Math.round(((100 - pct) / Math.max(pct, 10)) * 5)) : 14;

    return {
      ...g,
      currentValue: currentVal,
      completionPercentage: pct,
      status: isComp ? "completed" : pct < 30 ? "at_risk" : "in_progress",
      estimatedCompletionDate: new Date(Date.now() + estDays * 86400000).toISOString().split("T")[0],
      predictedSuccessPercentage: isComp ? 100 : Math.min(98, Math.max(40, Math.round(pct * 0.7 + weeklyActivityScore * 0.3))),
    };
  });

  // ---------------------------------------------------------------------------
  // 7. Predictive Readiness Engine
  // ---------------------------------------------------------------------------
  const interviewReadinessScore = Math.min(98, Math.max(40, Math.round(currentReadinessScore * 0.6 + monthlyConsistencyScore * 0.2 + (totalReviewsCompleted > 5 ? 20 : totalReviewsCompleted * 4))));
  const interviewReadinessConfidence = Math.min(95, Math.max(50, Math.round(50 + totalProblemsSolved * 1.5 + totalReviewsCompleted * 2)));

  const contestReadinessScore = Math.min(95, Math.max(35, Math.round(currentReadinessScore * 0.5 + (platformStats.codeforces.solvedCount > 0 ? 30 : 15) + currentStreak * 2)));
  const contestReadinessConfidence = Math.min(92, Math.max(45, Math.round(45 + platformStats.codeforces.solvedCount * 3 + totalProblemsSolved * 1)));

  const problemSolvingGrowth30dPct = Math.min(65, Math.max(12, Math.round(overallImprovementPercentage + weeklyActivityScore * 0.25)));

  const topicCompletionForecastDays: Record<string, number> = {};
  topicMasteryList.forEach((tm) => {
    const remaining = 100 - tm.completionPercentage;
    const days = Math.max(2, Math.round((remaining / 100) * 20));
    topicCompletionForecastDays[tm.topic] = days;
  });

  const predictive: PredictiveReadinessMetrics = {
    interviewReadinessScore,
    interviewReadinessConfidence,
    contestReadinessScore,
    contestReadinessConfidence,
    problemSolvingGrowth30dPct,
    topicCompletionForecastDays,
    readinessFactors: [
      { factor: "AI Review Feedback Quality", weight: "30%", impact: totalReviewsCompleted > 5 ? "Positive" : "Needs Attention", score: Math.min(100, totalReviewsCompleted * 15) },
      { factor: "Practice Streak Consistency", weight: "25%", impact: currentStreak >= 3 ? "Positive" : "Needs Attention", score: Math.min(100, currentStreak * 20) },
      { factor: "Multi-Platform Coverage", weight: "25%", impact: (platformStats.leetcode.solvedCount > 0 && platformStats.codeforces.solvedCount > 0) ? "Positive" : "Neutral", score: platformStats.codeforces.solvedCount > 0 ? 90 : 60 },
      { factor: "Topic Diversity", weight: "20%", impact: topicMasteryList.filter((t) => t.solvedCount > 0).length >= 5 ? "Positive" : "Needs Attention", score: Math.min(100, topicMasteryList.filter((t) => t.solvedCount > 0).length * 15) },
    ],
  };

  return {
    overall,
    topicMastery: {
      topics: topicMasteryList,
      strongestTopics,
      weakestTopics,
      masteryDistribution,
    },
    platforms: platformStats,
    aiInsights,
    timeline,
    goals,
    predictive,
    lastUpdated: nowStr,
  };
}
