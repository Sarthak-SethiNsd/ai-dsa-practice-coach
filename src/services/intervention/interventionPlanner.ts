import { PreparationGoal } from "@/services/preparation/preparationTypes";
import {
  InterventionDiagnosis,
  InterventionPlan,
  AdaptiveStrategyState,
  InterventionStatus,
  DifficultyPolicy,
  InterventionPracticeMode,
  StrategyMode,
} from "./interventionTypes";
import { scoreInterventionDiagnosis } from "./interventionScoring";
import {
  determineDominantStrategyMode,
  determineDifficultyPolicy,
  determinePreferredPracticeModes,
  isInterventionInCooldown,
} from "./interventionRules";
import { resolveInterventionConflicts } from "./interventionConflictResolver";

export function buildInterventionPlan(
  diagnosis: InterventionDiagnosis,
  activeGoal: PreparationGoal | null,
  now = new Date()
): InterventionPlan {
  const scoreBreakdown = scoreInterventionDiagnosis(diagnosis, activeGoal);
  const targetDurationSessions = diagnosis.severity === "CRITICAL" ? 2 : diagnosis.severity === "HIGH" ? 3 : 5;
  const reviewDate = new Date(now.getTime() + targetDurationSessions * 24 * 60 * 60 * 1000).toISOString();

  let title = "Skill Reinforcement";
  let objective = "Consolidate mastery and reinforce pattern recognition.";
  let suggestedAction = "Maintain focused practice on key topics.";
  let targetMetric = "Independent Solve Rate";
  let threshold: string | number = ">= 70%";
  let successDesc = "Achieve 70%+ independent solves across 3 consecutive sessions.";
  let fallbackAction = "Return to prerequisite learning modules.";
  let expectedOutcome = "Strengthened independent solving confidence.";
  let practiceMode: InterventionPracticeMode = "REINFORCEMENT";
  let difficultyPolicy: DifficultyPolicy = "HOLD";
  let timePressureLevel: InterventionPlan["timePressureLevel"] = "STANDARD";

  switch (diagnosis.recommendedIntervention) {
    case "FOUNDATION_REPAIR":
    case "PREREQUISITE_REPAIR": {
      const skill = diagnosis.affectedSkills[0] || "Target Concept";
      title = `Repair ${skill} Fundamentals`;
      objective = `Raise independent solve rate and bridge foundational gaps before tackling advanced ${skill} problems.`;
      suggestedAction = `Schedule 3 prerequisite-bridge sessions on ${skill} core patterns.`;
      targetMetric = `${skill} Independent Solve Rate`;
      threshold = ">= 75%";
      successDesc = `Achieve >= 75% independent solve rate on ${skill} bridge problems with 0 hints.`;
      fallbackAction = "Step down one tier to fundamental concept drills.";
      expectedOutcome = `Restored mastery foundation in ${skill} allowing confident return to standard problem sets.`;
      practiceMode = "LEARNING";
      difficultyPolicy = "DECREASE";
      timePressureLevel = "LOW";
      break;
    }

    case "STAGNATION_BREAK": {
      const skill = diagnosis.affectedSkills[0] || "Stagnant Topic";
      title = `Break Stagnation in ${skill}`;
      objective = `Disrupt flat learning curve in ${skill} by introducing mixed-pattern challenges and explanation-first practice.`;
      suggestedAction = `Switch ${skill} practice to mixed-pattern variations with strict reflection steps.`;
      targetMetric = `${skill} Solve Speed & Independence`;
      threshold = "+15% Independence or -3 min solve time";
      successDesc = "Measurable acceleration in solve time or positive jump in unassisted solves.";
      fallbackAction = "Switch to worked-example review and spaced repetition reinforcement.";
      expectedOutcome = `Overcoming plateau to resume learning velocity in ${skill}.`;
      practiceMode = "MIXED";
      difficultyPolicy = "MIXED";
      timePressureLevel = "STANDARD";
      break;
    }

    case "DIFFICULTY_DECREASE": {
      title = "Calibrate Difficulty Downward";
      objective = "Relieve acute failure pressure and rebuild independent problem decomposition confidence.";
      suggestedAction = "Temporarily shift target difficulty from Hard to Medium/Easy tier.";
      targetMetric = "Overall Solve Rate";
      threshold = ">= 80%";
      successDesc = "Consistent unassisted solves across 3 consecutive sessions on Medium tier.";
      fallbackAction = "Extend foundation practice for 2 additional sessions.";
      expectedOutcome = "Reduced frustration, stabilized solve rates, and reinforced fundamental patterns.";
      practiceMode = "REINFORCEMENT";
      difficultyPolicy = "DECREASE";
      timePressureLevel = "LOW";
      break;
    }

    case "DIFFICULTY_INCREASE": {
      title = "Accelerate Difficulty to Hard Tier";
      objective = "Introduce Hard-tier problem exposure to prevent comfort-zone stagnation.";
      suggestedAction = "Incorporate 1 Hard problem into each practice queue.";
      targetMetric = "Hard Attempt Accuracy";
      threshold = ">= 60% with <= 1 hint";
      successDesc = "Successful completion of Hard problems within reasonable time bounds.";
      fallbackAction = "Hold at Medium tier for 3 more sessions.";
      expectedOutcome = "Broadened competitive problem-solving range.";
      practiceMode = "CHALLENGE";
      difficultyPolicy = "INCREASE";
      timePressureLevel = "STANDARD";
      break;
    }

    case "HINT_REDUCTION": {
      title = "Reduce Hint Dependency";
      objective = "Transition from guided solving to unassisted mental model construction.";
      suggestedAction = "Enforce a 5-minute reflection delay before opening any hint.";
      targetMetric = "Hint-Assisted Rate";
      threshold = "<= 20%";
      successDesc = "Under 20% hint usage with steady or improving solve rates.";
      fallbackAction = "Provide structural skeleton hints instead of direct step-by-step guidance.";
      expectedOutcome = "Heightened independent interview problem solving ability.";
      practiceMode = "REINFORCEMENT";
      difficultyPolicy = "HOLD";
      timePressureLevel = "STANDARD";
      break;
    }

    case "HINT_SUPPORTED_LEARNING": {
      title = "Support Concept Acquisition";
      objective = "Leverage scaffolded hints during initial discovery of new algorithmic patterns.";
      suggestedAction = "Allow early hint access during first exposure to new topics.";
      targetMetric = "Concept Acquisition Rate";
      threshold = "100% completion of new topic intro problems";
      successDesc = "Successful completion of concept introduction queue.";
      fallbackAction = "Review Knowledge Base notes for foundational topic.";
      expectedOutcome = "Low-friction onboarding into unfamiliar algorithmic territory.";
      practiceMode = "LEARNING";
      difficultyPolicy = "HOLD";
      timePressureLevel = "LOW";
      break;
    }

    case "TIME_PRESSURE": {
      title = "Build Time Fluency & Speed";
      objective = "Close the fluency gap by practicing against realistic contest/interview time budgets.";
      suggestedAction = "Activate timer countdown and aim for 15-minute Medium target solves.";
      targetMetric = "Can Solve Efficiently Rate";
      threshold = ">= 75%";
      successDesc = "75%+ solves completed within 1.2x of target time budget.";
      fallbackAction = "Extend time budget by 20% and retry.";
      expectedOutcome = "Sharpened speed and stress-resilient execution.";
      practiceMode = "TIMED";
      difficultyPolicy = "HOLD";
      timePressureLevel = "HIGH";
      break;
    }

    case "PRACTICE_RECOVERY": {
      title = "Enter Preparation Recovery Mode";
      objective = "Alleviate practice fatigue, prevent burnout, and restore cognitive momentum.";
      suggestedAction = "Cut session lengths by 50%, remove time pressure, and focus on review.";
      targetMetric = "Session Completion Rate";
      threshold = ">= 90%";
      successDesc = "Completion of 3 low-stress recovery sessions without dropouts.";
      fallbackAction = "Take a full rest day before resuming light revision.";
      expectedOutcome = "Renewed stamina, eliminated fatigue dropouts, and restored enjoyment.";
      practiceMode = "REVISION";
      difficultyPolicy = "DECREASE";
      timePressureLevel = "NONE";
      break;
    }

    case "OVEREXPOSURE_CORRECTION": {
      const pat = diagnosis.affectedPatterns[0] || "Dominant Pattern";
      title = `Diversify Beyond ${pat}`;
      objective = `Reduce over-concentration in ${pat} and expand coverage across goal-relevant patterns.`;
      suggestedAction = `Demote ${pat} and prioritize underexposed priority topics.`;
      targetMetric = `${pat} Exposure Share`;
      threshold = "<= 25% of total practice";
      successDesc = "Balanced distribution across at least 3 distinct algorithmic patterns.";
      fallbackAction = "Lock ${pat} recommendations for 2 sessions.";
      expectedOutcome = "Well-rounded algorithmic toolkit.";
      practiceMode = "MIXED";
      difficultyPolicy = "HOLD";
      timePressureLevel = "STANDARD";
      break;
    }

    case "PATTERN_DIVERSIFICATION": {
      const pat = diagnosis.affectedPatterns[0] || "Underexposed Pattern";
      title = `Boost Exposure for ${pat}`;
      objective = `Accelerate practice volume on underexposed goal priority topic ${pat}.`;
      suggestedAction = `Inject ${pat} problems into upcoming practice queues.`;
      targetMetric = `${pat} Attempt Volume`;
      threshold = ">= 3 attempts in next 5 days";
      successDesc = "Active coverage of all mandatory goal patterns.";
      fallbackAction = "Include ${pat} in Daily Plan priority list.";
      expectedOutcome = "Complete pattern readiness for target assessment.";
      practiceMode = "REINFORCEMENT";
      difficultyPolicy = "HOLD";
      timePressureLevel = "STANDARD";
      break;
    }

    default: {
      title = "Consolidate Mastery";
      objective = "Maintain current balanced practice rhythm.";
      suggestedAction = "Continue regular adaptive practice sessions.";
      break;
    }
  }

  return {
    id: `plan_${diagnosis.recommendedIntervention.toLowerCase()}_${now.getTime()}`,
    diagnosisId: diagnosis.diagnosisId,
    title,
    interventionType: diagnosis.recommendedIntervention,
    status: "PROPOSED",
    objective,
    priority: scoreBreakdown.priority,
    priorityScore: scoreBreakdown.normalizedScore,
    priorityBreakdown: scoreBreakdown,
    targetDurationSessions,
    completedSessions: 0,
    affectedSkills: diagnosis.affectedSkills,
    affectedPatterns: diagnosis.affectedPatterns,
    difficultyPolicy,
    practiceMode,
    revisionPriority: diagnosis.recommendedIntervention === "PRACTICE_RECOVERY" || diagnosis.recommendedIntervention === "SRS_REINFORCEMENT" ? "URGENT" : "NORMAL",
    timePressureLevel,
    successCriteria: {
      targetMetric,
      threshold,
      description: successDesc,
    },
    rollbackCriteria: {
      triggerCondition: "If independent solve rate drops or frustration spikes across 2 sessions.",
      fallbackAction,
    },
    expectedOutcome,
    suggestedAction,
    startDate: now.toISOString(),
    reviewDate,
    cooldownDays: 5,
    evidenceChain: {
      evidence: diagnosis.evidenceSummary,
      diagnosis: diagnosis.rationale,
      decision: title,
      action: suggestedAction,
      successCriteria: successDesc,
    },
  };
}

