"use client";

import { ArrowRight, HelpCircle, CheckCircle2, Gauge, ShieldAlert } from "lucide-react";
import { InterviewPhase, INTERVIEW_PHASES } from "@/services/interview/interviewTypes";
import { getNextPhase } from "@/services/interview/interviewEngine";

interface InterviewControlBarProps {
  currentPhase: InterviewPhase;
  solutionSubmitted: boolean;
  onAdvancePhase: () => void;
  onRequestHint: () => void;
  onSubmitSolution: () => void;
}

export function InterviewControlBar({
  currentPhase,
  solutionSubmitted,
  onAdvancePhase,
  onRequestHint,
  onSubmitSolution,
}: InterviewControlBarProps) {
  const nextPhase = getNextPhase(currentPhase);
  const nextPhaseInfo = nextPhase ? INTERVIEW_PHASES.find((p) => p.id === nextPhase) : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm flex items-center justify-between gap-3 flex-wrap">
      {/* Left Quick Helpers */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRequestHint}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          Get Hint
        </button>

        {currentPhase === "implementation" && !solutionSubmitted && (
          <button
            type="button"
            onClick={onSubmitSolution}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Submit Code
          </button>
        )}
      </div>

      {/* Right Advance Stepper */}
      <div className="flex items-center gap-2">
        {nextPhaseInfo ? (
          <button
            type="button"
            onClick={onAdvancePhase}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-sm"
          >
            <span>Proceed to Phase {nextPhaseInfo.number}: {nextPhaseInfo.shortLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> All Interview Phases Active
          </span>
        )}
      </div>
    </div>
  );
}
