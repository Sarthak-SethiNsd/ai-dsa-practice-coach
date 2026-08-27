import { Difficulty, Platform } from "@/services/types";

// ─── Analysis Windows ─────────────────────────────────────────────────────────

export type PerformanceWindow = "7d" | "30d" | "90d" | "all";

export interface PerformanceWindowConfig {
  window: PerformanceWindow;
  label: string;
  days: number; // 7, 30, 90, or 3650 for all
  description: string;
}

export const PERFORMANCE_WINDOW_CONFIGS: Record<PerformanceWindow, PerformanceWindowConfig> = {
  "7d": {
    window: "7d",
    label: "Last 7 Days",
    days: 7,
    description: "Short-term tactical performance and recent momentum",
  },
  "30d": {
    window: "30d",
    label: "Last 30 Days",
    days: 30,
    description: "Core longitudinal baseline and skill progression",
  },
  "90d": {
    window: "90d",
    label: "Last 90 Days",
    days: 90,
    description: "Macro learning trends and retention stability",
  },
  all: {
    window: "all",
    label: "All Time",
    days: 3650,
    description: "Complete historical learning journey",
  },
};

// ─── Trend Enums ──────────────────────────────────────────────────────────────

export type TrendDirection =
  | "IMPROVING"
  | "STABLE"
  | "DECLINING"
  | "VOLATILE"
  | "INSUFFICIENT_DATA";

export type TrendConfidence = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export type SkillTrendClass =
  | "STRONG"
  | "IMPROVING"
  | "STABLE"
  | "WEAK"
  | "DECLINING"
  | "STAGNANT"
  | "INSUFFICIENT_DATA";

export type WeaknessSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type WeaknessPersistence = "NEW" | "RECURRING" | "PERSISTENT" | "IMPROVING";

export type DifficultyPacing =
  | "APPROPRIATE"
  | "PLATEAU"
  | "TOO_AGGRESSIVE"
  | "TOO_CONSERVATIVE"
  | "INSUFFICIENT_DATA";

export type TimeEfficiencyTrend =
  | "FAST_IMPROVEMENT"
  | "SLOW_IMPROVEMENT"
  | "STABLE"
  | "DEGRADING"
  | "INSUFFICIENT_DATA";

export type PatternExposureStatus =
  | "OPTIMAL"
  | "OVEREXPOSED"
  | "UNDEREXPOSED"
  | "NEGLECTED";

export type RecommendationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// ─── Normalized Longitudinal Event ────────────────────────────────────────────

export type LongitudinalEventSource =
  | "PRACTICE_SESSION"
  | "RECOMMENDATION"
  | "SRS_REVISION"
  | "VIRTUAL_CONTEST"
  | "MOCK_INTERVIEW"
  | "STUDY_SESSION";

export interface LongitudinalEvent {
  id: string;
  source: LongitudinalEventSource;
  timestamp: string; // ISO format
  date: string; // YYYY-MM-DD
  problemId?: number | string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: string[];
  primaryPattern: string;
  outcome: "SOLVED_INDEPENDENTLY" | "SOLVED_WITH_HINTS" | "FAILED" | "SKIPPED" | "TIMED_OUT" | "COMPLETED";
  solveTimeSeconds?: number;
  estimatedTimeSeconds?: number;
  hintCount: number;
  score?: number; // 0-100 if applicable
  sessionId?: string;
  isRevision?: boolean;
}

// ─── Performance Metric Trend ─────────────────────────────────────────────────

export interface PerformanceMetricTrend {
  currentValue: number;
  previousValue: number | null;
  delta: number;
  percentageChange: number | null;
  direction: TrendDirection;
  confidence: TrendConfidence;
  sampleSize: number;
  explanation: string;
}

// ─── Core Metrics Snapshot ────────────────────────────────────────────────────

export interface PerformanceMetricsSnapshot {
  window: PerformanceWindow;
  startDate: string;
  endDate: string;
  totalAttempts: number;
  totalSolved: number;
  independentSolves: number;
  hintAssistedSolves: number;
  failures: number;
  skips: number;
  timeouts: number;
  totalPracticeMinutes: number;

