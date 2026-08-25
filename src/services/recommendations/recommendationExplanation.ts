import { AdaptiveProblemRecommendation, RecommendationScoreBreakdown, RecommendationEvidence, RecommendationMode } from "./recommendationTypes";
import { EvidenceAggregate } from "./recommendationEvidence";
import { mapTopicToSkillNodeId } from "./recommendationFilters";

export function generateRecommendationReason(
  title: string,
  topics: string[],
  difficulty: string,
  evidence: RecommendationEvidence,
  breakdown: RecommendationScoreBreakdown,
  evidenceAggregate: EvidenceAggregate
): { reason: string; fullExplanation: string; categoryLabel: string } {
  const { nodeMap, mistakeTopicFrequency, srsOverdueTopics } = evidenceAggregate;
  const primaryTopic = topics[0] || "General DSA";

  // Get node context
  const nodeId = mapTopicToSkillNodeId(primaryTopic);
  const node = nodeMap.get(nodeId);
  const mastery = node?.masteryScore ?? evidence.targetSkillMasteryScore;
  const status = node?.status ?? evidence.targetSkillStatus;

  // Determine the most compelling reason
  let primaryReason = "";
  let categoryLabel = "Targeted Practice";

  if (evidence.isPrerequisiteRepair && evidence.prerequisiteForSkill) {
    primaryReason = `${primaryTopic} (${mastery}% mastery) is a weak prerequisite blocking your progress in ${evidence.prerequisiteForSkill}`;
    categoryLabel = "Foundation Repair";
  } else if (breakdown.revisionUrgencyScore >= 7 && srsOverdueTopics.has(primaryTopic)) {
    primaryReason = `${primaryTopic} has overdue spaced repetition items — refreshing this skill will prevent knowledge decay`;
    categoryLabel = "Revision Priority";
  } else if (breakdown.mistakeRelevanceScore >= 10) {
    const mistakeCount = mistakeTopicFrequency.get(primaryTopic) ?? 0;
    primaryReason = `You have ${mistakeCount} recorded mistake${mistakeCount !== 1 ? "s" : ""} in ${primaryTopic} — targeted practice here will close this gap`;
    categoryLabel = "Mistake Repair";
  } else if (breakdown.skillGapScore >= 15) {
    primaryReason = `${primaryTopic} is currently ${status.toLowerCase()} at ${mastery}% mastery — this is a high-impact foundational gap`;
    categoryLabel = "Skill Gap";
  } else if (breakdown.patternValueScore >= 8) {
    primaryReason = `${evidence.targetPattern} is an under-practiced pattern in your recent history`;
    categoryLabel = "Pattern Practice";
  } else if (breakdown.goalRelevanceScore >= 15) {
    primaryReason = `This problem is directly aligned to your ${evidence.goalAlignmentName} preparation goal`;
    categoryLabel = "Goal Alignment";
  } else if (breakdown.dependencyValueScore >= 12) {
    const reach = evidence.dependencyReach;
    primaryReason = `Strengthening ${primaryTopic} unlocks ${reach} downstream algorithms in the skill dependency graph`;
    categoryLabel = "Dependency Unlock";
  } else {
    primaryReason = `${difficulty} ${primaryTopic} problem matches your current skill trajectory and available practice time`;
    categoryLabel = "Targeted Practice";
  }

  const reason = `${primaryReason}.`;

  // Build multi-sentence explanation
  const parts: string[] = [reason];

  if (mastery > 0) {
    parts.push(
      `Current ${primaryTopic} mastery: ${mastery}% (${status.toLowerCase()}) with ${evidence.recentAccuracyPct}% recent solve accuracy.`
    );
  }

  if (evidence.relatedMistakeNotesCount > 0) {
    const cats = evidence.mistakeCategories.slice(0, 2).join(", ");
    parts.push(
      `Knowledge Base shows ${evidence.relatedMistakeNotesCount} related mistake note${evidence.relatedMistakeNotesCount !== 1 ? "s" : ""} in categories: ${cats || "general patterns"}.`
    );
  }

  if (breakdown.difficultyFitScore >= 8) {
    parts.push(`${difficulty} difficulty fits your current performance profile.`);
  }

  if (breakdown.diversityBonus > 0) {
    parts.push(`This is a fresh pattern — bonus awarded for topic diversity.`);
  }

  const fullExplanation = parts.join(" ");

  return { reason, fullExplanation, categoryLabel };
}

