import { FullPerformanceIntelligence } from "@/services/performance/performanceTypes";
import {
  InterventionPlan,
  InterventionOutcome,
  StrategyHistoryEntry,
  StrategyMode,
  InterventionStatus,
} from "./interventionTypes";

export function evaluateInterventionOutcome(
  plan: InterventionPlan,
  newIntelligence: FullPerformanceIntelligence
): InterventionOutcome {
  const targetSkill = plan.affectedSkills[0] || plan.affectedPatterns[0] || "General Performance";
  const matchingTrend = newIntelligence.skillTrends.find((s) => s.skillName.toLowerCase() === targetSkill.toLowerCase());

  let resultStatus: InterventionOutcome["resultStatus"] = "IN_PROGRESS";
  let evidenceAfter = "Evaluation pending additional session completions.";
  let targetMetricImprovement = "No change detected yet.";
  let feedbackToPerformance = "Continue tracking current intervention metrics.";

  if (matchingTrend) {
    if (matchingTrend.classification === "IMPROVING" || matchingTrend.independentSolveRate >= 75) {
      resultStatus = "COMPLETED";
      evidenceAfter = `Independent solve rate reached ${matchingTrend.independentSolveRate}% with ${matchingTrend.solvedCount} solves.`;
      targetMetricImprovement = `+${matchingTrend.masteryDelta}% mastery delta; solve rate: ${matchingTrend.independentSolveRate}%`;
      feedbackToPerformance = `Intervention ${plan.title} succeeded. Target skill ${targetSkill} resolved bottleneck status.`;
    } else if (matchingTrend.classification === "DECLINING" && matchingTrend.totalAttempts >= 3) {
      resultStatus = "FAILED";
      evidenceAfter = `Independent solve rate dropped to ${matchingTrend.independentSolveRate}% across ${matchingTrend.totalAttempts} attempts.`;
      targetMetricImprovement = `Negative progression: ${matchingTrend.independentSolveRate}% independent solves.`;
      feedbackToPerformance = `Intervention ${plan.title} failed to improve ${targetSkill}. Rollback or prerequisite bridge required.`;
    }
  } else if (plan.interventionType === "DIFFICULTY_DECREASE") {
    if (newIntelligence.metrics.independentSolveRate.currentValue >= 75) {
      resultStatus = "COMPLETED";
      evidenceAfter = `Overall solve rate stabilized at ${newIntelligence.metrics.independentSolveRate.currentValue}%.`;
      targetMetricImprovement = `Independent solve rate increased to ${newIntelligence.metrics.independentSolveRate.currentValue}%.`;
      feedbackToPerformance = "Difficulty decrease restored solving stability.";
    }
  }

  return {
    planId: plan.id,
    interventionType: plan.interventionType,
    targetSkillOrPattern: targetSkill,
    evaluationDate: new Date().toISOString(),
    resultStatus,
    evidenceBefore: plan.evidenceChain.evidence,
    evidenceAfter,
    targetMetricImprovement,
    feedbackToPerformance,
  };
}

export function recordStrategyTransition(
  previousMode: StrategyMode,
  newMode: StrategyMode,
  reason: string,
  evidence: string,
  triggeredInterventions: string[],
  activeGoalName: string = "Default"
): StrategyHistoryEntry {
  const now = new Date();
  return {
    id: `hist_trans_${now.getTime()}`,
    timestamp: now.toISOString(),
    date: now.toISOString().split("T")[0],
    previousMode,
    newMode,
    reason,
    evidence,
    triggeredInterventions,
    activeGoal: activeGoalName,
  };
}
