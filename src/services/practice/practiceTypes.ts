import { Difficulty, Platform } from "@/services/types";
import { RecommendationMode } from "@/services/recommendations/recommendationTypes";

// ─── Session Mode ─────────────────────────────────────────────────────────────

export type PracticeSessionMode =
  | "smart_practice"
  | "weakness_repair"
  | "pattern_mastery"
  | "revision"
  | "interview_prep"
  | "contest_prep"
  | "goal_prep"
  | "challenge";

export type PracticeSessionStatus =
  | "NOT_STARTED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "ABANDONED"
  | "EXPIRED";

export type PracticeOutcomeType =
  | "SOLVED_INDEPENDENTLY"
  | "SOLVED_WITH_HINTS"
  | "FAILED"
  | "SKIPPED"
  | "TIMED_OUT"
  | "ABANDONED";

export type AdaptationAdjustmentType =
  | "DIFFICULTY_UP"
  | "DIFFICULTY_DOWN"
  | "PREREQ_INSERTION"
  | "QUEUE_TRIM"
  | "CHALLENGE_ADD"
  | "SKILL_ADVANCE"
  | "REPAIR_MODE"
  | "BUDGET_TRIM";

export type DifficultyPreference = Difficulty | "Mixed" | "Adaptive";

// ─── Session Configuration ────────────────────────────────────────────────────

export interface PracticeSessionConfig {
  mode: PracticeSessionMode;
  durationMinutes: number;
  targetProblemCount: number;
  preferredPlatform: Platform | "any";
  difficultyPreference: DifficultyPreference;
  targetSkill: string | null;
  targetPattern: string | null;
  activeGoalId: string | null;
  allowRevisionProblems: boolean;
  allowChallengeProblems: boolean;
  preferredTopics: string[];
}

export const SESSION_PRESETS: Record<number, Partial<PracticeSessionConfig>> = {
  15: {
    durationMinutes: 15,
    targetProblemCount: 1,
    difficultyPreference: "Easy",
    allowRevisionProblems: true,
    allowChallengeProblems: false,
  },
  30: {
    durationMinutes: 30,
    targetProblemCount: 2,
    difficultyPreference: "Mixed",
    allowRevisionProblems: true,
    allowChallengeProblems: false,
  },
  45: {
    durationMinutes: 45,
    targetProblemCount: 2,
    difficultyPreference: "Mixed",
    allowRevisionProblems: true,
    allowChallengeProblems: false,
  },
  60: {
    durationMinutes: 60,
    targetProblemCount: 3,
    difficultyPreference: "Mixed",
    allowRevisionProblems: true,
    allowChallengeProblems: true,
  },
  90: {
    durationMinutes: 90,
    targetProblemCount: 4,
    difficultyPreference: "Mixed",
    allowRevisionProblems: true,
    allowChallengeProblems: true,
  },
  120: {
    durationMinutes: 120,
    targetProblemCount: 5,
    difficultyPreference: "Mixed",
    allowRevisionProblems: true,
    allowChallengeProblems: true,
  },
};

export function getDefaultConfig(
  mode: PracticeSessionMode = "smart_practice",
  durationMinutes = 60
): PracticeSessionConfig {
  const preset = SESSION_PRESETS[durationMinutes] ?? {};
  return {
    mode,
    durationMinutes,
    targetProblemCount: 3,
    preferredPlatform: "any",
    difficultyPreference: "Mixed",
    targetSkill: null,
    targetPattern: null,
    activeGoalId: null,
    allowRevisionProblems: true,
    allowChallengeProblems: true,
    preferredTopics: [],
    ...preset,
  };
}

// ─── Session Problem ──────────────────────────────────────────────────────────

export interface TimeEstimate {
  estimatedMinutes: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  basis: string; // e.g. "historical median", "difficulty default"
}

export interface PracticeSessionProblem {
  problemId: number;
  platformProblemId: string;
  platform: Platform;
  title: string;
  url: string;
  difficulty: Difficulty;
  topics: string[];
  primaryPattern: string;
  targetSkill: string;
  recommendationReason: string;
  fullExplanation: string;
  timeEstimate: TimeEstimate;
  isRevision: boolean;
  isPrerequisiteBridge: boolean;
  isChallenge: boolean;
  mode: RecommendationMode;
  recommendationScore: number;
  revisionItemId?: string; // If this is an SRS revision problem
}

// ─── Session Outcome ──────────────────────────────────────────────────────────

export interface PracticeSessionOutcome {
  problemId: number;
  sessionProblemIndex: number;
  outcomeType: PracticeOutcomeType;
  actualSolveTimeSeconds: number;
  estimatedSolveTimeSeconds: number;
  hintCount: number;
  perceivedDifficulty: "too_easy" | "appropriate" | "too_hard" | null;
  sessionPosition: number; // 1-indexed, which problem in the session
  timestamp: string; // ISO
  notes: string;
  adaptationTriggered: boolean;
}

