import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";
import { revisionStorage } from "@/services/revision/revisionStorage";
import {
  getPreparationGoals,
  getActiveGoalId,
} from "@/services/preparation/preparationStorage";
import { PreparationGoal } from "@/services/preparation/preparationTypes";
import { compileLearningGraphState } from "@/services/learningGraph/learningGraphEngine";
import { SkillNode } from "@/services/learningGraph/learningGraphTypes";
import { mapTopicToSkillNodeId } from "./recommendationFilters";

export interface EvidenceAggregate {
  // Learning graph evidence
  graphNodes: SkillNode[];
  nodeMap: Map<string, SkillNode>;
  overallGraphMasteryPct: number;

  // SRS evidence
  srsOverdueTopics: Set<string>;
  srsDueTopics: Set<string>;
  srsMemoryByTopic: Map<string, number>; // topic → avg memory strength

  // Knowledge Base mistake evidence
  mistakeTopicFrequency: Map<string, number>; // topic → mistake count
  conceptGapTopics: Set<string>;
  wrongPatternTopics: Set<string>;
  edgeCaseTopics: Set<string>;

  // Goal evidence
  activeGoalType: string;
  goalPriorityTopics: string[];
  goalTargetDifficulty: string;

  // Recency evidence
  recentlySolvedTopics: Set<string>; // topics with recent completion in SRS
}

let cachedEvidence: EvidenceAggregate | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5000;

export async function gatherRecommendationEvidence(
  forceRefresh = false
): Promise<EvidenceAggregate> {
  const now = Date.now();
  if (!forceRefresh && cachedEvidence && now - cacheTime < CACHE_TTL_MS) {
    return cachedEvidence;
  }

  // 1. Learning Graph
  let graphNodes: SkillNode[] = [];
  let nodeMap = new Map<string, SkillNode>();
  let overallGraphMasteryPct = 60;

  try {
    const graphState = await compileLearningGraphState();
    graphNodes = graphState.nodes;
    nodeMap = new Map(graphNodes.map((n) => [n.id, n]));
    overallGraphMasteryPct = graphState.stats.overallGraphMasteryPct;
  } catch (err) {
    console.error("[recommendationEvidence] Graph error:", err);
  }

  // 2. SRS Evidence
  const srsOverdueTopics = new Set<string>();
  const srsDueTopics = new Set<string>();
  const srsMemoryByTopic = new Map<string, number>();

  try {
    const srsItems = await revisionStorage.getItems();
    srsItems.forEach((item) => {
      item.topics.forEach((t) => {
        if (item.status === "overdue") srsOverdueTopics.add(t);
        if (item.status === "due") srsDueTopics.add(t);

        const current = srsMemoryByTopic.get(t);
        if (current === undefined) {
          srsMemoryByTopic.set(t, item.memoryStrength);
        } else {
          srsMemoryByTopic.set(t, Math.round((current + item.memoryStrength) / 2));
        }
      });
    });
  } catch (err) {
    console.error("[recommendationEvidence] SRS error:", err);
  }

  // 3. Knowledge Base mistakes
  const mistakeTopicFrequency = new Map<string, number>();
  const conceptGapTopics = new Set<string>();
  const wrongPatternTopics = new Set<string>();
  const edgeCaseTopics = new Set<string>();

  try {
    const notes = await knowledgeStorage.getNotes();
    notes.forEach((note) => {
      if (
        note.mistakeCategory ||
        note.revisionStatus === "revisit" ||
        note.revisionStatus === "forgotten" ||
        note.tags.includes("Concept Gap")
      ) {
        const t = note.topic;
        mistakeTopicFrequency.set(t, (mistakeTopicFrequency.get(t) ?? 0) + 1);

        if (note.mistakeCategory === "wrong_approach" || note.tags.includes("Wrong Pattern")) {
          wrongPatternTopics.add(t);
        }
        if (
          note.mistakeCategory === "edge_case_missed" ||
          note.tags.includes("Concept Gap")
        ) {
          conceptGapTopics.add(t);
        }
        if (note.tags.includes("Edge Case")) {
          edgeCaseTopics.add(t);
        }
      }
    });
  } catch (err) {
    console.error("[recommendationEvidence] Knowledge Base error:", err);
  }

  // 4. Preparation Goal
  let activeGoalType = "dsa_interview";
  let goalPriorityTopics: string[] = [];
  let goalTargetDifficulty = "Medium";

  try {
    const goals: PreparationGoal[] = getPreparationGoals();
    const activeId = getActiveGoalId();
    const activeGoal = goals.find((g: PreparationGoal) => g.id === activeId) ?? goals[0];

    if (activeGoal) {
      activeGoalType = activeGoal.type;
      goalPriorityTopics = activeGoal.priorityTopics ?? [];
      goalTargetDifficulty =
        activeGoal.currentSkillLevel === "beginner"
          ? "Easy"
          : activeGoal.currentSkillLevel === "advanced"
          ? "Hard"
          : "Medium";
    }
  } catch (err) {
    console.error("[recommendationEvidence] Preparation goal error:", err);
  }

  // 5. Recently solved (from SRS high-memory items)
  const recentlySolvedTopics = new Set<string>();
  try {
    const srsItems = await revisionStorage.getItems();
    srsItems
      .filter((i) => i.memoryStrength > 80 && i.status !== "overdue")
      .forEach((i) => i.topics.forEach((t) => recentlySolvedTopics.add(t)));
  } catch (err) {
    console.error("[recommendationEvidence] Recency error:", err);
  }

  cachedEvidence = {
    graphNodes,
    nodeMap,
    overallGraphMasteryPct,
    srsOverdueTopics,
    srsDueTopics,
    srsMemoryByTopic,
    mistakeTopicFrequency,
    conceptGapTopics,
    wrongPatternTopics,
    edgeCaseTopics,
    activeGoalType,
    goalPriorityTopics,
    goalTargetDifficulty,
    recentlySolvedTopics,
  };

  cacheTime = Date.now();
  return cachedEvidence;
}
