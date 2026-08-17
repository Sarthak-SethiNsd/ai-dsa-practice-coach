"use client";

import * as React from "react";
import {
  StudyTask,
  StudySessionConfig,
  CompletedStudySession,
  StudyStreakData,
  StudyAnalyticsData,
} from "@/services/study/studyTypes";
import {
  generateStudySessionQueue,
  evaluateSessionPerformance,
  computeStudyAnalytics,
} from "@/services/study/studySessionEngine";
import { studyStorage } from "@/services/study/studyStorage";
import { roadmapStorage } from "@/services/roadmapStorage";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { questionRecommendationStorage } from "@/services/questionRecommendationStorage";
import { recommendationHistoryStorage } from "@/services/recommendationHistoryStorage";

export interface UseStudySessionReturn {
  // Session Active State
  isSessionActive: boolean;
  config: StudySessionConfig;
  setConfig: React.Dispatch<React.SetStateAction<StudySessionConfig>>;
  taskQueue: StudyTask[];
  currentTaskIndex: number;
  currentTask: StudyTask | null;
  
  // Timer State
  timerSeconds: number;
  isTimerRunning: boolean;
  
  // Historical / Analytics State
  completedSessions: CompletedStudySession[];
  streakData: StudyStreakData | null;
  analyticsData: StudyAnalyticsData | null;
  lastSessionResult: CompletedStudySession | null;
  loading: boolean;
  
  // Session Controls
  startSession: (customConfig?: StudySessionConfig) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  restartTimer: () => void;
  markTaskSolved: () => Promise<void>;
  markTaskFailed: () => Promise<void>;
  skipTask: () => void;
  addToRevision: (task: StudyTask) => Promise<void>;
  endSession: () => Promise<CompletedStudySession | null>;
  deleteHistorySession: (id: string) => Promise<boolean>;
  refresh: () => void;
}

