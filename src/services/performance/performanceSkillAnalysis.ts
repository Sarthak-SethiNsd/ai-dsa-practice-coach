import {
  SkillPerformanceTrend,
  SkillTrendClass,
  LongitudinalEvent,
} from "./performanceTypes";
import { AggregatedDataSet } from "./performanceAggregation";
import { getStoredSkillNodes } from "@/services/learningGraph/learningGraphStorage";
import { SkillNode } from "@/services/learningGraph/learningGraphTypes";

export function analyzeSkillTrends(
  dataset: AggregatedDataSet,
  canonicalNodes?: SkillNode[]
): SkillPerformanceTrend[] {
  const nodes = canonicalNodes ?? getStoredSkillNodes();
  const current = dataset.currentPeriodEvents;
  const previous = dataset.previousPeriodEvents;

  // Group events by primary topic / skill
  const currentBySkill = groupEventsBySkill(current);
  const previousBySkill = groupEventsBySkill(previous);

  const results: SkillPerformanceTrend[] = [];

  // Iterate over all skills that have activity or are in the learning graph
  const allSkillNames = new Set([
    ...nodes.map((n) => n.name),
    ...Object.keys(currentBySkill),
  ]);

  for (const skillName of allSkillNames) {
    const node = nodes.find(
      (n) => n.name.toLowerCase() === skillName.toLowerCase() || n.slug.toLowerCase() === skillName.toLowerCase()
    );

    const curEvents = currentBySkill[skillName] ?? [];
    const prevEvents = previousBySkill[skillName] ?? [];

    const totalAttempts = curEvents.length;
    const solvedCount = curEvents.filter(
      (e) => e.outcome === "SOLVED_INDEPENDENTLY" || e.outcome === "SOLVED_WITH_HINTS" || e.outcome === "COMPLETED"
    ).length;
    const independentSolves = curEvents.filter((e) => e.outcome === "SOLVED_INDEPENDENTLY").length;
    const hintCount = curEvents.reduce((sum, e) => sum + (e.hintCount || 0), 0);

    const solveRate = totalAttempts > 0 ? Math.round((solvedCount / totalAttempts) * 100) : 0;
    const independentSolveRate = totalAttempts > 0 ? Math.round((independentSolves / totalAttempts) * 100) : 0;

    // Previous period metrics
    const prevAttempts = prevEvents.length;
    const prevIndependent = prevEvents.filter((e) => e.outcome === "SOLVED_INDEPENDENTLY").length;
    const prevIndepRate = prevAttempts > 0 ? Math.round((prevIndependent / prevAttempts) * 100) : null;

    // Time calculations
    const solveTimes = curEvents
      .filter((e) => e.solveTimeSeconds && e.solveTimeSeconds > 0)
      .map((e) => e.solveTimeSeconds!);

    const prevSolveTimes = prevEvents
      .filter((e) => e.solveTimeSeconds && e.solveTimeSeconds > 0)
      .map((e) => e.solveTimeSeconds!);

    const averageSolveTimeSeconds = solveTimes.length > 0
      ? Math.round(solveTimes.reduce((sum, t) => sum + t, 0) / solveTimes.length)
      : 0;

    const medianSolveTimeSeconds = computeMedian(solveTimes);
    const prevMedianTime = computeMedian(prevSolveTimes);

    // Current mastery & mastery delta
    const currentMasteryScore = node?.masteryScore ?? 60;
    // Estimate mastery delta from independent solve improvement and volume
    let masteryDelta = 0;
    if (prevIndepRate !== null && totalAttempts >= 3) {
      masteryDelta = Math.round((independentSolveRate - prevIndepRate) * 0.4);
    } else if (totalAttempts >= 3 && independentSolveRate >= 75) {
      masteryDelta = 5;
    } else if (totalAttempts >= 3 && independentSolveRate <= 30) {
      masteryDelta = -5;
    }

    // Recent activity days ago
    const lastEvent = curEvents[curEvents.length - 1];
    let recentActivityDaysAgo = 999;
    if (lastEvent) {
      const diffMs = Date.now() - new Date(lastEvent.timestamp).getTime();
      recentActivityDaysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Prerequisite health
    let prerequisiteHealth: SkillPerformanceTrend["prerequisiteHealth"] = "HEALTHY";
    if (node && node.prerequisites.length > 0) {
      const prereqNodes = node.prerequisites
        .map((pId) => nodes.find((n) => n.id === pId))
        .filter(Boolean);
      const weakPrereqs = prereqNodes.filter((p) => (p?.masteryScore ?? 60) < 55);
      if (weakPrereqs.length > 0) {
        prerequisiteHealth = "BOTTLENECK";
      }
    }

    // ─── Classification & Stagnation Detection ──────────────────────────────
    let classification: SkillTrendClass = "INSUFFICIENT_DATA";
    let isStagnant = false;
    let stagnationReason: string | undefined = undefined;
    let suggestedIntervention: string | undefined = undefined;

    if (totalAttempts < 3) {
      classification = "INSUFFICIENT_DATA";
    } else {
      // Check for Stagnation: significant practice (>= 5 attempts) but flat / poor performance
      const isHighPractice = totalAttempts >= 5;
      const isIndepFlatOrLow = independentSolveRate <= 55 && (prevIndepRate === null || Math.abs(independentSolveRate - prevIndepRate) <= 5);
      const isTimeFlatOrSlow = prevMedianTime > 0 && medianSolveTimeSeconds >= prevMedianTime * 0.95;

      if (isHighPractice && isIndepFlatOrLow && isTimeFlatOrSlow) {
        isStagnant = true;
        classification = "STAGNANT";
        stagnationReason = `${skillName} has had ${totalAttempts} practice attempts, but independent solve rate remains flat (${independentSolveRate}%) and solve time has not improved.`;
        suggestedIntervention = prerequisiteHealth === "BOTTLENECK"
          ? `Repair foundational prerequisites for ${skillName} before resuming standard practice.`
          : `Switch intervention: attempt pattern-focused drills with worked examples rather than isolated problem attempts.`;
      } else if (prevIndepRate !== null && independentSolveRate >= prevIndepRate + 15) {
        classification = "IMPROVING";
      } else if (prevIndepRate !== null && independentSolveRate <= prevIndepRate - 15) {
        classification = "DECLINING";
      } else if (independentSolveRate >= 75 && currentMasteryScore >= 75) {
        classification = "STRONG";
      } else if (independentSolveRate <= 40 || (hintCount >= totalAttempts * 1.5)) {
        classification = "WEAK";
      } else {
        classification = "STABLE";
      }
    }

    // Evidence summary
    let evidenceSummary = "";
    if (classification === "INSUFFICIENT_DATA") {
      evidenceSummary = `Insufficient practice history (${totalAttempts} attempt${totalAttempts === 1 ? "" : "s"}) to establish a reliable skill trend.`;
    } else if (classification === "IMPROVING") {
      const timeDeltaStr = prevMedianTime > 0 && medianSolveTimeSeconds < prevMedianTime
        ? ` while median solve time decreased by ${Math.round(((prevMedianTime - medianSolveTimeSeconds) / prevMedianTime) * 100)}%`
        : "";
      evidenceSummary = `${skillName} is improving: independent solve rate increased from ${prevIndepRate ?? 0}% to ${independentSolveRate}% over ${totalAttempts} attempts${timeDeltaStr}.`;
    } else if (classification === "STAGNANT") {
      evidenceSummary = stagnationReason ?? `${skillName} shows plateaued performance despite repeated practice.`;
    } else if (classification === "WEAK") {
      evidenceSummary = `${skillName} requires reinforcement: low independent solve rate (${independentSolveRate}%) and ${hintCount} hints requested across ${totalAttempts} attempts.`;
    } else if (classification === "STRONG") {
      evidenceSummary = `Strong proficiency in ${skillName}: ${independentSolveRate}% independent solve rate and healthy ${currentMasteryScore}% mastery.`;
    } else {
      evidenceSummary = `${skillName} performance is steady with ${independentSolveRate}% independent solves across ${totalAttempts} attempts.`;
    }

    // Only include skills that have either attempts > 0 or a canonical node in graph
    if (totalAttempts > 0 || (node && node.masteryScore > 0)) {
      results.push({
        skillId: node?.id ?? skillName.toLowerCase().replace(/\s+/g, "_"),
        skillName: node?.name ?? skillName,
        category: node?.category ?? "General",
        totalAttempts,
        solvedCount,
        independentSolves,
        solveRate,
        independentSolveRate,
        hintCount,
        averageSolveTimeSeconds,
        medianSolveTimeSeconds,
        currentMasteryScore,
        masteryDelta,
        classification,
        isStagnant,
        stagnationReason,
        suggestedIntervention,
        prerequisiteHealth,
        recentActivityDaysAgo,
        evidenceSummary,
      });
    }
  }

  // Sort: active skills with issues or strong improvements first
  results.sort((a, b) => {
    // Stagnant and weak first, then improving, then by attempt count
    const rank = (s: SkillPerformanceTrend) => {
      if (s.isStagnant) return 100 + s.totalAttempts;
      if (s.classification === "WEAK") return 80 + s.totalAttempts;
      if (s.classification === "IMPROVING") return 60 + s.totalAttempts;
      if (s.classification === "DECLINING") return 50 + s.totalAttempts;
      return s.totalAttempts;
    };
    return rank(b) - rank(a);
  });

  return results;
}

function groupEventsBySkill(events: LongitudinalEvent[]): Record<string, LongitudinalEvent[]> {
  const map: Record<string, LongitudinalEvent[]> = {};
  for (const e of events) {
    const topics = e.topics.length > 0 ? e.topics : [e.primaryPattern || "General"];
    for (const t of topics) {
      if (!map[t]) map[t] = [];
      map[t].push(e);
    }
  }
  return map;
}

function computeMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