  // Rate metrics with trends
  solveRate: PerformanceMetricTrend;
  independentSolveRate: PerformanceMetricTrend;
  hintAssistedRate: PerformanceMetricTrend;
  failureRate: PerformanceMetricTrend;
  timeoutRate: PerformanceMetricTrend;
  skipRate: PerformanceMetricTrend;

  // Time metrics
  averageSolveTimeSeconds: PerformanceMetricTrend;
  medianSolveTimeSeconds: PerformanceMetricTrend;
  timeEfficiencyScore: PerformanceMetricTrend; // 0-100

  // Session stats
  sessionCount: number;
  sessionCompletionRate: PerformanceMetricTrend;
  activeGoalAlignmentPct: number;
}

// ─── Skill Trend Model ────────────────────────────────────────────────────────

export interface SkillPerformanceTrend {
  skillId: string;
  skillName: string;
  category: string;
  totalAttempts: number;
  solvedCount: number;
  independentSolves: number;
  solveRate: number; // 0-100
  independentSolveRate: number; // 0-100
  hintCount: number;
  averageSolveTimeSeconds: number;
  medianSolveTimeSeconds: number;
  currentMasteryScore: number;
  masteryDelta: number; // change vs previous window
  classification: SkillTrendClass;
  isStagnant: boolean;
  stagnationReason?: string;
  suggestedIntervention?: string;
  prerequisiteHealth: "HEALTHY" | "BOTTLENECK" | "DEGRADED" | "UNKNOWN";
  recentActivityDaysAgo: number;
  evidenceSummary: string;
}

// ─── Pattern Trend Model ──────────────────────────────────────────────────────

export interface PatternPerformanceTrend {
  patternName: string;
  exposureCount: number;
  exposurePercentage: number; // of total attempts
  exposureStatus: PatternExposureStatus;
  solvedCount: number;
  independentSolves: number;
  solveRate: number;
  independentSolveRate: number;
  averageSolveTimeSeconds: number;
  trendDirection: TrendDirection;
  actionRecommendation: string;
}

// ─── Difficulty Progression Model ─────────────────────────────────────────────

export interface DifficultyLevelStats {
  difficulty: Difficulty;
  attempts: number;
  solvedCount: number;
  independentSolves: number;
  solveRate: number;
  independentSolveRate: number;
  hintCount: number;
  averageSolveTimeSeconds: number;
}

export interface DifficultyProgressionTrend {
  byDifficulty: Record<Difficulty, DifficultyLevelStats>;
  pacing: DifficultyPacing;
  transitionGap: {
    hasEasyToMediumGap: boolean;
    hasMediumToHardGap: boolean;
    gapDescription: string;
  };
  pacingDiagnosis: string;
  recommendedDifficultyAction: string;
}

// ─── Time Efficiency Analysis Model ───────────────────────────────────────────

export interface TimeEfficiencyAnalysis {
  overallTrend: TimeEfficiencyTrend;
  overallMedianSolveTimeSeconds: number;
  overallAverageSolveTimeSeconds: number;
  byDifficulty: Record<Difficulty, { medianSeconds: number; avgSeconds: number }>;
  canSolveRate: number; // % solved at all
  canSolveEfficientlyRate: number; // % solved <= estimated time * 1.2
  efficiencyGapPct: number; // canSolveRate - canSolveEfficientlyRate
  speedImprovementPct: number | null; // vs prior period
  diagnosis: string;
}

// ─── Persistent Weakness Model ────────────────────────────────────────────────

export interface PersistentWeakness {
  id: string;
  skillOrPattern: string;
  category: string;
  severity: WeaknessSeverity;
  persistence: WeaknessPersistence;
  failCount: number;
  hintCount: number;
  attemptCount: number;
  averageSolveTimeSeconds: number;
  firstDetectedDate: string;
  lastObservedDate: string;
  affectedSystems: string[]; // e.g. ["Practice Sessions", "Virtual Contests", "SRS"]
  evidenceText: string;
  recommendedIntervention: string;
  priorityScore: number; // 0-100
}

// ─── Improvement Signal Model ─────────────────────────────────────────────────

