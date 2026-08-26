import {
  PracticeSessionConfig,
  PracticeSessionProblem,
  PracticeSessionMode,
} from "./practiceTypes";
import { compileAdaptiveRecommendations } from "@/services/recommendations/recommendationEngine";
import { AdaptiveProblemRecommendation, RecommendationMode } from "@/services/recommendations/recommendationTypes";
import { compileLearningGraphState } from "@/services/learningGraph/learningGraphEngine";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { getActiveGoal } from "@/services/preparation/preparationStorage";
import { buildSessionProblemFromRec, estimateProblemTime } from "./practiceSessionOutcome";

// ─── Mode → Recommendation Mode Mapping ──────────────────────────────────────

function toRecMode(mode: PracticeSessionMode): RecommendationMode {
  switch (mode) {
    case "weakness_repair":  return "weakness_repair";
    case "pattern_mastery":  return "pattern_practice";
    case "revision":         return "revision";
    case "interview_prep":   return "interview_prep";
    case "contest_prep":     return "contest_prep";
    case "goal_prep":        return "goal_prep";
    case "challenge":        return "challenge";
    default:                 return "smart_practice";
  }
}

// ─── Session Plan ─────────────────────────────────────────────────────────────

export interface SessionPlanResult {
  problems: PracticeSessionProblem[];
  goalTitle: string;
  planSummary: string;
}

// ─── Diversity Constraint ─────────────────────────────────────────────────────

/**
 * Enforces topic and pattern diversity unless mode is explicitly targeted.
 */
function applyDiversityConstraint(
  problems: PracticeSessionProblem[],
  mode: PracticeSessionMode,
  maxPerTopic = 2
): PracticeSessionProblem[] {
  // Don't force diversity for targeted modes
  if (
    mode === "weakness_repair" ||
    mode === "pattern_mastery" ||
    mode === "revision"
  ) {
    return problems;
  }

  const topicCount: Record<string, number> = {};
  const patternCount: Record<string, number> = {};
  const result: PracticeSessionProblem[] = [];

  for (const p of problems) {
    const topic = p.targetSkill;
    const pattern = p.primaryPattern;
    if ((topicCount[topic] ?? 0) >= maxPerTopic) continue;
    if ((patternCount[pattern] ?? 0) >= 2) continue;
    topicCount[topic] = (topicCount[topic] ?? 0) + 1;
    patternCount[pattern] = (patternCount[pattern] ?? 0) + 1;
    result.push(p);
  }
  return result;
}

// ─── Time-Aware Problem Selection ────────────────────────────────────────────

function selectProblemsForBudget(
  candidates: PracticeSessionProblem[],
  budgetMinutes: number,
  maxProblems: number,
  includeBuffer = true
): PracticeSessionProblem[] {
  const selected: PracticeSessionProblem[] = [];
  // Apply a 10% scheduling buffer to prevent overruns
  const effectiveBudget = includeBuffer ? budgetMinutes * 0.9 : budgetMinutes;
  let usedMinutes = 0;

  for (const p of candidates) {
    if (selected.length >= maxProblems) break;
    const est = p.timeEstimate.estimatedMinutes;
    if (usedMinutes + est <= effectiveBudget) {
      selected.push(p);
      usedMinutes += est;
    }
  }

  return selected;
}

// ─── Prerequisite Bridge Insertion ───────────────────────────────────────────

async function findPrerequisiteBridgeProblems(
  targetTopics: string[],
  recs: AdaptiveProblemRecommendation[]
): Promise<PracticeSessionProblem[]> {
  try {
    const graphState = await compileLearningGraphState();
    const bridges: PracticeSessionProblem[] = [];

    for (const topic of targetTopics) {
      const topicLower = topic.toLowerCase();
      const node = graphState.nodes.find(
        (n) => n.name.toLowerCase().includes(topicLower) || n.slug === topicLower
      );
      if (!node || node.prerequisites.length === 0) continue;

      const weakPrereqs = node.prerequisites
        .map((pId) => graphState.nodes.find((n) => n.id === pId))
        .filter((p) => p !== undefined && p.masteryScore < 60);

      for (const prereq of weakPrereqs.slice(0, 1)) {
        // Find a recommendation targeting the prerequisite
        const bridgeRec = recs.find((r) =>
          r.topics.some((t) =>
            t.toLowerCase().includes(prereq!.slug) ||
            prereq!.name.toLowerCase().includes(t.toLowerCase())
          ) && r.difficulty !== "Hard"
        );

        if (bridgeRec) {
          bridges.push(
            buildSessionProblemFromRec(bridgeRec, null, { isPrerequisiteBridge: true })
          );
        }
      }
    }

    return bridges;
  } catch {
    return [];
  }
}

// ─── SRS Revision Problems ────────────────────────────────────────────────────

