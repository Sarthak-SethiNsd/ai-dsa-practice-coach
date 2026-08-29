import {
  PreparationPlan,
  NextBestAction,
  SubsystemHandoffPayloads,
  PlanHistoryEntry,
  PreparationContext,
} from "./orchestrationTypes";
import { assemblePreparationContext } from "./orchestrationContext";
import { generatePreparationPlan as generatePlanInternal } from "./orchestrationPlanner";
import { generateExecutionHandoffs } from "./orchestrationExecution";
import { createPlanHistoryEntry } from "./orchestrationFeedback";
import {
  getCachedPreparationPlan,
  setCachedPreparationPlan,
  getStoredPreparationPlan,
  saveStoredPreparationPlan,
  getStoredPlanHistory,
  appendStoredPlanHistory,
  clearPreparationPlanCache,
} from "./orchestrationStorage";

export async function orchestratePreparationPlan(
  availableMinutes = 45,
  forceRegenerate = false,
  customContext?: PreparationContext
): Promise<PreparationPlan> {
  // Check stability window cache
  if (!forceRegenerate && !customContext) {
    const cached = getCachedPreparationPlan();
    if (cached && cached.availableMinutes === availableMinutes) {
      return cached;
    }
  }

  // 1. Assemble Context Snapshot (Read-only across authorities)
  const context = customContext ?? (await assemblePreparationContext(availableMinutes, forceRegenerate));

  // 2. Generate Plan with constraint resolution & next best action
  const plan = generatePlanInternal(context, availableMinutes, forceRegenerate);

  // 3. Track in Plan History
  const historyEntry = createPlanHistoryEntry(plan, "ACTIVE", forceRegenerate ? "User requested plan re-orchestration" : undefined);
  appendStoredPlanHistory(historyEntry);

  // 4. Persist & Cache
  saveStoredPreparationPlan(plan);
  setCachedPreparationPlan(plan);

  return plan;
}

export async function getNextBestAction(availableMinutes = 45): Promise<NextBestAction> {
  const plan = await orchestratePreparationPlan(availableMinutes);
  return plan.nextBestAction;
}

export async function getSubsystemHandoffs(availableMinutes = 45): Promise<SubsystemHandoffPayloads> {
  const plan = await orchestratePreparationPlan(availableMinutes);
  return generateExecutionHandoffs(plan);
}

export function recordActivityOutcome(
  planId: string,
  activityId: string,
  outcome: "completed" | "skipped" | "failed"
): void {
  const storedPlan = getStoredPreparationPlan();
  if (storedPlan && storedPlan.planId === planId) {
    const act = storedPlan.activities.find((a) => a.activityId === activityId);
    if (act) {
      act.isCompleted = outcome === "completed";
      saveStoredPreparationPlan(storedPlan);
      setCachedPreparationPlan(storedPlan);
    }
  }
}

export function getPreparationPlanHistory(): PlanHistoryEntry[] {
  return getStoredPlanHistory();
}
