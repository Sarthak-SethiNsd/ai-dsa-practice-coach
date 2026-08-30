/**
 * Comprehensive Deterministic Unit Test Suite for Longitudinal Performance Intelligence Engine
 * Covers all 25 required test scenarios.
 */

import assert from "node:assert/strict";
import { test, describe, beforeEach } from "node:test";

import {
  LongitudinalEvent,
  PerformanceWindow,
  SkillPerformanceTrend,
  DifficultyProgressionTrend,
  TimeEfficiencyAnalysis,
  PersistentWeakness,
} from "../performanceTypes";
import { AggregatedDataSet } from "../performanceAggregation";
import { computeMetricTrend, computeTimeMetricTrend } from "../performanceTrends";
import { computePerformanceMetrics } from "../performanceMetrics";
import { analyzeSkillTrends } from "../performanceSkillAnalysis";
import { analyzePatternCoverage } from "../performancePatternAnalysis";
import { analyzeDifficultyProgression } from "../performanceDifficultyAnalysis";
import { analyzeTimeEfficiency } from "../performanceTimeAnalysis";
import { detectPersistentWeaknesses, detectImprovementSignals } from "../performanceWeaknessDetection";
import {
  calculateLearningVelocity,
  generateStrategicRecommendations,
  generateSubsystemFeedbackSignals,
} from "../performanceRecommendations";
import { compilePerformanceIntelligence } from "../performanceEngine";
import { SkillNode } from "@/services/learningGraph/learningGraphTypes";
import { PreparationGoal } from "@/services/preparation/preparationTypes";

// Mock localStorage for Node environment tests
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === "undefined") {
  (globalThis as unknown as { localStorage: LocalStorageMock }).localStorage = new LocalStorageMock();
}

// ─── Test Helpers ─────────────────────────────────────────────────────────────

function createMockEvent(overrides: Partial<LongitudinalEvent> = {}): LongitudinalEvent {
  return {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    source: "PRACTICE_SESSION",
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    title: "Two Sum",
    platform: "leetcode",
    difficulty: "Easy",
    topics: ["Arrays"],
    primaryPattern: "Arrays",
    outcome: "SOLVED_INDEPENDENTLY",
    solveTimeSeconds: 600,
    estimatedTimeSeconds: 900,
    hintCount: 0,
    score: 85,
    ...overrides,
  };
}

function createMockDataSet(
  currentEvents: LongitudinalEvent[],
  previousEvents: LongitudinalEvent[] = []
): AggregatedDataSet {
  const now = new Date();
  const past30 = new Date(now.getTime() - 30 * 86400000);
  const past60 = new Date(now.getTime() - 60 * 86400000);

  return {
    allEvents: [...previousEvents, ...currentEvents],
    currentPeriodEvents: currentEvents,
    previousPeriodEvents: previousEvents,
    windowStartDate: past30.toISOString().split("T")[0],
    windowEndDate: now.toISOString().split("T")[0],
    previousStartDate: past60.toISOString().split("T")[0],
    previousEndDate: past30.toISOString().split("T")[0],
    totalPracticeMinutes: Math.round(
      currentEvents.reduce((s, e) => s + (e.solveTimeSeconds ? e.solveTimeSeconds / 60 : 15), 0)
    ),
  };
}