export interface ImprovementSignal {
  id: string;
  skillOrPattern: string;
  category: string;
  metric: string; // e.g. "Independent Solve Rate", "Solve Speed"
  magnitude: string; // e.g. "+24%", "-5 min"
  priorValue: string;
  currentValue: string;
  sampleSize: number;
  evidence: string;
  celebrationMessage: string;
}

// ─── Learning Velocity Model ──────────────────────────────────────────────────

export interface LearningVelocityComponent {
  name: string;
  score: number; // 0-100
  weight: number; // 0-1
  contribution: number;
  explanation: string;
}

export interface LearningVelocity {
  overallVelocityScore: number; // 0-100
  tier: "High Velocity" | "Solid Progress" | "Moderate Pace" | "Plateaued" | "Insufficient Activity";
  components: {
    masteryVelocity: LearningVelocityComponent;
    difficultyVelocity: LearningVelocityComponent;
    independenceVelocity: LearningVelocityComponent;
    timeEfficiencyVelocity: LearningVelocityComponent;
  };
  explanation: string;
  velocityTrend: TrendDirection;
}

// ─── Strategic Recommendation Model ───────────────────────────────────────────

export interface StrategicRecommendation {
  id: string;
  title: string;
  priority: RecommendationPriority;
  affectedSkillOrPattern: string;
  reason: string;
  supportingEvidence: string;
  suggestedIntervention: string;
  expectedOutcome: string;
  targetSubsystem: "practice" | "revision" | "learning_graph" | "recommendations" | "preparation";
}

// ─── Timeline Event Model ─────────────────────────────────────────────────────

export type PerformanceTimelineEventType =
  | "MASTERY_ACHIEVED"
  | "DIFFICULTY_MILESTONE"
  | "VELOCITY_SURGE"
  | "PERSISTENT_WEAKNESS_DETECTED"
  | "WEAKNESS_REPAIRED"
  | "CONTEST_RESULT"
  | "INTERVIEW_RESULT"
  | "STREAK_MILESTONE"
  | "GOAL_UPDATED";

export interface PerformanceTimelineEvent {
  id: string;
  date: string;
  timestamp: string;
  type: PerformanceTimelineEventType;
  title: string;
  description: string;
  icon: string;
  badgeVariant: "success" | "warning" | "error" | "info" | "neutral";
  relatedSkill?: string;
}

// ─── Feedback Signals to Subsystems ───────────────────────────────────────────

export interface SubsystemFeedbackSignals {
  recommendationSignals: {
    boostWeaknessSkills: string[];
    demoteOverexposedPatterns: string[];
    targetDifficulty: Difficulty | "Mixed";
  };
  practiceSessionSignals: {
    suggestedMode: string;
    targetPrerequisiteBridges: string[];
    suggestedDurationMinutes: number;
  };
  learningGraphSignals: {
    bottleneckPriorities: string[];
    decayRisks: string[];
  };
  srsSignals: {
    urgentTopicRevisionIds: string[];
  };
  preparationSignals: {
    velocityAlignment: "ON_TRACK" | "AT_RISK" | "BEHIND";
    gapAdjustments: string[];
  };
}

// ─── Full Composite Performance Intelligence ──────────────────────────────────

export interface FullPerformanceIntelligence {
  window: PerformanceWindow;
  windowConfig: PerformanceWindowConfig;
  generatedAt: string;
  metrics: PerformanceMetricsSnapshot;
  skillTrends: SkillPerformanceTrend[];
  patternTrends: PatternPerformanceTrend[];
  difficultyTrend: DifficultyProgressionTrend;
  timeTrend: TimeEfficiencyAnalysis;
  persistentWeaknesses: PersistentWeakness[];
  improvementSignals: ImprovementSignal[];
  learningVelocity: LearningVelocity;
  strategicRecommendations: StrategicRecommendation[];
  timeline: PerformanceTimelineEvent[];
  feedbackSignals: SubsystemFeedbackSignals;
  diagnosisSummary: {
    headline: string;
    subheadline: string;
    strongestImprovingSkill: string | null;
    mostPersistentWeakness: string | null;
    topStrategicRecommendation: string;
  };
}
