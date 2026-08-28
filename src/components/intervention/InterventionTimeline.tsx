"use client";

import * as React from "react";
import { InterventionPlan } from "@/services/intervention/interventionTypes";

interface InterventionTimelineProps {
  plans: InterventionPlan[];
}

export function InterventionTimeline({ plans }: InterventionTimelineProps) {
  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center select-none shadow-xs">
        <p className="text-3xl mb-2">📜</p>
        <p className="text-sm font-bold text-slate-800">No Intervention Timeline Recorded</p>
        <p className="text-xs text-slate-500 mt-1">Interventions will be logged here as adaptive strategy plans are proposed and activated.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      <div className="pb-4 border-b border-slate-100 mb-6">
        <h3 className="text-base font-extrabold text-slate-900">Intervention Lifecycle Timeline</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Chronological milestone log of strategy interventions, duration estimates, and review checkpoints
        </p>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
        {plans.map((plan) => (
          <div key={plan.id} className="relative group">
            {/* Dot icon */}
            <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-white border-2 border-sky-500 flex items-center justify-center text-sm shadow-xs">
              ⚡
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-extrabold text-slate-900">{plan.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {plan.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{plan.objective}</p>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60">
                <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                <span>Review: {new Date(plan.reviewDate).toLocaleDateString()}</span>
                <span>Duration: {plan.targetDurationSessions} sessions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
