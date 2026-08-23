"use client";

import { PreparationMilestone } from "@/services/preparation/preparationTypes";
import {
  Award,
  CheckCircle2,
  Circle,
  Flag,
  Target,
  Trophy,
  Sparkles,
} from "lucide-react";

interface MilestoneTrackerProps {
  milestones: PreparationMilestone[];
}

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  const completedCount = milestones.filter((m) => m.isCompleted).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Measurable Milestone Checkpoints
            </h3>
            <p className="text-xs text-slate-500">
              Validated against concrete database metrics (no fabricated completions)
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
          {completedCount} of {milestones.length} Achieved
        </span>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((m) => {
          const isDone = m.isCompleted;

          return (
            <div
              key={m.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                isDone
                  ? "bg-emerald-50/50 border-emerald-200"
                  : "bg-slate-50 border-slate-200/80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        isDone ? "text-emerald-950 line-through opacity-80" : "text-slate-900"
                      }`}
                    >
                      {m.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 capitalize">
                      Category: {m.category.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isDone
                      ? "bg-emerald-200 text-emerald-900 font-mono"
                      : "bg-slate-200 text-slate-700 font-mono"
                  }`}
                >
                  {isDone ? "LOCKED IN" : `${m.currentValue} / ${m.targetValue} ${m.unit}`}
                </span>
              </div>

              {/* Progress meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Progress</span>
                  <span className="font-bold">{m.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isDone ? "bg-emerald-500" : "bg-sky-500"
                    }`}
                    style={{ width: `${m.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
