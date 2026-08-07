"use client";

import * as React from "react";
import {
  ReviewCollection,
  CreateCollectionPayload,
  UpdateCollectionPayload,
  CollectionStats,
} from "@/services/collectionTypes";
import { reviewCollectionStorage } from "@/services/reviewCollectionStorage";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";

export interface UseReviewCollectionsReturn {
  collections: ReviewCollection[];
  loading: boolean;
  createCollection: (payload: CreateCollectionPayload) => Promise<ReviewCollection>;
  updateCollection: (id: string, payload: UpdateCollectionPayload) => Promise<ReviewCollection | null>;
  deleteCollection: (id: string) => Promise<boolean>;
  duplicateCollection: (id: string) => Promise<ReviewCollection | null>;
  addReviewsToCollection: (collectionId: string, reviewIds: string[]) => Promise<boolean>;
  removeReviewFromCollection: (collectionId: string, reviewId: string) => Promise<boolean>;
  getCollectionsForReview: (reviewId: string) => ReviewCollection[];
  calculateStats: (entries: ReviewHistoryEntry[]) => CollectionStats;
  refresh: () => void;
}

export function useReviewCollections(validReviewIds?: string[]): UseReviewCollectionsReturn {
  const [collections, setCollections] = React.useState<ReviewCollection[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshSignal, setRefreshSignal] = React.useState<number>(0);

  const refresh = React.useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  const validReviewIdsJoined = validReviewIds?.join(",");

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (validReviewIdsJoined !== undefined) {
          const ids = validReviewIdsJoined ? validReviewIdsJoined.split(",") : [];
          await reviewCollectionStorage.cleanupOrphanedReviewIds(ids);
        }
        const data = await reviewCollectionStorage.getAll();
        if (!cancelled) setCollections(data);
      } catch (err) {
        console.error("[useReviewCollections] Load error:", err);
        if (!cancelled) setCollections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshSignal, validReviewIdsJoined]);

  const createCollection = React.useCallback(
    async (payload: CreateCollectionPayload) => {
      const created = await reviewCollectionStorage.create(payload);
      refresh();
      return created;
    },
    [refresh]
  );

  const updateCollection = React.useCallback(
    async (id: string, payload: UpdateCollectionPayload) => {
      const updated = await reviewCollectionStorage.update(id, payload);
      refresh();
      return updated;
    },
    [refresh]
  );

  const deleteCollection = React.useCallback(
    async (id: string) => {
      const success = await reviewCollectionStorage.deleteById(id);
      if (success) refresh();
      return success;
    },
    [refresh]
  );

  const duplicateCollection = React.useCallback(
    async (id: string) => {
      const dup = await reviewCollectionStorage.duplicate(id);
      if (dup) refresh();
      return dup;
    },
    [refresh]
  );

  const addReviewsToCollection = React.useCallback(
    async (collectionId: string, reviewIds: string[]) => {
      const ok = await reviewCollectionStorage.addReviewsToCollection(collectionId, reviewIds);
      if (ok) refresh();
      return ok;
    },
    [refresh]
  );

  const removeReviewFromCollection = React.useCallback(
    async (collectionId: string, reviewId: string) => {
      const ok = await reviewCollectionStorage.removeReviewFromCollection(collectionId, reviewId);
      if (ok) refresh();
      return ok;
    },
    [refresh]
  );

  const getCollectionsForReview = React.useCallback(
    (reviewId: string) => {
      return collections.filter((c) => c.reviewIds.includes(reviewId));
    },
    [collections]
  );

  const calculateStats = React.useCallback((entries: ReviewHistoryEntry[]): CollectionStats => {
    if (entries.length === 0) {
      return {
        totalReviews: 0,
        languagesUsed: [],
        categoriesCovered: [],
        avgTokens: 0,
        avgDurationMs: 0,
        firstReviewDate: null,
        latestReviewDate: null,
      };
    }

    const langs = Array.from(new Set(entries.map((e) => e.language)));
    const cats = Array.from(new Set(entries.map((e) => e.category)));

    const totalTokens = entries.reduce((acc, e) => acc + (e.usage?.totalTokens || 0), 0);
    const totalDuration = entries.reduce((acc, e) => acc + (e.durationMs || 0), 0);

    const sortedDates = entries
      .map((e) => new Date(e.timestamp).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b);

    return {
      totalReviews: entries.length,
      languagesUsed: langs,
      categoriesCovered: cats,
      avgTokens: Math.round(totalTokens / entries.length),
      avgDurationMs: Math.round(totalDuration / entries.length),
      firstReviewDate: sortedDates.length > 0 ? new Date(sortedDates[0]).toISOString() : null,
      latestReviewDate:
        sortedDates.length > 0 ? new Date(sortedDates[sortedDates.length - 1]).toISOString() : null,
    };
  }, []);

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    duplicateCollection,
    addReviewsToCollection,
    removeReviewFromCollection,
    getCollectionsForReview,
    calculateStats,
    refresh,
  };
}
