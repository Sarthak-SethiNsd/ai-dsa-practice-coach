"use client";

import * as React from "react";
import { ReviewCollection, CreateCollectionPayload, UpdateCollectionPayload } from "@/services/collectionTypes";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";
import { reviewCollectionStorage } from "@/services/reviewCollectionStorage";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import {
  CollectionAnalyticsResult,
  CollectionSortKey,
  computeCollectionItemAnalytics,
  sortCollections,
} from "@/services/questionCollectionAnalytics";

export interface UseQuestionCollectionsReturn {
  collections: ReviewCollection[];
  allEntries: ReviewHistoryEntry[];
  analyticsMap: Map<string, CollectionAnalyticsResult>;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortKey: CollectionSortKey;
  setSortKey: (k: CollectionSortKey) => void;
  filteredCollections: ReviewCollection[];
  getCollectionEntries: (col: ReviewCollection) => ReviewHistoryEntry[];
  createCollection: (payload: CreateCollectionPayload) => Promise<ReviewCollection>;
  updateCollection: (id: string, payload: UpdateCollectionPayload) => Promise<ReviewCollection | null>;
  deleteCollection: (id: string) => Promise<boolean>;
  duplicateCollection: (id: string) => Promise<ReviewCollection | null>;
  addReviewsToCollection: (collectionId: string, reviewIds: string[]) => Promise<boolean>;
  removeReviewFromCollection: (collectionId: string, reviewId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useQuestionCollections(): UseQuestionCollectionsReturn {
  const [collections, setCollections] = React.useState<ReviewCollection[]>([]);
  const [allEntries, setAllEntries] = React.useState<ReviewHistoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshSignal, setRefreshSignal] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<CollectionSortKey>("updated");

  const refresh = React.useCallback(() => setRefreshSignal((n) => n + 1), []);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [cols, entries] = await Promise.all([
          reviewCollectionStorage.getAll(),
          reviewHistoryStorage.getAllEntries(),
        ]);
        if (!cancelled) {
          setCollections(cols);
          setAllEntries(entries);
        }
      } catch (err) {
        console.error("[useQuestionCollections] load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [refreshSignal]);

  // Build analytics map for all collections
  const analyticsMap = React.useMemo(() => {
    const map = new Map<string, CollectionAnalyticsResult>();
    const entryMap = new Map(allEntries.map((e) => [e.id, e]));
    collections.forEach((col) => {
      const colEntries = col.reviewIds
        .map((id) => entryMap.get(id))
        .filter((e): e is ReviewHistoryEntry => Boolean(e));
      map.set(col.id, computeCollectionItemAnalytics(colEntries));
    });
    return map;
  }, [collections, allEntries]);

  // Filtered + sorted
  const filteredCollections = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? collections.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.description?.toLowerCase() ?? "").includes(q)
        )
      : collections;
    return sortCollections(filtered, sortKey, analyticsMap);
  }, [collections, searchQuery, sortKey, analyticsMap]);

  const getCollectionEntries = React.useCallback(
    (col: ReviewCollection): ReviewHistoryEntry[] => {
      const entryMap = new Map(allEntries.map((e) => [e.id, e]));
      return col.reviewIds
        .map((id) => entryMap.get(id))
        .filter((e): e is ReviewHistoryEntry => Boolean(e));
    },
    [allEntries]
  );

  const createCollection = React.useCallback(async (payload: CreateCollectionPayload) => {
    const created = await reviewCollectionStorage.create(payload);
    refresh();
    return created;
  }, [refresh]);

  const updateCollection = React.useCallback(async (id: string, payload: UpdateCollectionPayload) => {
    const updated = await reviewCollectionStorage.update(id, payload);
    refresh();
    return updated;
  }, [refresh]);

  const deleteCollection = React.useCallback(async (id: string) => {
    const ok = await reviewCollectionStorage.deleteById(id);
    if (ok) refresh();
    return ok;
  }, [refresh]);

  const duplicateCollection = React.useCallback(async (id: string) => {
    const dup = await reviewCollectionStorage.duplicate(id);
    if (dup) refresh();
    return dup;
  }, [refresh]);

  const addReviewsToCollection = React.useCallback(async (collectionId: string, reviewIds: string[]) => {
    const ok = await reviewCollectionStorage.addReviewsToCollection(collectionId, reviewIds);
    if (ok) refresh();
    return ok;
  }, [refresh]);

  const removeReviewFromCollection = React.useCallback(async (collectionId: string, reviewId: string) => {
    const ok = await reviewCollectionStorage.removeReviewFromCollection(collectionId, reviewId);
    if (ok) refresh();
    return ok;
  }, [refresh]);

  return {
    collections,
    allEntries,
    analyticsMap,
    loading,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    filteredCollections,
    getCollectionEntries,
    createCollection,
    updateCollection,
    deleteCollection,
    duplicateCollection,
    addReviewsToCollection,
    removeReviewFromCollection,
    refresh,
  };
}
