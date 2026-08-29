"use client";

import * as React from "react";
import { PlanConfidenceLevel } from "@/services/orchestration/orchestrationTypes";

interface PlanConfidenceCardProps {
  confidence: {
    level: PlanConfidenceLevel;
    score: number;
    rationale: string;
    missingEvidence: string[];
  };
}

export function PlanConfidenceCard({ confidence }: PlanConfidenceCardProps) {
  const getLevelBadge = (l: PlanConfidenceLevel) => {
    switch (l) {
      case "HIGH":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "MODERATE":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "LOW":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "INSUFFICIENT_DATA":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Plan Confidence Assessment</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical certainty rating evaluated across performance samples, goal clarity, and prerequisite status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getLevelBadge(confidence.level)}`}>
            {confidence.level} ({confidence.score}%)
          </span>
        </div>
      </div>

      <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <p className="text-xs text-slate-800 font-semibold leading-relaxed">
          {confidence.rationale}
        </p>

        {confidence.missingEvidence.length > 0 && (
          <div className="pt-2 border-t border-slate-200/60 space-y-1">
            <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wide">
              ⚠️ Missing Evidence Areas
            </p>
            {confidence.missingEvidence.map((ev, idx) => (
              <p key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                <span>•</span>
                <span>{ev}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