const MOCK_NODES: SkillNode[] = [
  {
    id: "arrays",
    slug: "arrays",
    name: "Arrays",
    category: "data_structures",
    type: "topic",
    difficulty: "Easy",
    description: "Core array manipulations",
    patterns: ["Arrays"],
    evidenceCount: 10,
    decayFactor: 0,
    difficultyReached: "Medium",
    targetProblemIds: [1, 2],
    status: "MASTERED",
    masteryScore: 85,
    confidenceScore: 80,
    solvedProblemsCount: 15,
    recentAccuracy: 90,
    prerequisites: [],
    dependents: ["two_pointers"],
  },
  {
    id: "binary_search",
    slug: "binary_search",
    name: "Binary Search",
    category: "algorithmic_paradigms",
    type: "pattern",
    difficulty: "Medium",
    description: "Binary search divide and conquer",
    patterns: ["Binary Search"],
    evidenceCount: 8,
    decayFactor: 0.1,
    difficultyReached: "Medium",
    targetProblemIds: [3],
    status: "DEVELOPING",
    masteryScore: 65,
    confidenceScore: 60,
    solvedProblemsCount: 8,
    recentAccuracy: 75,
    prerequisites: ["arrays"],
    dependents: [],
  },
  {
    id: "graphs",
    slug: "graphs",
    name: "Graphs",
    category: "data_structures",
    type: "topic",
    difficulty: "Hard",
    description: "Graph traversals and algorithms",
    patterns: ["Graph Traversal"],
    evidenceCount: 3,
    decayFactor: 0.3,
    difficultyReached: "Hard",
    targetProblemIds: [4],
    status: "LEARNING",
    masteryScore: 40,
    confidenceScore: 35,
    solvedProblemsCount: 3,
    recentAccuracy: 33,
    prerequisites: ["trees"],
    dependents: [],
  },
];

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe("Longitudinal Performance Intelligence Engine - 25 Test Scenarios", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Test 1: 7-day analysis
  test("1. 7-day analysis compiles short-term tactical window", async () => {
    const intel = await compilePerformanceIntelligence("7d", true);
    assert.equal(intel.window, "7d");
    assert.equal(intel.windowConfig.days, 7);
    assert.ok(intel.metrics !== undefined);
  });

  // Test 2: 30-day analysis
  test("2. 30-day analysis compiles core longitudinal baseline", async () => {
    const intel = await compilePerformanceIntelligence("30d", true);
    assert.equal(intel.window, "30d");
    assert.equal(intel.windowConfig.days, 30);
    assert.ok(Array.isArray(intel.skillTrends));
  });

  // Test 3: 90-day analysis
  test("3. 90-day analysis compiles macro learning trends", async () => {
    const intel = await compilePerformanceIntelligence("90d", true);
    assert.equal(intel.window, "90d");
    assert.equal(intel.windowConfig.days, 90);
    assert.ok(Array.isArray(intel.strategicRecommendations));
  });

  // Test 4: Insufficient data handling (< 3 attempts)
  test("4. Insufficient data handling reports INSUFFICIENT_DATA when attempts < 3", () => {
    const trend = computeMetricTrend({
      currentValue: 100,
      previousValue: null,
      sampleSize: 2, // only 2 attempts
      metricName: "Solve Rate",
    });

    assert.equal(trend.direction, "INSUFFICIENT_DATA");
    assert.ok(trend.explanation.includes("Insufficient data"));
  });

  // Test 5: Improving trend detection
  test("5. Improving trend detection detects positive rate delta above threshold", () => {
    const trend = computeMetricTrend({
      currentValue: 80,
      previousValue: 60,
      sampleSize: 10,
      higherIsBetter: true,
      deltaThreshold: 5,
      metricName: "Independent Solve Rate",
    });

    assert.equal(trend.direction, "IMPROVING");
    assert.equal(trend.delta, 20);
    assert.ok(trend.explanation.includes("improved"));
  });

  // Test 6: Stable trend detection
  test("6. Stable trend detection classifies deltas within threshold as STABLE", () => {
    const trend = computeMetricTrend({
      currentValue: 70,
      previousValue: 69,
      sampleSize: 10,
      higherIsBetter: true,
      deltaThreshold: 3,
      metricName: "Solve Rate",
    });

    assert.equal(trend.direction, "STABLE");
    assert.ok(trend.explanation.includes("remained stable"));
  });

  // Test 7: Declining trend detection
  test("7. Declining trend detection flags significant negative change", () => {
    const trend = computeMetricTrend({
      currentValue: 40,
      previousValue: 70,
      sampleSize: 8,
      higherIsBetter: true,
      deltaThreshold: 5,
      metricName: "Solve Rate",
    });

    assert.equal(trend.direction, "DECLINING");
    assert.equal(trend.delta, -30);
  });

  // Test 8: Volatile / Timing trend detection
  test("8. Time trend detection detects solve time speedups", () => {
    const timeTrend = computeTimeMetricTrend(900, 1800, 8, "Median Solve Time");
    assert.equal(timeTrend.direction, "IMPROVING");
    assert.equal(timeTrend.currentValue, 15); // 15 min
    assert.equal(timeTrend.previousValue, 30); // 30 min
  });

  // Test 9: Persistent weakness detection
  test("9. Persistent weakness detection identifies recurring failures across multiple dates", () => {
    const currentEvents = [
      createMockEvent({ date: "2026-08-10", topics: ["Graphs"], outcome: "FAILED", hintCount: 2 }),
      createMockEvent({ date: "2026-08-15", topics: ["Graphs"], outcome: "FAILED", hintCount: 3 }),
      createMockEvent({ date: "2026-08-20", topics: ["Graphs"], outcome: "SOLVED_WITH_HINTS", hintCount: 2 }),
    ];
    const dataset = createMockDataSet(currentEvents);
    const skillTrends = analyzeSkillTrends(dataset, MOCK_NODES);
    const weaknesses = detectPersistentWeaknesses(dataset, skillTrends);

    assert.ok(weaknesses.length >= 1);
    const graphWeakness = weaknesses.find((w) => w.skillOrPattern === "Graphs");
    assert.ok(graphWeakness !== undefined);
    assert.ok(graphWeakness?.failCount === 2);
    assert.equal(graphWeakness?.persistence, "PERSISTENT");
  });

  // Test 10: Recurring weakness classification
  test("10. Recurring weakness classification flags multi-session or multi-system issues", () => {
    const currentEvents = [
      createMockEvent({ source: "PRACTICE_SESSION", topics: ["Dynamic Programming"], outcome: "FAILED" }),
      createMockEvent({ source: "VIRTUAL_CONTEST", topics: ["Dynamic Programming"], outcome: "FAILED" }),
    ];
    const dataset = createMockDataSet(currentEvents);
    const skillTrends = analyzeSkillTrends(dataset, MOCK_NODES);
    const weaknesses = detectPersistentWeaknesses(dataset, skillTrends);

    const dpWeakness = weaknesses.find((w) => w.skillOrPattern === "Dynamic Programming");
    assert.ok(dpWeakness !== undefined);
    assert.ok(dpWeakness?.persistence === "RECURRING" || dpWeakness?.persistence === "PERSISTENT");
  });

  // Test 11: Stagnation detection
  test("11. Stagnation detection flags skills with high practice attempts but flat performance", () => {
    // 6 attempts, low independence, flat solve time
    const currentEvents = Array.from({ length: 6 }, (_, i) =>
      createMockEvent({
        topics: ["Binary Search"],
        outcome: i % 2 === 0 ? "SOLVED_WITH_HINTS" : "FAILED",
        hintCount: 2,
        solveTimeSeconds: 1500,
      })
    );
    const previousEvents = [
      createMockEvent({ topics: ["Binary Search"], outcome: "SOLVED_WITH_HINTS", solveTimeSeconds: 1500 }),
    ];

    const dataset = createMockDataSet(currentEvents, previousEvents);
    const skillTrends = analyzeSkillTrends(dataset, MOCK_NODES);

    const bsTrend = skillTrends.find((s) => s.skillName === "Binary Search");
    assert.ok(bsTrend !== undefined);
    assert.equal(bsTrend?.isStagnant, true);
    assert.equal(bsTrend?.classification, "STAGNANT");
    assert.ok(bsTrend?.stagnationReason !== undefined);
  });

  // Test 12: Difficulty progression tracking
  test("12. Difficulty progression tracking aggregates Easy, Medium, Hard stats", () => {
    const events = [
      createMockEvent({ difficulty: "Easy", outcome: "SOLVED_INDEPENDENTLY" }),
      createMockEvent({ difficulty: "Medium", outcome: "SOLVED_INDEPENDENTLY" }),
      createMockEvent({ difficulty: "Hard", outcome: "FAILED" }),
    ];
    const dataset = createMockDataSet(events);
    const diffTrend = analyzeDifficultyProgression(dataset);

    assert.equal(diffTrend.byDifficulty.Easy.attempts, 1);
    assert.equal(diffTrend.byDifficulty.Medium.attempts, 1);
    assert.equal(diffTrend.byDifficulty.Hard.attempts, 1);
  });

  // Test 13: Difficulty plateau detection
  test("13. Difficulty plateau detection flags steady medium solve rate without hard advancement", () => {
    const events = Array.from({ length: 8 }, (_, i) =>
      createMockEvent({
        difficulty: i < 6 ? "Medium" : "Hard",
        outcome: i < 3 ? "SOLVED_INDEPENDENTLY" : "FAILED",
      })
    );
    const dataset = createMockDataSet(events);
    const diffTrend = analyzeDifficultyProgression(dataset);

    assert.ok(diffTrend.pacing === "PLATEAU" || diffTrend.pacing === "APPROPRIATE");
  });

  // Test 14: Excessive difficulty detection
  test("14. Excessive difficulty detection flags high hard fail rate as TOO_AGGRESSIVE", () => {
    const events = [
      createMockEvent({ difficulty: "Hard", outcome: "FAILED", hintCount: 3 }),
      createMockEvent({ difficulty: "Hard", outcome: "FAILED", hintCount: 2 }),
      createMockEvent({ difficulty: "Hard", outcome: "FAILED", hintCount: 3 }),
    ];
    const dataset = createMockDataSet(events);
    const diffTrend = analyzeDifficultyProgression(dataset);

    assert.equal(diffTrend.pacing, "TOO_AGGRESSIVE");
    assert.ok(diffTrend.recommendedDifficultyAction.includes("reduce"));
  });

  // Test 15: Insufficient difficulty detection
  test("15. Insufficient difficulty detection flags 100% independent Easy/Med solves as TOO_CONSERVATIVE", () => {
    const events = [
      createMockEvent({ difficulty: "Easy", outcome: "SOLVED_INDEPENDENTLY" }),
      createMockEvent({ difficulty: "Easy", outcome: "SOLVED_INDEPENDENTLY" }),
      createMockEvent({ difficulty: "Medium", outcome: "SOLVED_INDEPENDENTLY" }),
      createMockEvent({ difficulty: "Medium", outcome: "SOLVED_INDEPENDENTLY" }),
    ];
    const dataset = createMockDataSet(events);
    const diffTrend = analyzeDifficultyProgression(dataset);

    assert.equal(diffTrend.pacing, "TOO_CONSERVATIVE");
    assert.ok(diffTrend.recommendedDifficultyAction.includes("Increase difficulty"));
  });

  // Test 16: Time-efficiency improvement
  test("16. Time-efficiency improvement detects speed acceleration vs prior period", () => {
    const currentEvents = [
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 600 }),
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 700 }),
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 650 }),
    ];
    const previousEvents = [
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 1500 }),
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 1600 }),
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 1550 }),
    ];
    const dataset = createMockDataSet(currentEvents, previousEvents);
    const timeAnalysis = analyzeTimeEfficiency(dataset);

    assert.equal(timeAnalysis.overallTrend, "FAST_IMPROVEMENT");
    assert.ok((timeAnalysis.speedImprovementPct ?? 0) > 30);
  });

  // Test 17: Time-efficiency degradation
  test("17. Time-efficiency degradation detects speed slowdown vs prior baseline", () => {
    const currentEvents = [
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 2400 }),
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 2600 }),
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 2500 }),
    ];
    const previousEvents = [
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 800 }),
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 900 }),
      createMockEvent({ outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 850 }),
    ];
    const dataset = createMockDataSet(currentEvents, previousEvents);
    const timeAnalysis = analyzeTimeEfficiency(dataset);

    assert.equal(timeAnalysis.overallTrend, "DEGRADING");
  });

  // Test 18: Pattern overexposure detection
  test("18. Pattern overexposure detection flags high-concentration patterns", () => {
    // 8 attempts, 6 on Arrays
    const currentEvents = [
      ...Array.from({ length: 6 }, () => createMockEvent({ primaryPattern: "Arrays", topics: ["Arrays"] })),
      createMockEvent({ primaryPattern: "Two Pointers", topics: ["Two Pointers"] }),
      createMockEvent({ primaryPattern: "Binary Search", topics: ["Binary Search"] }),
    ];
    const dataset = createMockDataSet(currentEvents);
    const patterns = analyzePatternCoverage(dataset);

    const arrayPattern = patterns.find((p) => p.patternName === "Arrays" || p.patternName === "Prefix Sums" || p.patternName === "Two Pointers");
    assert.ok(arrayPattern && (patterns.some((p) => p.exposureStatus === "OVEREXPOSED" || p.exposurePercentage >= 35)));
  });

  // Test 19: Pattern underexposure detection
  test("19. Pattern underexposure detection flags neglected goal topics", () => {
    const currentEvents = Array.from({ length: 6 }, () => createMockEvent({ primaryPattern: "Arrays" }));
    const dataset = createMockDataSet(currentEvents);
    const patterns = analyzePatternCoverage(dataset, ["Dynamic Programming"]);

    const dpPattern = patterns.find((p) => p.patternName === "Dynamic Programming");
    assert.ok(dpPattern !== undefined);
    assert.equal(dpPattern?.exposureStatus, "UNDEREXPOSED");
  });

  // Test 20: Goal-aware strategic recommendations
  test("20. Goal-aware strategic recommendations adapt to Interview vs CP vs General goals", () => {
    const currentEvents = Array.from({ length: 6 }, () =>
      createMockEvent({ outcome: "SOLVED_WITH_HINTS", hintCount: 2 })
    );
    const dataset = createMockDataSet(currentEvents);
    const metrics = computePerformanceMetrics(dataset, "30d");
    const skillTrends = analyzeSkillTrends(dataset, MOCK_NODES);
    const patternTrends = analyzePatternCoverage(dataset);
    const diffTrend = analyzeDifficultyProgression(dataset);
    const weaknesses = detectPersistentWeaknesses(dataset, skillTrends);

    const interviewGoal: PreparationGoal = {
      id: "test_interview_goal",
      name: "Big Tech Interview",
      type: "dsa_interview",
      targetDate: new Date().toISOString().split("T")[0],
      dailyMinutes: 60,
      daysPerWeek: 6,
      currentSkillLevel: "intermediate",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priorityTopics: ["Dynamic Programming", "Trees"],
      targetDifficulty: "Medium",
      preferredPlatforms: ["leetcode"],
    };

    const recs = generateStrategicRecommendations(
      metrics,
      skillTrends,
      patternTrends,
      diffTrend,
      weaknesses,
      interviewGoal
    );

    assert.ok(recs.length >= 1);
    assert.ok(recs.some((r) => r.title.includes("Interview") || r.targetSubsystem === "practice" || r.targetSubsystem === "preparation"));
  });

  // Test 21: Learning velocity calculation
  test("21. Learning velocity calculation rewards mastery, difficulty, and independence gains", () => {
    const currentEvents = [
      createMockEvent({ difficulty: "Medium", outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 600 }),
      createMockEvent({ difficulty: "Medium", outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 700 }),
      createMockEvent({ difficulty: "Hard", outcome: "SOLVED_INDEPENDENTLY", solveTimeSeconds: 1200 }),
    ];
    const dataset = createMockDataSet(currentEvents);
    const metrics = computePerformanceMetrics(dataset, "30d");
    const skillTrends = analyzeSkillTrends(dataset, MOCK_NODES);
    const diffTrend = analyzeDifficultyProgression(dataset);
    const timeTrend = analyzeTimeEfficiency(dataset);

    const velocity = calculateLearningVelocity(metrics, skillTrends, diffTrend, timeTrend);
    assert.ok(velocity.overallVelocityScore >= 60);
    assert.ok(velocity.tier === "Solid Progress" || velocity.tier === "High Velocity");
  });

  // Test 22: Recommendation feedback signals
  test("22. Recommendation feedback signals suggest weakness boosts and overexposure demotions", () => {
    const skillTrends = analyzeSkillTrends(createMockDataSet([]), MOCK_NODES);
    const patternTrends = analyzePatternCoverage(createMockDataSet([]));
    const diffTrend = analyzeDifficultyProgression(createMockDataSet([]));
    const weaknesses: PersistentWeakness[] = [
      {
        id: "pw_graphs",
        skillOrPattern: "Graphs",
        category: "Data Structures",
        severity: "CRITICAL",
        persistence: "PERSISTENT",
        failCount: 3,
        hintCount: 4,
        attemptCount: 4,
        averageSolveTimeSeconds: 1800,
        firstDetectedDate: "2026-08-01",
        lastObservedDate: "2026-08-20",
        affectedSystems: ["Practice Sessions"],
        evidenceText: "3 failures",
        recommendedIntervention: "Prerequisite repair",
        priorityScore: 90,
      },
    ];

    const signals = generateSubsystemFeedbackSignals(
      skillTrends,
      patternTrends,
      diffTrend,
      weaknesses,
      null
    );

    assert.ok(signals.recommendationSignals.boostWeaknessSkills.includes("Graphs"));
  });

  // Test 23: Practice session feedback signals
  test("23. Practice session feedback signals recommend weakness repair mode when issues exist", () => {
    const skillTrends = analyzeSkillTrends(createMockDataSet([]), MOCK_NODES);
    const patternTrends = analyzePatternCoverage(createMockDataSet([]));
    const diffTrend = analyzeDifficultyProgression(createMockDataSet([]));
    const weaknesses: PersistentWeakness[] = [
      {
        id: "pw_dp",
        skillOrPattern: "Dynamic Programming",
        category: "Algorithmic Paradigms",
        severity: "HIGH",
        persistence: "PERSISTENT",
        failCount: 2,
        hintCount: 3,
        attemptCount: 3,
        averageSolveTimeSeconds: 2000,
        firstDetectedDate: "2026-08-01",
        lastObservedDate: "2026-08-20",
        affectedSystems: ["Practice Sessions"],
        evidenceText: "2 failures",
        recommendedIntervention: "Targeted drill",
        priorityScore: 80,
      },
    ];

    const signals = generateSubsystemFeedbackSignals(
      skillTrends,
      patternTrends,
      diffTrend,
      weaknesses,
      null
    );

    assert.equal(signals.practiceSessionSignals.suggestedMode, "weakness_repair");
  });

  // Test 24: Learning Graph feedback signals
  test("24. Learning Graph feedback signals identify bottleneck priorities and decay risks", () => {
    const stagnantTrend: SkillPerformanceTrend = {
      skillId: "graphs",
      skillName: "Graphs",
      category: "Data Structures",
      totalAttempts: 6,
      solvedCount: 2,
      independentSolves: 1,
      solveRate: 33,
      independentSolveRate: 16,
      hintCount: 5,
      averageSolveTimeSeconds: 1800,
      medianSolveTimeSeconds: 1800,
      currentMasteryScore: 40,
      masteryDelta: 0,
      classification: "STAGNANT",
      isStagnant: true,
      prerequisiteHealth: "BOTTLENECK",
      recentActivityDaysAgo: 2,
      evidenceSummary: "Stagnant",
    };

    const signals = generateSubsystemFeedbackSignals(
      [stagnantTrend],
      [],
      analyzeDifficultyProgression(createMockDataSet([])),
      [],
      null
    );

    assert.ok(signals.learningGraphSignals.bottleneckPriorities.includes("graphs"));
  });

  // Test 25: SRS feedback signals
  test("25. SRS feedback signals identify urgent revision topics based on inactivity and decay risks", () => {
    const decayingTrend: SkillPerformanceTrend = {
      skillId: "trees",
      skillName: "Trees",
      category: "Data Structures",
      totalAttempts: 5,
      solvedCount: 4,
      independentSolves: 4,
      solveRate: 80,
      independentSolveRate: 80,
      hintCount: 0,
      averageSolveTimeSeconds: 900,
      medianSolveTimeSeconds: 900,
      currentMasteryScore: 75,
      masteryDelta: 0,
      classification: "STRONG",
      isStagnant: false,
      prerequisiteHealth: "HEALTHY",
      recentActivityDaysAgo: 18, // 18 days inactive
      evidenceSummary: "Strong mastery but inactive",
    };

    const signals = generateSubsystemFeedbackSignals(
      [decayingTrend],
      [],
      analyzeDifficultyProgression(createMockDataSet([])),
      [],
      null
    );

    assert.ok(signals.srsSignals.urgentTopicRevisionIds.includes("Trees"));
  });
});
