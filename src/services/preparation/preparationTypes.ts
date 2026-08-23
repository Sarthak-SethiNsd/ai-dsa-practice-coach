import { Platform, Difficulty } from "@/services/types";

// ─── Preparation Goal Models ──────────────────────────────────────────────────

export type PreparationGoalType =
  | "dsa_interview"
  | "competitive_programming"
  | "placement_prep"
  | "technical_interview"
  | "coding_assessment"
  | "general_improvement"
  | "custom";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface PreparationGoal {
  id: string;
  name: string;
  type: PreparationGoalType;
  targetDate: string; // YYYY-MM-DD
  dailyMinutes: number; // e.g. 15, 30, 45, 60, 90, 120
  daysPerWeek: number; // 1-7
  preferredPlatforms: Platform[];
  currentSkillLevel: SkillLevel;
  targetDifficulty: Difficulty | "Mixed";
  priorityTopics: string[];
  targetContestRating?: number;
  targetInterviewScore?: number;
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  isArchived?: boolean;
}

// ─── On-Track Status ──────────────────────────────────────────────────────────

export type OnTrackStatus = "AHEAD" | "ON_TRACK" | "AT_RISK" | "BEHIND";

export interface OnTrackAssessment {
  status: OnTrackStatus;
  velocityRatio: number; // actual velocity / required velocity (1.0 = on track)
  daysRemaining: number;
  weeksRemaining: number;
  estimatedCompletionPace: string;
  statusRationale: string;
}

// ─── Readiness Dimension Model ────────────────────────────────────────────────

export interface ReadinessDimension {
  id: string;
  name: string;
  score: number; // 0-100
  weight: number; // 0-1
  explanation: string;
  status: "strong" | "developing" | "needs_attention" | "critical";
}

export interface PreparationReadinessSummary {
  overallScore: number; // 0-100
  tier: "Beginner" | "Developing" | "Competitive" | "Interview Ready" | "Advanced";
  bandLabel: string;
  dimensions: ReadinessDimension[];
  summaryExplanation: string;
  topStrengths: string[];
  criticalLimiters: string[];
}

// ─── Goal Gap Analysis ────────────────────────────────────────────────────────

export type GapCategory =
  | "topic_coverage"
  | "pattern_gap"
  | "accuracy"
  | "difficulty_bottleneck"
  | "time_management"
  | "interview_readiness"
  | "contest_pace"
  | "revision_debt";

export interface PreparationGap {
  id: string;
  category: GapCategory;
  topicOrSkill: string;
  severity: "low" | "medium" | "high" | "critical";
  impactScore: number; // 1-10
  weaknessScore: number; // 1-10
  urgencyScore: number; // 1-10
  compositePriority: number; // impact * weakness * urgency (1 - 1000)
  reasoning: string;
  recommendedAction: string;
  actionType: "practice" | "revision" | "contest" | "interview" | "study";
  targetRefId?: string;
}

// ─── Adaptive Preparation Roadmap & Phases ────────────────────────────────────

export interface PhaseExitCriteria {
  description: string;
  isMet: boolean;
  metricCurrent: number;
  metricTarget: number;
  unit: string;
}

export interface PreparationPhase {
  id: string;
  phaseNumber: number;
  name: string;
  theme: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationWeeks: number;
  isCurrent: boolean;
  isCompleted: boolean;
  objective: string;
  priorityTopics: string[];
  priorityPatterns: string[];
  targetProblemCount: number;
  solvedProblemCount: number;
  targetContestCount: number;
  completedContestCount: number;
  targetInterviewCount: number;
  completedInterviewCount: number;
  revisionItemTarget: number;
  expectedReadinessGain: number; // +N pts
  exitCriteria: PhaseExitCriteria[];
  progressPercent: number; // 0-100
}

export interface AdaptivePreparationRoadmap {
  goalId: string;
  totalPhases: number;
  currentPhaseIndex: number;
  phases: PreparationPhase[];
  generatedAt: string;
}

