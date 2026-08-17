import { Platform, Difficulty } from "@/services/types";

export type StudyFocusCategory =
  | "balanced"
  | "weak_topics"
  | "revision"
  | "interview_prep"
  | "contest_prep"
  | "roadmap_progress";

export type SessionTaskType =
  | "overdue_revision"
  | "due_revision"
  | "weak_topic"
  | "roadmap_priority"
  | "ai_recommendation"
  | "contest_requirement";

export type StudyTaskStatus = "pending" | "in_progress" | "solved" | "failed" | "skipped";

export interface StudyTask {
  id: string;
  problemId: number | string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: string[];
  estimatedMinutes: number;
  taskType: SessionTaskType;
  problemUrl?: string;
  status: StudyTaskStatus;
  startedAt?: string;
  completedAt?: string;
  timeSpentSeconds: number;
  notes?: string;
  previousSnippet?: string;
}

export interface StudySessionConfig {
  durationMinutes: number; // 15, 30, 45, 60, custom
  focusCategory: StudyFocusCategory;
  targetTopics?: string[];
  targetDifficulty?: Difficulty | "Mixed";
}

export interface AdaptivePracticeSignal {
  difficultyAdjustment: "increase" | "maintain" | "decrease";
  targetFocusTopics: string[];
  nextRecommendedDurationMinutes: number;
  confidenceModifier: number; // e.g. +5%
  reason: string;
}

export interface CompletedStudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startedAt: string; // ISO string
  completedAt: string; // ISO string
  durationMinutes: number;
  actualTimeSpentSeconds: number;
  focusCategory: StudyFocusCategory;
  tasks: StudyTask[];
  
  // Analytics
  attemptedCount: number;
  solvedCount: number;
  failedCount: number;
  skippedCount: number;
  avgTimePerProblemSeconds: number;
  topicDistribution: Record<string, number>;
  difficultyDistribution: Record<Difficulty, number>;
  revisionSuccessRatePct: number;
  completionRatePct: number;
  
  adaptiveSignal: AdaptivePracticeSignal;
  coachSummary: {
    strengthsNoticed: string[];
    weaknessesNoticed: string[];
    pacingFeedback: string;
    nextSessionRecommendation: string;
  };
}

export interface StudyStreakData {
  currentStreak: number;
  longestStreak: number;
  totalSessionsCompleted: number;
  totalStudyMinutes: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  weeklyConsistency: Record<string, boolean>; // "Mon": true, "Tue": false, etc.
}

export interface StudyAnalyticsData {
  dailyStudyMinutes30d: { date: string; minutes: number }[];
  weeklyStudyMinutes12w: { weekLabel: string; minutes: number }[];
  monthlyStudyMinutes12m: { monthLabel: string; minutes: number }[];
  avgSessionCompletionPct: number;
  revisionVsNewRatioPct: number; // % of problems that were revisions
  focusEfficiencyPct: number; // % of session time spent actively solving
  topicDistributionAllTime: Record<string, number>;
  difficultyDistributionAllTime: Record<Difficulty, number>;
}
