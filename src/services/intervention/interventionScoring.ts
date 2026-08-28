import { PreparationGoal } from "@/services/preparation/preparationTypes";
import {
  InterventionDiagnosis,
  InterventionPriority,
  PriorityScoreBreakdown,
} from "./interventionTypes";
import { getGoalWeightMultiplier } from "./interventionRules";

export function scoreInterventionDiagnosis(
  diagnosis: InterventionDiagnosis,
  activeGoal: PreparationGoal | null
): PriorityScoreBreakdown {
  // 1. Impact (1 - 10)
  let impact = 5;
  if (diagnosis.severity === "CRITICAL") impact = 10;
  else if (diagnosis.severity === "HIGH") impact = 8;
  else if (diagnosis.severity === "MEDIUM") impact = 5;
  else impact = 3;

  // 2. Evidence Strength (1 - 10)
  let evidenceStrength = 5;
  if (diagnosis.confidence === "HIGH") evidenceStrength = 9;
  else if (diagnosis.confidence === "MEDIUM") evidenceStrength = 6;
  else evidenceStrength = 3;

  const totalSample = diagnosis.evidence.reduce((acc, e) => acc + (e.sampleSize || 0), 0);
  if (totalSample >= 6) evidenceStrength = Math.min(10, evidenceStrength + 1);

  // 3. Goal Relevance (1 - 10)
  let goalRelevance = 8;
  if (activeGoal) {
    const isTopicMatch = diagnosis.affectedSkills.some((s) =>
      activeGoal.priorityTopics.some((t) => t.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(t.toLowerCase()))
    ) || diagnosis.affectedPatterns.some((p) =>
      activeGoal.priorityTopics.some((t) => t.toLowerCase() === p.toLowerCase() || p.toLowerCase().includes(t.toLowerCase()))
    );

    if (isTopicMatch) {
      goalRelevance = 9;
    } else if (activeGoal.targetDifficulty && diagnosis.affectedDifficulty === activeGoal.targetDifficulty) {
      goalRelevance = 8;
    } else {
      goalRelevance = 6;
    }

    const multiplier = getGoalWeightMultiplier(diagnosis.recommendedIntervention, activeGoal.type);
    goalRelevance = Math.min(10, Math.round(goalRelevance * multiplier));
  }

  // 4. Urgency (1 - 10)
  let urgency = 5;
  if (diagnosis.category === "PREPARATION_FATIGUE") urgency = 10;
  else if (diagnosis.category === "PREREQUISITE_BOTTLENECK" || diagnosis.category === "PERSISTENT_WEAKNESS") urgency = 8;
  else if (diagnosis.category === "DIFFICULTY_TOO_HIGH" || diagnosis.category === "SKILL_STAGNATION") urgency = 7;
  else if (diagnosis.category === "PATTERN_OVEREXPOSURE" || diagnosis.category === "TIME_INEFFICIENCY") urgency = 6;
  else urgency = 4;

  // Raw Product (1 to 10,000)
  const rawScore = impact * evidenceStrength * goalRelevance * urgency;

  // Normalized Score (0 to 100)
  // Max possible is 10 * 10 * 10 * 10 = 10,000 -> / 100 = 100
  const normalizedScore = Math.min(100, Math.max(1, Math.round(rawScore / 100)));

  // Priority Classification
  let priority: InterventionPriority = "LOW";
  if (normalizedScore >= 75 || diagnosis.severity === "CRITICAL") priority = "CRITICAL";
  else if (normalizedScore >= 50) priority = "HIGH";
  else if (normalizedScore >= 25) priority = "MEDIUM";
  else priority = "LOW";

  return {
    impact,
    evidenceStrength,
    goalRelevance,
    urgency,
    rawScore,
    normalizedScore,
    priority,
  };
}
