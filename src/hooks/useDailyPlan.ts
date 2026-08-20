"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DailyPlan,
  DailyAction,
  AIDailyCoachAdvice,
  TomorrowPreviewData,
  PlanHistoryRecord,
  PlannerAnalytics,
  ActionType,
} from "@/services/dailyPlan/dailyPlanTypes";
import {
  generateDailyPlan,
  replanDailyPlan,
  getTomorrowPreview,
  generateDailyCoachAdvice,
  planToHistoryRecord,
} from "@/services/dailyPlan/dailyPlanEngine";
import { dailyPlanStorage } from "@/services/dailyPlan/dailyPlanStorage";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { roadmapStorage } from "@/services/roadmapStorage";

// ─── Hook Return Type ──────────────────────────────────────────────────────────

export interface UseDailyPlanReturn {
  // State
  plan: DailyPlan | null;
  coachAdvice: AIDailyCoachAdvice | null;
  tomorrowPreview: TomorrowPreviewData | null;
  history: PlanHistoryRecord[];
  analytics: PlannerAnalytics;
  timeBudget: number;
  isLoading: boolean;
  isReplanning: boolean;
  completionModalOpen: boolean;

  // Actions
  completeAction: (actionId: string) => Promise<void>;
  skipAction: (actionId: string) => Promise<void>;
  undoAction: (actionId: string) => Promise<void>;
  changeBudget: (minutes: number) => Promise<void>;
  replan: () => Promise<void>;
  regenerate: () => Promise<void>;
  closeCompletionModal: () => void;
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function computeAnalytics(history: PlanHistoryRecord[]): PlannerAnalytics {
  const total = history.length;
  if (total === 0) {
    return {
      totalPlansGenerated: 0,
      plansCompleted: 0,
      completionRate: 0,
      avgPlannedMinutes: 0,
      avgCompletedMinutes: 0,
      weeklyConsistency: 0,
      actionTypeBreakdown: {} as Record<ActionType, number>,
    };
  }

  const completed = history.filter((h) => h.status === "completed").length;
  const avgPlanned = Math.round(
    history.reduce((s, h) => s + h.totalPlannedMinutes, 0) / total
  );
  const avgActual = Math.round(
    history.reduce((s, h) => s + h.completedMinutes, 0) / total
  );

  // Days with a completed plan in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyConsistency = history.filter(
    (h) =>
      h.status === "completed" && new Date(h.date) >= sevenDaysAgo
  ).length;

  return {
    totalPlansGenerated: total,
    plansCompleted: completed,
    completionRate: Math.round((completed / total) * 100),
    avgPlannedMinutes: avgPlanned,
    avgCompletedMinutes: avgActual,
    weeklyConsistency,
    actionTypeBreakdown: {} as Record<ActionType, number>,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDailyPlan(): UseDailyPlanReturn {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [coachAdvice, setCoachAdvice] = useState<AIDailyCoachAdvice | null>(null);
  const [tomorrowPreview, setTomorrowPreview] = useState<TomorrowPreviewData | null>(null);
  const [history, setHistory] = useState<PlanHistoryRecord[]>([]);
  const [timeBudget, setTimeBudget] = useState<number>(60);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplanning, setIsReplanning] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);

  const analytics = computeAnalytics(history);

  // ── Initialization ─────────────────────────────────────────────────────────

