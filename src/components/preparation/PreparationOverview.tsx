"use client";

import {
  FullPreparationState,
  PreparationGoal,
} from "@/services/preparation/preparationTypes";
import Link from "next/link";
import {
  Target,
  Calendar,
  Clock,
  Award,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit3,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Flame,
} from "lucide-react";

interface PreparationOverviewProps {
  state: FullPreparationState;
  onSwitchGoal: (goalId: string) => void;
  onOpenCreateGoal: () => void;
  onOpenEditGoal: (goal: PreparationGoal) => void;
  onUpdateDailyMinutes: (minutes: number) => void;
}

const ON_TRACK_BADGES = {
  AHEAD: {
    label: "AHEAD OF SCHEDULE",
    color: "bg-emerald-500 text-white shadow-emerald-500/20",
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  ON_TRACK: {
    label: "ON TRACK",
    color: "bg-sky-500 text-white shadow-sky-500/20",
    bg: "bg-sky-50 text-sky-800 border-sky-200",
  },
  AT_RISK: {
    label: "PACING AT RISK",
    color: "bg-amber-500 text-white shadow-amber-500/20",
    bg: "bg-amber-50 text-amber-800 border-amber-200",
  },
  BEHIND: {
    label: "BEHIND TRAJECTORY",
    color: "bg-rose-500 text-white shadow-rose-500/20",
    bg: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

const TIME_PRESETS = [15, 30, 45, 60, 90, 120];

export function PreparationOverview({
  state,
  onSwitchGoal,
  onOpenCreateGoal,
  onOpenEditGoal,
  onUpdateDailyMinutes,
}: PreparationOverviewProps) {
  const { activeGoal, allGoals, onTrack, readiness, roadmap, risks, milestones, todayTopActions } = state;
  const badge = ON_TRACK_BADGES[onTrack.status] || ON_TRACK_BADGES.ON_TRACK;

  const currentPhase = roadmap.phases.find((p) => p.isCurrent) || roadmap.phases[0];
  const criticalRisk = risks.find((r) => r.severity === "critical" || r.severity === "high");

  return (
    <div className="space-y-6">
      {/* Top Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Header Row: Goal Switcher + Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-800 text-sky-400 border border-slate-700 shadow-inner">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Active Preparation Goal
                  </span>
                  <button
                    onClick={() => onOpenEditGoal(activeGoal)}
                    title="Edit goal settings"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Goal Selector Dropdown */}
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={activeGoal.id}
                    onChange={(e) => onSwitchGoal(e.target.value)}
                    className="bg-slate-800/90 text-white text-base sm:text-lg font-extrabold rounded-xl px-3 py-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                  >
                    {allGoals.map((g) => (
                      <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                        {g.name} ({g.targetDate})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={onOpenCreateGoal}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Create New Goal"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* On-Track Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold tracking-wider border uppercase shadow-sm ${badge.color}`}
              >
                {badge.label}
              </span>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
            {/* Days Remaining */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Days Remaining</span>
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {onTrack.daysRemaining} <span className="text-xs font-normal text-slate-400">days</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Target: {activeGoal.targetDate}
              </div>
            </div>

            {/* Readiness Score */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Overall Readiness</span>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {readiness.overallScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <div className="text-[11px] text-emerald-300 truncate">
                {readiness.tier}
              </div>
            </div>

            {/* Current Phase */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Active Phase</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-sm font-bold text-white line-clamp-1">
                {currentPhase?.name.split(":")[1] || currentPhase?.name}
              </div>
              <div className="text-[11px] text-slate-400">
                Progress: {currentPhase?.progressPercent}%
              </div>
            </div>

            {/* Daily Commitment */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Daily Budget</span>
                <Clock className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {activeGoal.dailyMinutes} <span className="text-xs font-normal text-slate-400">m/day</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {activeGoal.daysPerWeek} days per week
              </div>
            </div>
          </div>

          {/* Quick Time Budget Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">
              Adjust Today&apos;s Time Budget:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {TIME_PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => onUpdateDailyMinutes(m)}
                  className={`px-3 py-1 rounded-xl font-bold font-mono transition-all cursor-pointer ${
                    activeGoal.dailyMinutes === m
                      ? "bg-sky-500 text-white shadow-xs"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert if any */}
      {criticalRisk && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  {criticalRisk.severity} Risk
                </span>
                <span className="font-bold text-xs sm:text-sm">
                  {criticalRisk.title}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                {criticalRisk.evidence} • {criticalRisk.recommendedCorrection}
              </p>
            </div>
          </div>

          <Link
            href={criticalRisk.quickActionHref}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition-colors shrink-0"
          >
            <span>{criticalRisk.quickActionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Today's Recommended Top Actions */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Today&apos;s Highest-Impact Priority Actions
              </h3>
              <span className="text-xs text-slate-500">
                Strategically sequenced for your active {activeGoal.name}
              </span>
            </div>
          </div>

          <Link
            href="/today"
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
          >
            <span>Open Daily Planner</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {todayTopActions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      action.priority === "CRITICAL"
                        ? "bg-rose-100 text-rose-800"
                        : action.priority === "HIGH"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {action.priority}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {action.estimatedMinutes}m
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {action.description}
                </p>
              </div>

              <div className="text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span>{action.reason}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
