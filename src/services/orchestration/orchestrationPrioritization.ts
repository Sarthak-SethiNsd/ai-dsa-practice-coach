import { PreparationContext, PreparationActivity, ActivityPriority } from "./orchestrationTypes";

export interface ActivityPriorityCalculation {
  goalRelevance: number; // 1 - 10
  strategyPriority: number; // 1 - 10
  evidenceStrength: number; // 1 - 10
  urgency: number; // 1 - 10
  expectedImpact: number; // 1 - 10
  rawProduct: number;
  normalizedScore: number; // 0 - 100
  priorityClass: ActivityPriority;
}

export function calculateActivityPriority(
  activity: PreparationActivity,
  context: PreparationContext
): ActivityPriorityCalculation {
  const { activeGoal, strategyState, currentPerformanceState } = context;

  // 1. Goal Relevance (1 - 10)
  let goalRelevance = 6;
  if (activeGoal) {
    const isTopicMatch = activity.affectedSkills.some((s) =>
      activeGoal.priorityTopics.some((t) => t.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(t.toLowerCase()))
    ) || activity.affectedPatterns.some((p) =>
      activeGoal.priorityTopics.some((t) => t.toLowerCase() === p.toLowerCase() || p.toLowerCase().includes(t.toLowerCase()))
    );

    if (isTopicMatch) goalRelevance = 10;
    else if (activity.difficulty === activeGoal.targetDifficulty) goalRelevance = 8;
    else goalRelevance = 6;
  }

  // 2. Strategy Priority (1 - 10)
  let strategyPriority = 6;
  if (strategyState) {
    if (activity.activityType === "FOUNDATION_REPAIR" && strategyState.currentMode === "FOUNDATION_REPAIR") {
      strategyPriority = 10;
    } else if (activity.activityType === "RECOVERY_SESSION" && strategyState.currentMode === "RECOVERY") {
      strategyPriority = 10;
    } else if (activity.activityType === "MIXED_PRACTICE" && strategyState.currentMode === "STAGNATION_BREAK") {
      strategyPriority = 9;
    } else if (activity.activityType === "TIMED_PRACTICE" && strategyState.currentMode === "INTERVIEW_FOCUS") {
      strategyPriority = 9;
    } else if (activity.activityType === "REVISION" && strategyState.revisionPriority === "URGENT") {
      strategyPriority = 9;
    } else {
      strategyPriority = 7;
    }
  }

  // 3. Evidence Strength (1 - 10)
  let evidenceStrength = 7;
  if (currentPerformanceState) {
    const hasWeaknessEvidence = currentPerformanceState.persistentWeaknesses.some((w) =>
      activity.affectedSkills.some((s) => s.toLowerCase() === w.skillOrPattern.toLowerCase())
    );
    if (hasWeaknessEvidence) evidenceStrength = 9;
  }

  // 4. Urgency (1 - 10)
  let urgency = 6;
  if (activity.activityType === "RECOVERY_SESSION") urgency = 10;
  else if (activity.activityType === "FOUNDATION_REPAIR") urgency = 9;
  else if (activity.activityType === "REVISION" && context.revisionDueItems.length >= 5) urgency = 8;
  else if (activity.activityType === "MOCK_INTERVIEW") urgency = 7;
  else urgency = 5;

  // 5. Expected Impact (1 - 10)
  let expectedImpact = 7;
  if (activity.activityType === "FOUNDATION_REPAIR" || activity.activityType === "RECOVERY_SESSION") expectedImpact = 9;
  else if (activity.activityType === "PATTERN_PRACTICE" || activity.activityType === "TIMED_PRACTICE") expectedImpact = 8;
  else expectedImpact = 6;

  // Prerequisite penalty: If blocked in learning graph, reduce priority dramatically
  if (activity.isPrerequisiteBlocked) {
    goalRelevance = Math.max(1, Math.round(goalRelevance * 0.4));
    strategyPriority = Math.max(1, Math.round(strategyPriority * 0.4));
    expectedImpact = Math.max(1, Math.round(expectedImpact * 0.4));
  }

  const rawProduct = goalRelevance * strategyPriority * evidenceStrength * urgency * expectedImpact;
  // Max possible: 10 * 10 * 10 * 10 * 10 = 100,000 -> / 1,000 = 100
  const normalizedScore = Math.min(100, Math.max(1, Math.round(rawProduct / 1000)));

  let priorityClass: ActivityPriority = "LOW";
  if (normalizedScore >= 75) priorityClass = "CRITICAL";
  else if (normalizedScore >= 50) priorityClass = "HIGH";
  else if (normalizedScore >= 25) priorityClass = "MEDIUM";
  else priorityClass = "LOW";

  return {
    goalRelevance,
    strategyPriority,
    evidenceStrength,
    urgency,
    expectedImpact,
    rawProduct,
    normalizedScore,
    priorityClass,
  };
}
