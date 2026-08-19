import { Platform, Difficulty } from "@/services/types";
import { MasteryTier } from "@/services/analytics/performanceAnalyticsTypes";

// ─── Time Range ─────────────────────────────────────────────────────────────

export type TimeRangePreset = "7d" | "30d" | "90d" | "all" | "custom";

export interface ReportTimeRange {
  preset: TimeRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
}

// ─── Privacy Controls ───────────────────────────────────────────────────────

export interface ReportPrivacySettings {
  displayName: string;
  showRatings: boolean;
  showContests: boolean;
  showStudyTime: boolean;
  showTopicStats: boolean;
  showAchievements: boolean;
  showWeaknesses: boolean;
  showAIInsights: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: ReportPrivacySettings = {
  displayName: "DSA Explorer",
  showRatings: true,
  showContests: true,
  showStudyTime: true,
  showTopicStats: true,
  showAchievements: true,
  showWeaknesses: true,
  showAIInsights: true,
};

// ─── Achievements ───────────────────────────────────────────────────────────

export type AchievementCategory =
  | "problems"
  | "streak"
  | "contests"
  | "ratings"
  | "topics"
  | "patterns"
  | "consistency"
  | "reviews"
  | "srs";

export type AchievementTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  iconName: string;
  unlocked: boolean;
  unlockedAt: string | null; // ISO string
  currentProgress: number;
  maxProgress: number;
  unit: string;
  badgeColor: string;
}

// ─── Comparison Metrics ─────────────────────────────────────────────────────

export type ComparisonDirection = "improved" | "declined" | "stable" | "new" | "unavailable";

export interface PeriodComparisonMetric {
  metricName: string;
  currentValue: number | string;
  previousValue: number | string | null;
  changeAbsolute: number | string | null;
  changePct: number | null; // e.g. +15.5 or -5.2
  direction: ComparisonDirection;
  unit?: string;
  explanation: string;
}

export interface PeriodComparisonSummary {
  hasPreviousData: boolean;
  previousPeriodLabel: string;
  metrics: {
    problemsSolved: PeriodComparisonMetric;
    contestsRating: PeriodComparisonMetric;
    studyTimeMinutes: PeriodComparisonMetric;
    topicsMastered: PeriodComparisonMetric;
    revisionRetention: PeriodComparisonMetric;
    activeStreak: PeriodComparisonMetric;
    aiReviewScore: PeriodComparisonMetric;
  };
}

// ─── Shareable Progress Snapshot Card ───────────────────────────────────────

export interface ProgressSnapshotCardData {
  displayName: string;
  reportingPeriodLabel: string;
  dateRangeStr: string;
  generatedAt: string;

  // Key stats
  problemsSolved: number;
  currentStreak: number;
  longestStreak: number;
  studyHoursTotal: number;
  overallReadinessScore: number;

  // Highlights
  topTopic: string;
  strongestPattern: string;
  biggestImprovementTopic: string;
  currentRatings: {
    leetcode?: number;
    codeforces?: number;
  };

  // Difficulty breakdown
  difficultyCounts: Record<Difficulty, number>;

  // Top achievements unlocked
  unlockedAchievementCount: number;
  topBadges: { title: string; tier: AchievementTier }[];

  // Privacy toggles applied
  privacy: ReportPrivacySettings;
}

// ─── Progress Timeline Milestone ────────────────────────────────────────────

export interface ProgressMilestone {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: "problem" | "contest" | "topic" | "streak" | "revision" | "review" | "achievement";
  iconName: string;
  valueBadge?: string;
}

// ─── AI Progress Narrative ──────────────────────────────────────────────────

export interface AIProgressNarrative {
  overallAssessment: string;
  whatImproved: string[];
  whatIsStrong: string[];
  whatIsHoldingBack: string[];
  nextFocusAreas: string[];
  motivationalNote: string;
  isAiGenerated: boolean;
  generatedAt: string;
}

// ─── Full Comprehensive Report Data ─────────────────────────────────────────

export interface ProgressReportData {
  reportId: string;
  title: string;
  timeRange: ReportTimeRange;
  generatedAt: string;
  privacy: ReportPrivacySettings;

  // Snapshot Card representation
  snapshotCard: ProgressSnapshotCardData;

  // 1. Summary & Key Highlights
  summary: {
    totalSolved: number;
    totalAttempted: number;
    acceptanceRate: number;
    studyHours: number;
    activeDaysCount: number;
    currentStreak: number;
    longestStreak: number;
    readinessScore: number;
    revisionsCompleted: number;
    aiReviewsCount: number;
    contestsParticipated: number;
  };

  // 2. Problem Solving & Difficulty Distribution
  problemSolving: {
    total: number;
    byDifficulty: Record<Difficulty, number>;
    byPlatform: Record<Platform, number>;
    dailyActivity: { date: string; count: number }[];
  };

  // 3. Topics & Mastery
  topics: {
    totalTracked: number;
    masteredCount: number;
    proficientCount: number;
    developingCount: number;
    needsAttentionCount: number;
    topTopics: {
      topic: string;
      solvedCount: number;
      masteryTier: MasteryTier;
      successRate: number;
      qualityScore: number;
    }[];
  };

  // 4. Pattern Library Performance
  patterns: {
    patternsTracked: number;
    overallPatternSuccessRate: number;
    topPatterns: {
      name: string;
      total: number;
      mastered: number;
      successRate: number;
      commonMistake?: string;
    }[];
  };

  // 5. Contest Intelligence
  contests: {
    totalContests: number;
    platformsParticipated: string[];
    currentCodeforcesRating: number;
    peakCodeforcesRating: number;
    bestRank: number | null;
    avgProblemsSolvedPerContest: number;
    ratingHistory: { date: string; contestName: string; ratingAfter: number; delta: number }[];
  };

  // 6. Study Sessions & Focus
  studySessions: {
    totalSessions: number;
    totalMinutesSpent: number;
    averageSessionMinutes: number;
    completionRate: number;
    categoryDistribution: Record<string, number>;
  };

  // 7. Spaced Repetition (SRS)
  spacedRepetition: {
    totalRevisionsCompleted: number;
    overallRetentionScore: number;
    dueTodayCount: number;
    overdueCount: number;
    topRetainedTopics: string[];
  };

  // 8. Weakness & Mistake Patterns
  weaknesses: {
    topMistakeTypes: { category: string; label: string; count: number }[];
    weakestTopics: string[];
    uncertainPatterns: string[];
  };

  // 9. Period Comparison (Deltas)
  comparison: PeriodComparisonSummary;

  // 10. Achievements
  achievements: {
    totalUnlocked: number;
    totalAvailable: number;
    allAchievements: Achievement[];
    recentUnlocks: Achievement[];
  };

  // 11. Timeline
  timeline: ProgressMilestone[];

  // 12. AI Progress Narrative & Next Steps
  aiNarrative: AIProgressNarrative;
}

// ─── Saved Report Record (History) ──────────────────────────────────────────

export interface SavedReportRecord {
  id: string;
  title: string;
  timeRangePreset: TimeRangePreset;
  startDate: string;
  endDate: string;
  generatedAt: string;
  summaryHighlights: {
    problemsSolved: number;
    studyHours: number;
    streak: number;
    readinessScore: number;
    contestsRating: number;
  };
  privacySnapshot: ReportPrivacySettings;
}
