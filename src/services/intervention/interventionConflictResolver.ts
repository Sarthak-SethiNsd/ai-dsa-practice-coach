import { PreparationGoal } from "@/services/preparation/preparationTypes";
import { InterventionPlan } from "./interventionTypes";

export interface ConflictResolutionResult {
  resolvedPlans: InterventionPlan[];
  suppressedPlans: Array<{ plan: InterventionPlan; reason: string }>;
}

export function resolveInterventionConflicts(
  plans: InterventionPlan[],
  activeGoal: PreparationGoal | null
): ConflictResolutionResult {
  const resolvedPlans: InterventionPlan[] = [];
  const suppressedPlans: Array<{ plan: InterventionPlan; reason: string }> = [];

  // Group 1: Difficulty Contradictions (INCREASE vs DECREASE)
  const diffIncrease = plans.find((p) => p.interventionType === "DIFFICULTY_INCREASE");
  const diffDecrease = plans.find((p) => p.interventionType === "DIFFICULTY_DECREASE");

  if (diffIncrease && diffDecrease) {
    // Resolve: Compare priority score, confidence, and sample size
    const incScore = diffIncrease.priorityScore;
    const decScore = diffDecrease.priorityScore;

    if (decScore >= incScore) {
      // Decrease wins: Safety first
      diffDecrease.conflictResolutionNote = `Conflict Resolved: DIFFICULTY_DECREASE prioritized over DIFFICULTY_INCREASE due to higher failure severity and risk mitigation (${decScore} vs ${incScore}).`;
      suppressedPlans.push({
        plan: diffIncrease,
        reason: `Suppressed by higher-priority DIFFICULTY_DECREASE intervention (${decScore} vs ${incScore}).`,
      });
    } else {
      diffIncrease.conflictResolutionNote = `Conflict Resolved: DIFFICULTY_INCREASE prioritized over DIFFICULTY_DECREASE due to strong verified mastery baseline (${incScore} vs ${decScore}).`;
      suppressedPlans.push({
        plan: diffDecrease,
        reason: `Suppressed by higher-priority DIFFICULTY_INCREASE intervention (${incScore} vs ${decScore}).`,
      });
    }
  }

  // Group 2: Hint Policy Contradictions (HINT_REDUCTION vs HINT_SUPPORTED_LEARNING)
  const hintReduction = plans.find((p) => p.interventionType === "HINT_REDUCTION");
  const hintSupported = plans.find((p) => p.interventionType === "HINT_SUPPORTED_LEARNING");

  if (hintReduction && hintSupported) {
    if (hintReduction.priorityScore >= hintSupported.priorityScore) {
      hintReduction.conflictResolutionNote = "Conflict Resolved: HINT_REDUCTION prioritized because hint reliance is creating an active performance crutch.";
      suppressedPlans.push({
        plan: hintSupported,
        reason: "Suppressed by active HINT_REDUCTION intervention.",
      });
    } else {
      hintSupported.conflictResolutionNote = "Conflict Resolved: HINT_SUPPORTED_LEARNING maintained because hints are aiding exploration without hindering independent solves.";
      suppressedPlans.push({
        plan: hintReduction,
        reason: "Suppressed by HINT_SUPPORTED_LEARNING.",
      });
    }
  }

  // Group 3: Mode Contradictions (PRACTICE_INTENSIFICATION vs PRACTICE_RECOVERY)
  const recovery = plans.find((p) => p.interventionType === "PRACTICE_RECOVERY");
  const intensification = plans.find((p) => p.interventionType === "PRACTICE_INTENSIFICATION");

  if (recovery && intensification) {
    // Recovery ALWAYS takes precedence over intensification
    recovery.conflictResolutionNote = "Conflict Resolved: PRACTICE_RECOVERY prioritized over INTENSIFICATION due to fatigue and burnout protection.";
    suppressedPlans.push({
      plan: intensification,
      reason: "Suppressed by active PRACTICE_RECOVERY mode.",
    });
  }

  // Filter out all suppressed plans from final list
  const suppressedIds = new Set(suppressedPlans.map((s) => s.plan.id));
  for (const plan of plans) {
    if (!suppressedIds.has(plan.id)) {
      resolvedPlans.push(plan);
    }
  }

  // Sort descending by priorityScore
  resolvedPlans.sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    resolvedPlans,
    suppressedPlans,
  };
}
