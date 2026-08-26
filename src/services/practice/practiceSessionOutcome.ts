import {
  PracticeSession,
  PracticeSessionProblem,
  PracticeSessionOutcome,
  PracticeOutcomeType,
  TimeEstimate,
} from "./practiceTypes";
import { compileAdaptiveRecommendations } from "@/services/recommendations/recommendationEngine";
import { logRecommendationFeedback } from "@/services/recommendations/recommendationHistory";
import { AdaptiveProblemRecommendation, RecommendationFeedbackAction } from "@/services/recommendations/recommendationTypes";
import { getStoredSkillNodes, saveStoredSkillNodes } from "@/services/learningGraph/learningGraphStorage";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { computeNextRevisionState } from "@/services/revision/revisionEngine";
import { Difficulty } from "@/services/types";

// ─── Outcome → Recommendation Feedback Map ─────────────────────────────────────

function outcomeToRecFeedback(outcome: PracticeOutcomeType): RecommendationFeedbackAction {
  switch (outcome) {
    case "SOLVED_INDEPENDENTLY": return "solved_independently";
    case "SOLVED_WITH_HINTS":    return "solved_with_hints";
    case "FAILED":               return "failed";
    case "SKIPPED":              return "skipped";
    case "TIMED_OUT":            return "failed";
    case "ABANDONED":            return "dismissed";
    default:                     return "skipped";
  }
}

// ─── Dispatch to Recommendation Engine ────────────────────────────────────────

export async function dispatchRecommendationFeedback(
  problem: PracticeSessionProblem,
  outcome: PracticeSessionOutcome
): Promise<void> {
  try {
    const action = outcomeToRecFeedback(outcome.outcomeType);

    // Build a minimal AdaptiveProblemRecommendation to pass to the existing logger
    const rec: AdaptiveProblemRecommendation = {
      id: `session-outcome-${problem.problemId}-${Date.now()}`,
      problemId: problem.problemId,
      platformProblemId: problem.platformProblemId,
      platform: problem.platform,
      title: problem.title,
      url: problem.url,
      difficulty: problem.difficulty,
      topics: problem.topics,
      patterns: [problem.primaryPattern],
      primaryPattern: problem.primaryPattern,
      recommendationScore: problem.recommendationScore,
      priority: "MEDIUM",
      targetSkill: problem.targetSkill,
      targetPattern: problem.primaryPattern,
      reason: problem.recommendationReason,
      fullExplanation: problem.fullExplanation,
      scoreBreakdown: {
        skillGapScore: 0,
        dependencyValueScore: 0,
        goalRelevanceScore: 0,
        mistakeRelevanceScore: 0,
        revisionUrgencyScore: 0,
        difficultyFitScore: 0,
        patternValueScore: 0,
        recencyPenalty: 0,
        overexposurePenalty: 0,
        diversityBonus: 0,
        finalScore: problem.recommendationScore,
      },
      evidence: {
        targetSkillMasteryScore: 60,
        targetSkillStatus: "DEVELOPING",
        targetPattern: problem.primaryPattern,
        isPrerequisiteRepair: problem.isPrerequisiteBridge,
        recentAccuracyPct: 70,
        relatedMistakeNotesCount: 0,
        mistakeCategories: [],
        srsItemsCount: problem.isRevision ? 1 : 0,
        srsOverdueCount: 0,
        srsAverageMemoryStrength: 70,
        goalAlignmentName: "",
        activeMode: problem.mode,
        dependencyReach: 0,
      },
      estimatedEffortMinutes: problem.timeEstimate.estimatedMinutes,
      categoryLabel: problem.isPrerequisiteBridge ? "Foundation Repair" : "Pattern Practice",
      mode: problem.mode,
      generatedAt: new Date().toISOString(),
    };

    logRecommendationFeedback(rec, action);
  } catch (err) {
    console.error("[practiceSessionOutcome] Failed to dispatch recommendation feedback:", err);
  }
}

// ─── Dispatch to Learning Graph ───────────────────────────────────────────────

export function dispatchLearningGraphFeedback(
  problem: PracticeSessionProblem,
  outcome: PracticeSessionOutcome
): void {
  try {
    const nodes = getStoredSkillNodes();
    const slugLower = problem.targetSkill.toLowerCase().replace(/\s+/g, "_");
    const patternLower = problem.primaryPattern.toLowerCase().replace(/\s+/g, "_");

    const updatedNodes = nodes.map((node) => {
      const matches =
        node.slug === slugLower ||
        node.id === slugLower ||
        node.name.toLowerCase() === problem.targetSkill.toLowerCase() ||
        node.slug === patternLower;

      if (!matches) return node;

      let { masteryScore, confidenceScore, solvedProblemsCount, recentAccuracy } = node;

      switch (outcome.outcomeType) {
        case "SOLVED_INDEPENDENTLY":
          // Strong mastery evidence: boost score and confidence
          solvedProblemsCount += 1;
          masteryScore = Math.min(100, masteryScore + 4);
          confidenceScore = Math.min(100, confidenceScore + 3);
          recentAccuracy = Math.min(100, (recentAccuracy * 0.8) + 20);
          break;

        case "SOLVED_WITH_HINTS":
          // Moderate mastery evidence: smaller boost, reduce confidence slightly
          solvedProblemsCount += 1;
          masteryScore = Math.min(100, masteryScore + 2);
          confidenceScore = Math.max(0, confidenceScore - 2);
          recentAccuracy = Math.min(100, (recentAccuracy * 0.85) + 15);
          break;

        case "FAILED":
          // Weakness evidence: reduce mastery slightly, reduce confidence
          masteryScore = Math.max(0, masteryScore - 3);
          confidenceScore = Math.max(0, confidenceScore - 5);
          recentAccuracy = Math.max(0, (recentAccuracy * 0.85));
          break;

        case "TIMED_OUT":
          // Time-efficiency concern: small mastery reduction, note time issue
          masteryScore = Math.max(0, masteryScore - 1);
          confidenceScore = Math.max(0, confidenceScore - 2);
          break;

        case "SKIPPED":
          // Neutral — no change to mastery, slight confidence nudge
          confidenceScore = Math.max(0, confidenceScore - 1);
          break;

        default:
          break;
      }

      return { ...node, masteryScore, confidenceScore, solvedProblemsCount, recentAccuracy };
    });

    saveStoredSkillNodes(updatedNodes);
  } catch (err) {
    console.error("[practiceSessionOutcome] Failed to dispatch learning graph feedback:", err);
  }
}

