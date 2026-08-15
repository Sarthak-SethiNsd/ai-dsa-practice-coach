"use client";

import * as React from "react";
import {
  FullContestIntelligence,
  ContestEntry,
  ContestGoal,
  ContestPlatform,
  ContestSortField,
  ContestSortDir,
} from "@/services/contest/contestTypes";
import { computeFullContestIntelligence } from "@/services/contest/contestEngine";
import { contestStorage } from "@/services/contest/contestStorage";

export interface UseContestIntelligenceReturn {
  intelligence: FullContestIntelligence | null;
  loading: boolean;
  platformFilter: ContestPlatform | "all";
  setPlatformFilter: (f: ContestPlatform | "all") => void;
  sortBy: ContestSortField;
  setSortBy: (s: ContestSortField) => void;
  sortDir: ContestSortDir;
  setSortDir: (d: ContestSortDir) => void;
  filteredEntries: ContestEntry[];
  addContest: (entry: Omit<ContestEntry, "id" | "createdAt">) => Promise<ContestEntry>;
  deleteContest: (id: string) => Promise<boolean>;
  addGoal: (
    goal: Omit<ContestGoal, "id" | "createdAt" | "completionPercentage" | "status">
  ) => Promise<ContestGoal>;
  deleteGoal: (id: string) => Promise<boolean>;
  refresh: () => void;
}

export function useContestIntelligence(): UseContestIntelligenceReturn {
  const [intelligence, setIntelligence] =
    React.useState<FullContestIntelligence | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshSignal, setRefreshSignal] = React.useState(0);
  const [platformFilter, setPlatformFilter] = React.useState<
    ContestPlatform | "all"
  >("all");
  const [sortBy, setSortBy] = React.useState<ContestSortField>("date");
  const [sortDir, setSortDir] = React.useState<ContestSortDir>("desc");

  const refresh = React.useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  // Load & compute
  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [entries, goals] = await Promise.all([
          contestStorage.getEntries(),
          contestStorage.getGoals(),
        ]);

        if (cancelled) return;

        const computed = computeFullContestIntelligence(entries, goals);
        setIntelligence(computed);
      } catch (err) {
        console.error("[useContestIntelligence] Load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  // Derived: filtered + sorted entries
  const filteredEntries = React.useMemo<ContestEntry[]>(() => {
    if (!intelligence) return [];
    let entries = [...intelligence.entries];

    if (platformFilter !== "all") {
      entries = entries.filter((e) => e.platform === platformFilter);
    }

    entries.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      else if (sortBy === "rank") cmp = a.rank - b.rank;
      else if (sortBy === "rating") cmp = a.ratingChange - b.ratingChange;
      else if (sortBy === "performance")
        cmp = a.performanceScore - b.performanceScore;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return entries;
  }, [intelligence, platformFilter, sortBy, sortDir]);

  // CRUD
  const addContest = React.useCallback(
    async (entry: Omit<ContestEntry, "id" | "createdAt">) => {
      const newEntry = await contestStorage.addEntry(entry);
      refresh();
      return newEntry;
    },
    [refresh]
  );

  const deleteContest = React.useCallback(
    async (id: string) => {
      const ok = await contestStorage.deleteEntry(id);
      if (ok) refresh();
      return ok;
    },
    [refresh]
  );

  const addGoal = React.useCallback(
    async (
      goal: Omit<ContestGoal, "id" | "createdAt" | "completionPercentage" | "status">
    ) => {
      const newGoal = await contestStorage.addGoal(goal);
      refresh();
      return newGoal;
    },
    [refresh]
  );

  const deleteGoal = React.useCallback(
    async (id: string) => {
      const ok = await contestStorage.deleteGoal(id);
      if (ok) refresh();
      return ok;
    },
    [refresh]
  );

  return {
    intelligence,
    loading,
    platformFilter,
    setPlatformFilter,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    filteredEntries,
    addContest,
    deleteContest,
    addGoal,
    deleteGoal,
    refresh,
  };
}
