"use client";

import * as React from "react";
import { InterventionPlan } from "@/services/intervention/interventionTypes";

interface StrategyPriorityPanelProps {
  plans: InterventionPlan[];
}

export function StrategyPriorityPanel({ plans }: StrategyPriorityPanelProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Intervention Priority Ranking</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula: Priority = Impact × Evidence Strength × Goal Relevance × Urgency (Normalized 0–100)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {plans.map((plan, idx) => {
          const { impact, evidenceStrength, goalRelevance, urgency, normalizedScore } = plan.priorityBreakdown;

          return (
            <div key={plan.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900">{plan.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Score:</span>
                  <span className="text-base font-extrabold text-indigo-700 tabular-nums">
                    {normalizedScore}/100
                  </span>
                </div>
              </div>

              {/* 4-Factor Breakdown Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Impact</span>
                    <span className="text-slate-900">{impact}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${impact * 10}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Evidence</span>
                    <span className="text-slate-900">{evidenceStrength}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${evidenceStrength * 10}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Goal Match</span>
                    <span className="text-slate-900">{goalRelevance}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${goalRelevance * 10}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Urgency</span>
                    <span className="text-slate-900">{urgency}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${urgency * 10}%` }} />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                <span className="font-bold text-slate-700">Strategic Intent: </span>
                {plan.objective}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
