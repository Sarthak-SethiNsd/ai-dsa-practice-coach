import { Difficulty, Platform } from "@/services/types";
import {
  FullPerformanceIntelligence,
  PerformanceWindow,
  PersistentWeakness,
} from "@/services/performance/performanceTypes";
import {
  AdaptiveStrategyState,
  InterventionPlan,
  StrategyMode,
  DifficultyPolicy,
  InterventionPracticeMode,
} from "@/services/intervention/interventionTypes";
import { PreparationGoal, PreparationGoalType } from "@/services/preparation/preparationTypes";
import { SkillNode } from "@/services/learningGraph/learningGraphTypes";
import { RevisionItem } from "@/services/revision/revisionTypes";

// ─── 12 Supported Activity Types ──────────────────────────────────────────────

export type ActivityType =
  | "PROBLEM_PRACTICE"
  | "FOUNDATION_REPAIR"
  | "SKILL_REINFORCEMENT"
  | "PATTERN_PRACTICE"
  | "TIMED_PRACTICE"
  | "REVISION"
  | "MOCK_INTERVIEW"
  | "CONTEST_PRACTICE"
  | "CONTEST"
  | "LEARNING_SESSION"
  | "MIXED_PRACTICE"
  | "RECOVERY_SESSION";

// ─── Preparation Readiness State ──────────────────────────────────────────────

export type PreparationReadiness =
  | "READY"
  | "FOCUSED"
  | "BLOCKED"
  | "RECOVERING"
  | "REVISION_DUE"
  | "GOAL_AT_RISK";

// ─── Priority Classification ──────────────────────────────────────────────────

export type ActivityPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// ─── Deferral Classification ──────────────────────────────────────────────────

export type DeferralCategory = "DO_LATER" | "NOT_RECOMMENDED";

// ─── Plan Confidence Level ────────────────────────────────────────────────────

export type PlanConfidenceLevel = "HIGH" | "MODERATE" | "LOW" | "INSUFFICIENT_DATA";

// ─── Activity Definition ──────────────────────────────────────────────────────

export interface PreparationActivity {
  activityId: string;
  activityType: ActivityType;
  title: string;
  estimatedMinutes: number;
  priority: ActivityPriority;
  priorityScore: number; // 0 - 100
  goalRelevance: number; // 0 - 10
  strategyAlignment: number; // 0 - 10
  affectedSkills: string[];
  affectedPatterns: string[];
  difficulty: Difficulty | "Mixed";
  sourceSubsystem: "practice" | "revision" | "learning_graph" | "interview" | "contest" | "strategy";
  reason: string;
  prerequisites: string[];
  isPrerequisiteBlocked: boolean;
  blockingPrerequisites: string[];
  successCriteria: {
    targetMetric: string;
    threshold: string | number;
    description: string;
  };
  recommendedProblemsCount?: number;
  problemCandidateIds?: Array<number | string>;
  isCompleted?: boolean;
}

// ─── Deferred Activity Model ──────────────────────────────────────────────────

export interface DeferredActivity {
  activity: PreparationActivity;
  category: DeferralCategory;
  deferralReason: string;
  appliedConstraint: string;
}

// ─── Next Best Action Model ───────────────────────────────────────────────────

export interface NextBestAction {
  actionTitle: string;
  activityType: ActivityType;
  whyDescription: string;
  estimatedMinutes: number;
  difficulty: Difficulty | "Mixed";
  focusSkillOrPattern: string;
  successCriteria: string;
  suggestedMode: string;
  activityRef: PreparationActivity;
  handoffTarget: "practice" | "revision" | "interview" | "contest" | "learning_graph";
}

// ─── Preparation Plan Model ───────────────────────────────────────────────────

export interface PreparationPlan {
  planId: string;
  generatedAt: string; // ISO timestamp
  goal: PreparationGoal | null;
  strategyMode: StrategyMode;
  availableMinutes: number;
  totalPlannedMinutes: number;
  activities: PreparationActivity[];
  nextBestAction: NextBestAction;
  primaryFocus: string;
  secondaryFocus: string;
  protectedSkills: string[];
  deferredActivities: DeferredActivity[];
  constraintsApplied: string[];
  expectedOutcomes: string[];
  planConfidence: {
    level: PlanConfidenceLevel;
    score: number; // 0 - 100
    rationale: string;
    missingEvidence: string[];
  };
  isRegenerated?: boolean;
}

// ─── Preparation Context Snapshot ─────────────────────────────────────────────

export interface PreparationContext {
  activeGoal: PreparationGoal | null;
  goalType: PreparationGoalType | "none";
  availableTimeMinutes: number;
  currentPerformanceState: FullPerformanceIntelligence | null;
  strategyState: AdaptiveStrategyState | null;
  learningGraphNodes: SkillNode[];
  revisionDueItems: RevisionItem[];
  recentPracticeSessionsCount: number;
  recentInterviewsCount: number;
  recentContestsCount: number;
  timestamp: string;
}

// ─── Execution Handoff Payloads ───────────────────────────────────────────────

export interface PracticeSessionHandoff {
  targetDurationMinutes: number;
  preferredMode: InterventionPracticeMode;
  targetDifficulty: Difficulty | "Mixed";
  hintPolicy: "ALLOW_ALL" | "DELAYED" | "RESTRICTED" | "DISABLED";
  focusSkills: string[];
  focusPatterns: string[];
  recommendedProblemsCount: number;
  sourcePlanId: string;
  reason: string;
}

export interface RecommendationHandoff {
  boostSkills: string[];
  demoteSkills: string[];
  targetPatterns: string[];
  excludedPatterns: string[];
  targetDifficulty: Difficulty | "Mixed";
  count: number;
  sourcePlanId: string;
  reason: string;
}

export interface SRSHandoff {
  urgentRevisionItemIds: string[];
  targetSkills: string[];
  maxRevisionCount: number;
  sourcePlanId: string;
  reason: string;
}

export interface PlannerHandoff {
  dailyWorkloadMinutes: number;
  activityBlocks: Array<{
    title: string;
    durationMinutes: number;
    activityType: ActivityType;
    priority: ActivityPriority;
  }>;
  sourcePlanId: string;
}

export interface LearningGraphHandoff {
  focusPrerequisites: string[];
  targetBottlenecks: string[];
  sourcePlanId: string;
  reason: string;
}

export interface GoalHandoff {
  goalId: string | null;
  currentPaceStatus: "ON_TRACK" | "AT_RISK" | "BEHIND";
  dailyMinutesRecommendation: number;
  priorityShift: string;
  sourcePlanId: string;
}

export interface SubsystemHandoffPayloads {
  practiceSession: PracticeSessionHandoff;
  recommendation: RecommendationHandoff;
  srs: SRSHandoff;
  planner: PlannerHandoff;
  learningGraph: LearningGraphHandoff;
  goal: GoalHandoff;
}

// ─── Plan History Entry ───────────────────────────────────────────────────────

export interface PlanHistoryEntry {
  planId: string;
  timestamp: string;
  date: string;
  goalName: string;
  strategyMode: StrategyMode;
  availableMinutes: number;
  activitiesCount: number;
  primaryFocus: string;
  nextBestActionTitle: string;
  completedActivitiesCount: number;
  status: "ACTIVE" | "COMPLETED" | "SUPERSEDED" | "EXPIRED";
  regenerationReason?: string;
}
