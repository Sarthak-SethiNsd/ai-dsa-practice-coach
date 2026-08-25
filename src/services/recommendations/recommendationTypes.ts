import { Platform, Difficulty } from "@/services/types";

// ─── Core Enums & Mode Types ──────────────────────────────────────────────────

export type RecommendationMode =
  | "smart_practice"
  | "weakness_repair"
  | "pattern_practice"
  | "revision"
  | "interview_prep"
  | "contest_prep"
  | "challenge"
  | "goal_prep";

export type RecommendationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type RecommendationFeedbackAction =
  | "accepted"
  | "solved"
  | "failed"
  | "skipped"
  | "dismissed"
  | "added_to_revision"
  | "solved_independently"
  | "solved_with_hints";

// ─── Problem Candidate (from real platform dataset) ────────────────────────────

export interface ProblemCandidate {
  id: number;
  platformProblemId: string;
  platform: Platform;
  title: string;
  url: string;
  difficulty: Difficulty;
  topics: string[];
  primaryPattern: string;     // Mapped from topics to canonical pattern
  estimatedMinutes: number;
}

// ─── Score Breakdown Model ──────────────────────────────────────────────────────

export interface RecommendationScoreBreakdown {
  skillGapScore: number;          // 0–25: how weak the targeted skill is
  dependencyValueScore: number;   // 0–20: downstream unlock value from the graph
  goalRelevanceScore: number;     // 0–20: alignment to active preparation goal
  mistakeRelevanceScore: number;  // 0–15: connection to recorded mistake patterns
  revisionUrgencyScore: number;   // 0–10: SRS due/overdue weight
  difficultyFitScore: number;     // 0–10: how well difficulty matches current level
  patternValueScore: number;      // 0–10: under-practiced pattern bonus
  recencyPenalty: number;         // negative: recently solved penalisation
  overexposurePenalty: number;    // negative: same topic overload penalisation
  diversityBonus: number;         // positive: reward for topic/platform variety
  finalScore: number;             // 0–100: clamped composite
}

// ─── Evidence Model ─────────────────────────────────────────────────────────────

export interface RecommendationEvidence {
  targetSkillMasteryScore: number;
  targetSkillStatus: string;
  targetPattern: string;
  isPrerequisiteRepair: boolean;
  prerequisiteForSkill?: string;
  recentAccuracyPct: number;
  relatedMistakeNotesCount: number;
  mistakeCategories: string[];
  srsItemsCount: number;
  srsOverdueCount: number;
  srsAverageMemoryStrength: number;
  goalAlignmentName: string;
  activeMode: RecommendationMode;
  graphBottleneckRank?: number;   // 1 = top bottleneck
  dependencyReach: number;        // how many downstream skills this unlocks
}

// ─── Full Recommendation Model ──────────────────────────────────────────────────

export interface AdaptiveProblemRecommendation {
  id: string;
  problemId: number;
  platformProblemId: string;
  platform: Platform;
  title: string;
  url: string;
  difficulty: Difficulty;
  topics: string[];
  patterns: string[];
  primaryPattern: string;
  recommendationScore: number;
  priority: RecommendationPriority;
  targetSkill: string;
  targetPattern: string;
  reason: string;               // Single human-readable sentence
  fullExplanation: string;      // Multi-sentence detailed explanation
  scoreBreakdown: RecommendationScoreBreakdown;
  evidence: RecommendationEvidence;
  estimatedEffortMinutes: number;
  categoryLabel: string;        // e.g. "Foundation Repair", "Pattern Practice"
  mode: RecommendationMode;
  generatedAt: string;
}

// ─── History Item ───────────────────────────────────────────────────────────────

export interface RecommendationHistoryItem {
  id: string;
  problemId: number;
  platformProblemId: string;
  platform: Platform;
  title: string;
  url: string;
  difficulty: Difficulty;
  topics: string[];
  targetSkill: string;
  targetPattern: string;
  recommendationScore: number;
  reason: string;
  action: RecommendationFeedbackAction;
  mode: RecommendationMode;
  timestamp: string;
}

// ─── Filter Options ─────────────────────────────────────────────────────────────

export interface RecommendationFilterOptions {
  platform: Platform | "all";
  difficulty: Difficulty | "all";
  topic: string;
  pattern: string;
  mode: RecommendationMode | "all";
  priority: RecommendationPriority | "all";
  timeBudgetMinutes: number | null;
  searchQuery: string;
}

// ─── AI Coach Model ─────────────────────────────────────────────────────────────

export interface AIRecommendationCoachAdvice {
  whyThisProblem: string;
  whyBetterThanAlternative: string;
  whatSkillAmIPracticing: string;
  whyThisDifficulty: string;
  shouldSolveNowOrReviseFirst: string;
  whatToSolveAfter: { nextTopics: string[]; explanation: string };
  whyRepeatingThisPattern: string;
}

// ─── Mode Display Config ────────────────────────────────────────────────────────

export const RECOMMENDATION_MODE_CONFIG: Record<
  RecommendationMode,
  { label: string; description: string; emoji: string }
> = {
  smart_practice: {
    label: "Smart Practice",
    description: "AI-selected optimal problem for your current skill profile",
    emoji: "✨",
  },
  weakness_repair: {
    label: "Weakness Repair",
    description: "Target your weakest foundational prerequisites",
    emoji: "🔧",
  },
  pattern_practice: {
    label: "Pattern Practice",
    description: "Focus on under-practiced algorithmic patterns",
    emoji: "🎯",
  },
  revision: {
    label: "Revision",
    description: "Revisit problems due for spaced repetition refresh",
    emoji: "🔁",
  },
  interview_prep: {
    label: "Interview Prep",
    description: "Common patterns and explanation-friendly medium problems",
    emoji: "💼",
  },
  contest_prep: {
    label: "Contest Prep",
    description: "Harder problems with pattern diversity for competitive programming",
    emoji: "⚔️",
  },
  challenge: {
    label: "Challenge",
    description: "Push your limits with problems above your current level",
    emoji: "🚀",
  },
  goal_prep: {
    label: "Goal Preparation",
    description: "Aligned to your active preparation goal and deadline",
    emoji: "🏁",
  },
};
