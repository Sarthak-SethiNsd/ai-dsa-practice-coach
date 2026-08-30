import {
  LongitudinalEvent,
  PerformanceWindow,
  PERFORMANCE_WINDOW_CONFIGS,
} from "./performanceTypes";
import { getSessionHistory, loadActiveSession } from "@/services/practice/practiceSessionStorage";
import { getRecommendationHistory } from "@/services/recommendations/recommendationHistory";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { getStoredSkillNodes } from "@/services/learningGraph/learningGraphStorage";
import { getContestHistory } from "@/services/contest/virtualContestStorage";
import { interviewStorage } from "@/services/interview/interviewStorage";
import { getActiveGoal, getPreparationGoals } from "@/services/preparation/preparationStorage";
import { studyStorage } from "@/services/study/studyStorage";
import { Difficulty, Platform } from "@/services/types";
import { mapTopicsToPattern } from "@/services/recommendations/recommendationFilters";

// ─── Unified Data Aggregation ─────────────────────────────────────────────────

export interface AggregatedDataSet {
  allEvents: LongitudinalEvent[];
  currentPeriodEvents: LongitudinalEvent[];
  previousPeriodEvents: LongitudinalEvent[];
  windowStartDate: string;
  windowEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
  totalPracticeMinutes: number;
}

function getDaysAgoDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function aggregateLongitudinalData(
  window: PerformanceWindow
): Promise<AggregatedDataSet> {
  const config = PERFORMANCE_WINDOW_CONFIGS[window];
  const now = new Date();
  const windowDays = config.days;

  const currentStartDate = getDaysAgoDate(windowDays);
  const previousStartDate = getDaysAgoDate(windowDays * 2);
  const previousEndDate = currentStartDate;

  const events: LongitudinalEvent[] = [];

  // 1. Practice Sessions History & Outcomes
  try {
    const practiceHistory = getSessionHistory();
    practiceHistory.forEach((session, sIdx) => {
      const sessionDate = session.date;
      const ts = new Date(sessionDate).toISOString();
      const actualSec = session.actualDurationSeconds || session.durationMinutes * 60;
      const avgSolveSec = session.problemsAttempted > 0
        ? Math.round(actualSec / session.problemsAttempted)
        : 1200;

      // Create an event for each problem in this session
      for (let i = 0; i < session.problemsAttempted; i++) {
        const isSolved = i < session.problemsSolved;
        events.push({
          id: `pe_ps_${session.sessionId}_${i}`,
          source: "PRACTICE_SESSION",
          timestamp: ts,
          date: sessionDate,
          title: `${session.primarySkill} Problem ${i + 1}`,
          platform: "leetcode",
          difficulty: i === 0 ? "Easy" : i === 1 ? "Medium" : "Hard",
          topics: [session.primarySkill],
          primaryPattern: session.primaryPattern || "General",
          outcome: isSolved ? "SOLVED_INDEPENDENTLY" : "FAILED",
          solveTimeSeconds: isSolved ? avgSolveSec : undefined,
          estimatedTimeSeconds: 1200,
          hintCount: 0,
          score: session.score?.overallScore ?? 75,
          sessionId: session.sessionId,
        });
      }
    });

    // Also check currently active session if present
    const activeSession = loadActiveSession();
    if (activeSession && activeSession.outcomes.length > 0) {
      activeSession.outcomes.forEach((outcome, oIdx) => {
        const p = activeSession.plannedProblems.find((pr) => pr.problemId === outcome.problemId);
        events.push({
          id: `pe_active_${activeSession.sessionId}_${oIdx}`,
          source: "PRACTICE_SESSION",
          timestamp: outcome.timestamp,
          date: outcome.timestamp.split("T")[0],
          problemId: outcome.problemId,
          title: p?.title ?? `Problem ${outcome.problemId}`,
          platform: p?.platform ?? "leetcode",
          difficulty: p?.difficulty ?? "Medium",
          topics: p?.topics ?? ["General"],
          primaryPattern: p?.primaryPattern ?? "General",
          outcome: outcome.outcomeType === "ABANDONED" ? "FAILED" : outcome.outcomeType,
          solveTimeSeconds: outcome.actualSolveTimeSeconds,
          estimatedTimeSeconds: outcome.estimatedSolveTimeSeconds,
          hintCount: outcome.hintCount,
          sessionId: activeSession.sessionId,
        });
      });
    }
  } catch (err) {
    console.error("[performanceAggregation] Practice sessions load error:", err);
  }

  // 2. Recommendation History
  try {
    const recHistory = getRecommendationHistory();
    recHistory.forEach((rec, rIdx) => {
      let outcome: LongitudinalEvent["outcome"] = "COMPLETED";
      if (rec.action === "solved_independently") outcome = "SOLVED_INDEPENDENTLY";
      else if (rec.action === "solved_with_hints") outcome = "SOLVED_WITH_HINTS";
      else if (rec.action === "failed") outcome = "FAILED";
      else if (rec.action === "skipped" || rec.action === "dismissed") outcome = "SKIPPED";
      else if (rec.action === "solved") outcome = "SOLVED_INDEPENDENTLY";

      const primaryPattern = rec.targetPattern || mapTopicsToPattern(rec.topics);

      events.push({
        id: `pe_rec_${rec.id || rIdx}`,
        source: "RECOMMENDATION",
        timestamp: rec.timestamp,
        date: rec.timestamp.split("T")[0],
        problemId: rec.problemId,
        title: rec.title,
        platform: rec.platform,
        difficulty: rec.difficulty,
        topics: rec.topics,
        primaryPattern,
        outcome,
        solveTimeSeconds: rec.difficulty === "Easy" ? 600 : rec.difficulty === "Medium" ? 1400 : 2400,
        estimatedTimeSeconds: rec.difficulty === "Easy" ? 900 : rec.difficulty === "Medium" ? 1800 : 2700,
        hintCount: rec.action === "solved_with_hints" ? 2 : 0,
        score: rec.recommendationScore,
      });
    });
  } catch (err) {
    console.error("[performanceAggregation] Recommendation history load error:", err);
  }

  // 3. Spaced Repetition (SRS)
  try {
    const srsItems = await revisionStorage.getItems();
    srsItems.forEach((item) => {
      item.history.forEach((hist, hIdx) => {
        const isSuccess = hist.feedback === "remembered" || hist.feedback === "easy";

        events.push({
          id: `pe_srs_${item.id}_${hIdx}`,
          source: "SRS_REVISION",
          timestamp: new Date(hist.revisedAt).toISOString(),
          date: hist.revisedAt.split("T")[0],
          problemId: item.problemId,
          title: item.problemTitle,
          platform: item.platform,
          difficulty: item.difficulty,
          topics: item.topics,
          primaryPattern: mapTopicsToPattern(item.topics),
          outcome: isSuccess
            ? (hist.feedback === "easy" ? "SOLVED_INDEPENDENTLY" : "SOLVED_WITH_HINTS")
            : "FAILED",
          solveTimeSeconds: hist.feedback === "easy" ? 480 : hist.feedback === "remembered" ? 900 : 1800,
          estimatedTimeSeconds: 1200,
          hintCount: hist.feedback === "hard" ? 2 : 0,
          score: hist.aiScore ?? hist.memoryStrengthAfter,
          isRevision: true,
        });
      });
    });
  } catch (err) {
    console.error("[performanceAggregation] SRS items load error:", err);
  }

  // 4. Virtual Contest History
  try {
    const contests = getContestHistory();
    contests.forEach((c) => {
      const ts = new Date(c.date).toISOString();
      const avgSec = c.avgSolveTimeSeconds || 1200;

      for (let i = 0; i < c.problemCount; i++) {
        const isSolved = i < c.problemsSolved;
        const diff: Difficulty = i === 0 ? "Easy" : i === 1 ? "Medium" : "Hard";
        events.push({
          id: `pe_contest_${c.id}_${i}`,
          source: "VIRTUAL_CONTEST",
          timestamp: ts,
          date: c.date,
          title: `Contest ${c.contestType} Problem ${String.fromCharCode(65 + i)}`,
          platform: c.platform === "mixed" ? "leetcode" : c.platform,
          difficulty: diff,
          topics: i === 0 ? ["Arrays"] : i === 1 ? ["Binary Search", "Two Pointers"] : ["Dynamic Programming", "Graphs"],
          primaryPattern: i === 0 ? "Arrays" : i === 1 ? "Two Pointers" : "Dynamic Programming",
          outcome: isSolved ? "SOLVED_INDEPENDENTLY" : "FAILED",
          solveTimeSeconds: isSolved ? avgSec : undefined,
          estimatedTimeSeconds: diff === "Easy" ? 900 : diff === "Medium" ? 1800 : 2700,
          hintCount: 0,
          score: c.score,
          sessionId: c.id,
        });
      }
    });
  } catch (err) {
    console.error("[performanceAggregation] Contest history load error:", err);
  }

  // 5. Mock Interview History
  try {
    const interviews = await interviewStorage.getHistory();
    interviews.forEach((inv) => {
      const ts = new Date(inv.date).toISOString();
      const isSuccess = inv.overallScore >= 70;
      events.push({
        id: `pe_interview_${inv.id}`,
        source: "MOCK_INTERVIEW",
        timestamp: ts,
        date: inv.date,
        title: `Mock Interview: ${inv.interviewType}`,
        platform: "leetcode",
        difficulty: inv.difficulty === "Adaptive" ? "Medium" : (inv.difficulty as Difficulty),
        topics: [inv.interviewType],
        primaryPattern: mapTopicsToPattern([inv.interviewType]),
        outcome: isSuccess
          ? (inv.hintCount > 0 ? "SOLVED_WITH_HINTS" : "SOLVED_INDEPENDENTLY")
          : "FAILED",
        solveTimeSeconds: (inv.actualDurationMinutes || inv.durationMinutes) * 60,
        estimatedTimeSeconds: inv.durationMinutes * 60,
        hintCount: inv.hintCount,
        score: inv.overallScore,
        sessionId: inv.id,
      });
    });
  } catch (err) {
    console.error("[performanceAggregation] Interview history load error:", err);
  }

  // 6. Study Sessions & Tasks
  try {
    const sessions = await studyStorage.getSessions();
    sessions.forEach((s) => {
      const ts = s.startedAt || s.completedAt || new Date().toISOString();
      const dateStr = s.date || ts.split("T")[0];

      s.tasks.forEach((t, tIdx) => {
        let outcome: LongitudinalEvent["outcome"] = "COMPLETED";
        if (t.status === "solved") outcome = "SOLVED_INDEPENDENTLY";
        else if (t.status === "failed") outcome = "FAILED";
        else if (t.status === "skipped") outcome = "SKIPPED";

        events.push({
          id: `pe_study_${s.id}_${t.id || tIdx}`,
          source: "STUDY_SESSION",
          timestamp: ts,
          date: dateStr,
          title: t.title,
          platform: "leetcode",
          difficulty: t.difficulty,
          topics: [t.title],
          primaryPattern: mapTopicsToPattern([t.title]),
          outcome,
          solveTimeSeconds: t.timeSpentSeconds > 0 ? t.timeSpentSeconds : t.estimatedMinutes * 60,
          estimatedTimeSeconds: t.estimatedMinutes * 60,
          hintCount: 0,
          sessionId: s.id,
        });
      });
    });
  } catch (err) {
    console.error("[performanceAggregation] Study sessions load error:", err);
  }

  // Sort events chronologically (oldest to newest)
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Filter into current and previous window periods
  const curStartTs = currentStartDate.getTime();
  const prevStartTs = previousStartDate.getTime();
  const nowTs = now.getTime();

  const currentPeriodEvents = window === "all"
    ? [...events]
    : events.filter((e) => {
        const t = new Date(e.timestamp).getTime();
        return t >= curStartTs && t <= nowTs;
      });

  const previousPeriodEvents = window === "all"
    ? []
    : events.filter((e) => {
        const t = new Date(e.timestamp).getTime();
        return t >= prevStartTs && t < curStartTs;
      });

  // Calculate total practice minutes in current window
  const totalPracticeMinutes = Math.round(
    currentPeriodEvents.reduce((sum, e) => sum + (e.solveTimeSeconds ? e.solveTimeSeconds / 60 : 15), 0)
  );

  return {
    allEvents: events,
    currentPeriodEvents,
    previousPeriodEvents,
    windowStartDate: formatDate(currentStartDate),
    windowEndDate: formatDate(now),
    previousStartDate: formatDate(previousStartDate),
    previousEndDate: formatDate(previousEndDate),
    totalPracticeMinutes,
  };
}
