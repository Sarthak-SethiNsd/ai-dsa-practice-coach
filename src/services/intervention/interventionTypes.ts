import { Difficulty, Platform } from "@/services/types";
import {
  FullPerformanceIntelligence,
  PerformanceWindow,
  PersistentWeakness,
  SkillPerformanceTrend,
  PatternPerformanceTrend,
  DifficultyProgressionTrend,
  TimeEfficiencyAnalysis,
} from "@/services/performance/performanceTypes";
import { PreparationGoal, PreparationGoalType } from "@/services/preparation/preparationTypes";

// ─── 19 Deterministic Intervention Types ─────────────────────────────────────

export type InterventionType =
  | "FOUNDATION_REPAIR"
  | "SKILL_REINFORCEMENT"
  | "PATTERN_DIVERSIFICATION"
  | "DIFFICULTY_INCREASE"
  | "DIFFICULTY_DECREASE"
  | "TIME_PRESSURE"
  | "TIME_RELIEF"
  | "HINT_REDUCTION"
  | "HINT_SUPPORTED_LEARNING"
  | "SRS_REINFORCEMENT"
  | "CONTEST_PREPARATION"
  | "INTERVIEW_PREPARATION"
  | "PRACTICE_INTENSIFICATION"
  | "PRACTICE_RECOVERY"
  | "GOAL_REALIGNMENT"
  | "STAGNATION_BREAK"
  | "OVEREXPOSURE_CORRECTION"
  | "PREREQUISITE_REPAIR"
  | "MASTERY_CONSOLIDATION";

// ─── High-Level Strategy Modes ───────────────────────────────────────────────

export type StrategyMode =
  | "BALANCED"
  | "FOUNDATION_REPAIR"
  | "SKILL_BUILDING"
  | "DIFFICULTY_ACCELERATION"
  | "INTERVIEW_FOCUS"
  | "CONTEST_FOCUS"
  | "REVISION_FOCUS"
  | "RECOVERY"
  | "STAGNATION_BREAK";

// ─── Intervention Lifecycle Status ───────────────────────────────────────────

export type InterventionStatus =
  | "PROPOSED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED"
  | "ROLLED_BACK";

// ─── Priority Classification ──────────────────────────────────────────────────

export type InterventionPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// ─── Calibration Policies ─────────────────────────────────────────────────────

export type DifficultyPolicy = "HOLD" | "INCREASE" | "DECREASE" | "MIXED";

export type InterventionPracticeMode =
  | "LEARNING"
  | "REINFORCEMENT"
  | "TIMED"
  | "MIXED"
  | "REVISION"
  | "CHALLENGE"
  | "INTERVIEW"
  | "CONTEST";

// ─── Diagnosis Categories ─────────────────────────────────────────────────────

export type DiagnosisCategory =
  | "DIFFICULTY_TOO_HIGH"
  | "DIFFICULTY_TOO_LOW"
  | "DIFFICULTY_PLATEAU"
  | "PERSISTENT_WEAKNESS"
  | "SKILL_STAGNATION"
  | "PATTERN_OVEREXPOSURE"
  | "PATTERN_UNDEREXPOSURE"
  | "HINT_DEPENDENCY"
  | "HINT_APPROPRIATE_LEARNING"
  | "TIME_INEFFICIENCY"
  | "PREPARATION_FATIGUE"
  | "PREREQUISITE_BOTTLENECK"
  | "MASTERY_DECAY"
  | "GOAL_MISALIGNMENT"
  | "INSUFFICIENT_DATA";

// ─── Evidence Fragment ────────────────────────────────────────────────────────

export interface EvidenceFragment {
  source: string; // e.g. "DifficultyProgression", "PersistentWeakness", "MetricsSnapshot"
  metric: string; // e.g. "Hard independent solve rate", "Hint-assisted rate"
  value: string | number;
  sampleSize: number;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  explanation: string;
}

// ─── Intervention Diagnosis ───────────────────────────────────────────────────

export interface InterventionDiagnosis {
  diagnosisId: string;
  category: DiagnosisCategory;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  evidence: EvidenceFragment[];
  evidenceSummary: string;
  affectedSkills: string[];
  affectedPatterns: string[];
  affectedDifficulty?: Difficulty | "Mixed";
  detectedAt: string; // ISO timestamp
  expirationDate: string; // ISO timestamp
  recommendedIntervention: InterventionType;
  rationale: string;
}

// ─── Intervention Priority Breakdown ──────────────────────────────────────────

export interface PriorityScoreBreakdown {
  impact: number; // 0-10
  evidenceStrength: number; // 0-10
  goalRelevance: number; // 0-10
  urgency: number; // 0-10
  rawScore: number; // impact * evidence * goal * urgency
  normalizedScore: number; // 0-100
  priority: InterventionPriority;
}

// ─── Concrete Intervention Plan ───────────────────────────────────────────────

