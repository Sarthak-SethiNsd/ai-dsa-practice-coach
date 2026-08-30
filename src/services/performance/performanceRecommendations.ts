import {
  LearningVelocity,
  StrategicRecommendation,
  PerformanceTimelineEvent,
  PerformanceMetricsSnapshot,
  SkillPerformanceTrend,
  PatternPerformanceTrend,
  DifficultyProgressionTrend,
  TimeEfficiencyAnalysis,
  PersistentWeakness,
  RecommendationPriority,
  SubsystemFeedbackSignals,
} from "./performanceTypes";
import { AggregatedDataSet } from "./performanceAggregation";
import { PreparationGoal } from "@/services/preparation/preparationTypes";

// ─── Learning Velocity Calculator ─────────────────────────────────────────────

export function calculateLearningVelocity(
  metrics: PerformanceMetricsSnapshot,
  skillTrends: SkillPerformanceTrend[],
  difficultyTrend: DifficultyProgressionTrend,
  timeTrend: TimeEfficiencyAnalysis
): LearningVelocity {
  const { totalAttempts, totalSolved } = metrics;

  if (totalAttempts < 3) {
    return {
      overallVelocityScore: 0,
      tier: "Insufficient Activity",
      components: {
        masteryVelocity: { name: "Mastery Progression", score: 0, weight: 0.35, contribution: 0, explanation: "Insufficient attempt history." },
        difficultyVelocity: { name: "Difficulty Advancement", score: 0, weight: 0.25, contribution: 0, explanation: "Insufficient attempts across difficulty tiers." },
        independenceVelocity: { name: "Independence Gain", score: 0, weight: 0.25, contribution: 0, explanation: "Insufficient independent solve evidence." },
        timeEfficiencyVelocity: { name: "Speed & Fluency", score: 0, weight: 0.15, contribution: 0, explanation: "Insufficient solve timing samples." },
      },
      explanation: "Complete at least 3 practice attempts to measure your Learning Velocity.",
      velocityTrend: "INSUFFICIENT_DATA",
    };
  }

  // 1. Mastery Progression (0-100): skills improving and mastery deltas
  const improvingSkills = skillTrends.filter((s) => s.classification === "IMPROVING").length;
  const strongSkills = skillTrends.filter((s) => s.classification === "STRONG").length;
  const stagnantSkills = skillTrends.filter((s) => s.isStagnant).length;

  let masteryScore = Math.min(100, Math.round(improvingSkills * 25 + strongSkills * 15 + (totalSolved / totalAttempts) * 40));
  if (stagnantSkills > 0) masteryScore = Math.max(10, masteryScore - stagnantSkills * 15);

  // 2. Difficulty Advancement (0-100): handling Medium and Hard tiers
  const mediumSolved = difficultyTrend.byDifficulty.Medium.solvedCount;
  const hardSolved = difficultyTrend.byDifficulty.Hard.solvedCount;
  const hardAttempts = difficultyTrend.byDifficulty.Hard.attempts;

  let difficultyScore = 40;
  if (mediumSolved >= 3) difficultyScore += 30;
  if (hardSolved >= 1) difficultyScore += 20;
  if (hardAttempts >= 2 && difficultyTrend.byDifficulty.Hard.independentSolveRate >= 50) difficultyScore += 10;
  difficultyScore = Math.min(100, difficultyScore);

  // 3. Independence Gain (0-100): independent solve rate vs hint dependency
  const indepRate = metrics.independentSolveRate.currentValue;
  const hintRate = metrics.hintAssistedRate.currentValue;
  const independenceScore = Math.min(100, Math.max(0, Math.round(indepRate * 0.9 - hintRate * 0.2 + 10)));

  // 4. Speed & Fluency (0-100)
  let speedScore = 60;
  if (timeTrend.overallTrend === "FAST_IMPROVEMENT") speedScore = 95;
  else if (timeTrend.overallTrend === "SLOW_IMPROVEMENT") speedScore = 80;
  else if (timeTrend.overallTrend === "DEGRADING") speedScore = 40;
  else speedScore = 65;

  // Composite Weighted Calculation
  const w1 = 0.35, w2 = 0.25, w3 = 0.25, w4 = 0.15;
  const c1 = Math.round(masteryScore * w1);
  const c2 = Math.round(difficultyScore * w2);
  const c3 = Math.round(independenceScore * w3);
  const c4 = Math.round(speedScore * w4);

  const overallVelocityScore = Math.min(100, c1 + c2 + c3 + c4);

  let tier: LearningVelocity["tier"] = "Moderate Pace";
  if (overallVelocityScore >= 82) tier = "High Velocity";
  else if (overallVelocityScore >= 68) tier = "Solid Progress";
  else if (overallVelocityScore >= 50) tier = "Moderate Pace";
  else tier = "Plateaued";

  const velocityTrend = metrics.independentSolveRate.direction;

  let explanation = "";
  if (tier === "High Velocity") {
    explanation = `Outstanding learning velocity (${overallVelocityScore}/100): rapid independent solving, steady difficulty progression, and strong speed fluency.`;
  } else if (tier === "Solid Progress") {
    explanation = `Solid learning velocity (${overallVelocityScore}/100): steady skill development with consistent independent problem solves.`;
  } else if (tier === "Moderate Pace") {
    explanation = `Moderate learning velocity (${overallVelocityScore}/100): steady practice cadence, with opportunities to boost independent solving.`;
  } else {
    explanation = `Plateaued learning velocity (${overallVelocityScore}/100): practice volume is present, but independent mastery and difficulty advancement have stalled.`;
  }

  return {
    overallVelocityScore,
    tier,
    components: {
      masteryVelocity: { name: "Mastery Progression", score: masteryScore, weight: w1, contribution: c1, explanation: `${improvingSkills} improving skill${improvingSkills !== 1 ? "s" : ""}, ${strongSkills} strong skill${strongSkills !== 1 ? "s" : ""}.` },
      difficultyVelocity: { name: "Difficulty Advancement", score: difficultyScore, weight: w2, contribution: c2, explanation: `Medium tier solves: ${mediumSolved}, Hard tier solves: ${hardSolved}.` },
      independenceVelocity: { name: "Independence Gain", score: independenceScore, weight: w3, contribution: c3, explanation: `${indepRate}% independent solve rate across ${totalAttempts} attempts.` },
      timeEfficiencyVelocity: { name: "Speed & Fluency", score: speedScore, weight: w4, contribution: c4, explanation: `Solve speed trend is ${timeTrend.overallTrend.toLowerCase().replace("_", " ")}.` },
    },
    explanation,
    velocityTrend,
  };
}