export function compileAdaptiveStrategyState(
  diagnoses: InterventionDiagnosis[],
  activeGoal: PreparationGoal | null,
  cooldowns: Record<string, string> = {}
): {
  state: AdaptiveStrategyState;
  plans: InterventionPlan[];
} {
  const now = new Date();
  const rawPlans: InterventionPlan[] = [];

  // Convert each non-cooldown diagnosis to an intervention plan
  for (const diag of diagnoses) {
    if (diag.category === "INSUFFICIENT_DATA") {
      continue;
    }

    if (isInterventionInCooldown(diag.recommendedIntervention, cooldowns)) {
      continue;
    }

    const plan = buildInterventionPlan(diag, activeGoal, now);
    rawPlans.push(plan);
  }

  // Resolve conflicts
  const { resolvedPlans } = resolveInterventionConflicts(rawPlans, activeGoal);

  // Mark top plan as ACTIVE
  if (resolvedPlans.length > 0) {
    resolvedPlans[0].status = "ACTIVE";
  }

  const activeInterventions = resolvedPlans.filter((p) => p.status === "ACTIVE");
  const proposedInterventions = resolvedPlans.filter((p) => p.status === "PROPOSED");
  const interventionTypes = resolvedPlans.map((p) => p.interventionType);

  const currentMode = determineDominantStrategyMode(interventionTypes, activeGoal);
  const difficultyPolicy = determineDifficultyPolicy(interventionTypes);
  const preferredPracticeModes = determinePreferredPracticeModes(currentMode, interventionTypes);

  let currentFocus = "Balanced Skill Progression";
  let modeRationale = "Maintaining steady practice across all core algorithmic paradigms.";

  if (activeInterventions.length > 0) {
    currentFocus = activeInterventions[0].title;
    modeRationale = activeInterventions[0].objective;
  } else if (diagnoses.some((d) => d.category === "INSUFFICIENT_DATA")) {
    currentFocus = "Building Historical Baseline";
    modeRationale = "Complete more practice attempts to establish a statistically reliable diagnostic baseline.";
  }

  const protectedSkills: string[] = [];
  const deprioritizedSkills: string[] = [];
  const targetPatterns: string[] = [];

  for (const plan of resolvedPlans) {
    if (plan.interventionType === "OVEREXPOSURE_CORRECTION") {
      deprioritizedSkills.push(...plan.affectedPatterns);
    }
    if (plan.interventionType === "PATTERN_DIVERSIFICATION") {
      targetPatterns.push(...plan.affectedPatterns);
    }
    if (plan.interventionType === "FOUNDATION_REPAIR") {
      protectedSkills.push(...plan.affectedSkills);
    }
  }

  const state: AdaptiveStrategyState = {
    strategyVersion: "1.0.0",
    currentMode,
    modeRationale,
    currentFocus,
    topPriorityPlanId: activeInterventions[0]?.id || null,
    activeInterventions,
    proposedInterventions,
    protectedSkills: Array.from(new Set(protectedSkills)),
    deprioritizedSkills: Array.from(new Set(deprioritizedSkills)),
    preferredDifficulty: difficultyPolicy === "DECREASE" ? "Easy" : difficultyPolicy === "INCREASE" ? "Hard" : "Medium",
    difficultyPolicy,
    preferredPracticeModes,
    targetPatterns: Array.from(new Set(targetPatterns)),
    revisionPriority: currentMode === "RECOVERY" || currentMode === "REVISION_FOCUS" ? "URGENT" : "NORMAL",
    timePressureLevel: resolvedPlans.some((p) => p.timePressureLevel === "HIGH") ? "HIGH" : currentMode === "RECOVERY" ? "NONE" : "STANDARD",
    interventionCooldowns: cooldowns,
    lastUpdated: now.toISOString(),
  };

  return {
    state,
    plans: resolvedPlans,
  };
}
