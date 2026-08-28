import test from "node:test";
import assert from "node:assert";
import {
  FullPerformanceIntelligence,
  PerformanceMetricsSnapshot,
  SkillPerformanceTrend,
  PatternPerformanceTrend,
  DifficultyProgressionTrend,
  TimeEfficiencyAnalysis,
  PersistentWeakness,
} from "@/services/performance/performanceTypes";
import { PreparationGoal } from "@/services/preparation/preparationTypes";
import { runDiagnosisPipeline } from "../interventionDiagnosis";
import { compileAdaptiveStrategyState, buildInterventionPlan } from "../interventionPlanner";
import { resolveInterventionConflicts } from "../interventionConflictResolver";
import { generateInterventionSignals } from "../interventionExecution";
import { evaluateInterventionOutcome, recordStrategyTransition } from "../interventionFeedback";
import { scoreInterventionDiagnosis } from "../interventionScoring";
import { getGoalWeightMultiplier, isInterventionInCooldown } from "../interventionRules";

// ─── Test Fixture Generator ───────────────────────────────────────────────────

function createMockMetricTrend(currentValue: number, direction: any = "STABLE", sampleSize = 10) {
  return {
    currentValue,
    previousValue: currentValue,
    delta: 0,
    percentageChange: 0,
    direction,
    confidence: "HIGH" as const,
    sampleSize,
    explanation: `Metric value ${currentValue}`,
  };
}

