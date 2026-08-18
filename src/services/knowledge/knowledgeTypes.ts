import { Platform, Difficulty } from "@/services/types";

// ─── Learning Tag Types ─────────────────────────────────────────────────────

export type BuiltinTag =
  | "Important"
  | "Revisit"
  | "Mistake"
  | "Pattern"
  | "Optimization"
  | "Edge Case"
  | "Interview"
  | "Contest"
  | "Easy Win"
  | "Difficult"
  | "Concept Gap";

export const BUILTIN_TAGS: BuiltinTag[] = [
  "Important",
  "Revisit",
  "Mistake",
  "Pattern",
  "Optimization",
  "Edge Case",
  "Interview",
  "Contest",
  "Easy Win",
  "Difficult",
  "Concept Gap",
];

export interface KnowledgeTag {
  id: string;
  name: string;
  isCustom: boolean;
  color?: string; // Optional color for custom tags
  createdAt: string;
}

// ─── Mistake Category Types ─────────────────────────────────────────────────

export type MistakeCategory =
  | "didnt_understand_pattern"
  | "wrong_approach"
  | "time_complexity_issue"
  | "space_complexity_issue"
  | "edge_case_missed"
  | "implementation_mistake"
  | "syntax_api_mistake"
  | "misread_problem"
  | "could_not_derive_solution";

export const MISTAKE_CATEGORIES: { id: MistakeCategory; label: string; description: string }[] = [
  { id: "didnt_understand_pattern", label: "Didn't understand the pattern", description: "The underlying algorithmic pattern was not recognized" },
  { id: "wrong_approach", label: "Wrong approach", description: "Started with an incorrect algorithm or data structure" },
  { id: "time_complexity_issue", label: "Time complexity issue", description: "Solution was too slow — needed a better algorithm" },
  { id: "space_complexity_issue", label: "Space complexity issue", description: "Used more memory than required" },
  { id: "edge_case_missed", label: "Edge case missed", description: "Failed to handle boundary inputs or special conditions" },
  { id: "implementation_mistake", label: "Implementation mistake", description: "Logic error during code translation" },
  { id: "syntax_api_mistake", label: "Syntax / API mistake", description: "Incorrect language syntax or wrong API usage" },
  { id: "misread_problem", label: "Misread problem", description: "Misunderstood the problem constraints or requirements" },
  { id: "could_not_derive_solution", label: "Could not derive solution", description: "Was completely stuck and unable to reach a solution" },
];

// ─── Revision Status ─────────────────────────────────────────────────────────

export type NoteRevisionStatus = "mastered" | "revisit" | "forgotten" | "in_progress" | "not_started";

// ─── DSA Pattern Names ───────────────────────────────────────────────────────

export const DSA_PATTERNS = [
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Prefix Sum",
  "Hashing",
  "Greedy",
  "DFS",
  "BFS",
  "Dynamic Programming",
  "Backtracking",
  "Monotonic Stack",
  "Union Find",
  "Trie",
  "Divide and Conquer",
  "Bit Manipulation",
  "Math & Number Theory",
] as const;

export type DsaPattern = typeof DSA_PATTERNS[number];

// ─── Problem Note ─────────────────────────────────────────────────────────────

export interface ProblemNote {
  /** Unique note identifier */
  id: string;
  /** Problem identifier (numeric ID from the problem dataset) */
  problemId: number | string;
  /** Platform-specific problem ID (e.g. "1", "200", "1500B") */
  platformProblemId?: string;
  /** The platform the problem is from */
  platform: Platform;
  /** Problem title */
  problemTitle: string;
  /** Primary topic of the problem */
  topic: string;
  /** Problem difficulty */
  difficulty: Difficulty;
  /** Problem URL */
  problemUrl?: string;

  // ─── Note Content Fields ────────────────────────────────────────
  /** User's own plain-language explanation of the problem */
  personalExplanation?: string;
  /** The approach the user took or studied */
  approachUsed?: string;
  /** The key insight / "aha moment" for solving this problem */
  keyInsight?: string;
  /** The mistake made during solving */
  mistakeMade?: string;
  /** Structured mistake category for analytics */
  mistakeCategory?: MistakeCategory;
  /** Edge cases the user discovered */
  edgeCasesDiscovered?: string;
  /** User-noted time complexity */
  timeComplexity?: string;
  /** User-noted space complexity */
  spaceComplexity?: string;
  /** Alternative approach or optimization idea */
  alternativeApproach?: string;

  // ─── Tags & Patterns ────────────────────────────────────────────
  /** Array of tag names applied to this note */
  tags: string[];
  /** Pattern associated with this problem (when tagged "Pattern") */
  patternName?: string;

  // ─── Revision Status ─────────────────────────────────────────────
  /** User's self-assessed revision status */
  revisionStatus: NoteRevisionStatus;

  // ─── Timestamps ─────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
}

// ─── Pattern Summary ─────────────────────────────────────────────────────────

export interface PatternSummary {
  patternName: string;
  totalProblems: number;
  solvedProblems: number;
  needsRevisionCount: number;
  masteredCount: number;
  /** 0-100% success rate based on revision status signals */
  successRate: number;
  /** Most common mistake category in this pattern */
  commonMistakeCategory?: MistakeCategory;
  commonMistakeLabel?: string;
  lastPracticedDate?: string;
  problems: ProblemNote[];
}

// ─── AI Knowledge Insight ─────────────────────────────────────────────────────

export type InsightType =
  | "repeated_mistake"
  | "pattern_uncertainty"
  | "improving_pattern"
  | "frequently_revisited"
  | "concept_gap"
  | "mastery_achieved";

export interface AiKnowledgeInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  /** Topic or pattern this insight is about */
  subject?: string;
  /** Severity for visual styling */
  severity: "warning" | "info" | "success" | "error";
  /** Recommended action URL */
  actionUrl?: string;
  actionLabel?: string;
  /** Number of data points supporting this insight */
  dataPoints: number;
}

// ─── Knowledge Dashboard Metrics ─────────────────────────────────────────────

export interface KnowledgeDashboardMetrics {
  totalNotes: number;
  totalTaggedProblems: number;
  totalPatterns: number;
  topTags: Array<{ tag: string; count: number }>;
  topPatterns: Array<{ pattern: string; count: number }>;
  mostCommonMistakeType?: { category: MistakeCategory; label: string; count: number };
  topicsWithMostNotes: Array<{ topic: string; count: number }>;
  needsRevisionCount: number;
  recentlyUpdatedCount: number;
  masteredCount: number;
}

// ─── Search & Filter Types ────────────────────────────────────────────────────

export type KnowledgeSortField =
  | "recently_updated"
  | "recently_solved"
  | "most_revisited"
  | "most_mistakes"
  | "difficulty";

export interface KnowledgeSearchFilters {
  query?: string;
  platform?: Platform;
  topic?: string;
  difficulty?: Difficulty;
  tags?: string[];
  pattern?: string;
  mistakeCategory?: MistakeCategory;
  revisionStatus?: NoteRevisionStatus;
  sortBy?: KnowledgeSortField;
}
