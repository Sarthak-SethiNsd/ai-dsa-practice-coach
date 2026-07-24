import { DailyPracticeSession } from './types';

/**
 * Persistence abstraction for storing and retrieving Daily Practice Sessions.
 * Keeps business logic decoupled from storage mechanism for easy Firestore migration.
 */
export interface DailySessionStorageProvider {
  loadTodaySession(dateStr: string): Promise<DailyPracticeSession | null>;
  saveSession(session: DailyPracticeSession): Promise<void>;
  clearSession(): Promise<void>;
}

export class LocalStorageDailySessionStorage implements DailySessionStorageProvider {
  private STORAGE_KEY = "dsa_daily_practice_session";

  async loadTodaySession(dateStr: string): Promise<DailyPracticeSession | null> {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(this.STORAGE_KEY);
    if (!item) return null;
    try {
      const session: DailyPracticeSession = JSON.parse(item);
      if (session && session.date === dateStr) {
        return session;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse daily practice session from storage", e);
      return null;
    }
  }

  async saveSession(session: DailyPracticeSession): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  async clearSession(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const dailySessionStorage = new LocalStorageDailySessionStorage();
