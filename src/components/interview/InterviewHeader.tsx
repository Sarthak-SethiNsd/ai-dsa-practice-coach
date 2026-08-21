"use client";

import { LogOut, HelpCircle, Shield, Briefcase } from "lucide-react";
import {
  InterviewSession,
  INTERVIEW_PHASES,
} from "@/services/interview/interviewTypes";
import { InterviewTimer } from "./InterviewTimer";

interface InterviewHeaderProps {
  session: InterviewSession;
  onEndInterview: () => void;
  onRequestHint: () => void;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-red-50 text-red-700 border-red-200",
  Adaptive: "bg-purple-50 text-purple-700 border-purple-200",
};

export function InterviewHeader({
  session,
  onEndInterview,
  onRequestHint,
}: InterviewHeaderProps) {
  const currentQ = session.questions[session.currentQuestionIndex];
  const phaseInfo = INTERVIEW_PHASES.find((p) => p.id === session.currentPhase);
  const diffClass = DIFFICULTY_STYLES[session.config.difficulty] || DIFFICULTY_STYLES.Medium;

  return (
    <header className="bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between gap-4 flex-wrap">
      {/* Left: Problem & Phase info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm font-bold text-slate-800 truncate">
              {currentQ?.title || "Technical Problem"}
            </h1>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${diffClass}`}>
              {session.config.difficulty}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
              {session.config.style} Style
            </span>
          </div>

          <p className="text-xs text-sky-700 font-medium mt-0.5 truncate">
            Phase {phaseInfo?.number}: {phaseInfo?.name}
          </p>
        </div>
      </div>

      {/* Right: Timer & Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <InterviewTimer
          remainingSeconds={session.remainingSeconds}
          totalDurationSeconds={session.totalDurationSeconds}
        />

        <button
          onClick={onRequestHint}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
          title="Open Hint Panel"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Hints
        </button>

        <button
          onClick={onEndInterview}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 transition-colors"
          title="Conclude interview and generate evaluation report"
        >
          <LogOut className="w-3.5 h-3.5" />
          End & Evaluate
        </button>
      </div>
    </header>
  );
}
