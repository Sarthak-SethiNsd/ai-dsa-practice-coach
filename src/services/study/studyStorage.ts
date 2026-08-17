import {
  CompletedStudySession,
  StudyStreakData,
  AdaptivePracticeSignal,
} from "./studyTypes";

const SESSIONS_KEY = "dsa_study_sessions";
const STREAK_KEY = "dsa_study_streak";
const ADAPTIVE_SIGNAL_KEY = "dsa_adaptive_signal";

function getOffsetDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function buildSeedStudySessions(): CompletedStudySession[] {
  const date0 = getOffsetDateStr(0);
  const date1 = getOffsetDateStr(1);
  const date2 = getOffsetDateStr(2);
  const date4 = getOffsetDateStr(4);
  const date6 = getOffsetDateStr(6);

  return [
    {
      id: "study_seed_1",
      date: date0,
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: 30,
      actualTimeSpentSeconds: 1650,
      focusCategory: "balanced",
      tasks: [
        {
          id: "st_1",
          problemId: 1,
          title: "Two Sum",
          platform: "leetcode",
          difficulty: "Easy",
          topics: ["Arrays", "Hash Table"],
          estimatedMinutes: 10,
          taskType: "due_revision",
          status: "solved",
          timeSpentSeconds: 480,
        },
        {
          id: "st_2",
          problemId: 15,
          title: "3Sum",
          platform: "leetcode",
          difficulty: "Medium",
          topics: ["Arrays", "Two Pointers"],
          estimatedMinutes: 20,
          taskType: "weak_topic",
          status: "solved",
          timeSpentSeconds: 1170,
        },
      ],
      attemptedCount: 2,
      solvedCount: 2,
      failedCount: 0,
      skippedCount: 0,
      avgTimePerProblemSeconds: 825,
      topicDistribution: { Arrays: 2, "Hash Table": 1, "Two Pointers": 1 },
      difficultyDistribution: { Easy: 1, Medium: 1, Hard: 0 },
      revisionSuccessRatePct: 100,
      completionRatePct: 100,
      adaptiveSignal: {
        difficultyAdjustment: "maintain",
        targetFocusTopics: ["Arrays"],
        nextRecommendedDurationMinutes: 30,
        confidenceModifier: 5,
        reason: "Strong performance on current difficulty tier.",
      },
      coachSummary: {
        strengthsNoticed: ["Fast active recall on Easy revision", "Optimal two-pointer logic"],
        weaknessesNoticed: [],
        pacingFeedback: "Pacing was well balanced across both problems.",
        nextSessionRecommendation: "Try a 45-minute session targeting Medium/Hard DP problems.",
      },
    },
    {
      id: "study_seed_2",
      date: date1,
      startedAt: new Date(Date.now() - 86400000 - 2700000).toISOString(),
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      durationMinutes: 45,
      actualTimeSpentSeconds: 2400,
      focusCategory: "weak_topics",
      tasks: [
        {
          id: "st_3",
          problemId: 2,
          title: "Dijkstra's Shortest Path",
          platform: "codeforces",
          difficulty: "Medium",
          topics: ["Graphs", "Heaps"],
          estimatedMinutes: 25,
          taskType: "weak_topic",
          status: "solved",
          timeSpentSeconds: 1400,
        },
        {
          id: "st_4",
          problemId: 200,
          title: "Number of Islands",
          platform: "leetcode",
          difficulty: "Medium",
          topics: ["Graphs", "BFS"],
          estimatedMinutes: 20,
          taskType: "ai_recommendation",
          status: "solved",
          timeSpentSeconds: 1000,
        },
      ],
      attemptedCount: 2,
      solvedCount: 2,
      failedCount: 0,
      skippedCount: 0,
      avgTimePerProblemSeconds: 1200,
      topicDistribution: { Graphs: 2, Heaps: 1, BFS: 1 },
      difficultyDistribution: { Easy: 0, Medium: 2, Hard: 0 },
      revisionSuccessRatePct: 100,
      completionRatePct: 100,
      adaptiveSignal: {
        difficultyAdjustment: "increase",
        targetFocusTopics: ["Graphs"],
        nextRecommendedDurationMinutes: 45,
        confidenceModifier: 8,
        reason: "100% Graph problem solve rate with high time efficiency.",
      },
      coachSummary: {
        strengthsNoticed: ["Excellent graph traversal implementation"],
        weaknessesNoticed: [],
        pacingFeedback: "Solved both Graph problems ahead of time estimates.",
        nextSessionRecommendation: "Introduce Hard Graph algorithms like Tarjan or Floyd-Warshall.",
      },
    },
    {
      id: "study_seed_3",
      date: date2,
      startedAt: new Date(Date.now() - 172800000 - 1800000).toISOString(),
      completedAt: new Date(Date.now() - 172800000).toISOString(),
      durationMinutes: 30,
      actualTimeSpentSeconds: 1750,
      focusCategory: "revision",
      tasks: [
        {
          id: "st_5",
          problemId: 53,
          title: "Maximum Subarray",
          platform: "leetcode",
          difficulty: "Medium",
          topics: ["Dynamic Programming"],
          estimatedMinutes: 15,
          taskType: "overdue_revision",
          status: "solved",
          timeSpentSeconds: 950,
        },
        {
          id: "st_6",
          problemId: 70,
          title: "Climbing Stairs",
          platform: "leetcode",
          difficulty: "Easy",
          topics: ["Dynamic Programming"],
          estimatedMinutes: 15,
          taskType: "due_revision",
          status: "solved",
          timeSpentSeconds: 800,
        },
      ],
      attemptedCount: 2,
      solvedCount: 2,
      failedCount: 0,
      skippedCount: 0,
      avgTimePerProblemSeconds: 875,
      topicDistribution: { "Dynamic Programming": 2 },
      difficultyDistribution: { Easy: 1, Medium: 1, Hard: 0 },
      revisionSuccessRatePct: 100,
      completionRatePct: 100,
      adaptiveSignal: {
        difficultyAdjustment: "maintain",
        targetFocusTopics: ["Dynamic Programming"],
        nextRecommendedDurationMinutes: 30,
        confidenceModifier: 4,
        reason: "Solid SRS revision execution.",
      },
      coachSummary: {
        strengthsNoticed: ["Clean Kadane's algorithm implementation"],
        weaknessesNoticed: [],
        pacingFeedback: "Pacing was on target.",
        nextSessionRecommendation: "Continue with scheduled SRS revisions.",
      },
    },
    {
      id: "study_seed_4",
      date: date4,
      startedAt: new Date(Date.now() - 345600000 - 2700000).toISOString(),
      completedAt: new Date(Date.now() - 345600000).toISOString(),
      durationMinutes: 45,
      actualTimeSpentSeconds: 2600,
      focusCategory: "contest_prep",
      tasks: [
        {
          id: "st_7",
          problemId: 99,
          title: "Codeforces Div. 2 Problem C",
          platform: "codeforces",
          difficulty: "Hard",
          topics: ["Math", "Greedy"],
          estimatedMinutes: 30,
          taskType: "contest_requirement",
          status: "failed",
          timeSpentSeconds: 1800,
        },
        {
          id: "st_8",
          problemId: 100,
          title: "Codeforces Div. 2 Problem B",
          platform: "codeforces",
          difficulty: "Medium",
          topics: ["Binary Search"],
          estimatedMinutes: 15,
          taskType: "contest_requirement",
          status: "solved",
          timeSpentSeconds: 800,
        },
      ],
      attemptedCount: 2,
      solvedCount: 1,
      failedCount: 1,
      skippedCount: 0,
      avgTimePerProblemSeconds: 1300,
      topicDistribution: { Math: 1, Greedy: 1, "Binary Search": 1 },
      difficultyDistribution: { Easy: 0, Medium: 1, Hard: 1 },
      revisionSuccessRatePct: 0,
      completionRatePct: 50,
      adaptiveSignal: {
        difficultyAdjustment: "maintain",
        targetFocusTopics: ["Math", "Greedy"],
        nextRecommendedDurationMinutes: 30,
        confidenceModifier: -2,
        reason: "Hard contest problem failed; practice Medium variants first.",
      },
      coachSummary: {
        strengthsNoticed: ["Fast binary search solve"],
        weaknessesNoticed: ["Math/Greedy problem logic overflow"],
        pacingFeedback: "Spent 30 mins on Hard problem without breakthrough.",
        nextSessionRecommendation: "Review Math/Greedy takeaways before next contest.",
      },
    },
    {
      id: "study_seed_5",
      date: date6,
      startedAt: new Date(Date.now() - 518400000 - 1800000).toISOString(),
      completedAt: new Date(Date.now() - 518400000).toISOString(),
      durationMinutes: 30,
      actualTimeSpentSeconds: 1700,
      focusCategory: "roadmap_progress",
      tasks: [
        {
          id: "st_9",
          problemId: 101,
          title: "Binary Tree Level Order Traversal",
          platform: "leetcode",
          difficulty: "Medium",
          topics: ["Trees", "BFS"],
          estimatedMinutes: 15,
          taskType: "roadmap_priority",
          status: "solved",
          timeSpentSeconds: 900,
        },
        {
          id: "st_10",
          problemId: 102,
          title: "Invert Binary Tree",
          platform: "leetcode",
          difficulty: "Easy",
          topics: ["Trees", "DFS"],
          estimatedMinutes: 15,
          taskType: "roadmap_priority",
          status: "solved",
          timeSpentSeconds: 800,
        },
      ],
      attemptedCount: 2,
      solvedCount: 2,
      failedCount: 0,
      skippedCount: 0,
      avgTimePerProblemSeconds: 850,
      topicDistribution: { Trees: 2, BFS: 1, DFS: 1 },
      difficultyDistribution: { Easy: 1, Medium: 1, Hard: 0 },
      revisionSuccessRatePct: 100,
      completionRatePct: 100,
      adaptiveSignal: {
        difficultyAdjustment: "maintain",
        targetFocusTopics: ["Trees"],
        nextRecommendedDurationMinutes: 30,
        confidenceModifier: 5,
        reason: "Roadmap Tree mission completed smoothly.",
      },
      coachSummary: {
        strengthsNoticed: ["Clean tree recursion"],
        weaknessesNoticed: [],
        pacingFeedback: "Consistent pacing.",
        nextSessionRecommendation: "Move to Binary Search Tree validation problems.",
      },
    },
  ];
}

