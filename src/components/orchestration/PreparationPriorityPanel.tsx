"use client";

import * as React from "react";
import { PreparationPlan } from "@/services/orchestration/orchestrationTypes";

interface PreparationPriorityPanelProps {
  plan: PreparationPlan;
}

export function PreparationPriorityPanel({ plan }: PreparationPriorityPanelProps) {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "HIGH":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "MEDIUM":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "LOW":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Activity Priority Evaluation</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic 5-factor scoring formula: Goal Relevance × Strategy Priority × Evidence × Urgency × Impact
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {plan.activities.map((activity, idx) => (
          <div key={activity.activityId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900">{activity.title}</h4>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(activity.priority)}`}>
                  {activity.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Score:</span>
                <span className="text-base font-extrabold text-indigo-700 tabular-nums">
                  {activity.priorityScore}/100
                </span>
              </div>
            </div>

            {/* Factor Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Goal Match</span>
                  <span className="text-slate-900">{activity.goalRelevance}/10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activity.goalRelevance * 10}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Strategy Match</span>
                  <span className="text-slate-900">{activity.strategyAlignment}/10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${activity.strategyAlignment * 10}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Time Budget</span>
                  <span className="text-slate-900">{activity.estimatedMinutes}m</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (activity.estimatedMinutes / plan.availableMinutes) * 100)}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Difficulty</span>
                  <span className="text-slate-900">{activity.difficulty}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `75%` }} />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              <span className="font-bold text-slate-700">Rationale: </span>
              {activity.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
