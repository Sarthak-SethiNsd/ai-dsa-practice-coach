"use client";

import {
  RecommendationMode,
  RecommendationFilterOptions,
  RECOMMENDATION_MODE_CONFIG,
} from "@/services/recommendations/recommendationTypes";
import { Platform, Difficulty } from "@/services/types";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Clock,
  Layers,
} from "lucide-react";

interface RecommendationFiltersProps {
  activeMode: RecommendationMode;
  onSwitchMode: (mode: RecommendationMode) => void;
  filters: RecommendationFilterOptions;
  onFiltersChange: (newFilters: RecommendationFilterOptions) => void;
  totalFilteredCount: number;
}

const MODES: RecommendationMode[] = [
  "smart_practice",
  "weakness_repair",
  "pattern_practice",
  "revision",
  "interview_prep",
  "contest_prep",
  "challenge",
  "goal_prep",
];

const PLATFORMS: { label: string; value: Platform | "all" }[] = [
  { label: "All Platforms", value: "all" },
  { label: "LeetCode", value: "leetcode" },
  { label: "Codeforces", value: "codeforces" },
];

const DIFFICULTIES: { label: string; value: Difficulty | "all" }[] = [
  { label: "All Difficulties", value: "all" },
  { label: "Easy", value: "Easy" },
  { label: "Medium", value: "Medium" },
  { label: "Hard", value: "Hard" },
];

const TIME_PRESETS: { label: string; value: number | null }[] = [
  { label: "Any Time", value: null },
  { label: "≤ 15m", value: 15 },
  { label: "≤ 30m", value: 30 },
  { label: "≤ 45m", value: 45 },
];

export function RecommendationFilters({
  activeMode,
  onSwitchMode,
  filters,
  onFiltersChange,
  totalFilteredCount,
}: RecommendationFiltersProps) {
  const handleReset = () => {
    onFiltersChange({
      platform: "all",
      difficulty: "all",
      topic: "",
      pattern: "",
      mode: "all",
      priority: "all",
      timeBudgetMinutes: null,
      searchQuery: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Horizontal Mode Presets Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Recommendation Mode Presets
          </span>
          <span className="text-[11px] font-bold text-sky-600">
            {totalFilteredCount} matching problems
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {MODES.map((modeKey) => {
            const config = RECOMMENDATION_MODE_CONFIG[modeKey];
            const isActive = activeMode === modeKey;

            return (
              <button
                key={modeKey}
                onClick={() => onSwitchMode(modeKey)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md ring-2 ring-sky-400/30"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
                title={config.description}
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchQuery: e.target.value })
            }
            placeholder="Search problems, topics, patterns..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform */}
          <select
            value={filters.platform}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                platform: e.target.value as Platform | "all",
              })
            }
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={filters.difficulty}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                difficulty: e.target.value as Difficulty | "all",
              })
            }
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Time Budget */}
          <select
            value={filters.timeBudgetMinutes === null ? "" : filters.timeBudgetMinutes}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                timeBudgetMinutes:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
          >
            {TIME_PRESETS.map((t, idx) => (
              <option key={idx} value={t.value === null ? "" : t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
