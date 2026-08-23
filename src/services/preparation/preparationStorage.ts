import {
  PreparationGoal,
  PreparationSnapshot,
} from "./preparationTypes";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const GOALS_KEY = "dsa_preparation_goals";
const ACTIVE_GOAL_ID_KEY = "dsa_preparation_active_goal_id";
const SNAPSHOTS_KEY = "dsa_preparation_snapshots";
const ACKNOWLEDGED_RISKS_KEY = "dsa_preparation_acknowledged_risks";

// ─── Seed Data ───────────────────────────────────────────────────────────────

function getFutureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function buildSeedGoals(): PreparationGoal[] {
  const now = new Date().toISOString();

  return [
    {
      id: "prep_goal_bigtech_interview",
      name: "Big Tech Technical Interview Prep",
      type: "dsa_interview",
      targetDate: getFutureDate(45),
      dailyMinutes: 60,
      daysPerWeek: 6,
      preferredPlatforms: ["leetcode"],
      currentSkillLevel: "intermediate",
      targetDifficulty: "Medium",
      priorityTopics: ["Graphs", "Dynamic Programming", "Trees", "Binary Search"],
      targetInterviewScore: 85,
      notes: "Targeting SDE-2 algorithmic interviews. Focus on clean graph traversals and DP optimizations.",
      createdAt: getPastDate(15),
      updatedAt: now,
    },
    {
      id: "prep_goal_cp_rating_push",
      name: "Codeforces Specialist Rating Push",
      type: "competitive_programming",
      targetDate: getFutureDate(75),
      dailyMinutes: 45,
      daysPerWeek: 5,
      preferredPlatforms: ["codeforces", "leetcode"],
      currentSkillLevel: "intermediate",
      targetDifficulty: "Mixed",
      priorityTopics: ["Greedy", "Binary Search", "Math", "Number Theory"],
      targetContestRating: 1500,
      notes: "Aiming for consistent Div. 2 Problem C solves under 30 minutes.",
      createdAt: getPastDate(30),
      updatedAt: now,
    },
  ];
}

function buildSeedSnapshots(): PreparationSnapshot[] {
  return [
    {
      id: "prep_snap_30d_ago",
      goalId: "prep_goal_bigtech_interview",
      goalName: "Big Tech Technical Interview Prep",
      date: getPastDate(30),
      daysRemaining: 75,
      readinessScore: 54,
      onTrackStatus: "ON_TRACK",
      currentPhaseName: "Foundation Repair",
      completedMilestonesCount: 1,
      totalMilestonesCount: 6,
      criticalRisksCount: 3,
      studyConsistencyPct: 65,
      topWeakTopics: ["Dynamic Programming", "Graphs", "Binary Search"],
    },
    {
      id: "prep_snap_7d_ago",
      goalId: "prep_goal_bigtech_interview",
      goalName: "Big Tech Technical Interview Prep",
      date: getPastDate(7),
      daysRemaining: 52,
      readinessScore: 68,
      onTrackStatus: "ON_TRACK",
      currentPhaseName: "Pattern Expansion & Timed Execution",
      completedMilestonesCount: 3,
      totalMilestonesCount: 6,
      criticalRisksCount: 1,
      studyConsistencyPct: 82,
      topWeakTopics: ["Graphs", "Sliding Window"],
    },
  ];
}

// ─── Storage Operations ───────────────────────────────────────────────────────

export function getPreparationGoals(): PreparationGoal[] {
  if (typeof window === "undefined") return buildSeedGoals();
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) {
      const seed = buildSeedGoals();
      localStorage.setItem(GOALS_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : buildSeedGoals();
  } catch (err) {
    console.error("[preparationStorage] Failed to get goals:", err);
    return buildSeedGoals();
  }
}

export function savePreparationGoals(goals: PreparationGoal[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (err) {
    console.error("[preparationStorage] Failed to save goals:", err);
  }
}

export function getActiveGoalId(): string {
  if (typeof window === "undefined") return "prep_goal_bigtech_interview";
  try {
    const active = localStorage.getItem(ACTIVE_GOAL_ID_KEY);
    if (active) return active;
    const goals = getPreparationGoals();
    const fallbackId = goals[0]?.id || "prep_goal_bigtech_interview";
    localStorage.setItem(ACTIVE_GOAL_ID_KEY, fallbackId);
    return fallbackId;
  } catch {
    return "prep_goal_bigtech_interview";
  }
}

export function setActiveGoalId(goalId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_GOAL_ID_KEY, goalId);
  } catch (err) {
    console.error("[preparationStorage] Failed to set active goal id:", err);
  }
}

export function getActiveGoal(): PreparationGoal {
  const goals = getPreparationGoals();
  const activeId = getActiveGoalId();
  const found = goals.find((g) => g.id === activeId && !g.isArchived);
  return found || goals[0] || buildSeedGoals()[0];
}

export function saveGoal(goal: PreparationGoal): void {
  const goals = getPreparationGoals();
  const idx = goals.findIndex((g) => g.id === goal.id);
  const now = new Date().toISOString();
  let updated: PreparationGoal[];

  if (idx >= 0) {
    updated = [...goals];
    updated[idx] = { ...goal, updatedAt: now };
  } else {
    updated = [{ ...goal, createdAt: now, updatedAt: now }, ...goals];
  }

  savePreparationGoals(updated);
}

export function deleteGoal(goalId: string): void {
  const goals = getPreparationGoals();
  const updated = goals.filter((g) => g.id !== goalId);
  savePreparationGoals(updated);
  if (getActiveGoalId() === goalId && updated.length > 0) {
    setActiveGoalId(updated[0].id);
  }
}

export function getPreparationSnapshots(): PreparationSnapshot[] {
  if (typeof window === "undefined") return buildSeedSnapshots();
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) {
      const seed = buildSeedSnapshots();
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : buildSeedSnapshots();
  } catch {
    return buildSeedSnapshots();
  }
}

export function appendPreparationSnapshot(snapshot: PreparationSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    const snapshots = getPreparationSnapshots();
    // Avoid duplicate snapshot on the same date for the same goal
    const filtered = snapshots.filter(
      (s) => !(s.goalId === snapshot.goalId && s.date === snapshot.date)
    );
    const updated = [snapshot, ...filtered].slice(0, 50); // retain last 50
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("[preparationStorage] Failed to append snapshot:", err);
  }
}

export function getAcknowledgedRisks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACKNOWLEDGED_RISKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function acknowledgeRisk(riskId: string): void {
  if (typeof window === "undefined") return;
  try {
    const acks = getAcknowledgedRisks();
    if (!acks.includes(riskId)) {
      localStorage.setItem(ACKNOWLEDGED_RISKS_KEY, JSON.stringify([...acks, riskId]));
    }
  } catch (err) {
    console.error("[preparationStorage] Failed to acknowledge risk:", err);
  }
}
