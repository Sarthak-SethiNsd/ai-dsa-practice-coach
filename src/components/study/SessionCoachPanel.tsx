"use client";

import * as React from "react";
import { CompletedStudySession } from "@/services/study/studyTypes";
import { Bot, Lightbulb, TrendingUp, CheckCircle, AlertTriangle, Zap } from "lucide-react";

interface Props {
  session: CompletedStudySession;
}

export function SessionCoachPanel({ session }: Props) {
  const signal = session.adaptiveSignal;
  const summary = session.coachSummary;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-sky-100 text-sky-700 rounded-2xl">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            AI Session Coach Report
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Empirical feedback generated from session execution metrics
          </p>
        </div>
      </div>

      {/* Adaptive Signal Card */}
      {signal && (
        <div className="p-5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-600 fill-sky-600" />
              Adaptive Difficulty Adjustment
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                signal.difficultyAdjustment === "increase"
                  ? "bg-emerald-100 text-emerald-700"
                  : signal.difficultyAdjustment === "decrease"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {signal.difficultyAdjustment} Difficulty
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {signal.reason}
          </p>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Strengths Noticed
          </div>
          <ul className="space-y-1 text-xs text-slate-700 font-medium list-disc list-inside">
            {summary.strengthsNoticed.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Areas to Refine
          </div>
          <ul className="space-y-1 text-xs text-slate-700 font-medium list-disc list-inside">
            {summary.weaknessesNoticed.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pacing & Recommendation */}
      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-700">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block font-bold mb-0.5">Pacing Feedback</strong>
            {summary.pacingFeedback}
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 bg-sky-50/60 border border-sky-100 rounded-2xl text-xs font-medium text-sky-900">
          <TrendingUp className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-sky-950 block font-bold mb-0.5">Next Recommended Session</strong>
            {summary.nextSessionRecommendation}
          </div>
        </div>
      </div>
    </div>
  );
}
