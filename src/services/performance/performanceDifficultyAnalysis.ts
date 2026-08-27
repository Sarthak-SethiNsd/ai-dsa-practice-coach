import {
  DifficultyProgressionTrend,
  DifficultyLevelStats,
  DifficultyPacing,
  LongitudinalEvent,
} from "./performanceTypes";
import { AggregatedDataSet } from "./performanceAggregation";
import { Difficulty } from "@/services/types";

export function analyzeDifficultyProgression(
  dataset: AggregatedDataSet
): DifficultyProgressionTrend {
  const current = dataset.currentPeriodEvents;

  const byDifficulty: Record<Difficulty, DifficultyLevelStats> = {
    Easy: computeStatsForDifficulty(current, "Easy"),
    Medium: computeStatsForDifficulty(current, "Medium"),
    Hard: computeStatsForDifficulty(current, "Hard"),
  };

  const easy = byDifficulty.Easy;
  const medium = byDifficulty.Medium;
  const hard = byDifficulty.Hard;
  const totalAttempts = easy.attempts + medium.attempts + hard.attempts;

  // ─── Transition Gaps ─────────────────────────────────────────────────────────
  const hasEasyToMediumGap =
    easy.attempts >= 3 &&
    easy.independentSolveRate >= 75 &&
    medium.attempts >= 3 &&
    medium.independentSolveRate <= 40;

  const hasMediumToHardGap =
    medium.attempts >= 3 &&
    medium.independentSolveRate >= 65 &&
    hard.attempts >= 3 &&
    hard.independentSolveRate <= 30;

  let gapDescription = "Smooth difficulty progression across current tiers.";
  if (hasMediumToHardGap) {
    gapDescription = `Significant Medium → Hard transition gap detected: Medium independent solve rate is ${medium.independentSolveRate}%, but drops to ${hard.independentSolveRate}% on Hard problems.`;
  } else if (hasEasyToMediumGap) {
    gapDescription = `Easy → Medium transition gap detected: Easy independent solve rate is ${easy.independentSolveRate}%, but drops to ${medium.independentSolveRate}% on Medium problems.`;
  }

  // ─── Pacing Assessment ──────────────────────────────────────────────────────
  let pacing: DifficultyPacing = "INSUFFICIENT_DATA";
  let pacingDiagnosis = "";
  let recommendedDifficultyAction = "";

  if (totalAttempts < 3) {
    pacing = "INSUFFICIENT_DATA";
    pacingDiagnosis = `Insufficient problem attempts (${totalAttempts}) to evaluate difficulty pacing.`;
    recommendedDifficultyAction = "Complete more practice sessions across mixed difficulties.";
  } else {
    // Too Conservative: Solves almost exclusively Easy/Medium independently with zero or tiny Hard attempts
    const isConservative =
      easy.independentSolveRate >= 85 &&
      medium.independentSolveRate >= 80 &&
      hard.attempts <= 1;

    // Too Aggressive: High proportion of Hard problems with heavy hints or failures (> 60% fail/hint on Hard)
    const isAggressive =
      hard.attempts >= 3 &&
      (hard.solveRate <= 35 || (hard.hintCount >= hard.attempts * 1.5 && hard.independentSolveRate <= 25));

    // Plateau: Medium solve rate stuck around 45-55% with >= 6 attempts and no increase
    const isPlateau =
      medium.attempts >= 6 &&
      medium.independentSolveRate >= 40 &&
      medium.independentSolveRate <= 60 &&
      hard.independentSolveRate <= 25;

    if (isAggressive) {
      pacing = "TOO_AGGRESSIVE";
      pacingDiagnosis = "Hard problem exposure is too aggressive: high failure rate and heavy hint dependency indicate foundational gaps.";
      recommendedDifficultyAction = "Temporarily reduce Hard problem frequency. Consolidate Medium mastery with independent timed solves before escalating.";
    } else if (isConservative) {
      pacing = "TOO_CONSERVATIVE";
      pacingDiagnosis = "Current difficulty is too conservative: Easy and Medium problems are solved comfortably and independently with minimal challenge.";
      recommendedDifficultyAction = "Increase difficulty: introduce 1-2 Medium-Hard or Hard problems per session to stimulate progression.";
    } else if (isPlateau) {
      pacing = "PLATEAU";
      pacingDiagnosis = "Difficulty progression has plateaued at Medium: steady attempts without advancement to Hard tier.";
      recommendedDifficultyAction = "Introduce prerequisite bridge problems targeting the specific sub-skills needed to cross into Hard tier.";
    } else {
      pacing = "APPROPRIATE";
      pacingDiagnosis = "Difficulty distribution is well-calibrated to current skill level with balanced challenge and manageable failure rates.";
      recommendedDifficultyAction = "Maintain current difficulty mix: 20% Easy warmup, 60% Medium core, 20% Hard challenge.";
    }
  }

  return {
    byDifficulty,
    pacing,
    transitionGap: {
      hasEasyToMediumGap,
      hasMediumToHardGap,
      gapDescription,
    },
    pacingDiagnosis,
    recommendedDifficultyAction,
  };
}

function computeStatsForDifficulty(
  events: LongitudinalEvent[],
  diff: Difficulty
): DifficultyLevelStats {
  const filtered = events.filter((e) => e.difficulty === diff);
  const attempts = filtered.length;
  const solvedCount = filtered.filter(
    (e) => e.outcome === "SOLVED_INDEPENDENTLY" || e.outcome === "SOLVED_WITH_HINTS" || e.outcome === "COMPLETED"
  ).length;
  const independentSolves = filtered.filter((e) => e.outcome === "SOLVED_INDEPENDENTLY").length;
  const hintCount = filtered.reduce((sum, e) => sum + (e.hintCount || 0), 0);

  const solveRate = attempts > 0 ? Math.round((solvedCount / attempts) * 100) : 0;
  const independentSolveRate = attempts > 0 ? Math.round((independentSolves / attempts) * 100) : 0;

  const solveTimes = filtered
    .filter((e) => e.solveTimeSeconds && e.solveTimeSeconds > 0)
    .map((e) => e.solveTimeSeconds!);
  const averageSolveTimeSeconds = solveTimes.length > 0
    ? Math.round(solveTimes.reduce((sum, t) => sum + t, 0) / solveTimes.length)
    : 0;

  return {
    difficulty: diff,
    attempts,
    solvedCount,
    independentSolves,
    solveRate,
    independentSolveRate,
    hintCount,
    averageSolveTimeSeconds,
  };
}
