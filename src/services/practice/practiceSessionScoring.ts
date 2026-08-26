import {
  PracticeSession,
  PracticeSessionScore,
  PracticeSessionAnalytics,
} from "./practiceTypes";
import { Difficulty } from "@/services/types";

// ─── Session Score ─────────────────────────────────────────────────────────────

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  Easy: 1.0,
  Medium: 1.8,
  Hard: 3.0,
};

/**
 * Computes a deterministic session score (not purely problems solved / attempted).
 * A Hard problem solved independently is worth significantly more than Easy with hints.
 */
export function computeSessionScore(session: PracticeSession): PracticeSessionScore {
  const outcomes = session.outcomes;
  if (outcomes.length === 0) {
    return {
      overallScore: 0,
      completionScore: 0,
      independentSolveScore: 0,
      difficultyBonus: 0,
      timeEfficiencyScore: 0,
      goalAlignmentScore: 0,
      label: "Developing",
      explanation: "No problems were attempted in this session.",
    };
  }

  const planned = session.plannedProblems.length;
  const attempted = outcomes.length;
  const solved = outcomes.filter(
    (o) => o.outcomeType === "SOLVED_INDEPENDENTLY" || o.outcomeType === "SOLVED_WITH_HINTS"
  ).length;
  const independent = outcomes.filter((o) => o.outcomeType === "SOLVED_INDEPENDENTLY").length;
  const hintAssisted = outcomes.filter((o) => o.outcomeType === "SOLVED_WITH_HINTS").length;

  // 1. Completion Score (0-25): how many planned problems were attempted
  const completionScore = Math.round((attempted / Math.max(1, planned)) * 25);

  // 2. Independent Solve Score (0-30): weighted by difficulty
  let independentWeight = 0;
  let maxIndependentWeight = 0;
  let hintWeight = 0;

  for (const outcome of outcomes) {
    const problem = session.plannedProblems.find((p) => p.problemId === outcome.problemId);
    if (!problem) continue;
    const w = DIFFICULTY_WEIGHT[problem.difficulty] ?? 1.0;
    maxIndependentWeight += w;

    if (outcome.outcomeType === "SOLVED_INDEPENDENTLY") independentWeight += w;
    else if (outcome.outcomeType === "SOLVED_WITH_HINTS") hintWeight += w * 0.5;
  }

  const independentSolveScore = Math.round(
    ((independentWeight + hintWeight) / Math.max(0.1, maxIndependentWeight)) * 30
  );

  // 3. Difficulty Bonus (0-20): average difficulty weight of solved problems
  const solvedProblems = outcomes
    .filter((o) => o.outcomeType === "SOLVED_INDEPENDENTLY" || o.outcomeType === "SOLVED_WITH_HINTS")
    .map((o) => session.plannedProblems.find((p) => p.problemId === o.problemId))
    .filter(Boolean);

  const avgDiffWeight =
    solvedProblems.length > 0
      ? solvedProblems.reduce((sum, p) => sum + (DIFFICULTY_WEIGHT[p!.difficulty] ?? 1), 0) /
        solvedProblems.length
      : 0;

  const difficultyBonus = Math.round(Math.min(20, (avgDiffWeight / 3.0) * 20));

  // 4. Time Efficiency Score (0-15): solved problems within estimated time
  const efficientSolves = outcomes.filter((o) => {
    if (o.outcomeType !== "SOLVED_INDEPENDENTLY" && o.outcomeType !== "SOLVED_WITH_HINTS") return false;
    const problem = session.plannedProblems.find((p) => p.problemId === o.problemId);
    if (!problem) return false;
    const estimated = problem.timeEstimate.estimatedMinutes * 60;
    return o.actualSolveTimeSeconds <= estimated * 1.2;
  }).length;

  const timeEfficiencyScore =
    solved > 0 ? Math.round((efficientSolves / solved) * 15) : 0;

  // 5. Goal Alignment Score (0-10): based on session mode appropriateness
  const goalAlignmentScore =
    session.config.activeGoalId && solved > 0 ? 8 : solved > 0 ? 5 : 0;

  const overallScore = Math.min(
    100,
    completionScore + independentSolveScore + difficultyBonus + timeEfficiencyScore + goalAlignmentScore
  );

  const label =
    overallScore >= 88
      ? "Exceptional"
      : overallScore >= 72
      ? "Strong"
      : overallScore >= 55
      ? "Good"
      : overallScore >= 38
      ? "Fair"
      : "Developing";

  // Build explanation
  const explanationParts: string[] = [];
  if (independent > 0) {
    explanationParts.push(`${independent} problem${independent > 1 ? "s" : ""} solved independently.`);
  }
  if (hintAssisted > 0) {
    explanationParts.push(`${hintAssisted} solved with hints.`);
  }
  if (attempted > solved) {
    explanationParts.push(`${attempted - solved} not solved.`);
  }
  if (timeEfficiencyScore >= 10) {
    explanationParts.push("Strong time efficiency.");
  }

  const explanation = explanationParts.length > 0
    ? `Score ${overallScore}/100 (${label}): ${explanationParts.join(" ")}`
    : `Score ${overallScore}/100 (${label}).`;

  return {
    overallScore,
    completionScore,
    independentSolveScore,
    difficultyBonus,
    timeEfficiencyScore,
    goalAlignmentScore,
    label,
    explanation,
  };
}