function buildSeedStreak(): StudyStreakData {
  return {
    currentStreak: 3,
    longestStreak: 7,
    totalSessionsCompleted: 5,
    totalStudyMinutes: 180,
    lastCompletedDate: getOffsetDateStr(0),
    weeklyConsistency: {
      Mon: true,
      Tue: true,
      Wed: true,
      Thu: false,
      Fri: true,
      Sat: true,
      Sun: false,
    },
  };
}

export interface StudyStorageProvider {
  getSessions(): Promise<CompletedStudySession[]>;
  saveSessions(sessions: CompletedStudySession[]): Promise<void>;
  addSession(session: CompletedStudySession): Promise<CompletedStudySession>;
  deleteSession(id: string): Promise<boolean>;
  getStreak(): Promise<StudyStreakData>;
  saveStreak(streak: StudyStreakData): Promise<void>;
  recordCompletedSession(session: CompletedStudySession): Promise<{
    session: CompletedStudySession;
    streak: StudyStreakData;
  }>;
  getAdaptiveSignal(): Promise<AdaptivePracticeSignal | null>;
  saveAdaptiveSignal(signal: AdaptivePracticeSignal): Promise<void>;
}

export class LocalStorageStudyStorage implements StudyStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  // ── Sessions ──────────────────────────────────────────────────────────────

  private loadRawSessions(): CompletedStudySession[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[StudyStorage] Load sessions failed:", e);
      return [];
    }
  }

  private saveRawSessions(sessions: CompletedStudySession[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  async getSessions(): Promise<CompletedStudySession[]> {
    const sessions = this.loadRawSessions();
    if (sessions.length === 0) {
      const seed = buildSeedStudySessions();
      this.saveRawSessions(seed);
      return seed;
    }
    return sessions.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async saveSessions(sessions: CompletedStudySession[]): Promise<void> {
    this.saveRawSessions(sessions);
  }

  async addSession(session: CompletedStudySession): Promise<CompletedStudySession> {
    const sessions = await this.getSessions();
    const updated = [session, ...sessions];
    this.saveRawSessions(updated);
    return session;
  }

  async deleteSession(id: string): Promise<boolean> {
    const sessions = await this.getSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length === sessions.length) return false;
    this.saveRawSessions(filtered);
    return true;
  }

  // ── Streak ────────────────────────────────────────────────────────────────

  private loadRawStreak(): StudyStreakData | null {
    if (!this.isClient()) return null;
    try {
      const raw = localStorage.getItem(STREAK_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("[StudyStorage] Load streak failed:", e);
      return null;
    }
  }

  private saveRawStreak(streak: StudyStreakData): void {
    if (!this.isClient()) return;
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }

  async getStreak(): Promise<StudyStreakData> {
    const streak = this.loadRawStreak();
    if (!streak) {
      const seed = buildSeedStreak();
      this.saveRawStreak(seed);
      return seed;
    }
    return streak;
  }

  async saveStreak(streak: StudyStreakData): Promise<void> {
    this.saveRawStreak(streak);
  }

  // ── Record Completed Session & Update Streak ──────────────────────────────

  async recordCompletedSession(session: CompletedStudySession): Promise<{
    session: CompletedStudySession;
    streak: StudyStreakData;
  }> {
    await this.addSession(session);
    const streak = await this.getStreak();

    const todayStr = session.date;
    const lastDate = streak.lastCompletedDate;

    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;

    if (lastDate !== todayStr) {
      const yesterdayStr = getOffsetDateStr(1);
      if (lastDate === yesterdayStr) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    const updatedStreak: StudyStreakData = {
      ...streak,
      currentStreak,
      longestStreak,
      totalSessionsCompleted: streak.totalSessionsCompleted + 1,
      totalStudyMinutes: streak.totalStudyMinutes + session.durationMinutes,
      lastCompletedDate: todayStr,
    };

    this.saveRawStreak(updatedStreak);
    if (session.adaptiveSignal) {
      await this.saveAdaptiveSignal(session.adaptiveSignal);
    }

    return { session, streak: updatedStreak };
  }

  // ── Adaptive Signal ────────────────────────────────────────────────────────

  async getAdaptiveSignal(): Promise<AdaptivePracticeSignal | null> {
    if (!this.isClient()) return null;
    try {
      const raw = localStorage.getItem(ADAPTIVE_SIGNAL_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("[StudyStorage] Load adaptive signal failed:", e);
      return null;
    }
  }

  async saveAdaptiveSignal(signal: AdaptivePracticeSignal): Promise<void> {
    if (!this.isClient()) return;
    localStorage.setItem(ADAPTIVE_SIGNAL_KEY, JSON.stringify(signal));
  }
}

export const studyStorage = new LocalStorageStudyStorage();
