import { Platform, Difficulty } from "@/services/types";

// ─── Contest Configuration ───────────────────────────────────────────────────

export type VCPlatform = Platform | "mixed";

export type VCContestType =
  | "Standard"
  | "Weak Topic Drill"
  | "Rating Challenge"
  | "Interview Preparation"
  | "Custom";

export type VCDifficulty = Difficulty | "Adaptive" | "Mixed";

export type VCDurationMinutes = 15 | 30 | 60 | 90 | 120;

export type VCProblemCount = 2 | 3 | 4 | 5;

export interface VCConfig {
  platform: VCPlatform;
  contestType: VCContestType;
  difficulty: VCDifficulty;
  durationMinutes: VCDurationMinutes | number;
  problemCount: VCProblemCount | number;
  topic: string; // "All Topics", "Weak Topics", or a specific topic name
  sequentialMode: boolean;
}

// ─── Problem Model ────────────────────────────────────────────────────────────

export type VCProblemStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "solved"
  | "failed"
  | "skipped";

export interface VCProblem {
  id: number;
  platformProblemId?: string;
  contestLabel: string; // "A", "B", "C", "D", "E"
  title: string;
  difficulty: Difficulty;
  topics: string[];
  platform: Platform;
  url?: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  referenceComplexity: {
    time: string;
    space: string;
  };
  basePoints: number; // 250 = Easy, 500 = Medium, 1000 = Hard
}

// ─── Submission Model ─────────────────────────────────────────────────────────

export type VCSubmissionVerdict =
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "runtime_error"
  | "evaluated_locally"
  | "not_submitted";

export interface VCSubmission {
  id: string;
  problemId: number;
  code: string;
  language: string;
  timestamp: string; // ISO
  verdict: VCSubmissionVerdict;
  executionTimeMs?: number;
  notes?: string;
  isFirstAccepted?: boolean;
}

// ─── Problem State Inside Active Contest ──────────────────────────────────────

export interface VCProblemState {
  problem: VCProblem;
  status: VCProblemStatus;
  code: string;
  language: string;
  submissions: VCSubmission[];
  startedAt?: string;
  solvedAt?: string;
  skippedAt?: string;
  pointsEarned: number;
  penaltyMinutes: number;
  timeToSolveSeconds?: number;
}

// ─── Active Contest Session ───────────────────────────────────────────────────

export type VCSessionStatus =
  | "in_progress"
  | "paused"
  | "completed"
  | "abandoned"
  | "expired";

export interface VCSession {
  id: string;
  config: VCConfig;
  status: VCSessionStatus;
  startedAt: string; // ISO
  pausedAt?: string;
  endedAt?: string;
  totalDurationSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  problems: VCProblemState[];
  activeProblemIndex: number;
  totalScore: number;
  totalPenaltyMinutes: number;
  solvedCount: number;
  attemptedCount: number;
}

// ─── Scoring Breakdown ────────────────────────────────────────────────────────

export interface VCScoreBreakdown {
  baseScore: number;
  timeBonus: number;
  penaltyDeduction: number;
  finalScore: number;
  maxPossibleScore: number;
  solveRate: number; // 0-100%
  accuracy: number; // correct submissions / total submissions * 100
  avgSolveTimeSeconds: number;
  fastestSolveSeconds?: number;
  slowestSolveSeconds?: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// ─── Topic Performance ────────────────────────────────────────────────────────

export interface VCTopicPerformance {
  topic: string;
  attempted: number;
  solved: number;
  avgTimeSeconds: number;
  performance: "strong" | "average" | "weak";
}

// ─── Post-Contest AI Coach Advice ─────────────────────────────────────────────

export interface VCAICoachAdvice {
  whatWentWell: string;
  timeManagementFeedback: string;
  topicsToImprove: string[];
  mistakesToRevisit: string[];
  practiceNext: string;
  nextContestDifficulty: "easier" | "similar" | "harder";
  nextContestDifficultyReason: string;
}

// ─── Full Contest Report ──────────────────────────────────────────────────────

export interface VCContestReport {
  id: string;
  sessionId: string;
  config: VCConfig;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  score: VCScoreBreakdown;
  problemStates: VCProblemState[];
  topicPerformance: VCTopicPerformance[];
  strengths: string[];
  weaknesses: string[];
  aiCoachAdvice: VCAICoachAdvice;
  learningLoopActions: string[];
  status: "completed" | "abandoned" | "expired";
}

// ─── Readiness Profile ────────────────────────────────────────────────────────

export type VCReadinessTier =
  | "Beginner"
  | "Developing"
  | "Competitive"
  | "Strong"
  | "Advanced";

export interface VCReadinessProfile {
  score: number; // 0-100
  tier: VCReadinessTier;
  bandLabel: string;
  solveRate: number;
  avgAccuracy: number;
  avgTimeEfficiency: number;
  topicCoverage: number;
  recentTrend: "improving" | "stable" | "declining";
  contestsCompleted: number;
  lastUpdated: string;
}

// ─── Contest History Record ───────────────────────────────────────────────────

export interface VCHistoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  platform: VCPlatform;
  contestType: VCContestType;
  durationMinutes: number;
  problemCount: number;
  problemsSolved: number;
  score: number;
  accuracy: number;
  avgSolveTimeSeconds: number;
  mainStrengths: string[];
  mainWeaknesses: string[];
  status: "completed" | "abandoned" | "expired";
  reportId?: string;
}

// ─── Analytics Summary ────────────────────────────────────────────────────────

export interface VCAnalyticsSummary {
  timeframe: string;
  totalContests: number;
  avgScore: number;
  avgSolveRate: number;
  avgAccuracy: number;
  scoreTrend: { date: string; score: number }[];
  solveRateTrend: { date: string; solveRate: number }[];
  difficultyTrend: {
    date: string;
    hardPct: number;
    medPct: number;
    easyPct: number;
  }[];
  avgSolveTimeByDifficulty: { easy: number; medium: number; hard: number };
  topicPerformance: { topic: string; avgScore: number; attempts: number }[];
  platformBreakdown: { platform: string; count: number; avgScore: number }[];
}
