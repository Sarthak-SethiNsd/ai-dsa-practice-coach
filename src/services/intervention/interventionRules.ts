import { PreparationGoal, PreparationGoalType } from "@/services/preparation/preparationTypes";
import {
  InterventionType,
  DiagnosisCategory,
  DifficultyPolicy,
  InterventionPracticeMode,
  StrategyMode,
} from "./interventionTypes";

export function getGoalWeightMultiplier(
  type: InterventionType,
  goalType?: PreparationGoalType
): number {
  if (!goalType) return 1.0;

  switch (goalType) {
    case "dsa_interview":
    case "technical_interview":
      if (type === "INTERVIEW_PREPARATION" || type === "TIME_PRESSURE" || type === "FOUNDATION_REPAIR") {
        return 1.4;
      }
      if (type === "DIFFICULTY_INCREASE" || type === "PATTERN_DIVERSIFICATION") {
        return 1.1;
      }
      return 1.0;

    case "competitive_programming":
      if (type === "CONTEST_PREPARATION" || type === "DIFFICULTY_INCREASE" || type === "TIME_PRESSURE") {
        return 1.5;
      }
      if (type === "PATTERN_DIVERSIFICATION") {
        return 1.3;
      }
      return 0.9;

    case "placement_prep":
    case "coding_assessment":
      if (type === "FOUNDATION_REPAIR" || type === "TIME_PRESSURE" || type === "HINT_REDUCTION") {
        return 1.35;
      }
      if (type === "OVEREXPOSURE_CORRECTION") {
        return 1.2;
      }
      return 1.0;

    case "general_improvement":
    default:
      if (type === "FOUNDATION_REPAIR" || type === "PREREQUISITE_REPAIR" || type === "MASTERY_CONSOLIDATION") {
        return 1.3;
      }
      return 1.0;
  }
}

export function isInterventionInCooldown(
  type: InterventionType,
  cooldowns: Record<string, string>
): boolean {
  const expiry = cooldowns[type];
  if (!expiry) return false;
  return new Date(expiry).getTime() > Date.now();
}

export function determineDominantStrategyMode(
  interventions: InterventionType[],
  goal?: PreparationGoal | null
): StrategyMode {
  if (interventions.includes("PRACTICE_RECOVERY")) return "RECOVERY";
  if (interventions.includes("PREREQUISITE_REPAIR") || interventions.includes("FOUNDATION_REPAIR")) return "FOUNDATION_REPAIR";
  if (interventions.includes("STAGNATION_BREAK")) return "STAGNATION_BREAK";
  if (interventions.includes("DIFFICULTY_INCREASE")) return "DIFFICULTY_ACCELERATION";
  if (interventions.includes("SRS_REINFORCEMENT")) return "REVISION_FOCUS";

  if (goal?.type === "dsa_interview" || goal?.type === "technical_interview") {
    return "INTERVIEW_FOCUS";
  }
  if (goal?.type === "competitive_programming") {
    return "CONTEST_FOCUS";
  }
  if (interventions.includes("SKILL_REINFORCEMENT") || interventions.includes("MASTERY_CONSOLIDATION")) {
    return "SKILL_BUILDING";
  }

  return "BALANCED";
}

export function determineDifficultyPolicy(
  interventions: InterventionType[]
): DifficultyPolicy {
  if (
    interventions.includes("DIFFICULTY_DECREASE") ||
    interventions.includes("FOUNDATION_REPAIR") ||
    interventions.includes("PREREQUISITE_REPAIR")
  ) {
    return "DECREASE";
  }
  if (interventions.includes("DIFFICULTY_INCREASE")) return "INCREASE";
  if (interventions.includes("STAGNATION_BREAK")) return "MIXED";
  return "HOLD";
}

export function determinePreferredPracticeModes(
  mode: StrategyMode,
  interventions: InterventionType[]
): InterventionPracticeMode[] {
  if (mode === "RECOVERY") return ["REVISION", "LEARNING"];
  if (mode === "FOUNDATION_REPAIR") return ["LEARNING", "REINFORCEMENT"];
  if (mode === "STAGNATION_BREAK") return ["MIXED", "CHALLENGE"];
  if (mode === "DIFFICULTY_ACCELERATION") return ["CHALLENGE", "TIMED"];
  if (mode === "INTERVIEW_FOCUS") return ["INTERVIEW", "TIMED"];
  if (mode === "CONTEST_FOCUS") return ["CONTEST", "TIMED"];
  if (mode === "REVISION_FOCUS") return ["REVISION", "REINFORCEMENT"];

  if (interventions.includes("TIME_PRESSURE")) return ["TIMED", "MIXED"];
  return ["REINFORCEMENT", "MIXED"];
}
