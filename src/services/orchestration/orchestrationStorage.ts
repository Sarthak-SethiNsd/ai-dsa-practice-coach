import { PreparationPlan, PlanHistoryEntry } from "./orchestrationTypes";

const STORAGE_KEYS = {
  ACTIVE_PLAN: "dsa_active_preparation_plan_v1",
  PLAN_HISTORY: "dsa_preparation_plan_history_v1",
};

interface MemoryCacheEntry {
  plan: PreparationPlan;
  timestamp: number;
}

const PLAN_STABILITY_WINDOW_MS = 5 * 60 * 1000; // 5-minute stability window
let memoryCache: MemoryCacheEntry | null = null;

export function getCachedPreparationPlan(): PreparationPlan | null {
  if (!memoryCache) return null;
  if (Date.now() - memoryCache.timestamp > PLAN_STABILITY_WINDOW_MS) {
    memoryCache = null;
    return null;
  }
  return memoryCache.plan;
}

export function setCachedPreparationPlan(plan: PreparationPlan): void {
  memoryCache = {
    plan,
    timestamp: Date.now(),
  };
}

export function clearPreparationPlanCache(): void {
  memoryCache = null;
}

export function getStoredPreparationPlan(): PreparationPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("[orchestrationStorage] getStoredPreparationPlan error:", err);
    return null;
  }
}

export function saveStoredPreparationPlan(plan: PreparationPlan): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(plan));
  } catch (err) {
    console.error("[orchestrationStorage] saveStoredPreparationPlan error:", err);
  }
}

export function getStoredPlanHistory(): PlanHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAN_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("[orchestrationStorage] getStoredPlanHistory error:", err);
    return [];
  }
}

export function appendStoredPlanHistory(entry: PlanHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const history = getStoredPlanHistory();
    history.unshift(entry);
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.PLAN_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error("[orchestrationStorage] appendStoredPlanHistory error:", err);
  }
}
