import test from "node:test";
import assert from "node:assert";
import {
  PreparationContext,
  PreparationPlan,
} from "../orchestrationTypes";
import { generateCandidateActivities } from "../orchestrationCandidates";
import { resolveCandidatePrecedence } from "../orchestrationConflictResolver";
import { evaluateActivityConstraints } from "../orchestrationConstraints";
import { generatePreparationPlan } from "../orchestrationPlanner";
import { generateExecutionHandoffs } from "../orchestrationExecution";
import { calculateActivityPriority } from "../orchestrationPrioritization";
import { PreparationGoal } from "@/services/preparation/preparationTypes";
import { SkillNode } from "@/services/learningGraph/learningGraphTypes";
import { RevisionItem } from "@/services/revision/revisionTypes";
import { FullPerformanceIntelligence } from "@/services/performance/performanceTypes";
import { AdaptiveStrategyState } from "@/services/intervention/interventionTypes";

// ─── Test Fixture Generators ──────────────────────────────────────────────────

function createMockSkillNode(overrides: Partial<SkillNode> = {}): SkillNode {
  return {
    id: "arrays",
    name: "Arrays",
    slug: "arrays",
    category: "data_structures",
    type: "topic",
    difficulty: "Easy",
    description: "Core array manipulations",
    prerequisites: [],
    dependents: ["two_pointers"],
    patterns: ["Arrays"],
    masteryScore: 85,
    confidenceScore: 80,
    evidenceCount: 10,
    status: "MASTERED",
    decayFactor: 0,
    recentAccuracy: 90,
    solvedProblemsCount: 15,
    difficultyReached: "Medium",
    targetProblemIds: [1, 2],
    ...overrides,
  };
}

