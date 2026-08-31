import {
  AdaptiveProblemRecommendation,
  ProblemCandidate,
  RecommendationMode,
  RecommendationEvidence,
  AIRecommendationCoachAdvice,
} from "./recommendationTypes";
import { gatherRecommendationEvidence, EvidenceAggregate } from "./recommendationEvidence";
import { scoreProblemCandidate, scoreToPrority } from "./recommendationScoring";
import { mapTopicsToPattern, mapTopicToSkillNodeId } from "./recommendationFilters";
import { generateRecommendationReason, generateAICoachAdvice } from "./recommendationExplanation";
import {
  getRecentHistoryTopics,
  getRecentHistoryPatterns,
  getDismissedProblemIds,
} from "./recommendationHistory";
import { LeetCodeService } from "@/services/leetcode/leetcodeService";
import { CodeforcesService } from "@/services/codeforces/codeforcesService";
import { Problem } from "@/services/types";

const lcService = new LeetCodeService();
const cfService = new CodeforcesService();

// Cache compiled recommendations per mode
let cachedRecs: AdaptiveProblemRecommendation[] | null = null;
let cachedMode: RecommendationMode | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 8000;

// ─── Build candidate pool from real platform datasets ─────────────────────────

async function fetchCandidatePool(mode: RecommendationMode): Promise<ProblemCandidate[]> {
  const allTopics: string[] = []; // empty = return all from dataset
  const [lcProblems, cfProblems] = await Promise.all([
    lcService.getProblems({ topics: allTopics, countPerPlatform: 100, platforms: ["leetcode"], difficulty: "Mixed" }),
    cfService.getProblems({ topics: allTopics, countPerPlatform: 100, platforms: ["codeforces"], difficulty: "Mixed" }),
  ]);

  const allProblems: Problem[] = [...lcProblems, ...cfProblems];

  return allProblems.map((p): ProblemCandidate => ({
    id: p.id,
    platformProblemId: p.platformProblemId ?? String(p.id),
    platform: p.platform,
    title: p.title,
    url: p.url ?? (p.platform === "leetcode"
      ? `https://leetcode.com/problems/${p.title.toLowerCase().replace(/\s+/g, "-")}/`
      // Codeforces: CodeforcesService.getProblems() always sets p.url (using p.id as fallback
      // in codeforcesService.ts), so this branch is unreachable for Codeforces problems.
      // The Problem type carries no separate contestId/index fields from which a specific
      // /problemset/problem/{id}/{index} URL could be constructed here.
      // If this fallback is ever reached (e.g. a future data source without url), it falls
      // back to the Codeforces problem set root — safe but non-specific.
      : `https://codeforces.com/problemset`),
    difficulty: p.difficulty,
    topics: p.topics,
    primaryPattern: mapTopicsToPattern(p.topics),
    estimatedMinutes:
      p.difficulty === "Easy" ? 15 : p.difficulty === "Medium" ? 30 : 45,
  }));
}

// ─── Apply diversity constraint ──────────────────────────────────────────────

