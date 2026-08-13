"use client";

import * as React from "react";
import { BookOpen, AlertTriangle, FileCode, Check, Copy } from "lucide-react";
import { AiReviewResponse } from "@/services/ai/aiTypes";

interface LearningTakeawaysPanelProps {
  reviewResult: AiReviewResponse | null;
}

export function LearningTakeawaysPanel({ reviewResult }: LearningTakeawaysPanelProps) {
  const [copiedOptimal, setCopiedOptimal] = React.useState(false);

  if (!reviewResult) return null;

  const handleCopyOptimal = () => {
    if (reviewResult.optimalCode) {
      navigator.clipboard.writeText(reviewResult.optimalCode);
      setCopiedOptimal(true);
      setTimeout(() => setCopiedOptimal(false), 2000);
    }
  };

  return (
    <div className="learning-takeaways-panel border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Learning Takeaways & Edge Cases</h3>
          <p className="text-xs text-slate-500">Key insights, edge cases, and reference implementation</p>
        </div>
      </div>

      {/* Learning Tips */}
      {reviewResult.learningTips && reviewResult.learningTips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Key Learning Takeaways
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reviewResult.learningTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100/80 text-xs text-slate-700 font-medium leading-relaxed"
              >
                💡 {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edge Cases */}
      {reviewResult.edgeCases && reviewResult.edgeCases.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Critical Edge Cases & Boundary Inputs</span>
          </h4>
          <div className="flex flex-col gap-2">
            {reviewResult.edgeCases.map((ec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-slate-700 flex items-start gap-2"
              >
                <span className="text-rose-500 font-bold">•</span>
                <span>{ec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimal Reference Code */}
      {reviewResult.optimalCode && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>Optimal Reference Solution Code</span>
            </h4>
            <button
              onClick={handleCopyOptimal}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              {copiedOptimal ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOptimal ? "Copied" : "Copy Code"}</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
            <pre>{reviewResult.optimalCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