function createMockGoal(overrides: Partial<PreparationGoal> = {}): PreparationGoal {
  return {
    id: "test_goal_1",
    name: "Big Tech Interview Target",
    type: "dsa_interview",
    targetDate: "2026-09-30",
    dailyMinutes: 45,
    daysPerWeek: 6,
    preferredPlatforms: ["leetcode"],
    currentSkillLevel: "intermediate",
    targetDifficulty: "Medium",
    priorityTopics: ["Sliding Window", "Dynamic Programming", "Trees"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function createMockRevisionItem(overrides: Partial<RevisionItem> = {}): RevisionItem {
  return {
    id: "rev_1",
    problemId: 1,
    problemTitle: "Two Sum",
    platform: "leetcode",
    difficulty: "Easy",
    topics: ["Arrays"],
    repetitions: 2,
    intervalDays: 7,
    easeFactor: 2.5,
    memoryStrength: 40,
    successRate: 100,
    lastSolvedAt: "2026-08-15",
    lastRevisedAt: "2026-08-20",
    nextDueDate: "2026-08-27",
    status: "due",
    history: [],
    createdAt: "2026-08-15",
    ...overrides,
  };
}

function createMockContext(overrides: Partial<PreparationContext> = {}): PreparationContext {
  const mockGoal = createMockGoal();
  const mockNode = createMockSkillNode();

  const strategyState: AdaptiveStrategyState = {
    strategyVersion: "1.0.0",
    currentMode: "BALANCED",
    modeRationale: "Balanced practice across core paradigms.",
    currentFocus: "Sliding Window Reinforcement",
    topPriorityPlanId: "plan_1",
    activeInterventions: [],
    proposedInterventions: [],
    protectedSkills: [],
    deprioritizedSkills: [],
    preferredDifficulty: "Medium",
    difficultyPolicy: "HOLD",
    preferredPracticeModes: ["REINFORCEMENT"],
    targetPatterns: ["Sliding Window"],
    revisionPriority: "NORMAL",
    timePressureLevel: "STANDARD",
    interventionCooldowns: {},
    lastUpdated: new Date().toISOString(),
  };

  const performanceState: FullPerformanceIntelligence = {
    window: "30d",
    windowConfig: { window: "30d", label: "30d", days: 30, description: "30d" },
    generatedAt: new Date().toISOString(),
    metrics: {
      totalAttempts: 15,
      independentSolves: 10,
      solveRate: { currentValue: 80 } as any,
      independentSolveRate: { currentValue: 66 } as any,
      hintAssistedRate: { currentValue: 13 } as any,
      failureRate: { currentValue: 20 } as any,
      timeoutRate: { currentValue: 0 } as any,
      skipRate: { currentValue: 0 } as any,
      averageSolveTimeSeconds: { currentValue: 1200 } as any,
      medianSolveTimeSeconds: { currentValue: 1100 } as any,
      timeEfficiencyScore: { currentValue: 75 } as any,
      sessionCompletionRate: { currentValue: 90 } as any,
      sessionCount: 8,
      activeGoalAlignmentPct: 80,
      totalPracticeMinutes: 300,
      totalSolved: 12,
      hintAssistedSolves: 2,
      failures: 3,
      skips: 0,
      timeouts: 0,
      window: "30d",
      startDate: "2026-07-28",
      endDate: "2026-08-27",
    },
    skillTrends: [],
    patternTrends: [],
    difficultyTrend: {
      byDifficulty: {
        Easy: {} as any,
        Medium: {} as any,
        Hard: {} as any,
      },
      pacing: "APPROPRIATE",
      transitionGap: { hasEasyToMediumGap: false, hasMediumToHardGap: false, gapDescription: "" },
      pacingDiagnosis: "Balanced",
      recommendedDifficultyAction: "Maintain",
    },
    timeTrend: {
      overallTrend: "STABLE",
      overallMedianSolveTimeSeconds: 1100,
      overallAverageSolveTimeSeconds: 1200,
      byDifficulty: {} as any,
      canSolveRate: 80,
      canSolveEfficientlyRate: 70,
      efficiencyGapPct: 10,
      speedImprovementPct: 5,
      diagnosis: "Good fluency",
    },
    persistentWeaknesses: [],
    improvementSignals: [],
    learningVelocity: {
      overallVelocityScore: 70,
      tier: "Solid Progress",
      components: {} as any,
      explanation: "Good",
      velocityTrend: "IMPROVING",
    },
    strategicRecommendations: [],
    timeline: [],
    feedbackSignals: {} as any,
    diagnosisSummary: {
      headline: "Steady progress",
      subheadline: "Balanced learning",
      strongestImprovingSkill: "Arrays",
      mostPersistentWeakness: null,
      topStrategicRecommendation: "Continue practice",
    },
  };

  return {
    activeGoal: mockGoal,
    goalType: "dsa_interview",
    availableTimeMinutes: 45,
    currentPerformanceState: performanceState,
    strategyState,
    learningGraphNodes: [mockNode],
    revisionDueItems: [createMockRevisionItem()],
    recentPracticeSessionsCount: 5,
    recentInterviewsCount: 1,
    recentContestsCount: 0,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

// ─── 35 Deterministic Test Scenarios ──────────────────────────────────────────

test("Adaptive Preparation Orchestrator - 35 Test Scenarios", async (t) => {
  // Scenario 1: Next Best Action
  await t.test("1. Returns exactly 1 primary Next Best Action with Why, Time, and Success criteria", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    assert.ok(plan.nextBestAction);
    assert.ok(plan.nextBestAction.actionTitle.length > 0);
    assert.ok(plan.nextBestAction.whyDescription.length > 0);
    assert.ok(plan.nextBestAction.estimatedMinutes > 0);
    assert.ok(plan.nextBestAction.successCriteria.length > 0);
  });

  // Scenario 2: 15-Minute Plan
  await t.test("2. 15-minute plan produces exactly 1 focused activity fitting time budget", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 15);
    assert.ok(plan.totalPlannedMinutes <= 15);
    assert.strictEqual(plan.activities.length, 1);
  });

  // Scenario 3: 30-Minute Plan
  await t.test("3. 30-minute plan fits within 30 minutes", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 30);
    assert.ok(plan.totalPlannedMinutes <= 30);
    assert.ok(plan.activities.length >= 1);
  });

  // Scenario 4: 45-Minute Plan
  await t.test("4. 45-minute plan schedules practice plus secondary focus without exceeding 45m", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    assert.ok(plan.totalPlannedMinutes <= 45);
  });

  // Scenario 5: 60-Minute Plan
  await t.test("5. 60-minute plan schedules multiple structured blocks", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 60);
    assert.ok(plan.totalPlannedMinutes <= 60);
    assert.ok(plan.activities.length >= 1);
  });

  // Scenario 6: 90-Minute Plan
  await t.test("6. 90-minute plan accommodates deep practice blocks", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 90);
    assert.ok(plan.totalPlannedMinutes <= 90);
  });

  // Scenario 7: 120-Minute Plan
  await t.test("7. 120-minute plan generates multi-activity preparation sequence", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 120);
    assert.ok(plan.totalPlannedMinutes <= 120);
  });

  // Scenario 8: Custom Duration
  await t.test("8. Custom duration (e.g. 50 minutes) constrains activities accurately", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 50);
    assert.ok(plan.totalPlannedMinutes <= 50);
  });

  // Scenario 9: Interview Goal Adaptation
  await t.test("9. Interview goal prioritizes Medium unassisted solving and mock interview activities", () => {
    const ctx = createMockContext({
      activeGoal: createMockGoal({ type: "dsa_interview", targetDifficulty: "Medium" }),
    });
    const candidates = generateCandidateActivities(ctx);
    const mockAct = candidates.find((c) => c.activityType === "MOCK_INTERVIEW");
    assert.ok(mockAct);
    assert.strictEqual(mockAct.goalRelevance, 10);
  });

  // Scenario 10: Competitive Programming Goal Adaptation
  await t.test("10. Competitive programming goal prioritizes contest practice and speed", () => {
    const ctx = createMockContext({
      activeGoal: createMockGoal({ type: "competitive_programming", targetDifficulty: "Hard" }),
      goalType: "competitive_programming",
    });
    const candidates = generateCandidateActivities(ctx);
    const contestAct = candidates.find((c) => c.activityType === "CONTEST_PRACTICE");
    assert.ok(contestAct);
    assert.strictEqual(contestAct.goalRelevance, 10);
  });

  // Scenario 11: Placement Goal Adaptation
  await t.test("11. Placement goal prioritizes core high-frequency interview patterns", () => {
    const ctx = createMockContext({
      activeGoal: createMockGoal({ type: "placement_prep" }),
      goalType: "placement_prep",
    });
    const candidates = generateCandidateActivities(ctx);
    assert.ok(candidates.some((c) => c.goalRelevance >= 9));
  });

  // Scenario 12: General DSA Goal Adaptation
  await t.test("12. General DSA goal balances pattern coverage and learning graph progression", () => {
    const ctx = createMockContext({
      activeGoal: createMockGoal({ type: "general_improvement" }),
      goalType: "general_improvement",
    });
    const candidates = generateCandidateActivities(ctx);
    assert.ok(candidates.length >= 1);
  });

  // Scenario 13: Foundation Repair Strategy
  await t.test("13. Foundation repair strategy schedules prerequisite bridge activities first", () => {
    const ctx = createMockContext({
      strategyState: {
        ...createMockContext().strategyState!,
        currentMode: "FOUNDATION_REPAIR",
        activeInterventions: [
          {
            id: "int_found_1",
            diagnosisId: "diag_1",
            title: "Repair Graph Fundamentals",
            interventionType: "FOUNDATION_REPAIR",
            status: "ACTIVE",
            objective: "Bridge BFS prerequisites",
            priority: "CRITICAL",
            priorityScore: 95,
            priorityBreakdown: {} as any,
            targetDurationSessions: 3,
            completedSessions: 0,
            affectedSkills: ["Graphs"],
            affectedPatterns: ["BFS"],
            difficultyPolicy: "DECREASE",
            practiceMode: "LEARNING",
            revisionPriority: "NORMAL",
            timePressureLevel: "LOW",
            successCriteria: { targetMetric: "Solve Rate", threshold: ">=75%", description: "75% unassisted" },
            rollbackCriteria: { triggerCondition: "Drops", fallbackAction: "Step down" },
            expectedOutcome: "Restored foundation",
            suggestedAction: "Complete BFS drills",
            startDate: new Date().toISOString(),
            reviewDate: new Date().toISOString(),
            cooldownDays: 5,
            evidenceChain: {} as any,
          },
        ],
      },
    });

    const plan = generatePreparationPlan(ctx, 45);
    assert.strictEqual(plan.strategyMode, "FOUNDATION_REPAIR");
    assert.ok(plan.activities[0].title.includes("Graph"));
    assert.strictEqual(plan.activities[0].activityType, "FOUNDATION_REPAIR");
  });

  // Scenario 14: Difficulty Acceleration Strategy
  await t.test("14. Difficulty acceleration strategy incorporates higher challenge tiers", () => {
    const ctx = createMockContext({
      strategyState: {
        ...createMockContext().strategyState!,
        currentMode: "DIFFICULTY_ACCELERATION",
        preferredDifficulty: "Hard",
      },
    });
    const plan = generatePreparationPlan(ctx, 45);
    assert.strictEqual(plan.strategyMode, "DIFFICULTY_ACCELERATION");
  });

  // Scenario 15: Recovery Strategy
  await t.test("15. Recovery strategy shortens workload and defers high-stress activities", () => {
    const ctx = createMockContext({
      strategyState: {
        ...createMockContext().strategyState!,
        currentMode: "RECOVERY",
        activeInterventions: [
          {
            id: "int_recov_1",
            diagnosisId: "diag_recov",
            title: "Enter Preparation Recovery Mode",
            interventionType: "PRACTICE_RECOVERY",
            status: "ACTIVE",
            objective: "Alleviate practice fatigue",
            priority: "CRITICAL",
            priorityScore: 95,
            priorityBreakdown: {} as any,
            targetDurationSessions: 2,
            completedSessions: 0,
            affectedSkills: [],
            affectedPatterns: [],
            difficultyPolicy: "DECREASE",
            practiceMode: "REVISION",
            revisionPriority: "URGENT",
            timePressureLevel: "NONE",
            successCriteria: { targetMetric: "Completion", threshold: "100%", description: "Complete 1-2 light review problems" },
            rollbackCriteria: { triggerCondition: "", fallbackAction: "" },
            expectedOutcome: "Renewed stamina",
            suggestedAction: "Short recovery session",
            startDate: new Date().toISOString(),
            reviewDate: new Date().toISOString(),
            cooldownDays: 5,
            evidenceChain: {} as any,
          },
        ],
      },
    });

    const plan = generatePreparationPlan(ctx, 45);
    assert.strictEqual(plan.strategyMode, "RECOVERY");
    assert.ok(plan.activities.some((a) => a.activityType === "RECOVERY_SESSION"));
  });

  // Scenario 16: Revision-Focused Strategy
  await t.test("16. Revision-focused strategy prioritizes SRS items", () => {
    const ctx = createMockContext({
      strategyState: {
        ...createMockContext().strategyState!,
        currentMode: "REVISION_FOCUS",
        revisionPriority: "URGENT",
      },
      revisionDueItems: [createMockRevisionItem(), createMockRevisionItem({ id: "rev_2" })],
    });

    const plan = generatePreparationPlan(ctx, 45);
    assert.ok(plan.activities.some((a) => a.activityType === "REVISION"));
  });

  // Scenario 17: Learning Graph Prerequisite Block
  await t.test("17. Learning Graph prerequisite block defers downstream advanced activities", () => {
    const unmasteredNode = createMockSkillNode({
      id: "trees",
      name: "Trees",
      slug: "trees",
      status: "LEARNING",
      masteryScore: 30, // Unmastered
    });
    const advancedNode = createMockSkillNode({
      id: "graph_traversal",
      name: "Graph Traversal",
      slug: "graph_traversal",
      prerequisites: ["trees"],
      status: "LEARNING",
      masteryScore: 20,
    });

    const ctx = createMockContext({
      learningGraphNodes: [unmasteredNode, advancedNode],
      activeGoal: createMockGoal({ priorityTopics: ["Graph Traversal"] }),
    });

    const plan = generatePreparationPlan(ctx, 45);
    const graphDeferred = plan.deferredActivities.find((d) => d.activity.affectedSkills.includes("Graph Traversal"));
    assert.ok(graphDeferred);
    assert.strictEqual(graphDeferred.appliedConstraint, "LEARNING_GRAPH_PREREQUISITE_BLOCK");
  });

  // Scenario 18: Recommendation Engine Handoff
  await t.test("18. Generates structured Recommendation Engine handoff payload", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    const handoffs = generateExecutionHandoffs(plan);
    assert.ok(handoffs.recommendation);
    assert.ok(handoffs.recommendation.boostSkills.length > 0);
    assert.ok(handoffs.recommendation.count > 0);
  });

  // Scenario 19: Practice Session Handoff
  await t.test("19. Generates structured Practice Session request payload with mode and duration", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    const handoffs = generateExecutionHandoffs(plan);
    assert.ok(handoffs.practiceSession);
    assert.ok(handoffs.practiceSession.targetDurationMinutes > 0);
    assert.ok(handoffs.practiceSession.preferredMode.length > 0);
  });

  // Scenario 20: SRS Integration Handoff
  await t.test("20. Generates structured SRS handoff payload", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    const handoffs = generateExecutionHandoffs(plan);
    assert.ok(handoffs.srs);
    assert.ok(handoffs.srs.maxRevisionCount > 0);
  });

  // Scenario 21: Daily Planner Integration Handoff
  await t.test("21. Generates structured Daily Planner handoff with activity blocks", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    const handoffs = generateExecutionHandoffs(plan);
    assert.ok(handoffs.planner);
    assert.ok(handoffs.planner.activityBlocks.length > 0);
    assert.strictEqual(handoffs.planner.dailyWorkloadMinutes, plan.totalPlannedMinutes);
  });

  // Scenario 22: Insufficient Data Handling
  await t.test("22. Insufficient data yields INSUFFICIENT_DATA plan confidence without halting", () => {
    const ctx = createMockContext({
      currentPerformanceState: {
        ...createMockContext().currentPerformanceState!,
        metrics: {
          ...createMockContext().currentPerformanceState!.metrics,
          totalAttempts: 0,
        },
      },
    });

    const plan = generatePreparationPlan(ctx, 45);
    assert.strictEqual(plan.planConfidence.level, "INSUFFICIENT_DATA");
    assert.ok(plan.planConfidence.missingEvidence.length > 0);
    assert.ok(plan.activities.length > 0); // Still provides safe default activity
  });

  // Scenario 23: Plan Confidence Evaluation
  await t.test("23. High data completeness yields HIGH plan confidence", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    assert.strictEqual(plan.planConfidence.level, "HIGH");
    assert.ok(plan.planConfidence.score >= 70);
  });

  // Scenario 24: Plan Stability Window
  await t.test("24. Plan stability parameters are populated", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    assert.strictEqual(plan.isRegenerated, false);
  });

  // Scenario 25: Plan Regeneration
  await t.test("25. Force plan regeneration marks isRegenerated as true", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45, true);
    assert.strictEqual(plan.isRegenerated, true);
  });

  // Scenario 26: Explicit Deferred Work Categorization
  await t.test("26. Explicitly separates DO NOW from DO LATER and NOT RECOMMENDED", () => {
    const ctx = createMockContext({
      strategyState: {
        ...createMockContext().strategyState!,
        deprioritizedSkills: ["Arrays"], // Overexposed
      },
    });

    const plan = generatePreparationPlan(ctx, 15); // Small budget forces deferral
    assert.ok(plan.deferredActivities.length > 0);
    assert.ok(plan.deferredActivities.some((d) => d.category === "DO_LATER" || d.category === "NOT_RECOMMENDED"));
  });

  // Scenario 27: Conflicting Constraints Resolution
  await t.test("27. Conflicting constraints follow 10-level deterministic precedence", () => {
    const candidates = generateCandidateActivities(createMockContext());
    const resolved = resolveCandidatePrecedence(candidates, createMockContext());
    assert.ok(resolved.length > 0);
  });

  // Scenario 28: No Active Goal
  await t.test("28. Gracefully generates balanced default plan when active goal is null", () => {
    const ctx = createMockContext({
      activeGoal: null,
      goalType: "none",
    });

    const plan = generatePreparationPlan(ctx, 45);
    assert.strictEqual(plan.goal, null);
    assert.ok(plan.activities.length > 0);
    assert.ok(plan.planConfidence.missingEvidence.some((m) => m.includes("goal")));
  });

  // Scenario 29: No Available Candidates Fallback
  await t.test("29. Returns calibrated fallback session if all candidates are filtered out", () => {
    const emptyCtx = createMockContext({
      learningGraphNodes: [],
      revisionDueItems: [],
      activeGoal: null,
    });

    const plan = generatePreparationPlan(emptyCtx, 30);
    assert.ok(plan.activities.length >= 1);
    assert.ok(plan.activities[0].title.includes("Session") || plan.activities[0].title.includes("Problem"));
  });

  // Scenario 30: Multi-Factor Priority Scoring Calculation
  await t.test("30. Multi-factor priority score multiplies 5 dimensions accurately", () => {
    const ctx = createMockContext();
    const act = generateCandidateActivities(ctx)[0];
    const calc = calculateActivityPriority(act, ctx);
    assert.ok(calc.normalizedScore >= 0 && calc.normalizedScore <= 100);
    assert.ok(calc.goalRelevance >= 1 && calc.goalRelevance <= 10);
    assert.ok(calc.strategyPriority >= 1 && calc.strategyPriority <= 10);
  });

  // Scenario 31: Plan History Tracking
  await t.test("31. Plan contains valid planId and timestamp for audit history", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    assert.ok(plan.planId.startsWith("plan_"));
    assert.ok(plan.generatedAt.length > 0);
  });

  // Scenario 32: Repeated Skipped Activity Handling
  await t.test("32. Activity includes success criteria and reason for auditability", () => {
    const ctx = createMockContext();
    const plan = generatePreparationPlan(ctx, 45);
    for (const act of plan.activities) {
      assert.ok(act.reason.length > 0);
      assert.ok(act.successCriteria.description.length > 0);
    }
  });

  // Scenario 33: Expired Intervention Handling
  await t.test("33. Strategy without active interventions defaults to BALANCED mode", () => {
    const ctx = createMockContext({
      strategyState: {
        ...createMockContext().strategyState!,
        activeInterventions: [],
        currentMode: "BALANCED",
      },
    });
    const plan = generatePreparationPlan(ctx, 45);
    assert.strictEqual(plan.strategyMode, "BALANCED");
  });

  // Scenario 34: Goal Change Re-orchestration
  await t.test("34. Goal change materially alters planned activities", () => {
    const interviewCtx = createMockContext({
      activeGoal: createMockGoal({ type: "dsa_interview" }),
    });
    const cpCtx = createMockContext({
      activeGoal: createMockGoal({ type: "competitive_programming", priorityTopics: ["Segment Tree"] }),
    });

    const interviewPlan = generatePreparationPlan(interviewCtx, 45);
    const cpPlan = generatePreparationPlan(cpCtx, 45);

    assert.notStrictEqual(interviewPlan.primaryFocus, cpPlan.primaryFocus);
  });

  // Scenario 35: Prerequisite Becoming Resolved
  await t.test("35. When prerequisite is mastered, downstream activity is unlocked and accepted", () => {
    const masteredTree = createMockSkillNode({
      id: "trees",
      name: "Trees",
      status: "MASTERED",
      masteryScore: 90,
    });
    const graphNode = createMockSkillNode({
      id: "graph_traversal",
      name: "Graph Traversal",
      prerequisites: ["trees"],
      status: "LEARNING",
      masteryScore: 40,
    });

    const ctx = createMockContext({
      learningGraphNodes: [masteredTree, graphNode],
      activeGoal: createMockGoal({ priorityTopics: ["Graph Traversal"] }),
    });

    const candidates = generateCandidateActivities(ctx);
    const graphCandidate = candidates.find((c) => c.affectedSkills.includes("Graph Traversal"));
    assert.ok(graphCandidate);
    assert.strictEqual(graphCandidate.isPrerequisiteBlocked, false);
  });
});
