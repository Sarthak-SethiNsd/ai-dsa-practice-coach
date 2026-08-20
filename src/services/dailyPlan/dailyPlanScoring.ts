import { ActionType, PriorityLevel, ScoringContext } from "./dailyPlanTypes";

// ─── Weight Constants ─────────────────────────────────────────────────────────
// All scoring magic numbers live here. Edit this file to tune the planner.

const WEIGHTS = {
  // Urgency — SRS
  SRS_OVERDUE: 50,
  SRS_DUE_TODAY: 35,
  SRS_LOW_RETENTION: 20,   // memory strength < 40%

  // Weakness signals
  MULTI_SYSTEM_WEAKNESS: 30,  // topic appears in analytics + reviews + notes + contests

  // Goal alignment
  HIGH_GOAL_ALIGNMENT: 25,
  MEDIUM_GOAL_ALIGNMENT: 12,

  // Roadmap milestone
  ROADMAP_ACTIVE_STEP: 20,

  // Contest proximity
  CONTEST_WITHIN_3_DAYS: 20,

  // Recency
  MISTAKE_IN_LAST_48H: 15,

  // Time budget fitness
  PENALTY_OVER_BUDGET: -999, // never surface if it doesn't fit
} as const;

// ─── Priority Mapping ─────────────────────────────────────────────────────────

export function scoreToPriority(score: number): PriorityLevel {
  if (score >= 70) return "CRITICAL";
  if (score >= 45) return "HIGH";
  if (score >= 20) return "MEDIUM";
  return "LOW";
}

// ─── Scoring Function ─────────────────────────────────────────────────────────
// Returns a deterministic numeric score (0–100+) and a human-readable rationale.

export function scoreAction(
  actionType: ActionType,
  ctx: ScoringContext,
  baseScore: number = 0
): { score: number; reason: string } {
  let score = baseScore;
  const reasons: string[] = [];

  // SRS urgency
  if (actionType === "REVISION") {
    if (ctx.hasOverdueSRS) {
      score += WEIGHTS.SRS_OVERDUE;
      reasons.push("SRS item is overdue — forgetting curve at risk");
    } else if (ctx.hasDueSRS) {
      score += WEIGHTS.SRS_DUE_TODAY;
      reasons.push("SRS item due today — optimal retention window");
    }
    if (ctx.hasDueSRS && ctx.hasWeakTopicOverlap) {
      score += WEIGHTS.SRS_LOW_RETENTION;
      reasons.push("memory strength below 40% — reinforcement critical");
    }
  }

  // Weakness signal across multiple subsystems
  if (ctx.hasWeakTopicOverlap) {
    score += WEIGHTS.MULTI_SYSTEM_WEAKNESS;
    reasons.push("topic flagged as weak across reviews, notes, and analytics");
  }

  // Goal alignment
  if (ctx.hasGoalAlignment) {
    score += WEIGHTS.HIGH_GOAL_ALIGNMENT;
    reasons.push("directly aligned with your active performance goal");
  }

  // Roadmap step
  if (ctx.hasRoadmapMilestone && actionType === "ROADMAP_STEP") {
    score += WEIGHTS.ROADMAP_ACTIVE_STEP;
    reasons.push("next step on your active practice roadmap");
  }

  // Contest proximity
  if (ctx.hasContestWithin3Days && (actionType === "CONTEST_PREP" || actionType === "PATTERN_PRACTICE")) {
    score += WEIGHTS.CONTEST_WITHIN_3_DAYS;
    reasons.push("contest approaching within 3 days — timed practice is high leverage");
  }

  // Recent mistake recurrence
  if (ctx.hasMistakeInLast48h && actionType === "REVIEW_PREVIOUS_MISTAKE") {
    score += WEIGHTS.MISTAKE_IN_LAST_48H;
    reasons.push("mistake pattern repeated in last 48 hours — review now");
  }

  // Time budget fitness — hard filter
  if (ctx.estimatedActionMinutes > ctx.remainingBudgetMinutes) {
    score += WEIGHTS.PENALTY_OVER_BUDGET;
    reasons.push("exceeds available time budget");
  }

  const reason =
    reasons.length > 0
      ? reasons.join("; ")
      : "Routine practice to maintain consistency";

  return { score: Math.max(0, score), reason };
}

