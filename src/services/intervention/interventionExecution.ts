import { PreparationGoal } from "@/services/preparation/preparationTypes";
import {
  InterventionPlan,
  AdaptiveStrategyState,
  SubsystemInterventionSignals,
} from "./interventionTypes";

export function generateInterventionSignals(
  plans: InterventionPlan[],
  strategyState: AdaptiveStrategyState,
  activeGoal: PreparationGoal | null
): SubsystemInterventionSignals {
  const boostSkills = new Set<string>();
  const demoteSkills = new Set<string>();
  const targetPatterns = new Set<string>();
  const excludedPatterns = new Set<string>();
  const focusPrerequisites = new Set<string>();
  const protectMasteredSkills = new Set<string>();
  const reinforceSkills = new Set<string>();
  const targetBottlenecks = new Set<string>();
  const targetRevisionSkills = new Set<string>();
  const focusAreas = new Set<string>();

  for (const plan of plans) {
    if (plan.status !== "ACTIVE" && plan.status !== "PROPOSED") continue;

    // Pattern & Skill handling
    if (plan.interventionType === "FOUNDATION_REPAIR" || plan.interventionType === "PREREQUISITE_REPAIR") {
      plan.affectedSkills.forEach((s) => {
        boostSkills.add(s);
        focusPrerequisites.add(s);
        targetBottlenecks.add(s);
        targetRevisionSkills.add(s);
        focusAreas.add(`${s} Foundations`);
      });
    }

    if (plan.interventionType === "SKILL_REINFORCEMENT" || plan.interventionType === "STAGNATION_BREAK") {
      plan.affectedSkills.forEach((s) => {
        reinforceSkills.add(s);
        focusAreas.add(s);
      });
    }

    if (plan.interventionType === "OVEREXPOSURE_CORRECTION") {
      plan.affectedPatterns.forEach((p) => {
        demoteSkills.add(p);
        excludedPatterns.add(p);
      });
    }

    if (plan.interventionType === "PATTERN_DIVERSIFICATION") {
      plan.affectedPatterns.forEach((p) => {
        targetPatterns.add(p);
        focusAreas.add(p);
      });
    }

    if (plan.interventionType === "PRACTICE_RECOVERY") {
      focusAreas.add("Light Review & Rest");
    }
  }

  // Hint policy determination
  let hintPolicy: SubsystemInterventionSignals["practiceSessionEngine"]["hintPolicy"] = "ALLOW_ALL";
  if (plans.some((p) => p.interventionType === "HINT_REDUCTION" && (p.status === "ACTIVE" || p.status === "PROPOSED"))) {
    hintPolicy = "DELAYED";
  }

  // Session duration recommendation
  let recommendedMinutes = activeGoal?.dailyMinutes || 45;
  const sessionCount = 1;
  if (strategyState.currentMode === "RECOVERY") {
    recommendedMinutes = Math.max(15, Math.round(recommendedMinutes * 0.5));
  } else if (strategyState.currentMode === "DIFFICULTY_ACCELERATION") {
    recommendedMinutes = Math.min(90, Math.round(recommendedMinutes * 1.2));
  }

  // Goal risk assessment
  let goalRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (strategyState.currentMode === "RECOVERY" || plans.some((p) => p.priority === "CRITICAL")) {
    goalRisk = "HIGH";
  } else if (plans.some((p) => p.priority === "HIGH")) {
    goalRisk = "MEDIUM";
  }

  return {
    recommendationEngine: {
      boostSkills: Array.from(boostSkills),
      demoteSkills: Array.from(demoteSkills),
      targetPatterns: Array.from(targetPatterns),
      excludedPatterns: Array.from(excludedPatterns),
      difficultyPolicy: strategyState.difficultyPolicy,
      targetDifficulty: strategyState.preferredDifficulty,
      reasoning: `Strategy Mode ${strategyState.currentMode}: Prioritizing ${strategyState.currentFocus}.`,
    },

    practiceSessionEngine: {
      preferredMode: strategyState.preferredPracticeModes[0] || "REINFORCEMENT",
      timePressure: strategyState.timePressureLevel,
      hintPolicy,
      targetDurationMinutes: recommendedMinutes,
      recommendedProblemCount: strategyState.currentMode === "RECOVERY" ? 2 : 3,
      targetFocusSkills: Array.from(focusAreas),
      reasoning: strategyState.modeRationale,
    },

    learningGraph: {
      focusPrerequisites: Array.from(focusPrerequisites),
      protectMasteredSkills: Array.from(protectMasteredSkills),
      reinforceSkills: Array.from(reinforceSkills),
      targetBottlenecks: Array.from(targetBottlenecks),
      reasoning: `Longitudinal strategy requires focus on ${focusPrerequisites.size} bottleneck prerequisite(s).`,
    },

    srsRevision: {
      increaseRevisionPriority: strategyState.revisionPriority === "URGENT" || strategyState.currentMode === "RECOVERY",
      priorityLevel: strategyState.revisionPriority,
      targetRevisionSkills: Array.from(targetRevisionSkills),
      reasoning: `SRS revision elevated to support ${strategyState.currentFocus}.`,
    },

    dailyPlanner: {
      recommendedMinutes,
      sessionCount,
      focusAreas: Array.from(focusAreas),
      reasoning: `Daily schedule aligned to ${strategyState.currentMode} mode.`,
    },

    preparationCommandCenter: {
      strategyStatus: strategyState.currentMode === "RECOVERY" ? "RECOVERY" : goalRisk === "HIGH" ? "AT_RISK" : "OPTIMAL",
      goalRisk,
      priorityShiftNotice: `Active Strategy: ${strategyState.currentMode} (${strategyState.currentFocus})`,
      activeInterventionCount: strategyState.activeInterventions.length,
    },
  };
}
