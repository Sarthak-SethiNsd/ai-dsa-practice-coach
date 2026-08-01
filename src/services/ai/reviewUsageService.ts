import {
  ReviewUsageMetadata,
  ReviewWeeklyUsage,
  ReviewQuotaStatusResponse
} from "./aiTypes";
import { loadReviewConfig } from "./aiConfig";

const STORAGE_KEY = "dsa_review_weekly_usage";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export class ReviewUsageService {
  private inMemoryStore: Map<string, ReviewWeeklyUsage> = new Map();

  /**
   * Returns configured weekly token limit.
   */
  getWeeklyTokenLimit(): number {
    const config = loadReviewConfig();
    return config.weeklyTokenLimit ?? 50000;
  }

  /**
   * Returns configured weekly request limit (or null if unlimited).
   */
  getWeeklyRequestLimit(): number | null {
    const config = loadReviewConfig();
    return config.weeklyRequestLimit ?? null;
  }

  /**
   * Retrieves active weekly usage for given user (defaults to "anonymous").
   * Automatically resets cycle if 7 days have elapsed.
   */
  getWeeklyUsage(userId = "anonymous"): ReviewWeeklyUsage {
    let usage = this.loadFromStorage(userId);

    const now = Date.now();
    const cycleStart = new Date(usage.weekStartTimestamp).getTime();

    // Automatic weekly cycle reset check
    if (isNaN(cycleStart) || now - cycleStart >= ONE_WEEK_MS) {
      usage = this.resetWeeklyCycle(userId);
    }

    return usage;
  }

  /**
   * Returns remaining tokens in current weekly cycle.
   */
  getRemainingTokens(userId = "anonymous"): number {
    const usage = this.getWeeklyUsage(userId);
    const limit = this.getWeeklyTokenLimit();
    return Math.max(0, limit - usage.totalTokens);
  }

  /**
   * Returns remaining requests in current weekly cycle (or null if unlimited).
   */
  getRemainingRequests(userId = "anonymous"): number | null {
    const limit = this.getWeeklyRequestLimit();
    if (limit === null) return null;
    const usage = this.getWeeklyUsage(userId);
    return Math.max(0, limit - usage.totalReviewRequests);
  }

  /**
   * Checks whether user has remaining quota to generate a Review AI request.
   */
  canGenerateReview(userId = "anonymous"): boolean {
    const remainingTokens = this.getRemainingTokens(userId);
    const remainingReqs = this.getRemainingRequests(userId);
    const hasTokens = remainingTokens > 0;
    const hasRequests = remainingReqs === null || remainingReqs > 0;
    return hasTokens && hasRequests;
  }

  /**
   * Atomically records usage for a successful Review AI request.
   */
  recordReviewUsage(
    usageMetadata: ReviewUsageMetadata,
    userId = "anonymous"
  ): ReviewWeeklyUsage {
    const current = this.getWeeklyUsage(userId);

    const updated: ReviewWeeklyUsage = {
      ...current,
      promptTokens: current.promptTokens + (usageMetadata.promptTokens || 0),
      completionTokens: current.completionTokens + (usageMetadata.completionTokens || 0),
      totalTokens: current.totalTokens + (usageMetadata.totalTokens || 0),
      totalReviewRequests: current.totalReviewRequests + 1
    };

    this.saveToStorage(userId, updated);
    return updated;
  }

  /**
   * Returns structured & extensible quota status object ({ usage, limits, period }).
   */
  getQuotaStatus(userId = "anonymous"): ReviewQuotaStatusResponse {
    const currentUsage = this.getWeeklyUsage(userId);
    const weeklyTokenLimit = this.getWeeklyTokenLimit();
    const weeklyRequestLimit = this.getWeeklyRequestLimit();
    const remainingTokens = this.getRemainingTokens(userId);
    const remainingRequests = this.getRemainingRequests(userId);

    const weekStart = currentUsage.weekStartTimestamp;
    const weekEnd = new Date(
      new Date(weekStart).getTime() + ONE_WEEK_MS
    ).toISOString();

    return {
      usage: {
        promptTokens: currentUsage.promptTokens,
        completionTokens: currentUsage.completionTokens,
        totalTokens: currentUsage.totalTokens,
        totalRequests: currentUsage.totalReviewRequests
      },
      limits: {
        weeklyTokenLimit,
        weeklyRequestLimit,
        remainingTokens,
        remainingRequests
      },
      period: {
        weekStart,
        weekEnd
      }
    };
  }

  // ─── Internal Storage & Reset Helpers ────────────────────────────────────────

  private createFreshUsage(userId: string): ReviewWeeklyUsage {
    return {
      userId,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      totalReviewRequests: 0,
      weekStartTimestamp: new Date().toISOString()
    };
  }

  private resetWeeklyCycle(userId: string): ReviewWeeklyUsage {
    const fresh = this.createFreshUsage(userId);
    this.saveToStorage(userId, fresh);
    return fresh;
  }

  private loadFromStorage(userId: string): ReviewWeeklyUsage {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.totalTokens === "number") {
            return parsed;
          }
        }
      } catch (err) {
        console.error("Failed to read ReviewUsageService storage:", err);
      }
    }

    // Server-side / fallback in-memory store
    if (this.inMemoryStore.has(userId)) {
      return this.inMemoryStore.get(userId)!;
    }

    const fresh = this.createFreshUsage(userId);
    this.inMemoryStore.set(userId, fresh);
    return fresh;
  }

  private saveToStorage(userId: string, usage: ReviewWeeklyUsage): void {
    this.inMemoryStore.set(userId, usage);

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(usage));
      } catch (err) {
        console.error("Failed to write ReviewUsageService storage:", err);
      }
    }
  }
}

export const reviewUsageService = new ReviewUsageService();