// ─── Session Analytics ────────────────────────────────────────────────────────

export function computeSessionAnalytics(session: PracticeSession): PracticeSessionAnalytics {
  const outcomes = session.outcomes;
  const problems = session.plannedProblems;

  const problemsAttempted = outcomes.length;
  const problemsSolved = outcomes.filter(
    (o) => o.outcomeType === "SOLVED_INDEPENDENTLY" || o.outcomeType === "SOLVED_WITH_HINTS"
  ).length;
  const independentSolves = outcomes.filter((o) => o.outcomeType === "SOLVED_INDEPENDENTLY").length;
  const hintAssistedSolves = outcomes.filter((o) => o.outcomeType === "SOLVED_WITH_HINTS").length;
  const failures = outcomes.filter((o) => o.outcomeType === "FAILED").length;
  const skipped = outcomes.filter((o) => o.outcomeType === "SKIPPED").length;
  const timedOut = outcomes.filter((o) => o.outcomeType === "TIMED_OUT").length;

  const solveTimes = outcomes
    .filter((o) => o.actualSolveTimeSeconds > 0)
    .map((o) => o.actualSolveTimeSeconds);

  const avgSolveTimeSeconds =
    solveTimes.length > 0
      ? Math.round(solveTimes.reduce((s, t) => s + t, 0) / solveTimes.length)
      : 0;

  // Difficulty distribution (of solved problems)
  const difficultyDistribution = { Easy: 0, Medium: 0, Hard: 0 };
  outcomes.forEach((o) => {
    const p = problems.find((pr) => pr.problemId === o.problemId);
    if (p && (o.outcomeType === "SOLVED_INDEPENDENTLY" || o.outcomeType === "SOLVED_WITH_HINTS")) {
      difficultyDistribution[p.difficulty] = (difficultyDistribution[p.difficulty] ?? 0) + 1;
    }
  });

  // Skills and patterns
  const skillsPracticed = [...new Set(problems.map((p) => p.targetSkill))];
  const patternsPracticed = [...new Set(problems.map((p) => p.primaryPattern))];

  // Strongest/weakest evidence
  const skillOutcomes: Record<string, { solved: number; failed: number }> = {};
  outcomes.forEach((o) => {
    const p = problems.find((pr) => pr.problemId === o.problemId);
    if (!p) return;
    if (!skillOutcomes[p.targetSkill]) skillOutcomes[p.targetSkill] = { solved: 0, failed: 0 };
    if (o.outcomeType === "SOLVED_INDEPENDENTLY" || o.outcomeType === "SOLVED_WITH_HINTS") {
      skillOutcomes[p.targetSkill].solved += 1;
    } else if (o.outcomeType === "FAILED") {
      skillOutcomes[p.targetSkill].failed += 1;
    }
  });

  let strongestEvidence = "Consistent performance across all practiced skills.";
  let weakestEvidence = "No significant weaknesses detected in this session.";

  const skillEntries = Object.entries(skillOutcomes);
  if (skillEntries.length > 0) {
    const strongest = skillEntries.sort(
      (a, b) => (b[1].solved - b[1].failed) - (a[1].solved - a[1].failed)
    )[0];
    const weakest = skillEntries.sort(
      (a, b) => (a[1].solved - a[1].failed) - (b[1].solved - b[1].failed)
    )[0];

    if (strongest[1].solved > 0) {
      strongestEvidence = `Strong performance in ${strongest[0]} (${strongest[1].solved} solved independently).`;
    }
    if (weakest[1].failed > 0) {
      weakestEvidence = `${weakest[0]} showed ${weakest[1].failed} failure${weakest[1].failed > 1 ? "s" : ""} — consider focused practice.`;
    }
  }

  // Time efficiency
  const totalDurationMs = session.durationMinutes * 60 * 1000;
  const elapsedMs = session.endedAt
    ? new Date(session.endedAt).getTime() - new Date(session.timerStartedAt).getTime() - session.totalPausedMs
    : totalDurationMs;

  const totalTimeSeconds = Math.floor(elapsedMs / 1000);

  const solveRatio = problemsAttempted > 0 ? problemsSolved / problemsAttempted : 0;
  const efficiencyRating =
    solveRatio >= 0.85 && independentSolves >= problemsSolved * 0.7
      ? "Excellent"
      : solveRatio >= 0.65
      ? "Good"
      : solveRatio >= 0.4
      ? "Average"
      : "Below Average";

  // Next recommended action
  let nextRecommendedAction = "Continue with Smart Practice to broaden your skillset.";
  if (failures >= 2) {
    const weakSkill = skillEntries.sort((a, b) => a[1].failed - b[1].failed)[0]?.[0];
    nextRecommendedAction = weakSkill
      ? `Schedule a Weakness Repair session focused on ${weakSkill}.`
      : "Schedule a Weakness Repair session to address recurring failures.";
  } else if (hintAssistedSolves >= 2) {
    nextRecommendedAction = "Practice without hints: try Pattern Mastery mode for the same topic.";
  } else if (independentSolves >= problemsSolved && problemsSolved >= 2) {
    nextRecommendedAction = "You're ready to increase difficulty. Try a Challenge or higher-difficulty session next.";
  }

  return {
    totalTimeSeconds,
    problemsAttempted,
    problemsSolved,
    independentSolves,
    hintAssistedSolves,
    failures,
    skipped,
    timedOut,
    avgSolveTimeSeconds,
    difficultyDistribution,
    skillsPracticed,
    patternsPracticed,
    strongestEvidence,
    weakestEvidence,
    efficiencyRating,
    nextRecommendedAction,
    adaptationsTriggered: session.adaptations.length,
  };
}

// ─── Session History Item Builder ─────────────────────────────────────────────

export function buildHistoryItem(
  session: PracticeSession,
  score: PracticeSessionScore,
  analytics: PracticeSessionAnalytics
) {
  const primarySkill = session.plannedProblems[0]?.targetSkill ?? "General";
  const primaryPattern = session.plannedProblems[0]?.primaryPattern ?? "Mixed";
  const dateStr = new Date(session.startedAt).toISOString().split("T")[0];

  return {
    sessionId: session.sessionId,
    date: dateStr,
    mode: session.mode,
    durationMinutes: session.durationMinutes,
    actualDurationSeconds: analytics.totalTimeSeconds,
    problemsAttempted: analytics.problemsAttempted,
    problemsSolved: analytics.problemsSolved,
    completionRate: analytics.problemsAttempted > 0
      ? Math.round((analytics.problemsSolved / analytics.problemsAttempted) * 100)
      : 0,
    score,
    primarySkill,
    primaryPattern,
    status: session.status,
    goalTitle: session.goalTitle,
  };
}
