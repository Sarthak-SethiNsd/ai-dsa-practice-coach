import { SkillNode, MasteryStatus } from "./learningGraphTypes";
import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { studyStorage } from "@/services/study/studyStorage";
import { getContestHistory } from "@/services/contest/virtualContestStorage";
import { interviewStorage } from "@/services/interview/interviewStorage";

export interface SkillEvidenceAggregate {
  solvedCount: number;
  totalAttempts: number;
  accuracyPct: number;
  recentAccuracyPct: number;
  mediumHardCount: number;
  knowledgeNotesCount: number;
  conceptGapsCount: number;
  srsOverdueCount: number;
  srsAverageMemoryStrength: number;
  contestSolvesCount: number;
  interviewScore: number;
}

export async function aggregateEvidenceForNode(
  node: SkillNode
): Promise<SkillEvidenceAggregate> {
  const nodeTopicLower = node.name.toLowerCase();
  const nodeSlug = node.slug.toLowerCase();

  let solvedCount = 0;
  let totalAttempts = 0;
  let mediumHardCount = 0;
  let knowledgeNotesCount = 0;
  let conceptGapsCount = 0;
  let srsOverdueCount = 0;
  let srsAverageMemoryStrength = 80;
  let contestSolvesCount = 0;
  let interviewScore = 70;

  // 1. Knowledge Base
  try {
    const notes = await knowledgeStorage.getNotes();
    const matchingNotes = notes.filter(
      (n) =>
        n.topic.toLowerCase().includes(nodeSlug) ||
        nodeTopicLower.includes(n.topic.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase() === nodeSlug) ||
        (n.patternName && n.patternName.toLowerCase().includes(nodeSlug))
    );
    knowledgeNotesCount = matchingNotes.length;
    conceptGapsCount = matchingNotes.filter(
      (n) => n.revisionStatus === "in_progress" || n.revisionStatus === "forgotten"
    ).length;
  } catch (err) {
    console.error("[learningGraphScoring] Error loading knowledge notes:", err);
  }

  // 2. Spaced Repetition (SRS)
  try {
    const srsItems = await revisionStorage.getItems();
    const matchingSRS = srsItems.filter((i) =>
      i.topics.some(
        (t) =>
          t.toLowerCase().includes(nodeSlug) ||
          nodeTopicLower.includes(t.toLowerCase())
      )
    );

    if (matchingSRS.length > 0) {
      srsOverdueCount = matchingSRS.filter((i) => i.status === "overdue").length;
      const totalMem = matchingSRS.reduce((sum, i) => sum + i.memoryStrength, 0);
      srsAverageMemoryStrength = Math.round(totalMem / matchingSRS.length);
    }
  } catch (err) {
    console.error("[learningGraphScoring] Error loading SRS items:", err);
  }

  // 3. Study Sessions & Tasks
  try {
    const sessions = await studyStorage.getSessions();
    sessions.forEach((s) => {
      s.tasks.forEach((t) => {
        const matches =
          t.title.toLowerCase().includes(nodeSlug) ||
          nodeTopicLower.includes(t.title.toLowerCase());
        if (matches) {
          totalAttempts++;
          if (t.status === "solved") {
            solvedCount++;
            if (t.difficulty === "Medium" || t.difficulty === "Hard") {
              mediumHardCount++;
            }
          }
        }
      });
    });
  } catch (err) {
    console.error("[learningGraphScoring] Error loading study tasks:", err);
  }

  // 4. Virtual Contests
  try {
    const contests = getContestHistory();
    contests.forEach((c) => {
      const hasWeakness = c.mainWeaknesses.some((w) =>
        w.toLowerCase().includes(nodeSlug)
      );
      const hasStrength = c.mainStrengths.some((s) =>
        s.toLowerCase().includes(nodeSlug)
      );
      if (hasStrength) contestSolvesCount++;
      if (hasWeakness) conceptGapsCount++;
    });
  } catch (err) {
    console.error("[learningGraphScoring] Error loading contest history:", err);
  }

  // 5. Mock Interviews
  try {
    const interviews = await interviewStorage.getHistory();
    const relevantInterviews = interviews.filter(
      (i) =>
        i.interviewType.toLowerCase().includes(nodeSlug) ||
        nodeTopicLower.includes(i.interviewType.toLowerCase())
    );
    if (relevantInterviews.length > 0) {
      interviewScore = Math.round(
        relevantInterviews.reduce((sum, i) => sum + i.overallScore, 0) /
          relevantInterviews.length
      );
    }
  } catch (err) {
    console.error("[learningGraphScoring] Error loading interview history:", err);
  }

  // Fallback defaults if no activity yet
  const effectiveSolved = Math.max(solvedCount, node.solvedProblemsCount);
  const effectiveAttempts = Math.max(totalAttempts, effectiveSolved);
  const accuracyPct = effectiveAttempts > 0 ? Math.round((effectiveSolved / effectiveAttempts) * 100) : node.recentAccuracy;

  return {
    solvedCount: effectiveSolved,
    totalAttempts: effectiveAttempts,
    accuracyPct,
    recentAccuracyPct: node.recentAccuracy,
    mediumHardCount: Math.max(mediumHardCount, Math.round(effectiveSolved * 0.6)),
    knowledgeNotesCount,
    conceptGapsCount,
    srsOverdueCount,
    srsAverageMemoryStrength,
    contestSolvesCount,
    interviewScore,
  };
}