function applyDiversityConstraint(
  scored: Array<{ candidate: ProblemCandidate; score: number }>,
  maxPerTopic = 2
): Array<{ candidate: ProblemCandidate; score: number }> {
  const topicCount: Record<string, number> = {};
  const patternCount: Record<string, number> = {};
  const result: Array<{ candidate: ProblemCandidate; score: number }> = [];

  for (const entry of scored) {
    const primaryTopic = entry.candidate.topics[0] || "General";
    const pattern = entry.candidate.primaryPattern;

    if ((topicCount[primaryTopic] ?? 0) >= maxPerTopic) continue;
    if ((patternCount[pattern] ?? 0) >= 2) continue;

    topicCount[primaryTopic] = (topicCount[primaryTopic] ?? 0) + 1;
    patternCount[pattern] = (patternCount[pattern] ?? 0) + 1;
    result.push(entry);

    if (result.length >= 12) break;
  }
  return result;
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export async function compileAdaptiveRecommendations(
  mode: RecommendationMode = "smart_practice",
  forceRefresh = false
): Promise<AdaptiveProblemRecommendation[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedRecs &&
    cachedMode === mode &&
    now - cacheTime < CACHE_TTL_MS
  ) {
    return cachedRecs;
  }

  const [candidates, evidence, dismissedIds] = await Promise.all([
    fetchCandidatePool(mode),
    gatherRecommendationEvidence(forceRefresh),
    Promise.resolve(getDismissedProblemIds()),
  ]);

  const recentTopics = getRecentHistoryTopics(15);
  const recentPatterns = getRecentHistoryPatterns(15);

  // Score every candidate
  const scored: Array<{ candidate: ProblemCandidate; score: number }> = [];

  for (const candidate of candidates) {
    const breakdown = scoreProblemCandidate(
      candidate,
      evidence,
      mode,
      recentTopics,
      recentPatterns,
      dismissedIds
    );
    if (!breakdown) continue;
    scored.push({ candidate, score: breakdown.finalScore });
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Apply diversity constraint (max 2 per topic, 2 per pattern)
  const diverse = applyDiversityConstraint(scored, 2);

  // Build full recommendation objects
  const recommendations: AdaptiveProblemRecommendation[] = diverse.map(
    ({ candidate, score }) => {
      const breakdown = scoreProblemCandidate(
        candidate,
        evidence,
        mode,
        recentTopics,
        recentPatterns,
        dismissedIds
      )!;

      const primaryTopic = candidate.topics[0] || "General";
      const nodeId = mapTopicToSkillNodeId(primaryTopic);
      const node = evidence.nodeMap.get(nodeId);

      // Build RecommendationEvidence
      const recEvidence: RecommendationEvidence = {
        targetSkillMasteryScore: node?.masteryScore ?? 60,
        targetSkillStatus: node?.status ?? "DEVELOPING",
        targetPattern: candidate.primaryPattern,
        isPrerequisiteRepair: false,
        recentAccuracyPct: node?.recentAccuracy ?? 70,
        relatedMistakeNotesCount: evidence.mistakeTopicFrequency.get(primaryTopic) ?? 0,
        mistakeCategories: [
          ...(evidence.conceptGapTopics.has(primaryTopic) ? ["Concept Gap"] : []),
          ...(evidence.wrongPatternTopics.has(primaryTopic) ? ["Wrong Approach"] : []),
          ...(evidence.edgeCaseTopics.has(primaryTopic) ? ["Edge Case"] : []),
        ],
        srsItemsCount: evidence.srsDueTopics.has(primaryTopic) ? 1 : 0,
        srsOverdueCount: evidence.srsOverdueTopics.has(primaryTopic) ? 1 : 0,
        srsAverageMemoryStrength: evidence.srsMemoryByTopic.get(primaryTopic) ?? 70,
        goalAlignmentName: evidence.activeGoalType.replace("_", " "),
        activeMode: mode,
        dependencyReach: node?.dependents?.length ?? 0,
      };

      // Check prerequisite repair
      if (node && node.prerequisites.length > 0) {
        const weakPrereqs = node.prerequisites
          .map((pId) => evidence.nodeMap.get(pId))
          .filter((p) => p !== undefined && p.masteryScore < 60);

        if (weakPrereqs.length > 0) {
          // Find if any downstream skill matches this candidate's topics
          const dependentNodes = node.dependents
            .map((dId) => evidence.nodeMap.get(dId))
            .filter((n) => n !== undefined);

          if (dependentNodes.length > 0) {
            recEvidence.isPrerequisiteRepair = true;
            recEvidence.prerequisiteForSkill = dependentNodes[0]?.name;
          }
        }
      }

      const { reason, fullExplanation, categoryLabel } = generateRecommendationReason(
        candidate.title,
        candidate.topics,
        candidate.difficulty,
        recEvidence,
        breakdown,
        evidence
      );

      return {
        id: `rec-${candidate.id}-${Date.now()}`,
        problemId: candidate.id,
        platformProblemId: candidate.platformProblemId,
        platform: candidate.platform,
        title: candidate.title,
        url: candidate.url,
        difficulty: candidate.difficulty,
        topics: candidate.topics,
        patterns: [candidate.primaryPattern],
        primaryPattern: candidate.primaryPattern,
        recommendationScore: breakdown.finalScore,
        priority: scoreToPrority(breakdown.finalScore),
        targetSkill: primaryTopic,
        targetPattern: candidate.primaryPattern,
        reason,
        fullExplanation,
        scoreBreakdown: breakdown,
        evidence: recEvidence,
        estimatedEffortMinutes: candidate.estimatedMinutes,
        categoryLabel,
        mode,
        generatedAt: new Date().toISOString(),
      };
    }
  );

  cachedRecs = recommendations;
  cachedMode = mode;
  cacheTime = Date.now();

  return recommendations;
}

export async function getAIRecommendationCoachAdvice(
  rec: AdaptiveProblemRecommendation
): Promise<AIRecommendationCoachAdvice> {
  const evidence = await gatherRecommendationEvidence();
  const rawAdvice = generateAICoachAdvice(rec, evidence);
  return rawAdvice;
}
