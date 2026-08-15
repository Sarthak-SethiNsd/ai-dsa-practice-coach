"use client";

import * as React from "react";
import {
  ContestEntry,
  ContestPlatform,
  ContestSortField,
  ContestSortDir,
} from "@/services/contest/contestTypes";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Plus,
  Trash2,
  Filter,
} from "lucide-react";

interface Props {
  entries: ContestEntry[];
  platformFilter: ContestPlatform | "all";
  onFilterChange: (f: ContestPlatform | "all") => void;
  sortBy: ContestSortField;
  onSortChange: (s: ContestSortField) => void;
  sortDir: ContestSortDir;
  onSortDirChange: (d: ContestSortDir) => void;
  onAddContest: () => void;
  onDeleteContest: (id: string) => void;
}

const PLATFORM_LABELS: Record<ContestPlatform, string> = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
  atcoder: "AtCoder",
  other: "Other",
};

const PLATFORM_COLORS: Record<ContestPlatform, string> = {
  codeforces: "bg-blue-100 text-blue-700 border-blue-200",
  leetcode: "bg-orange-100 text-orange-700 border-orange-200",
  atcoder: "bg-emerald-100 text-emerald-700 border-emerald-200",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

function SortButton({
  field,
  label,
  currentSort,
  currentDir,
  onSort,
}: {
  field: ContestSortField;
  label: string;
  currentSort: ContestSortField;
  currentDir: ContestSortDir;
  onSort: (f: ContestSortField) => void;
}) {
  const isActive = currentSort === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
        isActive ? "text-sky-600" : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {label}
      {isActive ? (
        currentDir === "asc" ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
      )}
    </button>
  );
}

function RatingDeltaBadge({ delta }: { delta: number }) {
  if (delta > 0)
    return (
      <span className="flex items-center gap-0.5 text-xs font-extrabold text-emerald-600">
        <TrendingUp className="w-3 h-3" />+{delta}
      </span>
    );
  if (delta < 0)
    return (
      <span className="flex items-center gap-0.5 text-xs font-extrabold text-rose-600">
        <TrendingDown className="w-3 h-3" />
        {delta}
      </span>
    );
  return (
    <span className="text-xs font-bold text-slate-400">±0</span>
  );
}

function PerformanceBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-emerald-100 text-emerald-700"
      : score >= 50
      ? "bg-sky-100 text-sky-700"
      : score >= 30
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${color}`}>
      {score}
    </span>
  );
}

export function ContestHistoryTable({
  entries,
  platformFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  sortDir,
  onSortDirChange,
  onAddContest,
  onDeleteContest,
}: Props) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const handleSort = (field: ContestSortField) => {
    if (sortBy === field) {
      onSortDirChange(sortDir === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field);
      onSortDirChange("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Platform Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" />
            Platform
          </span>
          {(["all", "codeforces", "leetcode", "atcoder", "other"] as const).map(
            (platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => onFilterChange(platform === "all" ? "all" : platform)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  platformFilter === platform
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {platform === "all"
                  ? "All"
                  : PLATFORM_LABELS[platform as ContestPlatform]}
              </button>
            )
          )}
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={onAddContest}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Log Contest
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto_auto] gap-x-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Contest</span>
          <SortButton
            field="date"
            label="Date"
            currentSort={sortBy}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <span>Platform</span>
          <SortButton
            field="rank"
            label="Rank"
            currentSort={sortBy}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <SortButton
            field="rating"
            label="Rating Δ"
            currentSort={sortBy}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <span>Solved</span>
          <SortButton
            field="performance"
            label="Score"
            currentSort={sortBy}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <span className="sr-only">Actions</span>
        </div>

        {/* Rows */}
        {entries.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">
              No contests found. Log your first contest!
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <React.Fragment key={entry.id}>
              <div
                className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto_auto] gap-x-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                onClick={() =>
                  setExpandedId((id) => (id === entry.id ? null : entry.id))
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${
                      expandedId === entry.id ? "rotate-180" : ""
                    }`}
                  />
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {entry.contestName}
                  </span>
                </div>
                <span className="text-sm text-slate-500 font-medium tabular-nums whitespace-nowrap self-center">
                  {entry.date}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border self-center whitespace-nowrap ${
                    PLATFORM_COLORS[entry.platform]
                  }`}
                >
                  {PLATFORM_LABELS[entry.platform]}
                </span>
                <span className="text-sm font-bold text-slate-700 tabular-nums self-center whitespace-nowrap">
                  #{entry.rank.toLocaleString()}
                </span>
                <div className="self-center">
                  <RatingDeltaBadge delta={entry.ratingChange} />
                </div>
                <span className="text-sm font-semibold text-slate-600 self-center whitespace-nowrap">
                  {entry.problemsSolved}/{entry.totalProblems}
                </span>
                <div className="self-center">
                  <PerformanceBadge score={entry.performanceScore} />
                </div>
                <div
                  className="self-center flex items-center justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {deleteConfirmId === entry.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteContest(entry.id);
                          setDeleteConfirmId(null);
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(entry.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer rounded"
                      title="Delete contest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === entry.id && (
                <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Rating
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {entry.ratingBefore} → {entry.ratingAfter}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Participants
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {entry.totalParticipants.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Time Spent
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {entry.timeSpentMinutes} min
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Penalty
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {entry.problemBreakdown.penaltyMinutes} min
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Target className="w-3 h-3" /> Easy
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {entry.problemBreakdown.easySolved}/
                        {entry.problemBreakdown.easyAttempted}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Medium
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {entry.problemBreakdown.mediumSolved}/
                        {entry.problemBreakdown.mediumAttempted}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Hard
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {entry.problemBreakdown.hardSolved}/
                        {entry.problemBreakdown.hardAttempted}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Time Efficiency
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {entry.problemBreakdown.timeEfficiencyScore}/100
                      </p>
                    </div>
                  </div>
                  {entry.problemBreakdown.topicsAttempted.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.problemBreakdown.topicsAttempted.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-xs font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.notes && (
                    <p className="mt-3 text-sm text-slate-500 italic border-t border-slate-200 pt-3">
                      &ldquo;{entry.notes}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
