"use client";

import * as React from "react";
import { Shield, ExternalLink, CheckCircle2 } from "lucide-react";
import { QuestionRecommendation } from "@/services/questionRecommendationTypes";

interface ConfidenceBuilderPanelProps {
  builders: QuestionRecommendation[];
  onMarkSolved: (id: string) => Promise<void>;
  onMarkViewed: (id: string) => Promise<void>;
}

export function ConfidenceBuilderPanel({
  builders,
  onMarkSolved,
  onMarkViewed,
}: ConfidenceBuilderPanelProps) {
  if (builders.length === 0) return null;

  return (
    <section className="confidence-builders border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-200">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Confidence Builders</h3>
          <p className="text-xs text-slate-600">
            Foundational questions designed to solidify key pattern mechanics in your weaker topics before moving up.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {builders.map((b) => {
          const isSolved = b.status === "Solved";

          return (
            <div
              key={b.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isSolved
                  ? "bg-emerald-100/50 border-emerald-300"
                  : "bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Mastery Builder
                  </span>
                  <span className="text-xs font-bold text-slate-500 capitalize">{b.platform}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{b.title}</h4>
                <p className="text-xs text-slate-600 mb-3">{b.topic} · {b.difficulty}</p>
                <p className="text-[11px] text-slate-500 italic bg-emerald-50/50 p-2 rounded border border-emerald-100/60 mb-3">
                  "{b.recommendationReason}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">{b.estimatedTime}</span>

                <div className="flex items-center gap-2">
                  {!isSolved && (
                    <button
                      onClick={() => onMarkSolved(b.id)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-600 cursor-pointer"
                      title="Mark as Solved"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={b.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onMarkViewed(b.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <span>Practice</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
