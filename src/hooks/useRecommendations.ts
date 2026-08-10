"use client";

import * as React from "react";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";
import { ReviewCollection } from "@/services/collectionTypes";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import { reviewCollectionStorage } from "@/services/reviewCollectionStorage";
import { generatePersonalizedRecommendations } from "@/services/recommendationEngine";
import {
  RecommendationSnapshot,
  RecommendationComparison,
  SmartActionCard,
} from "@/services/recommendationTypes";
import { recommendationHistoryStorage } from "@/services/recommendationHistoryStorage";

export interface UseRecommendationsReturn {
  loading: boolean;
  recommendation: RecommendationSnapshot;
  snapshots: RecommendationSnapshot[];
  comparison: RecommendationComparison | null;
  selectedBaselineId: string | null;
  actionCards: SmartActionCard[];
  saveCurrentSnapshot: () => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;
  selectBaselineForComparison: (id: string | null) => void;
  toggleActionCard: (id: string) => void;
  refresh: () => void;
}

export function useRecommendations(): UseRecommendationsReturn {
  const [entries, setEntries] = React.useState<ReviewHistoryEntry[]>([]);
  const [collections, setCollections] = React.useState<ReviewCollection[]>([]);
  const [snapshots, setSnapshots] = React.useState<RecommendationSnapshot[]>([]);
  const [selectedBaselineId, setSelectedBaselineId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshSignal, setRefreshSignal] = React.useState<number>(0);
  const [completedCardIds, setCompletedCardIds] = React.useState<Set<string>>(new Set());

  const refresh = React.useCallback(() => {
    setRefreshSignal((prev) => prev + 1);
  }, []);

  // Fetch underlying entries, collections, and saved snapshots
  React.useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [entriesData, collectionsData, snapshotsData] = await Promise.all([
          reviewHistoryStorage.getAllEntries(),
          reviewCollectionStorage.getAll(),
          recommendationHistoryStorage.getAllSnapshots(),
        ]);

        if (!isCancelled) {
          setEntries(entriesData);
          setCollections(collectionsData);
          setSnapshots(snapshotsData);
        }
      } catch (err) {
        console.error("[useRecommendations] Load error:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [refreshSignal]);

  // Memoized deterministic recommendation snapshot generation
  const recommendation = React.useMemo(() => {
    return generatePersonalizedRecommendations(entries, collections);
  }, [entries, collections]);

  // Merge completed states into smart action cards
  const actionCards = React.useMemo(() => {
    return recommendation.actionCards.map((card) => ({
      ...card,
      completed: completedCardIds.has(card.id),
    }));
  }, [recommendation.actionCards, completedCardIds]);

  // Save current recommendation as a snapshot
  const saveCurrentSnapshot = React.useCallback(async () => {
    try {
      const snapToSave: RecommendationSnapshot = {
        ...recommendation,
        id: `snap_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      await recommendationHistoryStorage.saveSnapshot(snapToSave);
      const updated = await recommendationHistoryStorage.getAllSnapshots();
      setSnapshots(updated);
    } catch (e) {
      console.error("[useRecommendations] Failed to save snapshot:", e);
    }
  }, [recommendation]);

  // Delete a snapshot
  const deleteSnapshot = React.useCallback(
    async (id: string) => {
      try {
        await recommendationHistoryStorage.deleteSnapshotById(id);
        const updated = await recommendationHistoryStorage.getAllSnapshots();
        setSnapshots(updated);
        if (selectedBaselineId === id) {
          setSelectedBaselineId(null);
        }
      } catch (e) {
        console.error("[useRecommendations] Failed to delete snapshot:", e);
      }
    },
    [selectedBaselineId]
  );

  // Toggle action card completed status
  const toggleActionCard = React.useCallback((id: string) => {
    setCompletedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Compute comparison if baseline selected
  const comparison = React.useMemo(() => {
    if (!selectedBaselineId) return null;
    const baseline = snapshots.find((s) => s.id === selectedBaselineId);
    if (!baseline) return null;
    return recommendationHistoryStorage.compareSnapshots(recommendation, baseline);
  }, [selectedBaselineId, snapshots, recommendation]);

  const selectBaselineForComparison = React.useCallback((id: string | null) => {
    setSelectedBaselineId(id);
  }, []);

  return {
    loading,
    recommendation,
    snapshots,
    comparison,
    selectedBaselineId,
    actionCards,
    saveCurrentSnapshot,
    deleteSnapshot,
    selectBaselineForComparison,
    toggleActionCard,
    refresh,
  };
}
