import { DailyPracticeSession } from './types';

const ARCHIVE_KEY = 'dsa_session_archive';
const MAX_ARCHIVE_SIZE = 90;

/**
 * Abstraction for persisting a rolling archive of DailyPracticeSession objects.
 * Designed for easy migration to Firestore or another backend.
 */
export interface SessionArchiveStorageProvider {
  loadAll(): Promise<DailyPracticeSession[]>;
  upsertSession(session: DailyPracticeSession): Promise<void>;
  clear(): Promise<void>;
}

export class LocalStorageSessionArchiveStorage implements SessionArchiveStorageProvider {
  /**
   * Returns all archived sessions, newest first.
   */
  async loadAll(): Promise<DailyPracticeSession[]> {
    if (typeof window === 'undefined') return [];
    const item = localStorage.getItem(ARCHIVE_KEY);
    if (!item) return [];
    try {
      const parsed = JSON.parse(item);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse session archive from storage', e);
      return [];
    }
  }

  /**
   * Upserts a session into the archive keyed by date (YYYY-MM-DD).
   * If an entry with the same date exists it is replaced in-place;
   * otherwise the new session is prepended (newest first).
   * Archive is capped at MAX_ARCHIVE_SIZE entries.
   */
  async upsertSession(session: DailyPracticeSession): Promise<void> {
    if (typeof window === 'undefined') return;
    const existing = await this.loadAll();
    const idx = existing.findIndex(s => s.date === session.date);
    let updated: DailyPracticeSession[];
    if (idx !== -1) {
      updated = existing.map((s, i) => (i === idx ? session : s));
    } else {
      updated = [session, ...existing];
    }
    // Keep only the most recent MAX_ARCHIVE_SIZE sessions
    if (updated.length > MAX_ARCHIVE_SIZE) {
      updated = updated.slice(0, MAX_ARCHIVE_SIZE);
    }
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updated));
  }

  /**
   * Clears the entire session archive.
   */
  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ARCHIVE_KEY);
  }
}

export const sessionArchiveStorage = new LocalStorageSessionArchiveStorage();
