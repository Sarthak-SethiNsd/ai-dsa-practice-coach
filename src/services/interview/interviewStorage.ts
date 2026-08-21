import {
  InterviewHistoryRecord,
  AIInterviewReport,
  InterviewSession,
  InterviewReadinessProfile,
} from "./interviewTypes";
import { computeReadinessTier } from "./interviewScoring";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const HISTORY_KEY = "dsa_mock_interview_history";
const REPORTS_KEY_PREFIX = "dsa_mock_interview_report_";
const ACTIVE_SESSION_KEY = "dsa_mock_interview_active_session";

// ─── Seed Data ───────────────────────────────────────────────────────────────

function buildSeedHistory(): InterviewHistoryRecord[] {
  const now = new Date();
  const daysAgo = (d: number) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    return dt.toISOString().split("T")[0];
  };

  return [
    {
      id: "interview_seed_1",
      date: daysAgo(5),
      interviewType: "Arrays & Strings",
      difficulty: "Medium",
      style: "Standard",
      durationMinutes: 45,
      actualDurationMinutes: 38,
      questionsAttempted: 1,
      questionsCompleted: 1,
      overallScore: 84,
      readinessTier: "Strong",
      mainStrengths: [
        "Proactively verified constraints and edge assumptions.",
        "Articulated two-pointer strategy before coding.",
        "Accurately stated O(N) time and O(1) space complexities.",
      ],
      mainWeaknesses: [
        "Unlocked 1 conceptual hint during edge case discovery.",
        "Could expand more on memory scalability trade-offs.",
      ],
      hintCount: 1,
      status: "completed",
      reportSummary: {
        communicationScore: 88,
        complexityScore: 92,
        algorithmScore: 85,
        edgeCaseScore: 80,
      },
    },
    {
      id: "interview_seed_2",
      date: daysAgo(12),
      interviewType: "Dynamic Programming",
      difficulty: "Medium",
      style: "Coaching",
      durationMinutes: 45,
      actualDurationMinutes: 42,
      questionsAttempted: 1,
      questionsCompleted: 1,
      overallScore: 72,
      readinessTier: "Interview Ready",
      mainStrengths: [
        "Correctly formulated grid DP recurrence relation.",
        "Clean tabular implementation structure.",
      ],
      mainWeaknesses: [
        "Relied on level-2 approach hint for base case initialization.",
        "Did not discuss 1D space optimization in follow-up.",
      ],
      hintCount: 2,
      status: "completed",
      reportSummary: {
        communicationScore: 75,
        complexityScore: 78,
        algorithmScore: 74,
        edgeCaseScore: 68,
      },
    },
  ];
}

// ─── Storage Interface ────────────────────────────────────────────────────────

export interface InterviewStorageProvider {
  getHistory(): Promise<InterviewHistoryRecord[]>;
  saveHistoryRecord(record: InterviewHistoryRecord): Promise<void>;
  getReport(interviewId: string): Promise<AIInterviewReport | null>;
  saveReport(report: AIInterviewReport): Promise<void>;
  getActiveSession(): Promise<InterviewSession | null>;
  saveActiveSession(session: InterviewSession): Promise<void>;
  clearActiveSession(): Promise<void>;
  getReadinessProfile(): Promise<InterviewReadinessProfile>;
  clearAll(): Promise<void>;
}

// ─── LocalStorage Implementation ──────────────────────────────────────────────

export class LocalStorageInterviewStorage implements InterviewStorageProvider {
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
      console.error(`[InterviewStorage] Read failed for key: ${key}`, e);
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[InterviewStorage] Write failed for key: ${key}`, e);
    }
  }

  async getHistory(): Promise<InterviewHistoryRecord[]> {
    const history = this.read<InterviewHistoryRecord[]>(HISTORY_KEY);
    if (!history || history.length === 0) {
      const seed = buildSeedHistory();
      this.write(HISTORY_KEY, seed);
      return seed;
    }
    return history;
  }

  async saveHistoryRecord(record: InterviewHistoryRecord): Promise<void> {
    const history = await this.getHistory();
    const filtered = history.filter((h) => h.id !== record.id);
    const updated = [record, ...filtered];
    this.write(HISTORY_KEY, updated);
  }

  async getReport(interviewId: string): Promise<AIInterviewReport | null> {
    return this.read<AIInterviewReport>(`${REPORTS_KEY_PREFIX}${interviewId}`);
  }

  async saveReport(report: AIInterviewReport): Promise<void> {
    this.write(`${REPORTS_KEY_PREFIX}${report.interviewId}`, report);
  }

  async getActiveSession(): Promise<InterviewSession | null> {
    return this.read<InterviewSession>(ACTIVE_SESSION_KEY);
  }

  async saveActiveSession(session: InterviewSession): Promise<void> {
    this.write(ACTIVE_SESSION_KEY, session);
  }

  async clearActiveSession(): Promise<void> {
    if (!this.isClient()) return;
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }

  async getReadinessProfile(): Promise<InterviewReadinessProfile> {
    const history = await this.getHistory();
    const completed = history.filter((h) => h.status === "completed");

    if (completed.length === 0) {
      return {
        overallScore: 50,
        tier: "Developing",
        tierDescription: "Complete your first mock interview to benchmark your baseline readiness.",
        dimensionsSummary: {
          problemSolving: 50,
          communication: 50,
          complexityAnalysis: 50,
          edgeCaseDetection: 50,
          cleanCoding: 50,
          independence: 50,
        },
        keyWeaknesses: ["No interview records yet"],
        recommendedFocus: "Start with an Easy/Medium General DSA mock interview",
        interviewsCount: 0,
        lastInterviewDate: null,
      };
    }

    const avgScore = Math.round(
      completed.reduce((acc, h) => acc + h.overallScore, 0) / completed.length
    );
    const { tier, description: tierDescription } = computeReadinessTier(avgScore);

    // Compute average dimension scores
    let commSum = 0, compSum = 0, algoSum = 0, edgeSum = 0;
    completed.forEach((h) => {
      commSum += h.reportSummary?.communicationScore ?? h.overallScore;
      compSum += h.reportSummary?.complexityScore ?? h.overallScore;
      algoSum += h.reportSummary?.algorithmScore ?? h.overallScore;
      edgeSum += h.reportSummary?.edgeCaseScore ?? h.overallScore;
    });

    const count = completed.length;
    const allWeaknesses = completed.flatMap((h) => h.mainWeaknesses);
    const uniqueWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 3);

    return {
      overallScore: avgScore,
      tier,
      tierDescription,
      dimensionsSummary: {
        problemSolving: Math.round(algoSum / count),
        communication: Math.round(commSum / count),
        complexityAnalysis: Math.round(compSum / count),
        edgeCaseDetection: Math.round(edgeSum / count),
        cleanCoding: Math.round(avgScore),
        independence: Math.max(30, 100 - Math.round((completed.reduce((a, b) => a + b.hintCount, 0) / count) * 15)),
      },
      keyWeaknesses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ["Sharpen boundary testing speed"],
      recommendedFocus: tier === "Advanced" ? "Practice hard system-level follow-ups" : tier === "Strong" ? "Dynamic Programming & Tree edge cases" : "Arrays & Strings think-aloud pacing",
      interviewsCount: completed.length,
      lastInterviewDate: completed[0]?.date || null,
    };
  }

  async clearAll(): Promise<void> {
    if (!this.isClient()) return;
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const interviewStorage = new LocalStorageInterviewStorage();
