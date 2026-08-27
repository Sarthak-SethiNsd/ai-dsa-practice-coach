import {
  TimeEfficiencyAnalysis,
  TimeEfficiencyTrend,
  LongitudinalEvent,
} from "./performanceTypes";
import { AggregatedDataSet } from "./performanceAggregation";
import { Difficulty } from "@/services/types";

export function analyzeTimeEfficiency(
  dataset: AggregatedDataSet
): TimeEfficiencyAnalysis {
  const current = dataset.currentPeriodEvents;
  const previous = dataset.previousPeriodEvents;

  const curSolveEvents = current.filter(
    (e) => (e.outcome === "SOLVED_INDEPENDENTLY" || e.outcome === "SOLVED_WITH_HINTS" || e.outcome === "COMPLETED") &&
      e.solveTimeSeconds && e.solveTimeSeconds > 0
  );

  const prevSolveEvents = previous.filter(
    (e) => (e.outcome === "SOLVED_INDEPENDENTLY" || e.outcome === "SOLVED_WITH_HINTS" || e.outcome === "COMPLETED") &&
      e.solveTimeSeconds && e.solveTimeSeconds > 0
  );

  const curTimes = curSolveEvents.map((e) => e.solveTimeSeconds!);
  const prevTimes = prevSolveEvents.map((e) => e.solveTimeSeconds!);

  const overallAverageSolveTimeSeconds = curTimes.length > 0
    ? Math.round(curTimes.reduce((sum, s) => sum + s, 0) / curTimes.length)
    : 0;

  const overallMedianSolveTimeSeconds = computeMedian(curTimes);
  const prevMedianTime = prevTimes.length > 0 ? computeMedian(prevTimes) : null;

  // Breakdown by difficulty
  const byDifficulty: Record<Difficulty, { medianSeconds: number; avgSeconds: number }> = {
    Easy: computeDifficultyTimeStats(curSolveEvents, "Easy"),
    Medium: computeDifficultyTimeStats(curSolveEvents, "Medium"),
    Hard: computeDifficultyTimeStats(curSolveEvents, "Hard"),
  };

  // Can solve vs Can solve efficiently
  const totalAttempts = current.length;
  const totalSolved = curSolveEvents.length;
  const canSolveRate = totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0;

  const efficientSolves = curSolveEvents.filter((e) => {
    const est = e.estimatedTimeSeconds ?? 1500;
    return e.solveTimeSeconds! <= est * 1.2;
  }).length;

  const canSolveEfficientlyRate = totalAttempts > 0
    ? Math.round((efficientSolves / totalAttempts) * 100)
    : 0;

  const efficiencyGapPct = Math.max(0, canSolveRate - canSolveEfficientlyRate);

  // Speed improvement %
  let speedImprovementPct: number | null = null;
  if (prevMedianTime !== null && prevMedianTime > 0 && overallMedianSolveTimeSeconds > 0) {
    // positive = faster (reduced time)
    speedImprovementPct = Math.round(((prevMedianTime - overallMedianSolveTimeSeconds) / prevMedianTime) * 100);
  }

  // Trend detection
  let overallTrend: TimeEfficiencyTrend = "INSUFFICIENT_DATA";
  let diagnosis = "";

  if (curSolveEvents.length < 3) {
    overallTrend = "INSUFFICIENT_DATA";
    diagnosis = `Insufficient solve timing samples (${curSolveEvents.length}) to evaluate longitudinal time efficiency.`;
  } else if (speedImprovementPct !== null && speedImprovementPct >= 20) {
    overallTrend = "FAST_IMPROVEMENT";
    diagnosis = `Significant speed acceleration: median solve time decreased by ${speedImprovementPct}% compared to previous period (${Math.round(overallMedianSolveTimeSeconds / 60)} min vs ${Math.round(prevMedianTime! / 60)} min).`;
  } else if (speedImprovementPct !== null && speedImprovementPct >= 8) {
    overallTrend = "SLOW_IMPROVEMENT";
    diagnosis = `Steady speed improvement: median solve time improved by ${speedImprovementPct}% (${Math.round(overallMedianSolveTimeSeconds / 60)} min).`;
  } else if (speedImprovementPct !== null && speedImprovementPct <= -15) {
    overallTrend = "DEGRADING";
    diagnosis = `Solve time increased by ${Math.abs(speedImprovementPct)}% vs prior baseline. May reflect harder problem distribution or fatigue.`;
  } else {
    overallTrend = "STABLE";
    diagnosis = `Solve speed is stable with a median time of ${Math.round(overallMedianSolveTimeSeconds / 60)} min across ${curSolveEvents.length} solved problems.`;
  }

  return {
    overallTrend,
    overallMedianSolveTimeSeconds,
    overallAverageSolveTimeSeconds,
    byDifficulty,
    canSolveRate,
    canSolveEfficientlyRate,
    efficiencyGapPct,
    speedImprovementPct,
    diagnosis,
  };
}

function computeDifficultyTimeStats(
  events: LongitudinalEvent[],
  diff: Difficulty
): { medianSeconds: number; avgSeconds: number } {
  const diffTimes = events
    .filter((e) => e.difficulty === diff && e.solveTimeSeconds && e.solveTimeSeconds > 0)
    .map((e) => e.solveTimeSeconds!);

  const avgSeconds = diffTimes.length > 0
    ? Math.round(diffTimes.reduce((sum, s) => sum + s, 0) / diffTimes.length)
    : 0;

  const medianSeconds = computeMedian(diffTimes);
  return { medianSeconds, avgSeconds };
}

function computeMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