export function generateAICoachAdvice(
  rec: AdaptiveProblemRecommendation,
  evidenceAggregate: EvidenceAggregate
): {
  whyThisProblem: string;
  whyBetterThanAlternative: string;
  whatSkillAmIPracticing: string;
  whyThisDifficulty: string;
  shouldSolveNowOrReviseFirst: string;
  whatToSolveAfter: { nextTopics: string[]; explanation: string };
  whyRepeatingThisPattern: string;
} {
  const { nodeMap, srsOverdueTopics } = evidenceAggregate;
  const nodeId = mapTopicToSkillNodeId(rec.targetSkill);
  const node = nodeMap.get(nodeId);
  const downstreamNames = (node?.dependents ?? [])
    .map((dId) => nodeMap.get(dId)?.name ?? dId)
    .slice(0, 3);

  const hasOverdueRevision = Array.from(srsOverdueTopics).length > 0;

  return {
    whyThisProblem: `${rec.reason} ${rec.fullExplanation}`,
    whyBetterThanAlternative:
      `This problem targets ${rec.targetSkill} (${rec.evidence.targetSkillMasteryScore}% mastery) which has the highest composite score of Impact × Weakness × Dependency Reach × Goal Relevance among available candidates. ` +
      `It also introduces a ${rec.evidence.isPrerequisiteRepair ? "prerequisite repair" : "targeted practice"} opportunity that directly affects your dependency graph progression.`,
    whatSkillAmIPracticing:
      `You are primarily practicing the ${rec.targetPattern} pattern, which maps to the ${rec.targetSkill} skill node in the dependency graph. ` +
      `This skill has ${node?.dependents?.length ?? 0} downstream topics that become more accessible as your mastery improves.`,
    whyThisDifficulty:
      `${rec.difficulty} difficulty was selected because your overall graph mastery is ${evidenceAggregate.overallGraphMasteryPct}% and your active goal targets ${rec.evidence.goalAlignmentName} preparation. ` +
      `${rec.difficulty === "Easy" ? "Starting with approachable problems reinforces pattern fundamentals." : rec.difficulty === "Hard" ? "Hard problems stretch beyond your current comfort level, accelerating growth." : "Medium problems offer the right balance of challenge and achievability for skill consolidation."}`,
    shouldSolveNowOrReviseFirst:
      hasOverdueRevision
        ? `You have ${Array.from(srsOverdueTopics).length} overdue SRS topic${Array.from(srsOverdueTopics).length !== 1 ? "s" : ""}. Consider a 5-minute revision of ${Array.from(srsOverdueTopics)[0]} before tackling this new problem.`
        : `No overdue revision items detected. Solving this problem now is the optimal use of your practice time.`,
    whatToSolveAfter: {
      nextTopics:
        downstreamNames.length > 0
          ? downstreamNames
          : ["Review Knowledge Base notes after solving", "Try a timed version for interview simulation"],
      explanation:
        downstreamNames.length > 0
          ? `After mastering ${rec.targetSkill}, your next logical progression includes ${downstreamNames.join(", ")} — which depend on this foundation.`
          : `After solving, record your approach insights in the Knowledge Base and add to SRS for retention.`,
    },
    whyRepeatingThisPattern:
      rec.evidence.relatedMistakeNotesCount > 0
        ? `You have ${rec.evidence.relatedMistakeNotesCount} recorded mistakes related to ${rec.targetPattern}. Deliberate repetition in this pattern area is the fastest route to eliminating systematic errors.`
        : `Pattern repetition is intentional when the skill mastery score is below 75% — consistent exposure at appropriate difficulty accelerates pattern internalization.`,
  };
}
