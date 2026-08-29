import {
  PreparationPlan,
  PlanHistoryEntry,
} from "./orchestrationTypes";

export function createPlanHistoryEntry(
  plan: PreparationPlan,
  status: PlanHistoryEntry["status"] = "ACTIVE",
  regenerationReason?: string
): PlanHistoryEntry {
  const now = new Date();
  return {
    planId: plan.planId,
    timestamp: now.toISOString(),
    date: now.toISOString().split("T")[0],
    goalName: plan.goal?.name || "General Improvement",
    strategyMode: plan.strategyMode,
    availableMinutes: plan.availableMinutes,
    activitiesCount: plan.activities.length,
    primaryFocus: plan.primaryFocus,
    nextBestActionTitle: plan.nextBestAction.actionTitle,
    completedActivitiesCount: plan.activities.filter((a) => a.isCompleted).length,
    status,
    regenerationReason,
  };
}
