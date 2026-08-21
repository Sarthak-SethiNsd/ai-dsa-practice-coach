"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { InterviewPhase, INTERVIEW_PHASES } from "@/services/interview/interviewTypes";

interface InterviewProgressProps {
  currentPhase: InterviewPhase;
  onSelectPhase?: (phase: InterviewPhase) => void;
}

export function InterviewProgress({
  currentPhase,
  onSelectPhase,
}: InterviewProgressProps) {
  const currentIdx = INTERVIEW_PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between min-w-[620px] gap-2">
        {INTERVIEW_PHASES.map((phase, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={phase.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => onSelectPhase?.(phase.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                  isCurrent
                    ? "bg-sky-600 text-white shadow-sm ring-2 ring-sky-300/50"
                    : isDone
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-400 border border-slate-200 hover:text-slate-600"
                }`}
                title={phase.description}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                <span>{phase.number}. {phase.shortLabel}</span>
              </button>

              {idx < INTERVIEW_PHASES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1.5 transition-colors ${
                    idx < currentIdx ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
