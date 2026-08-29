"use client";

import * as React from "react";
import { PreparationPlan } from "@/services/orchestration/orchestrationTypes";
import { PreparationActivityCard } from "./PreparationActivityCard";

interface PreparationPlanViewProps {
  plan: PreparationPlan;
}

export function PreparationPlanView({ plan }: PreparationPlanViewProps) {
  return (
    <div className="space-y-6 select-none">
      {/* Plan Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Today&apos;s Coordinated Plan</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured preparation sequence tailored to your {plan.availableMinutes}-minute available time budget
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Planned Workload:</span>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900 text-white">
            {plan.totalPlannedMinutes} / {plan.availableMinutes} min
          </span>
        </div>
      </div>

      {/* Expected Outcomes Callout */}
      <div className="p-4.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
        <p className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
          🎯 Target Session Outcomes
        </p>
        {plan.expectedOutcomes.map((out, idx) => (
          <p key={idx} className="text-xs text-indigo-900 leading-relaxed font-medium flex items-start gap-2">
            <span>•</span>
            <span>{out}</span>
          </p>
        ))}
      </div>

      {/* Activities Sequence */}
      <div className="space-y-4">
        {plan.activities.map((activity, idx) => (
          <PreparationActivityCard
            key={activity.activityId}
            activity={activity}
            index={idx}
            isPrimary={idx === 0}
          />
        ))}
      </div>
    </div>
  );
}
