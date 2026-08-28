"use client";

import * as React from "react";
import { InterventionDiagnosis } from "@/services/intervention/interventionTypes";

interface StrategyDiagnosisProps {
  diagnoses: InterventionDiagnosis[];
}

export function StrategyDiagnosis({ diagnoses }: StrategyDiagnosisProps) {
  const getSeverityBadge = (s: InterventionDiagnosis["severity"]) => {
    switch (s) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "HIGH":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "MEDIUM":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "LOW":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Diagnostic Findings</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic diagnostic evaluations compiled from longitudinal performance evidence
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400">
          {diagnoses.length} Diagnos{diagnoses.length === 1 ? "is" : "es"} Active
        </span>
      </div>

      <div className="space-y-4">
        {diagnoses.map((diag) => (
          <div key={diag.diagnosisId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-slate-900">{diag.category}</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(diag.severity)}`}>
                  {diag.severity} Severity
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {diag.confidence} Confidence
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                Action: {diag.recommendedIntervention}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              {diag.evidenceSummary}
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              <span className="font-bold text-slate-800">Diagnostic Rationale: </span>
              {diag.rationale}
            </p>

            {/* Evidence items */}
            {diag.evidence.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Supporting Evidence</p>
                {diag.evidence.map((ev, i) => (
                  <div key={i} className="text-[11px] text-slate-600 flex items-start gap-2">
                    <span>•</span>
                    <span>
                      <span className="font-bold text-slate-700">{ev.metric}:</span> {ev.value} ({ev.explanation})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