// ─── Risk Detection ───────────────────────────────────────────────────────────

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskType =
  | "revision_backlog"
  | "stagnant_difficulty"
  | "falling_consistency"
  | "deadline_proximity"
  | "unaddressed_weakness"
  | "interview_practice_gap"
  | "contest_practice_gap"
  | "high_mistake_rate"
  | "time_overage";

export interface PreparationRisk {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  title: string;
  evidence: string;
  impactDescription: string;
  recommendedCorrection: string;
  quickActionLabel: string;
  quickActionHref: string;
  acknowledged: boolean;
  detectedAt: string;
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export type MilestoneCategory =
  | "topic_mastery"
  | "problem_count"
  | "difficulty_tier"
  | "contest_simulation"
  | "interview_simulation"
  | "roadmap_phase"
  | "revision_streak";

export interface PreparationMilestone {
  id: string;
  title: string;
  category: MilestoneCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string; // YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  progressPercent: number; // 0-100
  importance: "high" | "medium" | "standard";
}

// ─── Weekly Strategy ──────────────────────────────────────────────────────────

export interface WeeklyStrategy {
  weekNumber: number;
  startDate: string;
  endDate: string;
  focusTheme: string;
  targetStudyMinutes: number;
  completedStudyMinutes: number;
  problemTargetCount: number;
  problemsSolvedCount: number;
  contestTargetCount: number;
  contestsCompletedCount: number;
  interviewTargetCount: number;
  interviewsCompletedCount: number;
  revisionTargetCount: number;
  revisionsCompletedCount: number;
  status: "on_track" | "at_risk" | "completed";
  highlightDirective: string;
}

// ─── AI Preparation Coach 8-Question Directive ────────────────────────────────

export interface AIPreparationCoachDebrief {
  amIOnTrack: string;
  whatIsHoldingMeBack: string;
  weeklyPriorities: string[];
  whatToStopDoing: string;
  todayPracticeDirective: string;
  difficultyAppropriateness: string;
  amIReadyForTarget: string;
  biggestRemainingRisk: string;
  generatedAt: string;
}

// ─── Preparation Snapshot & Historical Comparison ─────────────────────────────

export interface PreparationSnapshot {
  id: string;
  goalId: string;
  goalName: string;
  date: string; // YYYY-MM-DD
  daysRemaining: number;
  readinessScore: number;
  onTrackStatus: OnTrackStatus;
  currentPhaseName: string;
  completedMilestonesCount: number;
  totalMilestonesCount: number;
  criticalRisksCount: number;
  studyConsistencyPct: number;
  topWeakTopics: string[];
}

export interface PreparationComparisonDiff {
  metricName: string;
  baselineValue: string | number;
  currentValue: string | number;
  delta: number;
  improved: boolean;
}

export interface PreparationComparison {
  baselineSnapshot: PreparationSnapshot;
  currentSnapshot: PreparationSnapshot;
  timeframeLabel: "7_days" | "30_days" | "since_start";
  readinessDelta: number;
  diffs: PreparationComparisonDiff[];
  summaryNote: string;
}

// ─── Master Preparation Overview ──────────────────────────────────────────────

export interface FullPreparationState {
  activeGoal: PreparationGoal;
  allGoals: PreparationGoal[];
  onTrack: OnTrackAssessment;
  readiness: PreparationReadinessSummary;
  gaps: PreparationGap[];
  roadmap: AdaptivePreparationRoadmap;
  weeklyStrategy: WeeklyStrategy;
  risks: PreparationRisk[];
  milestones: PreparationMilestone[];
  coachDebrief: AIPreparationCoachDebrief;
  todayTopActions: {
    title: string;
    description: string;
    estimatedMinutes: number;
    priority: "CRITICAL" | "HIGH" | "MEDIUM";
    reason: string;
    category: "revision" | "problem" | "contest" | "interview";
    href: string;
  }[];
  lastUpdated: string;
}
