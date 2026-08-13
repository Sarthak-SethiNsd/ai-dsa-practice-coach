"use client";

import * as React from "react";
import { Zap, Layers, AlertTriangle, Lightbulb } from "lucide-react";
import { AiReviewResponse } from "@/services/ai/aiTypes";

interface ComplexityAnalysisPanelProps {
  reviewResult: AiReviewResponse | null;
}

export function ComplexityAnalysisPanel({ reviewResult }: ComplexityAnalysisPanelProps) {
  if (!reviewResult) return null;

  return (
    <div className="complexity-analysis-panel border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Complexity & Performance Breakdown</h3>
          <p className="text-xs text-slate-500">Big-O time & space complexity bounds analysis</p>
        </div>
      </div>

      {/* Complexity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Time Complexity */}
        <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-600" />
              Time Complexity
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-200 text-sky-900">
              {reviewResult.timeComplexity || "O(N)"}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Evaluated execution runtime complexity across loop structures and recursive calls.
          </p>
        </div>

        {/* Space Complexity */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Space Complexity
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
              {reviewResult.spaceComplexity || "O(1)"}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Evaluated auxiliary space allocated for data structures and call stack frames.
          </p>
        </div>
      </div>

      {/* Optimization Suggestions */}
      {reviewResult.optimizationSuggestions && reviewResult.optimizationSuggestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Optimization Opportunities & Unnecessary Operations</span>
          </h4>
          <div className="flex flex-col gap-2">
            {reviewResult.optimizationSuggestions.map((opt, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-700 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
