/**
 * Regression tests for the upcoming-contest detection fix in dailyPlanEngine.
 *
 * These tests cover the five required behavioral cases for Fix #1:
 *   1. No past contest entries + participation goal tomorrow -> detected.
 *   2. No past contest entries + participation goal within 3 days -> detected.
 *   3. Participation goal more than 3 days away -> not detected.
 *   4. Participation goal already in the past -> not detected.
 *   5. Existing contest history must NOT affect detection outcome.
 *
 * The helper is tested in isolation (no storage mocking required) because
 * hasUpcomingContestWithinDays is a pure function that accepts goals + a reference Date.
 */

import assert from "node:assert/strict";
import { test, describe } from "node:test";

import { hasUpcomingContestWithinDays, replanDailyPlan } from "../dailyPlanEngine";
import { ContestGoal } from "@/services/contest/contestTypes";
import { DailyPlan, DailyAction } from "../dailyPlanTypes";

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

// --- Fixture builders ---------------------------------------------------------

function offsetDate(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function makeParticipationGoal(targetDate: string): ContestGoal {
  return {
    id: "cgoal_test",
    title: "Participate in upcoming contest",
    category: "participation",
    targetValue: 1,
    currentValue: 0,
    unit: "contests",
    targetDate,
    status: "in_progress",
    completionPercentage: 0,
    estimatedCompletionDate: targetDate,
    predictedSuccessPercentage: 80,
    createdAt: new Date().toISOString(),
  };
}

function makeRatingGoal(targetDate: string): ContestGoal {
  return {
    id: "cgoal_rating_test",
    title: "Reach rating 1500",
    category: "rating",
    targetValue: 1500,
    currentValue: 1300,
    unit: "rating",
    targetDate,
    status: "in_progress",
    completionPercentage: 50,
    estimatedCompletionDate: targetDate,
    predictedSuccessPercentage: 75,
    createdAt: new Date().toISOString(),
  };
}

// Reference point for deterministic tests
const REF = new Date("2026-01-10T12:00:00.000Z");

describe("hasUpcomingContestWithinDays -- Fix #1 regression", () => {

  test("Case 1: participation goal tomorrow -> detected (regardless of empty entry history)", () => {
    const goals: ContestGoal[] = [makeParticipationGoal(offsetDate(1, REF))];
    assert.strictEqual(hasUpcomingContestWithinDays(goals, 3, REF), true);
  });

  test("Case 2: participation goal exactly 3 days away -> detected (inclusive boundary)", () => {
    const goals: ContestGoal[] = [makeParticipationGoal(offsetDate(3, REF))];
    assert.strictEqual(hasUpcomingContestWithinDays(goals, 3, REF), true);
  });

  test("Case 3: participation goal 4 days away -> not detected", () => {
    const goals: ContestGoal[] = [makeParticipationGoal(offsetDate(4, REF))];
    assert.strictEqual(hasUpcomingContestWithinDays(goals, 3, REF), false);
  });

  test("Case 4: participation goal in the past -> not detected", () => {
    const goals: ContestGoal[] = [makeParticipationGoal(offsetDate(-1, REF))];
    assert.strictEqual(hasUpcomingContestWithinDays(goals, 3, REF), false);
  });

  test("Case 5: non-participation goal (rating) with targetDate tomorrow -> not detected", () => {
    const goals: ContestGoal[] = [makeRatingGoal(offsetDate(1, REF))];
    assert.strictEqual(hasUpcomingContestWithinDays(goals, 3, REF), false);
  });

  test("Case 6: empty goals array -> not detected (new user, no goals)", () => {
    assert.strictEqual(hasUpcomingContestWithinDays([], 3, REF), false);
  });

  test("Case 7: mixed goals -- only participation goal triggers detection", () => {
    const goals: ContestGoal[] = [
      makeRatingGoal(offsetDate(1, REF)),
      makeParticipationGoal(offsetDate(2, REF)),
    ];
    assert.strictEqual(hasUpcomingContestWithinDays(goals, 3, REF), true);
  });

  test("Case 8: entry history irrelevant -- detection correct with goals only", () => {
    const withGoal = hasUpcomingContestWithinDays([makeParticipationGoal(offsetDate(2, REF))], 3, REF);
    const noGoal = hasUpcomingContestWithinDays([], 3, REF);
    assert.strictEqual(withGoal, true);
    assert.strictEqual(noGoal, false);
  });

  test("Case 9: targetDate == referenceDate (today) -> not detected (must be strictly future)", () => {
    const today = REF.toISOString().split("T")[0];
    const goals: ContestGoal[] = [makeParticipationGoal(today)];
    assert.strictEqual(hasUpcomingContestWithinDays(goals, 3, REF), false);
  });
});

describe("replanDailyPlan -- Fix #2 regression", () => {
  function makeMockAction(overrides: Partial<DailyAction> = {}): DailyAction {
    return {
      id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actionType: "REVISION",
      title: "Revise: Two Sum",
      description: "SRS item due",
      estimatedMinutes: 15,
      priority: "HIGH",
      priorityScore: 75,
      reason: "Urgent SRS revision",
      expectedOutcome: "Retention",
      goalAlignment: "High",
      status: "pending",
      sourceRef: { type: "revision", id: "rev_test_1" },
      ...overrides,
    };
  }

  function makeMockPlan(actions: DailyAction[], timeBudgetMinutes = 60): DailyPlan {
    const today = new Date().toISOString().split("T")[0];
    const completedCount = actions.filter((a) => a.status === "completed").length;
    const completedMinutes = actions
      .filter((a) => a.status === "completed")
      .reduce((s, a) => s + a.estimatedMinutes, 0);

    return {
      id: `plan_${today}_123`,
      date: today,
      timeBudgetMinutes,
      totalPlannedMinutes: actions.reduce((s, a) => s + a.estimatedMinutes, 0),
      completedMinutes,
      actions,
      criticalCount: actions.filter((a) => a.priority === "CRITICAL").length,
      completedCount,
      skippedCount: 0,
      streak: 3,
      mainFocus: "Balanced Practice",
      status: "in_progress",
      generatedAt: new Date().toISOString(),
    };
  }

  test("Case 1: completed task missing from freshPlan is retained in replanned plan", async () => {
    const completedAction = makeMockAction({
      id: "action_completed_custom",
      title: "Completed Custom Problem",
      estimatedMinutes: 25,
      status: "completed",
      completedAt: new Date().toISOString(),
      sourceRef: { type: "knowledge", id: "custom_completed_note_id" },
    });
    const pendingAction = makeMockAction({
      id: "action_pending_1",
      title: "Pending Item",
      status: "pending",
      sourceRef: { type: "revision", id: "rev_test_pending" },
    });

    const currentPlan = makeMockPlan([completedAction, pendingAction], 60);

    const replanned = await replanDailyPlan(currentPlan, 30);

    // The completed custom action must still be present
    const foundCompleted = replanned.actions.find(
      (a) => a.sourceRef?.id === "custom_completed_note_id" || a.id === "action_completed_custom"
    );
    assert.ok(foundCompleted, "Completed task must be preserved during replan");
    assert.strictEqual(foundCompleted?.status, "completed");
    assert.ok(replanned.completedCount >= 1, "completedCount must reflect retained completed action");
    assert.ok(replanned.completedMinutes >= 25, "completedMinutes must include retained completed action");
  });

  test("Case 2: completed task present in freshPlan is not duplicated", async () => {
    const completedAction = makeMockAction({
      id: "action_seed_1",
      title: "Revise: Two Sum",
      status: "completed",
      sourceRef: { type: "revision", id: "rev_seed_1" },
    });

    const currentPlan = makeMockPlan([completedAction], 60);
    const replanned = await replanDailyPlan(currentPlan, 60);

    const matches = replanned.actions.filter(
      (a) => a.sourceRef?.id === "rev_seed_1"
    );
    assert.strictEqual(matches.length, 1, "Matching action must not be duplicated");
    assert.strictEqual(matches[0].status, "completed", "Status must remain completed");
  });

  test("Case 3: replanning with no completed actions generates fresh plan normally", async () => {
    const pendingAction = makeMockAction({
      status: "pending",
      sourceRef: { type: "revision", id: "rev_test_pending_2" },
    });

    const currentPlan = makeMockPlan([pendingAction], 60);
    const replanned = await replanDailyPlan(currentPlan, 60);

    assert.strictEqual(replanned.completedCount, 0);
    assert.strictEqual(replanned.completedMinutes, 0);
    assert.ok(replanned.actions.length > 0, "Fresh actions should be generated");
    assert.ok(replanned.actions.every((a) => a.status === "pending"));
  });

  test("Case 4: plan id is preserved after replanning", async () => {
    const currentPlan = makeMockPlan([], 60);
    const replanned = await replanDailyPlan(currentPlan, 45);

    assert.strictEqual(replanned.id, currentPlan.id, "Plan ID must remain identical for the day");
    assert.strictEqual(replanned.timeBudgetMinutes, 45, "Time budget must update to new budget");
    assert.ok(replanned.replannedAt !== undefined, "replannedAt timestamp must be set");
  });
});
