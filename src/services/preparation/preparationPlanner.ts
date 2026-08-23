import {
  PreparationGoal,
  PreparationPhase,
  AdaptivePreparationRoadmap,
  PreparationGap,
  WeeklyStrategy,
} from "./preparationTypes";
import { ReadinessTelemetryData } from "./preparationScoring";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function generateAdaptiveRoadmap(
  goal: PreparationGoal,
  telemetry: ReadinessTelemetryData,
  daysRemaining: number
): AdaptivePreparationRoadmap {
  const today = new Date().toISOString().split("T")[0];
  const phases: PreparationPhase[] = [];

  // Determine total phases and structure based on remaining time
  if (daysRemaining > 60) {
    // 4-Phase Full Program
    const w1 = Math.round(daysRemaining * 0.35 / 7);
    const w2 = Math.round(daysRemaining * 0.30 / 7);
    const w3 = Math.round(daysRemaining * 0.20 / 7);
    const w4 = Math.max(1, Math.round(daysRemaining * 0.15 / 7));

    const p1End = addDays(today, w1 * 7);
    const p2End = addDays(p1End, w2 * 7);
    const p3End = addDays(p2End, w3 * 7);
    const p4End = goal.targetDate;

    phases.push({
      id: "phase_1_foundation",
      phaseNumber: 1,
      name: "Phase 1: Foundation & Priority Coverage",
      theme: "Core Data Structure Fluency",
      startDate: today,
      endDate: p1End,
      durationWeeks: w1,
      isCurrent: true,
      isCompleted: false,
      objective: "Establish ironclad grasp of Arrays, Two Pointers, Hash Maps, and Binary Search fundamentals.",
      priorityTopics: goal.priorityTopics.slice(0, 2),
      priorityPatterns: ["Two Pointers", "Hashing", "Binary Search"],
      targetProblemCount: 15,
      solvedProblemCount: Math.min(15, telemetry.totalProblemsSolved),
      targetContestCount: 1,
      completedContestCount: telemetry.contestsCount,
      targetInterviewCount: 0,
      completedInterviewCount: 0,
      revisionItemTarget: 8,
      expectedReadinessGain: 18,
      exitCriteria: [
        { description: "Zero concept gaps in foundational topics", isMet: telemetry.weakNotesCount === 0, metricCurrent: telemetry.weakNotesCount, metricTarget: 0, unit: "gaps" },
        { description: "Solve 15 foundational problems", isMet: telemetry.totalProblemsSolved >= 15, metricCurrent: telemetry.totalProblemsSolved, metricTarget: 15, unit: "problems" },
      ],
      progressPercent: Math.min(100, Math.round((telemetry.totalProblemsSolved / 15) * 100)),
    });

    phases.push({
      id: "phase_2_patterns",
      phaseNumber: 2,
      name: "Phase 2: Pattern Expansion & Medium Problem Scaling",
      theme: "Algorithmic Depth (Trees, Graphs & DP)",
      startDate: p1End,
      endDate: p2End,
      durationWeeks: w2,
      isCurrent: false,
      isCompleted: false,
      objective: "Scale to multi-branch DP, BFS/DFS traversal patterns, and topological sorting.",
      priorityTopics: goal.priorityTopics.slice(2, 4),
      priorityPatterns: ["BFS Traversal", "Topological Sort", "1D DP"],
      targetProblemCount: 25,
      solvedProblemCount: Math.min(25, telemetry.solvedMediumHardCount),
      targetContestCount: 2,
      completedContestCount: Math.min(2, telemetry.contestsCount),
      targetInterviewCount: 1,
      completedInterviewCount: Math.min(1, telemetry.interviewsCount),
      revisionItemTarget: 12,
      expectedReadinessGain: 22,
      exitCriteria: [
        { description: "Solve 20+ Medium difficulty problems", isMet: telemetry.solvedMediumHardCount >= 20, metricCurrent: telemetry.solvedMediumHardCount, metricTarget: 20, unit: "problems" },
        { description: "Master 4 graph & DP patterns", isMet: telemetry.masteredNotesCount >= 4, metricCurrent: telemetry.masteredNotesCount, metricTarget: 4, unit: "patterns" },
      ],
      progressPercent: Math.min(100, Math.round((telemetry.solvedMediumHardCount / 20) * 100)),
    });

    phases.push({
      id: "phase_3_timed",
      phaseNumber: 3,
      name: "Phase 3: Timed Execution & Simulation",
      theme: "Contest Pace & Interview Fluency",
      startDate: p2End,
      endDate: p3End,
      durationWeeks: w3,
      isCurrent: false,
      isCompleted: false,
      objective: "Train under timed constraints with Virtual Contests and AI Mock Interviews.",
      priorityTopics: goal.priorityTopics,
      priorityPatterns: ["State Transitions", "Shortest Path", "Sliding Window"],
      targetProblemCount: 20,
      solvedProblemCount: 8,
      targetContestCount: 3,
      completedContestCount: Math.min(3, telemetry.contestsCount),
      targetInterviewCount: 2,
      completedInterviewCount: Math.min(2, telemetry.interviewsCount),
      revisionItemTarget: 15,
      expectedReadinessGain: 15,
      exitCriteria: [
        { description: "Complete 3 virtual contests", isMet: telemetry.contestsCount >= 3, metricCurrent: telemetry.contestsCount, metricTarget: 3, unit: "contests" },
        { description: "Achieve 75+ mock interview score", isMet: telemetry.avgInterviewScore >= 75, metricCurrent: telemetry.avgInterviewScore, metricTarget: 75, unit: "pts" },
      ],
      progressPercent: Math.min(100, Math.round(((telemetry.contestsCount + telemetry.interviewsCount) / 5) * 100)),
    });

    phases.push({
      id: "phase_4_final",
      phaseNumber: 4,
      name: "Phase 4: High-Impact Revision & Polish",
      theme: "Weakness Elimination & Mindset",
      startDate: p3End,
      endDate: p4End,
      durationWeeks: w4,
      isCurrent: false,
      isCompleted: false,
      objective: "Eliminate any lingering mistake patterns, review all SRS cards, and lock in interview calm.",
      priorityTopics: goal.priorityTopics,
      priorityPatterns: ["Edge Cases", "Complexity Derivation"],
      targetProblemCount: 10,
      solvedProblemCount: 3,
      targetContestCount: 1,
      completedContestCount: 1,
      targetInterviewCount: 1,
      completedInterviewCount: 1,
      revisionItemTarget: 20,
      expectedReadinessGain: 10,
      exitCriteria: [
        { description: "Zero overdue SRS revision cards", isMet: telemetry.srsOverdueCount === 0, metricCurrent: telemetry.srsOverdueCount, metricTarget: 0, unit: "overdue" },
      ],
      progressPercent: telemetry.srsOverdueCount === 0 ? 100 : 50,
    });
  } else if (daysRemaining > 20) {
    // 3-Phase Accelerated Program (30-60 days)
    const w1 = Math.round(daysRemaining * 0.45 / 7);
    const w2 = Math.round(daysRemaining * 0.35 / 7);
    const w3 = Math.max(1, Math.round(daysRemaining * 0.20 / 7));

    const p1End = addDays(today, w1 * 7);
    const p2End = addDays(p1End, w2 * 7);

    phases.push({
      id: "phase_1_acceleration",
      phaseNumber: 1,
      name: "Phase 1: High-Impact Pattern Expansion",
      theme: "Targeted Weakness Attack",
      startDate: today,
      endDate: p1End,
      durationWeeks: w1,
      isCurrent: true,
      isCompleted: false,
      objective: "Directly address top weak topics (Graphs/DP) and solve key Medium patterns.",
      priorityTopics: goal.priorityTopics.slice(0, 3),
      priorityPatterns: ["BFS/DFS", "DP States", "Two Pointers"],
      targetProblemCount: 18,
      solvedProblemCount: Math.min(18, telemetry.solvedMediumHardCount),
      targetContestCount: 2,
      completedContestCount: telemetry.contestsCount,
      targetInterviewCount: 1,
      completedInterviewCount: telemetry.interviewsCount,
      revisionItemTarget: 10,
      expectedReadinessGain: 20,
      exitCriteria: [
        { description: "Solve 15+ Medium problems", isMet: telemetry.solvedMediumHardCount >= 15, metricCurrent: telemetry.solvedMediumHardCount, metricTarget: 15, unit: "problems" },
      ],
      progressPercent: Math.min(100, Math.round((telemetry.solvedMediumHardCount / 15) * 100)),
    });

    phases.push({
      id: "phase_2_simulation",
      phaseNumber: 2,
      name: "Phase 2: Timed Drills & Interview Readiness",
      theme: "Timed Pressure & Communication",
      startDate: p1End,
      endDate: p2End,
      durationWeeks: w2,
      isCurrent: false,
      isCompleted: false,
      objective: "Live simulation with Virtual Contests and AI Mock Technical Interviews.",
      priorityTopics: goal.priorityTopics,
      priorityPatterns: ["Complexity Derivation", "Edge Cases"],
      targetProblemCount: 15,
      solvedProblemCount: 5,
      targetContestCount: 3,
      completedContestCount: telemetry.contestsCount,
      targetInterviewCount: 2,
      completedInterviewCount: telemetry.interviewsCount,
      revisionItemTarget: 12,
      expectedReadinessGain: 15,
      exitCriteria: [
        { description: "Mock interview score >= 80", isMet: telemetry.avgInterviewScore >= 80, metricCurrent: telemetry.avgInterviewScore, metricTarget: 80, unit: "pts" },
      ],
      progressPercent: Math.min(100, Math.round((telemetry.interviewsCount / 2) * 100)),
    });

    phases.push({
      id: "phase_3_sprint",
      phaseNumber: 3,
      name: "Phase 3: Final Sprint & Revision Lockdown",
      theme: "Memory Retention & Calm",
      startDate: p2End,
      endDate: goal.targetDate,
      durationWeeks: w3,
      isCurrent: false,
      isCompleted: false,
      objective: "Daily SRS reviews, mistake pattern reviews, and rapid algorithm dry-runs.",
      priorityTopics: goal.priorityTopics,
      priorityPatterns: ["Fast Dry-runs"],
      targetProblemCount: 8,
      solvedProblemCount: 2,
      targetContestCount: 1,
      completedContestCount: 1,
      targetInterviewCount: 1,
      completedInterviewCount: 1,
      revisionItemTarget: 15,
      expectedReadinessGain: 10,
      exitCriteria: [
        { description: "Zero SRS backlog", isMet: telemetry.srsOverdueCount === 0, metricCurrent: telemetry.srsOverdueCount, metricTarget: 0, unit: "cards" },
      ],
      progressPercent: telemetry.srsOverdueCount === 0 ? 100 : 40,
    });
  } else {
    // 2-Phase Emergency Sprint (< 20 days)
    const midPoint = addDays(today, Math.max(1, Math.round(daysRemaining / 2)));

    phases.push({
      id: "phase_1_critical",
      phaseNumber: 1,
      name: "Phase 1: Critical Pattern Reinforcement",
      theme: "Must-Know High Frequency Archetypes",
      startDate: today,
      endDate: midPoint,
      durationWeeks: 1,
      isCurrent: true,
      isCompleted: false,
      objective: "Fix highest-frequency mistake patterns and clear all revision debt.",
      priorityTopics: goal.priorityTopics,
      priorityPatterns: ["Two Pointers", "Hashing", "BFS", "Intervals"],
      targetProblemCount: 10,
      solvedProblemCount: Math.min(10, telemetry.solvedMediumHardCount),
      targetContestCount: 1,
      completedContestCount: telemetry.contestsCount,
      targetInterviewCount: 1,
      completedInterviewCount: telemetry.interviewsCount,
      revisionItemTarget: 8,
      expectedReadinessGain: 15,
      exitCriteria: [
        { description: "Zero overdue SRS revisions", isMet: telemetry.srsOverdueCount === 0, metricCurrent: telemetry.srsOverdueCount, metricTarget: 0, unit: "cards" },
      ],
      progressPercent: Math.min(100, Math.round((telemetry.solvedMediumHardCount / 10) * 100)),
    });

    phases.push({
      id: "phase_2_peak",
      phaseNumber: 2,
      name: "Phase 2: Mock Interview & Peak Performance",
      theme: "Live Simulation & Execution Calm",
      startDate: midPoint,
      endDate: goal.targetDate,
      durationWeeks: 1,
      isCurrent: false,
      isCompleted: false,
      objective: "Daily mock interview drills and rapid dry-runs without learning new complex topics.",
      priorityTopics: goal.priorityTopics,
      priorityPatterns: ["Edge Cases", "Complexity Articulation"],
      targetProblemCount: 6,
      solvedProblemCount: 2,
      targetContestCount: 1,
      completedContestCount: telemetry.contestsCount,
      targetInterviewCount: 2,
      completedInterviewCount: telemetry.interviewsCount,
      revisionItemTarget: 10,
      expectedReadinessGain: 10,
      exitCriteria: [
        { description: "Mock interview score >= 75", isMet: telemetry.avgInterviewScore >= 75, metricCurrent: telemetry.avgInterviewScore, metricTarget: 75, unit: "pts" },
      ],
      progressPercent: Math.min(100, Math.round((telemetry.interviewsCount / 2) * 100)),
    });
  }

  return {
    goalId: goal.id,
    totalPhases: phases.length,
    currentPhaseIndex: 0,
    phases,
    generatedAt: new Date().toISOString(),
  };
}

