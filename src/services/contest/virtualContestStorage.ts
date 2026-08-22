import {
  VCSession,
  VCHistoryRecord,
  VCContestReport,
  VCReadinessProfile,
} from "./virtualContestTypes";
import { computeReadinessProfile } from "./virtualContestScoring";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const ACTIVE_SESSION_KEY = "dsa_virtual_contest_active_session";
const HISTORY_KEY = "dsa_virtual_contest_history";
const REPORT_KEY_PREFIX = "dsa_virtual_contest_report_";
const READINESS_KEY = "dsa_virtual_contest_readiness";

// ─── Seed Data ───────────────────────────────────────────────────────────────

function buildSeedHistory(): VCHistoryRecord[] {
  const now = new Date();
  const daysAgo = (d: number) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    return dt.toISOString().split("T")[0];
  };

  return [
    {
      id: "vcontest_seed_1",
      date: daysAgo(4),
      platform: "mixed",
      contestType: "Standard",
      durationMinutes: 60,
      problemCount: 3,
      problemsSolved: 2,
      score: 790,
      accuracy: 85,
      avgSolveTimeSeconds: 1240,
      mainStrengths: [
        "Quickly solved Problem A (Easy) in 12 minutes with 0 failed attempts.",
        "Demonstrated strong two-pointer technique on Problem B.",
      ],
      mainWeaknesses: [
        "Ran out of time on Problem C (Hard Dynamic Programming).",
        "Could practice prefix-sum optimizations to accelerate initial passes.",
      ],
      status: "completed",
    },
    {
      id: "vcontest_seed_2",
      date: daysAgo(11),
      platform: "leetcode",
      contestType: "Weak Topic Drill",
      durationMinutes: 45,
      problemCount: 2,
      problemsSolved: 2,
      score: 680,
      accuracy: 100,
      avgSolveTimeSeconds: 980,
      mainStrengths: [
        "Clean 100% accuracy with zero penalty deductions.",
        "Accurate time complexity breakdown and edge-case testing.",
      ],
      mainWeaknesses: [
        "Slightly hesitated on the binary search upper bound condition.",
      ],
      status: "completed",
    },
    {
      id: "vcontest_seed_3",
      date: daysAgo(18),
      platform: "codeforces",
      contestType: "Rating Challenge",
      durationMinutes: 60,
      problemCount: 4,
      problemsSolved: 3,
      score: 1120,
      accuracy: 75,
      avgSolveTimeSeconds: 1100,
      mainStrengths: [
        "Strong greedy problem solving on Problems A & B.",
        "High pace under simulated contest pressure.",
      ],
      mainWeaknesses: [
        "2 failed submissions on Problem C due to integer overflow boundary.",
      ],
      status: "completed",
    },
  ];
}

// ─── Storage Layer Interface ──────────────────────────────────────────────────

export function saveActiveSession(session: VCSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error("[virtualContestStorage] Failed to save active session:", err);
  }
}

export function loadActiveSession(): VCSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VCSession;
  } catch (err) {
    console.error("[virtualContestStorage] Failed to load active session:", err);
    return null;
  }
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (err) {
    console.error("[virtualContestStorage] Failed to clear active session:", err);
  }
}

export function saveContestReport(report: VCContestReport): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REPORT_KEY_PREFIX + report.id, JSON.stringify(report));
  } catch (err) {
    console.error("[virtualContestStorage] Failed to save contest report:", err);
  }
}

export function loadContestReport(id: string): VCContestReport | null {
  if (typeof window === "undefined") return null;
  try {
    const key = id.startsWith(REPORT_KEY_PREFIX) ? id : REPORT_KEY_PREFIX + id;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as VCContestReport;
  } catch (err) {
    console.error("[virtualContestStorage] Failed to load contest report:", err);
    return null;
  }
}

export function getContestHistory(): VCHistoryRecord[] {
  if (typeof window === "undefined") return buildSeedHistory();
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      const seed = buildSeedHistory();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as VCHistoryRecord[];
  } catch (err) {
    console.error("[virtualContestStorage] Failed to get contest history:", err);
    return buildSeedHistory();
  }
}

export function appendHistoryRecord(record: VCHistoryRecord): void {
  if (typeof window === "undefined") return;
  try {
    const history = getContestHistory();
    const updated = [record, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    // Also update readiness profile
    const profile = computeReadinessProfile(updated);
    saveReadinessProfile(profile);
  } catch (err) {
    console.error("[virtualContestStorage] Failed to append history record:", err);
  }
}

export function saveReadinessProfile(profile: VCReadinessProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READINESS_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("[virtualContestStorage] Failed to save readiness profile:", err);
  }
}

export function loadReadinessProfile(): VCReadinessProfile {
  if (typeof window === "undefined") {
    const seed = buildSeedHistory();
    return computeReadinessProfile(seed);
  }
  try {
    const raw = localStorage.getItem(READINESS_KEY);
    if (!raw) {
      const history = getContestHistory();
      const profile = computeReadinessProfile(history);
      saveReadinessProfile(profile);
      return profile;
    }
    return JSON.parse(raw) as VCReadinessProfile;
  } catch (err) {
    console.error("[virtualContestStorage] Failed to load readiness profile:", err);
    const history = getContestHistory();
    return computeReadinessProfile(history);
  }
}
