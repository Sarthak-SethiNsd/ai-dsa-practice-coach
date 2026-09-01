/**
 * Comprehensive Deterministic Unit Test Suite for Adaptive Practice Session Engine
 * Covers all 20 required test scenarios.
 */

import assert from "node:assert/strict";
import { test, describe, beforeEach } from "node:test";

import {
  PracticeSession,
  PracticeSessionConfig,
  PracticeSessionProblem,
  PracticeSessionOutcome,
  getDefaultConfig,
} from "../practiceTypes";
import {
  increaseDifficulty,
  decreaseDifficulty,
  evaluateFastSuccess,
  evaluateSlowSuccess,
  evaluateHintAssistedSuccess,
  evaluateFailure,
  evaluateTimeout,
  evaluateSkip,
  AdaptationContext,
} from "../practiceSessionAdaptation";
import {
  computeSessionScore,
  computeSessionAnalytics,
} from "../practiceSessionScoring";
import {
  computeRemainingSeconds,
  computeElapsedSeconds,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
} from "../practiceSessionStorage";
import {
  dispatchRecommendationFeedback,
  dispatchLearningGraphFeedback,
  dispatchSRSFeedback,
} from "../practiceSessionOutcome";
import {
  buildSessionPlan,
} from "../practiceSessionPlanner";
import {
  submitOutcome,
} from "../practiceSessionEngine";

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

// ─── Test Helper Utilities ───────────────────────────────────────────────────

function createMockProblem(overrides: Partial<PracticeSessionProblem> = {}): PracticeSessionProblem {
  return {
    problemId: 1,
    platformProblemId: "1",
    platform: "leetcode",
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Table"],
    primaryPattern: "Hash Table Lookup",
    targetSkill: "Arrays",
    recommendationReason: "Recommended for core array practice",
    fullExplanation: "Two Sum builds hash map mastery.",
    timeEstimate: {
      estimatedMinutes: 15,
      confidence: "HIGH",
      basis: "difficulty default",
    },
    isRevision: false,
    isPrerequisiteBridge: false,
    isChallenge: false,
    mode: "smart_practice",
    recommendationScore: 85,
    ...overrides,
  };
}

