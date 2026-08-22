"use client";

import { VCAnalyticsSummary } from "@/services/contest/virtualContestTypes";
import {
  VCAnalyticsTimeframe,
  VCAnalyticsPlatform,
} from "@/services/contest/virtualContestAnalytics";
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Award,
  Zap,
  Target,
  Clock,
} from "lucide-react";

interface VirtualContestAnalyticsProps {
  analytics: VCAnalyticsSummary | null;
  timeframe: VCAnalyticsTimeframe;
  onTimeframeChange: (tf: VCAnalyticsTimeframe) => void;
  platform: VCAnalyticsPlatform;
  onPlatformChange: (p: VCAnalyticsPlatform) => void;
}

const TIMEFRAMES: { label: string; value: VCAnalyticsTimeframe }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "All Time", value: "all" },
];

const PLATFORMS: { label: string; value: VCAnalyticsPlatform }[] = [
  { label: "All Platforms", value: "all" },
  { label: "LeetCode", value: "leetcode" },
  { label: "Codeforces", value: "codeforces" },
  { label: "Mixed", value: "mixed" },
];

export function VirtualContestAnalytics({
  analytics,
  timeframe,
  onTimeframeChange,
  platform,
  onPlatformChange,
}: VirtualContestAnalyticsProps) {
  if (!analytics || analytics.totalContests === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
        <BarChart2 className="w-10 h-10 mb-3 text-slate-300" />
        <h3 className="text-sm font-bold text-slate-700">No Analytics in this Timeframe</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Try expanding the timeframe filter or completing more virtual contest drills.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === tf.value
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPlatformChange(p.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                platform === p.value
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Contests */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Contests</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {analytics.totalContests}
          </div>
          <div className="text-[11px] text-slate-500">Tracked in period</div>
        </div>

        {/* Avg Score */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Average Score</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {analytics.avgScore} pts
          </div>
          <div className="text-[11px] text-slate-500">Per simulation</div>
        </div>

        {/* Solve Rate */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Average Solve Rate</span>
            <Target className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {analytics.avgSolveRate}%
          </div>
          <div className="text-[11px] text-slate-500">Problems solved</div>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Accuracy</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {analytics.avgAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500">First-pass precision</div>
        </div>
      </div>

      {/* Score Trend & Topic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Score Telemetry Trend</h3>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-2">
            {analytics.scoreTrend.map((st, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono"
              >
                <span className="text-slate-500 font-sans">{st.date}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 sm:w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (st.score / 1200) * 100)}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-900 min-w-[50px] text-right">
                    {st.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Topic Performance Under Pressure</h3>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="space-y-2.5">
            {analytics.topicPerformance.map((tp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{tp.topic}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({tp.attempts} attempts)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      tp.avgScore >= 700
                        ? "bg-emerald-100 text-emerald-800"
                        : tp.avgScore >= 550
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {tp.avgScore} pts avg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