  const init = useCallback(async () => {
    setIsLoading(true);
    try {
      const [storedBudget, storedPlan, storedHistory] = await Promise.all([
        dailyPlanStorage.getTimeBudget(),
        dailyPlanStorage.getCurrentPlan(),
        dailyPlanStorage.getHistory(),
      ]);

      setTimeBudget(storedBudget);
      setHistory(storedHistory);

      // If existing plan is from today, reuse it; otherwise generate fresh
      let activePlan: DailyPlan;
      if (storedPlan && storedPlan.date === todayStr()) {
        activePlan = storedPlan;
      } else {
        // Archive previous plan to history before replacing
        if (storedPlan && storedPlan.status === "in_progress") {
          const record = planToHistoryRecord({
            ...storedPlan,
            status: "skipped",
          });
          await dailyPlanStorage.appendHistory(record);
        }
        activePlan = await generateDailyPlan(storedBudget);
        await dailyPlanStorage.savePlan(activePlan);
      }

      setPlan(activePlan);

      // Generate AI coach advice and tomorrow preview in parallel
      const [advice, preview] = await Promise.all([
        generateDailyCoachAdvice(activePlan),
        getTomorrowPreview(),
      ]);
      setCoachAdvice(advice);
      setTomorrowPreview(preview);
    } catch (e) {
      console.error("[useDailyPlan] Init failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  // ── Complete Action ────────────────────────────────────────────────────────

  const completeAction = useCallback(async (actionId: string) => {
    if (!plan) return;

    const updatedActions = plan.actions.map((a) =>
      a.id === actionId
        ? { ...a, status: "completed" as const, completedAt: new Date().toISOString() }
        : a
    );

    const completedAction = updatedActions.find((a) => a.id === actionId);
    const completedMinutes = updatedActions
      .filter((a) => a.status === "completed")
      .reduce((s, a) => s + a.estimatedMinutes, 0);
    const completedCount = updatedActions.filter((a) => a.status === "completed").length;
    const allDone = updatedActions.every((a) => a.status !== "pending");

    const updatedPlan: DailyPlan = {
      ...plan,
      actions: updatedActions,
      completedCount,
      completedMinutes,
      status: allDone ? "completed" : "in_progress",
    };

    // Sync back to source subsystem
    if (completedAction?.sourceRef) {
      const { type, id } = completedAction.sourceRef;
      try {
        if (type === "revision") {
          await revisionStorage.updateItem(id, {
            status: "completed",
            lastRevisedAt: todayStr(),
          });
        } else if (type === "roadmap") {
          await roadmapStorage.saveCompletedTask(id, todayStr());
        }
      } catch (e) {
        console.error("[useDailyPlan] Failed to sync action to subsystem:", e);
      }
    }

    setPlan(updatedPlan);
    await dailyPlanStorage.savePlan(updatedPlan);

    // Check if plan is now complete
    if (allDone) {
      setCompletionModalOpen(true);
      const record = planToHistoryRecord(updatedPlan);
      await dailyPlanStorage.appendHistory(record);
      setHistory((prev) => [record, ...prev.filter((h) => h.date !== record.date)]);
    }
  }, [plan]);

  // ── Skip Action ───────────────────────────────────────────────────────────

  const skipAction = useCallback(async (actionId: string) => {
    if (!plan) return;

    const updatedActions = plan.actions.map((a) =>
      a.id === actionId
        ? { ...a, status: "skipped" as const, skippedAt: new Date().toISOString() }
        : a
    );

    const skippedCount = updatedActions.filter((a) => a.status === "skipped").length;
    const completedCount = updatedActions.filter((a) => a.status === "completed").length;

    const updatedPlan: DailyPlan = {
      ...plan,
      actions: updatedActions,
      skippedCount,
      completedCount,
    };

    setPlan(updatedPlan);
    await dailyPlanStorage.savePlan(updatedPlan);
  }, [plan]);

  // ── Undo Action ───────────────────────────────────────────────────────────

  const undoAction = useCallback(async (actionId: string) => {
    if (!plan) return;

    const updatedActions = plan.actions.map((a) =>
      a.id === actionId
        ? { ...a, status: "pending" as const, completedAt: undefined, skippedAt: undefined }
        : a
    );

    const completedCount = updatedActions.filter((a) => a.status === "completed").length;
    const skippedCount = updatedActions.filter((a) => a.status === "skipped").length;
    const completedMinutes = updatedActions
      .filter((a) => a.status === "completed")
      .reduce((s, a) => s + a.estimatedMinutes, 0);

    const updatedPlan: DailyPlan = {
      ...plan,
      actions: updatedActions,
      completedCount,
      skippedCount,
      completedMinutes,
      status: "in_progress",
    };

    setPlan(updatedPlan);
    await dailyPlanStorage.savePlan(updatedPlan);
  }, [plan]);

  // ── Change Time Budget ─────────────────────────────────────────────────────

  const changeBudget = useCallback(async (minutes: number) => {
    setTimeBudget(minutes);
    await dailyPlanStorage.saveTimeBudget(minutes);

    if (!plan) return;
    setIsReplanning(true);
    try {
      const replanned = await replanDailyPlan(plan, minutes);
      setPlan(replanned);
      await dailyPlanStorage.savePlan(replanned);
      const advice = await generateDailyCoachAdvice(replanned);
      setCoachAdvice(advice);
    } catch (e) {
      console.error("[useDailyPlan] Budget change replan failed:", e);
    } finally {
      setIsReplanning(false);
    }
  }, [plan]);

  // ── Replan ────────────────────────────────────────────────────────────────

  const replan = useCallback(async () => {
    if (!plan) return;
    setIsReplanning(true);
    try {
      const replanned = await replanDailyPlan(plan);
      setPlan(replanned);
      await dailyPlanStorage.savePlan(replanned);
      const advice = await generateDailyCoachAdvice(replanned);
      setCoachAdvice(advice);
    } catch (e) {
      console.error("[useDailyPlan] Replan failed:", e);
    } finally {
      setIsReplanning(false);
    }
  }, [plan]);

  // ── Full Regenerate (start over) ───────────────────────────────────────────

  const regenerate = useCallback(async () => {
    setIsLoading(true);
    try {
      const freshPlan = await generateDailyPlan(timeBudget);
      setPlan(freshPlan);
      await dailyPlanStorage.savePlan(freshPlan);
      const [advice, preview] = await Promise.all([
        generateDailyCoachAdvice(freshPlan),
        getTomorrowPreview(),
      ]);
      setCoachAdvice(advice);
      setTomorrowPreview(preview);
    } catch (e) {
      console.error("[useDailyPlan] Regenerate failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, [timeBudget]);

  return {
    plan,
    coachAdvice,
    tomorrowPreview,
    history,
    analytics,
    timeBudget,
    isLoading,
    isReplanning,
    completionModalOpen,
    completeAction,
    skipAction,
    undoAction,
    changeBudget,
    replan,
    regenerate,
    closeCompletionModal: () => setCompletionModalOpen(false),
  };
}