export function useStudySession(): UseStudySessionReturn {
  const [config, setConfig] = React.useState<StudySessionConfig>({
    durationMinutes: 30,
    focusCategory: "balanced",
  });

  const [isSessionActive, setIsSessionActive] = React.useState(false);
  const [taskQueue, setTaskQueue] = React.useState<StudyTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = React.useState(0);
  
  // Timer
  const [timerSeconds, setTimerSeconds] = React.useState(1800);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [sessionStartTime, setSessionStartTime] = React.useState<string>("");

  // Data
  const [completedSessions, setCompletedSessions] = React.useState<CompletedStudySession[]>([]);
  const [streakData, setStreakData] = React.useState<StudyStreakData | null>(null);
  const [analyticsData, setAnalyticsData] = React.useState<StudyAnalyticsData | null>(null);
  const [lastSessionResult, setLastSessionResult] = React.useState<CompletedStudySession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshSignal, setRefreshSignal] = React.useState(0);

  const refresh = React.useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  // Timer Interval Effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive && isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, isTimerRunning, timerSeconds]);

  // Load Historical Sessions & Analytics
  React.useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [sessions, streak] = await Promise.all([
          studyStorage.getSessions(),
          studyStorage.getStreak(),
        ]);

        if (cancelled) return;

        setCompletedSessions(sessions);
        setStreakData(streak);
        setAnalyticsData(computeStudyAnalytics(sessions));
      } catch (err) {
        console.error("[useStudySession] Load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  const currentTask = taskQueue[currentTaskIndex] || null;

  // Start Session (consistently queries all 9 systems)
  const startSession = React.useCallback(
    async (customConfig?: StudySessionConfig) => {
      const activeConfig = customConfig || config;

      const [
        roadmap,
        revisions,
        qBatch,
        snapshots,
      ] = await Promise.all([
        roadmapStorage.getRoadmap(),
        revisionStorage.getItems(),
        questionRecommendationStorage.getBatch(),
        recommendationHistoryStorage.getAllSnapshots(),
      ]);

      const recs = qBatch ? qBatch.recommendedQuestions : [];
      const latestSnapshot = snapshots[0] || null;
      const weakness = latestSnapshot ? latestSnapshot.weakTopics : null;

      const queue = generateStudySessionQueue(
        activeConfig,
        roadmap,
        revisions,
        recs,
        weakness,
        null
      );

      setTaskQueue(queue);
      setCurrentTaskIndex(0);
      setTimerSeconds(activeConfig.durationMinutes * 60);
      setIsSessionActive(true);
      setIsTimerRunning(true);
      setSessionStartTime(new Date().toISOString());
      setLastSessionResult(null);
    },
    [config]
  );

  const pauseTimer = React.useCallback(() => setIsTimerRunning(false), []);
  const resumeTimer = React.useCallback(() => setIsTimerRunning(true), []);
  const restartTimer = React.useCallback(() => {
    setTimerSeconds(config.durationMinutes * 60);
    setIsTimerRunning(true);
  }, [config.durationMinutes]);

  const advanceTask = React.useCallback(
    (status: "solved" | "failed" | "skipped") => {
      setTaskQueue((prev) => {
        const next = [...prev];
        if (next[currentTaskIndex]) {
          next[currentTaskIndex] = {
            ...next[currentTaskIndex],
            status,
            completedAt: new Date().toISOString(),
          };
        }
        return next;
      });

      if (currentTaskIndex < taskQueue.length - 1) {
        setCurrentTaskIndex((i) => i + 1);
      }
    },
    [currentTaskIndex, taskQueue.length]
  );

  const markTaskSolved = React.useCallback(async () => {
    if (!currentTask) return;
    // Cross-system feedback to SRS if it's a revision task
    if (currentTask.taskType === "due_revision" || currentTask.taskType === "overdue_revision") {
      await revisionStorage.updateItem(String(currentTask.problemId), {
        status: "upcoming",
        lastRevisedAt: new Date().toISOString(),
      });
    }
    advanceTask("solved");
  }, [currentTask, advanceTask]);

  const markTaskFailed = React.useCallback(async () => {
    if (!currentTask) return;
    advanceTask("failed");
  }, [currentTask, advanceTask]);

  const skipTask = React.useCallback(() => {
    advanceTask("skipped");
  }, [advanceTask]);

  const addToRevision = React.useCallback(async (task: StudyTask) => {
    const todayStr = new Date().toISOString().split("T")[0];
    await revisionStorage.addItem({
      problemId: task.problemId,
      problemTitle: task.title,
      platform: task.platform,
      difficulty: task.difficulty,
      topics: task.topics,
      url: task.problemUrl,
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      memoryStrength: 100,
      successRate: 100,
      lastSolvedAt: todayStr,
      nextDueDate: todayStr,
      status: "due",
    });
  }, []);

  const endSession = React.useCallback(async () => {
    if (!isSessionActive) return null;

    const plannedSeconds = config.durationMinutes * 60;
    const actualTimeSpentSeconds = Math.max(1, plannedSeconds - timerSeconds);

    const sessionResult = evaluateSessionPerformance(
      config,
      taskQueue,
      actualTimeSpentSeconds,
      sessionStartTime || new Date().toISOString()
    );

    const recorded = await studyStorage.recordCompletedSession(sessionResult);

    setIsSessionActive(false);
    setIsTimerRunning(false);
    setLastSessionResult(recorded.session);
    refresh();

    return recorded.session;
  }, [isSessionActive, config, timerSeconds, taskQueue, sessionStartTime, refresh]);

  const deleteHistorySession = React.useCallback(
    async (id: string) => {
      const ok = await studyStorage.deleteSession(id);
      if (ok) refresh();
      return ok;
    },
    [refresh]
  );

  return {
    isSessionActive,
    config,
    setConfig,
    taskQueue,
    currentTaskIndex,
    currentTask,
    timerSeconds,
    isTimerRunning,
    completedSessions,
    streakData,
    analyticsData,
    lastSessionResult,
    loading,
    startSession,
    pauseTimer,
    resumeTimer,
    restartTimer,
    markTaskSolved,
    markTaskFailed,
    skipTask,
    addToRevision,
    endSession,
    deleteHistorySession,
    refresh,
  };
}
