"use client";

import * as React from "react";
import { CompletedStudySession } from "@/services/study/studyTypes";
import { SessionCoachPanel } from "./SessionCoachPanel";
import { Award, X, ArrowRight } from "lucide-react";

interface Props {
  session: CompletedStudySession;
  onClose: () => void;
}

export function SessionSummaryModal({ session, onClose }: Props) {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Session Completed!
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                {session.date} · {session.durationMinutes}m Session
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Key Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
              <p className="text-2xl font-black text-emerald-600 tabular-nums">
                {session.solvedCount} / {session.tasks.length}
              </p>
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mt-0.5">
                Solved
              </p>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl text-center">
              <p className="text-2xl font-black text-sky-600 tabular-nums">
                {formatTime(session.actualTimeSpentSeconds)}
              </p>
              <p className="text-[11px] font-bold text-sky-700 uppercase tracking-wide mt-0.5">
                Time Spent
              </p>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
              <p className="text-2xl font-black text-indigo-600 tabular-nums">
                {session.completionRatePct}%
              </p>
              <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mt-0.5">
                Completion Rate
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
              <p className="text-2xl font-black text-amber-600 tabular-nums">
                {session.revisionSuccessRatePct}%
              </p>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mt-0.5">
                SRS Success
              </p>
            </div>
          </div>

          {/* AI Session Coach Panel */}
          <SessionCoachPanel session={session} />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 sticky bottom-0 bg-white rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            Continue to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