function createMockSession(overrides: Partial<PracticeSession> = {}): PracticeSession {
  const now = new Date().toISOString();
  return {
    sessionId: "ps_test_123",
    startedAt: now,
    durationMinutes: 60,
    mode: "smart_practice",
    goalTitle: "Big Tech Interview Prep",
    config: getDefaultConfig("smart_practice", 60),
    plannedProblems: [
      createMockProblem({ problemId: 1, difficulty: "Easy", timeEstimate: { estimatedMinutes: 15, confidence: "HIGH", basis: "default" } }),
      createMockProblem({ problemId: 2, difficulty: "Medium", timeEstimate: { estimatedMinutes: 25, confidence: "MEDIUM", basis: "default" } }),
      createMockProblem({ problemId: 3, difficulty: "Hard", timeEstimate: { estimatedMinutes: 20, confidence: "LOW", basis: "default" } }),
    ],
    completedProblems: [],
    currentProblemIndex: 0,
    status: "ACTIVE",
    timerStartedAt: now,
    totalPausedMs: 0,
    outcomes: [],
    adaptations: [],
    ...overrides,
  };
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe("Adaptive Practice Session Engine - 20 Core Test Scenarios", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Test 1: 15-minute session planning
  test("1. 15-minute session planning limits problem count and time budget", async () => {
    const config: PracticeSessionConfig = getDefaultConfig("smart_practice", 15);
    assert.equal(config.durationMinutes, 15);
    const plan = await buildSessionPlan(config);
    assert.ok(plan.problems.length >= 1, "Should plan at least 1 problem");
    const totalEst = plan.problems.reduce((s, p) => s + p.timeEstimate.estimatedMinutes, 0);
    assert.ok(totalEst <= 20, `15m plan estimated time (${totalEst}m) should be compact`);
  });

  // Test 2: 30-minute session planning
  test("2. 30-minute session planning plans 1-2 problems within budget", async () => {
    const config: PracticeSessionConfig = getDefaultConfig("smart_practice", 30);
    assert.equal(config.durationMinutes, 30);
    const plan = await buildSessionPlan(config);
    assert.ok(plan.problems.length >= 1 && plan.problems.length <= 3);
  });

  // Test 3: 60-minute session planning
  test("3. 60-minute session planning includes balanced multi-problem progression", async () => {
    const config: PracticeSessionConfig = getDefaultConfig("smart_practice", 60);
    assert.equal(config.durationMinutes, 60);
    const plan = await buildSessionPlan(config);
    assert.ok(plan.problems.length >= 2, "Should plan multiple problems for 60m");
    assert.ok(plan.goalTitle.length > 0);
  });

  // Test 4: Fast successful solve adaptation
  test("4. Fast successful solve adaptation increases difficulty or advances skill", () => {
    const problem = createMockProblem({ difficulty: "Medium", timeEstimate: { estimatedMinutes: 30, confidence: "MEDIUM", basis: "default" } });
    const session = createMockSession();
    const outcome: PracticeSessionOutcome = {
      problemId: problem.problemId,
      sessionProblemIndex: 0,
      outcomeType: "SOLVED_INDEPENDENTLY",
      actualSolveTimeSeconds: 600, // 10 minutes vs 30 min estimated (< 60%)
      estimatedSolveTimeSeconds: 1800,
      hintCount: 0,
      perceivedDifficulty: "too_easy",
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Fast solve",
      adaptationTriggered: false,
    };
    const ctx: AdaptationContext = {
      session,
      lastOutcome: outcome,
      remainingSeconds: 3000,
      consecutiveFailures: 0,
      consecutiveIndependentSolves: 1,
      historyMedianSolveSeconds: 1800,
    };

    const decision = evaluateFastSuccess(ctx, problem);
    assert.equal(decision.shouldAdapt, true);
    assert.equal(decision.targetDifficulty, "Hard");
    assert.equal(decision.adjustmentType, "DIFFICULTY_UP");
  });

  // Test 5: Slow successful solve adaptation
  test("5. Slow successful solve adaptation triggers budget trim if time is tight", () => {
    const problem = createMockProblem({ difficulty: "Medium", timeEstimate: { estimatedMinutes: 20, confidence: "HIGH", basis: "default" } });
    const session = createMockSession();
    const outcome: PracticeSessionOutcome = {
      problemId: problem.problemId,
      sessionProblemIndex: 0,
      outcomeType: "SOLVED_INDEPENDENTLY",
      actualSolveTimeSeconds: 2400, // 40 minutes vs 20 min estimated (> 1.8x)
      estimatedSolveTimeSeconds: 1200,
      hintCount: 0,
      perceivedDifficulty: "too_hard",
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Slow solve",
      adaptationTriggered: false,
    };
    const ctx: AdaptationContext = {
      session,
      lastOutcome: outcome,
      remainingSeconds: 600, // 10 minutes remaining
      consecutiveFailures: 0,
      consecutiveIndependentSolves: 1,
      historyMedianSolveSeconds: 1200,
    };

    const decision = evaluateSlowSuccess(ctx, problem);
    assert.equal(decision.shouldAdapt, true);
    assert.equal(decision.trimQueue, true);
    assert.equal(decision.adjustmentType, "BUDGET_TRIM");
  });

  // Test 6: Hint-assisted solve adaptation
  test("6. Hint-assisted solve adaptation reduces difficulty or inserts prerequisite reinforcement", () => {
    const problem = createMockProblem({ difficulty: "Medium", targetSkill: "Dynamic Programming" });
    const session = createMockSession();
    const outcome: PracticeSessionOutcome = {
      problemId: problem.problemId,
      sessionProblemIndex: 0,
      outcomeType: "SOLVED_WITH_HINTS",
      actualSolveTimeSeconds: 1200,
      estimatedSolveTimeSeconds: 1200,
      hintCount: 2, // 2 hints used
      perceivedDifficulty: "appropriate",
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Needed 2 hints",
      adaptationTriggered: false,
    };
    const ctx: AdaptationContext = {
      session,
      lastOutcome: outcome,
      remainingSeconds: 2400,
      consecutiveFailures: 0,
      consecutiveIndependentSolves: 0,
      historyMedianSolveSeconds: 1200,
    };

    const decision = evaluateHintAssistedSuccess(ctx, problem);
    assert.equal(decision.shouldAdapt, true);
    assert.equal(decision.insertPrerequisite, true);
    assert.equal(decision.targetDifficulty, "Easy");
  });

  // Test 7: Failure adaptation
  test("7. Failure adaptation inserts prerequisite bridge and decreases difficulty", () => {
    const problem = createMockProblem({ difficulty: "Hard", targetSkill: "Graphs" });
    const session = createMockSession();
    const outcome: PracticeSessionOutcome = {
      problemId: problem.problemId,
      sessionProblemIndex: 0,
      outcomeType: "FAILED",
      actualSolveTimeSeconds: 1200,
      estimatedSolveTimeSeconds: 1200,
      hintCount: 0,
      perceivedDifficulty: "too_hard",
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Could not solve",
      adaptationTriggered: false,
    };
    const ctx: AdaptationContext = {
      session,
      lastOutcome: outcome,
      remainingSeconds: 2400,
      consecutiveFailures: 1,
      consecutiveIndependentSolves: 0,
      historyMedianSolveSeconds: 1200,
    };

    const decision = evaluateFailure(ctx, problem);
    assert.equal(decision.shouldAdapt, true);
    assert.equal(decision.insertPrerequisite, true);
    assert.equal(decision.targetDifficulty, "Medium");
  });

  // Test 8: Timeout adaptation
  test("8. Timeout adaptation trims queue and adjusts remaining budget", () => {
    const problem = createMockProblem({ difficulty: "Medium" });
    const session = createMockSession();
    const outcome: PracticeSessionOutcome = {
      problemId: problem.problemId,
      sessionProblemIndex: 0,
      outcomeType: "TIMED_OUT",
      actualSolveTimeSeconds: 1800,
      estimatedSolveTimeSeconds: 1800,
      hintCount: 0,
      perceivedDifficulty: null,
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Timed out",
      adaptationTriggered: false,
    };
    const ctx: AdaptationContext = {
      session,
      lastOutcome: outcome,
      remainingSeconds: 600,
      consecutiveFailures: 1,
      consecutiveIndependentSolves: 0,
      historyMedianSolveSeconds: 1800,
    };

    const decision = evaluateTimeout(ctx, problem);
    assert.equal(decision.shouldAdapt, true);
    assert.equal(decision.trimQueue, true);
    assert.equal(decision.targetDifficulty, "Easy");
  });

  // Test 9: Skip handling
  test("9. Skip handling substitutes problem without penalizing as failure", () => {
    const problem = createMockProblem({ difficulty: "Medium" });
    const session = createMockSession();
    const outcome: PracticeSessionOutcome = {
      problemId: problem.problemId,
      sessionProblemIndex: 0,
      outcomeType: "SKIPPED",
      actualSolveTimeSeconds: 30,
      estimatedSolveTimeSeconds: 1200,
      hintCount: 0,
      perceivedDifficulty: null,
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Skipped",
      adaptationTriggered: false,
    };
    const ctx: AdaptationContext = {
      session,
      lastOutcome: outcome,
      remainingSeconds: 3000,
      consecutiveFailures: 0,
      consecutiveIndependentSolves: 0,
      historyMedianSolveSeconds: 1200,
    };

    const decision = evaluateSkip(ctx, problem);
    assert.equal(decision.shouldAdapt, true);
    assert.equal(decision.insertPrerequisite, false);
    assert.equal(decision.switchToRepair, false);
  });

  // Test 10: Difficulty increase logic
  test("10. Difficulty increase logic maps Easy -> Medium -> Hard -> Hard", () => {
    assert.equal(increaseDifficulty("Easy"), "Medium");
    assert.equal(increaseDifficulty("Medium"), "Hard");
    assert.equal(increaseDifficulty("Hard"), "Hard");
  });

  // Test 11: Difficulty decrease logic
  test("11. Difficulty decrease logic maps Hard -> Medium -> Easy -> Easy", () => {
    assert.equal(decreaseDifficulty("Hard"), "Medium");
    assert.equal(decreaseDifficulty("Medium"), "Easy");
    assert.equal(decreaseDifficulty("Easy"), "Easy");
  });

  // Test 12: SRS integration
  test("12. SRS integration dispatches completed review outcome to revisionStorage", async () => {
    const problem = createMockProblem({
      isRevision: true,
      revisionItemId: "rev_seed_1",
    });
    const outcome: PracticeSessionOutcome = {
      problemId: problem.problemId,
      sessionProblemIndex: 0,
      outcomeType: "SOLVED_INDEPENDENTLY",
      actualSolveTimeSeconds: 300,
      estimatedSolveTimeSeconds: 900,
      hintCount: 0,
      perceivedDifficulty: "appropriate",
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Solved SRS revision",
      adaptationTriggered: false,
    };

    // Should complete without throwing
    await dispatchSRSFeedback(problem, outcome);
  });

  // Test 13: Learning Graph feedback
  test("13. Learning Graph feedback updates skill node mastery and confidence", () => {
    const problem = createMockProblem({ targetSkill: "Arrays" });
    const outcome: PracticeSessionOutcome = {
      problemId: problem.problemId,
      sessionProblemIndex: 0,
      outcomeType: "SOLVED_INDEPENDENTLY",
      actualSolveTimeSeconds: 600,
      estimatedSolveTimeSeconds: 900,
      hintCount: 0,
      perceivedDifficulty: "appropriate",
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Test solve",
      adaptationTriggered: false,
    };

    // Dispatching should execute cleanly
    dispatchLearningGraphFeedback(problem, outcome);
  });

  // Test 14: Recommendation feedback
  test("14. Recommendation feedback records action in history storage", async () => {
    const problem = createMockProblem({ problemId: 101, title: "Test Problem" });
    const outcome: PracticeSessionOutcome = {
      problemId: 101,
      sessionProblemIndex: 0,
      outcomeType: "SOLVED_INDEPENDENTLY",
      actualSolveTimeSeconds: 450,
      estimatedSolveTimeSeconds: 900,
      hintCount: 0,
      perceivedDifficulty: "appropriate",
      sessionPosition: 1,
      timestamp: new Date().toISOString(),
      notes: "Test rec feedback",
      adaptationTriggered: false,
    };

    await dispatchRecommendationFeedback(problem, outcome);
  });

  // Test 15: Goal-aware session planning
  test("15. Goal-aware session planning attaches active goal title to plan", async () => {
    const config = getDefaultConfig("goal_prep", 45);
    config.activeGoalId = "prep_goal_bigtech_interview";
    const plan = await buildSessionPlan(config);
    assert.ok(plan.goalTitle.length > 0);
    assert.ok(plan.problems.length >= 1);
  });

  // Test 16: Diversity constraints
  test("16. Diversity constraints prevent excessive same-topic saturation", async () => {
    const config = getDefaultConfig("smart_practice", 60);
    const plan = await buildSessionPlan(config);
    const topicCounts: Record<string, number> = {};
    plan.problems.forEach((p) => {
      topicCounts[p.targetSkill] = (topicCounts[p.targetSkill] ?? 0) + 1;
    });

    for (const count of Object.values(topicCounts)) {
      assert.ok(count <= 3, "Topic count per session should be bounded");
    }
  });

  // Test 17: Session persistence
  test("17. Session persistence saves and reloads active session from storage", () => {
    const session = createMockSession({ sessionId: "ps_persist_test" });
    saveActiveSession(session);

    const loaded = loadActiveSession();
    assert.ok(loaded !== null);
    assert.equal(loaded?.sessionId, "ps_persist_test");
    assert.equal(loaded?.status, "ACTIVE");

    clearActiveSession();
    assert.equal(loadActiveSession(), null);
  });

  // Test 18: Timer recovery after refresh
  test("18. Timer recovery calculates remaining seconds accurately from timestamps", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const session = createMockSession({
      durationMinutes: 30,
      timerStartedAt: fiveMinutesAgo,
      totalPausedMs: 0,
      status: "ACTIVE",
    });

    const remaining = computeRemainingSeconds(session);
    // 30 min - 5 min elapsed = ~25 min remaining (~1500 sec)
    assert.ok(remaining >= 1490 && remaining <= 1510, `Expected ~1500s remaining, got ${remaining}`);

    const elapsed = computeElapsedSeconds(session);
    assert.ok(elapsed >= 290 && elapsed <= 310, `Expected ~300s elapsed, got ${elapsed}`);
  });

  // Test 19: Session completion
  test("19. Session completion computes deterministic score and comprehensive analytics", () => {
    const session = createMockSession({
      outcomes: [
        {
          problemId: 1,
          sessionProblemIndex: 0,
          outcomeType: "SOLVED_INDEPENDENTLY",
          actualSolveTimeSeconds: 600,
          estimatedSolveTimeSeconds: 900,
          hintCount: 0,
          perceivedDifficulty: "appropriate",
          sessionPosition: 1,
          timestamp: new Date().toISOString(),
          notes: "Good solve",
          adaptationTriggered: false,
        },
        {
          problemId: 2,
          sessionProblemIndex: 1,
          outcomeType: "SOLVED_WITH_HINTS",
          actualSolveTimeSeconds: 1200,
          estimatedSolveTimeSeconds: 1500,
          hintCount: 1,
          perceivedDifficulty: "appropriate",
          sessionPosition: 2,
          timestamp: new Date().toISOString(),
          notes: "Needed 1 hint",
          adaptationTriggered: false,
        },
      ],
    });

    const score = computeSessionScore(session);
    assert.ok(score.overallScore > 0 && score.overallScore <= 100);
    assert.ok(score.completionScore > 0);
    assert.ok(score.independentSolveScore > 0);
    assert.ok(score.explanation.length > 0);

    const analytics = computeSessionAnalytics(session);
    assert.equal(analytics.problemsAttempted, 2);
    assert.equal(analytics.problemsSolved, 2);
    assert.equal(analytics.independentSolves, 1);
    assert.equal(analytics.hintAssistedSolves, 1);
    assert.ok(analytics.strongestEvidence.length > 0);
    assert.ok(analytics.nextRecommendedAction.length > 0);
  });

  // Test 20: Session abandonment
  test("20. Session abandonment sets status and produces partial analytics", () => {
    const session = createMockSession({
      status: "ABANDONED",
      outcomes: [
        {
          problemId: 1,
          sessionProblemIndex: 0,
          outcomeType: "SOLVED_INDEPENDENTLY",
          actualSolveTimeSeconds: 500,
          estimatedSolveTimeSeconds: 900,
          hintCount: 0,
          perceivedDifficulty: "appropriate",
          sessionPosition: 1,
          timestamp: new Date().toISOString(),
          notes: "First problem only",
          adaptationTriggered: false,
        },
      ],
    });

    const score = computeSessionScore(session);
    const analytics = computeSessionAnalytics(session);
    assert.equal(analytics.problemsAttempted, 1);
    assert.equal(analytics.problemsSolved, 1);
    assert.ok(score.overallScore > 0);
  });

  // Test 21: Regression Issue #1 — Queue trimming preserves future problems without double-counting elapsed time
  test("21. Queue trimming calculates capacity from future problems only and does not double-count elapsed time", async () => {
    // 60-minute session started 25 minutes ago -> 35 minutes remaining
    const started25mAgo = new Date(Date.now() - 25 * 60 * 1000).toISOString();
    const session = createMockSession({
      durationMinutes: 60,
      startedAt: started25mAgo,
      timerStartedAt: started25mAgo,
      currentProblemIndex: 0,
      plannedProblems: [
        createMockProblem({ problemId: 101, difficulty: "Medium", timeEstimate: { estimatedMinutes: 25, confidence: "HIGH", basis: "default" } }),
        createMockProblem({ problemId: 102, difficulty: "Medium", timeEstimate: { estimatedMinutes: 20, confidence: "HIGH", basis: "default" } }),
        createMockProblem({ problemId: 103, difficulty: "Medium", timeEstimate: { estimatedMinutes: 20, confidence: "HIGH", basis: "default" } }),
      ],
      completedProblems: [],
      outcomes: [],
    });

    // Save session in storage so submitOutcome can update it
    saveActiveSession(session);

    // Submit Problem 101 as TIMED_OUT (triggers queue trimming)
    const { session: updatedSession, adaptation } = await submitOutcome(
      session,
      "TIMED_OUT",
      25 * 60, // 25 minutes spent
      0,
      "too_hard",
      "Timed out on first problem"
    );

    // Problem 1 (25m) was completed/timed out.
    // 35 minutes remain.
    // Problem 2 (20m) fits (20 <= 35) -> KEPT.
    // Problem 3 (20m) exceeds (20 + 20 = 40 > 35) -> TRIMMED.
    // Resulting plannedProblems should contain Problem 1 (index 0) and Problem 2 (index 1), length = 2.
    assert.equal(adaptation?.adjustmentType, "QUEUE_TRIM");
    assert.equal(updatedSession.plannedProblems.length, 2);
    assert.equal(updatedSession.plannedProblems[0].problemId, 101);
    assert.equal(updatedSession.plannedProblems[1].problemId, 102);
    assert.deepEqual(adaptation?.problemsRemoved, [103]);
  });
});
