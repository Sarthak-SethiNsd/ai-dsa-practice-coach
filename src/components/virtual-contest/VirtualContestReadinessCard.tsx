"use client";

import { VCReadinessProfile } from "@/services/contest/virtualContestTypes";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Zap,
  Target,
  Clock,
  Layers,
} from "lucide-react";

interface VirtualContestReadinessCardProps {
  readiness: VCReadinessProfile | null;
  onStartContest?: () => void;
}

const TIER_COLORS = {
  Advanced: "text-purple-700 bg-purple-50 border-purple-200 ring-purple-400/20",
  Strong: "text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-400/20",
  Competitive: "text-sky-700 bg-sky-50 border-sky-200 ring-sky-400/20",
  Developing: "text-amber-700 bg-amber-50 border-amber-200 ring-amber-400/20",
  Beginner: "text-slate-700 bg-slate-50 border-slate-200 ring-slate-400/20",
};

export function VirtualContestReadinessCard({
  readiness,
  onStartContest,
}: VirtualContestReadinessCardProps) {
  if (!readiness) return null;

  const tier = readiness.tier || "Beginner";
  const colorClass = TIER_COLORS[tier] || TIER_COLORS.Beginner;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Contest Readiness Score
            </h3>
            <span className="text-xs text-slate-500">
              Evaluated across historical solve rate, pace, and accuracy
            </span>
          </div>
        </div>

        {/* Tier Chip */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ring-2 ${colorClass}`}>
          <Award className="w-3.5 h-3.5" />
          <span>{readiness.bandLabel}</span>
        </div>
      </div>

      {/* Score Meter & Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
        {/* Big Score Display */}
        <div className="sm:col-span-2 flex flex-col items-center sm:items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {readiness.score}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            {readiness.recentTrend === "improving" ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Improving pace</span>
              </>
            ) : readiness.recentTrend === "declining" ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-700 font-semibold">Declining trend</span>
              </>
            ) : (
              <>
                <Minus className="w-3.5 h-3.5 text-slate-400" />
                <span>Stable performance</span>
              </>
            )}
            <span>• {readiness.contestsCompleted} Contests</span>
          </div>
        </div>

        {/* Competency Breakdown */}
        <div className="sm:col-span-3 grid grid-cols-2 gap-3">
          {/* Solve Rate */}
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3 text-sky-500" />
                Solve Rate
              </span>
              <span className="font-bold font-mono text-slate-700">
                {readiness.solveRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${readiness.solveRate}%` }}
              />
            </div>
          </div>

          {/* Accuracy */}
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-500" />
                Accuracy
              </span>
              <span className="font-bold font-mono text-slate-700">
                {readiness.avgAccuracy}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${readiness.avgAccuracy}%` }}
              />
            </div>
          </div>

          {/* Time Efficiency */}
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                Time Efficiency
              </span>
              <span className="font-bold font-mono text-slate-700">
                {readiness.avgTimeEfficiency}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${readiness.avgTimeEfficiency}%` }}
              />
            </div>
          </div>

          {/* Topic Coverage */}
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-purple-500" />
                Coverage
              </span>
              <span className="font-bold font-mono text-slate-700">
                {readiness.topicCoverage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${readiness.topicCoverage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
