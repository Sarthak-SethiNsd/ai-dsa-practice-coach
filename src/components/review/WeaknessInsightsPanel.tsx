"use client";

import * as React from "react";
import { ShieldAlert, TrendingDown, Target, Sparkles, ArrowRight } from "lucide-react";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";

interface WeaknessInsightsPanelProps {
  entries: ReviewHistoryEntry[];
}

export function WeaknessInsightsPanel({ entries }: WeaknessInsightsPanelProps) {
  // Analyze mistake patterns from review entries
  const stats = React.useMemo(() => {
    let total = entries.length;
    let timeMistakes = 0;
    let spaceMistakes = 0;
    let edgeCaseMistakes = 0;
    let optMistakes = 0;

    const topicScores: Record<string, { count: number; totalScore: number }> = {};

    entries.forEach((e) => {
      const resp = e.response;
      if (!resp) return;

      const title = e.problemTitle || "General";
      const topic = title.split(" ")[0] || "Arrays";

      if (!topicScores[topic]) topicScores[topic] = { count: 0, totalScore: 0 };
      topicScores[topic].count++;

      let score = 75;
      if (resp.correctnessAnalysis?.toLowerCase().includes("bug") || resp.correctnessAnalysis?.toLowerCase().includes("issue")) {
        score -= 20;
      }
      if (resp.timeComplexity?.includes("O(N^2)") || resp.timeComplexity?.includes("O(2^N)")) {
        timeMistakes++;
        score -= 15;
      }
      if (resp.spaceComplexity?.includes("O(N)")) {
        spaceMistakes++;
        score -= 10;
      }
      if (resp.edgeCases && resp.edgeCases.length > 0) {
        edgeCaseMistakes++;
        score -= 10;
      }
      if (resp.optimizationSuggestions && resp.optimizationSuggestions.length > 0) {
        optMistakes++;
      }

      topicScores[topic].totalScore += Math.max(30, score);
    });

    const weakTopicsList = Object.entries(topicScores)
      .map(([topic, data]) => ({
        topic,
        avgScore: Math.round(data.totalScore / (data.count || 1)),
        count: data.count,
      }))
      .sort((a, b) => a.avgScore - b.avgScore);

    return {
      total,
      timeMistakes,
      spaceMistakes,
      edgeCaseMistakes,
      optMistakes,
      weakTopicsList,
    };
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div className="weakness-insights-panel border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Weakness Profile & Feedback Loop</h3>
            <p className="text-xs text-slate-500">
              AI detected weakness patterns feeding directly into your Recommendations & Roadmap
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
          {stats.total} Reviews Analyzed
        </span>
      </div>

      {/* Mistake Pattern Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Time Complexity</span>
            <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.timeMistakes}</p>
          <p className="text-[10px] text-slate-500">Unoptimal time bounds</p>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <div className="flex items-center justify-between text-xs text-indigo-800 font-semibold mb-1">
            <span>Space Complexity</span>
            <TrendingDown className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.spaceMistakes}</p>
          <p className="text-[10px] text-slate-500">High memory allocation</p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
          <div className="flex items-center justify-between text-xs text-rose-800 font-semibold mb-1">
            <span>Edge Case Issues</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.edgeCaseMistakes}</p>
          <p className="text-[10px] text-slate-500">Boundary handling gaps</p>
        </div>

        <div className="p-3.5 rounded-xl bg-violet-50/60 border border-violet-100">
          <div className="flex items-center justify-between text-xs text-violet-800 font-semibold mb-1">
            <span>Optimization Gaps</span>
            <TrendingDown className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.optMistakes}</p>
          <p className="text-[10px] text-slate-500">Redundant ops detected</p>
        </div>
      </div>

      {/* Weakness Loop Integration Explanation */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 shrink-0 text-violet-200" />
          <div className="text-xs">
            <p className="font-bold text-sm">Adaptive Feedback Loop Active</p>
            <p className="text-violet-100 mt-0.5">
              Every review submitted automatically updates your AI Recommendations, Practice Roadmap, and Question Engine without manual setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
