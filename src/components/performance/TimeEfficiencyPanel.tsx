"use client";

import * as React from "react";
import { TimeEfficiencyAnalysis } from "@/services/performance/performanceTypes";

interface TimeEfficiencyPanelProps {
  timeTrend: TimeEfficiencyAnalysis;
}

export function TimeEfficiencyPanel({ timeTrend }: TimeEfficiencyPanelProps) {
  const {
    overallTrend,
    overallMedianSolveTimeSeconds,
    overallAverageSolveTimeSeconds,
    byDifficulty,
    canSolveRate,
    canSolveEfficientlyRate,
    efficiencyGapPct,
    speedImprovementPct,
    diagnosis,
  } = timeTrend;

  const getTrendBadge = (trend: TimeEfficiencyAnalysis["overallTrend"]) => {
    const map = {
      FAST_IMPROVEMENT: { bg: "bg-green-100 text-green-800 border-green-200", label: "⚡ Rapid Speedup" },
      SLOW_IMPROVEMENT: { bg: "bg-sky-100 text-sky-800 border-sky-200", label: "📈 Improving Speed" },
      STABLE: { bg: "bg-slate-100 text-slate-700 border-slate-200", label: "⏱️ Stable Speed" },
      DEGRADING: { bg: "bg-rose-100 text-rose-800 border-rose-200", label: "📉 Slowdown" },
      INSUFFICIENT_DATA: { bg: "bg-slate-100 text-slate-500 border-slate-200", label: "Building History" },
    }[trend];

    return (
      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${map.bg}`}>
        {map.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Time-Efficiency & Fluency Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Separates basic problem resolution from efficient, fluent problem solving
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getTrendBadge(overallTrend)}
        </div>
      </div>

      {/* Diagnosis Banner */}
      <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
        <p className="text-xs text-indigo-900 leading-relaxed font-semibold">
          💡 {diagnosis}
        </p>
      </div>

      {/* Comparison: Can Solve vs Can Solve Efficiently */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Can Solve Rate (Accuracy)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1">{canSolveRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">Percentage of attempted problems successfully solved</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Can Solve Efficiently</p>
            {efficiencyGapPct > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {efficiencyGapPct}% Speed Gap
              </span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-900 tabular-nums mt-1">{canSolveEfficientlyRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">Solved within 1.2x of the target time budget</p>
        </div>
      </div>

      {/* Median Solve Times by Difficulty */}
      <div className="mt-5">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
          Median Solve Times by Difficulty
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["Easy", "Medium", "Hard"] as const).map((diff) => {
            const sec = byDifficulty[diff]?.medianSeconds ?? 0;
            const min = Math.round(sec / 60);
            return (
              <div key={diff} className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{diff}</span>
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {sec > 0 ? `${min} min` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
