"use client";

import * as React from "react";
import { PlanHistoryEntry } from "@/services/orchestration/orchestrationTypes";

interface PreparationHistoryProps {
  history: PlanHistoryEntry[];
}

export function PreparationHistory({ history }: PreparationHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center select-none shadow-xs">
        <p className="text-3xl mb-2">📜</p>
        <p className="text-sm font-bold text-slate-800">No Preparation Plans Recorded Yet</p>
        <p className="text-xs text-slate-500 mt-1">Preparation plans will be logged here as you orchestrate your practice sessions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Preparation Plan History</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditable log of generated preparation plans, target focus, and activity completions
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((h) => (
          <div key={h.planId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-slate-900">{h.primaryFocus}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {h.strategyMode}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {h.availableMinutes}m Budget
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 tabular-nums">{h.date}</span>
            </div>

            <p className="text-xs text-slate-700 font-medium">
              <span className="font-bold text-slate-800">Next Best Action: </span>{h.nextBestActionTitle}
            </p>

            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200/60">
              <span>Activities: {h.activitiesCount}</span>
              <span>Completed: {h.completedActivitiesCount}</span>
              <span>Goal: {h.goalName}</span>
              {h.regenerationReason && <span className="text-amber-700">Re-orchestrated</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
