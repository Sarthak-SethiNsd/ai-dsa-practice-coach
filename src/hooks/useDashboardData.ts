"use client";

import * as React from "react";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";
import { ReviewCollection } from "@/services/collectionTypes";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import { reviewCollectionStorage } from "@/services/reviewCollectionStorage";
import {
  DashboardFiltersState,
  DEFAULT_DASHBOARD_FILTERS,
  DashboardStats,
  TimeSeriesPoint,
  Distributions,
  ImprovementAnalytics,
  CollectionAnalytics,
  AchievementBadge,
} from "@/services/dashboardTypes";
import {
  filterEntries,
  computeDashboardStats,
  computeTimeSeriesData,
  computeDistributions,
  computeImprovementAnalytics,
  computeCollectionAnalytics,
  computeAchievements,
} from "@/services/dashboardAnalytics";

export interface UseDashboardDataReturn {
  loading: boolean;
  filters: DashboardFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFiltersState>>;
  resetFilters: () => void;
  rawEntries: ReviewHistoryEntry[];
  filteredEntries: ReviewHistoryEntry[];
  collections: ReviewCollection[];
  availableLanguages: string[];
  availableCategories: string[];
  availableProviders: string[];
  availableModels: string[];
  stats: DashboardStats;
  timeSeries: TimeSeriesPoint[];
  distributions: Distributions;
  improvements: ImprovementAnalytics;
  collectionAnalytics: CollectionAnalytics;
  achievements: AchievementBadge[];
  refresh: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [rawEntries, setRawEntries] = React.useState<ReviewHistoryEntry[]>([]);
  const [collections, setCollections] = React.useState<ReviewCollection[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [filters, setFilters] = React.useState<DashboardFiltersState>(
    DEFAULT_DASHBOARD_FILTERS
  );
  const [refreshSignal, setRefreshSignal] = React.useState<number>(0);

  const refresh = React.useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters(DEFAULT_DASHBOARD_FILTERS);
  }, []);

  // Fetch raw history and collections
  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [entriesData, collectionsData] = await Promise.all([
          reviewHistoryStorage.getAllEntries(),
          reviewCollectionStorage.getAll(),
        ]);

        if (!cancelled) {
          setRawEntries(entriesData);
          setCollections(collectionsData);
        }
      } catch (err) {
        console.error("[useDashboardData] Load error:", err);
        if (!cancelled) {
          setRawEntries([]);
          setCollections([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  // Derived available filter options
  const availableLanguages = React.useMemo(() => {
    return Array.from(new Set(rawEntries.map((e) => e.language))).sort();
  }, [rawEntries]);

  const availableCategories = React.useMemo(() => {
    return Array.from(new Set(rawEntries.map((e) => e.category))).sort();
  }, [rawEntries]);

  const availableProviders = React.useMemo(() => {
    return Array.from(
      new Set(rawEntries.map((e) => e.usage?.service || "ReviewAI"))
    ).sort();
  }, [rawEntries]);

  const availableModels = React.useMemo(() => {
    return Array.from(
      new Set(rawEntries.map((e) => e.model || "Default"))
    ).sort();
  }, [rawEntries]);

  // Filtered entries
  const filteredEntries = React.useMemo(() => {
    return filterEntries(rawEntries, collections, filters);
  }, [rawEntries, collections, filters]);

  // Memoized top-level stats
  const stats = React.useMemo(() => {
    return computeDashboardStats(filteredEntries, collections);
  }, [filteredEntries, collections]);

  // Time series
  const timeSeries = React.useMemo(() => {
    return computeTimeSeriesData(filteredEntries);
  }, [filteredEntries]);

  // Distributions
  const distributions = React.useMemo(() => {
    return computeDistributions(filteredEntries);
  }, [filteredEntries]);

  // Improvements
  const improvements = React.useMemo(() => {
    return computeImprovementAnalytics(filteredEntries);
  }, [filteredEntries]);

  // Collection Analytics
  const collectionAnalytics = React.useMemo(() => {
    return computeCollectionAnalytics(filteredEntries, collections);
  }, [filteredEntries, collections]);

  // Achievements (computed against all historical entries)
  const achievements = React.useMemo(() => {
    return computeAchievements(rawEntries);
  }, [rawEntries]);

  return {
    loading,
    filters,
    setFilters,
    resetFilters,
    rawEntries,
    filteredEntries,
    collections,
    availableLanguages,
    availableCategories,
    availableProviders,
    availableModels,
    stats,
    timeSeries,
    distributions,
    improvements,
    collectionAnalytics,
    achievements,
    refresh,
  };
}
