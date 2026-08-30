import {
  ProblemCandidate,
  RecommendationMode,
  RecommendationPriority,
  RecommendationScoreBreakdown,
} from "./recommendationTypes";
import { EvidenceAggregate } from "./recommendationEvidence";
import { mapTopicToSkillNodeId } from "./recommendationFilters";
import { Difficulty } from "@/services/types";

// ─── Mode Weight Profiles ──────────────────────────────────────────────────────
// Each weight is a fraction; components are scaled to their max before applying weight

interface ModeWeights {
  skillGap: number;
  dependencyValue: number;
  goalRelevance: number;
  mistakeRelevance: number;
  revisionUrgency: number;
  difficultyFit: number;
  patternValue: number;
  recencyPenalty: number;
  overexposurePenalty: number;
}

const MODE_WEIGHTS: Record<RecommendationMode, ModeWeights> = {
  smart_practice: {
    skillGap: 0.22, dependencyValue: 0.18, goalRelevance: 0.15,
    mistakeRelevance: 0.12, revisionUrgency: 0.10, difficultyFit: 0.10,
    patternValue: 0.08, recencyPenalty: 0.03, overexposurePenalty: 0.02,
  },
  weakness_repair: {
    skillGap: 0.35, dependencyValue: 0.20, goalRelevance: 0.10,
    mistakeRelevance: 0.15, revisionUrgency: 0.05, difficultyFit: 0.08,
    patternValue: 0.04, recencyPenalty: 0.02, overexposurePenalty: 0.01,
  },
  pattern_practice: {
    skillGap: 0.12, dependencyValue: 0.12, goalRelevance: 0.12,
    mistakeRelevance: 0.10, revisionUrgency: 0.08, difficultyFit: 0.12,
    patternValue: 0.28, recencyPenalty: 0.03, overexposurePenalty: 0.03,
  },
  revision: {
    skillGap: 0.10, dependencyValue: 0.10, goalRelevance: 0.10,
    mistakeRelevance: 0.15, revisionUrgency: 0.35, difficultyFit: 0.10,
    patternValue: 0.06, recencyPenalty: 0.02, overexposurePenalty: 0.02,
  },
  interview_prep: {
    skillGap: 0.20, dependencyValue: 0.15, goalRelevance: 0.25,
    mistakeRelevance: 0.12, revisionUrgency: 0.08, difficultyFit: 0.12,
    patternValue: 0.06, recencyPenalty: 0.01, overexposurePenalty: 0.01,
  },
  contest_prep: {
    skillGap: 0.12, dependencyValue: 0.15, goalRelevance: 0.20,
    mistakeRelevance: 0.10, revisionUrgency: 0.05, difficultyFit: 0.15,
    patternValue: 0.18, recencyPenalty: 0.03, overexposurePenalty: 0.02,
  },
  challenge: {
    skillGap: 0.05, dependencyValue: 0.15, goalRelevance: 0.15,
    mistakeRelevance: 0.08, revisionUrgency: 0.05, difficultyFit: 0.35,
    patternValue: 0.12, recencyPenalty: 0.03, overexposurePenalty: 0.02,
  },
  goal_prep: {
    skillGap: 0.18, dependencyValue: 0.12, goalRelevance: 0.30,
    mistakeRelevance: 0.12, revisionUrgency: 0.10, difficultyFit: 0.10,
    patternValue: 0.06, recencyPenalty: 0.01, overexposurePenalty: 0.01,
  },
};

// ─── Difficulty Fit Scoring ────────────────────────────────────────────────────

