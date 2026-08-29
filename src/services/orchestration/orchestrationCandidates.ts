import { Difficulty } from "@/services/types";
import {
  PreparationContext,
  PreparationActivity,
  ActivityType,
  ActivityPriority,
} from "./orchestrationTypes";

export function generateCandidateActivities(
  context: PreparationContext
): PreparationActivity[] {
  const candidates: PreparationActivity[] = [];
  const {
    activeGoal,
    strategyState,
    learningGraphNodes,
    revisionDueItems,
    currentPerformanceState,
  } = context;

  const activeInterventions = strategyState?.activeInterventions ?? [];
  const currentMode = strategyState?.currentMode ?? "BALANCED";
  const preferredDiff = strategyState?.preferredDifficulty ?? "Medium";

  // Helper to check Learning Graph prerequisite status
  const checkPrerequisites = (skillNames: string[]): { isBlocked: boolean; blocking: string[] } => {
    const blocking: string[] = [];
    for (const s of skillNames) {
      const node = learningGraphNodes.find(
        (n) => n.name.toLowerCase() === s.toLowerCase() || n.slug.toLowerCase() === s.toLowerCase()
      );
      if (node && node.prerequisites.length > 0) {
        for (const prereqId of node.prerequisites) {
          const prereqNode = learningGraphNodes.find((n) => n.id === prereqId || n.slug === prereqId);
          if (prereqNode && prereqNode.status !== "MASTERED" && prereqNode.masteryScore < 70) {
            blocking.push(prereqNode.name);
          }
        }
      }
    }
    return { isBlocked: blocking.length > 0, blocking: Array.from(new Set(blocking)) };
  };

  // 1. Strategy-Driven Candidates (Highest Context Priority)
  for (const intervention of activeInterventions) {
    const affectedSkills = intervention.affectedSkills;
    const affectedPatterns = intervention.affectedPatterns;
    const prereqCheck = checkPrerequisites(affectedSkills);

    if (intervention.interventionType === "FOUNDATION_REPAIR" || intervention.interventionType === "PREREQUISITE_REPAIR") {
      candidates.push({
        activityId: `cand_found_${intervention.id}`,
        activityType: "FOUNDATION_REPAIR",
        title: intervention.title,
        estimatedMinutes: 30,
        priority: "CRITICAL",
        priorityScore: intervention.priorityScore || 90,
        goalRelevance: 9,
        strategyAlignment: 10,
        affectedSkills,
        affectedPatterns,
        difficulty: "Easy",
        sourceSubsystem: "strategy",
        reason: `Active intervention requires repairing foundational prerequisites for ${affectedSkills.join(", ")}.`,
        prerequisites: prereqCheck.blocking,
        isPrerequisiteBlocked: false, // This activity itself IS the foundation repair
        blockingPrerequisites: [],
        successCriteria: intervention.successCriteria,
        recommendedProblemsCount: 2,
      });
    } else if (intervention.interventionType === "STAGNATION_BREAK") {
      candidates.push({
        activityId: `cand_stag_${intervention.id}`,
        activityType: "MIXED_PRACTICE",
        title: intervention.title,
        estimatedMinutes: 30,
        priority: "HIGH",
        priorityScore: intervention.priorityScore || 80,
        goalRelevance: 8,
        strategyAlignment: 10,
        affectedSkills,
        affectedPatterns,
        difficulty: "Medium",
        sourceSubsystem: "strategy",
        reason: intervention.objective,
        prerequisites: [],
        isPrerequisiteBlocked: false,
        blockingPrerequisites: [],
        successCriteria: intervention.successCriteria,
        recommendedProblemsCount: 2,
      });
    } else if (intervention.interventionType === "PRACTICE_RECOVERY") {
      candidates.push({
        activityId: `cand_recov_${intervention.id}`,
        activityType: "RECOVERY_SESSION",
        title: "Light Recovery & Concept Review",
        estimatedMinutes: 15,
        priority: "CRITICAL",
        priorityScore: 95,
        goalRelevance: 9,
        strategyAlignment: 10,
        affectedSkills: [],
        affectedPatterns: [],
        difficulty: "Easy",
        sourceSubsystem: "strategy",
        reason: "Fatigue mitigation: Short, low-pressure review session to restore cognitive stamina.",
        prerequisites: [],
        isPrerequisiteBlocked: false,
        blockingPrerequisites: [],
        successCriteria: {
          targetMetric: "Completion",
          threshold: "100%",
          description: "Complete 1-2 light review problems without time pressure.",
        },
        recommendedProblemsCount: 1,
      });
    } else if (intervention.interventionType === "TIME_PRESSURE") {
      candidates.push({
        activityId: `cand_timed_${intervention.id}`,
        activityType: "TIMED_PRACTICE",
        title: "Timed Speed & Fluency Session",
        estimatedMinutes: 30,
        priority: "HIGH",
        priorityScore: intervention.priorityScore || 75,
        goalRelevance: 8,
        strategyAlignment: 9,
        affectedSkills,
        affectedPatterns,
        difficulty: preferredDiff,
        sourceSubsystem: "strategy",
        reason: "Sharpening problem solving speed against realistic countdown constraints.",
        prerequisites: [],
        isPrerequisiteBlocked: false,
        blockingPrerequisites: [],
        successCriteria: intervention.successCriteria,
        recommendedProblemsCount: 2,
      });
    }
  }

  // 2. SRS Revision Candidates
  if (revisionDueItems.length > 0 && currentMode !== "RECOVERY") {
    const dueCount = revisionDueItems.length;
    const targetTopics = Array.from(new Set(revisionDueItems.flatMap((i) => i.topics)));
    const isUrgent = strategyState?.revisionPriority === "URGENT" || dueCount >= 5;

    candidates.push({
      activityId: `cand_srs_due_${Date.now()}`,
      activityType: "REVISION",
      title: `Spaced Revision (${dueCount} problem${dueCount !== 1 ? "s" : ""} due)`,
      estimatedMinutes: Math.min(20, Math.max(10, dueCount * 5)),
      priority: isUrgent ? "HIGH" : "MEDIUM",
      priorityScore: isUrgent ? 85 : 65,
      goalRelevance: 8,
      strategyAlignment: isUrgent ? 9 : 7,
      affectedSkills: targetTopics,
      affectedPatterns: [],
      difficulty: "Mixed",
      sourceSubsystem: "revision",
      reason: `${dueCount} problem note(s) reached scheduled retention due date in the Spaced Repetition queue.`,
      prerequisites: [],
      isPrerequisiteBlocked: false,
      blockingPrerequisites: [],
      successCriteria: {
        targetMetric: "Recall Accuracy",
        threshold: ">= 80%",
        description: "Review due cards and score active memory retention.",
      },
      recommendedProblemsCount: Math.min(dueCount, 4),
    });
  }

  // 3. Goal-Specific Candidates
  if (activeGoal) {
    const goalTopics = activeGoal.priorityTopics;
    const goalDiff = activeGoal.targetDifficulty === "Mixed" ? "Medium" : activeGoal.targetDifficulty;

    if (activeGoal.type === "dsa_interview" || activeGoal.type === "technical_interview") {
      candidates.push({
        activityId: `cand_goal_mock_${Date.now()}`,
        activityType: "MOCK_INTERVIEW",
        title: "Targeted Mock Technical Interview",
        estimatedMinutes: 45,
        priority: "HIGH",
        priorityScore: 80,
        goalRelevance: 10,
        strategyAlignment: currentMode === "INTERVIEW_FOCUS" ? 10 : 7,
        affectedSkills: goalTopics,
        affectedPatterns: [],
        difficulty: goalDiff,
        sourceSubsystem: "interview",
        reason: "Simulate unassisted interview conditions and verbal problem decomposition.",
        prerequisites: [],
        isPrerequisiteBlocked: false,
        blockingPrerequisites: [],
        successCriteria: {
          targetMetric: "Interview Score",
          threshold: ">= 75%",
          description: "Solve Medium problem with clear complexity analysis and 0 hints.",
        },
      });
    } else if (activeGoal.type === "competitive_programming") {
      candidates.push({
        activityId: `cand_goal_contest_${Date.now()}`,
        activityType: "CONTEST_PRACTICE",
        title: "Virtual Contest Simulation",
        estimatedMinutes: 60,
        priority: "HIGH",
        priorityScore: 80,
        goalRelevance: 10,
        strategyAlignment: currentMode === "CONTEST_FOCUS" ? 10 : 7,
        affectedSkills: goalTopics,
        affectedPatterns: [],
        difficulty: "Hard",
        sourceSubsystem: "contest",
        reason: "Multi-problem timed contest session testing speed and diverse pattern recognition.",
        prerequisites: [],
        isPrerequisiteBlocked: false,
        blockingPrerequisites: [],
        successCriteria: {
          targetMetric: "Contest Performance",
          threshold: ">= 2 Solves",
          description: "Solve 2+ problems within strict time limits.",
        },
      });
    }

    // Standard Goal Priority Practice
    for (const topic of goalTopics) {
      const prereqCheck = checkPrerequisites([topic]);
      candidates.push({
        activityId: `cand_topic_${topic.replace(/\s+/g, "_")}`,
        activityType: "PATTERN_PRACTICE",
        title: `Master ${topic} Core Patterns`,
        estimatedMinutes: 30,
        priority: prereqCheck.isBlocked ? "LOW" : "HIGH",
        priorityScore: prereqCheck.isBlocked ? 30 : 75,
        goalRelevance: 10,
        strategyAlignment: 8,
        affectedSkills: [topic],
        affectedPatterns: [topic],
        difficulty: goalDiff,
        sourceSubsystem: "practice",
        reason: `Target priority topic from active goal "${activeGoal.name}".`,
        prerequisites: prereqCheck.blocking,
        isPrerequisiteBlocked: prereqCheck.isBlocked,
        blockingPrerequisites: prereqCheck.blocking,
        successCriteria: {
          targetMetric: "Independent Solve Rate",
          threshold: ">= 70%",
          description: `Complete ${topic} problem set with unassisted execution.`,
        },
        recommendedProblemsCount: 2,
      });
    }
  }

  // 4. Learning Graph Bottleneck Candidates
  for (const node of learningGraphNodes) {
    if (node.status === "LEARNING" || node.status === "DEVELOPING") {
      const prereqCheck = checkPrerequisites([node.name]);
      candidates.push({
        activityId: `cand_node_${node.id}`,
        activityType: "PROBLEM_PRACTICE",
        title: `Reinforce ${node.name}`,
        estimatedMinutes: 25,
        priority: node.masteryScore < 40 ? "HIGH" : "MEDIUM",
        priorityScore: node.masteryScore < 40 ? 70 : 55,
        goalRelevance: activeGoal?.priorityTopics.includes(node.name) ? 9 : 6,
        strategyAlignment: 7,
        affectedSkills: [node.name],
        affectedPatterns: node.patterns,
        difficulty: node.difficulty,
        sourceSubsystem: "learning_graph",
        reason: `Learning Graph node "${node.name}" is at ${node.masteryScore}% mastery (${node.status}).`,
        prerequisites: prereqCheck.blocking,
        isPrerequisiteBlocked: prereqCheck.isBlocked,
        blockingPrerequisites: prereqCheck.blocking,
        successCriteria: {
          targetMetric: "Mastery Progression",
          threshold: ">= +10% Delta",
          description: `Advance ${node.name} node mastery.`,
        },
        recommendedProblemsCount: 2,
      });
    }
  }

  // 5. General Fallback Candidate
  if (candidates.length === 0) {
    candidates.push({
      activityId: `cand_fallback_${Date.now()}`,
      activityType: "PROBLEM_PRACTICE",
      title: "Balanced Problem Solving Session",
      estimatedMinutes: 30,
      priority: "MEDIUM",
      priorityScore: 50,
      goalRelevance: 7,
      strategyAlignment: 7,
      affectedSkills: ["Arrays", "Two Pointers"],
      affectedPatterns: ["Two Pointers"],
      difficulty: "Medium",
      sourceSubsystem: "practice",
      reason: "Balanced baseline practice to maintain continuous momentum.",
      prerequisites: [],
      isPrerequisiteBlocked: false,
      blockingPrerequisites: [],
      successCriteria: {
        targetMetric: "Independent Solve",
        threshold: "1 Solve",
        description: "Complete 1-2 standard medium problems unassisted.",
      },
      recommendedProblemsCount: 2,
    });
  }

  return candidates;
}
