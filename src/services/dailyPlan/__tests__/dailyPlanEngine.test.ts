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

import { hasUpcomingContestWithinDays } from "../dailyPlanEngine";
import { ContestGoal } from "@/services/contest/contestTypes";

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
