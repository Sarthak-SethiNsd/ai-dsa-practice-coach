import { Platform, Difficulty } from "./types";

export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Skipped";
export type RoadmapDifficulty = "Easy" | "Medium" | "Hard" | "Mixed";
export type TopicMastery = "Needs Attention" | "Developing" | "Proficient" | "Mastered";

// ─── Core Task Model ──────────────────────────────────────────────────────────

export interface PracticeTask {
  id: string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topic: string;
  estimatedTime: string; // e.g. "20 mins"
  priority: "High" | "Medium" | "Low";
  status: TaskStatus;
  problemUrl: string;
  platformProblemId?: string;
  assignedDate: string; // ISO date string
  completedDate?: string; // ISO date string
  skippedDate?: string;
  notes?: string;
  // Metadata for adaptive adjustments
  isAdaptive?: boolean;
  adaptationReason?: string;
}

// ─── Daily Mission ────────────────────────────────────────────────────────────

export interface DailyMission {
  date: string; // YYYY-MM-DD
  focusTopic: string;
  targetQuestions: number;
  tasks: PracticeTask[];
  estimatedDuration: string; // e.g. "1.5 hrs"
  completedCount: number;
  isComplete: boolean;
  motivationalNote: string;
}

// ─── Weekly Roadmap ───────────────────────────────────────────────────────────

export interface WeeklyTopicTarget {
  topic: string;
  targetCount: number;
  completedCount: number;
  mastery: TopicMastery;
}

export interface WeeklyRoadmap {
  weekStart: string; // ISO date (Monday)
  weekEnd: string;   // ISO date (Sunday)
  priorityTopics: string[];
  topicTargets: WeeklyTopicTarget[];
  assignedTasks: PracticeTask[];
  completionTarget: number; // total problems to complete
  completedCount: number;
  difficultyMix: { easy: number; medium: number; hard: number };
  estimatedStudyHours: number;
}

// ─── Monthly Goal ─────────────────────────────────────────────────────────────

export interface MasteryTarget {
  topic: string;
  currentMastery: TopicMastery;
  targetMastery: TopicMastery;
  questionsNeeded: number;
  questionsCompleted: number;
}

export interface MonthlyGoal {
  monthLabel: string; // e.g. "August 2026"
  targetTopics: string[];
  totalQuestions: number;
  completedQuestions: number;
  improvementObjective: string;
  targetReadinessScore: number;
  currentReadinessScore: number;
  masteryTargets: MasteryTarget[];
}

// ─── Progress & Analytics ─────────────────────────────────────────────────────

export interface RoadmapProgress {
  totalAssigned: number;
  completed: number;
  skipped: number;
  inProgress: number;
  completionRate: number;   // 0–100
  averageDifficulty: string;
  streak: number;           // consecutive days with ≥1 completion
  consistencyScore: number; // 0–100
  lastActiveDate: string | null;
}

export interface TopicAnalyticsItem {
  topic: string;
  assigned: number;
  completed: number;
  completionRate: number;
  avgDifficulty: string;
}

export interface CompletionTrendPoint {
  date: string;         // YYYY-MM-DD
  completed: number;
  assigned: number;
  cumulativeCompleted: number;
}

export interface RoadmapAnalytics {
  strongestImprovement: string | null;   // topic with best completion rate
  weakestImprovement: string | null;     // topic with lowest completion rate
  mostSolvedTopic: string | null;
  leastSolvedTopic: string | null;
  completionTrend: CompletionTrendPoint[];
  estimatedReadinessIncrease: number;   // projected +N points from completing roadmap
  topicBreakdown: TopicAnalyticsItem[];
  difficultyBreakdown: { easy: number; medium: number; hard: number };
}

// ─── Full Roadmap ─────────────────────────────────────────────────────────────

export interface PracticeRoadmap {
  id: string;
  generatedAt: string;           // ISO timestamp
  basedOnReadinessScore: number;
  dailyMission: DailyMission;
  weeklyRoadmap: WeeklyRoadmap;
  monthlyGoal: MonthlyGoal;
  allTasks: PracticeTask[];      // flat list of every assigned task
  adaptationLevel: "Beginner" | "Intermediate" | "Advanced";
  summaryNote: string;
}

// ─── Storage Key Constants ────────────────────────────────────────────────────

export const ROADMAP_STORAGE_KEYS = {
  ROADMAP: "dsa_practice_roadmap",
  PROGRESS: "dsa_roadmap_progress",
  COMPLETED_TASKS: "dsa_roadmap_completed_tasks",
} as const;
