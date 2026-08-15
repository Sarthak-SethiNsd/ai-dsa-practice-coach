import {
  ContestEntry,
  ContestGoal,
  ContestGoalCategory,
} from "./contestTypes";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const ENTRIES_KEY = "dsa_contest_entries";
const GOALS_KEY = "dsa_contest_goals";

// ─── Seed Data (10 realistic contests) ───────────────────────────────────────

function buildSeedEntries(): ContestEntry[] {
  const now = new Date();
  const offset = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  return [
    {
      id: "contest_seed_1",
      contestName: "Codeforces Round 950 (Div. 2)",
      date: offset(180),
      platform: "codeforces",
      rank: 1842,
      totalParticipants: 22400,
      ratingBefore: 1200,
      ratingAfter: 1235,
      ratingChange: 35,
      problemsSolved: 2,
      totalProblems: 6,
      timeSpentMinutes: 120,
      performanceScore: 48,
      problemBreakdown: {
        easySolved: 2, easyAttempted: 2,
        mediumSolved: 0, mediumAttempted: 1,
        hardSolved: 0, hardAttempted: 0,
        timeEfficiencyScore: 52, penaltyMinutes: 15,
        missedOpportunities: 1, topicsAttempted: ["Arrays", "Math"],
      },
      notes: "First rated contest. Solved A and B.",
      createdAt: new Date(now.getTime() - 180 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_2",
      contestName: "Codeforces Round 955 (Div. 2)",
      date: offset(150),
      platform: "codeforces",
      rank: 1560,
      totalParticipants: 19800,
      ratingBefore: 1235,
      ratingAfter: 1278,
      ratingChange: 43,
      problemsSolved: 3,
      totalProblems: 6,
      timeSpentMinutes: 120,
      performanceScore: 58,
      problemBreakdown: {
        easySolved: 2, easyAttempted: 2,
        mediumSolved: 1, mediumAttempted: 2,
        hardSolved: 0, hardAttempted: 0,
        timeEfficiencyScore: 61, penaltyMinutes: 20,
        missedOpportunities: 1, topicsAttempted: ["Strings", "Binary Search", "Greedy"],
      },
      createdAt: new Date(now.getTime() - 150 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_3",
      contestName: "Codeforces Round 960 (Div. 2)",
      date: offset(120),
      platform: "codeforces",
      rank: 2300,
      totalParticipants: 21000,
      ratingBefore: 1278,
      ratingAfter: 1248,
      ratingChange: -30,
      problemsSolved: 2,
      totalProblems: 6,
      timeSpentMinutes: 120,
      performanceScore: 38,
      problemBreakdown: {
        easySolved: 2, easyAttempted: 3,
        mediumSolved: 0, mediumAttempted: 1,
        hardSolved: 0, hardAttempted: 0,
        timeEfficiencyScore: 40, penaltyMinutes: 35,
        missedOpportunities: 2, topicsAttempted: ["Dynamic Programming", "Recursion"],
      },
      notes: "Struggled with DP problems. Need more practice.",
      createdAt: new Date(now.getTime() - 120 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_4",
      contestName: "LeetCode Biweekly Contest 130",
      date: offset(105),
      platform: "leetcode",
      rank: 3200,
      totalParticipants: 28000,
      ratingBefore: 1540,
      ratingAfter: 1572,
      ratingChange: 32,
      problemsSolved: 3,
      totalProblems: 4,
      timeSpentMinutes: 90,
      performanceScore: 72,
      problemBreakdown: {
        easySolved: 1, easyAttempted: 1,
        mediumSolved: 2, mediumAttempted: 2,
        hardSolved: 0, hardAttempted: 1,
        timeEfficiencyScore: 74, penaltyMinutes: 5,
        missedOpportunities: 1, topicsAttempted: ["Arrays", "Sorting", "Two Pointers"],
      },
      createdAt: new Date(now.getTime() - 105 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_5",
      contestName: "Codeforces Round 968 (Div. 2)",
      date: offset(90),
      platform: "codeforces",
      rank: 1320,
      totalParticipants: 23500,
      ratingBefore: 1248,
      ratingAfter: 1305,
      ratingChange: 57,
      problemsSolved: 3,
      totalProblems: 6,
      timeSpentMinutes: 120,
      performanceScore: 65,
      problemBreakdown: {
        easySolved: 2, easyAttempted: 2,
        mediumSolved: 1, mediumAttempted: 1,
        hardSolved: 0, hardAttempted: 1,
        timeEfficiencyScore: 68, penaltyMinutes: 10,
        missedOpportunities: 1, topicsAttempted: ["Graphs", "Greedy", "Math"],
      },
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_6",
      contestName: "LeetCode Weekly Contest 405",
      date: offset(77),
      platform: "leetcode",
      rank: 2800,
      totalParticipants: 25000,
      ratingBefore: 1572,
      ratingAfter: 1595,
      ratingChange: 23,
      problemsSolved: 3,
      totalProblems: 4,
      timeSpentMinutes: 90,
      performanceScore: 68,
      problemBreakdown: {
        easySolved: 1, easyAttempted: 1,
        mediumSolved: 2, mediumAttempted: 3,
        hardSolved: 0, hardAttempted: 0,
        timeEfficiencyScore: 70, penaltyMinutes: 0,
        missedOpportunities: 2, topicsAttempted: ["Bit Manipulation", "Trees", "Binary Search"],
      },
      createdAt: new Date(now.getTime() - 77 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_7",
      contestName: "Codeforces Round 975 (Div. 2)",
      date: offset(60),
      platform: "codeforces",
      rank: 980,
      totalParticipants: 24000,
      ratingBefore: 1305,
      ratingAfter: 1378,
      ratingChange: 73,
      problemsSolved: 4,
      totalProblems: 6,
      timeSpentMinutes: 120,
      performanceScore: 78,
      problemBreakdown: {
        easySolved: 2, easyAttempted: 2,
        mediumSolved: 2, mediumAttempted: 2,
        hardSolved: 0, hardAttempted: 1,
        timeEfficiencyScore: 80, penaltyMinutes: 8,
        missedOpportunities: 1, topicsAttempted: ["Graphs", "Trees", "Greedy", "Arrays"],
      },
      notes: "Best contest so far! Solved 4 problems.",
      createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_8",
      contestName: "Codeforces Round 980 (Div. 2)",
      date: offset(45),
      platform: "codeforces",
      rank: 1650,
      totalParticipants: 20500,
      ratingBefore: 1378,
      ratingAfter: 1352,
      ratingChange: -26,
      problemsSolved: 2,
      totalProblems: 6,
      timeSpentMinutes: 120,
      performanceScore: 42,
      problemBreakdown: {
        easySolved: 2, easyAttempted: 3,
        mediumSolved: 0, mediumAttempted: 2,
        hardSolved: 0, hardAttempted: 0,
        timeEfficiencyScore: 45, penaltyMinutes: 42,
        missedOpportunities: 3, topicsAttempted: ["Dynamic Programming", "Strings"],
      },
      notes: "DP problems again. Penalty hurt a lot.",
      createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_9",
      contestName: "LeetCode Biweekly Contest 135",
      date: offset(28),
      platform: "leetcode",
      rank: 2200,
      totalParticipants: 26500,
      ratingBefore: 1595,
      ratingAfter: 1638,
      ratingChange: 43,
      problemsSolved: 3,
      totalProblems: 4,
      timeSpentMinutes: 90,
      performanceScore: 74,
      problemBreakdown: {
        easySolved: 1, easyAttempted: 1,
        mediumSolved: 2, mediumAttempted: 2,
        hardSolved: 0, hardAttempted: 1,
        timeEfficiencyScore: 76, penaltyMinutes: 0,
        missedOpportunities: 1, topicsAttempted: ["Stack", "Queues", "Arrays"],
      },
      createdAt: new Date(now.getTime() - 28 * 86400000).toISOString(),
    },
    {
      id: "contest_seed_10",
      contestName: "Codeforces Round 990 (Div. 2)",
      date: offset(10),
      platform: "codeforces",
      rank: 875,
      totalParticipants: 25000,
      ratingBefore: 1352,
      ratingAfter: 1432,
      ratingChange: 80,
      problemsSolved: 4,
      totalProblems: 6,
      timeSpentMinutes: 120,
      performanceScore: 82,
      problemBreakdown: {
        easySolved: 2, easyAttempted: 2,
        mediumSolved: 2, mediumAttempted: 3,
        hardSolved: 0, hardAttempted: 1,
        timeEfficiencyScore: 85, penaltyMinutes: 12,
        missedOpportunities: 1, topicsAttempted: ["Binary Search", "Graphs", "Math", "Greedy"],
      },
      notes: "New peak performance! Rating close to 1500.",
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
  ];
}

function buildSeedGoals(): ContestGoal[] {
  const now = new Date();
  const futureDate = (days: number) =>
    new Date(now.getTime() + days * 86400000).toISOString().split("T")[0];

  return [
    {
      id: "cgoal_rating_1500",
      title: "Reach Rating 1500",
      category: "rating",
      targetValue: 1500,
      currentValue: 1432,
      unit: "rating",
      targetDate: futureDate(45),
      status: "in_progress",
      completionPercentage: 72,
      estimatedCompletionDate: futureDate(30),
      predictedSuccessPercentage: 80,
      createdAt: now.toISOString(),
    },
    {
      id: "cgoal_participate_20",
      title: "Participate in 20 Contests",
      category: "participation",
      targetValue: 20,
      currentValue: 10,
      unit: "contests",
      targetDate: futureDate(90),
      status: "in_progress",
      completionPercentage: 50,
      estimatedCompletionDate: futureDate(70),
      predictedSuccessPercentage: 85,
      createdAt: now.toISOString(),
    },
    {
      id: "cgoal_dp_master",
      title: "Master DP in Contests",
      category: "topic_mastery",
      targetValue: 75,
      currentValue: 30,
      unit: "% success rate",
      targetDate: futureDate(60),
      status: "in_progress",
      completionPercentage: 40,
      estimatedCompletionDate: futureDate(55),
      predictedSuccessPercentage: 65,
      createdAt: now.toISOString(),
    },
    {
      id: "cgoal_monthly_4",
      title: "4 Contests Per Month",
      category: "consistency",
      targetValue: 4,
      currentValue: 2,
      unit: "contests/month",
      targetDate: futureDate(30),
      status: "in_progress",
      completionPercentage: 50,
      estimatedCompletionDate: futureDate(25),
      predictedSuccessPercentage: 75,
      createdAt: now.toISOString(),
    },
  ];
}

// ─── Storage Provider Interface ───────────────────────────────────────────────

export interface ContestStorageProvider {
  getEntries(): Promise<ContestEntry[]>;
  saveEntries(entries: ContestEntry[]): Promise<void>;
  addEntry(entry: Omit<ContestEntry, "id" | "createdAt">): Promise<ContestEntry>;
  updateEntry(id: string, updates: Partial<ContestEntry>): Promise<ContestEntry | null>;
  deleteEntry(id: string): Promise<boolean>;
  getGoals(): Promise<ContestGoal[]>;
  saveGoals(goals: ContestGoal[]): Promise<void>;
  addGoal(goal: Omit<ContestGoal, "id" | "createdAt" | "completionPercentage" | "status">): Promise<ContestGoal>;
  updateGoal(id: string, updates: Partial<ContestGoal>): Promise<ContestGoal | null>;
  deleteGoal(id: string): Promise<boolean>;
}

// ─── LocalStorage Implementation ──────────────────────────────────────────────

export class LocalStorageContestStorage implements ContestStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  // ── Entries ──────────────────────────────────────────────────────────────

  private loadRawEntries(): ContestEntry[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(ENTRIES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[ContestStorage] Failed to load entries:", e);
      return [];
    }
  }

  private saveRawEntries(entries: ContestEntry[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  async getEntries(): Promise<ContestEntry[]> {
    const entries = this.loadRawEntries();
    if (entries.length === 0) {
      const seed = buildSeedEntries();
      this.saveRawEntries(seed);
      return seed;
    }
    return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async saveEntries(entries: ContestEntry[]): Promise<void> {
    this.saveRawEntries(entries);
  }

  async addEntry(payload: Omit<ContestEntry, "id" | "createdAt">): Promise<ContestEntry> {
    const entries = await this.getEntries();
    const newEntry: ContestEntry = {
      ...payload,
      id: `contest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    this.saveRawEntries(updated);
    return newEntry;
  }

  async updateEntry(id: string, updates: Partial<ContestEntry>): Promise<ContestEntry | null> {
    const entries = await this.getEntries();
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const updated: ContestEntry = { ...entries[idx], ...updates };
    entries[idx] = updated;
    this.saveRawEntries(entries);
    return updated;
  }

  async deleteEntry(id: string): Promise<boolean> {
    const entries = await this.getEntries();
    const filtered = entries.filter((e) => e.id !== id);
    if (filtered.length === entries.length) return false;
    this.saveRawEntries(filtered);
    return true;
  }

  // ── Goals ─────────────────────────────────────────────────────────────────

  private loadRawGoals(): ContestGoal[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(GOALS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[ContestStorage] Failed to load goals:", e);
      return [];
    }
  }

  private saveRawGoals(goals: ContestGoal[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  async getGoals(): Promise<ContestGoal[]> {
    const goals = this.loadRawGoals();
    if (goals.length === 0) {
      const seed = buildSeedGoals();
      this.saveRawGoals(seed);
      return seed;
    }
    return goals;
  }

  async saveGoals(goals: ContestGoal[]): Promise<void> {
    this.saveRawGoals(goals);
  }

  async addGoal(
    payload: Omit<ContestGoal, "id" | "createdAt" | "completionPercentage" | "status">
  ): Promise<ContestGoal> {
    const goals = await this.getGoals();
    const pct =
      payload.targetValue > 0
        ? Math.min(100, Math.round((payload.currentValue / payload.targetValue) * 100))
        : 0;
    const newGoal: ContestGoal = {
      ...payload,
      id: `cgoal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      completionPercentage: pct,
      status: pct >= 100 ? "completed" : "in_progress",
    };
    this.saveRawGoals([newGoal, ...goals]);
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<ContestGoal>): Promise<ContestGoal | null> {
    const goals = await this.getGoals();
    const idx = goals.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    const current = goals[idx];
    const targetVal = updates.targetValue ?? current.targetValue;
    const currentVal = updates.currentValue ?? current.currentValue;
    const pct =
      targetVal > 0 ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;
    const updated: ContestGoal = {
      ...current,
      ...updates,
      completionPercentage: pct,
      status: pct >= 100 ? "completed" : updates.status ?? current.status,
    };
    goals[idx] = updated;
    this.saveRawGoals(goals);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const goals = await this.getGoals();
    const filtered = goals.filter((g) => g.id !== id);
    if (filtered.length === goals.length) return false;
    this.saveRawGoals(filtered);
    return true;
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const contestStorage = new LocalStorageContestStorage();

// ─── Helper: compute ratingChange from entries for a given category ───────────

export function computeCurrentValueForGoal(
  category: ContestGoalCategory,
  entries: ContestEntry[]
): number {
  if (category === "rating") {
    if (entries.length === 0) return 1200;
    const sorted = [...entries].sort((a, b) => (a.date > b.date ? -1 : 1));
    return sorted[0].ratingAfter;
  }
  if (category === "participation") {
    return entries.length;
  }
  if (category === "consistency") {
    // Contests this month
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return entries.filter((e) => e.date.startsWith(thisMonth)).length;
  }
  return 0;
}
