"use client";

import * as React from "react";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import { reviewCollectionStorage } from "@/services/reviewCollectionStorage";
import { generatePersonalizedRecommendations } from "@/services/recommendationEngine";
import { roadmapStorage } from "@/services/roadmapStorage";
import { generatePracticeRoadmap } from "@/services/roadmapEngine";
import { generateQuestionRecommendations } from "@/services/questionRecommendationEngine";
import { questionRecommendationStorage } from "@/services/questionRecommendationStorage";
import {
  RecommendationBatch,
  QuestionRecommendation,
  QuestionAnalytics,
  QuestionRecommendationFilter,
} from "@/services/questionRecommendationTypes";

export interface UseQuestionRecommendationsReturn {
  loading: boolean;
  refreshing: boolean;
  batch: RecommendationBatch | null;
  questions: QuestionRecommendation[];
  filteredQuestions: QuestionRecommendation[];
  topRecommendations: QuestionRecommendation[];
  stretchChallenges: QuestionRecommendation[];
  confidenceBuilders: QuestionRecommendation[];
  interviewPrep: QuestionRecommendation[];
  solvedIds: Set<string>;
  skippedIds: Set<string>;
  viewedIds: Set<string>;
  analytics: QuestionAnalytics;
  filters: QuestionRecommendationFilter;
  setFilters: React.Dispatch<React.SetStateAction<QuestionRecommendationFilter>>;
  generateRecommendations: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  markSolved: (questionId: string) => Promise<void>;
  markSkipped: (questionId: string) => Promise<void>;
  markViewed: (questionId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const DEFAULT_FILTERS: QuestionRecommendationFilter = {
  platform: "All",
  difficulty: "All",
  topic: "All",
  category: "All",
  status: "All",
};

export function useQuestionRecommendations(): UseQuestionRecommendationsReturn {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [batch, setBatch] = React.useState<RecommendationBatch | null>(null);
  const [solvedMap, setSolvedMap] = React.useState<Record<string, string>>({});
  const [skippedMap, setSkippedMap] = React.useState<Record<string, string>>({});
  const [viewedMap, setViewedMap] = React.useState<Record<string, string>>({});
  const [filters, setFilters] = React.useState<QuestionRecommendationFilter>(DEFAULT_FILTERS);

  // ─── Initial Load ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [savedBatch, solvedData, skippedData, viewedData] = await Promise.all([
          questionRecommendationStorage.getBatch(),
          questionRecommendationStorage.getSolved(),
          questionRecommendationStorage.getSkipped(),
          questionRecommendationStorage.getViewed(),
        ]);

        if (cancelled) return;

        setSolvedMap(solvedData);
        setSkippedMap(skippedData);
        setViewedMap(viewedData);

