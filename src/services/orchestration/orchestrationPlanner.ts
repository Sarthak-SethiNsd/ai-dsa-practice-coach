import {
  PreparationContext,
  PreparationPlan,
  PreparationActivity,
  NextBestAction,
  PlanConfidenceLevel,
} from "./orchestrationTypes";
import { generateCandidateActivities } from "./orchestrationCandidates";
import { resolveCandidatePrecedence } from "./orchestrationConflictResolver";
import { evaluateActivityConstraints } from "./orchestrationConstraints";

export function generatePreparationPlan(
  context: PreparationContext,
  availableMinutes = 45,
  isRegenerated = false
): PreparationPlan {
  const {
    activeGoal,
    strategyState,
    currentPerformanceState,
    learningGraphNodes,
  } = context;

  const currentMode = strategyState?.currentMode ?? "BALANCED";

  // 1. Generate candidate activities
  const candidates = generateCandidateActivities(context);

  // 2. Resolve precedence & score
  const prioritized = resolveCandidatePrecedence(candidates, context);

  // 3. Apply constraints against available time budget
  const { acceptedActivities, deferredActivities, appliedConstraints } =
    evaluateActivityConstraints(prioritized, context, availableMinutes);

  // Fallback if no activity passed constraints
  let finalActivities = acceptedActivities;
  if (finalActivities.length === 0) {
    const fallbackActivity: PreparationActivity = {
      activityId: `act_fallback_${Date.now()}`,
      activityType: "PROBLEM_PRACTICE",
      title: "Focused Problem Solving Session",
      estimatedMinutes: Math.min(availableMinutes, 30),
      priority: "MEDIUM",
      priorityScore: 50,
      goalRelevance: 7,
      strategyAlignment: 7,
      affectedSkills: activeGoal?.priorityTopics || ["Arrays"],
      affectedPatterns: ["Two Pointers"],
      difficulty: "Medium",
      sourceSubsystem: "practice",
      reason: "Calibrated default practice to maintain steady momentum.",
      prerequisites: [],
      isPrerequisiteBlocked: false,
      blockingPrerequisites: [],
      successCriteria: {
        targetMetric: "Independent Solve",
        threshold: "1 Problem",
        description: "Solve 1 problem unassisted within standard time budget.",
      },
      recommendedProblemsCount: 1,
    };
    finalActivities = [fallbackActivity];
  }

  // 4. Determine Next Best Action
  const primaryActivity = finalActivities[0];
  let handoffTarget: NextBestAction["handoffTarget"] = "practice";
  if (primaryActivity.activityType === "REVISION") handoffTarget = "revision";
  else if (primaryActivity.activityType === "MOCK_INTERVIEW") handoffTarget = "interview";
  else if (primaryActivity.activityType === "CONTEST" || primaryActivity.activityType === "CONTEST_PRACTICE") handoffTarget = "contest";
  else if (primaryActivity.activityType === "LEARNING_SESSION") handoffTarget = "learning_graph";

  const nextBestAction: NextBestAction = {
    actionTitle: primaryActivity.title,
    activityType: primaryActivity.activityType,
    whyDescription: primaryActivity.reason,
    estimatedMinutes: primaryActivity.estimatedMinutes,
    difficulty: primaryActivity.difficulty,
    focusSkillOrPattern: primaryActivity.affectedSkills[0] || primaryActivity.affectedPatterns[0] || "General DSA",
    successCriteria: primaryActivity.successCriteria.description,
    suggestedMode: strategyState?.preferredPracticeModes[0] || "REINFORCEMENT",
    activityRef: primaryActivity,
    handoffTarget,
  };

  // 5. Evaluate Plan Confidence
  const missingEvidence: string[] = [];
  let confidenceScore = 80;
  let confidenceLevel: PlanConfidenceLevel = "HIGH";

  if (!currentPerformanceState || currentPerformanceState.metrics.totalAttempts < 3) {
    missingEvidence.push("Insufficient historical practice samples (<3 attempts)");
    confidenceScore -= 40;
  }
  if (!activeGoal) {
    missingEvidence.push("No active preparation goal configured");
    confidenceScore -= 15;
  }
  if (learningGraphNodes.length === 0) {
    missingEvidence.push("Learning Graph node states not initialized");
    confidenceScore -= 10;
  }

  if (confidenceScore <= 45) {
    confidenceLevel = currentPerformanceState?.metrics.totalAttempts === 0 ? "INSUFFICIENT_DATA" : "LOW";
  } else if (confidenceScore <= 70) {
    confidenceLevel = "MODERATE";
  } else {
    confidenceLevel = "HIGH";
  }

  const confidenceRationale =
    confidenceLevel === "HIGH"
      ? "Plan is backed by strong longitudinal performance data, clear goal alignment, and active strategy state."
      : confidenceLevel === "MODERATE"
      ? `Plan confidence is moderate. Note: ${missingEvidence.join("; ")}.`
      : confidenceLevel === "LOW"
      ? `Plan confidence is low due to: ${missingEvidence.join("; ")}.`
      : "Insufficient data to establish high certainty. Safest baseline practice recommended.";

  // 6. Calculate Totals and Foci
  const totalPlannedMinutes = finalActivities.reduce((acc, a) => acc + a.estimatedMinutes, 0);
  const primaryFocus = primaryActivity.title;
  const secondaryFocus = finalActivities[1]?.title || "Spaced Review & Reflection";

  const expectedOutcomes = [
    `Complete ${finalActivities.length} structured activity block(s) within ${totalPlannedMinutes} minutes.`,
    `Reinforce ${primaryActivity.affectedSkills.join(", ") || "core patterns"} under ${currentMode} strategy.`,
    `Advance active preparation goal "${activeGoal?.name || "General Improvement"}".`,
  ];

  return {
    planId: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    generatedAt: new Date().toISOString(),
    goal: activeGoal,
    strategyMode: currentMode,
    availableMinutes,
    totalPlannedMinutes,
    activities: finalActivities,
    nextBestAction,
    primaryFocus,
    secondaryFocus,
    protectedSkills: strategyState?.protectedSkills || [],
    deferredActivities,
    constraintsApplied: appliedConstraints,
    expectedOutcomes,
    planConfidence: {
      level: confidenceLevel,
      score: Math.max(10, confidenceScore),
      rationale: confidenceRationale,
      missingEvidence,
    },
    isRegenerated,
  };
}