// ─── Time Budget Distribution ─────────────────────────────────────────────────
// Returns the ideal share of time for each action type given a budget.

export interface TimeBudgetAllocation {
  revisionMinutes: number;
  newProblemMinutes: number;
  weakTopicMinutes: number;
  contestPrepMinutes: number;
  studyMinutes: number;
  mistakeReviewMinutes: number;
}

export function allocateTimeBudget(totalMinutes: number): TimeBudgetAllocation {
  if (totalMinutes <= 15) {
    // Ultra-short: SRS-only sprint
    return {
      revisionMinutes: totalMinutes,
      newProblemMinutes: 0,
      weakTopicMinutes: 0,
      contestPrepMinutes: 0,
      studyMinutes: 0,
      mistakeReviewMinutes: 0,
    };
  }
  if (totalMinutes <= 30) {
    // Short: SRS + quick mistake review
    return {
      revisionMinutes: Math.round(totalMinutes * 0.6),
      newProblemMinutes: 0,
      weakTopicMinutes: Math.round(totalMinutes * 0.3),
      contestPrepMinutes: 0,
      studyMinutes: 0,
      mistakeReviewMinutes: Math.round(totalMinutes * 0.1),
    };
  }
  if (totalMinutes <= 45) {
    return {
      revisionMinutes: Math.round(totalMinutes * 0.4),
      newProblemMinutes: Math.round(totalMinutes * 0.3),
      weakTopicMinutes: Math.round(totalMinutes * 0.2),
      contestPrepMinutes: 0,
      studyMinutes: 0,
      mistakeReviewMinutes: Math.round(totalMinutes * 0.1),
    };
  }
  if (totalMinutes <= 60) {
    return {
      revisionMinutes: Math.round(totalMinutes * 0.35),
      newProblemMinutes: Math.round(totalMinutes * 0.3),
      weakTopicMinutes: Math.round(totalMinutes * 0.2),
      contestPrepMinutes: 0,
      studyMinutes: Math.round(totalMinutes * 0.1),
      mistakeReviewMinutes: Math.round(totalMinutes * 0.05),
    };
  }
  if (totalMinutes <= 90) {
    return {
      revisionMinutes: Math.round(totalMinutes * 0.3),
      newProblemMinutes: Math.round(totalMinutes * 0.3),
      weakTopicMinutes: Math.round(totalMinutes * 0.2),
      contestPrepMinutes: Math.round(totalMinutes * 0.1),
      studyMinutes: Math.round(totalMinutes * 0.05),
      mistakeReviewMinutes: Math.round(totalMinutes * 0.05),
    };
  }
  // 120+ min: full balanced session
  return {
    revisionMinutes: Math.round(totalMinutes * 0.25),
    newProblemMinutes: Math.round(totalMinutes * 0.3),
    weakTopicMinutes: Math.round(totalMinutes * 0.2),
    contestPrepMinutes: Math.round(totalMinutes * 0.1),
    studyMinutes: Math.round(totalMinutes * 0.1),
    mistakeReviewMinutes: Math.round(totalMinutes * 0.05),
  };
}

// ─── Weakness Overlap Detection ───────────────────────────────────────────────
// Topics that show up in ≥2 systems are "overlapping weak topics".

export function detectOverlappingWeakTopics(
  analyticsWeakTopics: string[],
  reviewWeakTopics: string[],
  noteMistakeTopics: string[]
): string[] {
  const counts = new Map<string, number>();

  const addTopic = (t: string) => {
    const key = t.toLowerCase().trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };

  analyticsWeakTopics.forEach(addTopic);
  reviewWeakTopics.forEach(addTopic);
  noteMistakeTopics.forEach(addTopic);

  const overlapping: string[] = [];
  counts.forEach((count, topic) => {
    if (count >= 2) overlapping.push(topic);
  });

  return overlapping;
}
