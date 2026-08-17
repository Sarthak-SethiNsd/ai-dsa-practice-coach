import {
  StudyTask,
  StudySessionConfig,
  CompletedStudySession,
  AdaptivePracticeSignal,
  StudyAnalyticsData,
  SessionTaskType,
} from "./studyTypes";
import { PracticeRoadmap } from "@/services/roadmapTypes";
import { RevisionItem } from "@/services/revision/revisionTypes";
import { QuestionRecommendation } from "@/services/questionRecommendationTypes";
import { WeakTopicAnalysis } from "@/services/recommendationTypes";
import { ContestReadinessScore } from "@/services/contest/contestTypes";
import { Difficulty, Platform } from "@/services/types";

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Intelligent Session Queue Generator.
 * Selects real problems from active systems based on session duration & focus category.
 */
export function generateStudySessionQueue(
  config: StudySessionConfig,
  roadmap: PracticeRoadmap | null,
  revisions: RevisionItem[],
  recommendations: QuestionRecommendation[],
  weakness: WeakTopicAnalysis | null,
  contestReadiness: ContestReadinessScore | null
): StudyTask[] {
  const targetMinutes = config.durationMinutes;
  const focus = config.focusCategory;
  const tasks: StudyTask[] = [];
  const addedProblemIds = new Set<string>();

  let accumulatedMinutes = 0;

  const addCandidateTask = (
    id: string,
    problemId: number | string,
    title: string,
    platform: Platform,
    difficulty: Difficulty,
    topics: string[],
    estimatedMinutes: number,
    taskType: SessionTaskType,
    problemUrl?: string,
    previousSnippet?: string
  ) => {
    const key = `${platform}_${problemId || title}`;
    if (addedProblemIds.has(key)) return;
    if (accumulatedMinutes >= targetMinutes) return;

    addedProblemIds.add(key);
    tasks.push({
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      problemId,
      title,
      platform,
      difficulty,
      topics,
      estimatedMinutes,
      taskType,
      problemUrl,
      status: "pending",
      timeSpentSeconds: 0,
      previousSnippet,
    });
    accumulatedMinutes += estimatedMinutes;
  };

  const todayStr = getTodayStr();

  // 1. SRS Revisions Priority (Overdue then Due)
  const overdueRevisions = revisions.filter((r) => r.nextDueDate < todayStr);
  const dueRevisions = revisions.filter((r) => r.nextDueDate === todayStr);

  if (focus === "revision" || focus === "balanced" || focus === "interview_prep") {
    overdueRevisions.forEach((r) => {
      addCandidateTask(
        r.id,
        r.problemId,
        r.problemTitle,
        r.platform,
        r.difficulty,
        r.topics,
        15,
        "overdue_revision",
        r.url,
        r.previousSolutionSnippet
      );
    });

    dueRevisions.forEach((r) => {
      addCandidateTask(
        r.id,
        r.problemId,
        r.problemTitle,
        r.platform,
        r.difficulty,
        r.topics,
        15,
        "due_revision",
        r.url,
        r.previousSolutionSnippet
      );
    });
  }

  // 2. Weak Topics Priority
  const weakTopicNames = weakness?.topicBreakdown
    ? weakness.topicBreakdown.filter((t) => t.masteryLevel === "Needs Attention" || t.masteryLevel === "Developing").map((t) => t.topic)
    : ["Arrays", "Dynamic Programming", "Graphs"];

  if (focus === "weak_topics" || focus === "balanced" || focus === "interview_prep") {
    recommendations.forEach((rec) => {
      const isWeak = weakTopicNames.some((wt) => wt.toLowerCase() === (rec.topic || "").toLowerCase());
      if (isWeak) {
        addCandidateTask(
          `rec_${rec.id}`,
          rec.id,
          rec.title,
          rec.platform,
          rec.difficulty,
          [rec.topic],
          rec.difficulty === "Easy" ? 10 : rec.difficulty === "Medium" ? 15 : 25,
          "weak_topic",
          rec.problemUrl
        );
      }
    });
  }

  // 3. Roadmap Priority
  if (roadmap && (focus === "roadmap_progress" || focus === "balanced")) {
    roadmap.allTasks
      .filter((t) => t.status === "Not Started" || t.status === "In Progress")
      .forEach((t) => {
        addCandidateTask(
          t.id,
          t.platformProblemId || t.title,
          t.title,
          t.platform,
          t.difficulty,
          [t.topic],
          t.difficulty === "Easy" ? 10 : t.difficulty === "Medium" ? 15 : 25,
          "roadmap_priority",
          t.problemUrl
        );
      });
  }

  // 4. AI Question Recommendations
  recommendations.forEach((rec) => {
    addCandidateTask(
      `rec_${rec.id}`,
      rec.id,
      rec.title,
      rec.platform,
      rec.difficulty,
      [rec.topic],
      rec.difficulty === "Easy" ? 10 : rec.difficulty === "Medium" ? 15 : 25,
      "ai_recommendation",
      rec.problemUrl
    );
  });

  // 5. Contest Requirement (if focus is contest_prep)
  if (focus === "contest_prep" && contestReadiness) {
    addCandidateTask(
      "contest_task_1",
      "CF_1500_B",
      "Codeforces Div. 2 Problem B (Contest Speedrun)",
      "codeforces",
      "Medium",
      ["Binary Search", "Greedy"],
      20,
      "contest_requirement",
      "https://codeforces.com/problemset"
    );
  }

  // Fallback seed tasks if no queue generated
  if (tasks.length === 0) {
    addCandidateTask(
      "fallback_1",
      1,
      "Two Sum",
      "leetcode",
      "Easy",
      ["Arrays", "Hash Table"],
      10,
      "ai_recommendation",
      "https://leetcode.com/problems/two-sum/"
    );
    addCandidateTask(
      "fallback_2",
      15,
      "3Sum",
      "leetcode",
      "Medium",
      ["Arrays", "Two Pointers"],
      15,
      "ai_recommendation",
      "https://leetcode.com/problems/3sum/"
    );
  }

  return tasks;
}

