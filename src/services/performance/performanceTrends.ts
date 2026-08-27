import {
  PerformanceMetricTrend,
  TrendConfidence,
  TrendDirection,
} from "./performanceTypes";

export interface ComputeTrendOptions {
  currentValue: number;
  previousValue: number | null;
  sampleSize: number;
  higherIsBetter?: boolean;
  deltaThreshold?: number; // threshold to distinguish STABLE from IMPROVING/DECLINING
  metricName: string;
  unit?: string;
  isPercentage?: boolean;
}

export function computeMetricTrend({
  currentValue,
  previousValue,
  sampleSize,
  higherIsBetter = true,
  deltaThreshold = 3,
  metricName,
  unit = "%",
  isPercentage = true,
}: ComputeTrendOptions): PerformanceMetricTrend {
  // Insufficient data guard: strictly require at least 3 attempts
  if (sampleSize < 3) {
    return {
      currentValue,
      previousValue,
      delta: 0,
      percentageChange: null,
      direction: "INSUFFICIENT_DATA",
      confidence: sampleSize > 0 ? "LOW" : "NONE",
      sampleSize,
      explanation: `Insufficient data (${sampleSize} attempt${sampleSize === 1 ? "" : "s"}) to establish a reliable ${metricName.toLowerCase()} trend.`,
    };
  }

  // If no previous period baseline exists
  if (previousValue === null || previousValue === undefined) {
    return {
      currentValue,
      previousValue: null,
      delta: 0,
      percentageChange: null,
      direction: "STABLE",
      confidence: sampleSize >= 8 ? "HIGH" : sampleSize >= 4 ? "MEDIUM" : "LOW",
      sampleSize,
      explanation: `Current baseline: ${currentValue}${unit} based on ${sampleSize} recorded attempts.`,
    };
  }

  const delta = Math.round((currentValue - previousValue) * 10) / 10;
  const percentageChange = previousValue !== 0
    ? Math.round(((currentValue - previousValue) / previousValue) * 100)
    : null;

  // Determine direction
  let direction: TrendDirection = "STABLE";
  const absDelta = Math.abs(delta);

  if (absDelta >= deltaThreshold) {
    if (higherIsBetter) {
      direction = delta > 0 ? "IMPROVING" : "DECLINING";
    } else {
      direction = delta < 0 ? "IMPROVING" : "DECLINING";
    }
  } else {
    direction = "STABLE";
  }

  // Confidence based on sample size
  let confidence: TrendConfidence = "LOW";
  if (sampleSize >= 15) confidence = "HIGH";
  else if (sampleSize >= 6) confidence = "MEDIUM";
  else confidence = "LOW";

  // Build explanation
  const deltaSign = delta > 0 ? "+" : "";
  const directionWord =
    direction === "IMPROVING" ? "improved" : direction === "DECLINING" ? "declined" : "remained stable";

  let explanation = "";
  if (direction === "STABLE") {
    explanation = `${metricName} remained stable at ${currentValue}${unit} (${deltaSign}${delta}${unit} vs prior period, ${sampleSize} attempts).`;
  } else {
    explanation = `${metricName} ${directionWord} by ${Math.abs(delta)}${unit} (from ${previousValue}${unit} to ${currentValue}${unit}) across ${sampleSize} attempts.`;
  }

  return {
    currentValue,
    previousValue,
    delta,
    percentageChange,
    direction,
    confidence,
    sampleSize,
    explanation,
  };
}

// ─── Time Trend Calculator ───────────────────────────────────────────────────

export function computeTimeMetricTrend(
  currentSeconds: number,
  previousSeconds: number | null,
  sampleSize: number,
  metricName: string
): PerformanceMetricTrend {
  if (sampleSize < 3) {
    return {
      currentValue: currentSeconds,
      previousValue: previousSeconds,
      delta: 0,
      percentageChange: null,
      direction: "INSUFFICIENT_DATA",
      confidence: sampleSize > 0 ? "LOW" : "NONE",
      sampleSize,
      explanation: `Insufficient timing history (${sampleSize} attempt${sampleSize === 1 ? "" : "s"}) for ${metricName.toLowerCase()}.`,
    };
  }

  const currentMin = Math.round(currentSeconds / 60);
  const prevMin = previousSeconds ? Math.round(previousSeconds / 60) : null;

  return computeMetricTrend({
    currentValue: currentMin,
    previousValue: prevMin,
    sampleSize,
    higherIsBetter: false, // lower solve time is better
    deltaThreshold: 1.5, // 1.5 min change
    metricName,
    unit: " min",
    isPercentage: false,
  });
}
