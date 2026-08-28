"use client";

import * as React from "react";
import { InterventionOutcome as OutcomeType } from "@/services/intervention/interventionTypes";

interface InterventionOutcomeProps {
  outcomes: OutcomeType[];
}

export function InterventionOutcome({ outcomes }: InterventionOutcomeProps) {
  if (outcomes.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center select-none shadow-xs">
        <p className="text-3xl mb-2">🎯</p>
        <p className="text-sm font-bold text-slate-800">No Historical Outcomes Evaluated Yet</p>
        <p className="text-xs text-slate-500 mt-1">Intervention outcomes are measured upon completing follow-up practice sessions.</p>
      </div>
    );
  }

  const getStatusBadge = (s: OutcomeType["resultStatus"]) => {
    switch (s) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "FAILED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "ROLLED_BACK":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-sky-100 text-sky-800 border-sky-300";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Intervention Verification Outcomes</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical measurements verifying whether target bottlenecks were successfully resolved
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {outcomes.map((o) => (
          <div key={o.planId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900">{o.targetSkillOrPattern}</span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(o.resultStatus)}`}>
                {o.resultStatus}
              </span>
            </div>

            <p className="text-xs text-slate-700 font-semibold">{o.targetMetricImprovement}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                <span className="font-bold text-slate-700">Baseline Evidence: </span>
                <span className="text-slate-600">{o.evidenceBefore}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                <span className="font-bold text-slate-700">Follow-up Measurement: </span>
                <span className="text-slate-600">{o.evidenceAfter}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
              <span className="font-bold text-slate-700">Performance Feedback: </span>{o.feedbackToPerformance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