// ─── Adaptation Record ────────────────────────────────────────────────────────

export interface PracticeAdaptationRecord {
  id: string;
  triggerOutcome: PracticeOutcomeType;
  triggerProblemId: number;
  timestamp: string;
  reason: string; // Human-readable explanation shown to user
  adjustmentType: AdaptationAdjustmentType;
  problemsAdded: number[];
  problemsRemoved: number[];
}

// ─── Session Score ────────────────────────────────────────────────────────────

export interface PracticeSessionScore {
  overallScore: number; // 0-100
  completionScore: number; // 0-25
  independentSolveScore: number; // 0-30
  difficultyBonus: number; // 0-20
  timeEfficiencyScore: number; // 0-15
  goalAlignmentScore: number; // 0-10
  label: "Exceptional" | "Strong" | "Good" | "Fair" | "Developing";
  explanation: string;
}

// ─── Session Analytics ────────────────────────────────────────────────────────

export interface PracticeSessionAnalytics {
  totalTimeSeconds: number;
  problemsAttempted: number;
  problemsSolved: number;
  independentSolves: number;
  hintAssistedSolves: number;
  failures: number;
  skipped: number;
  timedOut: number;
  avgSolveTimeSeconds: number;
  difficultyDistribution: { Easy: number; Medium: number; Hard: number };
  skillsPracticed: string[];
  patternsPracticed: string[];
  strongestEvidence: string; // Human-readable skill strength message
  weakestEvidence: string; // Human-readable skill weakness message
  efficiencyRating: "Excellent" | "Good" | "Average" | "Below Average";
  nextRecommendedAction: string;
  adaptationsTriggered: number;
}

// ─── Full Practice Session ────────────────────────────────────────────────────

export interface PracticeSession {
  sessionId: string;
  startedAt: string; // ISO timestamp
  endedAt?: string; // ISO timestamp
  durationMinutes: number; // Planned
  mode: PracticeSessionMode;
  goalTitle: string;
  config: PracticeSessionConfig;
  plannedProblems: PracticeSessionProblem[];
  completedProblems: number[]; // problemIds
  currentProblemIndex: number;
  status: PracticeSessionStatus;
  // Timer state using timestamps (not decremented state)
  timerStartedAt: string; // ISO - when last resumed
  totalPausedMs: number; // Accumulated paused time
  lastPausedAt?: string; // ISO - when last paused
  outcomes: PracticeSessionOutcome[];
  adaptations: PracticeAdaptationRecord[];
  score?: PracticeSessionScore;
  analytics?: PracticeSessionAnalytics;
}

// ─── Session History Item ─────────────────────────────────────────────────────

export interface PracticeSessionHistoryItem {
  sessionId: string;
  date: string; // YYYY-MM-DD
  mode: PracticeSessionMode;
  durationMinutes: number;
  actualDurationSeconds: number;
  problemsAttempted: number;
  problemsSolved: number;
  completionRate: number; // 0-100
  score: PracticeSessionScore;
  primarySkill: string;
  primaryPattern: string;
  status: PracticeSessionStatus;
  goalTitle: string;
}

// ─── Mode Config for UI ───────────────────────────────────────────────────────

export interface SessionModeDisplayConfig {
  mode: PracticeSessionMode;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  recommendedDuration: number;
}

export const SESSION_MODE_CONFIGS: SessionModeDisplayConfig[] = [
  {
    mode: "smart_practice",
    label: "Smart Practice",
    description: "AI-balanced session targeting your current weaknesses and skill gaps.",
    icon: "🧠",
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    recommendedDuration: 60,
  },
  {
    mode: "weakness_repair",
    label: "Weakness Repair",
    description: "Focus on prerequisite gaps and low-confidence skill areas.",
    icon: "🔧",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    recommendedDuration: 45,
  },
  {
    mode: "pattern_mastery",
    label: "Pattern Mastery",
    description: "Deep focus on a single algorithmic pattern until comfortable.",
    icon: "🎯",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    recommendedDuration: 60,
  },
  {
    mode: "revision",
    label: "SRS Revision",
    description: "Review spaced repetition due items to maintain retention.",
    icon: "🔄",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    recommendedDuration: 30,
  },
  {
    mode: "interview_prep",
    label: "Interview Practice",
    description: "Simulate interview conditions with explanation-focused problems.",
    icon: "💼",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    recommendedDuration: 60,
  },
  {
    mode: "contest_prep",
    label: "Contest Preparation",
    description: "Speed-focused session with time pressure and diverse patterns.",
    icon: "⚔️",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    recommendedDuration: 90,
  },
  {
    mode: "goal_prep",
    label: "Goal Preparation",
    description: "Targeted session aligned to your active preparation goal.",
    icon: "🏁",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    recommendedDuration: 60,
  },
  {
    mode: "challenge",
    label: "Challenge Session",
    description: "Push your limits with harder problems above your current level.",
    icon: "🚀",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    recommendedDuration: 90,
  },
];
