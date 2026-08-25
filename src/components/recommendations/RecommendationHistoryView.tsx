"use client";

import { useState } from "react";
import {
  RecommendationHistoryItem,
  RecommendationFeedbackAction,
} from "@/services/recommendations/recommendationTypes";
import { clearDismissals } from "@/services/recommendations/recommendationHistory";
import {
  History,
  CheckCircle2,
  XCircle,
  SkipForward,
  BookOpen,
  Trash2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface RecommendationHistoryViewProps {
  history: RecommendationHistoryItem[];
  analytics: {
    total: number;
    solved: number;
    failed: number;
    skipped: number;
    dismissed: number;
    addedToRevision: number;
    solvedIndependently: number;
    solveRate: number;
    topTopics: { topic: string; count: number }[];
  };
  onRefresh: () => void;
}

const ACTION_BADGES: Record<
  RecommendationFeedbackAction,
  { label: string; bg: string; text: string }
> = {
  accepted: { label: "Accepted", bg: "bg-sky-100", text: "text-sky-800" },
  solved: { label: "Solved", bg: "bg-emerald-100", text: "text-emerald-800" },
  solved_independently: {
    label: "Solved (No Hints)",
    bg: "bg-emerald-100",
    text: "text-emerald-900",
  },
  solved_with_hints: {
    label: "Solved (With Hints)",
    bg: "bg-teal-100",
    text: "text-teal-800",
  },
  failed: { label: "Failed / Retry", bg: "bg-rose-100", text: "text-rose-800" },
  skipped: { label: "Skipped", bg: "bg-slate-100", text: "text-slate-700" },
  dismissed: { label: "Dismissed", bg: "bg-slate-200", text: "text-slate-600" },
  added_to_revision: {
    label: "Added to SRS",
    bg: "bg-purple-100",
    text: "text-purple-800",
  },
};

export function RecommendationHistoryView({
  history,
  analytics,
  onRefresh,
}: RecommendationHistoryViewProps) {
  const [filterAction, setFilterAction] = useState<string>("all");

  const filteredHistory = history.filter((item) => {
    if (filterAction === "all") return true;
    return item.action === filterAction;
  });

  const handleClearDismissed = () => {
    clearDismissals();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Logged
          </span>
          <div className="text-xl font-extrabold font-mono text-slate-900">
            {analytics.total}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Solve Rate
          </span>
          <div className="text-xl font-extrabold font-mono text-emerald-600">
            {analytics.solveRate}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Solved Total
          </span>
          <div className="text-xl font-extrabold font-mono text-emerald-600">
            {analytics.solved}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Independent Solves
          </span>
          <div className="text-xl font-extrabold font-mono text-sky-600">
            {analytics.solvedIndependently}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Added to SRS
          </span>
          <div className="text-xl font-extrabold font-mono text-purple-600">
            {analytics.addedToRevision}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Dismissed / Cooldown
          </span>
          <div className="text-xl font-extrabold font-mono text-slate-500">
            {analytics.dismissed}
          </div>
        </div>
      </div>

      {/* Top Topics Distribution */}
      {analytics.topTopics.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Most Recommended Practice Topics
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {analytics.topTopics.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                {item.topic} <span className="text-slate-400 font-mono">({item.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* History Table Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Filter Outcome:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
          >
            <option value="all">All Outcomes ({history.length})</option>
            <option value="solved">Solved</option>
            <option value="solved_independently">Solved (No Hints)</option>
            <option value="failed">Failed</option>
            <option value="skipped">Skipped</option>
            <option value="added_to_revision">Added to SRS</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <button
          onClick={handleClearDismissed}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Dismissal Cooldowns</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No recommendation history matches this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map((item) => {
              const badge = ACTION_BADGES[item.action] || {
                label: item.action,
                bg: "bg-slate-100",
                text: "text-slate-700",
              };

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors inline-flex items-center gap-1"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({item.platform.toUpperCase()} • {item.difficulty})
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-sans line-clamp-1">
                      {item.reason}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
