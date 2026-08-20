"use client";

import { CheckCircle2, PartyPopper, ExternalLink } from "lucide-react";
import { DailyPlan } from "@/services/dailyPlan/dailyPlanTypes";

interface PlanCompletionModalProps {
  plan: DailyPlan;
  onClose: () => void;
}

export function PlanCompletionModal({ plan, onClose }: PlanCompletionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in slide-in-from-bottom-4 duration-300">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        {/* Headline */}
        <h2 className="text-xl font-bold text-slate-800 mb-1">Plan Complete! 🎉</h2>
        <p className="text-sm text-slate-500 mb-5">
          You finished all {plan.actions.length} action{plan.actions.length !== 1 ? "s" : ""} in your daily plan. Outstanding work.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-lg font-bold text-slate-800">{plan.completedCount}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-lg font-bold text-slate-800">{plan.completedMinutes}m</p>
            <p className="text-xs text-slate-500">Studied</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-lg font-bold text-amber-600">{plan.streak}🔥</p>
            <p className="text-xs text-slate-500">Streak</p>
          </div>
        </div>

        {/* Stretch challenge */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 mb-5 text-left">
          <div className="flex items-center gap-1.5 mb-1">
            <PartyPopper className="w-4 h-4 text-sky-600" />
            <p className="text-xs font-semibold text-sky-800">Stretch Challenge</p>
          </div>
          <p className="text-xs text-sky-700">
            You have extra time. Consider solving one more medium-difficulty problem on LeetCode or reviewing a contest problem for bonus growth.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
          <a
            href="https://leetcode.com/problemset/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Stretch
          </a>
        </div>
      </div>
    </div>
  );
}
