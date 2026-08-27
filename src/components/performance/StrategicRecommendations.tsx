"use client";

import * as React from "react";
import { StrategicRecommendation } from "@/services/performance/performanceTypes";

interface StrategicRecommendationsProps {
  recommendations: StrategicRecommendation[];
}

export function StrategicRecommendations({
  recommendations,
}: StrategicRecommendationsProps) {
  const getPriorityBadge = (p: StrategicRecommendation["priority"]) => {
    const map = {
      CRITICAL: "bg-red-100 text-red-800 border-red-200",
      HIGH: "bg-orange-100 text-orange-800 border-orange-200",
      MEDIUM: "bg-sky-100 text-sky-800 border-sky-200",
      LOW: "bg-slate-100 text-slate-700 border-slate-200",
    }[p];
    return <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${map}`}>{p} Priority</span>;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Goal-Aligned Strategic Recommendations</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescriptive interventions tuned to your active preparation goal and performance trends
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-extrabold text-slate-900">{rec.title}</h4>
                {getPriorityBadge(rec.priority)}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Target: {rec.affectedSkillOrPattern}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              {rec.reason}
            </p>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <span className="font-bold text-slate-700">Supporting Evidence: </span>
              {rec.supportingEvidence}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wide">Suggested Intervention</p>
                <p className="text-xs text-slate-800 font-semibold mt-0.5 leading-relaxed">{rec.suggestedIntervention}</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <p className="text-[10px] font-extrabold text-green-700 uppercase tracking-wide">Expected Outcome</p>
                <p className="text-xs text-slate-800 font-semibold mt-0.5 leading-relaxed">{rec.expectedOutcome}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
