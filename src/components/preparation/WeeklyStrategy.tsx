"use client";

import { WeeklyStrategy as WeeklyStrategyType } from "@/services/preparation/preparationTypes";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  Zap,
  RotateCcw,
  Sparkles,
  Trophy,
  Briefcase,
} from "lucide-react";

interface WeeklyStrategyProps {
  strategy: WeeklyStrategyType;
}

export function WeeklyStrategy({ strategy }: WeeklyStrategyProps) {
  const isAtRisk = strategy.status === "at_risk";
  const isCompleted = strategy.status === "completed";

  const studyMinutesPct = Math.min(
    100,
    Math.round((strategy.completedStudyMinutes / Math.max(1, strategy.targetStudyMinutes)) * 100)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Weekly Strategic Target Plan
            </h3>
            <p className="text-xs text-slate-500">
              Week {strategy.weekNumber} • {strategy.startDate} to {strategy.endDate}
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl border ${
            isCompleted
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : isAtRisk
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-sky-50 text-sky-800 border-sky-200"
          }`}
        >
          {isCompleted ? "Weekly Goals Achieved" : isAtRisk ? "Pace At Risk" : "On Track This Week"}
        </span>
      </div>

      {/* Strategic Highlight Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="text-xs sm:text-sm font-medium leading-relaxed">
          {strategy.highlightDirective}
        </p>
      </div>

      {/* 4 Weekly Workload Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Study Minutes */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              Study Time
            </span>
            <span className="font-mono font-bold text-slate-900">
              {strategy.completedStudyMinutes} / {strategy.targetStudyMinutes}m
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all"
              style={{ width: `${studyMinutesPct}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {studyMinutesPct}% completed
          </span>
        </div>

        {/* 2. Problems Target */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-sky-500" />
              Problems Solved
            </span>
            <span className="font-mono font-bold text-slate-900">
              {strategy.problemsSolvedCount} / {strategy.problemTargetCount}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (strategy.problemsSolvedCount / Math.max(1, strategy.problemTargetCount)) * 100
                )}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Target: {strategy.problemTargetCount} Medium/Hard
          </span>
        </div>

        {/* 3. Contest / Interview Target */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Timed Drills
            </span>
            <span className="font-mono font-bold text-slate-900">
              {strategy.contestsCompletedCount + strategy.interviewsCompletedCount} /{" "}
              {strategy.contestTargetCount + strategy.interviewTargetCount}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  ((strategy.contestsCompletedCount + strategy.interviewsCompletedCount) /
                    Math.max(1, strategy.contestTargetCount + strategy.interviewTargetCount)) *
                    100
                )}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {strategy.contestTargetCount} Contests • {strategy.interviewTargetCount} Mocks
          </span>
        </div>

        {/* 4. Revisions Target */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
              SRS Revisions
            </span>
            <span className="font-mono font-bold text-slate-900">
              {strategy.revisionsCompletedCount} / {strategy.revisionTargetCount}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (strategy.revisionsCompletedCount / Math.max(1, strategy.revisionTargetCount)) *
                    100
                )}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Zero backlog target
          </span>
        </div>
      </div>
    </div>
  );
}
