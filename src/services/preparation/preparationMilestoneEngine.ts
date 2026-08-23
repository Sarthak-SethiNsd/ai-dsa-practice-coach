import {
  PreparationGoal,
  PreparationMilestone,
} from "./preparationTypes";
import { ReadinessTelemetryData } from "./preparationScoring";

export function generatePreparationMilestones(
  goal: PreparationGoal,
  telemetry: ReadinessTelemetryData
): PreparationMilestone[] {
  const milestones: PreparationMilestone[] = [];

  // Milestone 1: Priority Topic Mastery
  const targetTopics = Math.max(3, goal.priorityTopics.length);
  const currentTopics = Math.min(targetTopics, telemetry.targetTopicsCovered);
  const m1Completed = currentTopics >= targetTopics;
  milestones.push({
    id: "m_priority_topics",
    title: `Cover All ${targetTopics} Priority DSA Topics`,
    category: "topic_mastery",
    targetValue: targetTopics,
    currentValue: currentTopics,
    unit: "topics",
    dueDate: goal.targetDate,
    isCompleted: m1Completed,
    completedAt: m1Completed ? new Date().toISOString() : undefined,
    progressPercent: Math.round((currentTopics / targetTopics) * 100),
    importance: "high",
  });

  // Milestone 2: Medium/Hard Problem Volume
  const targetMedHard = goal.currentSkillLevel === "advanced" ? 30 : 15;
  const currentMedHard = Math.min(targetMedHard, telemetry.solvedMediumHardCount);
  const m2Completed = currentMedHard >= targetMedHard;
  milestones.push({
    id: "m_med_hard_volume",
    title: `Solve ${targetMedHard} Medium/Hard Algorithmic Problems`,
    category: "problem_count",
    targetValue: targetMedHard,
    currentValue: currentMedHard,
    unit: "problems",
    dueDate: goal.targetDate,
    isCompleted: m2Completed,
    completedAt: m2Completed ? new Date().toISOString() : undefined,
    progressPercent: Math.round((currentMedHard / targetMedHard) * 100),
    importance: "high",
  });

  // Milestone 3: Pattern Mastery Verification
  const targetPatterns = 6;
  const currentPatterns = Math.min(targetPatterns, telemetry.masteredNotesCount);
  const m3Completed = currentPatterns >= targetPatterns;
  milestones.push({
    id: "m_pattern_mastery",
    title: `Master ${targetPatterns} Algorithmic Patterns in Knowledge Base`,
    category: "topic_mastery",
    targetValue: targetPatterns,
    currentValue: currentPatterns,
    unit: "patterns",
    dueDate: goal.targetDate,
    isCompleted: m3Completed,
    completedAt: m3Completed ? new Date().toISOString() : undefined,
    progressPercent: Math.round((currentPatterns / targetPatterns) * 100),
    importance: "medium",
  });

  // Milestone 4: Virtual Contest Drills
  const targetContests = goal.type === "competitive_programming" ? 5 : 3;
  const currentContests = Math.min(targetContests, telemetry.contestsCount);
  const m4Completed = currentContests >= targetContests;
  milestones.push({
    id: "m_virtual_contests",
    title: `Complete ${targetContests} Timed Virtual Contests`,
    category: "contest_simulation",
    targetValue: targetContests,
    currentValue: currentContests,
    unit: "contests",
    dueDate: goal.targetDate,
    isCompleted: m4Completed,
    completedAt: m4Completed ? new Date().toISOString() : undefined,
    progressPercent: Math.round((currentContests / targetContests) * 100),
    importance: goal.type === "competitive_programming" ? "high" : "standard",
  });

  // Milestone 5: Mock Technical Interviews
  const targetInterviews =
    goal.type === "dsa_interview" || goal.type === "technical_interview" || goal.type === "placement_prep"
      ? 3
      : 1;
  const currentInterviews = Math.min(targetInterviews, telemetry.interviewsCount);
  const m5Completed = currentInterviews >= targetInterviews;
  milestones.push({
    id: "m_mock_interviews",
    title: `Complete ${targetInterviews} AI Mock Technical Interviews`,
    category: "interview_simulation",
    targetValue: targetInterviews,
    currentValue: currentInterviews,
    unit: "interviews",
    dueDate: goal.targetDate,
    isCompleted: m5Completed,
    completedAt: m5Completed ? new Date().toISOString() : undefined,
    progressPercent: Math.round((currentInterviews / targetInterviews) * 100),
    importance: targetInterviews > 1 ? "high" : "standard",
  });

  // Milestone 6: Spaced Repetition Consistency
  const targetSRS = 10;
  const currentSRS = Math.min(targetSRS, telemetry.srsMasteredCount);
  const m6Completed = currentSRS >= targetSRS && telemetry.srsOverdueCount === 0;
  milestones.push({
    id: "m_srs_mastery",
    title: `Lock in ${targetSRS} Problems in Spaced Repetition`,
    category: "revision_streak",
    targetValue: targetSRS,
    currentValue: currentSRS,
    unit: "cards",
    dueDate: goal.targetDate,
    isCompleted: m6Completed,
    completedAt: m6Completed ? new Date().toISOString() : undefined,
    progressPercent: Math.round((currentSRS / targetSRS) * 100),
    importance: "standard",
  });

  return milestones;
}
