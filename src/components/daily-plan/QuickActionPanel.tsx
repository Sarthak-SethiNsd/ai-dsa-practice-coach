"use client";

import { Zap, RotateCcw } from "lucide-react";
import { DailyPlan } from "@/services/dailyPlan/dailyPlanTypes";

interface QuickActionPanelProps {
  plan: DailyPlan;
  onComplete: (id: string) => void;
}

export function QuickActionPanel({ plan, onComplete }: QuickActionPanelProps) {
  // Next pending action (highest priority score)
  const nextAction = plan.actions
    .filter((a) => a.status === "pending")
    .sort((a, b) => b.priorityScore - a.priorityScore)[0];

  // First pending SRS revision
  const firstRevision = plan.actions.find(
    (a) => a.actionType === "REVISION" && a.status === "pending"
  );

  if (!nextAction && !firstRevision) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>

      <div className="flex flex-col gap-2">
        {/* Start next critical */}
        {nextAction && (
          <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2.5">
            <Zap className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sky-800 line-clamp-1">
                {nextAction.title}
              </p>
              <p className="text-xs text-sky-600">{nextAction.estimatedMinutes}m · {nextAction.priority} priority</p>
            </div>
            <button
              onClick={() => onComplete(nextAction.id)}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Quick SRS */}
        {firstRevision && firstRevision.id !== nextAction?.id && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2.5">
            <RotateCcw className="w-4 h-4 text-purple-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-800 line-clamp-1">
                {firstRevision.title}
              </p>
              <p className="text-xs text-purple-600">Quick SRS Revision · {firstRevision.estimatedMinutes}m</p>
            </div>
            <button
              onClick={() => onComplete(firstRevision.id)}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
