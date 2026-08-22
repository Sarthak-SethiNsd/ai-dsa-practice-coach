"use client";

import { VCProblem, VCProblemState } from "@/services/contest/virtualContestTypes";
import { ExternalLink, Tag, ShieldCheck, Zap } from "lucide-react";

interface VirtualContestProblemPanelProps {
  problem: VCProblem;
  problemState: VCProblemState;
}

export function VirtualContestProblemPanel({
  problem,
  problemState,
}: VirtualContestProblemPanelProps) {
  const isLeetCode = problem.platform === "leetcode";

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
              Problem {problem.contestLabel}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {problem.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isLeetCode
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              {isLeetCode ? "LeetCode" : "Codeforces"}
            </span>
            {problem.url && (
              <a
                href={problem.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-600 font-medium transition-colors"
              >
                <span>Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Tags & Points */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Zap className="w-3 h-3" />
            {problem.basePoints} Base Points
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Complexity Target: {problem.referenceComplexity.time} / {problem.referenceComplexity.space}
          </span>
          <div className="flex flex-wrap gap-1 ml-auto">
            {problem.topics.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm leading-relaxed">
        {/* Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Statement
          </h3>
          <p className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
            {problem.description}
          </p>
        </div>

        {/* Examples */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Examples
            </h3>
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1.5"
              >
                <div className="text-slate-500 font-sans font-semibold text-[11px]">
                  Example {i + 1}:
                </div>
                <div>
                  <span className="font-bold text-slate-700 font-sans">Input: </span>
                  <span className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {ex.input}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 font-sans">Output: </span>
                  <span className="text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                    {ex.output}
                  </span>
                </div>
                {ex.explanation && (
                  <div className="text-slate-500 font-sans text-[11px] pt-1">
                    <span className="font-medium text-slate-600">Explanation: </span>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Constraints
            </h3>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
