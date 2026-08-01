import { Problem, Platform, Difficulty, RecommendationPlatformConfig } from "@/services/types";

export type ReviewCategory =
  | "OPTIMAL_COMPLEXITY"
  | "OPTIMAL_HINTS"
  | "OPTIMAL_FULL_SOLUTION"
  | "MY_COMPLEXITY"
  | "CORRECTNESS_CHECK"
  | "EDGE_CASE_ANALYSIS"
  | "MY_HINTS"
  | "FULL_CODE_REVIEW";

export interface ReviewSession {
  sessionId: string;
  uploadedCode: string;
  language: string;
  uploadedAt: string;
  selectedCategory?: ReviewCategory;
  problemTitle?: string;
  problemUrl?: string;
  problemStatement?: string;
}

export interface ReviewUsageMetadata {
  service: "ReviewAI";
  category: ReviewCategory;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ReviewWeeklyUsage {
  userId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  totalReviewRequests: number;
  weekStartTimestamp: string;
}

export interface ReviewQuotaStatusResponse {
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    totalRequests: number;
  };
  limits: {
    weeklyTokenLimit: number;
    weeklyRequestLimit: number | null;
    remainingTokens: number;
    remainingRequests: number | null;
  };
  period: {
    weekStart: string;
    weekEnd: string;
  };
}

export interface RecentHistoryItem {
  problemId: number;
  problemTitle: string;
  difficulty: string;
  status: string;
  topics?: string[];
}

export interface UserProfileMetadata {
  selectedLanguage: string;
  selectedTopics: string[];
  difficultyPreference?: string;
  totalSolved?: number;
}

export interface AiRecommendationRequest {
  candidateProblems: Problem[];
  selectedLanguage: string;
  selectedTopics: string[];
  platformConfig: RecommendationPlatformConfig;
  userProfile?: UserProfileMetadata;
  recentHistory?: RecentHistoryItem[];
}

export interface AiRecommendationResponseItem {
  id: number;
  platform: Platform;
  platformProblemId: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  topics: string[];
  selectionReason: string; // 1-sentence explanation of why this problem was selected
}

export interface AiRecommendationResult {
  rankedProblems: AiRecommendationResponseItem[];
  recommendationReason: string;
  strengthsMatched: string[];
  suggestedLearningOrder: string[];
}

export interface AiReviewRequest {
  sessionId?: string;
  problemTitle?: string;
  problemUrl?: string;
  problemStatement?: string;
  code: string;
  language: string;
  difficulty?: string;
  topics?: string[];
  category?: ReviewCategory;
  config?: Record<string, unknown>;
}

export interface AiReviewResponse {
  sessionId?: string;
  category?: ReviewCategory;
  categoryTitle?: string;
  summary?: string;
  overallFeedback: string;
  correctnessAnalysis: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimizationSuggestions: string[];
  edgeCases: string[];
  learningTips: string[];
  hints?: string[];
  optimalCode?: string;
  usage?: ReviewUsageMetadata;
}