// ─── Strategic Recommendation Engine (Goal-Aware) ────────────────────────────

export function generateStrategicRecommendations(
  metrics: PerformanceMetricsSnapshot,
  skillTrends: SkillPerformanceTrend[],
  patternTrends: PatternPerformanceTrend[],
  difficultyTrend: DifficultyProgressionTrend,
  weaknesses: PersistentWeakness[],
  activeGoal: PreparationGoal | null
): StrategicRecommendation[] {
  const recommendations: StrategicRecommendation[] = [];

  const goalType = activeGoal?.type ?? "general_improvement";

  // 1. Critical/High Persistent Weakness Recommendations
  const topWeakness = weaknesses[0];
  if (topWeakness) {
    recommendations.push({
      id: `rec_weakness_${topWeakness.id}`,
      title: `Repair Persistent Weakness in ${topWeakness.skillOrPattern}`,
      priority: topWeakness.severity === "CRITICAL" ? "CRITICAL" : "HIGH",
      affectedSkillOrPattern: topWeakness.skillOrPattern,
      reason: `Repeated failures and high hint dependency across multiple sessions.`,
      supportingEvidence: topWeakness.evidenceText,
      suggestedIntervention: topWeakness.recommendedIntervention,
      expectedOutcome: `Elevate independent solve rate to >= 70% and eliminate prerequisite bottlenecks.`,
      targetSubsystem: "practice",
    });
  }

  // 2. Stagnant Skill Interventions
  const stagnantSkill = skillTrends.find((s) => s.isStagnant);
  if (stagnantSkill) {
    recommendations.push({
      id: `rec_stagnant_${stagnantSkill.skillId}`,
      title: `Break Learning Plateau in ${stagnantSkill.skillName}`,
      priority: "HIGH",
      affectedSkillOrPattern: stagnantSkill.skillName,
      reason: `Performance has plateaued despite ${stagnantSkill.totalAttempts} practice attempts.`,
      supportingEvidence: stagnantSkill.stagnationReason ?? `Flat solve rate (${stagnantSkill.independentSolveRate}%) with no timing improvement.`,
      suggestedIntervention: stagnantSkill.suggestedIntervention ?? `Switch intervention from blind solving to pattern-focused worked examples.`,
      expectedOutcome: `Restore skill velocity and unlock progression into advanced variations.`,
      targetSubsystem: "practice",
    });
  }

  // 3. Difficulty Pacing Recommendation
  if (difficultyTrend.pacing === "TOO_AGGRESSIVE") {
    recommendations.push({
      id: "rec_diff_too_aggressive",
      title: "Consolidate Medium Tier Mastery",
      priority: "HIGH",
      affectedSkillOrPattern: "Difficulty Pacing",
      reason: "High failure rate on Hard problems indicates foundational gaps.",
      supportingEvidence: difficultyTrend.pacingDiagnosis,
      suggestedIntervention: difficultyTrend.recommendedDifficultyAction,
      expectedOutcome: "Build confidence and reduce hint dependency before escalating to Hard tier.",
      targetSubsystem: "practice",
    });
  } else if (difficultyTrend.pacing === "TOO_CONSERVATIVE") {
    recommendations.push({
      id: "rec_diff_too_conservative",
      title: "Escalate Problem Difficulty to Medium-Hard",
      priority: "MEDIUM",
      affectedSkillOrPattern: "Difficulty Pacing",
      reason: "Easy and Medium problems are solved comfortably and independently.",
      supportingEvidence: difficultyTrend.pacingDiagnosis,
      suggestedIntervention: difficultyTrend.recommendedDifficultyAction,
      expectedOutcome: "Stimulate cognitive growth by introducing 1-2 challenge problems per session.",
      targetSubsystem: "recommendations",
    });
  } else if (difficultyTrend.transitionGap.hasMediumToHardGap) {
    recommendations.push({
      id: "rec_diff_gap_medium_hard",
      title: "Bridge Medium → Hard Transition Gap",
      priority: "HIGH",
      affectedSkillOrPattern: "Difficulty Transition",
      reason: difficultyTrend.transitionGap.gapDescription,
      supportingEvidence: `Medium solve rate (${difficultyTrend.byDifficulty.Medium.independentSolveRate}%) vs Hard solve rate (${difficultyTrend.byDifficulty.Hard.independentSolveRate}%).`,
      suggestedIntervention: "Schedule 3 practice sessions with curated Medium-Hard prerequisite bridge problems.",
      expectedOutcome: "Smooth the transition into competitive/interview-grade Hard problems.",
      targetSubsystem: "practice",
    });
  }

  // 4. Pattern Overexposure / Underexposure Recommendation
  const overexposedPattern = patternTrends.find((p) => p.exposureStatus === "OVEREXPOSED");
  if (overexposedPattern) {
    recommendations.push({
      id: `rec_pattern_over_${overexposedPattern.patternName.toLowerCase().replace(/\s+/g, "_")}`,
      title: `Diversify Practice: Reduce ${overexposedPattern.patternName} Overexposure`,
      priority: "MEDIUM",
      affectedSkillOrPattern: overexposedPattern.patternName,
      reason: `Takes up ${overexposedPattern.exposurePercentage}% of all attempts in this window.`,
      supportingEvidence: overexposedPattern.actionRecommendation,
      suggestedIntervention: `Demote ${overexposedPattern.patternName} in daily practice and introduce underrepresented algorithmic patterns.`,
      expectedOutcome: "Broader algorithmic repertoire for interview and contest readiness.",
      targetSubsystem: "recommendations",
    });
  }

  const underexposedPattern = patternTrends.find((p) => p.exposureStatus === "UNDEREXPOSED");
  if (underexposedPattern) {
    recommendations.push({
      id: `rec_pattern_under_${underexposedPattern.patternName.toLowerCase().replace(/\s+/g, "_")}`,
      title: `Boost Exposure to ${underexposedPattern.patternName}`,
      priority: "HIGH",
      affectedSkillOrPattern: underexposedPattern.patternName,
      reason: `Critical for your active goal but under-practiced (${underexposedPattern.exposureCount} attempts).`,
      supportingEvidence: underexposedPattern.actionRecommendation,
      suggestedIntervention: `Schedule a Pattern Mastery session focused exclusively on ${underexposedPattern.patternName}.`,
      expectedOutcome: "Close the topic coverage gap aligned to your target goal.",
      targetSubsystem: "practice",
    });
  }

  // 5. Goal-Specific Recommendations
  if (goalType === "dsa_interview" || goalType === "technical_interview") {
    if (metrics.hintAssistedRate.currentValue >= 30) {
      recommendations.push({
        id: "rec_goal_interview_hints",
        title: "Focus on Independent Explanation & Zero-Hint Solves",
        priority: "HIGH",
        affectedSkillOrPattern: "Interview Readiness",
        reason: "Interview evaluations heavily penalize hint dependency.",
        supportingEvidence: `${metrics.hintAssistedRate.currentValue}% of recent solves relied on hints.`,
        suggestedIntervention: "Practice communicating your approach aloud for 5 minutes before writing any code, without looking at clues.",
        expectedOutcome: "Achieve independent problem resolution in interview simulations.",
        targetSubsystem: "preparation",
      });
    }
  } else if (goalType === "competitive_programming") {
    recommendations.push({
      id: "rec_goal_cp_speed",
      title: "Timed Speed Drills under Contest Pressure",
      priority: "MEDIUM",
      affectedSkillOrPattern: "Contest Speed",
      reason: "Competitive programming goals prioritize problem-solving velocity.",
      supportingEvidence: `Current median solve time is ${Math.round(metrics.medianSolveTimeSeconds.currentValue)} min.`,
      suggestedIntervention: "Participate in weekly Virtual Contests with strict 15-minute per-problem countdowns.",
      expectedOutcome: "Accelerate initial idea formulation and clean implementation speed.",
      targetSubsystem: "preparation",
    });
  }

  // Fallback default recommendation if list is small
  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec_default_momentum",
      title: "Maintain Adaptive Practice Rhythm",
      priority: "LOW",
      affectedSkillOrPattern: "General DSA",
      reason: "Performance is balanced with consistent progress across all tracked dimensions.",
      supportingEvidence: `Overall solve rate is ${metrics.solveRate.currentValue}% across ${metrics.totalAttempts} attempts.`,
      suggestedIntervention: "Continue with daily Smart Practice sessions to reinforce breadth and retention.",
      expectedOutcome: "Sustained learning momentum and progressive mastery gains.",
      targetSubsystem: "practice",
    });
  }

  return recommendations;
}

