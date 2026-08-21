"use client";

import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Compass, ShieldCheck } from "lucide-react";
import { PostInterviewCoachAdvice } from "@/services/interview/interviewEngine";

interface AIInterviewCoachProps {
  advice: PostInterviewCoachAdvice;
}

export function AIInterviewCoach({ advice }: AIInterviewCoachProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
        <Sparkles className="w-5 h-5 text-sky-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-100">AI Interview Coach Directive</h3>
          <p className="text-[11px] text-slate-400">Personalized technical debrief</p>
        </div>
      </div>

      {/* 6 Key Reflection Directives */}
      <div className="space-y-3 text-xs leading-relaxed">
        {/* 1. What Went Well */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            1. What went well?
          </div>
          <p className="text-slate-200">{advice.whatWentWell}</p>
        </div>

        {/* 2. What Held Me Back */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            2. What held me back?
          </div>
          <p className="text-slate-200">{advice.whatHeldMeBack}</p>
        </div>

        {/* 3. What to Practice Next */}
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
            <Compass className="w-3.5 h-3.5" />
            3. What should I practice next?
          </div>
          <p className="text-slate-200">{advice.whatToPracticeNext}</p>
        </div>

        {/* 4. Interview Behavior to Change */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            4. What interview behavior should I change?
          </div>
          <p className="text-slate-200">{advice.behaviorToChange}</p>
        </div>

        {/* 5. Readiness for Next Difficulty */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            5. Am I ready for the next difficulty level?
          </div>
          <p className="text-slate-200">{advice.readinessRecommendation}</p>
        </div>
      </div>
    </div>
  );
}
