"use client";

import * as React from "react";
import {
  FullSpacedRepetitionData,
  RevisionItem,
  RevisionFeedback,
} from "@/services/revision/revisionTypes";
import {
  computeFullSpacedRepetitionData,
  computeNextRevisionState,
} from "@/services/revision/revisionEngine";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { Problem } from "@/services/types";

export interface UseSpacedRepetitionReturn {
  data: FullSpacedRepetitionData | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  markRemembered: (id: string, aiScore?: number) => Promise<RevisionItem | null>;
  markForgotten: (id: string) => Promise<RevisionItem | null>;
  recordFeedback: (id: string, feedback: RevisionFeedback, aiScore?: number) => Promise<RevisionItem | null>;
  scheduleNewProblem: (problem: Problem) => Promise<RevisionItem>;
  deleteRevision: (id: string) => Promise<boolean>;
  dismissNotification: (id: string) => Promise<void>;
  refresh: () => void;
}

export function useSpacedRepetition(): UseSpacedRepetitionReturn {
  const [data, setData] = React.useState<FullSpacedRepetitionData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [refreshSignal, setRefreshSignal] = React.useState(0);

  const refresh = React.useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [items, notifs] = await Promise.all([
          revisionStorage.getItems(),
          revisionStorage.getNotifications(),
        ]);

        if (cancelled) return;

        const computed = computeFullSpacedRepetitionData(items, notifs);
        setData(computed);
      } catch (err) {
        console.error("[useSpacedRepetition] Load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  const recordFeedback = React.useCallback(
    async (id: string, feedback: RevisionFeedback, aiScore?: number) => {
      if (!data) return null;
      const item = data.allItems.find((i) => i.id === id);
      if (!item) return null;

      const nextState = computeNextRevisionState(item, feedback, aiScore);
      const updatedHistory = [nextState.newHistoryRecord, ...item.history];

      const updates: Partial<RevisionItem> = {
        repetitions: nextState.repetitions,
        intervalDays: nextState.intervalDays,
        easeFactor: nextState.easeFactor,
        memoryStrength: nextState.memoryStrength,
        nextDueDate: nextState.nextDueDate,
        successRate: nextState.successRate,
        lastRevisedAt: new Date().toISOString(),
        status: "upcoming",
        history: updatedHistory,
      };

      const updatedItem = await revisionStorage.updateItem(id, updates);
      refresh();
      return updatedItem;
    },
    [data, refresh]
  );

  const markRemembered = React.useCallback(
    async (id: string, aiScore?: number) => {
      return recordFeedback(id, "remembered", aiScore);
    },
    [recordFeedback]
  );

  const markForgotten = React.useCallback(
    async (id: string) => {
      return recordFeedback(id, "forgotten");
    },
    [recordFeedback]
  );

  const scheduleNewProblem = React.useCallback(
    async (problem: Problem) => {
      const todayStr = new Date().toISOString().split("T")[0];
      const initialInterval =
        problem.difficulty === "Easy" ? 3 : problem.difficulty === "Medium" ? 1 : 1;

      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + initialInterval);

      const newItem = await revisionStorage.addItem({
        problemId: problem.id || problem.platformProblemId || problem.title,
        problemTitle: problem.title,
        platform: problem.platform,
        difficulty: problem.difficulty,
        topics: problem.topics,
        url: problem.url,
        repetitions: 0,
        intervalDays: initialInterval,
        easeFactor: 2.5,
        memoryStrength: 100,
        successRate: 100,
        lastSolvedAt: todayStr,
        nextDueDate: nextDue.toISOString().split("T")[0],
        status: "upcoming",
      });
      refresh();
      return newItem;
    },
    [refresh]
  );

  const deleteRevision = React.useCallback(
    async (id: string) => {
      const ok = await revisionStorage.deleteItem(id);
      if (ok) refresh();
      return ok;
    },
    [refresh]
  );

  const dismissNotification = React.useCallback(
    async (id: string) => {
      await revisionStorage.markNotificationRead(id);
      refresh();
    },
    [refresh]
  );

  return {
    data,
    loading,
    activeTab,
    setActiveTab,
    markRemembered,
    markForgotten,
    recordFeedback,
    scheduleNewProblem,
    deleteRevision,
    dismissNotification,
    refresh,
  };
}