// ─── Subsystem Feedback Signal Generator ─────────────────────────────────────

export function generateSubsystemFeedbackSignals(
  skillTrends: SkillPerformanceTrend[],
  patternTrends: PatternPerformanceTrend[],
  difficultyTrend: DifficultyProgressionTrend,
  weaknesses: PersistentWeakness[],
  activeGoal: PreparationGoal | null
): SubsystemFeedbackSignals {
  const boostWeaknessSkills = weaknesses.slice(0, 3).map((w) => w.skillOrPattern);
  const demoteOverexposedPatterns = patternTrends
    .filter((p) => p.exposureStatus === "OVEREXPOSED")
    .map((p) => p.patternName);

  const targetDifficulty =
    difficultyTrend.pacing === "TOO_CONSERVATIVE" ? "Hard" :
    difficultyTrend.pacing === "TOO_AGGRESSIVE" ? "Medium" :
    "Mixed";

  const suggestedMode = weaknesses.length > 0 ? "weakness_repair" : "smart_practice";
  const targetPrerequisiteBridges = skillTrends
    .filter((s) => s.prerequisiteHealth === "BOTTLENECK")
    .map((s) => s.skillName);

  const bottleneckPriorities = skillTrends
    .filter((s) => s.isStagnant || s.classification === "WEAK")
    .map((s) => s.skillId);

  const decayRisks = skillTrends
    .filter((s) => s.recentActivityDaysAgo >= 14 && s.currentMasteryScore >= 60)
    .map((s) => s.skillName);

  return {
    recommendationSignals: {
      boostWeaknessSkills,
      demoteOverexposedPatterns,
      targetDifficulty,
    },
    practiceSessionSignals: {
      suggestedMode,
      targetPrerequisiteBridges,
      suggestedDurationMinutes: activeGoal?.dailyMinutes ?? 45,
    },
    learningGraphSignals: {
      bottleneckPriorities,
      decayRisks,
    },
    srsSignals: {
      urgentTopicRevisionIds: decayRisks,
    },
    preparationSignals: {
      velocityAlignment: weaknesses.length >= 3 ? "AT_RISK" : "ON_TRACK",
      gapAdjustments: boostWeaknessSkills,
    },
  };
}