/**
 * Calculates completed study session performance analytics.
 */
export function evaluateSessionPerformance(
  config: StudySessionConfig,
  tasks: StudyTask[],
  actualTimeSpentSeconds: number,
  startedAt: string
): CompletedStudySession {
  const attemptedTasks = tasks.filter((t) => t.status !== "pending");
  const solvedTasks = tasks.filter((t) => t.status === "solved");
  const failedTasks = tasks.filter((t) => t.status === "failed");
  const skippedTasks = tasks.filter((t) => t.status === "skipped");

  const attemptedCount = attemptedTasks.length;
  const solvedCount = solvedTasks.length;
  const failedCount = failedTasks.length;
  const skippedCount = skippedTasks.length;

  const completionRatePct =
    tasks.length > 0 ? Math.round((solvedCount / tasks.length) * 100) : 0;

  const avgTimePerProblemSeconds =
    solvedCount > 0 ? Math.round(actualTimeSpentSeconds / solvedCount) : actualTimeSpentSeconds;

  // Topic distribution
  const topicDistribution: Record<string, number> = {};
  solvedTasks.forEach((t) => {
    t.topics.forEach((topic) => {
      topicDistribution[topic] = (topicDistribution[topic] || 0) + 1;
    });
  });

  // Difficulty distribution
  const difficultyDistribution: Record<Difficulty, number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };
  solvedTasks.forEach((t) => {
    difficultyDistribution[t.difficulty] =
      (difficultyDistribution[t.difficulty] || 0) + 1;
  });

  // SRS Revision Success Rate
  const revisionTasks = attemptedTasks.filter(
    (t) => t.taskType === "due_revision" || t.taskType === "overdue_revision"
  );
  const revisionSolved = revisionTasks.filter((t) => t.status === "solved");
  const revisionSuccessRatePct =
    revisionTasks.length > 0
      ? Math.round((revisionSolved.length / revisionTasks.length) * 100)
      : 100;

  // Adaptive Practice Signal computation
  const adaptiveSignal = computeAdaptivePracticeSignal(
    solvedCount,
    attemptedCount,
    avgTimePerProblemSeconds,
    topicDistribution
  );

  // Coach Summary
  const coachSummary = generateAiSessionCoachReport(
    solvedCount,
    attemptedCount,
    actualTimeSpentSeconds,
    config.durationMinutes * 60,
    topicDistribution,
    difficultyDistribution
  );

  return {
    id: `study_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: getTodayStr(),
    startedAt,
    completedAt: new Date().toISOString(),
    durationMinutes: config.durationMinutes,
    actualTimeSpentSeconds,
    focusCategory: config.focusCategory,
    tasks,
    attemptedCount,
    solvedCount,
    failedCount,
    skippedCount,
    avgTimePerProblemSeconds,
    topicDistribution,
    difficultyDistribution,
    revisionSuccessRatePct,
    completionRatePct,
    adaptiveSignal,
    coachSummary,
  };
}

/**
 * Computes adaptive practice signals based on session execution metrics.
 */
export function computeAdaptivePracticeSignal(
  solvedCount: number,
  attemptedCount: number,
  avgTimeSeconds: number,
  topicDistribution: Record<string, number>
): AdaptivePracticeSignal {
  const successRate = attemptedCount > 0 ? solvedCount / attemptedCount : 0;
  const targetTopics = Object.keys(topicDistribution);

  let difficultyAdjustment: "increase" | "maintain" | "decrease" = "maintain";
  let confidenceModifier = 0;
  let reason = "Practice performance is steady and well-balanced.";

  if (successRate >= 0.85 && avgTimeSeconds <= 600) {
    difficultyAdjustment = "increase";
    confidenceModifier = 8;
    reason = "High accuracy and fast solve times indicate readiness for harder problems.";
  } else if (successRate < 0.5) {
    difficultyAdjustment = "decrease";
    confidenceModifier = -5;
    reason = "Multiple failures detected; reducing problem difficulty to rebuild foundation.";
  } else {
    confidenceModifier = 3;
  }

  return {
    difficultyAdjustment,
    targetFocusTopics: targetTopics.length > 0 ? targetTopics : ["Arrays"],
    nextRecommendedDurationMinutes: successRate >= 0.8 ? 45 : 30,
    confidenceModifier,
    reason,
  };
}

/**
 * AI Session Coach report generator.
 */
export function generateAiSessionCoachReport(
  solvedCount: number,
  attemptedCount: number,
  actualTimeSeconds: number,
  plannedTimeSeconds: number,
  topicDist: Record<string, number>,
  diffDist: Record<Difficulty, number>
) {
  const strengthsNoticed: string[] = [];
  const weaknessesNoticed: string[] = [];

  if (solvedCount > 0) {
    strengthsNoticed.push(`Successfully solved ${solvedCount} problem${solvedCount > 1 ? "s" : ""}`);
  }
  if (diffDist.Hard > 0) {
    strengthsNoticed.push("Tackled Hard difficulty problems during session");
  }
  if (diffDist.Medium > 0) {
    strengthsNoticed.push("Strong execution on Medium tier problems");
  }

  if (attemptedCount > solvedCount) {
    weaknessesNoticed.push(`${attemptedCount - solvedCount} problem(s) remained unsolved or failed`);
  }
  if (actualTimeSeconds > plannedTimeSeconds) {
    weaknessesNoticed.push("Exceeded planned session duration budget");
  }

  const pacingFeedback =
    actualTimeSeconds <= plannedTimeSeconds
      ? "Pacing was efficient and finished within budget."
      : "Consider setting strict per-problem time limits to prevent exceeding duration.";

  const topTopic = Object.keys(topicDist)[0] || "General DSA";
  const nextSessionRecommendation = `Plan a 30-minute session targeting ${topTopic} and SRS revisions.`;

  return {
    strengthsNoticed: strengthsNoticed.length > 0 ? strengthsNoticed : ["Maintained focus during study session"],
    weaknessesNoticed: weaknessesNoticed.length > 0 ? weaknessesNoticed : ["None detected — clean session execution!"],
    pacingFeedback,
    nextSessionRecommendation,
  };
}

/**
 * Computes aggregate Study Analytics across all historical sessions.
 */
export function computeStudyAnalytics(
  sessions: CompletedStudySession[]
): StudyAnalyticsData {
  const dailyMap = new Map<string, number>();
  const weeklyMap = new Map<string, number>();
  const monthlyMap = new Map<string, number>();

  let totalCompletionSum = 0;
  let totalRevisionsCount = 0;
  let totalNewCount = 0;
  let totalActiveTimeSeconds = 0;

  const topicDistAllTime: Record<string, number> = {};
  const diffDistAllTime: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };

  sessions.forEach((s) => {
    // Daily
    dailyMap.set(s.date, (dailyMap.get(s.date) || 0) + s.durationMinutes);

    // Weekly (approximate week label)
    const d = new Date(s.date);
    const weekLabel = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString("default", { month: "short" })}`;
    weeklyMap.set(weekLabel, (weeklyMap.get(weekLabel) || 0) + s.durationMinutes);

    // Monthly
    const monthLabel = d.toLocaleString("default", { month: "short", year: "numeric" });
    monthlyMap.set(monthLabel, (monthlyMap.get(monthLabel) || 0) + s.durationMinutes);

    totalCompletionSum += s.completionRatePct;
    totalActiveTimeSeconds += s.actualTimeSpentSeconds;

    s.tasks.forEach((t) => {
      if (t.taskType === "due_revision" || t.taskType === "overdue_revision") {
        totalRevisionsCount++;
      } else {
        totalNewCount++;
      }

      if (t.status === "solved") {
        diffDistAllTime[t.difficulty] = (diffDistAllTime[t.difficulty] || 0) + 1;
        t.topics.forEach((top) => {
          topicDistAllTime[top] = (topicDistAllTime[top] || 0) + 1;
        });
      }
    });
  });

  const dailyStudyMinutes30d = Array.from(dailyMap.entries()).map(([date, minutes]) => ({
    date,
    minutes,
  }));

  const weeklyStudyMinutes12w = Array.from(weeklyMap.entries()).map(([weekLabel, minutes]) => ({
    weekLabel,
    minutes,
  }));

  const monthlyStudyMinutes12m = Array.from(monthlyMap.entries()).map(([monthLabel, minutes]) => ({
    monthLabel,
    minutes,
  }));

  const avgSessionCompletionPct =
    sessions.length > 0 ? Math.round(totalCompletionSum / sessions.length) : 100;

  const totalProblems = totalRevisionsCount + totalNewCount;
  const revisionVsNewRatioPct =
    totalProblems > 0 ? Math.round((totalRevisionsCount / totalProblems) * 100) : 50;

  const focusEfficiencyPct = clamp(
    Math.round(
      (totalActiveTimeSeconds /
        Math.max(1, sessions.reduce((sum, s) => sum + s.durationMinutes * 60, 0))) *
        100
    ),
    50,
    98
  );

  return {
    dailyStudyMinutes30d,
    weeklyStudyMinutes12w,
    monthlyStudyMinutes12m,
    avgSessionCompletionPct,
    revisionVsNewRatioPct,
    focusEfficiencyPct,
    topicDistributionAllTime: topicDistAllTime,
    difficultyDistributionAllTime: diffDistAllTime,
  };
}