function scoreDifficultyFit(
  problemDifficulty: Difficulty,
  overallMasteryPct: number,
  mode: RecommendationMode,
  goalTargetDifficulty: string
): number {
  const targetDifficulty =
    mode === "challenge"
      ? "Hard"
      : mode === "revision"
      ? "Easy"
      : goalTargetDifficulty;

  if (problemDifficulty === targetDifficulty) return 10;

  // Adjacent difficulty gets partial score
  const difficultyOrder: Difficulty[] = ["Easy", "Medium", "Hard"];
  const problemIdx = difficultyOrder.indexOf(problemDifficulty);
  const targetIdx = difficultyOrder.indexOf(targetDifficulty as Difficulty);
  const distance = Math.abs(problemIdx - targetIdx);

  return distance === 1 ? 5 : 1;
}

// ─── Pattern Exposure Scoring ──────────────────────────────────────────────────

function scorePatternValue(
  pattern: string,
  recentHistoryPatterns: string[]
): number {
  const recentCount = recentHistoryPatterns.filter((p) => p === pattern).length;
  if (recentCount === 0) return 10; // Novel pattern — high value
  if (recentCount <= 2) return 6;
  if (recentCount <= 4) return 3;
  return 0; // Over-exposed
}

// ─── Diversity Overexposure Penalty ───────────────────────────────────────────

function computeOverexposurePenalty(
  topics: string[],
  recentTopics: string[]
): number {
  let penalty = 0;
  topics.forEach((t) => {
    const count = recentTopics.filter((rt) => rt === t).length;
    if (count >= 5) penalty += 15;
    else if (count >= 3) penalty += 8;
    else if (count >= 2) penalty += 3;
  });
  return Math.min(25, penalty);
}

// ─── Main Scoring Function ─────────────────────────────────────────────────────

