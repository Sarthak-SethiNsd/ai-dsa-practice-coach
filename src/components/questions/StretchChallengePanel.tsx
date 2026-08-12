"use client";

import * as React from "react";
import { Flame, Zap, ExternalLink, CheckCircle2 } from "lucide-react";
import { QuestionRecommendation } from "@/services/questionRecommendationTypes";

interface StretchChallengePanelProps {
  challenges: QuestionRecommendation[];
  onMarkSolved: (id: string) => Promise<void>;
  onMarkViewed: (id: string) => Promise<void>;
}

export function StretchChallengePanel({
  challenges,
  onMarkSolved,
  onMarkViewed,
}: StretchChallengePanelProps) {
  if (challenges.length === 0) return null;

  return (
    <section className="stretch-challenges border border-orange-200/70 bg-gradient-to-br from-orange-50/60 to-amber-50/40 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-orange-500 text-white shadow-md shadow-orange-200">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Stretch Challenges</h3>
          <p className="text-xs text-slate-600">
            Higher difficulty questions tailored to push your problem-solving bounds & boost your readiness score.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {challenges.map((c) => {
          const isSolved = c.status === "Solved";

          return (
            <div
              key={c.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isSolved
                  ? "bg-emerald-50/50 border-emerald-200"
                  : "bg-white border-orange-100 hover:border-orange-300 hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                    +Readiness Boost
                  </span>
                  <span className="text-xs font-bold text-slate-500 capitalize">{c.platform}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{c.title}</h4>
                <p className="text-xs text-slate-600 mb-3">{c.topic} · {c.difficulty}</p>
                <p className="text-[11px] text-slate-500 italic bg-orange-50/50 p-2 rounded border border-orange-100/60 mb-3">
                  "{c.recommendationReason}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">{c.estimatedTime}</span>

                <div className="flex items-center gap-2">
                  {!isSolved && (
                    <button
                      onClick={() => onMarkSolved(c.id)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-600 cursor-pointer"
                      title="Mark as Solved"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={c.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onMarkViewed(c.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    <span>Challenge</span>
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
