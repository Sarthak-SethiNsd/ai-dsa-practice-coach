import {
  PreparationPlan,
  SubsystemHandoffPayloads,
} from "./orchestrationTypes";

export function generateExecutionHandoffs(plan: PreparationPlan): SubsystemHandoffPayloads {
  const primaryAct = plan.activities[0];
  const allSkills = Array.from(new Set(plan.activities.flatMap((a) => a.affectedSkills)));
  const allPatterns = Array.from(new Set(plan.activities.flatMap((a) => a.affectedPatterns)));

  const revisionActivities = plan.activities.filter((a) => a.activityType === "REVISION");

  // 1. Practice Session Handoff
  const practiceSessionHandoff = {
    targetDurationMinutes: primaryAct ? primaryAct.estimatedMinutes : 30,
    preferredMode: (plan.strategyMode === "INTERVIEW_FOCUS"
      ? "INTERVIEW"
      : plan.strategyMode === "RECOVERY"
      ? "REVISION"
      : plan.strategyMode === "STAGNATION_BREAK"
      ? "MIXED"
      : "REINFORCEMENT") as any,
    targetDifficulty: primaryAct?.difficulty || "Medium",
    hintPolicy: plan.strategyMode === "INTERVIEW_FOCUS" ? "DELAYED" : ("ALLOW_ALL" as any),
    focusSkills: primaryAct?.affectedSkills || allSkills,
    focusPatterns: primaryAct?.affectedPatterns || allPatterns,
    recommendedProblemsCount: primaryAct?.recommendedProblemsCount || 2,
    sourcePlanId: plan.planId,
    reason: `Orchestrated Next Action: ${plan.nextBestAction.actionTitle}`,
  };

  // 2. Recommendation Engine Handoff
  const recommendationHandoff = {
    boostSkills: allSkills,
    demoteSkills: plan.deferredActivities
      .filter((d) => d.category === "NOT_RECOMMENDED")
      .flatMap((d) => d.activity.affectedPatterns),
    targetPatterns: allPatterns,
    excludedPatterns: plan.deferredActivities
      .filter((d) => d.category === "NOT_RECOMMENDED")
      .flatMap((d) => d.activity.affectedPatterns),
    targetDifficulty: primaryAct?.difficulty || "Medium",
    count: plan.activities.reduce((acc, a) => acc + (a.recommendedProblemsCount || 1), 0),
    sourcePlanId: plan.planId,
    reason: `Orchestration plan targeting ${plan.primaryFocus}`,
  };

  // 3. SRS Handoff
  const srsHandoff = {
    urgentRevisionItemIds: [],
    targetSkills: revisionActivities.flatMap((r) => r.affectedSkills),
    maxRevisionCount: revisionActivities.length > 0 ? 5 : 2,
    sourcePlanId: plan.planId,
    reason: revisionActivities.length > 0 ? "SRS Revision block included in plan" : "Low urgency revision",
  };

  // 4. Planner Handoff
  const plannerHandoff = {
    dailyWorkloadMinutes: plan.totalPlannedMinutes,
    activityBlocks: plan.activities.map((a) => ({
      title: a.title,
      durationMinutes: a.estimatedMinutes,
      activityType: a.activityType,
      priority: a.priority,
    })),
    sourcePlanId: plan.planId,
  };

  // 5. Learning Graph Handoff
  const learningGraphHandoff = {
    focusPrerequisites: plan.activities
      .filter((a) => a.activityType === "FOUNDATION_REPAIR")
      .flatMap((a) => a.affectedSkills),
    targetBottlenecks: plan.activities
      .filter((a) => a.activityType === "FOUNDATION_REPAIR")
      .flatMap((a) => a.affectedSkills),
    sourcePlanId: plan.planId,
    reason: `Focusing on ${allSkills.join(", ")} foundations`,
  };

  // 6. Goal Handoff
  const goalHandoff = {
    goalId: plan.goal?.id || null,
    currentPaceStatus: "ON_TRACK" as const,
    dailyMinutesRecommendation: plan.totalPlannedMinutes,
    priorityShift: `Orchestrated ${plan.primaryFocus}`,
    sourcePlanId: plan.planId,
  };

  return {
    practiceSession: practiceSessionHandoff,
    recommendation: recommendationHandoff,
    srs: srsHandoff,
    planner: plannerHandoff,
    learningGraph: learningGraphHandoff,
    goal: goalHandoff,
  };
}
