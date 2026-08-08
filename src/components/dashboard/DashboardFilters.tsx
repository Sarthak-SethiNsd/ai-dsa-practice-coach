"use client";

import * as React from "react";
import {
  DashboardFiltersState,
  DateRangeFilter,
  DEFAULT_DASHBOARD_FILTERS,
} from "@/services/dashboardTypes";
import { ReviewCollection } from "@/services/collectionTypes";
import { ReviewCategory } from "@/services/ai/aiTypes";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  OPTIMAL_COMPLEXITY: "Optimal Complexity",
  OPTIMAL_HINTS: "Optimal Hints",
  OPTIMAL_FULL_SOLUTION: "Optimal Full Solution",
  MY_COMPLEXITY: "My Complexity",
  CORRECTNESS_CHECK: "Correctness Check",
  EDGE_CASE_ANALYSIS: "Edge Case Analysis",
  MY_HINTS: "My Hints",
  FULL_CODE_REVIEW: "Full Code Review",
};

interface DashboardFiltersProps {
  filters: DashboardFiltersState;
  onChange: React.Dispatch<React.SetStateAction<DashboardFiltersState>>;
  onReset: () => void;
  availableLanguages: string[];
  availableCategories: string[];
  availableProviders: string[];
  availableModels: string[];
  collections: ReviewCollection[];
  resultCount: number;
  totalCount: number;
}

export function DashboardFilters({
  filters,
  onChange,
  onReset,
  availableLanguages,
  availableCategories,
  availableProviders,
  availableModels,
  collections,
  resultCount,
  totalCount,
}: DashboardFiltersProps) {
  const isFiltered =
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_DASHBOARD_FILTERS);

  const updateFilter = <K extends keyof DashboardFiltersState>(
    key: K,
    val: DashboardFiltersState[K]
  ) => {
    onChange((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold text-slate-800">
            Analytics Filters
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            (Showing {resultCount} of {totalCount} reviews)
          </span>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-sky-600 hover:text-sky-700 font-bold gap-1 p-1 h-7"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </Button>
        )}
      </div>

      {/* Select Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* Date Range */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Timeframe
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) =>
              updateFilter("dateRange", e.target.value as DateRangeFilter)
            }
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">Past Year</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Language
          </label>
          <select
            value={filters.language}
            onChange={(e) => updateFilter("language", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              updateFilter("category", e.target.value as ReviewCategory | "all")
            }
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat as ReviewCategory] || cat}
              </option>
            ))}
          </select>
        </div>

        {/* Provider */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            AI Provider
          </label>
          <select
            value={filters.provider}
            onChange={(e) => updateFilter("provider", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Providers</option>
            {availableProviders.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Model
          </label>
          <select
            value={filters.model}
            onChange={(e) => updateFilter("model", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Models</option>
            {availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Collection */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Collection
          </label>
          <select
            value={filters.collectionId}
            onChange={(e) => updateFilter("collectionId", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name} ({col.reviewIds.length})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
