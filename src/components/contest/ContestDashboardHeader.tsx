"use client";

import * as React from "react";
import { ContestDashboardMetrics } from "@/services/contest/contestTypes";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Activity,
  Star,
  Users,
  Clock,
  Target,
  Award,
  Zap,
} from "lucide-react";

interface Props {
  metrics: ContestDashboardMetrics;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "sky",
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
  trend?: "up" | "down" | "neutral";
}) {
  const accentMap: Record<string, string> = {
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  const colorClass = accentMap[accent] ?? accentMap.sky;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <span className={`p-2 rounded-xl border ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums leading-none">
          {value}
        </span>
        {trend && (
          <span
            className={`mb-0.5 ${
              trend === "up"
                ? "text-emerald-500"
                : trend === "down"
                ? "text-rose-500"
                : "text-slate-400"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend === "down" ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
          </span>
        )}
      </div>
      {sub && (
        <span className="text-xs text-slate-500 font-medium leading-snug">{sub}</span>
      )}
    </div>
  );
}

export function ContestDashboardHeader({ metrics }: Props) {
  const ratingTrend: "up" | "down" | "neutral" =
    metrics.ratingGrowth30d > 0
      ? "up"
      : metrics.ratingGrowth30d < 0
      ? "down"
      : "neutral";

  return (
    <div className="space-y-6">
      {/* Hero Rating Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 rounded-full bg-white" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sky-200 text-sm font-semibold uppercase tracking-widest">
              Current Rating
            </p>
            <p className="text-6xl font-black tabular-nums leading-none">
              {metrics.currentRating}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                <Trophy className="w-3.5 h-3.5" />
                Peak: {metrics.peakRating}
              </span>
              <span
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  metrics.ratingGrowth30d >= 0
                    ? "bg-emerald-400/30 text-emerald-100"
                    : "bg-rose-400/30 text-rose-100"
                }`}
              >
                {metrics.ratingGrowth30d >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {metrics.ratingGrowth30d >= 0 ? "+" : ""}
                {metrics.ratingGrowth30d} (30d)
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-sky-200 text-xs font-semibold uppercase tracking-widest">
                All-Time Growth
              </p>
              <p className="text-4xl font-black tabular-nums">
                {metrics.ratingGrowthAllTime >= 0 ? "+" : ""}
                {metrics.ratingGrowthAllTime}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sky-200 text-xs font-medium">
              <Activity className="w-3.5 h-3.5" />
              {metrics.winRateTop25Pct}% Top-25% Rate
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="col-span-2 sm:col-span-1 xl:col-span-2">
          <StatCard
            label="Total Contests"
            value={metrics.totalContests}
            sub="All platforms combined"
            icon={Trophy}
            accent="violet"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <StatCard
            label="Avg Rank"
            value={`#${metrics.averageRank.toLocaleString()}`}
            sub="Across all contests"
            icon={Users}
            accent="sky"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <StatCard
            label="Best Rank"
            value={`#${metrics.bestRank.toLocaleString()}`}
            sub="All-time best"
            icon={Star}
            accent="emerald"
            trend="up"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <StatCard
            label="Worst Rank"
            value={`#${metrics.worstRank.toLocaleString()}`}
            sub="All-time worst"
            icon={TrendingDown}
            accent="rose"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <StatCard
            label="Rating (30d)"
            value={`${metrics.ratingGrowth30d >= 0 ? "+" : ""}${metrics.ratingGrowth30d}`}
            sub="Net rating change"
            icon={TrendingUp}
            accent={metrics.ratingGrowth30d >= 0 ? "emerald" : "rose"}
            trend={ratingTrend}
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <StatCard
            label="Avg Problems"
            value={metrics.avgProblemsPerContest}
            sub="Solved per contest"
            icon={Target}
            accent="amber"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <StatCard
            label="Avg Time"
            value={`${metrics.avgTimePerContest}m`}
            sub="Per contest"
            icon={Clock}
            accent="teal"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <StatCard
            label="Top 25% Rate"
            value={`${metrics.winRateTop25Pct}%`}
            sub="Contests in top quartile"
            icon={Award}
            accent="indigo"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <StatCard
            label="All-Time Growth"
            value={`${metrics.ratingGrowthAllTime >= 0 ? "+" : ""}${metrics.ratingGrowthAllTime}`}
            sub="From first contest"
            icon={Zap}
            accent={metrics.ratingGrowthAllTime >= 0 ? "emerald" : "rose"}
            trend={metrics.ratingGrowthAllTime >= 0 ? "up" : "down"}
          />
        </div>
      </div>
    </div>
  );
}
