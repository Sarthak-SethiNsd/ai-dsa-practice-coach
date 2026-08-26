import {
  PracticeSessionProblem,
  PracticeSession,
  PracticeSessionOutcome,
  PracticeOutcomeType,
  PracticeAdaptationRecord,
  AdaptationAdjustmentType,
} from "./practiceTypes";
import { Difficulty } from "@/services/types";

// ─── Adaptation Rule Context ──────────────────────────────────────────────────

export interface AdaptationContext {
  session: PracticeSession;
  lastOutcome: PracticeSessionOutcome;
  remainingSeconds: number;
  consecutiveFailures: number;
  consecutiveIndependentSolves: number;
  historyMedianSolveSeconds: number;
}

// ─── Difficulty Ordering ──────────────────────────────────────────────────────

const DIFFICULTY_ORDER: Difficulty[] = ["Easy", "Medium", "Hard"];

export function increaseDifficulty(current: Difficulty): Difficulty {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  return idx < DIFFICULTY_ORDER.length - 1
    ? DIFFICULTY_ORDER[idx + 1]
    : current;
}

export function decreaseDifficulty(current: Difficulty): Difficulty {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  return idx > 0 ? DIFFICULTY_ORDER[idx - 1] : current;
}

// ─── Adaptation Rules (Deterministic) ────────────────────────────────────────

export interface AdaptationDecision {
  shouldAdapt: boolean;
  adjustmentType: AdaptationAdjustmentType | null;
  reason: string;
  targetDifficulty: Difficulty | null;
  insertPrerequisite: boolean;
  trimQueue: boolean;
  switchToRepair: boolean;
  addChallenge: boolean;
}

/**
 * FAST_SUCCESS: Solved independently and significantly faster than estimated or historical median.
 */
export function evaluateFastSuccess(
  ctx: AdaptationContext,
  problem: PracticeSessionProblem
): AdaptationDecision {
  const actualSeconds = ctx.lastOutcome.actualSolveTimeSeconds;
  const estimatedSeconds = problem.timeEstimate.estimatedMinutes * 60;
  const isFast = actualSeconds < estimatedSeconds * 0.6;

  if (!isFast && ctx.consecutiveIndependentSolves < 2) {
    return { shouldAdapt: false, adjustmentType: null, reason: "", targetDifficulty: null, insertPrerequisite: false, trimQueue: false, switchToRepair: false, addChallenge: false };
  }

  const newDiff = increaseDifficulty(problem.difficulty);
  const didIncrease = newDiff !== problem.difficulty;

  return {
    shouldAdapt: true,
    adjustmentType: didIncrease ? "DIFFICULTY_UP" : "SKILL_ADVANCE",
    reason: didIncrease
      ? `Difficulty increased because you solved this ${problem.difficulty} independently in ${Math.round(actualSeconds / 60)} min, well below the estimated ${problem.timeEstimate.estimatedMinutes} min.`
      : `Skill advanced: you've solved ${ctx.consecutiveIndependentSolves + 1} problems independently. Moving toward a more challenging pattern.`,
    targetDifficulty: newDiff,
    insertPrerequisite: false,
    trimQueue: false,
    switchToRepair: false,
    addChallenge: ctx.session.config.allowChallengeProblems,
  };
}

/**
 * NORMAL_SUCCESS: Standard solve, no significant deviation. Continue planned progression.
 */
export function evaluateNormalSuccess(): AdaptationDecision {
  return {
    shouldAdapt: false,
    adjustmentType: null,
    reason: "Planned progression maintained.",
    targetDifficulty: null,
    insertPrerequisite: false,
    trimQueue: false,
    switchToRepair: false,
    addChallenge: false,
  };
}

/**
 * SLOW_SUCCESS: Solved but took much longer than estimated. Maintain skill focus but trim queue.
 */
export function evaluateSlowSuccess(
  ctx: AdaptationContext,
  problem: PracticeSessionProblem
): AdaptationDecision {
  const actualSeconds = ctx.lastOutcome.actualSolveTimeSeconds;
  const estimatedSeconds = problem.timeEstimate.estimatedMinutes * 60;
  const isSlow = actualSeconds > estimatedSeconds * 1.8;

  if (!isSlow) {
    return evaluateNormalSuccess();
  }

  const remainingMinutes = Math.floor(ctx.remainingSeconds / 60);

  return {
    shouldAdapt: remainingMinutes < 20,
    adjustmentType: "BUDGET_TRIM",
    reason: `You solved this problem but took ${Math.round(actualSeconds / 60)} min (estimated ${problem.timeEstimate.estimatedMinutes} min). Adjusting the remaining queue to fit your time budget of ${remainingMinutes} minutes.`,
    targetDifficulty: problem.difficulty,
    insertPrerequisite: false,
    trimQueue: remainingMinutes < 20,
    switchToRepair: false,
    addChallenge: false,
  };
}

/**
 * HINT_ASSISTED_SUCCESS: Solved with hints. Moderate weakness evidence — reinforce concept.
 */
