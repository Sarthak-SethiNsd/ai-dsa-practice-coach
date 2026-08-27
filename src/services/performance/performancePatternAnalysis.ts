import {
  PatternPerformanceTrend,
  PatternExposureStatus,
  LongitudinalEvent,
} from "./performanceTypes";
import { AggregatedDataSet } from "./performanceAggregation";
import { mapTopicsToPattern } from "@/services/recommendations/recommendationFilters";

const CANONICAL_PATTERNS = [
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Tree BFS / DFS",
  "Graph Traversal",
  "Dynamic Programming",
  "Backtracking",
  "Heaps / Priority Queue",
  "Fast & Slow Pointers",
  "Modified Binary Search",
  "Interval Overlaps",
  "Prefix Sums",
  "Monotonic Stack",
  "Bit Manipulation",
  "Greedy Choices",
];

export function analyzePatternCoverage(
  dataset: AggregatedDataSet,
  activeGoalPriorityTopics: string[] = []
): PatternPerformanceTrend[] {
  const current = dataset.currentPeriodEvents;
  const previous = dataset.previousPeriodEvents;
  const totalAttempts = current.length;

  const currentByPattern = groupEventsByPattern(current);
  const previousByPattern = groupEventsByPattern(previous);

  const allPatterns = Array.from(
    new Set([...CANONICAL_PATTERNS, ...Object.keys(currentByPattern)])
  );

  const results: PatternPerformanceTrend[] = [];

  for (const patternName of allPatterns) {
    const curEvents = currentByPattern[patternName] ?? [];
    const prevEvents = previousByPattern[patternName] ?? [];

    const exposureCount = curEvents.length;
    const exposurePercentage = totalAttempts > 0
      ? Math.round((exposureCount / totalAttempts) * 100)
      : 0;

    const solvedCount = curEvents.filter(
      (e) => e.outcome === "SOLVED_INDEPENDENTLY" || e.outcome === "SOLVED_WITH_HINTS" || e.outcome === "COMPLETED"
    ).length;
    const independentSolves = curEvents.filter((e) => e.outcome === "SOLVED_INDEPENDENTLY").length;

    const solveRate = exposureCount > 0 ? Math.round((solvedCount / exposureCount) * 100) : 0;
    const independentSolveRate = exposureCount > 0 ? Math.round((independentSolves / exposureCount) * 100) : 0;

    const solveTimes = curEvents
      .filter((e) => e.solveTimeSeconds && e.solveTimeSeconds > 0)
      .map((e) => e.solveTimeSeconds!);
    const averageSolveTimeSeconds = solveTimes.length > 0
      ? Math.round(solveTimes.reduce((sum, t) => sum + t, 0) / solveTimes.length)
      : 0;

    // Previous solve rate
    const prevIndep = prevEvents.filter((e) => e.outcome === "SOLVED_INDEPENDENTLY").length;
    const prevIndepRate = prevEvents.length > 0 ? Math.round((prevIndep / prevEvents.length) * 100) : null;

    // Trend direction
    let trendDirection: PatternPerformanceTrend["trendDirection"] = "INSUFFICIENT_DATA";
    if (exposureCount >= 3) {
      if (prevIndepRate !== null && independentSolveRate >= prevIndepRate + 15) {
        trendDirection = "IMPROVING";
      } else if (prevIndepRate !== null && independentSolveRate <= prevIndepRate - 15) {
        trendDirection = "DECLINING";
      } else {
        trendDirection = "STABLE";
      }
    }

    // Exposure status classification
    let exposureStatus: PatternExposureStatus = "OPTIMAL";
    const isGoalPriority = activeGoalPriorityTopics.some((t) =>
      patternName.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(patternName.toLowerCase())
    );

    if (totalAttempts >= 6) {
      if (exposurePercentage >= 35) {
        // High concentration
        exposureStatus = isGoalPriority ? "OPTIMAL" : "OVEREXPOSED";
      } else if (exposureCount === 0) {
        exposureStatus = isGoalPriority ? "UNDEREXPOSED" : "NEGLECTED";
      } else if (exposurePercentage < 8 && isGoalPriority) {
        exposureStatus = "UNDEREXPOSED";
      } else {
        exposureStatus = "OPTIMAL";
      }
    } else {
      exposureStatus = exposureCount === 0 ? "NEGLECTED" : "OPTIMAL";
    }

    // Action recommendation
    let actionRecommendation = "";
    if (exposureStatus === "OVEREXPOSED") {
      actionRecommendation = `Overexposure detected (${exposurePercentage}% of attempts). Consider diversifying practice into adjacent patterns.`;
    } else if (exposureStatus === "UNDEREXPOSED") {
      actionRecommendation = `High goal relevance but low exposure (${exposureCount} attempts). Schedule dedicated ${patternName} practice.`;
    } else if (exposureStatus === "NEGLECTED") {
      actionRecommendation = `No attempts recorded in this window. Introduce a warmup problem to maintain pattern familiarity.`;
    } else if (independentSolveRate >= 80 && exposureCount >= 3) {
      actionRecommendation = `Strong mastery (${independentSolveRate}% independent solves). Ready for challenge-tier variations.`;
    } else if (independentSolveRate <= 40 && exposureCount >= 3) {
      actionRecommendation = `Low independence (${independentSolveRate}%). Recommend guided pattern drills with worked examples.`;
    } else {
      actionRecommendation = `Balanced pattern exposure. Maintain regular practice cadence.`;
    }

    results.push({
      patternName,
      exposureCount,
      exposurePercentage,
      exposureStatus,
      solvedCount,
      independentSolves,
      solveRate,
      independentSolveRate,
      averageSolveTimeSeconds,
      trendDirection,
      actionRecommendation,
    });
  }

  // Sort: Overexposed and underexposed first, then by exposure count
  results.sort((a, b) => {
    const rank = (p: PatternPerformanceTrend) => {
      if (p.exposureStatus === "UNDEREXPOSED") return 100 + p.exposureCount;
      if (p.exposureStatus === "OVEREXPOSED") return 80 + p.exposureCount;
      if (p.exposureCount > 0) return 50 + p.exposureCount;
      return 0;
    };
    return rank(b) - rank(a);
  });

  return results;
}

function groupEventsByPattern(events: LongitudinalEvent[]): Record<string, LongitudinalEvent[]> {
  const map: Record<string, LongitudinalEvent[]> = {};
  for (const e of events) {
    const pattern = e.primaryPattern || mapTopicsToPattern(e.topics);
    // Find closest canonical pattern match
    const canonical = CANONICAL_PATTERNS.find(
      (cp) => cp.toLowerCase() === pattern.toLowerCase() || pattern.toLowerCase().includes(cp.toLowerCase())
    ) || pattern;

    if (!map[canonical]) map[canonical] = [];
    map[canonical].push(e);
  }
  return map;
}