// ─── Dispatch to SRS Revision System ─────────────────────────────────────────

export async function dispatchSRSFeedback(
  problem: PracticeSessionProblem,
  outcome: PracticeSessionOutcome
): Promise<void> {
  if (!problem.isRevision || !problem.revisionItemId) return;

  try {
    const items = await revisionStorage.getItems();
    const item = items.find((i) => i.id === problem.revisionItemId);
    if (!item) return;

    // Map outcome to SRS feedback
    let feedback: "remembered" | "forgotten" | "hard" | "easy";
    switch (outcome.outcomeType) {
      case "SOLVED_INDEPENDENTLY":
        feedback = outcome.actualSolveTimeSeconds < (problem.timeEstimate.estimatedMinutes * 60 * 0.6)
          ? "easy"
          : "remembered";
        break;
      case "SOLVED_WITH_HINTS":
        feedback = "hard";
        break;
      case "FAILED":
      case "TIMED_OUT":
        feedback = "forgotten";
        break;
      default:
        return; // Don't update SRS for skip or abandoned
    }

    const newState = computeNextRevisionState(item, feedback);
    await revisionStorage.updateItem(item.id, {
      repetitions: newState.repetitions,
      intervalDays: newState.intervalDays,
      easeFactor: newState.easeFactor,
      memoryStrength: newState.memoryStrength,
      nextDueDate: newState.nextDueDate,
      successRate: newState.successRate,
      lastRevisedAt: new Date().toISOString(),
      status: "completed",
      history: [...item.history, newState.newHistoryRecord],
    });
  } catch (err) {
    console.error("[practiceSessionOutcome] Failed to dispatch SRS feedback:", err);
  }
}

// ─── Time Estimation ──────────────────────────────────────────────────────────

const DIFFICULTY_DEFAULTS: Record<Difficulty, number> = {
  Easy: 15,
  Medium: 30,
  Hard: 50,
};

/**
 * Estimates time for a problem based on difficulty and recent session outcomes.
 * Uses historical evidence from outcomes when available.
 */
export function estimateProblemTime(
  difficulty: Difficulty,
  session?: PracticeSession | null
): TimeEstimate {
  // Try to use evidence from session outcomes of same difficulty
  if (session && session.outcomes.length >= 2) {
    const relevantOutcomes = session.outcomes.filter(
      (o) => o.outcomeType === "SOLVED_INDEPENDENTLY" || o.outcomeType === "SOLVED_WITH_HINTS"
    );

    const solveTimes = relevantOutcomes
      .map((o) => o.actualSolveTimeSeconds / 60)
      .filter((t) => t > 0);

    if (solveTimes.length >= 2) {
      const median = solveTimes.sort()[Math.floor(solveTimes.length / 2)];
      return {
        estimatedMinutes: Math.round(median),
        confidence: "MEDIUM",
        basis: "session historical median",
      };
    }
  }

  // Fallback to difficulty defaults
  return {
    estimatedMinutes: DIFFICULTY_DEFAULTS[difficulty],
    confidence: "LOW",
    basis: "difficulty default",
  };
}

// ─── Refresh Recommendation Candidates ────────────────────────────────────────

export async function refreshCandidatesForAdaptation(
  session: PracticeSession
): Promise<AdaptiveProblemRecommendation[]> {
  try {
    const recs = await compileAdaptiveRecommendations(session.config.mode as never, true);
    return recs;
  } catch (err) {
    console.error("[practiceSessionOutcome] Failed to refresh candidates:", err);
    return [];
  }
}

// ─── Build PracticeSessionProblem from Recommendation ─────────────────────────

export function buildSessionProblemFromRec(
  rec: AdaptiveProblemRecommendation,
  existingSession: PracticeSession | null = null,
  options: {
    isRevision?: boolean;
    isPrerequisiteBridge?: boolean;
    isChallenge?: boolean;
    revisionItemId?: string;
  } = {}
): PracticeSessionProblem {
  const timeEstimate = estimateProblemTime(rec.difficulty, existingSession);

  return {
    problemId: rec.problemId,
    platformProblemId: rec.platformProblemId,
    platform: rec.platform,
    title: rec.title,
    url: rec.url,
    difficulty: rec.difficulty,
    topics: rec.topics,
    primaryPattern: rec.primaryPattern,
    targetSkill: rec.targetSkill,
    recommendationReason: rec.reason,
    fullExplanation: rec.fullExplanation,
    timeEstimate,
    isRevision: options.isRevision ?? false,
    isPrerequisiteBridge: options.isPrerequisiteBridge ?? rec.evidence.isPrerequisiteRepair,
    isChallenge: options.isChallenge ?? false,
    mode: rec.mode,
    recommendationScore: rec.recommendationScore,
    revisionItemId: options.revisionItemId,
  };
}
