import { ReviewHistoryEntry, ReviewHistorySummary } from './ai/aiTypes';

const STORAGE_KEY = 'dsa_review_history';
const MAX_HISTORY_SIZE = 200;

// ─── Provider interface ────────────────────────────────────────────────────────

/**
 * Storage abstraction for Review History entries.
 * Swap the implementation to migrate from localStorage to a database
 * without changing any UI or hook code.
 */
export interface ReviewHistoryStorageProvider {
  /**
   * Persists a new history entry.
   * Prepends to the list (newest first) and trims to MAX_HISTORY_SIZE.
   */
  saveReview(entry: ReviewHistoryEntry): Promise<void>;

  /**
   * Returns lightweight summaries for all saved entries, newest first.
   * Does NOT include the full code or response body.
   */
  getAllSummaries(): Promise<ReviewHistorySummary[]>;

  /**
   * Returns the complete entry for a given id, or null if not found.
   */
  getById(id: string): Promise<ReviewHistoryEntry | null>;

  /**
   * Removes the entry with the given id.
   * Silently no-ops if the id is not found.
   */
  deleteById(id: string): Promise<void>;

  /**
   * Permanently removes all history entries.
   */
  clearAll(): Promise<void>;
}

// ─── LocalStorage implementation ──────────────────────────────────────────────

export class LocalStorageReviewHistoryStorage implements ReviewHistoryStorageProvider {
  // ── Internal helpers ──────────────────────────────────────────────────────

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private loadAll(): ReviewHistoryEntry[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('[ReviewHistoryStorage] Failed to parse stored history:', e);
      return [];
    }
  }

  private persist(entries: ReviewHistoryEntry[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  private toSummary(entry: ReviewHistoryEntry): ReviewHistorySummary {
    return {
      id: entry.id,
      timestamp: entry.timestamp,
      category: entry.category,
      language: entry.language,
      codePreview: entry.code.trim().substring(0, 120),
      totalTokens: entry.usage?.totalTokens ?? 0,
      model: entry.model,
      durationMs: entry.durationMs,
      problemTitle: entry.problemTitle,
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async saveReview(entry: ReviewHistoryEntry): Promise<void> {
    if (!this.isClient()) return;
    const existing = this.loadAll();
    // Prepend newest entry
    const updated = [entry, ...existing];
    // Trim to cap
    const trimmed = updated.length > MAX_HISTORY_SIZE
      ? updated.slice(0, MAX_HISTORY_SIZE)
      : updated;
    this.persist(trimmed);
  }

  async getAllSummaries(): Promise<ReviewHistorySummary[]> {
    return this.loadAll().map(e => this.toSummary(e));
  }

  async getById(id: string): Promise<ReviewHistoryEntry | null> {
    const all = this.loadAll();
    return all.find(e => e.id === id) ?? null;
  }

  async deleteById(id: string): Promise<void> {
    if (!this.isClient()) return;
    const filtered = this.loadAll().filter(e => e.id !== id);
    this.persist(filtered);
  }

  async clearAll(): Promise<void> {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const reviewHistoryStorage = new LocalStorageReviewHistoryStorage();
