import { Platform, Difficulty } from "@/services/types";

export type MasteryTier = "Beginner" | "Developing" | "Intermediate" | "Advanced" | "Mastered";

export interface TopicMasteryDetail {
  topic: string;
  masteryLevel: MasteryTier;
  completionPercentage: number; // 0-100
  solvedCount: number;
  totalAssigned: number;
  successRate: number; // 0-100
  reviewQualityScore: number; // 0-100
  avgDifficulty: Difficulty | "Mixed";
  totalReviews: number;
  lastPracticedAt: string | null; // ISO string
}

export interface PlatformAnalyticsDetail {
  platform: Platform;
  name: string;
  solvedCount: number;
  totalAttempted: number;
  successRate: number; // 0-100
  difficultyDistribution: Record<Difficulty, number>;
  estimatedRatingProgression: { date: string; rating: number }[];
  activityTrends: { date: string; count: number }[];
  mostPracticedTopics: { topic: string; count: number }[];
}

export interface AiLearningInsight {
  id: string;
  type: "mistake_pattern" | "complexity_issue" | "weak_cluster" | "under_practiced" | "strength_area" | "suggested_focus";
  title: string;
  description: string;
  severity: "high" | "medium" | "low" | "positive";
  affectedTopics?: string[];
  actionRecommendation: string;
}

export interface TimelinePoint {
  date: string; // YYYY-MM-DD or Month/Week label
  label: string;
  questionsSolved: number;
  reviewsCompleted: number;
  topicsImprovedCount: number;
  readinessScore: number;
  streak: number;
}

export interface ProgressTimeline {
  daily: TimelinePoint[];
  weekly: TimelinePoint[];
  monthly: TimelinePoint[];
}

export type GoalCategory = "weekly_problems" | "monthly_reviews" | "topic_mastery" | "streak";
export type GoalStatus = "in_progress" | "completed" | "at_risk";

export interface AnalyticsGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetTopic?: string;
  targetDate: string; // YYYY-MM-DD
  status: GoalStatus;
  completionPercentage: number;
  estimatedCompletionDate: string;
  predictedSuccessPercentage: number; // 0-100%
  createdAt: string;
}

export interface PredictiveReadinessMetrics {
  interviewReadinessScore: number; // 0-100%
  interviewReadinessConfidence: number; // 0-100%
  contestReadinessScore: number; // 0-100%
  contestReadinessConfidence: number; // 0-100%
  problemSolvingGrowth30dPct: number; // e.g. +24%
  topicCompletionForecastDays: Record<string, number>; // Topic -> estimated days to Mastered
  readinessFactors: {
    factor: string;
    weight: string;
    impact: "Positive" | "Neutral" | "Needs Attention";
    score: number;
  }[];
}

export interface OverallPerformanceMetrics {
  totalProblemsSolved: number;
  totalReviewsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  readinessScoreTrend: { date: string; score: number }[];
  currentReadinessScore: number;
  weeklyActivityScore: number; // 0-100
  monthlyConsistencyScore: number; // 0-100
  overallImprovementPercentage: number; // e.g. +18.5%
}

export interface FullPerformanceAnalytics {
  overall: OverallPerformanceMetrics;
  topicMastery: {
    topics: TopicMasteryDetail[];
    strongestTopics: TopicMasteryDetail[];
    weakestTopics: TopicMasteryDetail[];
    masteryDistribution: Record<MasteryTier, number>;
  };
  platforms: Record<Platform, PlatformAnalyticsDetail>;
  aiInsights: AiLearningInsight[];
  timeline: ProgressTimeline;
  goals: AnalyticsGoal[];
  predictive: PredictiveReadinessMetrics;
  lastUpdated: string;
}
