import {
  LongitudinalEvent,
  PerformanceMetricsSnapshot,
  PerformanceWindow,
} from "./performanceTypes";
import { AggregatedDataSet } from "./performanceAggregation";
import { computeMetricTrend, computeTimeMetricTrend } from "./performanceTrends";

export function computePerformanceMetrics(
  dataset: AggregatedDataSet,
  window: PerformanceWindow,
  activeGoalTopicNames: string[] = []
): PerformanceMetricsSnapshot {
  const current = dataset.currentPeriodEvents;
  const previous = dataset.previousPeriodEvents;

  // 1. Current Period Counts
  const totalAttempts = current.length;
  const totalSolved = current.filter(
    (e) => e.outcome === "SOLVED_INDEPENDENTLY" || e.outcome === "SOLVED_WITH_HINTS" || e.outcome === "COMPLETED"
  ).length;
  const independentSolves = current.filter((e) => e.outcome === "SOLVED_INDEPENDENTLY").length;
  const hintAssistedSolves = current.filter((e) => e.outcome === "SOLVED_WITH_HINTS").length;
  const failures = current.filter((e) => e.outcome === "FAILED").length;
  const skips = current.filter((e) => e.outcome === "SKIPPED").length;
  const timeouts = current.filter((e) => e.outcome === "TIMED_OUT").length;

  // 2. Previous Period Counts
  const prevAttempts = previous.length;
  const prevSolved = previous.filter(
    (e) => e.outcome === "SOLVED_INDEPENDENTLY" || e.outcome === "SOLVED_WITH_HINTS" || e.outcome === "COMPLETED"
  ).length;
  const prevIndependent = previous.filter((e) => e.outcome === "SOLVED_INDEPENDENTLY").length;
  const prevHintAssisted = previous.filter((e) => e.outcome === "SOLVED_WITH_HINTS").length;
  const prevFailures = previous.filter((e) => e.outcome === "FAILED").length;
  const prevTimeouts = previous.filter((e) => e.outcome === "TIMED_OUT").length;
  const prevSkips = previous.filter((e) => e.outcome === "SKIPPED").length;

  // 3. Current Rates (0-100%)
  const curSolveRate = totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0;
  const curIndepRate = totalAttempts > 0 ? Math.round((independentSolves / totalAttempts) * 100) : 0;
  const curHintRate = totalAttempts > 0 ? Math.round((hintAssistedSolves / totalAttempts) * 100) : 0;
  const curFailRate = totalAttempts > 0 ? Math.round((failures / totalAttempts) * 100) : 0;
  const curTimeoutRate = totalAttempts > 0 ? Math.round((timeouts / totalAttempts) * 100) : 0;
  const curSkipRate = totalAttempts > 0 ? Math.round((skips / totalAttempts) * 100) : 0;

  // 4. Previous Rates (0-100%)
  const prevSolveRate = prevAttempts > 0 ? Math.round((prevSolved / prevAttempts) * 100) : null;
  const prevIndepRate = prevAttempts > 0 ? Math.round((prevIndependent / prevAttempts) * 100) : null;
  const prevHintRate = prevAttempts > 0 ? Math.round((prevHintAssisted / prevAttempts) * 100) : null;
  const prevFailRate = prevAttempts > 0 ? Math.round((prevFailures / prevAttempts) * 100) : null;
  const prevTimeoutRate = prevAttempts > 0 ? Math.round((prevTimeouts / prevAttempts) * 100) : null;
  const prevSkipRate = prevAttempts > 0 ? Math.round((prevSkips / prevAttempts) * 100) : null;

  // 5. Time Calculations
  const curSolveTimes = current
    .filter((e) => e.solveTimeSeconds && e.solveTimeSeconds > 0)
    .map((e) => e.solveTimeSeconds!);

  const prevSolveTimes = previous
    .filter((e) => e.solveTimeSeconds && e.solveTimeSeconds > 0)
    .map((e) => e.solveTimeSeconds!);

  const curAvgTimeSec = curSolveTimes.length > 0
    ? Math.round(curSolveTimes.reduce((sum, s) => sum + s, 0) / curSolveTimes.length)
    : 0;

  const prevAvgTimeSec = prevSolveTimes.length > 0
    ? Math.round(prevSolveTimes.reduce((sum, s) => sum + s, 0) / prevSolveTimes.length)
    : null;

  const curMedianTimeSec = computeMedian(curSolveTimes);
  const prevMedianTimeSec = prevSolveTimes.length > 0 ? computeMedian(prevSolveTimes) : null;

  // Time Efficiency Score (0-100)
  // Evaluates percentage of solves done <= 1.2x estimated effort
  const efficientSolves = current.filter((e) => {
    if (e.outcome !== "SOLVED_INDEPENDENTLY" && e.outcome !== "SOLVED_WITH_HINTS") return false;
    const est = e.estimatedTimeSeconds ?? 1500;
    return (e.solveTimeSeconds ?? 9999) <= est * 1.2;
  }).length;
  const curTimeEfficiencyScore = totalSolved > 0 ? Math.round((efficientSolves / totalSolved) * 100) : 0;

  const prevEfficientSolves = previous.filter((e) => {
    if (e.outcome !== "SOLVED_INDEPENDENTLY" && e.outcome !== "SOLVED_WITH_HINTS") return false;
    const est = e.estimatedTimeSeconds ?? 1500;
    return (e.solveTimeSeconds ?? 9999) <= est * 1.2;
  }).length;
  const prevTimeEfficiencyScore = prevSolved > 0 ? Math.round((prevEfficientSolves / prevSolved) * 100) : null;

  // 6. Session counts & completion
  const sessionIds = [...new Set(current.map((e) => e.sessionId).filter(Boolean))];
  const sessionCount = sessionIds.length;

  const curSessionCompletionRate = totalAttempts > 0
    ? Math.round(((totalAttempts - skips) / totalAttempts) * 100)
    : 0;
  const prevSessionCompletionRate = prevAttempts > 0
    ? Math.round(((prevAttempts - prevSkips) / prevAttempts) * 100)
    : null;

  // 7. Goal alignment
  let activeGoalAlignmentPct = 70; // default baseline
  if (activeGoalTopicNames.length > 0 && totalAttempts > 0) {
    const matching = current.filter((e) =>
      e.topics.some((t) => activeGoalTopicNames.some((gt) => gt.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(gt.toLowerCase())))
    ).length;
    activeGoalAlignmentPct = Math.round((matching / totalAttempts) * 100);
  }

  // 8. Trends
  const solveRate = computeMetricTrend({
    currentValue: curSolveRate,
    previousValue: prevSolveRate,
    sampleSize: totalAttempts,
    higherIsBetter: true,
    metricName: "Solve Rate",
  });

  const independentSolveRate = computeMetricTrend({
    currentValue: curIndepRate,
    previousValue: prevIndepRate,
    sampleSize: totalAttempts,
    higherIsBetter: true,
    metricName: "Independent Solve Rate",
  });

  const hintAssistedRate = computeMetricTrend({
    currentValue: curHintRate,
    previousValue: prevHintRate,
    sampleSize: totalAttempts,
    higherIsBetter: false,
    metricName: "Hint Dependency Rate",
  });

  const failureRate = computeMetricTrend({
    currentValue: curFailRate,
    previousValue: prevFailRate,
    sampleSize: totalAttempts,
    higherIsBetter: false,
    metricName: "Failure Rate",
  });

  const timeoutRate = computeMetricTrend({
    currentValue: curTimeoutRate,
    previousValue: prevTimeoutRate,
    sampleSize: totalAttempts,
    higherIsBetter: false,
    metricName: "Timeout Rate",
  });

  const skipRate = computeMetricTrend({
    currentValue: curSkipRate,
    previousValue: prevSkipRate,
    sampleSize: totalAttempts,
    higherIsBetter: false,
    metricName: "Skip Rate",
  });

  const averageSolveTimeSeconds = computeTimeMetricTrend(
    curAvgTimeSec,
    prevAvgTimeSec,
    curSolveTimes.length,
    "Average Solve Time"
  );

  const medianSolveTimeSeconds = computeTimeMetricTrend(
    curMedianTimeSec,
    prevMedianTimeSec,
    curSolveTimes.length,
    "Median Solve Time"
  );

  const timeEfficiencyScore = computeMetricTrend({
    currentValue: curTimeEfficiencyScore,
    previousValue: prevTimeEfficiencyScore,
    sampleSize: totalSolved,
    higherIsBetter: true,
    metricName: "Time Efficiency Score",
  });

  const sessionCompletionRate = computeMetricTrend({
    currentValue: curSessionCompletionRate,
    previousValue: prevSessionCompletionRate,
    sampleSize: totalAttempts,
    higherIsBetter: true,
    metricName: "Session Completion Rate",
  });

  return {
    window,
    startDate: dataset.windowStartDate,
    endDate: dataset.windowEndDate,
    totalAttempts,
    totalSolved,
    independentSolves,
    hintAssistedSolves,
    failures,
    skips,
    timeouts,
    totalPracticeMinutes: dataset.totalPracticeMinutes,
    solveRate,
    independentSolveRate,
    hintAssistedRate,
    failureRate,
    timeoutRate,
    skipRate,
    averageSolveTimeSeconds,
    medianSolveTimeSeconds,
    timeEfficiencyScore,
    sessionCount,
    sessionCompletionRate,
    activeGoalAlignmentPct,
  };
}

function computeMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
