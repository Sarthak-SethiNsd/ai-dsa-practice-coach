import {
  PreparationGoal,
  ReadinessDimension,
  PreparationReadinessSummary,
  OnTrackAssessment,
  OnTrackStatus,
} from "./preparationTypes";

export interface ReadinessTelemetryData {
  totalNotesCount: number;
  masteredNotesCount: number;
  weakNotesCount: number;
  distinctTopicsCovered: number;
  targetTopicsCovered: number;
  srsDueCount: number;
  srsOverdueCount: number;
  srsMasteredCount: number;
  studyMinutesPast7d: number;
  studyStreakDays: number;
  totalStudySessions: number;
  contestsCount: number;
  avgContestScore: number;
  interviewsCount: number;
  avgInterviewScore: number;
  solvedMediumHardCount: number;
  totalProblemsSolved: number;
  avgSolveTimeEfficiencyPct: number;
}

export function computeReadinessSummary(
  goal: PreparationGoal,
  telemetry: ReadinessTelemetryData
): PreparationReadinessSummary {
  const dimensions: ReadinessDimension[] = [];

  // 1. Topic Coverage (0.12)
  const requiredTopicCount = Math.max(1, goal.priorityTopics.length);
  const topicCoverageRatio = Math.min(1, telemetry.targetTopicsCovered / requiredTopicCount);
  const topicScore = Math.round(
    Math.min(100, (topicCoverageRatio * 0.7 + Math.min(1, telemetry.distinctTopicsCovered / 12) * 0.3) * 100)
  );
  dimensions.push({
    id: "topicCoverage",
    name: "Topic Coverage",
    score: topicScore,
    weight: 0.12,
    status: topicScore >= 75 ? "strong" : topicScore >= 50 ? "developing" : "needs_attention",
    explanation: `${telemetry.targetTopicsCovered} of ${requiredTopicCount} priority topics actively practiced (${telemetry.distinctTopicsCovered} total topics explored).`,
  });

  // 2. Pattern Mastery (0.12)
  const patternRatio = telemetry.totalNotesCount > 0 ? telemetry.masteredNotesCount / telemetry.totalNotesCount : 0.4;
  const patternScore = Math.round(
    Math.min(100, Math.max(20, patternRatio * 80 + Math.min(20, telemetry.masteredNotesCount * 2)))
  );
  dimensions.push({
    id: "patternMastery",
    name: "Pattern Mastery",
    score: patternScore,
    weight: 0.12,
    status: patternScore >= 75 ? "strong" : patternScore >= 50 ? "developing" : "needs_attention",
    explanation: `${telemetry.masteredNotesCount} core algorithmic patterns verified as mastered in Knowledge Base.`,
  });

  // 3. Problem Accuracy (0.12)
  const accBase = telemetry.contestsCount > 0 ? telemetry.avgContestScore * 0.1 : 70;
  const accScore = Math.round(Math.min(100, Math.max(30, accBase + (telemetry.weakNotesCount === 0 ? 15 : 0))));
  dimensions.push({
    id: "problemAccuracy",
    name: "Problem-Solving Accuracy",
    score: accScore,
    weight: 0.12,
    status: accScore >= 75 ? "strong" : accScore >= 50 ? "developing" : "needs_attention",
    explanation: `Demonstrating ${accScore}% solution precision with ${telemetry.weakNotesCount} active mistake patterns under tracking.`,
  });

  // 4. Difficulty Progression (0.10)
  const medHardRatio = telemetry.totalProblemsSolved > 0 ? telemetry.solvedMediumHardCount / telemetry.totalProblemsSolved : 0.3;
  const diffScore = Math.round(Math.min(100, Math.max(25, medHardRatio * 100 + Math.min(20, telemetry.solvedMediumHardCount * 2))));
  dimensions.push({
    id: "difficultyProgression",
    name: "Difficulty Progression",
    score: diffScore,
    weight: 0.10,
    status: diffScore >= 75 ? "strong" : diffScore >= 50 ? "developing" : "needs_attention",
    explanation: `${telemetry.solvedMediumHardCount} Medium/Hard problems solved (${Math.round(medHardRatio * 100)}% of total volume).`,
  });

  // 5. Recent Performance (0.10)
  const recentMinutesTarget = goal.dailyMinutes * 5;
  const recentPace = Math.min(1.2, telemetry.studyMinutesPast7d / Math.max(1, recentMinutesTarget));
  const recentScore = Math.round(Math.min(100, recentPace * 85));
  dimensions.push({
    id: "recentPerformance",
    name: "Recent Momentum",
    score: recentScore,
    weight: 0.10,
    status: recentScore >= 75 ? "strong" : recentScore >= 50 ? "developing" : "needs_attention",
    explanation: `${telemetry.studyMinutesPast7d} minutes logged in the last 7 days against target of ${recentMinutesTarget}m.`,
  });

  // 6. Contest Performance (0.10)
  const contestScore = telemetry.contestsCount > 0 ? Math.round(Math.min(100, telemetry.avgContestScore / 10)) : 50;
  dimensions.push({
    id: "contestPerformance",
    name: "Contest Readiness & Pace",
    score: contestScore,
    weight: 0.10,
    status: contestScore >= 75 ? "strong" : contestScore >= 50 ? "developing" : "needs_attention",
    explanation: telemetry.contestsCount > 0
      ? `${telemetry.contestsCount} virtual contests completed with average score of ${telemetry.avgContestScore} pts.`
      : "No virtual contests completed yet. Timed simulations recommended.",
  });

  // 7. Interview Performance (0.10)
  const interviewScore = telemetry.interviewsCount > 0 ? telemetry.avgInterviewScore : 45;
  dimensions.push({
    id: "interviewPerformance",
    name: "Interview Readiness & Communication",
    score: interviewScore,
    weight: 0.10,
    status: interviewScore >= 75 ? "strong" : interviewScore >= 55 ? "developing" : "needs_attention",
    explanation: telemetry.interviewsCount > 0
      ? `${telemetry.interviewsCount} mock interviews completed with average score of ${telemetry.avgInterviewScore}/100.`
      : "Interview simulations pending. Schedule mock technical sessions to verify think-aloud pace.",
  });

  // 8. Revision Health (0.08)
  const totalSRS = telemetry.srsDueCount + telemetry.srsOverdueCount + telemetry.srsMasteredCount;
  const srsRatio = totalSRS > 0 ? Math.max(0, 1 - telemetry.srsOverdueCount / totalSRS) : 0.8;
  const revScore = Math.round(Math.min(100, srsRatio * 90 + Math.min(10, telemetry.srsMasteredCount * 2)));
  dimensions.push({
    id: "revisionHealth",
    name: "Revision Health (SRS)",
    score: revScore,
    weight: 0.08,
    status: telemetry.srsOverdueCount > 4 ? "critical" : revScore >= 75 ? "strong" : revScore >= 50 ? "developing" : "needs_attention",
    explanation: telemetry.srsOverdueCount > 0
      ? `${telemetry.srsOverdueCount} overdue revision item(s) creating memory decay risk.`
      : `${telemetry.srsMasteredCount} retention items on schedule with zero backlog.`,
  });

  // 9. Consistency (0.08)
  const streakScore = Math.round(Math.min(100, Math.max(30, telemetry.studyStreakDays * 12 + telemetry.totalStudySessions * 3)));
  dimensions.push({
    id: "consistency",
    name: "Study Consistency & Streaks",
    score: streakScore,
    weight: 0.08,
    status: streakScore >= 75 ? "strong" : streakScore >= 50 ? "developing" : "needs_attention",
    explanation: `Active ${telemetry.studyStreakDays}-day practice streak across ${telemetry.totalStudySessions} study sessions.`,
  });

  // 10. Time Efficiency (0.08)
  const timeScore = Math.round(Math.min(100, Math.max(35, telemetry.avgSolveTimeEfficiencyPct)));
  dimensions.push({
    id: "timeEfficiency",
    name: "Time Efficiency & Speed",
    score: timeScore,
    weight: 0.08,
    status: timeScore >= 75 ? "strong" : timeScore >= 50 ? "developing" : "needs_attention",
    explanation: `Averaging ${timeScore}% time efficiency benchmark compared to standard timed solutions.`,
  });

  // Overall Weighted Score
  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  let tier: PreparationReadinessSummary["tier"] = "Developing";
  let bandLabel = "Developing Candidate (Building Core Foundations)";
  if (overall >= 88) {
    tier = "Advanced";
    bandLabel = "Advanced Competitor / High-Readiness Candidate";
  } else if (overall >= 76) {
    tier = "Interview Ready";
    bandLabel = "Interview Ready (Solid Multi-Pattern Fluency)";
  } else if (overall >= 62) {
    tier = "Competitive";
    bandLabel = "Competitive Baseline (Pacing & Patterns Emerging)";
  } else if (overall < 45) {
    tier = "Beginner";
    bandLabel = "Beginner Phase (Foundational Coverage Needed)";
  }

  // Strengths and Limiters
  const sortedDims = [...dimensions].sort((a, b) => b.score - a.score);
  const topStrengths = sortedDims
    .slice(0, 2)
    .filter((d) => d.score >= 60)
    .map((d) => `${d.name}: ${d.explanation}`);

  const criticalLimiters = [...dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .filter((d) => d.score < 70)
    .map((d) => `${d.name}: ${d.explanation}`);

  const summaryExplanation =
    criticalLimiters.length > 0
      ? `Overall readiness is ${overall}/100. Primary growth levers are ${criticalLimiters[0]?.split(":")[0]} and ${criticalLimiters[1]?.split(":")[0] || "consistency"}.`
      : `Overall readiness is ${overall}/100 with well-rounded pattern mastery and strong practice momentum.`;

  return {
    overallScore: overall,
    tier,
    bandLabel,
    dimensions,
    summaryExplanation,
    topStrengths: topStrengths.length > 0 ? topStrengths : ["Consistent baseline practice cadence."],
    criticalLimiters: criticalLimiters.length > 0 ? criticalLimiters : ["Maintain timed execution speed on harder variations."],
  };
}

export function computeOnTrackAssessment(
  goal: PreparationGoal,
  readinessScore: number
): OnTrackAssessment {
  const now = new Date();
  const target = new Date(goal.targetDate);
  const created = new Date(goal.createdAt);

  const totalDurationMs = Math.max(1, target.getTime() - created.getTime());
  const elapsedMs = Math.max(0, now.getTime() - created.getTime());
  const remainingMs = Math.max(0, target.getTime() - now.getTime());

  const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Math.max(0, Math.ceil(daysRemaining / 7));

  const elapsedFraction = Math.min(1, Math.max(0.01, elapsedMs / totalDurationMs));
  // Target readiness by this elapsed point (e.g. goal score or 85)
  const targetReadiness = goal.targetInterviewScore || (goal.targetContestRating ? 80 : 85);
  const expectedReadinessNow = Math.round(targetReadiness * elapsedFraction);

  const velocityRatio = Number((readinessScore / Math.max(1, expectedReadinessNow)).toFixed(2));

  let status: OnTrackStatus = "ON_TRACK";
  let statusRationale = "";

  if (velocityRatio >= 1.15 || (readinessScore >= targetReadiness && daysRemaining > 10)) {
    status = "AHEAD";
    statusRationale = `Pacing ahead of target timeline. Readiness (${readinessScore}/100) exceeds expected benchmark (${expectedReadinessNow}) with ${daysRemaining} days remaining.`;
  } else if (velocityRatio >= 0.88) {
    status = "ON_TRACK";
    statusRationale = `On track to reach ${targetReadiness}+ readiness by ${goal.targetDate}. Current pace aligns well with available ${goal.dailyMinutes}m daily budget.`;
  } else if (velocityRatio >= 0.68 || daysRemaining <= 14) {
    status = "AT_RISK";
    statusRationale = `Pace is slightly lagging (${daysRemaining} days left). Prioritize high-impact weak topics and eliminate revision debt to recover momentum.`;
  } else {
    status = "BEHIND";
    statusRationale = `Readiness (${readinessScore}/100) is behind required trajectory for ${goal.targetDate}. Consider increasing daily practice time or shifting focus to essential core patterns.`;
  }

  const estimatedCompletionPace =
    status === "AHEAD"
      ? "Ahead of schedule"
      : status === "ON_TRACK"
      ? "Nominal trajectory"
      : status === "AT_RISK"
      ? "Requires +15m daily acceleration"
      : "Requires intensive sprint";

  return {
    status,
    velocityRatio,
    daysRemaining,
    weeksRemaining,
    estimatedCompletionPace,
    statusRationale,
  };
}
