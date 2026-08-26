import {
  PracticeSession,
  PracticeSessionAnalytics,
  PracticeSessionScore,
} from "./practiceTypes";

// ─── AI Session Coach Analysis ────────────────────────────────────────────────

export interface AIPracticeCoachInsight {
  performance: string;
  improvements: string;
  struggles: string;
  adaptationExplanation: string;
  skillToFocus: string;
  nextPractice: string;
  difficultyAdvice: string;
}

/**
 * Generates a deterministic AI coach report by interpreting only structured session data.
 * Never invents outcomes, solve times, mastery, problem metadata, or skill dependencies.
 */
export function generateAIPracticeCoachInsight(
  session: PracticeSession,
  score: PracticeSessionScore,
  analytics: PracticeSessionAnalytics
): AIPracticeCoachInsight {
  const {
    problemsSolved,
    problemsAttempted,
    independentSolves,
    hintAssistedSolves,
    failures,
    timedOut,
    skillsPracticed,
    weakestEvidence,
    nextRecommendedAction,
    adaptationsTriggered,
  } = analytics;

  // ─── How did I perform? ─────────────────────────────────────────────────────
  const solveRate = problemsAttempted > 0
    ? Math.round((problemsSolved / problemsAttempted) * 100)
    : 0;

  let performance = "";
  if (problemsAttempted === 0) {
    performance = "The session ended without any problems attempted.";
  } else if (score.overallScore >= 88) {
    performance = `Exceptional session. You solved ${problemsSolved}/${problemsAttempted} problems with ${independentSolves} independent solves. Score: ${score.overallScore}/100.`;
  } else if (score.overallScore >= 72) {
    performance = `Strong session. You attempted ${problemsAttempted} problems and solved ${problemsSolved} (${solveRate}%). ${independentSolves} were solved without hints.`;
  } else if (score.overallScore >= 55) {
    performance = `Good session. ${problemsSolved} of ${problemsAttempted} problems solved. ${hintAssistedSolves} required hints, indicating concepts that need reinforcement.`;
  } else if (score.overallScore >= 38) {
    performance = `Fair session. ${problemsSolved} of ${problemsAttempted} solved. There were ${failures} failure${failures !== 1 ? "s" : ""} — focus areas have been identified for your next session.`;
  } else {
    performance = `Developing session. ${problemsAttempted} problems attempted with ${problemsSolved} solved. The engine has collected useful evidence about where to focus next.`;
  }

  // ─── What did I improve? ────────────────────────────────────────────────────
  let improvements = "";
  if (independentSolves > 0) {
    const solvedSkills = [...new Set(
      session.outcomes
        .filter((o) => o.outcomeType === "SOLVED_INDEPENDENTLY")
        .map((o) => session.plannedProblems.find((p) => p.problemId === o.problemId)?.targetSkill)
        .filter(Boolean)
    )].join(", ");
    improvements = `You demonstrated independent mastery in: ${solvedSkills || skillsPracticed.join(", ")}.`;
    if (independentSolves >= 2) {
      improvements += ` Solving ${independentSolves} problems independently is strong positive evidence of skill development.`;
    }
  } else if (problemsSolved > 0) {
    improvements = `You completed ${problemsSolved} problem${problemsSolved > 1 ? "s" : ""} with guidance. This practice builds familiarity that leads to independence over time.`;
  } else {
    improvements = "No problems were completed this session, but attempting problems provides valuable diagnostic evidence for future sessions.";
  }

  // ─── Where did I struggle? ──────────────────────────────────────────────────
  let struggles = "";
  if (failures === 0 && timedOut === 0 && hintAssistedSolves === 0) {
    struggles = "No significant struggles detected this session. Well done.";
  } else {
    const parts: string[] = [];
    if (failures > 0) parts.push(`${failures} failure${failures !== 1 ? "s" : ""}`);
    if (timedOut > 0) parts.push(`${timedOut} timeout${timedOut !== 1 ? "s" : ""}`);
    if (hintAssistedSolves >= 2) parts.push(`${hintAssistedSolves} hint-assisted solves`);
    struggles = `${parts.join(", ")} were recorded. ${weakestEvidence}`;
  }

  // ─── Why did the session adapt? ──────────────────────────────────────────────
  let adaptationExplanation = "";
  if (adaptationsTriggered === 0) {
    adaptationExplanation = "The session plan stayed consistent — your performance matched the planned difficulty progression.";
  } else {
    const adaptReasons = session.adaptations.map((a) => a.reason).slice(0, 3);
    adaptationExplanation = `The session adapted ${adaptationsTriggered} time${adaptationsTriggered !== 1 ? "s" : ""}: ${adaptReasons.join(" | ")}`;
  }

  // ─── Which skill needs attention? ───────────────────────────────────────────
  let skillToFocus = "";
  const failedSkills = session.outcomes
    .filter((o) => o.outcomeType === "FAILED" || o.outcomeType === "TIMED_OUT")
    .map((o) => session.plannedProblems.find((p) => p.problemId === o.problemId)?.targetSkill)
    .filter(Boolean);

  const hintSkills = session.outcomes
    .filter((o) => o.outcomeType === "SOLVED_WITH_HINTS" && o.hintCount >= 2)
    .map((o) => session.plannedProblems.find((p) => p.problemId === o.problemId)?.targetSkill)
    .filter(Boolean);

  const focusSkills = [...new Set([...failedSkills, ...hintSkills])];
  if (focusSkills.length > 0) {
    skillToFocus = `Priority focus areas: ${focusSkills.slice(0, 3).join(", ")}. These showed the weakest performance.`;
  } else if (skillsPracticed.length > 0) {
    skillToFocus = `All practiced skills (${skillsPracticed.join(", ")}) showed acceptable performance. Consider expanding to adjacent patterns.`;
  } else {
    skillToFocus = "Continue with your current practice plan.";
  }

  // ─── What should I practice next? ─────────────────────────────────────────
  const nextPractice = nextRecommendedAction;

  // ─── Should I increase or decrease difficulty? ─────────────────────────────
  let difficultyAdvice = "";
  if (solveRate >= 80 && independentSolves >= problemsSolved * 0.7 && failures === 0) {
    difficultyAdvice = "Increase difficulty: you solved problems comfortably and independently. You're ready for a harder challenge.";
  } else if (solveRate >= 60 && hintAssistedSolves <= 1) {
    difficultyAdvice = "Maintain current difficulty: your performance is solid with room for improvement before advancing.";
  } else if (failures >= 2 || (hintAssistedSolves >= 2 && solveRate < 50)) {
    difficultyAdvice = "Decrease difficulty: too many failures or hints suggest the current level is pushing ahead of your foundational understanding. Consolidate first.";
  } else {
    difficultyAdvice = "Your difficulty level is appropriate for your current stage. Focus on reducing hint dependency.";
  }

  return {
    performance,
    improvements,
    struggles,
    adaptationExplanation,
    skillToFocus,
    nextPractice,
    difficultyAdvice,
  };
}