export function scoreProblemCandidate(
  candidate: ProblemCandidate,
  evidence: EvidenceAggregate,
  mode: RecommendationMode,
  recentHistoryTopics: string[],
  recentHistoryPatterns: string[],
  dismissedProblemIds: Set<number>
): RecommendationScoreBreakdown | null {
  // Dismissed problems are ineligible
  if (dismissedProblemIds.has(candidate.id)) return null;

  const weights = MODE_WEIGHTS[mode];
  const { nodeMap, overallGraphMasteryPct } = evidence;

  // ─── Skill Gap Score (0–25) ───────────────────────────────────────────────
  let skillGapScore = 0;
  let targetNodeId = "";

  for (const topic of candidate.topics) {
    const nodeId = mapTopicToSkillNodeId(topic);
    const node = nodeMap.get(nodeId);
    if (node) {
      const gap = Math.max(0, 100 - node.masteryScore);
      if (gap > skillGapScore) {
        skillGapScore = gap;
        targetNodeId = nodeId;
      }
    }
  }
  // Normalise to 0–25
  skillGapScore = Math.round((skillGapScore / 100) * 25);

  // ─── Dependency Value Score (0–20) ────────────────────────────────────────
  let dependencyValueScore = 0;
  if (targetNodeId) {
    const node = nodeMap.get(targetNodeId);
    if (node) {
      const reach = node.dependents.length;
      dependencyValueScore = Math.min(20, Math.round(reach * 3.5));
    }
  }

  // ─── Goal Relevance Score (0–20) ──────────────────────────────────────────
  let goalRelevanceScore = 0;
  const { activeGoalType, goalPriorityTopics } = evidence;

  const goalTopicMatch = candidate.topics.some((t) =>
    goalPriorityTopics.some((gt) => gt.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(gt.toLowerCase()))
  );
  if (goalTopicMatch) goalRelevanceScore += 10;

  // Goal type match
  const interviewGoals = ["dsa_interview", "technical_interview", "placement_preparation", "faang_interview"];
  const contestGoals = ["competitive_programming", "cp_rating_improvement"];

  if (mode === "interview_prep" && interviewGoals.includes(activeGoalType)) {
    goalRelevanceScore += 10;
  } else if (mode === "contest_prep" && contestGoals.includes(activeGoalType)) {
    goalRelevanceScore += 10;
  } else if (!interviewGoals.includes(activeGoalType) && !contestGoals.includes(activeGoalType)) {
    goalRelevanceScore += 5; // General DSA mastery — always somewhat relevant
  }

  goalRelevanceScore = Math.min(20, goalRelevanceScore);

  // ─── Mistake Relevance Score (0–15) ───────────────────────────────────────
  let mistakeRelevanceScore = 0;
  const { mistakeTopicFrequency, conceptGapTopics, wrongPatternTopics } = evidence;

  candidate.topics.forEach((t) => {
    const mistakeCount = mistakeTopicFrequency.get(t) ?? 0;
    mistakeRelevanceScore += Math.min(6, mistakeCount * 2);
    if (conceptGapTopics.has(t)) mistakeRelevanceScore += 4;
    if (wrongPatternTopics.has(t)) mistakeRelevanceScore += 3;
  });

  mistakeRelevanceScore = Math.min(15, mistakeRelevanceScore);

  // ─── SRS Revision Urgency Score (0–10) ────────────────────────────────────
  let revisionUrgencyScore = 0;
  const { srsOverdueTopics, srsDueTopics, srsMemoryByTopic } = evidence;

  candidate.topics.forEach((t) => {
    if (srsOverdueTopics.has(t)) revisionUrgencyScore += 8;
    else if (srsDueTopics.has(t)) revisionUrgencyScore += 4;
    const mem = srsMemoryByTopic.get(t);
    if (mem !== undefined && mem < 50) revisionUrgencyScore += 2;
  });
  revisionUrgencyScore = Math.min(10, revisionUrgencyScore);

  // ─── Difficulty Fit Score (0–10) ──────────────────────────────────────────
  const difficultyFitScore = scoreDifficultyFit(
    candidate.difficulty,
    overallGraphMasteryPct,
    mode,
    evidence.goalTargetDifficulty
  );

  // ─── Pattern Value Score (0–10) ───────────────────────────────────────────
  const patternValueScore = scorePatternValue(candidate.primaryPattern, recentHistoryPatterns);

  // ─── Recency Penalty (−25 to 0) ───────────────────────────────────────────
  let recencyPenalty = 0;
  candidate.topics.forEach((t) => {
    if (evidence.recentlySolvedTopics.has(t)) recencyPenalty += 10;
  });
  recencyPenalty = Math.min(25, recencyPenalty);

  // ─── Overexposure Penalty (−25 to 0) ──────────────────────────────────────
  const overexposurePenalty = computeOverexposurePenalty(
    candidate.topics,
    recentHistoryTopics
  );

  // ─── Diversity Bonus (0–5) ────────────────────────────────────────────────
  const recentPatternCount = recentHistoryPatterns.filter(
    (p) => p === candidate.primaryPattern
  ).length;
  const diversityBonus = recentPatternCount === 0 ? 5 : 0;

  // ─── Raw weighted sum ─────────────────────────────────────────────────────
  const raw =
    skillGapScore * (weights.skillGap / 0.22) +
    dependencyValueScore * (weights.dependencyValue / 0.18) +
    goalRelevanceScore * (weights.goalRelevance / 0.15) +
    mistakeRelevanceScore * (weights.mistakeRelevance / 0.12) +
    revisionUrgencyScore * (weights.revisionUrgency / 0.10) +
    difficultyFitScore * (weights.difficultyFit / 0.10) +
    patternValueScore * (weights.patternValue / 0.08) +
    diversityBonus -
    recencyPenalty * (weights.recencyPenalty / 0.03) -
    overexposurePenalty * (weights.overexposurePenalty / 0.02);

  const finalScore = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    skillGapScore,
    dependencyValueScore,
    goalRelevanceScore,
    mistakeRelevanceScore,
    revisionUrgencyScore,
    difficultyFitScore,
    patternValueScore,
    recencyPenalty: -recencyPenalty,
    overexposurePenalty: -overexposurePenalty,
    diversityBonus,
    finalScore,
  };
}

export function scoreToPrority(score: number): RecommendationPriority {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}