async function getSRSRevisionProblems(
  maxCount: number,
  recs: AdaptiveProblemRecommendation[]
): Promise<PracticeSessionProblem[]> {
  try {
    const items = await revisionStorage.getItems();
    const dueItems = items
      .filter((i) => i.status === "due" || i.status === "overdue")
      .slice(0, maxCount);

    return dueItems.map((item): PracticeSessionProblem => {
      // Try to match with a real recommendation for richer metadata
      const matchingRec = recs.find((r) => r.problemId === item.problemId);
      if (matchingRec) {
        return buildSessionProblemFromRec(matchingRec, null, {
          isRevision: true,
          revisionItemId: item.id,
        });
      }

      // Fallback: build from SRS item directly
      const timeEst = estimateProblemTime(item.difficulty);
      return {
        problemId: typeof item.problemId === "number" ? item.problemId : parseInt(String(item.problemId), 10),
        platformProblemId: String(item.problemId),
        platform: item.platform,
        title: item.problemTitle,
        url: item.url ?? "",
        difficulty: item.difficulty,
        topics: item.topics,
        primaryPattern: item.topics[0] ?? "Review",
        targetSkill: item.topics[0] ?? "Review",
        recommendationReason: `Due for spaced repetition review (${item.status}). Memory strength: ${item.memoryStrength}%.`,
        fullExplanation: `This problem was last revised ${item.lastRevisedAt ? "on " + item.lastRevisedAt : "a while ago"}. Reviewing it now reinforces retention.`,
        timeEstimate: timeEst,
        isRevision: true,
        isPrerequisiteBridge: false,
        isChallenge: false,
        mode: "revision",
        recommendationScore: item.memoryStrength,
        revisionItemId: item.id,
      };
    });
  } catch {
    return [];
  }
}

// ─── Main Session Planner ─────────────────────────────────────────────────────

export async function buildSessionPlan(
  config: PracticeSessionConfig
): Promise<SessionPlanResult> {
  const recMode = toRecMode(config.mode);

  // 1. Get active goal
  const activeGoal = getActiveGoal();
  const goalTitle = config.activeGoalId ? activeGoal.name : "General DSA Practice";

  // 2. Fetch recommendation candidates
  const recs = await compileAdaptiveRecommendations(recMode, false);

  // 3. Filter by preferred platform and difficulty
  let filtered = recs.filter((r) => {
    if (config.preferredPlatform !== "any" && r.platform !== config.preferredPlatform) return false;
    if (
      config.difficultyPreference !== "Mixed" &&
      config.difficultyPreference !== "Adaptive" &&
      r.difficulty !== config.difficultyPreference
    ) return false;
    if (config.targetSkill && !r.topics.some((t) => t.toLowerCase().includes(config.targetSkill!.toLowerCase()))) {
      return false;
    }
    if (config.targetPattern && r.primaryPattern.toLowerCase() !== config.targetPattern.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Fall back to all recs if filtering removed everything
  if (filtered.length < 2) filtered = recs;

  // 4. Build session problems pool
  const sessionProblems: PracticeSessionProblem[] = filtered
    .slice(0, 15)
    .map((r) => buildSessionProblemFromRec(r, null));

  // 5. Insert prerequisite bridges if mode is weakness repair
  let bridges: PracticeSessionProblem[] = [];
  if (config.mode === "weakness_repair" || config.mode === "smart_practice") {
    const targetTopics = sessionProblems.slice(0, 3).map((p) => p.targetSkill);
    bridges = await findPrerequisiteBridgeProblems(targetTopics, recs);
  }

  // 6. Get SRS revision problems if allowed
  let revisionProblems: PracticeSessionProblem[] = [];
  if (config.allowRevisionProblems && config.mode !== "challenge" && config.mode !== "contest_prep") {
    const maxRevision = config.durationMinutes >= 60 ? 1 : 0;
    revisionProblems = await getSRSRevisionProblems(maxRevision, recs);
  }

  // 7. Apply goal-specific adjustments
  const goalAlignedProblems = [...sessionProblems];
  if (config.activeGoalId && activeGoal) {
    const priorityTopics = activeGoal.priorityTopics;
    goalAlignedProblems.sort((a, b) => {
      const aMatch = priorityTopics.some((t) => a.targetSkill.includes(t)) ? 1 : 0;
      const bMatch = priorityTopics.some((t) => b.targetSkill.includes(t)) ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  // 8. Sequence: Prerequisites first → Core practice → SRS revision last
  const ordered: PracticeSessionProblem[] = [
    ...bridges.slice(0, 1),
    ...goalAlignedProblems.slice(0, config.targetProblemCount + 2),
    ...revisionProblems,
  ];

  // 9. Apply diversity constraint
  const diverse = applyDiversityConstraint(ordered, config.mode);

  // 10. Trim to time budget
  const final = selectProblemsForBudget(diverse, config.durationMinutes, config.targetProblemCount);

  // Ensure we have at least 1 problem
  if (final.length === 0 && sessionProblems.length > 0) {
    final.push(sessionProblems[0]);
  }

  // 11. Build plan summary
  const totalEst = final.reduce((s, p) => s + p.timeEstimate.estimatedMinutes, 0);
  const modes = [...new Set(final.map((p) => p.isRevision ? "SRS" : p.isPrerequisiteBridge ? "Bridge" : "Practice"))];
  const planSummary = `${final.length} problem${final.length !== 1 ? "s" : ""} planned (~${totalEst} min): ${modes.join(" + ")}`;

  return { problems: final, goalTitle, planSummary };
}
