"use client";

import * as React from "react";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import { reviewCollectionStorage } from "@/services/reviewCollectionStorage";
import { generatePersonalizedRecommendations } from "@/services/recommendationEngine";
import {
  generatePracticeRoadmap,
  computeRoadmapProgress,
  computeRoadmapAnalytics,
} from "@/services/roadmapEngine";
import { roadmapStorage } from "@/services/roadmapStorage";
import {
  PracticeRoadmap,
  RoadmapProgress,
  RoadmapAnalytics,
  DailyMission,
  WeeklyRoadmap,
  MonthlyGoal,
  PracticeTask,
} from "@/services/roadmapTypes";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";
import { ReviewCollection } from "@/services/collectionTypes";

export interface UseRoadmapReturn {
  loading: boolean;
  refreshing: boolean;
  roadmap: PracticeRoadmap | null;
  progress: RoadmapProgress | null;
  analytics: RoadmapAnalytics | null;
  dailyMission: DailyMission | null;
  weeklyRoadmap: WeeklyRoadmap | null;
  monthlyGoal: MonthlyGoal | null;
  completedTaskIds: Set<string>;
  generateRoadmap: () => Promise<void>;
  refreshRoadmap: () => Promise<void>;
  markTaskCompleted: (taskId: string) => Promise<void>;
  markTaskIncomplete: (taskId: string) => Promise<void>;
  deleteRoadmap: () => Promise<void>;
  allTasks: PracticeTask[];
}

