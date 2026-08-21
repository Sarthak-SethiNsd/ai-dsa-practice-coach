"use client";

import { ExternalLink, Tag, BookOpen, AlertCircle } from "lucide-react";
import { InterviewProblem } from "@/services/interview/interviewTypes";

interface InterviewQuestionPanelProps {
  problem: InterviewProblem;
}

export function InterviewQuestionPanel({ problem }: InterviewQuestionPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Problem Statement
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">{problem.title}</h2>
        </div>

        {problem.url && (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-semibold px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors"
          >
            <span>{problem.platform}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5">
        {problem.topics.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
          >
            <Tag className="w-2.5 h-2.5 text-slate-400" />
            {t}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
        {problem.description}
      </div>

      {/* Examples */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Examples
          </h3>
          <div className="space-y-2">
            {problem.examples.map((ex, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-mono space-y-1"
              >
                <div className="text-slate-800">
                  <span className="text-slate-500 font-sans font-semibold">Input: </span>
                  {ex.input}
                </div>
                <div className="text-emerald-700">
                  <span className="text-slate-500 font-sans font-semibold">Output: </span>
                  {ex.output}
                </div>
                {ex.explanation && (
                  <div className="text-slate-600 text-[11px] font-sans pt-1">
                    <span className="font-semibold text-slate-500">Explanation: </span>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints */}
      {problem.constraints && problem.constraints.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Constraints
          </h3>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-600 font-mono bg-slate-50/40 p-3 rounded-xl border border-slate-100">
            {problem.constraints.map((c, idx) => (
              <li key={idx} className="leading-snug">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
