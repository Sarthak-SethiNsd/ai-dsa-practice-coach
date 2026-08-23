"use client";

import { PreparationGap } from "@/services/preparation/preparationTypes";
import Link from "next/link";
import {
  Layers,
  Zap,
  ArrowRight,
  ShieldAlert,
  Clock,
  RotateCcw,
  Target,
  Sparkles,
} from "lucide-react";

interface GoalGapAnalysisProps {
  gaps: PreparationGap[];
}

const SEVERITY_CHIPS = {
  critical: "bg-rose-100 text-rose-800 border-rose-200",
  high: "bg-amber-100 text-amber-800 border-amber-200",
  medium: "bg-sky-100 text-sky-800 border-sky-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
};

export function GoalGapAnalysis({ gaps }: GoalGapAnalysisProps) {
  if (gaps.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
        <Layers className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <h3 className="text-sm font-bold text-slate-700">No Critical Gaps Detected</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your active practice data demonstrates balanced coverage across required domains.
        </p>
      </div>
    );
  }

  const getHrefForGap = (gap: PreparationGap): string => {
    switch (gap.actionType) {
      case "revision":
        return "/revision";
      case "contest":
        return "/virtual-contest";
      case "interview":
        return "/mock-interview";
      case "study":
        return "/study-session";
      case "practice":
      default:
        return "/today";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Prioritized Goal Gap Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by Impact × Weakness × Urgency calculation
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
          {gaps.length} Actionable Gaps
        </span>
      </div>

      {/* Gap Cards List */}
      <div className="space-y-3.5">
        {gaps.map((gap, idx) => (
          <div
            key={gap.id || idx}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                    SEVERITY_CHIPS[gap.severity]
                  }`}
                >
                  {gap.severity}
                </span>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {gap.topicOrSkill}
                </h4>

                <span className="text-[11px] font-mono text-slate-400">
                  (Score: {gap.compositePriority})
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {gap.reasoning}
              </p>

              {/* Factors pill row */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 font-mono">
                <span>Impact: {gap.impactScore}/10</span>
                <span>•</span>
                <span>Weakness: {gap.weaknessScore}/10</span>
                <span>•</span>
                <span>Urgency: {gap.urgencyScore}/10</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <Link
                href={getHrefForGap(gap)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
              >
                <span>{gap.recommendedAction}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
