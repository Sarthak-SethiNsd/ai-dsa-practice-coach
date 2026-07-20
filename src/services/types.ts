// Shared types for the problem recommendation service

export type Platform = 'leetcode' | 'codeforces';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Topic = string;

export interface Problem {
  id: number;
  title: string;
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
}

export interface RecommendationRequest {
  topics: Topic[];
  platforms: Platform[];
  countPerPlatform: number;
  difficulty?: Difficulty | 'Mixed';
  totalLimit?: number;
}

export interface ProblemService {
  getProblems(request: RecommendationRequest): Promise<Problem[]>;
}

// Adapter interface for converting platform-specific data to common Problem format
export interface ProblemAdapter<T> {
  adapt(rawData: T): Problem;
}

// Adapter interface for converting platform-specific data to common Problem format
export interface ProblemAdapter<T> {
  adapt(rawData: T): Problem;
}