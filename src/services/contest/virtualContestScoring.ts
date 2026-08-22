import {
  VCProblemState,
  VCSession,
  VCScoreBreakdown,
  VCTopicPerformance,
  VCReadinessTier,
  VCReadinessProfile,
  VCHistoryRecord,
} from "./virtualContestTypes";
import { Difficulty } from "@/services/types";

// Base points by difficulty:
const BASE_POINTS: Record<Difficulty, number> = {
  Easy: 250,
  Medium: 500,
  Hard: 1000,
};

export function computeProblemBasePoints(difficulty: Difficulty): number {
  return BASE_POINTS[difficulty] || 250;
}

/**
 * Time bonus: award up to 20% extra for early solves.
 * timeBonus = basePoints * 0.2 * (1 - elapsedFraction)
 */
export function computeTimeBonus(
  basePoints: number,
  timeToSolveSeconds: number,
  totalDurationSeconds: number
): number {
  const frac = Math.min(1, Math.max(0, timeToSolveSeconds / Math.max(1, totalDurationSeconds)));
  return Math.round(basePoints * 0.2 * (1 - frac));
}

/**
 * Penalty deduction: -50 pts per wrong/TLE/runtime submission before the accepted one.
 */
export function computePenaltyDeduction(failedAttempts: number): number {
  return Math.max(0, failedAttempts * 50);
}

export function scoreSession(session: VCSession): VCScoreBreakdown {
  let baseScore = 0;
  let timeBonus = 0;
  let penaltyDeduction = 0;
  let totalSubmissions = 0;
  let totalAccepted = 0;
  const solveTimes: number[] = [];
  const diffBreakdown = { easy: 0, medium: 0, hard: 0 };

  for (const ps of session.problems) {
    const d = ps.problem.difficulty;
    const failedSubs = ps.submissions.filter(
      (s) =>
        s.verdict === "wrong_answer" ||
        s.verdict === "time_limit_exceeded" ||
        s.verdict === "runtime_error"
    ).length;
    const isAccepted = ps.status === "solved";

    totalSubmissions += ps.submissions.length;
    if (isAccepted) totalAccepted++;

    if (isAccepted) {
      const bp = computeProblemBasePoints(d);
      baseScore += bp;
      if (ps.timeToSolveSeconds !== undefined) {
        const tb = computeTimeBonus(bp, ps.timeToSolveSeconds, session.totalDurationSeconds);
        timeBonus += tb;
        solveTimes.push(ps.timeToSolveSeconds);
      }
      const pen = computePenaltyDeduction(failedSubs);
      penaltyDeduction += pen;

      if (d === "Easy") diffBreakdown.easy++;
      else if (d === "Medium") diffBreakdown.medium++;
      else diffBreakdown.hard++;
    } else {
      penaltyDeduction += computePenaltyDeduction(failedSubs);
    }
  }

  const maxPossibleScore = session.problems.reduce((sum, ps) => {
    const bp = computeProblemBasePoints(ps.problem.difficulty);
    return sum + bp + Math.round(bp * 0.2);
  }, 0);

  const finalScore = Math.max(0, baseScore + timeBonus - penaltyDeduction);
  const solveRate =
    session.problems.length > 0
      ? Math.round((totalAccepted / session.problems.length) * 100)
      : 0;
  const accuracy =
    totalSubmissions > 0
      ? Math.round((totalAccepted / totalSubmissions) * 100)
      : totalAccepted > 0
      ? 100
      : 0;
  const avgSolveTimeSeconds =
    solveTimes.length > 0
      ? Math.round(solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length)
      : 0;

  return {
    baseScore,
    timeBonus,
    penaltyDeduction,
    finalScore,
    maxPossibleScore,
    solveRate,
    accuracy,
    avgSolveTimeSeconds,
    fastestSolveSeconds: solveTimes.length > 0 ? Math.min(...solveTimes) : undefined,
    slowestSolveSeconds: solveTimes.length > 0 ? Math.max(...solveTimes) : undefined,
    difficultyBreakdown: diffBreakdown,
  };
}

