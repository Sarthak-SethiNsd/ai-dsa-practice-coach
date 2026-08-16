import { Platform, Difficulty } from "@/services/types";

export type RevisionStatus = "due" | "overdue" | "upcoming" | "completed" | "skipped";

export type RevisionFeedback = "remembered" | "forgotten" | "hard" | "easy";

export interface RevisionHistoryRecord {
  id: string;
  revisedAt: string; // ISO date
  feedback: RevisionFeedback;
  aiScore?: number; // 0-100
  intervalDays: number;
  memoryStrengthAfter: number; // 0-100
}

export interface RevisionItem {
  id: string;
  problemId: number | string;
  problemTitle: string;
  url?: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: string[];
  
  // SRS Parameters (SuperMemo SM-2 adaptation)
  repetitions: number;
  intervalDays: number;
  easeFactor: number; // default 2.5
  memoryStrength: number; // 0-100%
  successRate: number; // 0-100%
  
  // Timestamps
  lastSolvedAt: string; // ISO string
  lastRevisedAt?: string; // ISO string
  nextDueDate: string; // YYYY-MM-DD
  
  // Performance Metadata
  lastReviewScore?: number;
  previousSolutionSnippet?: string;
  status: RevisionStatus;
  history: RevisionHistoryRecord[];
  createdAt: string;
}

export interface TopicRetentionMetric {
  topic: string;
  retentionPercentage: number; // 0-100%
  forgettingRate: number; // 0-100%
  totalRevisions: number;
  avgMemoryStrength: number; // 0-100
  dueCount: number;
  overdueCount: number;
  status: "strong" | "moderate" | "at_risk";
}

export interface RevisionCalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dueCount: number;
  completedCount: number;
  missedCount: number;
  items: RevisionItem[];
}

export interface ForgottenConcept {
  topic: string;
  conceptName: string;
  lastFailedDate: string;
  associatedProblems: string[];
  recommendation: string;
}

export interface AiRevisionCoachReport {
  weakTopics: string[];
  forgottenConcepts: ForgottenConcept[];
  recommendedRevisionOrder: RevisionItem[];
  estimatedOverallMastery: number; // 0-100%
  coachingNotes: string[];
}

export interface RevisionNotification {
  id: string;
  type: "due_today" | "overdue" | "streak_risk" | "mastery_milestone";
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  date: string; // ISO date
  read: boolean;
  actionUrl?: string;
}

export interface RevisionDashboardMetrics {
  dueTodayCount: number;
  overdueCount: number;
  upcoming7DaysCount: number;
  revisionStreak: number;
  totalRevisionsCompleted: number;
  overallRetentionScore: number; // 0-100%
  memoryDecayRate30d: number; // e.g. 12%
}

export interface FullSpacedRepetitionData {
  dashboard: RevisionDashboardMetrics;
  dueTodayItems: RevisionItem[];
  overdueItems: RevisionItem[];
  upcomingItems: RevisionItem[];
  allItems: RevisionItem[];
  topicMetrics: TopicRetentionMetric[];
  calendarDays: RevisionCalendarDay[];
  coachReport: AiRevisionCoachReport;
  notifications: RevisionNotification[];
  lastUpdated: string;
}