export function computeNodeMastery(
  node: SkillNode,
  evidence: SkillEvidenceAggregate,
  prerequisiteNodes: SkillNode[]
): {
  masteryScore: number;
  confidenceScore: number;
  status: MasteryStatus;
  decayFactor: number;
} {
  // 1. Accuracy Component (30%)
  const accuracy = Math.min(100, Math.max(0, evidence.accuracyPct));

  // 2. Recent Performance Component (25%)
  const recentPerf = Math.min(100, Math.max(0, evidence.recentAccuracyPct));

  // 3. Difficulty Progression Component (20%)
  // Reward solving Medium and Hard problems
  const medHardRatio = evidence.solvedCount > 0 ? evidence.mediumHardCount / evidence.solvedCount : 0.3;
  const diffProgression = Math.min(
    100,
    Math.round(medHardRatio * 70 + Math.min(30, evidence.mediumHardCount * 4))
  );

  // 4. Retention & SRS Component (15%)
  const overduePenalty = evidence.srsOverdueCount * 15;
  const retention = Math.max(0, Math.min(100, evidence.srsAverageMemoryStrength - overduePenalty));

  // 5. Independent Problem Solving & Interview/Contest (10%)
  const gapPenalty = evidence.conceptGapsCount * 8;
  const independence = Math.max(0, Math.min(100, evidence.interviewScore - gapPenalty));

  // Raw weighted mastery
  const rawMastery = Math.round(
    accuracy * 0.30 +
    recentPerf * 0.25 +
    diffProgression * 0.20 +
    retention * 0.15 +
    independence * 0.10
  );

  const masteryScore = Math.max(0, Math.min(100, rawMastery));

  // Confidence is proportional to evidence count
  const totalEvidencePoints =
    evidence.solvedCount * 2 +
    evidence.knowledgeNotesCount +
    evidence.contestSolvesCount * 3;
  const confidenceScore = Math.min(100, Math.max(20, totalEvidencePoints * 5));

  // Decay Factor: High if SRS is overdue or memory strength is degraded
  let decayFactor = 0.05;
  if (evidence.srsOverdueCount > 0) {
    decayFactor = Math.min(1.0, 0.15 + evidence.srsOverdueCount * 0.12);
  } else if (evidence.srsAverageMemoryStrength < 50) {
    decayFactor = 0.25;
  }

  // Prerequisite Satisfaction Check
  const avgPrereqMastery =
    prerequisiteNodes.length > 0
      ? prerequisiteNodes.reduce((sum, p) => sum + p.masteryScore, 0) / prerequisiteNodes.length
      : 100;

  // Assign Mastery State
  let status: MasteryStatus = "DISCOVERED";

  if (prerequisiteNodes.length > 0 && avgPrereqMastery < 45 && masteryScore < 40) {
    status = "LOCKED";
  } else if (decayFactor >= 0.30 && masteryScore >= 60) {
    status = "DECAYING";
  } else if (masteryScore >= 75 && evidence.solvedCount >= 6) {
    status = "MASTERED";
  } else if (masteryScore >= 50 && evidence.solvedCount >= 3) {
    status = "DEVELOPING";
  } else if (evidence.solvedCount > 0 || evidence.knowledgeNotesCount > 0) {
    status = "LEARNING";
  } else {
    status = "DISCOVERED";
  }

  return {
    masteryScore,
    confidenceScore,
    status,
    decayFactor,
  };
}
