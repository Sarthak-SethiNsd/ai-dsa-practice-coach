"use client";

import * as React from "react";
import { RevisionDashboardMetrics } from "@/services/revision/revisionTypes";
import {
  Clock,
  AlertTriangle,
  Calendar,
  Flame,
  CheckCircle,
  Brain,
  Zap,
} from "lucide-react";

interface Props {
  metrics: RevisionDashboardMetrics;
  onStartWorkspace: () => void;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "sky",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
}) {
  const accentMap: Record<string, string> = {
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };
  const colorClass = accentMap[accent] ?? accentMap.sky;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <span className={`p-2 rounded-xl border ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums leading-none">
          {value}
        </span>
        {sub && (
          <p className="text-xs text-slate-500 font-medium leading-snug mt-1">{sub}</p>
        )}
      </div>
    </div>
  );
}

export function RevisionDashboardHeader({ metrics, onStartWorkspace }: Props) {
  const totalPending = metrics.dueTodayCount + metrics.overdueCount;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-700 rounded-3xl p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 rounded-full bg-white" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-extrabold uppercase tracking-widest text-sky-100">
                Spaced Repetition Engine
              </span>
              {metrics.revisionStreak > 0 && (
                <span className="flex items-center gap-1 bg-amber-400/30 text-amber-100 px-3 py-1 rounded-full text-xs font-extrabold">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  {metrics.revisionStreak}-Day Streak
                </span>
              )}
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              {totalPending > 0
                ? `${totalPending} Problem${totalPending > 1 ? "s" : ""} Ready for Revision`
                : "All Revisions Complete for Today!"}
            </h2>
            <p className="text-sky-100 text-sm max-w-2xl leading-relaxed">
              Combat memory decay with scientifically-timed active recall sessions based on Ebbinghaus forgetting curves.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartWorkspace}
              disabled={totalPending === 0}
              className="flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-700 hover:bg-sky-50 disabled:opacity-50 text-sm font-extrabold rounded-2xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              {totalPending > 0 ? "Start Revision Session" : "Session Completed"}
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Due Today"
          value={metrics.dueTodayCount}
          sub="Scheduled for today"
          icon={Clock}
          accent={metrics.dueTodayCount > 0 ? "sky" : "emerald"}
        />
        <StatCard
          label="Overdue"
          value={metrics.overdueCount}
          sub="Missed review dates"
          icon={AlertTriangle}
          accent={metrics.overdueCount > 0 ? "rose" : "emerald"}
        />
        <StatCard
          label="Upcoming (7d)"
          value={metrics.upcoming7DaysCount}
          sub="Next 7 days queue"
          icon={Calendar}
          accent="amber"
        />
        <StatCard
          label="SRS Streak"
          value={`${metrics.revisionStreak}d`}
          sub="Consecutive active days"
          icon={Flame}
          accent="amber"
        />
        <StatCard
          label="Total Revised"
          value={metrics.totalRevisionsCompleted}
          sub="Completed reviews"
          icon={CheckCircle}
          accent="indigo"
        />
        <StatCard
          label="Retention Score"
          value={`${metrics.overallRetentionScore}%`}
          sub={`~${metrics.memoryDecayRate30d}% 30d decay rate`}
          icon={Brain}
          accent={metrics.overallRetentionScore >= 80 ? "emerald" : "rose"}
        />
      </div>
    </div>
  );
}
