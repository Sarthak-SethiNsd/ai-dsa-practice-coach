import {
  PreparationGoal,
  PreparationRisk,
  RiskSeverity,
} from "./preparationTypes";
import { ReadinessTelemetryData } from "./preparationScoring";
import { getAcknowledgedRisks } from "./preparationStorage";

export function detectPreparationRisks(
  goal: PreparationGoal,
  telemetry: ReadinessTelemetryData,
  daysRemaining: number,
  readinessScore: number
): PreparationRisk[] {
  const risks: PreparationRisk[] = [];
  const acknowledged = new Set(getAcknowledgedRisks());
  const now = new Date().toISOString();

  // 1. Revision Backlog Risk
  if (telemetry.srsOverdueCount >= 3) {
    const isCritical = telemetry.srsOverdueCount >= 6;
    risks.push({
      id: "risk_srs_overdue_backlog",
      type: "revision_backlog",
      severity: isCritical ? "critical" : "high",
      title: "SRS Revision Backlog Accumulating",
      evidence: `${telemetry.srsOverdueCount} spaced repetition problems are currently overdue for review.`,
      impactDescription: "Active memory decay will cause forgotten pattern implementations during timed problem solving.",
      recommendedCorrection: "Dedicate 20 minutes in your next study block solely to clear overdue revision cards.",
      quickActionLabel: "Clear Revisions",
      quickActionHref: "/revision",
      acknowledged: acknowledged.has("risk_srs_overdue_backlog"),
      detectedAt: now,
    });
  }

  // 2. Deadline Proximity vs Low Readiness Risk
  if (daysRemaining <= 21 && readinessScore < 72) {
    risks.push({
      id: "risk_deadline_proximity_gap",
      type: "deadline_proximity",
      severity: daysRemaining <= 10 ? "critical" : "high",
      title: "Target Date Approaching with Unresolved Gaps",
      evidence: `${daysRemaining} days remaining until ${goal.targetDate}, while current readiness is ${readinessScore}/100.`,
      impactDescription: "High risk of facing unfamiliar algorithmic patterns or freezing under timed pressure.",
      recommendedCorrection: "Narrow focus to highest-frequency interview patterns (Two Pointers, Hash Maps, BFS, Subsets) and run daily timed simulations.",
      quickActionLabel: "View High-Impact Plan",
      quickActionHref: "/today",
      acknowledged: acknowledged.has("risk_deadline_proximity_gap"),
      detectedAt: now,
    });
  }

  // 3. Falling Consistency Risk
  const expected7dMinutes = goal.dailyMinutes * 4;
  if (telemetry.studyMinutesPast7d < expected7dMinutes && telemetry.studyStreakDays < 2) {
    risks.push({
      id: "risk_falling_consistency",
      type: "falling_consistency",
      severity: "medium",
      title: "Practice Cadence Below Target Pace",
      evidence: `Logged ${telemetry.studyMinutesPast7d}m in the past 7 days against target ${expected7dMinutes}m.`,
      impactDescription: "Intermittent practice stalls algorithmic muscle memory and slows down pattern recognition speed.",
      recommendedCorrection: "Commit to a non-negotiable minimum 15-minute daily drill to rebuild momentum.",
      quickActionLabel: "Start 15m Focus Drill",
      quickActionHref: "/study-session",
      acknowledged: acknowledged.has("risk_falling_consistency"),
      detectedAt: now,
    });
  }

  // 4. Stagnant Difficulty Risk (Too Many Easy Solves)
  if (telemetry.totalProblemsSolved >= 15 && telemetry.solvedMediumHardCount < 4) {
    risks.push({
      id: "risk_stagnant_difficulty",
      type: "stagnant_difficulty",
      severity: "medium",
      title: "Difficulty Bottleneck: Low Medium/Hard Volume",
      evidence: `Only ${telemetry.solvedMediumHardCount} of ${telemetry.totalProblemsSolved} solved problems are Medium or Hard.`,
      impactDescription: "Technical interviews and rated contests predominantly test multi-step Medium problems.",
      recommendedCorrection: "Shift daily problem recommendations to Medium difficulty with step-by-step AI coaching.",
      quickActionLabel: "Practice Mediums",
      quickActionHref: "/questions",
      acknowledged: acknowledged.has("risk_stagnant_difficulty"),
      detectedAt: now,
    });
  }

  // 5. Unaddressed Weakness Risk
  if (telemetry.weakNotesCount >= 3) {
    risks.push({
      id: "risk_unaddressed_mistake_patterns",
      type: "unaddressed_weakness",
      severity: "high",
      title: "Unresolved Mistake Patterns in Knowledge Base",
      evidence: `${telemetry.weakNotesCount} active concept gaps or mistake notes have not yet been mastered.`,
      impactDescription: "Repeated bugs (e.g. boundary conditions, wrong base cases) will recur in contest or interview settings.",
      recommendedCorrection: "Review mistake tags in Knowledge Base and implement 1 targeted problem per weak topic.",
      quickActionLabel: "Review Mistakes",
      quickActionHref: "/knowledge",
      acknowledged: acknowledged.has("risk_unaddressed_mistake_patterns"),
      detectedAt: now,
    });
  }

  // 6. Mock Interview Gap Risk (For Interview Goals)
  if (
    (goal.type === "dsa_interview" || goal.type === "technical_interview" || goal.type === "placement_prep") &&
    telemetry.interviewsCount < 2 &&
    daysRemaining <= 35
  ) {
    risks.push({
      id: "risk_interview_simulation_gap",
      type: "interview_practice_gap",
      severity: daysRemaining <= 14 ? "high" : "medium",
      title: "Insufficient Live Mock Interview Simulation",
      evidence: `Only ${telemetry.interviewsCount} mock interview(s) logged with ${daysRemaining} days until target date.`,
      impactDescription: "Lacking live think-aloud practice, time complexity articulation, and edge case clarification experience.",
      recommendedCorrection: "Schedule at least 1 mock interview session this week to benchmark real interview readiness.",
      quickActionLabel: "Start Mock Interview",
      quickActionHref: "/mock-interview",
      acknowledged: acknowledged.has("risk_interview_simulation_gap"),
      detectedAt: now,
    });
  }

  // 7. Virtual Contest Gap Risk (For CP Goals)
  if (
    (goal.type === "competitive_programming" || goal.type === "coding_assessment") &&
    telemetry.contestsCount < 2 &&
    daysRemaining <= 40
  ) {
    risks.push({
      id: "risk_contest_simulation_gap",
      type: "contest_practice_gap",
      severity: "medium",
      title: "Timed Contest Simulation Deficit",
      evidence: `Only ${telemetry.contestsCount} virtual contest(s) completed under strict timed conditions.`,
      impactDescription: "Contest penalty calculations, rapid problem triage, and time management need active benchmarking.",
      recommendedCorrection: "Run a 45-minute Virtual Contest simulation to test submission accuracy and speed.",
      quickActionLabel: "Launch Virtual Contest",
      quickActionHref: "/virtual-contest",
      acknowledged: acknowledged.has("risk_contest_simulation_gap"),
      detectedAt: now,
    });
  }

  // Sort: Critical -> High -> Medium -> Low
  const severityOrder: Record<RiskSeverity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return risks.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
}
