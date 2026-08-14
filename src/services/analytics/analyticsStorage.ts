import { AnalyticsGoal } from "./performanceAnalyticsTypes";

const GOALS_STORAGE_KEY = "dsa_performance_analytics_goals";

export interface AnalyticsStorageProvider {
  getGoals(): Promise<AnalyticsGoal[]>;
  saveGoals(goals: AnalyticsGoal[]): Promise<void>;
  addGoal(goal: Omit<AnalyticsGoal, "id" | "createdAt" | "completionPercentage" | "status">): Promise<AnalyticsGoal>;
  updateGoal(id: string, updates: Partial<AnalyticsGoal>): Promise<AnalyticsGoal | null>;
  deleteGoal(id: string): Promise<boolean>;
}

export class LocalStorageAnalyticsStorage implements AnalyticsStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getRawGoals(): AnalyticsGoal[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(GOALS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[AnalyticsStorage] Failed to load goals:", e);
      return [];
    }
  }

  private saveRawGoals(goals: AnalyticsGoal[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }

  async getGoals(): Promise<AnalyticsGoal[]> {
    const goals = this.getRawGoals();
    if (goals.length === 0) {
      // Seed default goals if empty
      const defaultGoals: AnalyticsGoal[] = [
        {
          id: "goal_weekly_10",
          title: "Solve 10 Problems This Week",
          category: "weekly_problems",
          targetValue: 10,
          currentValue: 0,
          unit: "problems",
          targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          status: "in_progress",
          completionPercentage: 0,
          estimatedCompletionDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
          predictedSuccessPercentage: 85,
          createdAt: new Date().toISOString(),
        },
        {
          id: "goal_reviews_15",
          title: "Complete 15 AI Reviews",
          category: "monthly_reviews",
          targetValue: 15,
          currentValue: 0,
          unit: "reviews",
          targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          status: "in_progress",
          completionPercentage: 0,
          estimatedCompletionDate: new Date(Date.now() + 20 * 86400000).toISOString().split("T")[0],
          predictedSuccessPercentage: 90,
          createdAt: new Date().toISOString(),
        },
        {
          id: "goal_dp_mastery",
          title: "Master Dynamic Programming",
          category: "topic_mastery",
          targetValue: 100,
          currentValue: 0,
          unit: "% mastery",
          targetTopic: "Dynamic Programming",
          targetDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
          status: "in_progress",
          completionPercentage: 0,
          estimatedCompletionDate: new Date(Date.now() + 35 * 86400000).toISOString().split("T")[0],
          predictedSuccessPercentage: 75,
          createdAt: new Date().toISOString(),
        },
        {
          id: "goal_streak_7",
          title: "7-Day Practice Streak",
          category: "streak",
          targetValue: 7,
          currentValue: 0,
          unit: "days",
          targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          status: "in_progress",
          completionPercentage: 0,
          estimatedCompletionDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          predictedSuccessPercentage: 80,
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveRawGoals(defaultGoals);
      return defaultGoals;
    }
    return goals;
  }

  async saveGoals(goals: AnalyticsGoal[]): Promise<void> {
    this.saveRawGoals(goals);
  }

  async addGoal(
    payload: Omit<AnalyticsGoal, "id" | "createdAt" | "completionPercentage" | "status">
  ): Promise<AnalyticsGoal> {
    const goals = await this.getGoals();
    const pct = payload.targetValue > 0 ? Math.min(100, Math.round((payload.currentValue / payload.targetValue) * 100)) : 0;
    const newGoal: AnalyticsGoal = {
      ...payload,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      completionPercentage: pct,
      status: pct >= 100 ? "completed" : "in_progress",
    };
    const updated = [newGoal, ...goals];
    this.saveRawGoals(updated);
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<AnalyticsGoal>): Promise<AnalyticsGoal | null> {
    const goals = await this.getGoals();
    const idx = goals.findIndex((g) => g.id === id);
    if (idx === -1) return null;

    const current = goals[idx];
    const targetVal = updates.targetValue ?? current.targetValue;
    const currentVal = updates.currentValue ?? current.currentValue;
    const pct = targetVal > 0 ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;

    const updated: AnalyticsGoal = {
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

export const analyticsStorage = new LocalStorageAnalyticsStorage();
