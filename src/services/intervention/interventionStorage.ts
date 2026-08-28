import {
  AdaptiveStrategyState,
  StrategyHistoryEntry,
  InterventionOutcome,
  AdaptiveStrategyResult,
} from "./interventionTypes";

const STORAGE_KEYS = {
  STRATEGY_STATE: "dsa_adaptive_strategy_state_v1",
  STRATEGY_HISTORY: "dsa_adaptive_strategy_history_v1",
  INTERVENTION_OUTCOMES: "dsa_adaptive_intervention_outcomes_v1",
  COOLDOWNS: "dsa_adaptive_intervention_cooldowns_v1",
};

interface MemoryCacheEntry {
  data: AdaptiveStrategyResult;
  timestamp: number;
}

const CACHE_TTL_MS = 5000; // 5-second TTL
let memoryCache: MemoryCacheEntry | null = null;

export function getCachedStrategyResult(): AdaptiveStrategyResult | null {
  if (!memoryCache) return null;
  if (Date.now() - memoryCache.timestamp > CACHE_TTL_MS) {
    memoryCache = null;
    return null;
  }
  return memoryCache.data;
}

export function setCachedStrategyResult(result: AdaptiveStrategyResult): void {
  memoryCache = {
    data: result,
    timestamp: Date.now(),
  };
}

export function clearStrategyCache(): void {
  memoryCache = null;
}

export function getStoredStrategyState(): AdaptiveStrategyState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STRATEGY_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("[interventionStorage] getStoredStrategyState error:", err);
    return null;
  }
}

export function saveStoredStrategyState(state: AdaptiveStrategyState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.STRATEGY_STATE, JSON.stringify(state));
  } catch (err) {
    console.error("[interventionStorage] saveStoredStrategyState error:", err);
  }
}

export function getStoredStrategyHistory(): StrategyHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STRATEGY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("[interventionStorage] getStoredStrategyHistory error:", err);
    return [];
  }
}

export function appendStoredStrategyHistory(entry: StrategyHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const history = getStoredStrategyHistory();
    history.unshift(entry);
    // Keep max 50 history entries
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.STRATEGY_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error("[interventionStorage] appendStoredStrategyHistory error:", err);
  }
}

export function getStoredInterventionOutcomes(): InterventionOutcome[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVENTION_OUTCOMES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("[interventionStorage] getStoredInterventionOutcomes error:", err);
    return [];
  }
}

export function saveStoredInterventionOutcome(outcome: InterventionOutcome): void {
  if (typeof window === "undefined") return;
  try {
    const outcomes = getStoredInterventionOutcomes();
    const existingIdx = outcomes.findIndex((o) => o.planId === outcome.planId);
    if (existingIdx >= 0) {
      outcomes[existingIdx] = outcome;
    } else {
      outcomes.unshift(outcome);
    }
    localStorage.setItem(STORAGE_KEYS.INTERVENTION_OUTCOMES, JSON.stringify(outcomes));
  } catch (err) {
    console.error("[interventionStorage] saveStoredInterventionOutcome error:", err);
  }
}

export function getStoredCooldowns(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COOLDOWNS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("[interventionStorage] getStoredCooldowns error:", err);
    return {};
  }
}

export function setStoredCooldown(interventionType: string, durationDays: number): void {
  if (typeof window === "undefined") return;
  try {
    const cooldowns = getStoredCooldowns();
    const expiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    cooldowns[interventionType] = expiry;
    localStorage.setItem(STORAGE_KEYS.COOLDOWNS, JSON.stringify(cooldowns));
  } catch (err) {
    console.error("[interventionStorage] setStoredCooldown error:", err);
  }
}
