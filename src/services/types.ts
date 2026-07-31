// Shared types for the problem recommendation service

export type Platform = 'leetcode' | 'codeforces';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Topic = string;

export interface Problem {
  id: number;
  platformProblemId?: string; // Stable platform ID (e.g. "1", "101", "1500B")
  title: string;
  url?: string; // Real problem link
  difficulty: Difficulty;
  topics: Topic[];
  estimated: string;
  solutions: Record<string, string>;
  complexity: {
    time: string;
    space: string;
  };
  takeaways: string[];
  platform: Platform;
  selectionReason?: string; // Concise 1-sentence AI selection reason
}

export interface RecommendationRequest {
  topics: Topic[];
  platforms: Platform[];
  countPerPlatform: number;
  difficulty?: Difficulty | 'Mixed';
  totalLimit?: number;
}

/**
 * QuestionProvider interface for platform data fetching.
 * Allows replacing mock datasets with real APIs (LeetCode, Codeforces) seamlessly.
 */
export interface QuestionProvider {
  platform: Platform;
  getProblems(request: RecommendationRequest): Promise<Problem[]>;
}

export type ProblemService = QuestionProvider;

export interface RecommendationPlatformConfig {
  platform: Platform;
  questionsPerDay: number;
  difficulty: Difficulty | 'Mixed';
}

export interface RecommendationConfig {
  platformConfigs: RecommendationPlatformConfig[];
  lastRecommendationSettingsUpdate?: string;
}

export type SessionQuestionStatus = "Not Started" | "In Progress" | "Completed" | "Skipped";

export interface SessionQuestionItem {
  problemId: number;
  platformProblemId?: string;
  problemTitle: string;
  url?: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: Topic[];
  estimated: string;
  solutions: Record<string, string>;
  complexity: {
    time: string;
    space: string;
  };
  takeaways: string[];
  selectionReason?: string;
  status: SessionQuestionStatus;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
}

export interface AiReviewResult {
  overallFeedback: string;
  correctnessAnalysis: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimizationSuggestions: string[];
  edgeCases: string[];
  learningTips: string[];
  reviewedAt: string;
}

export interface DailyPracticeSession {
  sessionId: string; // e.g. "session-2026-07-24"
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  platformConfigs: RecommendationPlatformConfig[];
  questions: SessionQuestionItem[];
  metadata: {
    totalQuestions: number;
    completedCount: number;
    skippedCount: number;
    inProgressCount: number;
    topicsCovered: string[];
    recommendationReason?: string;
    strengthsMatched?: string[];
    suggestedLearningOrder?: string[];
  };
}

// Adapter interface for converting platform-specific data to common Problem format
export interface ProblemAdapter<T> {
  adapt(rawData: T): Problem;
}