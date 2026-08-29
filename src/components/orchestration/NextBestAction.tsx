"use client";

import * as React from "react";
import Link from "next/link";
import { NextBestAction as NextBestActionType } from "@/services/orchestration/orchestrationTypes";

interface NextBestActionProps {
  action: NextBestActionType;
}

export function NextBestAction({ action }: NextBestActionProps) {
  const getTargetUrl = (target: NextBestActionType["handoffTarget"]) => {
    switch (target) {
      case "practice":
        return "/practice";
      case "revision":
        return "/revision";
      case "interview":
        return "/mock-interview";
      case "contest":
        return "/virtual-contest";
      case "learning_graph":
        return "/learning-graph";
      default:
        return "/practice";
    }
  };

  const getTargetLabel = (target: NextBestActionType["handoffTarget"]) => {
    switch (target) {
      case "practice":
        return "Launch Practice Session →";
      case "revision":
        return "Open Spaced Revision →";
      case "interview":
        return "Start Mock Interview →";
      case "contest":
        return "Enter Virtual Contest →";
      case "learning_graph":
        return "Explore Learning Graph →";
      default:
        return "Start Activity →";
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-white/10 relative overflow-hidden select-none">
      {/* Glow background accent */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
            Next Best Action · Immediate Priority
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
            ⏱️ {action.estimatedMinutes} min
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
            {action.difficulty} Tier
          </span>
        </div>
      </div>

      {/* Main Title */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
        {action.actionTitle}
      </h2>

      {/* Reason (Why) */}
      <div className="mt-3 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
        <span className="font-extrabold text-sky-300">Why: </span>
        {action.whyDescription}
      </div>

      {/* Success Criteria Box */}
      <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
            ✓ Measurable Success Criteria
          </p>
          <p className="text-xs font-semibold text-slate-200">{action.successCriteria}</p>
        </div>

        {/* Action Button */}
        <Link
          href={getTargetUrl(action.handoffTarget)}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold transition-all text-center shadow-sm"
        >
          {getTargetLabel(action.handoffTarget)}
        </Link>
      </div>
    </div>
  );
}
