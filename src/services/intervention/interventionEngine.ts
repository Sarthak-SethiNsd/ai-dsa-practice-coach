import {
  FullPerformanceIntelligence,
} from "@/services/performance/performanceTypes";
import { compilePerformanceIntelligence } from "@/services/performance/performanceEngine";
import { getActiveGoal } from "@/services/preparation/preparationStorage";
import {
  AdaptiveStrategyResult,
  SubsystemInterventionSignals,
  StrategyHistoryEntry,
  InterventionOutcome,
} from "./interventionTypes";
import { runDiagnosisPipeline } from "./interventionDiagnosis";
import { compileAdaptiveStrategyState } from "./interventionPlanner";
import { generateInterventionSignals } from "./interventionExecution";
import { recordStrategyTransition } from "./interventionFeedback";
import {
  getCachedStrategyResult,
  setCachedStrategyResult,
  getStoredStrategyState,
  saveStoredStrategyState,
  getStoredStrategyHistory,
  appendStoredStrategyHistory,
  getStoredInterventionOutcomes,
  saveStoredInterventionOutcome,
  getStoredCooldowns,
  setStoredCooldown,
} from "./interventionStorage";

export async function compileAdaptiveStrategy(
  forceRefresh = false,
  customIntelligence?: FullPerformanceIntelligence
): Promise<AdaptiveStrategyResult> {
  if (!forceRefresh && !customIntelligence) {
    const cached = getCachedStrategyResult();
    if (cached) return cached;
  }

  // 1. Obtain Performance Intelligence
  const intelligence = customIntelligence ?? (await compilePerformanceIntelligence("30d", forceRefresh));

  // 2. Obtain Active Preparation Goal
  const activeGoal = getActiveGoal();

  // 3. Obtain Active Cooldowns
  const cooldowns = getStoredCooldowns();

  // 4. Run Diagnosis Pipeline
  const diagnoses = runDiagnosisPipeline(intelligence, activeGoal);

  // 5. Compile Strategy State & Plans (with conflict resolution and priority scoring)
  const { state, plans } = compileAdaptiveStrategyState(diagnoses, activeGoal, cooldowns);

  // 6. Generate Subsystem Signals
  const signals = generateInterventionSignals(plans, state, activeGoal);

  // 7. Track Strategy Mode Transitions
  const prevState = getStoredStrategyState();
  if (prevState && prevState.currentMode !== state.currentMode) {
    const historyEntry = recordStrategyTransition(
      prevState.currentMode,
      state.currentMode,
      state.modeRationale,
      diagnoses[0]?.evidenceSummary || "Performance metrics update",
      plans.map((p) => p.title),
      activeGoal?.name || "General Improvement"
    );
    appendStoredStrategyHistory(historyEntry);
  }

  // 8. Persist Strategy State
  saveStoredStrategyState(state);

  const history = getStoredStrategyHistory();
  const outcomes = getStoredInterventionOutcomes();

  const result: AdaptiveStrategyResult = {
    state,
    diagnoses,
    plans,
    signals,
    history,
    outcomes,
    intelligenceSummary: {
      window: intelligence.window,
      totalAttempts: intelligence.metrics.totalAttempts,
      independentSolveRate: intelligence.metrics.independentSolveRate.currentValue,
      pacingDiagnosis: intelligence.difficultyTrend.pacingDiagnosis,
      hasSufficientData: intelligence.metrics.totalAttempts >= 3,
    },
  };

  // Cache in-memory
  setCachedStrategyResult(result);

  return result;
}

export async function getInterventionSignalsForSubsystems(): Promise<SubsystemInterventionSignals> {
  const result = await compileAdaptiveStrategy();
  return result.signals;
}

export function completeIntervention(planId: string, outcome: InterventionOutcome): void {
  saveStoredInterventionOutcome(outcome);
  // Set cooldown on this intervention type
  setStoredCooldown(outcome.interventionType, 5); // 5 days cooldown
}

export function getStrategyHistory(): StrategyHistoryEntry[] {
  return getStoredStrategyHistory();
}
