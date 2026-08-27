import {
  FullPerformanceIntelligence,
  PerformanceWindow,
  PERFORMANCE_WINDOW_CONFIGS,
  SubsystemFeedbackSignals,
} from "./performanceTypes";
import { aggregateLongitudinalData } from "./performanceAggregation";
import { computePerformanceMetrics } from "./performanceMetrics";
import { analyzeSkillTrends } from "./performanceSkillAnalysis";
import { analyzePatternCoverage } from "./performancePatternAnalysis";
import { analyzeDifficultyProgression } from "./performanceDifficultyAnalysis";
import { analyzeTimeEfficiency } from "./performanceTimeAnalysis";
import { detectPersistentWeaknesses, detectImprovementSignals } from "./performanceWeaknessDetection";
import {
  calculateLearningVelocity,
  generateStrategicRecommendations,
  generateSubsystemFeedbackSignals,
  generatePerformanceTimeline,
} from "./performanceRecommendations";
import {
  getCachedPerformanceIntelligence,
  setCachedPerformanceIntelligence,
} from "./performanceStorage";
import { getActiveGoal } from "@/services/preparation/preparationStorage";
import { getStoredSkillNodes } from "@/services/learningGraph/learningGraphStorage";

// ─── Main Performance Intelligence Engine ─────────────────────────────────────

export async function compilePerformanceIntelligence(
  window: PerformanceWindow = "30d",
  forceRefresh = false
): Promise<FullPerformanceIntelligence> {
  if (!forceRefresh) {
    const cached = getCachedPerformanceIntelligence(window);
    if (cached) return cached;
  }

  const windowConfig = PERFORMANCE_WINDOW_CONFIGS[window] ?? PERFORMANCE_WINDOW_CONFIGS["30d"];

  // 1. Gather all normalized longitudinal data
  const dataset = await aggregateLongitudinalData(window);

  // 2. Read active preparation goal
  const activeGoal = getActiveGoal();
  const activeGoalTopics = activeGoal?.priorityTopics ?? [];

  // 3. Compute core metrics & rate trends
  const metrics = computePerformanceMetrics(dataset, window, activeGoalTopics);

  // 4. Compute Skill trends & Stagnation
  const canonicalNodes = getStoredSkillNodes();
  const skillTrends = analyzeSkillTrends(dataset, canonicalNodes);

  // 5. Compute Pattern Coverage & Overexposure
  const patternTrends = analyzePatternCoverage(dataset, activeGoalTopics);

  // 6. Compute Difficulty Progression & Transition Gaps
  const difficultyTrend = analyzeDifficultyProgression(dataset);

  // 7. Compute Time Efficiency & "Can solve vs Solves efficiently"
  const timeTrend = analyzeTimeEfficiency(dataset);

  // 8. Detect Persistent Weaknesses & Improvement Signals
  const persistentWeaknesses = detectPersistentWeaknesses(dataset, skillTrends);
  const improvementSignals = detectImprovementSignals(dataset, skillTrends);

  // 9. Compute Learning Velocity
  const learningVelocity = calculateLearningVelocity(metrics, skillTrends, difficultyTrend, timeTrend);

  // 10. Generate Goal-Aware Strategic Recommendations
  const strategicRecommendations = generateStrategicRecommendations(
    metrics,
    skillTrends,
    patternTrends,
    difficultyTrend,
    persistentWeaknesses,
    activeGoal
  );

  // 11. Generate Subsystem Feedback Signals
  const feedbackSignals = generateSubsystemFeedbackSignals(
    skillTrends,
    patternTrends,
    difficultyTrend,
    persistentWeaknesses,
    activeGoal
  );

  // 12. Generate Performance Timeline Events
  const timeline = generatePerformanceTimeline(dataset, skillTrends, persistentWeaknesses);

  // 13. Formulate Executive Diagnosis Summary
  const topImprovingSkill = skillTrends.find((s) => s.classification === "IMPROVING" && s.totalAttempts >= 3)?.skillName ??
    skillTrends.find((s) => s.classification === "STRONG")?.skillName ?? null;

  const topWeakness = persistentWeaknesses[0]?.skillOrPattern ?? null;

  let headline = "";
  let subheadline = "";

  if (metrics.totalAttempts < 3) {
    headline = "Establishing Performance Baseline";
    subheadline = "Complete more practice sessions and problems to unlock deep longitudinal trends and velocity insights.";
  } else if (metrics.independentSolveRate.direction === "IMPROVING" && difficultyTrend.transitionGap.hasMediumToHardGap) {
    headline = "Independent Mastery Growing, Medium → Hard Gap Detected";
    subheadline = `Your independent solve rate improved to ${metrics.independentSolveRate.currentValue}%, but the transition to Hard tier requires dedicated bridge practice.`;
  } else if (metrics.independentSolveRate.direction === "IMPROVING") {
    headline = "Positive Longitudinal Learning Momentum";
    subheadline = `Independent solve rate has risen to ${metrics.independentSolveRate.currentValue}% with healthy progress across core skills.`;
  } else if (persistentWeaknesses.length >= 2) {
    headline = "Multiple Persistent Weaknesses Need Attention";
    subheadline = `Recurring bottlenecks detected in ${persistentWeaknesses.slice(0, 2).map((w) => w.skillOrPattern).join(" and ")}. Targeted repair is recommended.`;
  } else if (difficultyTrend.pacing === "TOO_CONSERVATIVE") {
    headline = "Comfortably Mastering Current Tier";
    subheadline = `High independent accuracy across Easy and Medium problems indicates you are ready for greater challenge.`;
  } else {
    headline = "Steady Practice Cadence & Skill Maintenance";
    subheadline = `Overall solve rate is ${metrics.solveRate.currentValue}% across ${metrics.totalAttempts} attempts with balanced pattern exposure.`;
  }

  const result: FullPerformanceIntelligence = {
    window,
    windowConfig,
    generatedAt: new Date().toISOString(),
    metrics,
    skillTrends,
    patternTrends,
    difficultyTrend,
    timeTrend,
    persistentWeaknesses,
    improvementSignals,
    learningVelocity,
    strategicRecommendations,
    timeline,
    feedbackSignals,
    diagnosisSummary: {
      headline,
      subheadline,
      strongestImprovingSkill: topImprovingSkill,
      mostPersistentWeakness: topWeakness,
      topStrategicRecommendation: strategicRecommendations[0]?.suggestedIntervention ?? "Continue regular practice cadence.",
    },
  };

  setCachedPerformanceIntelligence(window, result);
  return result;
}

// ─── Query Feedback Signals for Subsystems ────────────────────────────────────

export async function getPerformanceSignalsForSubsystems(): Promise<SubsystemFeedbackSignals> {
  const intel = await compilePerformanceIntelligence("30d");
  return intel.feedbackSignals;
}
