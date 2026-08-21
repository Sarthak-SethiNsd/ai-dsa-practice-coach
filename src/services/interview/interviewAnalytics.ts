import {
  InterviewHistoryRecord,
  InterviewAnalyticsSummary,
} from "./interviewTypes";
import { Difficulty } from "@/services/types";
import { computeReadinessTier } from "./interviewScoring";

export type AnalyticsTimeframe = "7d" | "30d" | "90d" | "all";

export function filterHistoryByTimeframe(
  history: InterviewHistoryRecord[],
  timeframe: AnalyticsTimeframe
): InterviewHistoryRecord[] {
  if (timeframe === "all") return history;

  const now = new Date();
  const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  return history.filter((h) => h.date >= cutoffStr);
}

export function computeInterviewAnalytics(
  allHistory: InterviewHistoryRecord[],
  timeframe: AnalyticsTimeframe = "30d"
): InterviewAnalyticsSummary {
  const filtered = filterHistoryByTimeframe(allHistory, timeframe);
  const completed = filtered.filter((h) => h.status === "completed");

  const totalInterviews = filtered.length;
  const completedInterviews = completed.length;

  if (completedInterviews === 0) {
    return {
      totalInterviews,
      completedInterviews: 0,
      avgScore: 0,
      highestScore: 0,
      currentReadinessTier: "Beginner",
      readinessProgressPercent: 0,
      totalQuestionsSolved: 0,
      totalMinutesPracticed: 0,
      avgHintCountPerInterview: 0,
      scoreTrend: [],
      topicPerformance: [],
      difficultyDistribution: { Easy: 0, Medium: 0, Hard: 0, Adaptive: 0 },
      communicationTrend: [],
      complexityAccuracyTrend: [],
      strongestAreas: ["Complete interviews to generate insights"],
      weakestAreas: ["No weak areas recorded yet"],
    };
  }

  const scores = completed.map((h) => h.overallScore);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const highestScore = Math.max(...scores);
  const { tier: currentReadinessTier } = computeReadinessTier(avgScore);
  const readinessProgressPercent = Math.min(100, Math.round((avgScore / 100) * 100));

  const totalQuestionsSolved = completed.reduce((a, b) => a + b.questionsCompleted, 0);
  const totalMinutesPracticed = completed.reduce((a, b) => a + b.actualDurationMinutes, 0);
  const avgHintCountPerInterview = Number(
    (completed.reduce((a, b) => a + b.hintCount, 0) / completed.length).toFixed(1)
  );

  // Score trend chronologically sorted
  const sorted = [...completed].sort((a, b) => a.date.localeCompare(b.date));
  const scoreTrend = sorted.map((h) => ({
    date: h.date,
    score: h.overallScore,
    type: h.interviewType,
  }));

  const communicationTrend = sorted.map((h) => ({
    date: h.date,
    score: h.reportSummary?.communicationScore ?? h.overallScore,
  }));

  const complexityAccuracyTrend = sorted.map((h) => ({
    date: h.date,
    score: h.reportSummary?.complexityScore ?? h.overallScore,
  }));

  // Topic breakdown
  const topicMap = new Map<string, { count: number; totalScore: number }>();
  completed.forEach((h) => {
    const existing = topicMap.get(h.interviewType) || { count: 0, totalScore: 0 };
    existing.count += 1;
    existing.totalScore += h.overallScore;
    topicMap.set(h.interviewType, existing);
  });

  const topicPerformance = Array.from(topicMap.entries()).map(([topic, data]) => {
    const topicAvg = Math.round(data.totalScore / data.count);
    let readinessStatus: "Strong" | "Developing" | "Needs Practice" = "Developing";
    if (topicAvg >= 80) readinessStatus = "Strong";
    else if (topicAvg < 65) readinessStatus = "Needs Practice";

    return {
      topic,
      interviewCount: data.count,
      avgScore: topicAvg,
      readinessStatus,
    };
  });

  // Difficulty distribution
  const difficultyDistribution: Record<Difficulty | "Adaptive", number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
    Adaptive: 0,
  };
  completed.forEach((h) => {
    if (h.difficulty in difficultyDistribution) {
      difficultyDistribution[h.difficulty as Difficulty | "Adaptive"] += 1;
    }
  });

  // Strengths & Weaknesses aggregation
  const allStrengths = completed.flatMap((h) => h.mainStrengths);
  const allWeaknesses = completed.flatMap((h) => h.mainWeaknesses);

  const strongestAreas = Array.from(new Set(allStrengths)).slice(0, 4);
  const weakestAreas = Array.from(new Set(allWeaknesses)).slice(0, 4);

  return {
    totalInterviews,
    completedInterviews,
    avgScore,
    highestScore,
    currentReadinessTier,
    readinessProgressPercent,
    totalQuestionsSolved,
    totalMinutesPracticed,
    avgHintCountPerInterview,
    scoreTrend,
    topicPerformance,
    difficultyDistribution,
    communicationTrend,
    complexityAccuracyTrend,
    strongestAreas: strongestAreas.length > 0 ? strongestAreas : ["Clean code structure"],
    weakestAreas: weakestAreas.length > 0 ? weakestAreas : ["Edge case discovery"],
  };
}
