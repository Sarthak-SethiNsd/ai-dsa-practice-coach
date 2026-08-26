import {
  PracticeSession,
  PracticeSessionHistoryItem,
  PracticeSessionStatus,
} from "./practiceTypes";

const ACTIVE_SESSION_KEY = "dsa_active_practice_session";
const SESSION_HISTORY_KEY = "dsa_practice_session_history";
const MAX_HISTORY = 100;

function isClient(): boolean {
  return typeof window !== "undefined" || typeof localStorage !== "undefined";
}

// ─── Active Session Persistence ───────────────────────────────────────────────

export function saveActiveSession(session: PracticeSession): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error("[practiceSessionStorage] Failed to save active session:", err);
  }
}

export function loadActiveSession(): PracticeSession | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PracticeSession;
    // Only restore if the session is in a resumable state
    if (
      parsed.status === "ACTIVE" ||
      parsed.status === "PAUSED" ||
      parsed.status === "NOT_STARTED"
    ) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error("[practiceSessionStorage] Failed to load active session:", err);
    return null;
  }
}

export function clearActiveSession(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (err) {
    console.error("[practiceSessionStorage] Failed to clear active session:", err);
  }
}

// ─── Timer State Helpers ──────────────────────────────────────────────────────

/**
 * Computes remaining seconds from timestamps.
 * Uses startedAt, totalPausedMs, lastPausedAt, and status
 * so a refresh never corrupts the timer.
 */
export function computeRemainingSeconds(session: PracticeSession): number {
  const totalDurationMs = session.durationMinutes * 60 * 1000;
  const now = Date.now();

  if (session.status === "PAUSED" && session.lastPausedAt) {
    // Paused: elapsed = (pausedAt - startedAt) - alreadyPausedMs
    const pausedAt = new Date(session.lastPausedAt).getTime();
    const startedAt = new Date(session.timerStartedAt).getTime();
    const activeMsBeforePause = pausedAt - startedAt - session.totalPausedMs;
    const remainingMs = totalDurationMs - Math.max(0, activeMsBeforePause);
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  // Active: elapsed = (now - startedAt) - totalPausedMs
  const startedAt = new Date(session.timerStartedAt).getTime();
  const elapsedActiveMs = now - startedAt - session.totalPausedMs;
  const remainingMs = totalDurationMs - Math.max(0, elapsedActiveMs);
  return Math.max(0, Math.floor(remainingMs / 1000));
}

export function computeElapsedSeconds(session: PracticeSession): number {
  const totalDurationMs = session.durationMinutes * 60 * 1000;
  const remaining = computeRemainingSeconds(session);
  return Math.floor(totalDurationMs / 1000) - remaining;
}

// ─── Session History ──────────────────────────────────────────────────────────

export function getSessionHistory(): PracticeSessionHistoryItem[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessionToHistory(item: PracticeSessionHistoryItem): void {
  if (!isClient()) return;
  try {
    const existing = getSessionHistory();
    // Prevent duplicates
    const filtered = existing.filter((h) => h.sessionId !== item.sessionId);
    const updated = [item, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("[practiceSessionStorage] Failed to save session history:", err);
  }
}

export function getSessionFromHistory(sessionId: string): PracticeSessionHistoryItem | null {
  const history = getSessionHistory();
  return history.find((h) => h.sessionId === sessionId) ?? null;
}

export function clearSessionHistory(): void {
  if (!isClient()) return;
  localStorage.removeItem(SESSION_HISTORY_KEY);
}

// ─── Expired Session Handling ─────────────────────────────────────────────────

/**
 * Checks if a loaded active session is already expired (time ran out while away).
 */
export function isSessionExpired(session: PracticeSession): boolean {
  if (session.status === "COMPLETED" || session.status === "ABANDONED" || session.status === "EXPIRED") {
    return true;
  }
  const remaining = computeRemainingSeconds(session);
  return remaining <= 0;
}

/**
 * Marks session status as EXPIRED in storage and returns the updated session.
 */
export function expireSession(session: PracticeSession): PracticeSession {
  const expired: PracticeSession = {
    ...session,
    status: "EXPIRED" as PracticeSessionStatus,
    endedAt: new Date().toISOString(),
  };
  saveActiveSession(expired);
  return expired;
}