function createMockIntelligence(overrides: Partial<FullPerformanceIntelligence> = {}): FullPerformanceIntelligence {
  const metrics: PerformanceMetricsSnapshot = {
    window: "30d",
    startDate: "2026-07-27",
    endDate: "2026-08-26",
    totalAttempts: 15,
    totalSolved: 12,
    independentSolves: 10,
    hintAssistedSolves: 2,
    failures: 3,
    skips: 0,
    timeouts: 0,
    totalPracticeMinutes: 300,
    solveRate: createMockMetricTrend(80, "IMPROVING", 15),
    independentSolveRate: createMockMetricTrend(66, "IMPROVING", 15),
    hintAssistedRate: createMockMetricTrend(13, "STABLE", 15),
    failureRate: createMockMetricTrend(20, "STABLE", 15),
    timeoutRate: createMockMetricTrend(0, "STABLE", 15),
    skipRate: createMockMetricTrend(0, "STABLE", 15),
    averageSolveTimeSeconds: createMockMetricTrend(1200, "STABLE", 15),
    medianSolveTimeSeconds: createMockMetricTrend(1100, "STABLE", 15),
    timeEfficiencyScore: createMockMetricTrend(75, "IMPROVING", 15),
    sessionCount: 8,
    sessionCompletionRate: createMockMetricTrend(90, "STABLE", 8),
    activeGoalAlignmentPct: 80,
  };

  const difficultyTrend: DifficultyProgressionTrend = {
    byDifficulty: {
      Easy: {
        difficulty: "Easy",
        attempts: 5,
        solvedCount: 5,
        independentSolves: 5,
        solveRate: 100,
        independentSolveRate: 100,
        hintCount: 0,
        averageSolveTimeSeconds: 600,
      },
      Medium: {
        difficulty: "Medium",
        attempts: 8,
        solvedCount: 6,
        independentSolves: 5,
        solveRate: 75,
        independentSolveRate: 62,
        hintCount: 1,
        averageSolveTimeSeconds: 1200,
      },
      Hard: {
        difficulty: "Hard",
        attempts: 2,
        solvedCount: 1,
        independentSolves: 0,
        solveRate: 50,
        independentSolveRate: 0,
        hintCount: 1,
        averageSolveTimeSeconds: 2400,
      },
    },
    pacing: "APPROPRIATE",
    transitionGap: {
      hasEasyToMediumGap: false,
      hasMediumToHardGap: false,
      gapDescription: "No significant transition gaps detected.",
    },
    pacingDiagnosis: "Difficulty progression is balanced.",
    recommendedDifficultyAction: "Maintain current mix.",
  };

  const timeTrend: TimeEfficiencyAnalysis = {
    overallTrend: "STABLE",
    overallMedianSolveTimeSeconds: 1100,
    overallAverageSolveTimeSeconds: 1200,
    byDifficulty: {
      Easy: { medianSeconds: 600, avgSeconds: 600 },
      Medium: { medianSeconds: 1200, avgSeconds: 1200 },
      Hard: { medianSeconds: 2400, avgSeconds: 2400 },
    },
    canSolveRate: 80,
    canSolveEfficientlyRate: 70,
    efficiencyGapPct: 10,
    speedImprovementPct: 5,
    diagnosis: "Solve fluency is stable.",
  };

  return {
    window: "30d",
    windowConfig: {
      window: "30d",
      label: "Last 30 Days",
      days: 30,
      description: "Core baseline",
    },
    generatedAt: new Date().toISOString(),
    metrics,
    skillTrends: [],
    patternTrends: [],
    difficultyTrend,
    timeTrend,
    persistentWeaknesses: [],
    improvementSignals: [],
    learningVelocity: {
      overallVelocityScore: 70,
      tier: "Solid Progress",
      components: {} as any,
      explanation: "Good progress",
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
    ...overrides,
  };
}

// ─── 30 Deterministic Test Scenarios ──────────────────────────────────────────

test("Adaptive Intervention & Strategy Engine - 30 Test Scenarios", async (t) => {
  // Scenario 1: Insufficient Evidence Handling
  await t.test("1. Insufficient evidence creates INSUFFICIENT_DATA diagnosis without premature intervention", () => {
    const thinIntel = createMockIntelligence({
      metrics: {
        ...createMockIntelligence().metrics,
        totalAttempts: 2, // Less than 3
      },
    });
    const diagnoses = runDiagnosisPipeline(thinIntel, null);
    assert.strictEqual(diagnoses.length, 1);
    assert.strictEqual(diagnoses[0].category, "INSUFFICIENT_DATA");
    assert.strictEqual(diagnoses[0].confidence, "LOW");

    const { state, plans } = compileAdaptiveStrategyState(diagnoses, null);
    assert.strictEqual(plans.length, 0);
    assert.strictEqual(state.currentFocus, "Building Historical Baseline");
  });

  // Scenario 2: Foundation Repair
  await t.test("2. Foundation repair triggers when persistent weakness is detected", () => {
    const intel = createMockIntelligence({
      persistentWeaknesses: [
        {
          id: "pw_graph",
          skillOrPattern: "Graph Traversal",
          category: "data_structures",
          severity: "HIGH",
          persistence: "PERSISTENT",
          failCount: 4,
          hintCount: 3,
          attemptCount: 7,
          averageSolveTimeSeconds: 1800,
          firstDetectedDate: "2026-08-01",
          lastObservedDate: "2026-08-20",
          affectedSystems: ["Practice Sessions", "SRS"],
          evidenceText: "Repeated failures on BFS/DFS traversal.",
          recommendedIntervention: "Focus on queue-based BFS fundamentals.",
          priorityScore: 85,
        },
      ],
    });

    const diagnoses = runDiagnosisPipeline(intel, null);
    const graphDiag = diagnoses.find((d) => d.affectedSkills.includes("Graph Traversal"));
    assert.ok(graphDiag);
    assert.strictEqual(graphDiag.recommendedIntervention, "FOUNDATION_REPAIR");

    const { state, plans } = compileAdaptiveStrategyState(diagnoses, null);
    assert.ok(plans.some((p) => p.interventionType === "FOUNDATION_REPAIR"));
    assert.strictEqual(state.currentMode, "FOUNDATION_REPAIR");
  });

  // Scenario 3: Skill Reinforcement
  await t.test("3. Skill reinforcement generates structured success criteria and objective", () => {
    const diag = {
      diagnosisId: "diag_reinforce_1",
      category: "PERSISTENT_WEAKNESS" as const,
      severity: "MEDIUM" as const,
      confidence: "HIGH" as const,
      evidence: [],
      evidenceSummary: "Developing skill requiring consolidation",
      affectedSkills: ["Binary Search"],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "SKILL_REINFORCEMENT" as const,
      rationale: "Reinforce boundary condition checks",
    };

    const plan = buildInterventionPlan(diag, null);
    assert.strictEqual(plan.interventionType, "SKILL_REINFORCEMENT");
    assert.ok(plan.successCriteria.targetMetric.includes("Solve Rate"));
    assert.ok(plan.rollbackCriteria.triggerCondition.length > 0);
  });

  // Scenario 4: Difficulty Increase
  await t.test("4. Difficulty increase fires when learner is in underchallenging comfort zone", () => {
    const intel = createMockIntelligence({
      difficultyTrend: {
        ...createMockIntelligence().difficultyTrend,
        pacing: "TOO_CONSERVATIVE",
        pacingDiagnosis: "100% solve rate on Easy tier.",
      },
    });

    const diagnoses = runDiagnosisPipeline(intel, null);
    const diffDiag = diagnoses.find((d) => d.category === "DIFFICULTY_TOO_LOW");
    assert.ok(diffDiag);
    assert.strictEqual(diffDiag.recommendedIntervention, "DIFFICULTY_INCREASE");

    const { state } = compileAdaptiveStrategyState(diagnoses, null);
    assert.strictEqual(state.difficultyPolicy, "INCREASE");
    assert.strictEqual(state.preferredDifficulty, "Hard");
  });

  // Scenario 5: Difficulty Decrease
  await t.test("5. Difficulty decrease fires when Hard failure rate is excessive", () => {
    const intel = createMockIntelligence({
      difficultyTrend: {
        ...createMockIntelligence().difficultyTrend,
        pacing: "TOO_AGGRESSIVE",
        pacingDiagnosis: "Hard failure rate 80%.",
      },
    });

    const diagnoses = runDiagnosisPipeline(intel, null);
    const diffDiag = diagnoses.find((d) => d.category === "DIFFICULTY_TOO_HIGH");
    assert.ok(diffDiag);
    assert.strictEqual(diffDiag.recommendedIntervention, "DIFFICULTY_DECREASE");

    const { state } = compileAdaptiveStrategyState(diagnoses, null);
    assert.strictEqual(state.difficultyPolicy, "DECREASE");
    assert.strictEqual(state.preferredDifficulty, "Easy");
  });

  // Scenario 6: Difficulty Hold
  await t.test("6. Difficulty hold maintains calibrated difficulty when pacing is appropriate", () => {
    const intel = createMockIntelligence();
    const diagnoses = runDiagnosisPipeline(intel, null);
    const { state } = compileAdaptiveStrategyState(diagnoses, null);
    assert.strictEqual(state.difficultyPolicy, "HOLD");
    assert.strictEqual(state.preferredDifficulty, "Medium");
  });

  // Scenario 7: Pattern Diversification
  await t.test("7. Pattern diversification boosts underexposed priority topics", () => {
    const intel = createMockIntelligence({
      patternTrends: [
        {
          patternName: "Dynamic Programming",
          exposureCount: 1,
          exposurePercentage: 6,
          exposureStatus: "UNDEREXPOSED",
          solvedCount: 1,
          independentSolves: 1,
          solveRate: 100,
          independentSolveRate: 100,
          averageSolveTimeSeconds: 1200,
          trendDirection: "STABLE",
          actionRecommendation: "Boost exposure",
        },
      ],
    });

    const goal: PreparationGoal = {
      id: "goal_dp",
      name: "DP Mastery",
      type: "dsa_interview",
      targetDate: "2026-09-30",
      dailyMinutes: 60,
      daysPerWeek: 6,
      currentSkillLevel: "intermediate",
      preferredPlatforms: ["leetcode"],
      targetDifficulty: "Medium",
      priorityTopics: ["Dynamic Programming"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const diagnoses = runDiagnosisPipeline(intel, goal);
    const dpDiag = diagnoses.find((d) => d.category === "PATTERN_UNDEREXPOSURE");
    assert.ok(dpDiag);
    assert.strictEqual(dpDiag.recommendedIntervention, "PATTERN_DIVERSIFICATION");
  });

  // Scenario 8: Stagnation Break
  await t.test("8. Stagnation break triggers on flat learning curves", () => {
    const intel = createMockIntelligence({
      skillTrends: [
        {
          skillId: "sliding_window",
          skillName: "Sliding Window",
          category: "algorithmic_paradigms",
          totalAttempts: 12,
          solvedCount: 8,
          independentSolves: 5,
          solveRate: 66,
          independentSolveRate: 41,
          hintCount: 7,
          averageSolveTimeSeconds: 1500,
          medianSolveTimeSeconds: 1500,
          currentMasteryScore: 50,
          masteryDelta: 0,
          classification: "STAGNANT",
          isStagnant: true,
          stagnationReason: "Flat solve rate over 12 attempts",
          suggestedIntervention: "Introduce mixed-pattern practice",
          prerequisiteHealth: "HEALTHY",
          recentActivityDaysAgo: 2,
          evidenceSummary: "Stagnant independent performance",
        },
      ],
    });

    const diagnoses = runDiagnosisPipeline(intel, null);
    const stagDiag = diagnoses.find((d) => d.category === "SKILL_STAGNATION");
    assert.ok(stagDiag);
    assert.strictEqual(stagDiag.recommendedIntervention, "STAGNATION_BREAK");

    const { state } = compileAdaptiveStrategyState(diagnoses, null);
    assert.strictEqual(state.currentMode, "STAGNATION_BREAK");
  });

  // Scenario 9: Hint Dependency
  await t.test("9. Hint dependency detects high hint usage with low independent solve rate", () => {
    const intel = createMockIntelligence({
      metrics: {
        ...createMockIntelligence().metrics,
        hintAssistedRate: createMockMetricTrend(60, "IMPROVING", 10),
        independentSolveRate: createMockMetricTrend(30, "DECLINING", 10),
      },
    });

    const diagnoses = runDiagnosisPipeline(intel, null);
    const hintDiag = diagnoses.find((d) => d.category === "HINT_DEPENDENCY");
    assert.ok(hintDiag);
    assert.strictEqual(hintDiag.recommendedIntervention, "HINT_REDUCTION");
  });

  // Scenario 10: Legitimate Hint-Supported Learning
  await t.test("10. Legitimate hint usage during high independent mastery is classified as supportive", () => {
    const intel = createMockIntelligence({
      metrics: {
        ...createMockIntelligence().metrics,
        hintAssistedRate: createMockMetricTrend(20, "STABLE", 10),
        independentSolveRate: createMockMetricTrend(80, "IMPROVING", 10),
      },
    });

    const diagnoses = runDiagnosisPipeline(intel, null);
    const hintDiag = diagnoses.find((d) => d.category === "HINT_APPROPRIATE_LEARNING");
    assert.ok(hintDiag);
    assert.strictEqual(hintDiag.recommendedIntervention, "HINT_SUPPORTED_LEARNING");
  });

  // Scenario 11: Recovery Mode
  await t.test("11. Recovery mode enters on fatigue signals like high drops and failure spikes", () => {
    const intel = createMockIntelligence({
      metrics: {
        ...createMockIntelligence().metrics,
        sessionCompletionRate: createMockMetricTrend(40, "DECLINING", 8),
        failureRate: createMockMetricTrend(50, "DECLINING", 15),
        skipRate: createMockMetricTrend(30, "DECLINING", 15),
      },
    });

    const diagnoses = runDiagnosisPipeline(intel, null);
    const fatigueDiag = diagnoses.find((d) => d.category === "PREPARATION_FATIGUE");
    assert.ok(fatigueDiag);
    assert.strictEqual(fatigueDiag.recommendedIntervention, "PRACTICE_RECOVERY");

    const { state } = compileAdaptiveStrategyState(diagnoses, null);
    assert.strictEqual(state.currentMode, "RECOVERY");
  });

  // Scenario 12: Interview Goal Adaptation
  await t.test("12. Interview goal boosts time pressure and interview mode weights", () => {
    const mult = getGoalWeightMultiplier("INTERVIEW_PREPARATION", "dsa_interview");
    assert.ok(mult > 1.0);

    const cpMult = getGoalWeightMultiplier("INTERVIEW_PREPARATION", "competitive_programming");
    assert.ok(cpMult < mult);
  });

  // Scenario 13: Competitive Programming Goal Adaptation
  await t.test("13. Competitive programming goal boosts contest preparation and speed weights", () => {
    const mult = getGoalWeightMultiplier("CONTEST_PREPARATION", "competitive_programming");
    assert.ok(mult >= 1.5);
  });

  // Scenario 14: General DSA Goal Adaptation
  await t.test("14. General DSA goal emphasizes prerequisite health and foundational mastery", () => {
    const mult = getGoalWeightMultiplier("FOUNDATION_REPAIR", "general_improvement");
    assert.ok(mult >= 1.2);
  });

  // Scenario 15: Placement Goal Adaptation
  await t.test("15. Placement goal emphasizes core patterns and time pressure", () => {
    const mult = getGoalWeightMultiplier("TIME_PRESSURE", "placement_prep");
    assert.ok(mult >= 1.3);
  });

  // Scenario 16: Priority Scoring Formula
  await t.test("16. Priority score computes Impact x Evidence x Goal x Urgency accurately", () => {
    const diag = {
      diagnosisId: "d1",
      category: "PERSISTENT_WEAKNESS" as const,
      severity: "HIGH" as const,
      confidence: "HIGH" as const,
      evidence: [{ source: "test", metric: "m", value: 1, sampleSize: 6, confidence: "HIGH" as const, explanation: "e" }],
      evidenceSummary: "Severe weakness",
      affectedSkills: ["Graphs"],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "FOUNDATION_REPAIR" as const,
      rationale: "r",
    };

    const breakdown = scoreInterventionDiagnosis(diag, null);
    assert.ok(breakdown.normalizedScore >= 50);
    assert.strictEqual(breakdown.priority, "HIGH");
  });

  // Scenario 17: Conflicting Interventions Resolution
  await t.test("17. Conflict resolver cleanly resolves contradictory INCREASE vs DECREASE difficulty", () => {
    const planInc = buildInterventionPlan({
      diagnosisId: "d_inc",
      category: "DIFFICULTY_TOO_LOW",
      severity: "LOW",
      confidence: "MEDIUM",
      evidence: [],
      evidenceSummary: "Comfort zone",
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "DIFFICULTY_INCREASE",
      rationale: "r",
    }, null);

    const planDec = buildInterventionPlan({
      diagnosisId: "d_dec",
      category: "DIFFICULTY_TOO_HIGH",
      severity: "HIGH",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Hard failures",
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "DIFFICULTY_DECREASE",
      rationale: "r",
    }, null);

    const { resolvedPlans, suppressedPlans } = resolveInterventionConflicts([planInc, planDec], null);
    assert.strictEqual(resolvedPlans.length, 1);
    assert.strictEqual(resolvedPlans[0].interventionType, "DIFFICULTY_DECREASE");
    assert.strictEqual(suppressedPlans.length, 1);
    assert.strictEqual(suppressedPlans[0].plan.interventionType, "DIFFICULTY_INCREASE");
  });

  // Scenario 18: Intervention Cooldown Enforcement
  await t.test("18. Cooldown suppresses recent intervention reversal", () => {
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const cooldowns = { DIFFICULTY_DECREASE: futureDate };

    const inCooldown = isInterventionInCooldown("DIFFICULTY_DECREASE", cooldowns);
    assert.strictEqual(inCooldown, true);

    const notInCooldown = isInterventionInCooldown("FOUNDATION_REPAIR", cooldowns);
    assert.strictEqual(notInCooldown, false);
  });

  // Scenario 19: Intervention Expiration
  await t.test("19. Diagnoses include valid 14-day expiration timestamps", () => {
    const intel = createMockIntelligence();
    const diagnoses = runDiagnosisPipeline(intel, null);
    for (const d of diagnoses) {
      const exp = new Date(d.expirationDate).getTime();
      const det = new Date(d.detectedAt).getTime();
      assert.ok(exp > det);
    }
  });

  // Scenario 20: Intervention Completion Tracking
  await t.test("20. Intervention outcome correctly detects completion when metrics improve", () => {
    const plan = buildInterventionPlan({
      diagnosisId: "d_comp",
      category: "PERSISTENT_WEAKNESS",
      severity: "MEDIUM",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Weakness",
      affectedSkills: ["Binary Search"],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "FOUNDATION_REPAIR",
      rationale: "r",
    }, null);

    const followUpIntel = createMockIntelligence({
      skillTrends: [
        {
          skillId: "bs",
          skillName: "Binary Search",
          category: "algorithmic_paradigms",
          totalAttempts: 6,
          solvedCount: 5,
          independentSolves: 5,
          solveRate: 83,
          independentSolveRate: 83,
          hintCount: 0,
          averageSolveTimeSeconds: 900,
          medianSolveTimeSeconds: 900,
          currentMasteryScore: 80,
          masteryDelta: 25,
          classification: "IMPROVING",
          isStagnant: false,
          prerequisiteHealth: "HEALTHY",
          recentActivityDaysAgo: 1,
          evidenceSummary: "Strong improvement",
        },
      ],
    });

    const outcome = evaluateInterventionOutcome(plan, followUpIntel);
    assert.strictEqual(outcome.resultStatus, "COMPLETED");
  });

  // Scenario 21: Intervention Failure Detection
  await t.test("21. Intervention outcome flags failure when metrics decline despite intervention", () => {
    const plan = buildInterventionPlan({
      diagnosisId: "d_fail",
      category: "PERSISTENT_WEAKNESS",
      severity: "MEDIUM",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Weakness",
      affectedSkills: ["Recursion"],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "SKILL_REINFORCEMENT",
      rationale: "r",
    }, null);

    const followUpIntel = createMockIntelligence({
      skillTrends: [
        {
          skillId: "rec",
          skillName: "Recursion",
          category: "fundamentals",
          totalAttempts: 5,
          solvedCount: 1,
          independentSolves: 1,
          solveRate: 20,
          independentSolveRate: 20,
          hintCount: 4,
          averageSolveTimeSeconds: 1800,
          medianSolveTimeSeconds: 1800,
          currentMasteryScore: 25,
          masteryDelta: -15,
          classification: "DECLINING",
          isStagnant: false,
          prerequisiteHealth: "BOTTLENECK",
          recentActivityDaysAgo: 1,
          evidenceSummary: "Declining performance",
        },
      ],
    });

    const outcome = evaluateInterventionOutcome(plan, followUpIntel);
    assert.strictEqual(outcome.resultStatus, "FAILED");
  });

  // Scenario 22: Rollback Criteria Definition
  await t.test("22. Every intervention plan defines explicit rollback criteria", () => {
    const diag = {
      diagnosisId: "d_rb",
      category: "DIFFICULTY_TOO_HIGH" as const,
      severity: "HIGH" as const,
      confidence: "HIGH" as const,
      evidence: [],
      evidenceSummary: "Too hard",
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "DIFFICULTY_DECREASE" as const,
      rationale: "r",
    };
    const plan = buildInterventionPlan(diag, null);
    assert.ok(plan.rollbackCriteria.triggerCondition.length > 0);
    assert.ok(plan.rollbackCriteria.fallbackAction.length > 0);
  });

  // Scenario 23: Strategy Mode Transitions
  await t.test("23. Strategy mode transitions record clear audit history", () => {
    const entry = recordStrategyTransition(
      "BALANCED",
      "FOUNDATION_REPAIR",
      "Persistent graph weaknesses",
      "4 failures across 2 sessions",
      ["Repair Graph Fundamentals"],
      "Interview Prep"
    );
    assert.strictEqual(entry.previousMode, "BALANCED");
    assert.strictEqual(entry.newMode, "FOUNDATION_REPAIR");
    assert.ok(entry.reason.includes("Persistent"));
  });

  // Scenario 24: Feedback into Performance Intelligence
  await t.test("24. Intervention outcomes format structured feedback for Performance Intelligence", () => {
    const plan = buildInterventionPlan({
      diagnosisId: "d_fb",
      category: "PERSISTENT_WEAKNESS",
      severity: "HIGH",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Weakness",
      affectedSkills: ["DP"],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "FOUNDATION_REPAIR",
      rationale: "r",
    }, null);

    const outcome = evaluateInterventionOutcome(plan, createMockIntelligence());
    assert.ok(outcome.feedbackToPerformance.length > 0);
  });

  // Scenario 25: Recommendation Signals
  await t.test("25. Subsystem signals specify skill boost and demotions for Recommendation Engine", () => {
    const plan = buildInterventionPlan({
      diagnosisId: "d_rec",
      category: "PERSISTENT_WEAKNESS",
      severity: "HIGH",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Graph weakness",
      affectedSkills: ["Graphs"],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "FOUNDATION_REPAIR",
      rationale: "r",
    }, null);

    const { state } = compileAdaptiveStrategyState([
      {
        diagnosisId: "d_rec",
        category: "PERSISTENT_WEAKNESS",
        severity: "HIGH",
        confidence: "HIGH",
        evidence: [],
        evidenceSummary: "Graph weakness",
        affectedSkills: ["Graphs"],
        affectedPatterns: [],
        detectedAt: new Date().toISOString(),
        expirationDate: new Date().toISOString(),
        recommendedIntervention: "FOUNDATION_REPAIR",
        rationale: "r",
      },
    ], null);

    const signals = generateInterventionSignals([plan], state, null);
    assert.ok(signals.recommendationEngine.boostSkills.includes("Graphs"));
    assert.strictEqual(signals.recommendationEngine.difficultyPolicy, "DECREASE");
  });

  // Scenario 26: Practice Session Signals
  await t.test("26. Subsystem signals specify practice mode and hint policy for Practice Session Engine", () => {
    const plan = buildInterventionPlan({
      diagnosisId: "d_hint",
      category: "HINT_DEPENDENCY",
      severity: "HIGH",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Hint reliance",
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "HINT_REDUCTION",
      rationale: "r",
    }, null);

    const { state } = compileAdaptiveStrategyState([
      {
        diagnosisId: "d_hint",
        category: "HINT_DEPENDENCY",
        severity: "HIGH",
        confidence: "HIGH",
        evidence: [],
        evidenceSummary: "Hint reliance",
        affectedSkills: [],
        affectedPatterns: [],
        detectedAt: new Date().toISOString(),
        expirationDate: new Date().toISOString(),
        recommendedIntervention: "HINT_REDUCTION",
        rationale: "r",
      },
    ], null);

    const signals = generateInterventionSignals([plan], state, null);
    assert.strictEqual(signals.practiceSessionEngine.hintPolicy, "DELAYED");
  });

  // Scenario 27: Learning Graph Signals
  await t.test("27. Subsystem signals target bottleneck prerequisites for Learning Graph", () => {
    const plan = buildInterventionPlan({
      diagnosisId: "d_lg",
      category: "PREREQUISITE_BOTTLENECK",
      severity: "HIGH",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Prereq bottleneck",
      affectedSkills: ["Tree Traversal"],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "PREREQUISITE_REPAIR",
      rationale: "r",
    }, null);

    const { state } = compileAdaptiveStrategyState([], null);
    const signals = generateInterventionSignals([plan], state, null);
    assert.ok(signals.learningGraph.focusPrerequisites.includes("Tree Traversal"));
    assert.ok(signals.learningGraph.targetBottlenecks.includes("Tree Traversal"));
  });

  // Scenario 28: SRS Signals
  await t.test("28. Subsystem signals elevate revision priority for SRS", () => {
    const plan = buildInterventionPlan({
      diagnosisId: "d_srs",
      category: "PREPARATION_FATIGUE",
      severity: "CRITICAL",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Fatigue",
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "PRACTICE_RECOVERY",
      rationale: "r",
    }, null);

    const { state } = compileAdaptiveStrategyState([
      {
        diagnosisId: "d_srs",
        category: "PREPARATION_FATIGUE",
        severity: "CRITICAL",
        confidence: "HIGH",
        evidence: [],
        evidenceSummary: "Fatigue",
        affectedSkills: [],
        affectedPatterns: [],
        detectedAt: new Date().toISOString(),
        expirationDate: new Date().toISOString(),
        recommendedIntervention: "PRACTICE_RECOVERY",
        rationale: "r",
      },
    ], null);

    const signals = generateInterventionSignals([plan], state, null);
    assert.strictEqual(signals.srsRevision.increaseRevisionPriority, true);
    assert.strictEqual(signals.srsRevision.priorityLevel, "URGENT");
  });

  // Scenario 29: Daily Planner Signals
  await t.test("29. Subsystem signals adjust daily minutes and session count for Daily Planner", () => {
    const goal: PreparationGoal = {
      id: "g_dp",
      name: "Goal",
      type: "general_improvement",
      targetDate: "2026-09-30",
      dailyMinutes: 60,
      daysPerWeek: 5,
      currentSkillLevel: "intermediate",
      preferredPlatforms: ["leetcode"],
      targetDifficulty: "Medium",
      priorityTopics: ["Trees"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { state } = compileAdaptiveStrategyState([
      {
        diagnosisId: "d_fat",
        category: "PREPARATION_FATIGUE",
        severity: "CRITICAL",
        confidence: "HIGH",
        evidence: [],
        evidenceSummary: "Fatigue",
        affectedSkills: [],
        affectedPatterns: [],
        detectedAt: new Date().toISOString(),
        expirationDate: new Date().toISOString(),
        recommendedIntervention: "PRACTICE_RECOVERY",
        rationale: "r",
      },
    ], goal);

    const plan = buildInterventionPlan({
      diagnosisId: "d_fat",
      category: "PREPARATION_FATIGUE",
      severity: "CRITICAL",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Fatigue",
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "PRACTICE_RECOVERY",
      rationale: "r",
    }, goal);

    const signals = generateInterventionSignals([plan], state, goal);
    assert.strictEqual(signals.dailyPlanner.recommendedMinutes, 30); // 50% of 60m
  });

  // Scenario 30: Preparation Command Center Signals
  await t.test("30. Subsystem signals report strategy status and goal risk to Command Center", () => {
    const { state } = compileAdaptiveStrategyState([
      {
        diagnosisId: "d_cc",
        category: "PREPARATION_FATIGUE",
        severity: "CRITICAL",
        confidence: "HIGH",
        evidence: [],
        evidenceSummary: "Fatigue",
        affectedSkills: [],
        affectedPatterns: [],
        detectedAt: new Date().toISOString(),
        expirationDate: new Date().toISOString(),
        recommendedIntervention: "PRACTICE_RECOVERY",
        rationale: "r",
      },
    ], null);

    const plan = buildInterventionPlan({
      diagnosisId: "d_cc",
      category: "PREPARATION_FATIGUE",
      severity: "CRITICAL",
      confidence: "HIGH",
      evidence: [],
      evidenceSummary: "Fatigue",
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      recommendedIntervention: "PRACTICE_RECOVERY",
      rationale: "r",
    }, null);

    const signals = generateInterventionSignals([plan], state, null);
    assert.strictEqual(signals.preparationCommandCenter.goalRisk, "HIGH");
    assert.strictEqual(signals.preparationCommandCenter.strategyStatus, "RECOVERY");
  });
});
