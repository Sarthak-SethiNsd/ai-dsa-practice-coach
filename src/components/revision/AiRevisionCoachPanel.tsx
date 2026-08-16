"use client";

import * as React from "react";
import { AiRevisionCoachReport, RevisionItem } from "@/services/revision/revisionTypes";
import { Bot, Lightbulb, AlertTriangle, ArrowRight, Brain, Zap } from "lucide-react";

interface Props {
  report: AiRevisionCoachReport;
  onStartItem: (item: RevisionItem) => void;
}

export function AiRevisionCoachPanel({ report, onStartItem }: Props) {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-500/30">
            <Bot className="w-8 h-8 text-sky-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">AI Spaced Repetition Coach</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              Analyzes your forgetting curves, previous mistakes, and memory decay rates to generate targeted revision recommendations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Estimated Mastery
            </p>
            <p className="text-3xl font-black text-emerald-400 tabular-nums">
              {report.estimatedOverallMastery}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Weak Topics
            </p>
            <p className="text-3xl font-black text-amber-400 tabular-nums">
              {report.weakTopics.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Forgotten Concepts
            </p>
            <p className="text-3xl font-black text-rose-400 tabular-nums">
              {report.forgottenConcepts.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coaching Notes & Weak Topics */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="text-base font-extrabold text-slate-900">
              Coaching Recommendations
            </h4>
          </div>

          <div className="space-y-3">
            {report.coachingNotes.map((note, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl text-xs font-semibold text-amber-900 leading-relaxed"
              >
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))}
          </div>

          {/* Weak topics chips */}
          {report.weakTopics.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Priority Revision Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {report.weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-bold"
                  >
                    ⚠️ {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Forgotten Concepts */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h4 className="text-base font-extrabold text-slate-900">
              Forgotten Concepts Detected
            </h4>
          </div>

          {report.forgottenConcepts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No forgotten concepts detected! Excellent memory retention.
            </div>
          ) : (
            <div className="space-y-3">
              {report.forgottenConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">
                      {concept.conceptName}
                    </span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md">
                      {concept.topic}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {concept.recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Revision Sequence */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-sky-600" />
          <h4 className="text-base font-extrabold text-slate-900">
            Recommended Revision Sequence
          </h4>
        </div>

        <div className="space-y-2">
          {report.recommendedRevisionOrder.slice(0, 5).map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-xs">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {item.problemTitle}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">
                    {item.platform} · Memory: {item.memoryStrength}% · Due: {item.nextDueDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onStartItem(item)}
                className="flex items-center gap-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
              >
                Revise Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
