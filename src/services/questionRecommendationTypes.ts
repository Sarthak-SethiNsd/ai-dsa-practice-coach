import { Platform, Difficulty } from "./types";

export type QuestionCategory =
  | "Top Recommendation"
  | "Stretch Challenge"
  | "Confidence Builder"
  | "Interview Preparation";

export type QuestionPriority = "High" | "Medium" | "Low";
export type QuestionRecommendationStatus = "Pending" | "Viewed" | "Solved" | "Skipped";

export interface QuestionRecommendation {
  id: string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topic: string;
  rating?: number; // Codeforces problem rating (e.g. 1200, 1500) or LeetCode numeric ID
  problemUrl: string;
  recommendationReason: string;
  priority: QuestionPriority;
  estimatedTime: string; // e.g. "20 mins"
  confidenceScore: number; // 0 - 100%
  category: QuestionCategory;
  platformProblemId?: string;
  solutions?: Record<string, string>;
  complexity?: {
    time: string;
    space: string;
  };
  takeaways?: string[];
  status: QuestionRecommendationStatus;
  recommendedAt: string; // ISO date string
}

export interface RecommendationBatch {
  id: string;
  generatedAt: string; // ISO date string
  sourceTopics: string[];
  recommendedQuestions: QuestionRecommendation[];
  targetGoal: string;
  readinessScore: number;
}

export interface QuestionPerformance {
  questionId: string;
  attempts: number;
  solved: boolean;
  completionTime?: string;
  scoreImpact: number;
}

export interface QuestionAnalytics {
  mostRecommendedTopics: { topic: string; count: number }[];
  solvedRecommendations: number;
  ignoredRecommendations: number;
  skippedRecommendations: number;
  totalRecommended: number;
  successRate: number; // 0 - 100%
  recommendationAccuracy: number; // 0 - 100%
}

export interface QuestionRecommendationFilter {
  platform: Platform | "All";
  difficulty: Difficulty | "All";
  topic: string | "All";
  category: QuestionCategory | "All";
  status: QuestionRecommendationStatus | "All";
}

export const QUESTION_STORAGE_KEYS = {
  BATCH: "dsa_question_recommendations_batch",
  SOLVED: "dsa_question_recommendations_solved",
  SKIPPED: "dsa_question_recommendations_skipped",
  VIEWED: "dsa_question_recommendations_viewed",
} as const;
