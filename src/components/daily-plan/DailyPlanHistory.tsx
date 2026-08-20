"use client";

import { useState } from "react";
import { History, ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { PlanHistoryRecord, PlannerAnalytics } from "@/services/dailyPlan/dailyPlanTypes";

interface DailyPlanHistoryProps {
  history: PlanHistoryRecord[];
  analytics: PlannerAnalytics;
}

export function DailyPlanHistory({ history, analytics }: DailyPlanHistoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <History className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">Plan History & Analytics</span>
        <span className="ml-auto text-xs text-slate-400">{history.length} days logged</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {/* Analytics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{analytics.completionRate}%</p>
              <p className="text-xs text-slate-500">Completion rate</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-sky-700">{analytics.weeklyConsistency}/7</p>
              <p className="text-xs text-slate-500">This week</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{analytics.avgPlannedMinutes}m</p>
              <p className="text-xs text-slate-500">Avg planned</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">{analytics.avgCompletedMinutes}m</p>
              <p className="text-xs text-slate-500">Avg actual</p>
            </div>
          </div>

          {/* History list */}
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No plan history yet. Complete your first day to begin tracking.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 text-xs px-3 py-2.5 rounded-lg border border-slate-100 bg-slate-50/60"
                >
                  {/* Status icon */}
                  {record.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : record.status === "skipped" ? (
                    <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}

                  {/* Date */}
                  <span className="font-medium text-slate-700 shrink-0">{record.date}</span>

                  {/* Focus */}
                  <span className="text-slate-400 flex-1 min-w-0 truncate">{record.mainFocus}</span>

                  {/* Completion */}
                  <span className="shrink-0 text-slate-500 font-medium">
                    {record.completedCount}/{record.totalActions}
                  </span>
                  <span className="shrink-0 text-slate-400">{record.completedMinutes}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
