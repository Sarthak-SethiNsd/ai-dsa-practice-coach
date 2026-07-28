import { Problem, Platform, Difficulty, RecommendationPlatformConfig } from "@/services/types";

export interface AiRecommendationRequest {
  candidateProblems: Problem[];
  selectedLanguage: string;
  selectedTopics: string[];
  platformConfig: RecommendationPlatformConfig;
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

export interface AiReviewRequest {
  problemTitle: string;
  problemUrl?: string;
  problemStatement?: string;
  code: string;
  language: string;
  difficulty?: string;
  topics?: string[];
}

export interface AiReviewResponse {
  overallFeedback: string;
  correctnessAnalysis: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimizationSuggestions: string[];
  edgeCases: string[];
  learningTips: string[];
}