export function computeTopicPerformance(problems: VCProblemState[]): VCTopicPerformance[] {
  const topicMap = new Map<
    string,
    { attempted: number; solved: number; times: number[] }
  >();

  for (const ps of problems) {
    for (const topic of ps.problem.topics) {
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { attempted: 0, solved: 0, times: [] });
      }
      const entry = topicMap.get(topic)!;
      if (ps.status !== "not_started") {
        entry.attempted++;
      }
      if (ps.status === "solved") {
        entry.solved++;
        if (ps.timeToSolveSeconds !== undefined) {
          entry.times.push(ps.timeToSolveSeconds);
        }
      }
    }
  }

  return Array.from(topicMap.entries()).map(([topic, data]) => {
    const rate = data.attempted > 0 ? data.solved / data.attempted : 0;
    const avgTime =
      data.times.length > 0
        ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length)
        : 0;
    return {
      topic,
      attempted: data.attempted,
      solved: data.solved,
      avgTimeSeconds: avgTime,
      performance: rate >= 0.7 ? "strong" : rate >= 0.4 ? "average" : "weak",
    };
  });
}

export function computeReadinessTier(score: number): {
  tier: VCReadinessTier;
  bandLabel: string;
} {
  if (score >= 88) return { tier: "Advanced", bandLabel: "Advanced (Top-tier contest execution)" };
  if (score >= 74) return { tier: "Strong", bandLabel: "Strong (Consistent multi-problem solver)" };
  if (score >= 58) return { tier: "Competitive", bandLabel: "Competitive (Solid contest fundamentals)" };
  if (score >= 40) return { tier: "Developing", bandLabel: "Developing (Building pace & accuracy)" };
  return { tier: "Beginner", bandLabel: "Beginner (Early contest journey)" };
}

export function computeReadinessProfile(history: VCHistoryRecord[]): VCReadinessProfile {
  if (history.length === 0) {
    return {
      score: 0,
      tier: "Beginner",
      bandLabel: "Beginner (No contests completed yet)",
      solveRate: 0,
      avgAccuracy: 0,
      avgTimeEfficiency: 0,
      topicCoverage: 0,
      recentTrend: "stable",
      contestsCompleted: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  const recent = history.slice(0, 10);
  const avgSolveRate =
    recent.reduce(
      (s, h) => s + (h.problemsSolved / Math.max(1, h.problemCount)) * 100,
      0
    ) / recent.length;
  const avgAccuracy =
    recent.reduce((s, h) => s + h.accuracy, 0) / recent.length;
  const avgTime =
    recent.reduce((s, h) => s + h.avgSolveTimeSeconds, 0) / recent.length;
  const timeEfficiency = Math.max(0, Math.min(100, 100 - (avgTime / 3600) * 100));

  const rawScore = avgSolveRate * 0.45 + avgAccuracy * 0.35 + timeEfficiency * 0.20;
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));
  const { tier, bandLabel } = computeReadinessTier(score);

  let recentTrend: "improving" | "stable" | "declining" = "stable";
  if (history.length >= 6) {
    const last3Avg = history.slice(0, 3).reduce((s, h) => s + h.score, 0) / 3;
    const prev3Avg = history.slice(3, 6).reduce((s, h) => s + h.score, 0) / 3;
    if (last3Avg > prev3Avg + 30) recentTrend = "improving";
    else if (last3Avg < prev3Avg - 30) recentTrend = "declining";
  }

  return {
    score,
    tier,
    bandLabel,
    solveRate: Math.round(avgSolveRate),
    avgAccuracy: Math.round(avgAccuracy),
    avgTimeEfficiency: Math.round(timeEfficiency),
    topicCoverage: Math.min(100, history.length * 15),
    recentTrend,
    contestsCompleted: history.filter((h) => h.status === "completed").length,
    lastUpdated: new Date().toISOString(),
  };
}
