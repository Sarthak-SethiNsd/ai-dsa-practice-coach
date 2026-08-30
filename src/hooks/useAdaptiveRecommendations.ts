"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AdaptiveProblemRecommendation,
  RecommendationMode,
  RecommendationPriority,
  RecommendationFeedbackAction,
  RecommendationFilterOptions,
  AIRecommendationCoachAdvice,
} from "@/services/recommendations/recommendationTypes";
import {
  compileAdaptiveRecommendations,
  getAIRecommendationCoachAdvice,
} from "@/services/recommendations/recommendationEngine";
import {
  logRecommendationFeedback,
  dismissProblem,
  getRecommendationHistory,
  getRecommendationAnalytics,
} from "@/services/recommendations/recommendationHistory";
import { RecommendationHistoryItem } from "@/services/recommendations/recommendationTypes";

const DEFAULT_FILTERS: RecommendationFilterOptions = {
  platform: "all",
  difficulty: "all",
  topic: "",
  pattern: "",
  mode: "all",
  priority: "all",
  timeBudgetMinutes: null,
  searchQuery: "",
};

export function useAdaptiveRecommendations() {
  const [recommendations, setRecommendations] = useState<AdaptiveProblemRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<RecommendationMode>("smart_practice");

  // Filters
  const [filters, setFilters] = useState<RecommendationFilterOptions>(DEFAULT_FILTERS);

  // Detail modal
  const [selectedRec, setSelectedRec] = useState<AdaptiveProblemRecommendation | null>(null);
  const [coachAdvice, setCoachAdvice] = useState<AIRecommendationCoachAdvice | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // History
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);

  // ─── Load recommendations ──────────────────────────────────────────────────
  const loadRecommendations = useCallback(async (mode: RecommendationMode, force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const recs = await compileAdaptiveRecommendations(mode, force);
      setRecommendations(recs);
    } catch (err) {
      console.error("[useAdaptiveRecommendations] Load error:", err);
      setError("Failed to generate recommendations. Please try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Load history ──────────────────────────────────────────────────────────
  const loadHistory = useCallback(() => {
    const h = getRecommendationHistory();
    setHistory(h);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Asynchronously compiles recommendations and loads history on mode change
    loadRecommendations(activeMode);
    loadHistory();
  }, [activeMode, loadRecommendations, loadHistory]);

  // ─── Mode Switcher ─────────────────────────────────────────────────────────
  const switchMode = useCallback((mode: RecommendationMode) => {
    setActiveMode(mode);
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ─── Filter logic ──────────────────────────────────────────────────────────
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      if (filters.platform !== "all" && rec.platform !== filters.platform) return false;
      if (filters.difficulty !== "all" && rec.difficulty !== filters.difficulty) return false;
      if (filters.topic && !rec.topics.some((t) => t.toLowerCase().includes(filters.topic.toLowerCase()))) return false;
      if (filters.pattern && !rec.primaryPattern.toLowerCase().includes(filters.pattern.toLowerCase())) return false;
      if (filters.priority !== "all" && rec.priority !== filters.priority) return false;
      if (filters.timeBudgetMinutes !== null && rec.estimatedEffortMinutes > filters.timeBudgetMinutes) return false;
      if (filters.searchQuery && !rec.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !rec.topics.some((t) => t.toLowerCase().includes(filters.searchQuery.toLowerCase()))) return false;
      return true;
    });
  }, [recommendations, filters]);

  // Grouped by priority
  const priorityGroups = useMemo(() => {
    const groups: Record<RecommendationPriority, AdaptiveProblemRecommendation[]> = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
    };
    filteredRecommendations.forEach((r) => {
      groups[r.priority].push(r);
    });
    return groups;
  }, [filteredRecommendations]);

  // Top recommendation
  const topRecommendation = useMemo(() => {
    return filteredRecommendations[0] ?? null;
  }, [filteredRecommendations]);

  // ─── Feedback Actions ──────────────────────────────────────────────────────
  const handleFeedback = useCallback(
    (rec: AdaptiveProblemRecommendation, action: RecommendationFeedbackAction) => {
      logRecommendationFeedback(rec, action);
      loadHistory();

      if (action === "dismissed") {
        dismissProblem(rec.problemId);
        setRecommendations((prev) => prev.filter((r) => r.problemId !== rec.problemId));
      }
    },
    [loadHistory]
  );

  const handleSkip = useCallback(
    (rec: AdaptiveProblemRecommendation) => handleFeedback(rec, "skipped"),
    [handleFeedback]
  );

  const handleDismiss = useCallback(
    (rec: AdaptiveProblemRecommendation) => handleFeedback(rec, "dismissed"),
    [handleFeedback]
  );

  const handleMarkSolved = useCallback(
    (rec: AdaptiveProblemRecommendation) => handleFeedback(rec, "solved"),
    [handleFeedback]
  );

  const handleAddToRevision = useCallback(
    (rec: AdaptiveProblemRecommendation) => handleFeedback(rec, "added_to_revision"),
    [handleFeedback]
  );

  // ─── AI Coach ─────────────────────────────────────────────────────────────
  const openWhyModal = useCallback(async (rec: AdaptiveProblemRecommendation) => {
    setSelectedRec(rec);
    setCoachAdvice(null);
    setIsCoachLoading(true);
    try {
      const advice = await getAIRecommendationCoachAdvice(rec);
      setCoachAdvice(advice);
    } catch (err) {
      console.error("[useAdaptiveRecommendations] Coach error:", err);
    } finally {
      setIsCoachLoading(false);
    }
  }, []);

  const closeWhyModal = useCallback(() => {
    setSelectedRec(null);
    setCoachAdvice(null);
  }, []);

  // ─── History Analytics ─────────────────────────────────────────────────────
  const analytics = useMemo(() => getRecommendationAnalytics(history), [history]);

  return {
    recommendations,
    filteredRecommendations,
    priorityGroups,
    topRecommendation,
    isLoading,
    error,
    activeMode,
    switchMode,
    filters,
    setFilters,
    handleFeedback,
    handleSkip,
    handleDismiss,
    handleMarkSolved,
    handleAddToRevision,
    selectedRec,
    coachAdvice,
    isCoachLoading,
    openWhyModal,
    closeWhyModal,
    history,
    analytics,
    refresh: () => loadRecommendations(activeMode, true),
  };
}
