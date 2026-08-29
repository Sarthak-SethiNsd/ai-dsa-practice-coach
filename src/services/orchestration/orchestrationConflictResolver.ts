import { PreparationActivity, PreparationContext } from "./orchestrationTypes";
import { calculateActivityPriority } from "./orchestrationPrioritization";

export const CONSTRAINT_PRECEDENCE = [
  "SAFETY_RECOVERY", // 1. Safety / recovery
  "HARD_PREREQUISITE", // 2. Hard prerequisite dependency
  "ACTIVE_INTERVENTION", // 3. Active intervention
  "ACTIVE_GOAL", // 4. Active goal
  "SRS_URGENCY", // 5. SRS urgency
  "STRATEGY_PRIORITY", // 6. Strategy priority
  "PERFORMANCE_EVIDENCE", // 7. Performance evidence
  "PATTERN_DIVERSITY", // 8. Diversity
  "RECENCY", // 9. Recency
  "CONVENIENCE", // 10. Convenience
] as const;

export function resolveCandidatePrecedence(
  candidates: PreparationActivity[],
  context: PreparationContext
): PreparationActivity[] {
  // Sort candidates deterministically based on multi-factor calculation and precedence
  const scored = candidates.map((c) => {
    const calc = calculateActivityPriority(c, context);
    return {
      activity: {
        ...c,
        priority: calc.priorityClass,
        priorityScore: calc.normalizedScore,
        goalRelevance: calc.goalRelevance,
        strategyAlignment: calc.strategyPriority,
      },
      score: calc.normalizedScore,
      isPrereqBlocked: c.isPrerequisiteBlocked,
      isRecovery: c.activityType === "RECOVERY_SESSION",
      isFoundation: c.activityType === "FOUNDATION_REPAIR",
      isUrgentSRS:
        c.activityType === "REVISION" &&
        (context.revisionDueItems.length >= 5 ||
          context.strategyState?.revisionPriority === "URGENT" ||
          context.strategyState?.currentMode === "REVISION_FOCUS"),
    };
  });

  scored.sort((a, b) => {
    // 1. Safety/Recovery precedence
    if (a.isRecovery && !b.isRecovery) return -1;
    if (!a.isRecovery && b.isRecovery) return 1;

    // 2. Unblocked vs Blocked prerequisite precedence
    if (!a.isPrereqBlocked && b.isPrereqBlocked) return -1;
    if (a.isPrereqBlocked && !b.isPrereqBlocked) return 1;

    // 3. Foundation Repair precedence
    if (a.isFoundation && !b.isFoundation) return -1;
    if (!a.isFoundation && b.isFoundation) return 1;

    // 4. Urgent SRS precedence
    if (a.isUrgentSRS && !b.isUrgentSRS) return -1;
    if (!a.isUrgentSRS && b.isUrgentSRS) return 1;

    // 5. Total Priority Score
    return b.score - a.score;
  });

  return scored.map((s) => s.activity);
}
