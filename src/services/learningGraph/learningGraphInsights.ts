import {
  SkillNode,
  GraphBottleneck,
  NextSkillRecommendation,
  GraphInsights,
  AIGraphCoachAdvice,
} from "./learningGraphTypes";

export function computeGraphInsights(
  nodes: SkillNode[],
  bottlenecks: GraphBottleneck[],
  nextRec: NextSkillRecommendation
): GraphInsights {
  const sortedByMastery = [...nodes].sort((a, b) => b.masteryScore - a.masteryScore);
  const strongest = sortedByMastery[0] || nodes[0];

  // Weakest foundational node (category: fundamentals or data_structures)
  const foundations = nodes.filter(
    (n) => n.category === "fundamentals" || n.category === "data_structures"
  );
  const weakestFound = [...foundations].sort((a, b) => a.masteryScore - b.masteryScore)[0] || nodes[0];

  // Worst bottleneck
  const topBottleneck = bottlenecks[0];

  // Decaying skill (decayFactor >= 0.20 or status: DECAYING)
  const decaying = nodes.find((n) => n.status === "DECAYING" || n.decayFactor >= 0.20);

  // Most unlocking skill (mastered node with the most dependents)
  const masteredNodes = nodes.filter((n) => n.status === "MASTERED");
  const mostUnlocking = [...masteredNodes].sort(
    (a, b) => b.dependents.length - a.dependents.length
  )[0] || strongest;

  return {
    strongestSkill: {
      name: strongest.name,
      score: strongest.masteryScore,
      explanation: `Verified at ${strongest.masteryScore}% mastery with ${strongest.solvedProblemsCount} solved problems and ${strongest.recentAccuracy}% accuracy.`,
    },
    weakestFoundation: {
      name: weakestFound.name,
      score: weakestFound.masteryScore,
      explanation: `Current foundation score is ${weakestFound.masteryScore}%. Strengthening this will stabilize downstream algorithms.`,
    },
    criticalBottleneck: topBottleneck
      ? {
          name: topBottleneck.skillName,
          blockedCount: topBottleneck.blockedSkillsCount,
          explanation: `Currently blocking progress across ${topBottleneck.blockedSkillsCount} dependent topics (${topBottleneck.blockedSkillNames.join(", ")}).`,
        }
      : {
          name: "None",
          blockedCount: 0,
          explanation: "All primary foundations are currently operating above critical bottleneck thresholds.",
        },
    nextBestSkill: {
      name: nextRec.recommendedSkillName,
      category: nextRec.category,
      explanation: nextRec.reasonWhyNow,
    },
    decayingSkill: decaying
      ? {
          name: decaying.name,
          score: decaying.masteryScore,
          overdueCards: Math.round(decaying.decayFactor * 10),
          explanation: `Memory retention has degraded to ${Math.round((1 - decaying.decayFactor) * 100)}%. Quick spaced repetition review recommended.`,
        }
      : null,
    mostUnlockingSkill: {
      name: mostUnlocking.name,
      unlockCount: mostUnlocking.dependents.length,
      explanation: `Mastery in ${mostUnlocking.name} actively powers ${mostUnlocking.dependents.length} downstream data structures and patterns.`,
    },
    goalBlockedSkill: topBottleneck
      ? {
          name: topBottleneck.blockedSkillNames[0] || "Advanced DP",
          goalName: "Technical Interview Prep",
          missingPrereq: topBottleneck.skillName,
          explanation: `Interview preparation goals in ${topBottleneck.blockedSkillNames[0] || "Advanced Algorithms"} are bottlenecked by ${topBottleneck.skillName}.`,
        }
      : null,
  };
}

export function generateAIGraphCoachAdvice(
  nodes: SkillNode[],
  bottlenecks: GraphBottleneck[],
  nextRec: NextSkillRecommendation,
  insights: GraphInsights
): AIGraphCoachAdvice {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 1. Why am I stuck?
  const whyAmIStuck = bottlenecks.length > 0
    ? `You are running into friction on complex problems because ${bottlenecks[0].skillName} (${bottlenecks[0].masteryScore}% mastery) is an under-developed prerequisite. When a foundation is shaky, multi-step problem variations break down.`
    : `Your foundations are solid. To accelerate progress, transition from single-topic practice to mixed-difficulty timed sets and mock interview simulations.`;

  // 2. What to learn before topic X
  const targetNode = nodes.find((n) => n.id === "dp_1d") || nodes[0];
  const prereqNames = targetNode.prerequisites
    .map((pId) => nodeMap.get(pId)?.name || pId);

  const whatToLearnBefore = {
    topic: targetNode.name,
    prerequisites: prereqNames,
    explanation: `Before advancing in ${targetNode.name}, ensure fluency in ${prereqNames.join(" and ")} so state transitions and memoization feel natural.`,
  };

  // 3. Why recommend this skill?
  const whyRecommendThisSkill = nextRec.reasonWhyNow;

  // 4. What can I skip?
  const masteredList = nodes
    .filter((n) => n.status === "MASTERED" && n.masteryScore >= 80)
    .map((n) => n.name)
    .slice(0, 3);

  const whatCanISkip = masteredList.length > 0
    ? masteredList.map((name) => `${name} (Verified ${nodeMap.get(name.toLowerCase())?.masteryScore || 85}%+ mastery)`)
    : ["No skills ready to skip yet. Continue progressive practice."];

  // 5. What to practice after?
  const afterNode = nodeMap.get(nextRec.recommendedSkillId) || nodes[0];
  const downstreamNames = afterNode.dependents
    .map((dId) => nodeMap.get(dId)?.name || dId)
    .slice(0, 3);

  const whatToPracticeAfter = {
    currentTopic: afterNode.name,
    nextTopics: downstreamNames.length > 0 ? downstreamNames : ["Advanced Problem Variations", "Timed Mock Contests"],
  };

  // 6. Biggest foundation lever
  const biggestFoundationLever = insights.weakestFoundation.name !== "None"
    ? `Strengthening ${insights.weakestFoundation.name} provides the highest return on investment across the graph, directly stabilizing ${insights.mostUnlockingSkill.name} and downstream algorithms.`
    : `Focus on consistent spaced repetition to prevent memory decay.`;

  return {
    whyAmIStuck,
    whatToLearnBefore,
    whyRecommendThisSkill,
    whatCanISkip,
    whatToPracticeAfter,
    biggestFoundationLever,
  };
}