export function useRoadmap(): UseRoadmapReturn {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [roadmap, setRoadmap] = React.useState<PracticeRoadmap | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = React.useState<Set<string>>(new Set());
  const [entries, setEntries] = React.useState<ReviewHistoryEntry[]>([]);
  const [collections, setCollections] = React.useState<ReviewCollection[]>([]);

  // ─── Initial data load ────────────────────────────────────────────────────
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [savedRoadmap, completedMap, entriesData, collectionsData] = await Promise.all([
          roadmapStorage.getRoadmap(),
          roadmapStorage.getCompletedTasks(),
          reviewHistoryStorage.getAllEntries(),
          reviewCollectionStorage.getAll(),
        ]);

        if (cancelled) return;
        setEntries(entriesData);
        setCollections(collectionsData);
        setCompletedTaskIds(new Set(Object.keys(completedMap)));

        if (savedRoadmap) {
          // Rehydrate task statuses from completed map
          const hydratedRoadmap = hydrateRoadmap(savedRoadmap, new Set(Object.keys(completedMap)));
          setRoadmap(hydratedRoadmap);
        }
      } catch (err) {
        console.error("[useRoadmap] Load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ─── Rehydrate helper (apply completed statuses to task list) ────────────
  function hydrateRoadmap(rm: PracticeRoadmap, completedIds: Set<string>): PracticeRoadmap {
    const applyStatus = (task: PracticeTask): PracticeTask => ({
      ...task,
      status: completedIds.has(task.id) ? "Completed" : task.status,
      completedDate: completedIds.has(task.id)
        ? task.completedDate ?? new Date().toISOString()
        : task.completedDate,
    });

    return {
      ...rm,
      allTasks: rm.allTasks.map(applyStatus),
      dailyMission: {
        ...rm.dailyMission,
        tasks: rm.dailyMission.tasks.map(applyStatus),
        completedCount: rm.dailyMission.tasks.filter((t) => completedIds.has(t.id)).length,
        isComplete: rm.dailyMission.tasks.every((t) => completedIds.has(t.id)),
      },
      weeklyRoadmap: {
        ...rm.weeklyRoadmap,
        assignedTasks: rm.weeklyRoadmap.assignedTasks.map(applyStatus),
        completedCount: rm.weeklyRoadmap.assignedTasks.filter((t) => completedIds.has(t.id)).length,
      },
    };
  }

  // ─── Generate new roadmap ─────────────────────────────────────────────────
  const generateRoadmap = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const [freshEntries, freshCollections] = await Promise.all([
        reviewHistoryStorage.getAllEntries(),
        reviewCollectionStorage.getAll(),
      ]);
      setEntries(freshEntries);
      setCollections(freshCollections);

      const recommendation = generatePersonalizedRecommendations(freshEntries, freshCollections);
      const newRoadmap = generatePracticeRoadmap(recommendation, freshEntries, freshCollections);

      await roadmapStorage.saveRoadmap(newRoadmap);
      setRoadmap(newRoadmap);
    } catch (err) {
      console.error("[useRoadmap] Generate error:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ─── Refresh roadmap from latest data ────────────────────────────────────
  const refreshRoadmap = React.useCallback(async () => {
    await generateRoadmap();
  }, [generateRoadmap]);

  // ─── Mark task as completed ───────────────────────────────────────────────
  const markTaskCompleted = React.useCallback(async (taskId: string) => {
    const now = new Date().toISOString();
    await roadmapStorage.saveCompletedTask(taskId, now);

    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });

    setRoadmap((prev) => {
      if (!prev) return prev;
      return hydrateRoadmap(prev, new Set([...completedTaskIds, taskId]));
    });
  }, [completedTaskIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Mark task as incomplete ──────────────────────────────────────────────
  const markTaskIncomplete = React.useCallback(async (taskId: string) => {
    await roadmapStorage.removeCompletedTask(taskId);

    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });

    setRoadmap((prev) => {
      if (!prev) return prev;
      const nextIds = new Set(completedTaskIds);
      nextIds.delete(taskId);
      return hydrateRoadmap(prev, nextIds);
    });
  }, [completedTaskIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Delete roadmap ───────────────────────────────────────────────────────
  const deleteRoadmap = React.useCallback(async () => {
    await roadmapStorage.clearAll();
    setRoadmap(null);
    setCompletedTaskIds(new Set());
  }, []);

  // ─── Derived memoized values ──────────────────────────────────────────────
  const allTasks = React.useMemo(() => roadmap?.allTasks ?? [], [roadmap]);

  const progress = React.useMemo(() => {
    if (!roadmap) return null;
    return computeRoadmapProgress(allTasks, completedTaskIds);
  }, [roadmap, allTasks, completedTaskIds]);

  const analytics = React.useMemo(() => {
    if (!roadmap) return null;
    return computeRoadmapAnalytics(
      allTasks,
      completedTaskIds,
      roadmap ? [] : [] // topicPerformance (passed for future use)
    );
  }, [roadmap, allTasks, completedTaskIds]);

  const dailyMission = React.useMemo(() => {
    if (!roadmap) return null;
    return {
      ...roadmap.dailyMission,
      tasks: roadmap.dailyMission.tasks.map((t) => ({
        ...t,
        status: completedTaskIds.has(t.id) ? "Completed" as const : t.status,
      })),
      completedCount: roadmap.dailyMission.tasks.filter((t) => completedTaskIds.has(t.id)).length,
      isComplete: roadmap.dailyMission.tasks.every((t) => completedTaskIds.has(t.id)),
    };
  }, [roadmap, completedTaskIds]);

  const weeklyRoadmap = React.useMemo(() => {
    if (!roadmap) return null;
    return {
      ...roadmap.weeklyRoadmap,
      assignedTasks: roadmap.weeklyRoadmap.assignedTasks.map((t) => ({
        ...t,
        status: completedTaskIds.has(t.id) ? "Completed" as const : t.status,
      })),
      completedCount: roadmap.weeklyRoadmap.assignedTasks.filter((t) => completedTaskIds.has(t.id)).length,
    };
  }, [roadmap, completedTaskIds]);

  const monthlyGoal = React.useMemo(() => {
    if (!roadmap) return null;
    const totalCompleted = allTasks.filter((t) => completedTaskIds.has(t.id)).length;
    return {
      ...roadmap.monthlyGoal,
      completedQuestions: totalCompleted,
    };
  }, [roadmap, allTasks, completedTaskIds]);

  return {
    loading,
    refreshing,
    roadmap,
    progress,
    analytics,
    dailyMission,
    weeklyRoadmap,
    monthlyGoal,
    completedTaskIds,
    generateRoadmap,
    refreshRoadmap,
    markTaskCompleted,
    markTaskIncomplete,
    deleteRoadmap,
    allTasks,
  };
}
