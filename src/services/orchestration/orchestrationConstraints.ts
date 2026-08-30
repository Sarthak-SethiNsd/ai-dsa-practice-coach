import {
  PreparationContext,
  PreparationActivity,
  DeferredActivity,
} from "./orchestrationTypes";

export interface ConstraintEvaluationResult {
  acceptedActivities: PreparationActivity[];
  deferredActivities: DeferredActivity[];
  appliedConstraints: string[];
}

export function evaluateActivityConstraints(
  candidates: PreparationActivity[],
  context: PreparationContext,
  availableMinutes: number
): ConstraintEvaluationResult {
  const acceptedActivities: PreparationActivity[] = [];
  const deferredActivities: DeferredActivity[] = [];
  const appliedConstraints: string[] = [];

  const { strategyState } = context;
  const currentMode = strategyState?.currentMode ?? "BALANCED";
  const deprioritizedSkills = strategyState?.deprioritizedSkills ?? [];

  let accumulatedMinutes = 0;

  for (const candidate of candidates) {
    // Constraint 1: Prerequisite Dependency Check (Learning Graph Authority)
    if (candidate.isPrerequisiteBlocked && candidate.activityType !== "FOUNDATION_REPAIR") {
      appliedConstraints.push(`Learning Graph Prerequisite Constraint: ${candidate.title}`);
      deferredActivities.push({
        activity: candidate,
        category: "DO_LATER",
        deferralReason: `Deferred because required prerequisite(s) [${candidate.blockingPrerequisites.join(", ")}] are not yet mastered in the Learning Graph.`,
        appliedConstraint: "LEARNING_GRAPH_PREREQUISITE_BLOCK",
      });
      continue;
    }

    // Constraint 2: Strategy Overexposure Demotion
    const isOverexposed = candidate.affectedPatterns.some((p) =>
      deprioritizedSkills.some((d) => d.toLowerCase() === p.toLowerCase())
    ) || candidate.affectedSkills.some((s) =>
      deprioritizedSkills.some((d) => d.toLowerCase() === s.toLowerCase())
    );

    if (isOverexposed && currentMode !== "RECOVERY") {
      appliedConstraints.push(`Strategy Overexposure Constraint: ${candidate.title}`);
      deferredActivities.push({
        activity: candidate,
        category: "NOT_RECOMMENDED",
        deferralReason: "Not recommended in current session due to recent practice over-concentration (>35% exposure).",
        appliedConstraint: "OVEREXPOSURE_SUPPRESSION",
      });
      continue;
    }

    // Constraint 3: Recovery Mode Protection
    if (currentMode === "RECOVERY" && (candidate.difficulty === "Hard" || candidate.activityType === "CONTEST_PRACTICE" || candidate.activityType === "MOCK_INTERVIEW")) {
      appliedConstraints.push(`Recovery Mode Safety Constraint: ${candidate.title}`);
      deferredActivities.push({
        activity: candidate,
        category: "DO_LATER",
        deferralReason: "High-stress / Hard activity deferred during active Preparation Recovery mode.",
        appliedConstraint: "RECOVERY_MODE_PROTECTION",
      });
      continue;
    }

    // Constraint 4: Time Budget Constraint
    if (accumulatedMinutes + candidate.estimatedMinutes > availableMinutes) {
      appliedConstraints.push(`Time Budget Constraint (${availableMinutes}m): ${candidate.title}`);
      deferredActivities.push({
        activity: candidate,
        category: "DO_LATER",
        deferralReason: `Deferred due to time budget limit (${availableMinutes} min). Fits into longer sessions.`,
        appliedConstraint: "TIME_BUDGET_EXCEEDED",
      });
      continue;
    }

    // All constraints passed!
    acceptedActivities.push(candidate);
    accumulatedMinutes += candidate.estimatedMinutes;
  }

  return {
    acceptedActivities,
    deferredActivities,
    appliedConstraints: Array.from(new Set(appliedConstraints)),
  };
}
