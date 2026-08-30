"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PreparationGoal,
  FullPreparationState,
  PreparationComparison,
} from "@/services/preparation/preparationTypes";
import {
  compilePreparationState,
  computePreparationComparison,
} from "@/services/preparation/preparationEngine";
import {
  getPreparationGoals,
  saveGoal,
  deleteGoal as storageDeleteGoal,
  setActiveGoalId,
  getActiveGoalId,
  acknowledgeRisk as storageAcknowledgeRisk,
  getPreparationSnapshots,
} from "@/services/preparation/preparationStorage";

export function usePreparationCommandCenter() {
  const [state, setState] = useState<FullPreparationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PreparationGoal | null>(null);

  const [comparisonTimeframe, setComparisonTimeframe] = useState<
    "7_days" | "30_days" | "since_start"
  >("7_days");
  const [comparison, setComparison] = useState<PreparationComparison | null>(null);

  // ─── Refresh Master Preparation State ───────────────────────────────────────
  const refreshState = useCallback(async (customGoal?: PreparationGoal) => {
    setIsLoading(true);
    setError(null);
    try {
      const fullState = await compilePreparationState(customGoal);
      setState(fullState);

      // Compute comparison if snapshots exist
      const snapshots = getPreparationSnapshots();
      const currentSnap = snapshots.find((s) => s.goalId === fullState.activeGoal.id);
      if (currentSnap) {
        const comp = computePreparationComparison(currentSnap, comparisonTimeframe);
        setComparison(comp);
      }
    } catch (err) {
      console.error("[usePreparationCommandCenter] Error compiling state:", err);
      setError("Failed to compile preparation state. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [comparisonTimeframe]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Asynchronously compiles master preparation command center state on mount
    refreshState();
  }, [refreshState]);

  // ─── Goal Switcher ──────────────────────────────────────────────────────────
  const switchGoal = useCallback(
    async (goalId: string) => {
      setActiveGoalId(goalId);
      const all = getPreparationGoals();
      const target = all.find((g) => g.id === goalId);
      if (target) {
        await refreshState(target);
      }
    },
    [refreshState]
  );

  // ─── Save / Create Goal ─────────────────────────────────────────────────────
  const handleSaveGoal = useCallback(
    async (goal: PreparationGoal) => {
      saveGoal(goal);
      setActiveGoalId(goal.id);
      setShowGoalModal(false);
      setEditingGoal(null);
      await refreshState(goal);
    },
    [refreshState]
  );

  // ─── Delete Goal ────────────────────────────────────────────────────────────
  const handleDeleteGoal = useCallback(
    async (goalId: string) => {
      storageDeleteGoal(goalId);
      await refreshState();
    },
    [refreshState]
  );

  // ─── Acknowledge Risk ───────────────────────────────────────────────────────
  const handleAcknowledgeRisk = useCallback(
    (riskId: string) => {
      storageAcknowledgeRisk(riskId);
      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          risks: prev.risks.map((r) =>
            r.id === riskId ? { ...r, acknowledged: true } : r
          ),
        };
      });
    },
    []
  );

  // ─── Quick Update Daily Minutes ─────────────────────────────────────────────
  const handleUpdateDailyMinutes = useCallback(
    async (minutes: number) => {
      if (!state) return;
      const updated: PreparationGoal = {
        ...state.activeGoal,
        dailyMinutes: minutes,
      };
      saveGoal(updated);
      await refreshState(updated);
    },
    [state, refreshState]
  );

  // ─── Update Comparison Timeframe ────────────────────────────────────────────
  const handleComparisonTimeframeChange = useCallback(
    (tf: "7_days" | "30_days" | "since_start") => {
      setComparisonTimeframe(tf);
      if (!state) return;
      const snapshots = getPreparationSnapshots();
      const currentSnap = snapshots.find((s) => s.goalId === state.activeGoal.id);
      if (currentSnap) {
        const comp = computePreparationComparison(currentSnap, tf);
        setComparison(comp);
      }
    },
    [state]
  );

  return {
    state,
    isLoading,
    error,
    refreshState,

    // Goal Management
    switchGoal,
    saveGoal: handleSaveGoal,
    deleteGoal: handleDeleteGoal,
    updateDailyMinutes: handleUpdateDailyMinutes,

    // Modals
    showGoalModal,
    setShowGoalModal,
    editingGoal,
    setEditingGoal,
    openCreateGoal: () => {
      setEditingGoal(null);
      setShowGoalModal(true);
    },
    openEditGoal: (goal: PreparationGoal) => {
      setEditingGoal(goal);
      setShowGoalModal(true);
    },

    // Risks
    acknowledgeRisk: handleAcknowledgeRisk,

    // Historical Comparisons
    comparison,
    comparisonTimeframe,
    setComparisonTimeframe: handleComparisonTimeframeChange,
  };
}
