"use client";

import * as React from "react";
import { TopicRetentionMetric } from "@/services/revision/revisionTypes";
import { Brain, AlertTriangle } from "lucide-react";

interface Props {
  metrics: TopicRetentionMetric[];
}

function StatusBadge({ status }: { status: "strong" | "moderate" | "at_risk" }) {
  const map = {
    strong: "bg-emerald-100 text-emerald-700 border-emerald-200",
    moderate: "bg-amber-100 text-amber-700 border-amber-200",
    at_risk: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${map[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function TopicRetentionPanel({ metrics }: Props) {
  const [sortBy, setSortBy] = React.useState<"retention" | "memory" | "due">("retention");

  const sorted = [...metrics].sort((a, b) => {
    if (sortBy === "retention") return a.retentionPercentage - b.retentionPercentage;
    if (sortBy === "memory") return a.avgMemoryStrength - b.avgMemoryStrength;
    return b.dueCount + b.overdueCount - (a.dueCount + a.overdueCount);
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            Topic Memory Decay & Retention Analysis
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(
            [
              { id: "retention", label: "Lowest Retention" },
              { id: "memory", label: "Lowest Memory" },
              { id: "due", label: "Most Due" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSortBy(t.id)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                sortBy === t.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of topic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((item) => (
          <div
            key={item.topic}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-base font-extrabold text-slate-900">
                {item.topic}
              </span>
              <StatusBadge status={item.status} />
            </div>

            {/* Retention Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Retention Score</span>
                <span
                  className={`tabular-nums font-extrabold ${
                    item.retentionPercentage >= 80
                      ? "text-emerald-600"
                      : item.retentionPercentage >= 60
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {item.retentionPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    item.retentionPercentage >= 80
                      ? "bg-emerald-500"
                      : item.retentionPercentage >= 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${item.retentionPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Memory Strength</p>
                <p className="text-sm font-extrabold text-slate-800 tabular-nums">
                  {item.avgMemoryStrength}%
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Forgetting Rate</p>
                <p className="text-sm font-extrabold text-slate-800 tabular-nums">
                  {item.forgettingRate}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>{item.totalRevisions} revisions completed</span>
              {(item.dueCount > 0 || item.overdueCount > 0) && (
                <span className="text-rose-600 font-extrabold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {item.dueCount + item.overdueCount} due
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