export function generatePreparationGaps(
  goal: PreparationGoal,
  telemetry: ReadinessTelemetryData
): PreparationGap[] {
  const gaps: PreparationGap[] = [];

  // Gap 1: SRS Overdue Debt
  if (telemetry.srsOverdueCount > 0) {
    const impact = 9;
    const weakness = Math.min(10, telemetry.srsOverdueCount * 2);
    const urgency = 9;
    gaps.push({
      id: "gap_srs_overdue",
      category: "revision_debt",
      topicOrSkill: "Spaced Repetition Debt",
      severity: telemetry.srsOverdueCount >= 4 ? "critical" : "high",
      impactScore: impact,
      weaknessScore: weakness,
      urgencyScore: urgency,
      compositePriority: impact * weakness * urgency,
      reasoning: `${telemetry.srsOverdueCount} problems are overdue for review. Retention decay reduces instant pattern recall under interview pressure.`,
      recommendedAction: "Review and clear pending spaced repetition cards.",
      actionType: "revision",
    });
  }

  // Gap 2: Medium / Hard Depth Bottleneck
  if (telemetry.solvedMediumHardCount < 12) {
    const impact = 9;
    const weakness = 8;
    const urgency = 8;
    gaps.push({
      id: "gap_difficulty_bottleneck",
      category: "difficulty_bottleneck",
      topicOrSkill: "Medium/Hard Problem Volume",
      severity: "high",
      impactScore: impact,
      weaknessScore: weakness,
      urgencyScore: urgency,
      compositePriority: impact * weakness * urgency,
      reasoning: `Solved ${telemetry.solvedMediumHardCount} Medium/Hard problems. Real technical interviews test multi-state Medium problems.`,
      recommendedAction: "Solve 2 Medium problems targeting your priority topics.",
      actionType: "practice",
    });
  }

  // Gap 3: Graph Traversal Fluency
  if (goal.priorityTopics.includes("Graphs") && telemetry.targetTopicsCovered < 3) {
    const impact = 8;
    const weakness = 8;
    const urgency = 7;
    gaps.push({
      id: "gap_graph_traversals",
      category: "topic_coverage",
      topicOrSkill: "Graphs (BFS, DFS & Shortest Path)",
      severity: "high",
      impactScore: impact,
      weaknessScore: weakness,
      urgencyScore: urgency,
      compositePriority: impact * weakness * urgency,
      reasoning: "Graph algorithms represent 20%+ of Big Tech interview questions with frequent cycle detection and topological sorting.",
      recommendedAction: "Complete a targeted Graph pattern drill.",
      actionType: "practice",
    });
  }

  // Gap 4: Mock Interview Simulation Deficit
  if (
    (goal.type === "dsa_interview" || goal.type === "technical_interview") &&
    telemetry.interviewsCount < 2
  ) {
    const impact = 9;
    const weakness = 7;
    const urgency = 8;
    gaps.push({
      id: "gap_interview_simulation",
      category: "interview_readiness",
      topicOrSkill: "Live Think-Aloud & Interview Simulation",
      severity: "high",
      impactScore: impact,
      weaknessScore: weakness,
      urgencyScore: urgency,
      compositePriority: impact * weakness * urgency,
      reasoning: "Communication, complexity justification, and trade-off explanations count for 35% of interview evaluation.",
      recommendedAction: "Complete a 45m AI Mock Interview simulation.",
      actionType: "interview",
    });
  }

  // Gap 5: Virtual Contest Triage
  if (telemetry.contestsCount < 2) {
    const impact = 7;
    const weakness = 6;
    const urgency = 6;
    gaps.push({
      id: "gap_contest_triage",
      category: "contest_pace",
      topicOrSkill: "Timed Problem Triage & Speed",
      severity: "medium",
      impactScore: impact,
      weaknessScore: weakness,
      urgencyScore: urgency,
      compositePriority: impact * weakness * urgency,
      reasoning: "Practicing timed problem selection prevents getting stuck on a single problem during timed evaluations.",
      recommendedAction: "Run a 30m Virtual Contest simulation.",
      actionType: "contest",
    });
  }

  // Sort by compositePriority descending
  return gaps.sort((a, b) => b.compositePriority - a.compositePriority);
}

