import {
  FullPerformanceIntelligence,
  PerformanceMetricsSnapshot,
  SkillPerformanceTrend,
  PatternPerformanceTrend,
  DifficultyProgressionTrend,
  TimeEfficiencyAnalysis,
  PersistentWeakness,
} from "@/services/performance/performanceTypes";
import { PreparationGoal } from "@/services/preparation/preparationTypes";
import { EvidenceFragment } from "./interventionTypes";

export interface ExtractedEvidencePackage {
  hasSufficientData: boolean;
  totalAttempts: number;
  difficultyEvidence: EvidenceFragment[];
  skillWeaknessEvidence: Array<{ skill: string; evidence: EvidenceFragment[] }>;
  stagnationEvidence: Array<{ skill: string; reason: string; evidence: EvidenceFragment[] }>;
  patternEvidence: Array<{ pattern: string; status: string; evidence: EvidenceFragment[] }>;
  timeEfficiencyEvidence: EvidenceFragment[];
  hintDependencyEvidence: EvidenceFragment[];
  fatigueEvidence: EvidenceFragment[];
  goalAlignmentEvidence: EvidenceFragment[];
}

export function extractEvidenceFromIntelligence(
  intelligence: FullPerformanceIntelligence,
  activeGoal: PreparationGoal | null
): ExtractedEvidencePackage {
  const { metrics, skillTrends, patternTrends, difficultyTrend, timeTrend, persistentWeaknesses } = intelligence;
  const totalAttempts = metrics.totalAttempts;
  const hasSufficientData = totalAttempts >= 3;

  // 1. Difficulty Evidence
  const difficultyEvidence: EvidenceFragment[] = [];
  const hardStats = difficultyTrend.byDifficulty.Hard;
  const medStats = difficultyTrend.byDifficulty.Medium;
  const easyStats = difficultyTrend.byDifficulty.Easy;

  if (hardStats.attempts > 0) {
    difficultyEvidence.push({
      source: "DifficultyProgression",
      metric: "Hard independent solve rate",
      value: `${hardStats.independentSolveRate}%`,
      sampleSize: hardStats.attempts,
      confidence: hardStats.attempts >= 3 ? "HIGH" : "MEDIUM",
      explanation: `Hard difficulty attempted ${hardStats.attempts} times with ${hardStats.independentSolveRate}% independent solve rate.`,
    });
  }

  if (medStats.attempts > 0) {
    difficultyEvidence.push({
      source: "DifficultyProgression",
      metric: "Medium independent solve rate",
      value: `${medStats.independentSolveRate}%`,
      sampleSize: medStats.attempts,
      confidence: medStats.attempts >= 3 ? "HIGH" : "MEDIUM",
      explanation: `Medium difficulty attempted ${medStats.attempts} times with ${medStats.independentSolveRate}% independent solve rate.`,
    });
  }

  if (difficultyTrend.pacing !== "INSUFFICIENT_DATA") {
    difficultyEvidence.push({
      source: "DifficultyProgression",
      metric: "Pacing Diagnosis",
      value: difficultyTrend.pacing,
      sampleSize: totalAttempts,
      confidence: "HIGH",
      explanation: `${difficultyTrend.pacingDiagnosis} (${difficultyTrend.recommendedDifficultyAction})`,
    });
  }

  if (difficultyTrend.transitionGap.hasMediumToHardGap) {
    difficultyEvidence.push({
      source: "DifficultyProgression",
      metric: "Transition Gap (Medium -> Hard)",
      value: "GAP_DETECTED",
      sampleSize: hardStats.attempts + medStats.attempts,
      confidence: "HIGH",
      explanation: difficultyTrend.transitionGap.gapDescription,
    });
  }

  // 2. Skill Weakness Evidence
  const skillWeaknessEvidence: Array<{ skill: string; evidence: EvidenceFragment[] }> = [];
  for (const w of persistentWeaknesses) {
    const ev: EvidenceFragment[] = [
      {
        source: "PersistentWeaknesses",
        metric: `${w.skillOrPattern} Failures`,
        value: `${w.failCount} fails, ${w.hintCount} hints`,
        sampleSize: w.attemptCount,
        confidence: w.attemptCount >= 3 ? "HIGH" : "MEDIUM",
        explanation: w.evidenceText,
      },
    ];
    skillWeaknessEvidence.push({ skill: w.skillOrPattern, evidence: ev });
  }

  // 3. Stagnation Evidence
  const stagnationEvidence: Array<{ skill: string; reason: string; evidence: EvidenceFragment[] }> = [];
  for (const st of skillTrends.filter((s) => s.isStagnant)) {
    stagnationEvidence.push({
      skill: st.skillName,
      reason: st.stagnationReason || "Flat solve rate despite high practice volume",
      evidence: [
        {
          source: "SkillTrends",
          metric: `${st.skillName} Stagnation`,
          value: `${st.independentSolveRate}% over ${st.totalAttempts} attempts`,
          sampleSize: st.totalAttempts,
          confidence: "HIGH",
          explanation: st.evidenceSummary,
        },
      ],
    });
  }

  // 4. Pattern Evidence
  const patternEvidence: Array<{ pattern: string; status: string; evidence: EvidenceFragment[] }> = [];
  for (const pt of patternTrends.filter((p) => p.exposureStatus !== "OPTIMAL")) {
    patternEvidence.push({
      pattern: pt.patternName,
      status: pt.exposureStatus,
      evidence: [
        {
          source: "PatternCoverage",
          metric: `${pt.patternName} Exposure`,
          value: `${pt.exposurePercentage}% (${pt.exposureCount} attempts)`,
          sampleSize: pt.exposureCount,
          confidence: pt.exposureCount >= 3 ? "HIGH" : "MEDIUM",
          explanation: `Pattern status is ${pt.exposureStatus}: ${pt.actionRecommendation}`,
        },
      ],
    });
  }

  // 5. Time Efficiency Evidence
  const timeEfficiencyEvidence: EvidenceFragment[] = [
    {
      source: "TimeEfficiency",
      metric: "Time Efficiency Score",
      value: metrics.timeEfficiencyScore.currentValue,
      sampleSize: metrics.timeEfficiencyScore.sampleSize,
      confidence: metrics.timeEfficiencyScore.confidence,
      explanation: timeTrend.diagnosis,
    },
    {
      source: "TimeEfficiency",
      metric: "Can Solve Efficiently Rate",
      value: `${timeTrend.canSolveEfficientlyRate}% (Gap: ${timeTrend.efficiencyGapPct}%)`,
      sampleSize: totalAttempts,
      confidence: hasSufficientData ? "HIGH" : "LOW",
      explanation: `Solved rate is ${timeTrend.canSolveRate}%, but only ${timeTrend.canSolveEfficientlyRate}% within target time.`,
    },
  ];

  // 6. Hint Dependency Evidence
  const hintDependencyEvidence: EvidenceFragment[] = [
    {
      source: "MetricsSnapshot",
      metric: "Hint-Assisted Rate",
      value: `${metrics.hintAssistedRate.currentValue}%`,
      sampleSize: metrics.hintAssistedRate.sampleSize,
      confidence: metrics.hintAssistedRate.confidence,
      explanation: `Hint dependency is at ${metrics.hintAssistedRate.currentValue}% with ${metrics.hintAssistedSolves} hint-assisted solves.`,
    },
    {
      source: "MetricsSnapshot",
      metric: "Independent vs Hint Rate Gap",
      value: `Indep: ${metrics.independentSolveRate.currentValue}% vs Hint: ${metrics.hintAssistedRate.currentValue}%`,
      sampleSize: totalAttempts,
      confidence: metrics.independentSolveRate.confidence,
      explanation: metrics.independentSolveRate.explanation,
    },
  ];

  // 7. Preparation Fatigue Evidence
  const fatigueEvidence: EvidenceFragment[] = [];
  const completionRateVal = metrics.sessionCompletionRate.currentValue;
  const failureRateVal = metrics.failureRate.currentValue;
  const skipRateVal = metrics.skipRate.currentValue;

  if (metrics.sessionCompletionRate.direction === "DECLINING" || completionRateVal < 60) {
    fatigueEvidence.push({
      source: "MetricsSnapshot",
      metric: "Session Completion Rate",
      value: `${completionRateVal}% (${metrics.sessionCompletionRate.direction})`,
      sampleSize: metrics.sessionCompletionRate.sampleSize,
      confidence: metrics.sessionCompletionRate.confidence,
      explanation: `Session completion has dropped to ${completionRateVal}% with notable dropouts/interruptions.`,
    });
  }

  if (failureRateVal >= 45 || skipRateVal >= 25) {
    fatigueEvidence.push({
      source: "MetricsSnapshot",
      metric: "Failure / Skip Ratio",
      value: `Fails: ${failureRateVal}%, Skips: ${skipRateVal}%`,
      sampleSize: totalAttempts,
      confidence: "HIGH",
      explanation: `Elevated failure (${failureRateVal}%) and skip (${skipRateVal}%) rates suggest practice overload or fatigue.`,
    });
  }

  // 8. Goal Alignment Evidence
  const goalAlignmentEvidence: EvidenceFragment[] = [
    {
      source: "PreparationGoal",
      metric: "Goal Alignment",
      value: `${metrics.activeGoalAlignmentPct}%`,
      sampleSize: totalAttempts,
      confidence: activeGoal ? "HIGH" : "LOW",
      explanation: activeGoal
        ? `Active goal "${activeGoal.name}" (${activeGoal.type}) with ${metrics.activeGoalAlignmentPct}% practice alignment.`
        : "No active preparation goal set.",
    },
  ];

  return {
    hasSufficientData,
    totalAttempts,
    difficultyEvidence,
    skillWeaknessEvidence,
    stagnationEvidence,
    patternEvidence,
    timeEfficiencyEvidence,
    hintDependencyEvidence,
    fatigueEvidence,
    goalAlignmentEvidence,
  };
}