// ─── Performance Timeline Generator ──────────────────────────────────────────

export function generatePerformanceTimeline(
  dataset: AggregatedDataSet,
  skillTrends: SkillPerformanceTrend[],
  weaknesses: PersistentWeakness[]
): PerformanceTimelineEvent[] {
  const events: PerformanceTimelineEvent[] = [];

  // 1. Mastery & Strong Skills
  skillTrends.filter((s) => s.classification === "STRONG" && s.totalAttempts >= 3).forEach((s) => {
    events.push({
      id: `tl_mastery_${s.skillId}`,
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      type: "MASTERY_ACHIEVED",
      title: `Mastery Milestone: ${s.skillName}`,
      description: `Demonstrated ${s.independentSolveRate}% independent solve rate and healthy ${s.currentMasteryScore}% mastery across ${s.totalAttempts} attempts.`,
      icon: "🏆",
      badgeVariant: "success",
      relatedSkill: s.skillName,
    });
  });

  // 2. Persistent Weaknesses Detected
  weaknesses.slice(0, 2).forEach((w) => {
    events.push({
      id: `tl_weakness_${w.id}`,
      date: w.lastObservedDate,
      timestamp: new Date(w.lastObservedDate).toISOString(),
      type: "PERSISTENT_WEAKNESS_DETECTED",
      title: `Persistent Weakness: ${w.skillOrPattern}`,
      description: `Observed across multiple sessions (${w.failCount} failures, ${w.hintCount} hints). Targeted repair recommended.`,
      icon: "⚠️",
      badgeVariant: "warning",
      relatedSkill: w.skillOrPattern,
    });
  });

  // 3. Significant Historical Sessions
  const allEvents = dataset.allEvents;
  const contestEvents = allEvents.filter((e) => e.source === "VIRTUAL_CONTEST");
  if (contestEvents.length > 0) {
    const latestContest = contestEvents[contestEvents.length - 1];
    events.push({
      id: `tl_contest_${latestContest.id}`,
      date: latestContest.date,
      timestamp: latestContest.timestamp,
      type: "CONTEST_RESULT",
      title: `Contest Performance: ${latestContest.title}`,
      description: `Outcome: ${latestContest.outcome === "SOLVED_INDEPENDENTLY" ? "Solved independently" : "Attempt completed"}.`,
      icon: "⚔️",
      badgeVariant: "info",
    });
  }

  const interviewEvents = allEvents.filter((e) => e.source === "MOCK_INTERVIEW");
  if (interviewEvents.length > 0) {
    const latestInterview = interviewEvents[interviewEvents.length - 1];
    events.push({
      id: `tl_interview_${latestInterview.id}`,
      date: latestInterview.date,
      timestamp: latestInterview.timestamp,
      type: "INTERVIEW_RESULT",
      title: `${latestInterview.title}`,
      description: `Recorded interview performance score: ${latestInterview.score ?? 80}/100.`,
      icon: "💼",
      badgeVariant: "info",
    });
  }

  // Sort timeline latest first
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
}