export function computeWeeklyStrategy(
  goal: PreparationGoal,
  telemetry: ReadinessTelemetryData
): WeeklyStrategy {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  const targetMinutes = goal.dailyMinutes * goal.daysPerWeek;
  const completedMinutes = telemetry.studyMinutesPast7d;

  const isCP = goal.type === "competitive_programming";
  const isInterview = goal.type === "dsa_interview" || goal.type === "technical_interview" || goal.type === "placement_prep";

  const targetProblems = Math.max(5, Math.round((goal.dailyMinutes * goal.daysPerWeek) / 45));
  const targetContests = isCP ? 2 : 1;
  const targetInterviews = isInterview ? 1 : 0;
  const targetRevisions = Math.max(4, telemetry.srsDueCount + telemetry.srsOverdueCount);

  let status: WeeklyStrategy["status"] = "on_track";
  if (completedMinutes < targetMinutes * 0.4) {
    status = "at_risk";
  } else if (completedMinutes >= targetMinutes) {
    status = "completed";
  }

  const highlightDirective =
    telemetry.srsOverdueCount > 0
      ? `Focus Week: Clear ${telemetry.srsOverdueCount} overdue SRS cards and lock in ${goal.priorityTopics[0] || "DP"} pattern fluency.`
      : isInterview
      ? `Focus Week: Solve 4 Medium ${goal.priorityTopics[0] || "Graph"} problems and complete 1 Mock Technical Interview.`
      : `Focus Week: Maintain contest pace and complete 2 Virtual Contests.`;

  return {
    weekNumber: Math.ceil(today.getDate() / 7),
    startDate: startOfWeek.toISOString().split("T")[0],
    endDate: endOfWeek.toISOString().split("T")[0],
    focusTheme: `${goal.name}: Weekly Cadence`,
    targetStudyMinutes: targetMinutes,
    completedStudyMinutes: completedMinutes,
    problemTargetCount: targetProblems,
    problemsSolvedCount: Math.min(targetProblems, Math.round(telemetry.totalProblemsSolved % targetProblems) || 3),
    contestTargetCount: targetContests,
    contestsCompletedCount: Math.min(targetContests, telemetry.contestsCount),
    interviewTargetCount: targetInterviews,
    interviewsCompletedCount: Math.min(targetInterviews, telemetry.interviewsCount),
    revisionTargetCount: targetRevisions,
    revisionsCompletedCount: Math.max(0, targetRevisions - telemetry.srsOverdueCount),
    status,
    highlightDirective,
  };
}
