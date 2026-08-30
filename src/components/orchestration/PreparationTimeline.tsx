"use client";

import * as React from "react";
import { PreparationPlan } from "@/services/orchestration/orchestrationTypes";

interface PreparationTimelineProps {
  plan: PreparationPlan;
}

export function PreparationTimeline({ plan }: PreparationTimelineProps) {
  const timelineBlocks = React.useMemo(() => {
    const blocks: { act: (typeof plan.activities)[number]; startMin: number; endMin: number }[] = [];
    let acc = 0;
    for (const act of plan.activities) {
      const startMin = acc;
      acc += act.estimatedMinutes;
      blocks.push({ act, startMin, endMin: acc });
    }
    return blocks;
  }, [plan.activities]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-base font-extrabold text-slate-900">Session Timeline & Block Progression</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Chronological execution schedule for your {plan.totalPlannedMinutes}-minute preparation block
        </p>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
        {timelineBlocks.map(({ act, startMin, endMin }, idx) => {
          return (
            <div key={act.activityId} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-xs font-extrabold shadow-xs">
                {idx + 1}
              </div>

              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-1.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900">{act.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Min {startMin} - {endMin} ({act.estimatedMinutes}m)
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{act.reason}</p>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60">
                  <span>Source: {act.sourceSubsystem}</span>
                  <span>Difficulty: {act.difficulty}</span>
                  <span>Priority: {act.priority}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
