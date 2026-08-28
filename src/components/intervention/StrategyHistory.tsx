"use client";

import * as React from "react";
import { StrategyHistoryEntry } from "@/services/intervention/interventionTypes";

interface StrategyHistoryProps {
  history: StrategyHistoryEntry[];
}

export function StrategyHistory({ history }: StrategyHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center select-none shadow-xs">
        <p className="text-3xl mb-2">📜</p>
        <p className="text-sm font-bold text-slate-800">No Strategy Transitions Recorded</p>
        <p className="text-xs text-slate-500 mt-1">Strategy mode changes will be logged here as your performance evolves.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Strategy Transition History</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditable log of high-level strategy mode adjustments and triggering performance evidence
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((h) => (
          <div key={h.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {h.previousMode}
                </span>
                <span className="text-xs font-extrabold text-slate-400">→</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {h.newMode}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 tabular-nums">{h.date}</span>
            </div>

            <p className="text-xs text-slate-800 font-semibold">{h.reason}</p>

            <p className="text-[11px] text-slate-600 font-medium">
              <span className="font-bold text-slate-700">Triggering Evidence: </span>{h.evidence}
            </p>

            {h.triggeredInterventions.length > 0 && (
              <p className="text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200/60">
                Interventions: {h.triggeredInterventions.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
