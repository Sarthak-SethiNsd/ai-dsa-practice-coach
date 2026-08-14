"use client";

import * as React from "react";
import { FullPerformanceAnalytics, AnalyticsGoal } from "@/services/analytics/performanceAnalyticsTypes";
import { computePerformanceAnalytics } from "@/services/analytics/performanceAnalyticsEngine";
import { analyticsStorage } from "@/services/analytics/analyticsStorage";
import { sessionArchiveStorage } from "@/services/sessionArchiveStorage";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import { recommendationHistoryStorage } from "@/services/recommendationHistoryStorage";
import { questionRecommendationStorage } from "@/services/questionRecommendationStorage";
import { roadmapStorage } from "@/services/roadmapStorage";
import { dailySessionStorage } from "@/services/dailyRecommendationStorage";
import { getTodayDateString } from "@/utils/dateUtils";

export type TimeframeFilter = "7d" | "30d" | "90d" | "all";

export interface UsePerformanceAnalyticsReturn {
  analytics: FullPerformanceAnalytics | null;
  loading: boolean;
  timeframe: TimeframeFilter;
  setTimeframe: (t: TimeframeFilter) => void;
  addGoal: (goal: Omit<AnalyticsGoal, "id" | "createdAt" | "completionPercentage" | "status">) => Promise<AnalyticsGoal>;
  updateGoal: (id: string, updates: Partial<AnalyticsGoal>) => Promise<AnalyticsGoal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  refresh: () => void;
}

export function usePerformanceAnalytics(): UsePerformanceAnalyticsReturn {
  const [analytics, setAnalytics] = React.useState<FullPerformanceAnalytics | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [timeframe, setTimeframe] = React.useState<TimeframeFilter>("all");
  const [refreshSignal, setRefreshSignal] = React.useState<number>(0);

  const refresh = React.useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoading(true);
      try {
        const todayStr = getTodayDateString();
        const [
          sessions,
          todaySession,
          reviews,
          snapshots,
          qBatch,
          roadmap,
          goals,
        ] = await Promise.all([
          sessionArchiveStorage.loadAll(),
          dailySessionStorage.loadTodaySession(todayStr),
          reviewHistoryStorage.getAllEntries(),
          recommendationHistoryStorage.getAllSnapshots(),
          questionRecommendationStorage.getBatch(),
          roadmapStorage.getRoadmap(),
          analyticsStorage.getGoals(),
        ]);

        if (cancelled) return;

        // Combine sessions
        const sessionMap = new Map();
        sessions.forEach((s) => sessionMap.set(s.date, s));
        if (todaySession) sessionMap.set(todaySession.date, todaySession);
        const combinedSessions = Array.from(sessionMap.values());

        const recs = qBatch ? qBatch.recommendedQuestions : [];

        const computed = computePerformanceAnalytics(
          combinedSessions,
          reviews,
          snapshots,
          recs,
          roadmap,
          goals
        );

        setAnalytics(computed);
      } catch (err) {
        console.error("[usePerformanceAnalytics] Load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  const addGoal = React.useCallback(
    async (goalPayload: Omit<AnalyticsGoal, "id" | "createdAt" | "completionPercentage" | "status">) => {
      const newGoal = await analyticsStorage.addGoal(goalPayload);
      refresh();
      return newGoal;
    },
    [refresh]
  );

  const updateGoal = React.useCallback(
    async (id: string, updates: Partial<AnalyticsGoal>) => {
      const updated = await analyticsStorage.updateGoal(id, updates);
      refresh();
      return updated;
    },
    [refresh]
  );

  const deleteGoal = React.useCallback(
    async (id: string) => {
      const ok = await analyticsStorage.deleteGoal(id);
      if (ok) refresh();
      return ok;
    },
    [refresh]
  );

  return {
    analytics,
    loading,
    timeframe,
    setTimeframe,
    addGoal,
    updateGoal,
    deleteGoal,
    refresh,
  };
}
