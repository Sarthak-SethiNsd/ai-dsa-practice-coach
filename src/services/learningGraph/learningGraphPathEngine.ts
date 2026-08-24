import {
  SkillNode,
  DependencyEdge,
  GraphBottleneck,
  AdaptiveLearningPath,
  PathStep,
  NextSkillRecommendation,
  RecentlyUnlockedSkill,
} from "./learningGraphTypes";
import { Difficulty } from "@/services/types";

// ─── Topological & Adaptive Path Finder ───────────────────────────────────────

export function computeAdaptivePath(
  nodes: SkillNode[],
  edges: DependencyEdge[],
  targetSkillId: string
): AdaptiveLearningPath {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const targetNode = nodeMap.get(targetSkillId);

  if (!targetNode) {
    const fallback = nodes[0];
    return {
      targetSkillId: fallback.id,
      targetSkillName: fallback.name,
      targetDifficulty: fallback.difficulty,
      totalSteps: 1,
      activeStepsCount: 1,
      skippedMasteredCount: 0,
      estimatedHours: 1.5,
      pathSteps: [
        {
          stepNumber: 1,
          node: fallback,
          isSkipped: false,
          estimatedMinutes: 60,
          keyLearningObjectives: ["Understand fundamental core principles"],
        },
      ],
      keyMilestones: ["Master foundational concepts"],
      generatedAt: new Date().toISOString(),
    };
  }

  // Find all recursive prerequisites using DFS
  const requiredNodeIds = new Set<string>();

  function collectPrereqs(currentId: string) {
    const curr = nodeMap.get(currentId);
    if (!curr) return;
    for (const prereqId of curr.prerequisites) {
      if (!requiredNodeIds.has(prereqId)) {
        requiredNodeIds.add(prereqId);
        collectPrereqs(prereqId);
      }
    }
  }

  collectPrereqs(targetSkillId);
  requiredNodeIds.add(targetSkillId);

  // Topological sorting for required nodes
  const visited = new Set<string>();
  const sortedIds: string[] = [];

  function topoSort(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const curr = nodeMap.get(id);
    if (curr) {
      for (const pId of curr.prerequisites) {
        if (requiredNodeIds.has(pId)) {
          topoSort(pId);
        }
      }
    }
    sortedIds.push(id);
  }

  Array.from(requiredNodeIds).forEach((id) => topoSort(id));

  // Build adaptive path steps
  let stepNumber = 1;
  let activeStepsCount = 0;
  let skippedMasteredCount = 0;
  let totalEstimatedMinutes = 0;

  const pathSteps: PathStep[] = sortedIds.map((id) => {
    const node = nodeMap.get(id)!;
    const isTarget = node.id === targetSkillId;
    const isMastered = node.status === "MASTERED" && node.masteryScore >= 75 && !isTarget;

    if (isMastered) {
      skippedMasteredCount++;
      return {
        stepNumber: stepNumber++,
        node,
        isSkipped: true,
        skipReason: `Mastered (${node.masteryScore}% score with verified problem accuracy). Skipping prerequisite foundation.`,
        estimatedMinutes: 0,
        keyLearningObjectives: [`Verified mastery in ${node.name}`],
      };
    }

    activeStepsCount++;
    const estMins = node.difficulty === "Easy" ? 45 : node.difficulty === "Medium" ? 75 : 120;
    totalEstimatedMinutes += estMins;

    return {
      stepNumber: stepNumber++,
      node,
      isSkipped: false,
      estimatedMinutes: estMins,
      keyLearningObjectives: [
        `Master core ${node.patterns[0] || node.name} pattern implementation`,
        `Solve 2 targeted ${node.difficulty} problems`,
        `Record pattern key takeaways into Knowledge Base`,
      ],
      recommendedStarterProblem: {
        id: node.targetProblemIds[0] || 1,
        title: `${node.name} Standard Problem`,
        difficulty: node.difficulty,
        platform: "leetcode",
        url: `https://leetcode.com/problems/${node.slug}/`,
      },
    };
  });

  const keyMilestones = [
    `Complete prerequisite foundations (${skippedMasteredCount} already mastered)`,
    `Strengthen ${activeStepsCount} active intermediate skills`,
    `Achieve 80%+ mastery benchmark on ${targetNode.name}`,
  ];

  return {
    targetSkillId: targetNode.id,
    targetSkillName: targetNode.name,
    targetDifficulty: targetNode.difficulty,
    totalSteps: pathSteps.length,
    activeStepsCount,
    skippedMasteredCount,
    estimatedHours: Number((totalEstimatedMinutes / 60).toFixed(1)),
    pathSteps,
    keyMilestones,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Bottleneck Detection Engine ──────────────────────────────────────────────

export function detectGraphBottlenecks(
  nodes: SkillNode[],
  edges: DependencyEdge[]
): GraphBottleneck[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const bottlenecks: GraphBottleneck[] = [];

  // Build adjacency list for forward dependents
  const dependentsMap = new Map<string, string[]>();
  nodes.forEach((n) => dependentsMap.set(n.id, []));

  edges.forEach((e) => {
    if (dependentsMap.has(e.sourceId)) {
      dependentsMap.get(e.sourceId)!.push(e.targetId);
    }
  });

  // Calculate transitive downstream reach for each node
  function getTransitiveDependents(startId: string): Set<string> {
    const reachable = new Set<string>();
    const stack = [startId];
    while (stack.length > 0) {
      const curr = stack.pop()!;
      const neighbors = dependentsMap.get(curr) || [];
      for (const nxt of neighbors) {
        if (!reachable.has(nxt) && nxt !== startId) {
          reachable.add(nxt);
          stack.push(nxt);
        }
      }
    }
    return reachable;
  }

  nodes.forEach((node) => {
    // Only nodes that are not fully mastered can be bottlenecks
    if (node.masteryScore < 72) {
      const downstream = getTransitiveDependents(node.id);
      const reach = downstream.size;

      if (reach >= 2) {
        const weaknessScore = Math.max(1, Math.round((100 - node.masteryScore) / 10));
        const impactScore = Math.min(10, Math.max(4, Math.round(reach * 1.5)));
        const goalRelevance = 8; // high default interview relevance
        const compositeRank = impactScore * weaknessScore * reach * goalRelevance;

        const blockedNames = Array.from(downstream)
          .map((id) => nodeMap.get(id)?.name || id)
          .slice(0, 4);

        bottlenecks.push({
          skillId: node.id,
          skillName: node.name,
          category: node.category,
          masteryScore: node.masteryScore,
          impactScore,
          weaknessScore,
          dependencyReach: reach,
          goalRelevance,
          compositeRank,
          blockedSkillsCount: reach,
          blockedSkillNames: blockedNames,
          evidenceSummary: `Current mastery is ${node.masteryScore}% with ${node.evidenceCount} logged practice evidence points.`,
          recommendedAction: `Reinforce ${node.name} with 2 foundational problems before tackling downstream ${blockedNames[0] || "skills"}.`,
          actionHref: `/questions?topic=${encodeURIComponent(node.name)}`,
        });
      }
    }
  });

  return bottlenecks.sort((a, b) => b.compositeRank - a.compositeRank);
}

// ─── "What should I learn next?" Engine ────────────────────────────────────────

export function computeNextSkillRecommendation(
  nodes: SkillNode[],
  bottlenecks: GraphBottleneck[]
): NextSkillRecommendation {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // If a top bottleneck exists with reachable prerequisites, recommend fixing the bottleneck first!
  if (bottlenecks.length > 0) {
    const top = bottlenecks[0];
    const topNode = nodeMap.get(top.skillId);

    if (topNode) {
      const missing = topNode.prerequisites
        .map((pId) => nodeMap.get(pId))
        .filter((p): p is SkillNode => p !== undefined && p.masteryScore < 60)
        .map((p) => ({ id: p.id, name: p.name, masteryScore: p.masteryScore }));

      return {
        recommendedSkillId: topNode.id,
        recommendedSkillName: topNode.name,
        category: topNode.category,
        difficulty: topNode.difficulty,
        reasonWhyNow: `High-leverage bottleneck blocking ${top.blockedSkillsCount} downstream topics (${top.blockedSkillNames.join(", ")}). Strengthening this foundation unlocks rapid multi-topic momentum.`,
        missingPrerequisites: missing,
        supportingEvidence: [
          `Current mastery is ${topNode.masteryScore}% (${topNode.status}).`,
          `Blocks progress in ${top.blockedSkillsCount} advanced algorithms.`,
          `Recent solution accuracy is ${topNode.recentAccuracy}%.`,
        ],
        actionPlan: `Complete 1 standard practice problem and review pattern notes in Knowledge Base.`,
        targetHref: `/questions?topic=${encodeURIComponent(topNode.name)}`,
      };
    }
  }

  // Otherwise find first unlocked learning skill
  const unlocked = nodes.find(
    (n) => (n.status === "LEARNING" || n.status === "DISCOVERED") && n.masteryScore < 75
  ) || nodes[0];

  return {
    recommendedSkillId: unlocked.id,
    recommendedSkillName: unlocked.name,
    category: unlocked.category,
    difficulty: unlocked.difficulty,
    reasonWhyNow: `Prerequisites satisfied. Expanding into ${unlocked.name} builds essential algorithmic breadth for technical interviews.`,
    missingPrerequisites: [],
    supportingEvidence: [
      `All ${unlocked.prerequisites.length} prerequisite topics verified.`,
      `Optimal next step in your progressive skill hierarchy.`,
    ],
    actionPlan: `Solve 1 beginner-friendly ${unlocked.difficulty} problem to initialize pattern discovery.`,
    targetHref: `/questions?topic=${encodeURIComponent(unlocked.name)}`,
  };
}

// ─── Recently Unlocked Skills Engine ──────────────────────────────────────────

export function detectRecentlyUnlockedSkills(
  nodes: SkillNode[]
): RecentlyUnlockedSkill[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const unlocked: RecentlyUnlockedSkill[] = [];

  nodes.forEach((node) => {
    if (node.status === "DISCOVERED" || node.status === "LEARNING") {
      const satisfied = node.prerequisites
        .map((pId) => nodeMap.get(pId))
        .filter((p): p is SkillNode => p !== undefined && p.masteryScore >= 60)
        .map((p) => `${p.name} (${p.masteryScore}%)`);

      if (node.prerequisites.length > 0 && satisfied.length === node.prerequisites.length) {
        unlocked.push({
          skillId: node.id,
          skillName: node.name,
          unlockedAt: "Recently satisfied",
          satisfiedPrerequisites: satisfied,
          whatItEnables: node.dependents.map((dId) => nodeMap.get(dId)?.name || dId).slice(0, 3),
          recommendedFirstProblemTitle: `${node.name} Core Pattern Problem`,
          targetHref: `/questions?topic=${encodeURIComponent(node.name)}`,
        });
      }
    }
  });

  return unlocked.slice(0, 5);
}
