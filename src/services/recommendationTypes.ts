import { ReviewCategory } from "./ai/aiTypes";

export type ActionPriority = "High" | "Medium" | "Low";

export interface TopicPerformance {
  topic: string;
  avgScore: number;
  totalReviews: number;
  timeComplexityMistakes: number;
  spaceComplexityMistakes: number;
  edgeCaseMistakes: number;
  optimizationMistakes: number;
  lastReviewedAt: string | null;
  masteryLevel: "Mastered" | "Proficient" | "Developing" | "Needs Attention";
}

export interface WeakTopicAnalysis {
  weakestTopic: {
    name: string;
    score: number;
    reason: string;
  } | null;
  secondWeakestTopic: {
    name: string;
    score: number;
    reason: string;
  } | null;
  mostImprovedTopic: {
    name: string;
    scoreDelta: number;
    reason: string;
  } | null;
  mostNeglectedTopic: {
    name: string;
    daysSinceReview: number;
    reason: string;
  } | null;
  confidenceScore: number; // 0-100%
  topicBreakdown: TopicPerformance[];
}

export interface TodayPlan {
  focusArea: string;
  improvementGoal: string;
  suggestedCategory?: ReviewCategory;
  recommendedTopic?: string;
}

export interface WeeklyPlan {
  topTopicsToStudy: string[];
  rationale: string;
}

export interface MonthlyPlan {
  longTermTarget: string;
  targetReadinessScore: number;
}

export interface PersonalizedLearningPlan {
  today: TodayPlan;
  thisWeek: WeeklyPlan;
  thisMonth: MonthlyPlan;
}

export interface SmartActionCard {
  id: string;
  title: string;
  priority: ActionPriority;
  category: string;
  reason: string;
  suggestedAction: string;
  targetTopic?: string;
  actionUrl?: string;
  completed?: boolean;
}

export interface ReadinessScoreDetail {
  score: number; // 0-100
  label: string;
  status: "Excellent" | "Good" | "Needs Improvement" | "Critical";
  keyFactor: string;
}

export interface ReadinessScores {
  problemSolving: ReadinessScoreDetail;
  optimization: ReadinessScoreDetail;
  edgeCases: ReadinessScoreDetail;
  communication: ReadinessScoreDetail;
  consistency: ReadinessScoreDetail;
  overallScore: number;
}

export interface TrendAnalysisMetrics {
  trend7Day: number; // Average score of last 7 reviews
  trend30Day: number; // Average score of last 30 reviews
  improvementPercentage: number;
  declinePercentage: number;
  scoreVelocity: number; // Score difference per 10 reviews
  totalReviewsAnalyzed: number;
}

export interface RecommendationSnapshot {
  id: string;
  timestamp: string; // ISO String
  overallReadinessScore: number;
  weakTopics: WeakTopicAnalysis;
  learningPlan: PersonalizedLearningPlan;
  actionCards: SmartActionCard[];
  readinessScores: ReadinessScores;
  trendAnalysis: TrendAnalysisMetrics;
  topicPerformance: TopicPerformance[];
  summaryNote: string;
}

export interface ReadinessScoreDiff {
  metric: string;
  currentScore: number;
  previousScore: number;
  diff: number;
}

export interface RecommendationComparison {
  baselineSnapshot: RecommendationSnapshot;
  currentSnapshot: RecommendationSnapshot;
  readinessDiffs: ReadinessScoreDiff[];
  weakestTopicChanged: boolean;
  previousWeakestTopic: string | null;
  currentWeakestTopic: string | null;
  resolvedActionsCount: number;
  overallScoreChange: number;
}
