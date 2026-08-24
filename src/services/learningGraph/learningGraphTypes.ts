import { Difficulty, Platform } from "@/services/types";

export const GRAPH_VERSION = "1.0.0";

// ─── Core Node & Dependency Types ─────────────────────────────────────────────

export type SkillCategory =
  | "fundamentals"
  | "data_structures"
  | "algorithmic_paradigms"
  | "advanced_structures"
  | "competitive_specialties";

export type NodeType = "topic" | "pattern" | "technique";

export type MasteryStatus =
  | "LOCKED"
  | "DISCOVERED"
  | "LEARNING"
  | "DEVELOPING"
  | "MASTERED"
  | "DECAYING";

export type DependencyType =
  | "prerequisite"
  | "related"
  | "extension"
  | "application";

export interface SkillNode {
  id: string; // e.g. "arrays", "two_pointers", "dp_1d"
  name: string;
  slug: string;
  category: SkillCategory;
  type: NodeType;
  difficulty: Difficulty;
  description: string;
  prerequisites: string[]; // Node IDs that must be learned before this
  dependents: string[]; // Node IDs that build directly on this
  patterns: string[]; // Named pattern archetypes
  masteryScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  evidenceCount: number;
  status: MasteryStatus;
  decayFactor: number; // 0 (healthy) - 1.0 (severe decay)
  recentAccuracy: number; // 0 - 100
  solvedProblemsCount: number;
  difficultyReached: Difficulty;
  targetProblemIds: number[];
  position?: { x: number; y: number }; // For canvas / SVG rendering layout
}

export interface DependencyEdge {
  id: string;
  sourceId: string; // Prerequisite node
  targetId: string; // Dependent node
  type: DependencyType;
  strength: number; // 1 (loose association) - 5 (critical hard prerequisite)
  description: string;
}

// ─── Bottleneck & Prerequisite Models ─────────────────────────────────────────

export interface GraphBottleneck {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  masteryScore: number;
  impactScore: number; // 1-10
  weaknessScore: number; // 1-10
  dependencyReach: number; // Number of downstream nodes affected
  goalRelevance: number; // 1-10 based on active preparation goal
  compositeRank: number; // Impact * Weakness * DependencyReach * GoalRelevance
  blockedSkillsCount: number;
  blockedSkillNames: string[];
  evidenceSummary: string;
  recommendedAction: string;
  actionHref: string;
}

export interface PathStep {
  stepNumber: number;
  node: SkillNode;
  isSkipped: boolean;
  skipReason?: string;
  estimatedMinutes: number;
  keyLearningObjectives: string[];
  recommendedStarterProblem?: {
    id: number;
    title: string;
    difficulty: Difficulty;
    platform: Platform;
    url?: string;
  };
}

export interface AdaptiveLearningPath {
  targetSkillId: string;
  targetSkillName: string;
  targetDifficulty: Difficulty;
  totalSteps: number;
  activeStepsCount: number;
  skippedMasteredCount: number;
  estimatedHours: number;
  pathSteps: PathStep[];
  keyMilestones: string[];
  generatedAt: string;
}

export interface NextSkillRecommendation {
  recommendedSkillId: string;
  recommendedSkillName: string;
  category: SkillCategory;
  difficulty: Difficulty;
  reasonWhyNow: string;
  missingPrerequisites: {
    id: string;
    name: string;
    masteryScore: number;
  }[];
  supportingEvidence: string[];
  actionPlan: string;
  targetHref: string;
}

export interface RecentlyUnlockedSkill {
  skillId: string;
  skillName: string;
  unlockedAt: string;
  satisfiedPrerequisites: string[];
  whatItEnables: string[];
  recommendedFirstProblemTitle: string;
  targetHref: string;
}

// ─── Graph Insights & AI Coach Models ─────────────────────────────────────────

export interface GraphInsights {
  strongestSkill: { name: string; score: number; explanation: string };
  weakestFoundation: { name: string; score: number; explanation: string };
  criticalBottleneck: { name: string; blockedCount: number; explanation: string };
  nextBestSkill: { name: string; category: string; explanation: string };
  decayingSkill: { name: string; score: number; overdueCards: number; explanation: string } | null;
  mostUnlockingSkill: { name: string; unlockCount: number; explanation: string };
  goalBlockedSkill: { name: string; goalName: string; missingPrereq: string; explanation: string } | null;
}

export interface AIGraphCoachAdvice {
  whyAmIStuck: string;
  whatToLearnBefore: { topic: string; prerequisites: string[]; explanation: string };
  whyRecommendThisSkill: string;
  whatCanISkip: string[];
  whatToPracticeAfter: { currentTopic: string; nextTopics: string[] };
  biggestFoundationLever: string;
}

// ─── Master State ─────────────────────────────────────────────────────────────

export interface FullLearningGraphState {
  version: string;
  nodes: SkillNode[];
  edges: DependencyEdge[];
  stats: {
    totalSkills: number;
    masteredCount: number;
    developingCount: number;
    learningCount: number;
    discoveredCount: number;
    lockedCount: number;
    decayingCount: number;
    overallGraphMasteryPct: number;
  };
  bottlenecks: GraphBottleneck[];
  unlockedSkills: RecentlyUnlockedSkill[];
  nextRecommendation: NextSkillRecommendation;
  insights: GraphInsights;
  coachAdvice: AIGraphCoachAdvice;
  lastUpdated: string;
}
