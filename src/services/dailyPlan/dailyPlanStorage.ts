import { DailyPlan, PlanHistoryRecord } from "./dailyPlanTypes";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const PLAN_KEY = "dsa_daily_plan_current";
const HISTORY_KEY = "dsa_daily_plan_history";
const TIME_BUDGET_KEY = "dsa_daily_plan_time_budget";
const MAX_HISTORY = 90; // keep 90 days of history

// ─── Storage Provider Interface ───────────────────────────────────────────────

export interface DailyPlanStorageProvider {
  getCurrentPlan(): Promise<DailyPlan | null>;
  savePlan(plan: DailyPlan): Promise<void>;
  deletePlan(): Promise<void>;
  getTimeBudget(): Promise<number>;
  saveTimeBudget(minutes: number): Promise<void>;
  getHistory(): Promise<PlanHistoryRecord[]>;
  appendHistory(record: PlanHistoryRecord): Promise<void>;
  clearHistory(): Promise<void>;
}

// ─── LocalStorage Implementation ──────────────────────────────────────────────

export class LocalStorageDailyPlanStorage implements DailyPlanStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private read<T>(key: string): T | null {
    if (!this.isClient()) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.error(`[DailyPlanStorage] Failed to parse key: ${key}`, e);
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[DailyPlanStorage] Failed to write key: ${key}`, e);
    }
  }

  async getCurrentPlan(): Promise<DailyPlan | null> {
    return this.read<DailyPlan>(PLAN_KEY);
  }

  async savePlan(plan: DailyPlan): Promise<void> {
    this.write(PLAN_KEY, plan);
  }

  async deletePlan(): Promise<void> {
    if (!this.isClient()) return;
    localStorage.removeItem(PLAN_KEY);
  }

  async getTimeBudget(): Promise<number> {
    const stored = this.read<number>(TIME_BUDGET_KEY);
    return stored ?? 60; // default 60 min
  }

  async saveTimeBudget(minutes: number): Promise<void> {
    this.write(TIME_BUDGET_KEY, minutes);
  }

  async getHistory(): Promise<PlanHistoryRecord[]> {
    return this.read<PlanHistoryRecord[]>(HISTORY_KEY) ?? [];
  }

  async appendHistory(record: PlanHistoryRecord): Promise<void> {
    const history = await this.getHistory();
    // Replace if same date exists, otherwise prepend
    const filtered = history.filter((h) => h.date !== record.date);
    const updated = [record, ...filtered].slice(0, MAX_HISTORY);
    this.write(HISTORY_KEY, updated);
  }

  async clearHistory(): Promise<void> {
    if (!this.isClient()) return;
    localStorage.removeItem(HISTORY_KEY);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const dailyPlanStorage = new LocalStorageDailyPlanStorage();
