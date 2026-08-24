import {
  SkillNode,
  DependencyEdge,
  FullLearningGraphState,
  AdaptiveLearningPath,
  GRAPH_VERSION,
} from "./learningGraphTypes";
import {
  getStoredSkillNodes,
  getStoredDependencyEdges,
  saveStoredSkillNodes,
} from "./learningGraphStorage";
import {
  aggregateEvidenceForNode,
  computeNodeMastery,
} from "./learningGraphScoring";
import {
  detectGraphBottlenecks,
  computeAdaptivePath,
  computeNextSkillRecommendation,
  detectRecentlyUnlockedSkills,
} from "./learningGraphPathEngine";
import {
  computeGraphInsights,
  generateAIGraphCoachAdvice,
} from "./learningGraphInsights";

// In-memory state cache to prevent redundant re-evaluations
let cachedGraphState: FullLearningGraphState | null = null;
let lastEvaluationTimestamp = 0;
const CACHE_TTL_MS = 3000; // 3 seconds

export async function compileLearningGraphState(
  forceRefresh = false
): Promise<FullLearningGraphState> {
  const now = Date.now();
  if (!forceRefresh && cachedGraphState && now - lastEvaluationTimestamp < CACHE_TTL_MS) {
    return cachedGraphState;
  }

  const rawNodes = getStoredSkillNodes();
  const edges = getStoredDependencyEdges();
  const nodeMap = new Map(rawNodes.map((n) => [n.id, n]));

  // Evaluate evidence and compute mastery for each node
  const updatedNodes: SkillNode[] = [];

  for (const node of rawNodes) {
    const evidence = await aggregateEvidenceForNode(node);
    const prereqNodes = node.prerequisites
      .map((pId) => nodeMap.get(pId))
      .filter((p): p is SkillNode => p !== undefined);

    const scored = computeNodeMastery(node, evidence, prereqNodes);

    updatedNodes.push({
      ...node,
      masteryScore: scored.masteryScore,
      confidenceScore: scored.confidenceScore,
      status: scored.status,
      decayFactor: scored.decayFactor,
      solvedProblemsCount: evidence.solvedCount,
      recentAccuracy: evidence.recentAccuracyPct,
      evidenceCount: evidence.solvedCount + evidence.knowledgeNotesCount,
    });
  }

  // Persist updated scores
  saveStoredSkillNodes(updatedNodes);

  // Compute graph statistics
  const masteredCount = updatedNodes.filter((n) => n.status === "MASTERED").length;
  const developingCount = updatedNodes.filter((n) => n.status === "DEVELOPING").length;
  const learningCount = updatedNodes.filter((n) => n.status === "LEARNING").length;
  const discoveredCount = updatedNodes.filter((n) => n.status === "DISCOVERED").length;
  const lockedCount = updatedNodes.filter((n) => n.status === "LOCKED").length;
  const decayingCount = updatedNodes.filter((n) => n.status === "DECAYING").length;

  const totalScore = updatedNodes.reduce((sum, n) => sum + n.masteryScore, 0);
  const overallGraphMasteryPct = Math.round(totalScore / Math.max(1, updatedNodes.length));

  // Downstream intelligence
  const bottlenecks = detectGraphBottlenecks(updatedNodes, edges);
  const unlockedSkills = detectRecentlyUnlockedSkills(updatedNodes);
  const nextRecommendation = computeNextSkillRecommendation(updatedNodes, bottlenecks);
  const insights = computeGraphInsights(updatedNodes, bottlenecks, nextRecommendation);
  const coachAdvice = generateAIGraphCoachAdvice(updatedNodes, bottlenecks, nextRecommendation, insights);

  const state: FullLearningGraphState = {
    version: GRAPH_VERSION,
    nodes: updatedNodes,
    edges,
    stats: {
      totalSkills: updatedNodes.length,
      masteredCount,
      developingCount,
      learningCount,
      discoveredCount,
      lockedCount,
      decayingCount,
      overallGraphMasteryPct,
    },
    bottlenecks,
    unlockedSkills,
    nextRecommendation,
    insights,
    coachAdvice,
    lastUpdated: new Date().toISOString(),
  };

  cachedGraphState = state;
  lastEvaluationTimestamp = now;

  return state;
}

// ─── Query Helpers for Consuming Subsystems ───────────────────────────────────

export async function checkPrerequisiteGapForTopic(
  topicName: string
): Promise<{
  hasGap: boolean;
  targetSkillName: string;
  weakestPrerequisiteName?: string;
  prerequisiteMasteryScore?: number;
  recommendationMessage?: string;
}> {
  const state = await compileLearningGraphState();
  const targetLower = topicName.toLowerCase();

  const node = state.nodes.find(
    (n) =>
      n.name.toLowerCase().includes(targetLower) ||
      targetLower.includes(n.slug.toLowerCase())
  );

  if (!node || node.prerequisites.length === 0) {
    return { hasGap: false, targetSkillName: topicName };
  }

  const nodeMap = new Map(state.nodes.map((n) => [n.id, n]));
  const weakPrereqs = node.prerequisites
    .map((pId) => nodeMap.get(pId))
    .filter((p): p is SkillNode => p !== undefined && p.masteryScore < 60);

  if (weakPrereqs.length > 0) {
    const weakest = weakPrereqs.sort((a, b) => a.masteryScore - b.masteryScore)[0];
    return {
      hasGap: true,
      targetSkillName: node.name,
      weakestPrerequisiteName: weakest.name,
      prerequisiteMasteryScore: weakest.masteryScore,
      recommendationMessage: `Foundation gap detected: ${weakest.name} (${weakest.masteryScore}% mastery) is a weak prerequisite for ${node.name}. Strengthening ${weakest.name} first is recommended.`,
    };
  }

  return { hasGap: false, targetSkillName: node.name };
}

export function getAdaptiveLearningPathForTarget(
  targetSkillId: string,
  state: FullLearningGraphState
): AdaptiveLearningPath {
  return computeAdaptivePath(state.nodes, state.edges, targetSkillId);
}
