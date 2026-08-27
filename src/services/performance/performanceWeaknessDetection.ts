import {
  PersistentWeakness,
  ImprovementSignal,
  WeaknessSeverity,
  WeaknessPersistence,
  SkillPerformanceTrend,
  LongitudinalEvent,
} from "./performanceTypes";
import { AggregatedDataSet } from "./performanceAggregation";
import { getStoredSkillNodes } from "@/services/learningGraph/learningGraphStorage";

export function detectPersistentWeaknesses(
  dataset: AggregatedDataSet,
  skillTrends: SkillPerformanceTrend[]
): PersistentWeakness[] {
  const current = dataset.currentPeriodEvents;
  const nodes = getStoredSkillNodes();
  const weaknesses: PersistentWeakness[] = [];

  // Group events by primary skill
  const bySkill: Record<string, LongitudinalEvent[]> = {};
  current.forEach((e) => {
    const topic = e.topics[0] || e.primaryPattern || "General";
    if (!bySkill[topic]) bySkill[topic] = [];
    bySkill[topic].push(e);
  });

  for (const [skillName, events] of Object.entries(bySkill)) {
    const attempts = events.length;
    const failures = events.filter((e) => e.outcome === "FAILED" || e.outcome === "TIMED_OUT").length;
    const hints = events.reduce((sum, e) => sum + (e.hintCount || 0), 0);
    const independent = events.filter((e) => e.outcome === "SOLVED_INDEPENDENTLY").length;
    const indepRate = attempts > 0 ? Math.round((independent / attempts) * 100) : 0;

    const solveTimes = events
      .filter((e) => e.solveTimeSeconds && e.solveTimeSeconds > 0)
      .map((e) => e.solveTimeSeconds!);
    const avgTime = solveTimes.length > 0
      ? Math.round(solveTimes.reduce((sum, t) => sum + t, 0) / solveTimes.length)
      : 0;

    // Check affected subsystems
    const affectedSystemsSet = new Set<string>();
    events.forEach((e) => {
      if (e.source === "PRACTICE_SESSION") affectedSystemsSet.add("Practice Sessions");
      if (e.source === "VIRTUAL_CONTEST") affectedSystemsSet.add("Virtual Contests");
      if (e.source === "MOCK_INTERVIEW") affectedSystemsSet.add("Mock Interviews");
      if (e.source === "SRS_REVISION") affectedSystemsSet.add("SRS Revision");
    });
    const affectedSystems = Array.from(affectedSystemsSet);

    // Find node and graph status
    const node = nodes.find(
      (n) => n.name.toLowerCase() === skillName.toLowerCase() || n.slug.toLowerCase() === skillName.toLowerCase()
    );
    const trend = skillTrends.find((t) => t.skillName.toLowerCase() === skillName.toLowerCase());

    // Evidence checks: require at least 2 negative signals (fails, heavy hints, or bottleneck)
    const isHighFailure = failures >= 2;
    const isHeavyHints = hints >= attempts * 1.2 && attempts >= 2;
    const isLowIndependence = indepRate <= 40 && attempts >= 3;
    const isBottleneck = trend?.prerequisiteHealth === "BOTTLENECK";

    if (isHighFailure || isHeavyHints || isLowIndependence || isBottleneck) {
      // Determine Severity
      let severity: WeaknessSeverity = "LOW";
      if (failures >= 3 || (failures >= 2 && affectedSystems.length >= 2) || (indepRate <= 25 && attempts >= 4)) {
        severity = "CRITICAL";
      } else if (failures >= 2 || (isHeavyHints && isLowIndependence)) {
        severity = "HIGH";
      } else if (attempts >= 2) {
        severity = "MEDIUM";
      }

      // Determine Persistence
      let persistence: WeaknessPersistence = "NEW";
      const distinctDates = [...new Set(events.map((e) => e.date))];
      if (distinctDates.length >= 3 && failures >= 2) {
        persistence = "PERSISTENT";
      } else if (distinctDates.length >= 2 || affectedSystems.length >= 2) {
        persistence = "RECURRING";
      } else if (trend?.classification === "IMPROVING") {
        persistence = "IMPROVING";
      } else {
        persistence = "NEW";
      }

      // First and last dates
      const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const firstDetectedDate = sortedEvents[0]?.date || new Date().toISOString().split("T")[0];
      const lastObservedDate = sortedEvents[sortedEvents.length - 1]?.date || new Date().toISOString().split("T")[0];

      // Priority score (0-100)
      let priorityScore = 50;
      if (severity === "CRITICAL") priorityScore += 35;
      else if (severity === "HIGH") priorityScore += 25;
      else if (severity === "MEDIUM") priorityScore += 10;

      if (persistence === "PERSISTENT") priorityScore += 15;
      else if (persistence === "RECURRING") priorityScore += 10;
      priorityScore = Math.min(100, priorityScore);

      // Intervention
      let recommendedIntervention = `Schedule a targeted Weakness Repair session focusing on foundational ${skillName} patterns.`;
      if (isBottleneck) {
        recommendedIntervention = `Repair prerequisite dependencies for ${skillName} before continuing standard problem drills.`;
      } else if (severity === "CRITICAL") {
        recommendedIntervention = `Dedicate 3 consecutive practice sessions to ${skillName} using Easy and Medium prerequisite bridges.`;
      }

      // Evidence text
      const evidenceParts: string[] = [];
      if (failures > 0) evidenceParts.push(`${failures} failure${failures > 1 ? "s" : ""}`);
      if (hints > 0) evidenceParts.push(`${hints} hint${hints > 1 ? "s" : ""} requested`);
      evidenceParts.push(`${indepRate}% independent solve rate across ${attempts} attempt${attempts > 1 ? "s" : ""}`);

      const evidenceText = `Observed in ${affectedSystems.join(", ") || "Practice"}: ${evidenceParts.join(", ")}.`;

      weaknesses.push({
        id: `pw_${skillName.toLowerCase().replace(/\s+/g, "_")}`,
        skillOrPattern: skillName,
        category: node?.category ?? "Algorithmic Paradigms",
        severity,
        persistence,
        failCount: failures,
        hintCount: hints,
        attemptCount: attempts,
        averageSolveTimeSeconds: avgTime,
        firstDetectedDate,
        lastObservedDate,
        affectedSystems,
        evidenceText,
        recommendedIntervention,
        priorityScore,
      });
    }
  }

  // Sort by priority score descending
  weaknesses.sort((a, b) => b.priorityScore - a.priorityScore);
  return weaknesses;
}