        if (savedBatch) {
          setBatch(savedBatch);
        } else {
          // Auto-generate if no batch exists yet
          await autoGenerateInternal(solvedData, skippedData);
        }
      } catch (err) {
        console.error("[useQuestionRecommendations] Initial load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Internal generator helper
  const autoGenerateInternal = async (
    solved: Record<string, string>,
    skipped: Record<string, string>
  ) => {
    try {
      const [entries, collections, savedRoadmap] = await Promise.all([
        reviewHistoryStorage.getAllEntries(),
        reviewCollectionStorage.getAll(),
        roadmapStorage.getRoadmap(),
      ]);

      const recSnapshot = generatePersonalizedRecommendations(entries, collections);
      const activeRoadmap = savedRoadmap ?? generatePracticeRoadmap(recSnapshot, entries, collections);

      const solvedSet = new Set(Object.keys(solved));
      const skippedSet = new Set(Object.keys(skipped));

      const newBatch = await generateQuestionRecommendations({
        entries,
        collections,
        recommendation: recSnapshot,
        roadmap: activeRoadmap,
        solvedQuestionIds: solvedSet,
        skippedQuestionIds: skippedSet,
      });

      await questionRecommendationStorage.saveBatch(newBatch);
      setBatch(newBatch);
    } catch (err) {
      console.error("[useQuestionRecommendations] Auto generate error:", err);
    }
  };

  // ─── Generate Actions ───────────────────────────────────────────────────────
  const generateRecommendations = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await autoGenerateInternal(solvedMap, skippedMap);
    } finally {
      setRefreshing(false);
    }
  }, [solvedMap, skippedMap]);

  const refreshRecommendations = React.useCallback(async () => {
    await generateRecommendations();
  }, [generateRecommendations]);

  // ─── Interaction Handlers ───────────────────────────────────────────────────
  const markSolved = React.useCallback(async (questionId: string) => {
    await questionRecommendationStorage.markSolved(questionId);
    setSolvedMap((prev) => ({ ...prev, [questionId]: new Date().toISOString() }));
  }, []);

  const markSkipped = React.useCallback(async (questionId: string) => {
    await questionRecommendationStorage.markSkipped(questionId);
    setSkippedMap((prev) => ({ ...prev, [questionId]: new Date().toISOString() }));
  }, []);

  const markViewed = React.useCallback(async (questionId: string) => {
    await questionRecommendationStorage.markViewed(questionId);
    setViewedMap((prev) => ({ ...prev, [questionId]: new Date().toISOString() }));
  }, []);

  const clearHistory = React.useCallback(async () => {
    await questionRecommendationStorage.clearHistory();
    setSolvedMap({});
    setSkippedMap({});
    setViewedMap({});
  }, []);

  // ─── Derived State & Categories ──────────────────────────────────────────────
  const solvedIds = React.useMemo(() => new Set(Object.keys(solvedMap)), [solvedMap]);
  const skippedIds = React.useMemo(() => new Set(Object.keys(skippedMap)), [skippedMap]);
  const viewedIds = React.useMemo(() => new Set(Object.keys(viewedMap)), [viewedMap]);

  const rawQuestions = React.useMemo(() => {
    if (!batch) return [];
    return batch.recommendedQuestions.map((q) => {
      let status = q.status;
      if (solvedIds.has(q.id)) status = "Solved";
      else if (skippedIds.has(q.id)) status = "Skipped";
      else if (viewedIds.has(q.id)) status = "Viewed";

      return { ...q, status };
    });
  }, [batch, solvedIds, skippedIds, viewedIds]);

  // Filtered questions
  const filteredQuestions = React.useMemo(() => {
    return rawQuestions.filter((q) => {
      if (filters.platform !== "All" && q.platform !== filters.platform) return false;
      if (filters.difficulty !== "All" && q.difficulty !== filters.difficulty) return false;
      if (filters.topic !== "All" && q.topic !== filters.topic) return false;
      if (filters.category !== "All" && q.category !== filters.category) return false;
      if (filters.status !== "All" && q.status !== filters.status) return false;
      return true;
    });
  }, [rawQuestions, filters]);

  // Categorized lists
  const topRecommendations = React.useMemo(
    () => rawQuestions.filter((q) => q.category === "Top Recommendation"),
    [rawQuestions]
  );
  const stretchChallenges = React.useMemo(
    () => rawQuestions.filter((q) => q.category === "Stretch Challenge"),
    [rawQuestions]
  );
  const confidenceBuilders = React.useMemo(
    () => rawQuestions.filter((q) => q.category === "Confidence Builder"),
    [rawQuestions]
  );
  const interviewPrep = React.useMemo(
    () => rawQuestions.filter((q) => q.category === "Interview Preparation"),
    [rawQuestions]
  );

  // ─── Analytics Calculation ──────────────────────────────────────────────────
  const analytics = React.useMemo<QuestionAnalytics>(() => {
    const totalRecommended = rawQuestions.length;
    const solvedCount = rawQuestions.filter((q) => q.status === "Solved").length;
    const skippedCount = rawQuestions.filter((q) => q.status === "Skipped").length;
    const viewedCount = rawQuestions.filter((q) => q.status === "Viewed").length;
    const ignoredCount = Math.max(0, totalRecommended - solvedCount - skippedCount);

    const topicCounts = new Map<string, number>();
    rawQuestions.forEach((q) => {
      topicCounts.set(q.topic, (topicCounts.get(q.topic) || 0) + 1);
    });

    const mostRecommendedTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    const successRate =
      totalRecommended > 0 ? Math.round((solvedCount / totalRecommended) * 100) : 0;

    // Accuracy score based on alignment confidence and interaction ratio
    const avgConfidence =
      totalRecommended > 0
        ? rawQuestions.reduce((acc, q) => acc + q.confidenceScore, 0) / totalRecommended
        : 85;

    const interactionFactor =
      totalRecommended > 0
        ? ((solvedCount + viewedCount * 0.5) / totalRecommended) * 15
        : 0;

    const recommendationAccuracy = Math.min(
      98,
      Math.max(65, Math.round(avgConfidence * 0.85 + interactionFactor))
    );

    return {
      mostRecommendedTopics,
      solvedRecommendations: solvedCount,
      ignoredRecommendations: ignoredCount,
      skippedRecommendations: skippedCount,
      totalRecommended,
      successRate,
      recommendationAccuracy,
    };
  }, [rawQuestions]);

  return {
    loading,
    refreshing,
    batch,
    questions: rawQuestions,
    filteredQuestions,
    topRecommendations,
    stretchChallenges,
    confidenceBuilders,
    interviewPrep,
    solvedIds,
    skippedIds,
    viewedIds,
    analytics,
    filters,
    setFilters,
    generateRecommendations,
    refreshRecommendations,
    markSolved,
    markSkipped,
    markViewed,
    clearHistory,
  };
}