export function evaluateHintAssistedSuccess(
  ctx: AdaptationContext,
  problem: PracticeSessionProblem
): AdaptationDecision {
  const hintCount = ctx.lastOutcome.hintCount;
  if (hintCount === 0) return evaluateNormalSuccess();

  return {
    shouldAdapt: true,
    adjustmentType: hintCount >= 2 ? "PREREQ_INSERTION" : "DIFFICULTY_DOWN",
    reason: hintCount >= 2
      ? `You needed ${hintCount} hints on this ${problem.difficulty} ${problem.primaryPattern} problem. A prerequisite or concept reinforcement problem has been inserted to strengthen the foundation.`
      : `You solved with 1 hint. Keeping difficulty the same to build confidence before advancing.`,
    targetDifficulty: hintCount >= 2 ? decreaseDifficulty(problem.difficulty) : problem.difficulty,
    insertPrerequisite: hintCount >= 2,
    trimQueue: false,
    switchToRepair: false,
    addChallenge: false,
  };
}

/**
 * FAILURE: Failed to solve. Insert a prerequisite bridge or easier problem.
 */
export function evaluateFailure(
  ctx: AdaptationContext,
  problem: PracticeSessionProblem
): AdaptationDecision {
  const switchToRepair = ctx.consecutiveFailures >= 2;

  return {
    shouldAdapt: true,
    adjustmentType: switchToRepair ? "REPAIR_MODE" : "PREREQ_INSERTION",
    reason: switchToRepair
      ? `You've failed ${ctx.consecutiveFailures + 1} problems in a row. Switching to Repair mode: focusing on prerequisite gaps before advancing.`
      : `Failed this ${problem.difficulty} problem. Inserting a prerequisite or easier bridge problem to build the necessary foundation for ${problem.targetSkill}.`,
    targetDifficulty: decreaseDifficulty(problem.difficulty),
    insertPrerequisite: true,
    trimQueue: false,
    switchToRepair,
    addChallenge: false,
  };
}

/**
 * TIMEOUT: Problem timed out. Trim queue to fit remaining session budget.
 */
export function evaluateTimeout(
  ctx: AdaptationContext,
  problem: PracticeSessionProblem
): AdaptationDecision {
  const remainingMinutes = Math.floor(ctx.remainingSeconds / 60);

  return {
    shouldAdapt: true,
    adjustmentType: "QUEUE_TRIM",
    reason: `Time ran out on this ${problem.difficulty} problem. The remaining queue has been adjusted to shorter problems that fit your ${remainingMinutes}-minute budget.`,
    targetDifficulty: decreaseDifficulty(problem.difficulty),
    insertPrerequisite: false,
    trimQueue: true,
    switchToRepair: false,
    addChallenge: false,
  };
}

/**
 * SKIP: Substitutes alternative without treating as failure.
 */
export function evaluateSkip(
  _ctx: AdaptationContext,
  problem: PracticeSessionProblem
): AdaptationDecision {
  return {
    shouldAdapt: true,
    adjustmentType: "DIFFICULTY_DOWN",
    reason: `Skipped this ${problem.difficulty} ${problem.primaryPattern} problem. An alternative has been selected from the recommendation pool.`,
    targetDifficulty: problem.difficulty,
    insertPrerequisite: false,
    trimQueue: false,
    switchToRepair: false,
    addChallenge: false,
  };
}

// ─── Main Adaptation Dispatcher ───────────────────────────────────────────────

export function evaluateAdaptation(
  ctx: AdaptationContext,
  problem: PracticeSessionProblem
): AdaptationDecision {
  const outcome = ctx.lastOutcome.outcomeType;
  const actualSeconds = ctx.lastOutcome.actualSolveTimeSeconds;
  const estimatedSeconds = problem.timeEstimate.estimatedMinutes * 60;

  switch (outcome) {
    case "SOLVED_INDEPENDENTLY": {
      const isFast = actualSeconds < estimatedSeconds * 0.6;
      const isSlow = actualSeconds > estimatedSeconds * 1.8;
      if (isFast || ctx.consecutiveIndependentSolves >= 2) return evaluateFastSuccess(ctx, problem);
      if (isSlow) return evaluateSlowSuccess(ctx, problem);
      return evaluateNormalSuccess();
    }
    case "SOLVED_WITH_HINTS":
      return evaluateHintAssistedSuccess(ctx, problem);
    case "FAILED":
      return evaluateFailure(ctx, problem);
    case "TIMED_OUT":
      return evaluateTimeout(ctx, problem);
    case "SKIPPED":
      return evaluateSkip(ctx, problem);
    case "ABANDONED":
      return {
        shouldAdapt: false,
        adjustmentType: null,
        reason: "Session abandoned.",
        targetDifficulty: null,
        insertPrerequisite: false,
        trimQueue: false,
        switchToRepair: false,
        addChallenge: false,
      };
    default:
      return evaluateNormalSuccess();
  }
}

// ─── Build Adaptation Record ──────────────────────────────────────────────────

export function buildAdaptationRecord(
  decision: AdaptationDecision,
  triggerOutcome: PracticeOutcomeType,
  triggerProblemId: number,
  addedProblemIds: number[] = [],
  removedProblemIds: number[] = []
): PracticeAdaptationRecord {
  return {
    id: `adapt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    triggerOutcome,
    triggerProblemId,
    timestamp: new Date().toISOString(),
    reason: decision.reason,
    adjustmentType: decision.adjustmentType ?? "BUDGET_TRIM",
    problemsAdded: addedProblemIds,
    problemsRemoved: removedProblemIds,
  };
}
