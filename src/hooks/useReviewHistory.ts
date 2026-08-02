"use client";

import * as React from "react";
import { ReviewHistoryEntry, ReviewHistorySummary } from "@/services/ai/aiTypes";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";

export interface UseReviewHistoryReturn {
  /** Lightweight summary list (no code/response body), newest first */
  summaries: ReviewHistorySummary[];
  loading: boolean;
  /** Fetch the full entry (code + AI response) for a given id */
  getFullReview: (id: string) => Promise<ReviewHistoryEntry | null>;
  /** Delete a single entry by id and refresh summaries */
  deleteReview: (id: string) => Promise<void>;
  /** Clear all history entries */
  clearHistory: () => Promise<void>;
  /** Manually re-fetch summaries from storage */
  refresh: () => void;
}

/**
 * useReviewHistory
 *
 * Client-side hook that exposes the full Review History API.
 * Reads from reviewHistoryStorage directly (localStorage in V1).
 * Re-mounting or calling refresh() re-fetches the list.
 */
export function useReviewHistory(): UseReviewHistoryReturn {
  const [summaries, setSummaries] = React.useState<ReviewHistorySummary[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshSignal, setRefreshSignal] = React.useState<number>(0);

  // Load summaries on mount and whenever refresh() is called
  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await reviewHistoryStorage.getAllSummaries();
        if (!cancelled) setSummaries(data);
      } catch (e) {
        console.error("[useReviewHistory] Failed to load summaries:", e);
        if (!cancelled) setSummaries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [refreshSignal]);

  const refresh = React.useCallback(() => {
    setRefreshSignal(n => n + 1);
  }, []);

  const getFullReview = React.useCallback(async (id: string): Promise<ReviewHistoryEntry | null> => {
    try {
      return await reviewHistoryStorage.getById(id);
    } catch (e) {
      console.error("[useReviewHistory] Failed to get full review:", e);
      return null;
    }
  }, []);

  const deleteReview = React.useCallback(async (id: string): Promise<void> => {
    try {
      await reviewHistoryStorage.deleteById(id);
      // Optimistically remove from list without a full reload
      setSummaries(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error("[useReviewHistory] Failed to delete review:", e);
    }
  }, []);

  const clearHistory = React.useCallback(async (): Promise<void> => {
    try {
      await reviewHistoryStorage.clearAll();
      setSummaries([]);
    } catch (e) {
      console.error("[useReviewHistory] Failed to clear history:", e);
    }
  }, []);

  return { summaries, loading, getFullReview, deleteReview, clearHistory, refresh };
}
