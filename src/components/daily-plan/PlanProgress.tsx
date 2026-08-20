"use client";

import { CheckCircle2, Clock, Zap } from "lucide-react";
import { DailyPlan } from "@/services/dailyPlan/dailyPlanTypes";

interface PlanProgressProps {
  plan: DailyPlan;
}

export function PlanProgress({ plan }: PlanProgressProps) {
  const total = plan.actions.length;
  const completed = plan.completedCount;
  const skipped = plan.skippedCount;
  const pending = total - completed - skipped;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const critical = plan.actions.filter((a) => a.priority === "CRITICAL" && a.status === "pending").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{completed}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
          <p className="text-xs text-slate-500">Remaining</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-400">{skipped}</p>
          <p className="text-xs text-slate-500">Skipped</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium">{pct}% complete</span>
          <span>{plan.completedMinutes}m done · {plan.totalPlannedMinutes}m planned</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Alerts */}
      <div className="flex flex-wrap gap-2">
        {critical > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
            <Zap className="w-3.5 h-3.5" />
            {critical} critical item{critical > 1 ? "s" : ""} pending
          </div>
        )}
        {completed > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completed} action{completed > 1 ? "s" : ""} done
          </div>
        )}
        {plan.timeBudgetMinutes > 0 && pending > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
            <Clock className="w-3.5 h-3.5" />
            {plan.totalPlannedMinutes - plan.completedMinutes}m remaining
          </div>
        )}
      </div>
    </div>
  );
}
