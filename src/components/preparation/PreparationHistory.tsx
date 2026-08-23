"use client";

import {
  PreparationComparison,
  PreparationSnapshot,
} from "@/services/preparation/preparationTypes";
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface PreparationHistoryProps {
  comparison: PreparationComparison | null;
  timeframe: "7_days" | "30_days" | "since_start";
  onTimeframeChange: (tf: "7_days" | "30_days" | "since_start") => void;
}

const TIMEFRAMES: { label: string; value: "7_days" | "30_days" | "since_start" }[] = [
  { label: "Past 7 Days", value: "7_days" },
  { label: "Past 30 Days", value: "30_days" },
  { label: "Since Goal Start", value: "since_start" },
];

export function PreparationHistory({
  comparison,
  timeframe,
  onTimeframeChange,
}: PreparationHistoryProps) {
  if (!comparison) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
        <History className="w-10 h-10 mx-auto text-slate-300" />
        <h3 className="text-sm font-bold text-slate-700">
          Historical Telemetry Gathering
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Snapshots are recorded daily as you practice. Comparative progress metrics will become available after additional practice sessions.
        </p>
      </div>
    );
  }

  const { baselineSnapshot, currentSnapshot, readinessDelta, diffs, summaryNote } = comparison;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Preparation Trajectory & Historical Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Comparing Today ({currentSnapshot.date}) against Baseline ({baselineSnapshot.date})
            </p>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                timeframe === tf.value
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delta Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          readinessDelta >= 0
            ? "bg-emerald-50 text-emerald-950 border-emerald-200"
            : "bg-amber-50 text-amber-950 border-amber-200"
        }`}
      >
        <div className="flex items-center gap-3">
          {readinessDelta >= 0 ? (
            <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <TrendingDown className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            {summaryNote}
          </p>
        </div>

        <span className="text-xs sm:text-sm font-mono font-bold shrink-0">
          {readinessDelta >= 0 ? `+${readinessDelta}` : readinessDelta} pts
        </span>
      </div>

      {/* Comparative Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {diffs.map((diff, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {diff.metricName}
            </span>

            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-900">
                {diff.currentValue}
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  diff.improved ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {diff.delta > 0 ? `+${diff.delta}` : diff.delta === 0 ? "0" : diff.delta}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Baseline: {diff.baselineValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
