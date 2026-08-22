// ─── Action Types ─────────────────────────────────────────────────────────────

export type ActionType =
  | "REVISION"             // SRS due / overdue problem
  | "RECOMMENDED_PROBLEM"  // Fresh algorithmic challenge matched to readiness
  | "WEAK_TOPIC_PRACTICE"  // Targeted drill on a consolidated weak topic
  | "PATTERN_PRACTICE"     // Algorithmic pattern mastery practice
  | "CONTEST_PREP"         // Timed contest preparation drill
  | "STUDY_SESSION"        // Focused study block
  | "REVIEW_PREVIOUS_MISTAKE" // Re-analyzing past mistake patterns
  | "ROADMAP_STEP"         // Next milestone in active practice roadmap
  | "MOCK_INTERVIEW"       // Structured AI Mock Technical Interview
  | "VIRTUAL_CONTEST";     // Timed Virtual Contest simulation

export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ActionStatus = "pending" | "completed" | "skipped";

// ─── Time Budget ──────────────────────────────────────────────────────────────

export type TimeBudgetPreset = 15 | 30 | 45 | 60 | 90 | 120 | "custom";

// ─── Daily Action ─────────────────────────────────────────────────────────────

export interface DailyAction {
  id: string;
  actionType: ActionType;
  title: string;
  description: string;
  platform?: string;
  difficulty?: string;
  topic?: string;
  patternName?: string;
  problemUrl?: string;
  estimatedMinutes: number;
  priority: PriorityLevel;
  priorityScore: number; // deterministic score computed by dailyPlanScoring
  reason: string;        // human-readable justification
  expectedOutcome: string;
  goalAlignment: "High" | "Medium" | "Low";
  status: ActionStatus;
  completedAt?: string; // ISO datetime when marked complete
  skippedAt?: string;   // ISO datetime when skipped
  // Back-reference to source subsystem record
  sourceRef?: {
    type: "revision" | "roadmap" | "recommendation" | "contest" | "knowledge" | "study" | "interview" | "vcontest";
    id: string;
  };
}

// ─── Daily Plan ───────────────────────────────────────────────────────────────

export type DailyPlanStatus = "in_progress" | "completed" | "skipped";

export interface DailyPlan {
  id: string;
  date: string;              // YYYY-MM-DD
  timeBudgetMinutes: number;
  totalPlannedMinutes: number;
  completedMinutes: number;
  actions: DailyAction[];
  criticalCount: number;
  completedCount: number;
  skippedCount: number;
  streak: number;            // current daily practice streak
  mainFocus: string;         // e.g. "Overdue SRS Revisions + Weak Topic: DP"
  status: DailyPlanStatus;
  generatedAt: string;       // ISO datetime
  replannedAt?: string;      // ISO datetime of last replan
}

// ─── Tomorrow Preview ─────────────────────────────────────────────────────────

export interface TomorrowPreviewData {
  srsItemsDue: number;
  srsItemsOverdue: number;
  upcomingRoadmapStep: string | null;
  upcomingContest: { name: string; date: string; daysUntil: number } | null;
  estimatedMinutes: number;
}

// ─── AI Daily Coach ───────────────────────────────────────────────────────────

export interface AIDailyCoachAdvice {
  greeting: string;          // e.g. "Good morning, Sarthak!"
  mainDirective: string;     // What matters most today
  whyItMatters: string;      // Why this matters today
  whatToAvoid: string;       // Common pitfall for today's session
  nextMilestone: string;     // Next meaningful progress milestone
  motivationLine: string;    // Short motivational line
}

// ─── Planner Analytics ────────────────────────────────────────────────────────

export interface PlannerAnalytics {
  totalPlansGenerated: number;
  plansCompleted: number;
  completionRate: number;   // 0-100%
  avgPlannedMinutes: number;
  avgCompletedMinutes: number;
  weeklyConsistency: number; // days with completed plan in the last 7 days
  actionTypeBreakdown: Record<ActionType, number>;
}

// ─── Plan History Record ──────────────────────────────────────────────────────

export interface PlanHistoryRecord {
  id: string;
  date: string;              // YYYY-MM-DD
  timeBudgetMinutes: number;
  totalPlannedMinutes: number;
  completedMinutes: number;
  completedCount: number;
  totalActions: number;
  mainFocus: string;
  status: DailyPlanStatus;
  generatedAt: string;
}

// ─── Scoring Context ──────────────────────────────────────────────────────────
// Used internally by dailyPlanScoring.ts

export interface ScoringContext {
  hasOverdueSRS: boolean;
  hasDueSRS: boolean;
  hasWeakTopicOverlap: boolean;
  hasGoalAlignment: boolean;
  hasRoadmapMilestone: boolean;
  hasContestWithin3Days: boolean;
  hasMistakeInLast48h: boolean;
  remainingBudgetMinutes: number;
  estimatedActionMinutes: number;
}
