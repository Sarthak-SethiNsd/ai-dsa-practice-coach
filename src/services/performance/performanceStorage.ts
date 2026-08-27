import {
  FullPerformanceIntelligence,
  PerformanceWindow,
} from "./performanceTypes";

const CACHE_TTL_MS = 5000; // 5 seconds in-memory cache
const SNAPSHOT_STORAGE_KEY_PREFIX = "dsa_performance_snapshot_";

interface CacheEntry {
  window: PerformanceWindow;
  data: FullPerformanceIntelligence;
  timestamp: number;
}

let inMemoryCache: Record<string, CacheEntry> = {};

function isClient(): boolean {
  return typeof window !== "undefined" || typeof localStorage !== "undefined";
}

export function getCachedPerformanceIntelligence(
  window: PerformanceWindow
): FullPerformanceIntelligence | null {
  const entry = inMemoryCache[window];
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL_MS) {
    delete inMemoryCache[window];
    return null;
  }

  return entry.data;
}

export function setCachedPerformanceIntelligence(
  window: PerformanceWindow,
  data: FullPerformanceIntelligence
): void {
  inMemoryCache[window] = {
    window,
    data,
    timestamp: Date.now(),
  };

  // Optional localStorage save for offline quick recovery
  if (isClient()) {
    try {
      localStorage.setItem(
        `${SNAPSHOT_STORAGE_KEY_PREFIX}${window}`,
        JSON.stringify({
          window,
          generatedAt: data.generatedAt,
          metrics: data.metrics,
          diagnosisSummary: data.diagnosisSummary,
        })
      );
    } catch {
      // ignore storage errors
    }
  }
}

export function invalidatePerformanceCache(): void {
  inMemoryCache = {};
}