export interface InterventionPlan {
  id: string;
  diagnosisId: string;
  title: string;
  interventionType: InterventionType;
  status: InterventionStatus;
  objective: string;
  priority: InterventionPriority;
  priorityScore: number; // 0-100
  priorityBreakdown: PriorityScoreBreakdown;
  targetDurationSessions: number; // e.g. 3 sessions
  completedSessions: number;
  affectedSkills: string[];
  affectedPatterns: string[];
  difficultyPolicy: DifficultyPolicy;
  practiceMode: InterventionPracticeMode;
  revisionPriority: "NORMAL" | "HIGH" | "URGENT";
  timePressureLevel: "NONE" | "LOW" | "STANDARD" | "HIGH";
  successCriteria: {
    targetMetric: string;
    threshold: number | string;
    description: string;
  };
  rollbackCriteria: {
    triggerCondition: string;
    fallbackAction: string;
  };
  expectedOutcome: string;
  suggestedAction: string;
  startDate: string;
  reviewDate: string;
  cooldownDays: number;
  evidenceChain: {
    evidence: string;
    diagnosis: string;
    decision: string;
    action: string;
    successCriteria: string;
  };
  conflictResolutionNote?: string;
}

// ─── Adaptive Strategy State ──────────────────────────────────────────────────

export interface AdaptiveStrategyState {
  strategyVersion: string;
  currentMode: StrategyMode;
  modeRationale: string;
  currentFocus: string; // e.g. "Graph Traversal Prerequisite Repair"
  topPriorityPlanId: string | null;
  activeInterventions: InterventionPlan[];
  proposedInterventions: InterventionPlan[];
  protectedSkills: string[]; // Skills not to be stressed/demoted
  deprioritizedSkills: string[]; // Skills currently down-ranked
  preferredDifficulty: Difficulty | "Mixed";
  difficultyPolicy: DifficultyPolicy;
  preferredPracticeModes: InterventionPracticeMode[];
  targetPatterns: string[];
  revisionPriority: "NORMAL" | "HIGH" | "URGENT";
  timePressureLevel: "NONE" | "LOW" | "STANDARD" | "HIGH";
  interventionCooldowns: Record<string, string>; // InterventionType -> ISO expiry date
  lastUpdated: string;
}

// ─── Subsystem Feedback Signals (Structured Instructions) ─────────────────────

export interface SubsystemInterventionSignals {
  recommendationEngine: {
    boostSkills: string[];
    demoteSkills: string[];
    targetPatterns: string[];
    excludedPatterns: string[];
    difficultyPolicy: DifficultyPolicy;
    targetDifficulty: Difficulty | "Mixed";
    reasoning: string;
  };
  practiceSessionEngine: {
    preferredMode: InterventionPracticeMode;
    timePressure: "NONE" | "LOW" | "STANDARD" | "HIGH";
    hintPolicy: "ALLOW_ALL" | "DELAYED" | "RESTRICTED" | "DISABLED";
    targetDurationMinutes: number;
    recommendedProblemCount: number;
    targetFocusSkills: string[];
    reasoning: string;
  };
  learningGraph: {
    focusPrerequisites: string[];
    protectMasteredSkills: string[];
    reinforceSkills: string[];
    targetBottlenecks: string[];
    reasoning: string;
  };
  srsRevision: {
    increaseRevisionPriority: boolean;
    priorityLevel: "NORMAL" | "HIGH" | "URGENT";
    targetRevisionSkills: string[];
    reasoning: string;
  };
  dailyPlanner: {
    recommendedMinutes: number;
    sessionCount: number;
    focusAreas: string[];
    reasoning: string;
  };
  preparationCommandCenter: {
    strategyStatus: "OPTIMAL" | "CALIBRATING" | "RECOVERY" | "AT_RISK";
    goalRisk: "LOW" | "MEDIUM" | "HIGH";
    priorityShiftNotice: string;
    activeInterventionCount: number;
  };
}

// ─── Intervention Outcome & History ───────────────────────────────────────────

export interface InterventionOutcome {
  planId: string;
  interventionType: InterventionType;
  targetSkillOrPattern: string;
  evaluationDate: string;
  resultStatus: "COMPLETED" | "FAILED" | "ROLLED_BACK" | "IN_PROGRESS";
  evidenceBefore: string;
  evidenceAfter: string;
  targetMetricImprovement: string;
  feedbackToPerformance: string;
}

export interface StrategyHistoryEntry {
  id: string;
  timestamp: string;
  date: string;
  previousMode: StrategyMode;
  newMode: StrategyMode;
  reason: string;
  evidence: string;
  triggeredInterventions: string[];
  activeGoal: string;
}

// ─── Composite Result ─────────────────────────────────────────────────────────

export interface AdaptiveStrategyResult {
  state: AdaptiveStrategyState;
  diagnoses: InterventionDiagnosis[];
  plans: InterventionPlan[];
  signals: SubsystemInterventionSignals;
  history: StrategyHistoryEntry[];
  outcomes: InterventionOutcome[];
  intelligenceSummary: {
    window: PerformanceWindow;
    totalAttempts: number;
    independentSolveRate: number;
    pacingDiagnosis: string;
    hasSufficientData: boolean;
  };
}
