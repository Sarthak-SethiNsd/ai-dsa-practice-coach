"use client";

import { Sparkles, ShieldCheck, AlertTriangle, Target } from "lucide-react";
import { AIDailyCoachAdvice } from "@/services/dailyPlan/dailyPlanTypes";

interface AIDailyCoachProps {
  advice: AIDailyCoachAdvice;
}

export function AIDailyCoach({ advice }: AIDailyCoachProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-sky-400" />
        <h2 className="text-sm font-semibold text-slate-100">AI Daily Coach</h2>
      </div>

      {/* Greeting */}
      <p className="text-slate-300 text-sm mb-4">{advice.greeting}</p>

      {/* Main directive */}
      <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-sky-300 font-medium uppercase tracking-wide mb-1">
              Today's priority
            </p>
            <p className="text-sm font-semibold text-white">{advice.mainDirective}</p>
          </div>
        </div>
      </div>

      {/* Why it matters */}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-emerald-300 font-medium uppercase tracking-wide mb-0.5">
              Why it matters
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{advice.whyItMatters}</p>
          </div>
        </div>
      </div>

      {/* What to avoid */}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-amber-300 font-medium uppercase tracking-wide mb-0.5">
              Avoid today
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{advice.whatToAvoid}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/60 my-3" />

      {/* Next milestone */}
      <div className="flex items-start gap-2">
        <span className="text-sm">🎯</span>
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
            Next milestone
          </p>
          <p className="text-xs text-slate-200 font-medium">{advice.nextMilestone}</p>
        </div>
      </div>

      {/* Motivation */}
      <p className="mt-3 text-xs text-slate-400 italic">{advice.motivationLine}</p>
    </div>
  );
}