// ─── Improvement Signal Detection ─────────────────────────────────────────────

export function detectImprovementSignals(
  dataset: AggregatedDataSet,
  skillTrends: SkillPerformanceTrend[]
): ImprovementSignal[] {
  const signals: ImprovementSignal[] = [];

  for (const trend of skillTrends) {
    if (trend.classification === "IMPROVING" && trend.totalAttempts >= 3) {
      signals.push({
        id: `sig_imp_${trend.skillId}`,
        skillOrPattern: trend.skillName,
        category: trend.category,
        metric: "Independent Solve Rate",
        magnitude: `+${Math.max(10, trend.masteryDelta * 2)}%`,
        priorValue: `${Math.max(0, trend.independentSolveRate - Math.max(10, trend.masteryDelta * 2))}%`,
        currentValue: `${trend.independentSolveRate}%`,
        sampleSize: trend.totalAttempts,
        evidence: trend.evidenceSummary,
        celebrationMessage: `Great momentum! Your independent solving in ${trend.skillName} has noticeably strengthened.`,
      });
    } else if (trend.classification === "STRONG" && trend.totalAttempts >= 3) {
      signals.push({
        id: `sig_str_${trend.skillId}`,
        skillOrPattern: trend.skillName,
        category: trend.category,
        metric: "Skill Mastery",
        magnitude: `${trend.currentMasteryScore}% Mastery`,
        priorValue: "Developing",
        currentValue: `${trend.independentSolveRate}% Independent`,
        sampleSize: trend.totalAttempts,
        evidence: `Consistent high independent solve rate (${trend.independentSolveRate}%) with zero recent failures.`,
        celebrationMessage: `${trend.skillName} is a verified strength in your toolkit. Ready for challenge problems.`,
      });
    }
  }

  return signals;
}
