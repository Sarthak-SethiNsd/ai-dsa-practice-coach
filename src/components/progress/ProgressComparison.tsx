"use client";

import * as React from "react";
import { PeriodComparisonSummary, PeriodComparisonMetric } from "@/services/progress/progressTypes";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface ProgressComparisonProps {
  comparison: PeriodComparisonSummary;
}

export function ProgressComparison({ comparison }: ProgressComparisonProps) {
  const metricsList: PeriodComparisonMetric[] = Object.values(comparison.metrics);

  const getDirectionBadge = (dir: PeriodComparisonMetric["direction"]) => {
    switch (dir) {
      case "improved":
        return {
          icon: TrendingUp,
          label: "Improved",
          style: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "declined":
        return {
          icon: TrendingDown,
          label: "Declined",
          style: "bg-red-100 text-red-800 border-red-200",
        };
      case "stable":
        return {
          icon: Minus,
          label: "Stable",
          style: "bg-slate-100 text-slate-700 border-slate-200",
        };
      case "new":
        return {
          icon: Sparkles,
          label: "New",
          style: "bg-sky-100 text-sky-800 border-sky-200",
        };
      default:
        return {
          icon: HelpCircle,
          label: "N/A",
          style: "bg-slate-100 text-slate-500 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>Compared against: {comparison.previousPeriodLabel}</span>
        <span>{comparison.hasPreviousData ? "Historical comparison active" : "Baseline recording period"}</span>
      </div>

      {/* Grid of Delta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricsList.map((m) => {
          const badge = getDirectionBadge(m.direction);
          const Icon = badge.icon;

          return (
            <div
              key={m.metricName}
              className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Metric Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {m.metricName}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.style}`}
                  >
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>

                {/* Values Comparison */}
                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-2xl font-black text-slate-900">
                    {m.currentValue}
                    {m.unit && <span className="text-xs text-slate-500 font-semibold ml-1">{m.unit}</span>}
                  </span>

                  {m.previousValue !== null && (
                    <span className="text-xs font-medium text-slate-400">
                      prev: {m.previousValue}
                    </span>
                  )}
                </div>
              </div>

              {/* Explanation Note */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed pt-2 border-t border-slate-50 mt-2">
                {m.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
