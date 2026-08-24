"use client";

import { GraphInsights } from "@/services/learningGraph/learningGraphTypes";
import {
  Award,
  AlertTriangle,
  Zap,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Compass,
} from "lucide-react";

interface GraphInsightsPanelProps {
  insights: GraphInsights;
}

export function GraphInsightsPanel({ insights }: GraphInsightsPanelProps) {
  const cards = [
    {
      q: "1. What is my strongest skill?",
      val: `${insights.strongestSkill.name} (${insights.strongestSkill.score}%)`,
      desc: insights.strongestSkill.explanation,
      icon: Award,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      q: "2. What is my weakest foundational skill?",
      val: `${insights.weakestFoundation.name} (${insights.weakestFoundation.score}%)`,
      desc: insights.weakestFoundation.explanation,
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      q: "3. What skill is blocking the most downstream progress?",
      val: `${insights.criticalBottleneck.name} (Blocks ${insights.criticalBottleneck.blockedCount} topics)`,
      desc: insights.criticalBottleneck.explanation,
      icon: Zap,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      q: "4. What should I learn next?",
      val: insights.nextBestSkill.name,
      desc: insights.nextBestSkill.explanation,
      icon: Compass,
      color: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      q: "5. What skill am I currently forgetting (SRS Decay)?",
      val: insights.decayingSkill ? `${insights.decayingSkill.name} (${insights.decayingSkill.score}%)` : "No active decay detected",
      desc: insights.decayingSkill ? insights.decayingSkill.explanation : "All spaced repetition memory strengths are healthy.",
      icon: RotateCcw,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      q: "6. Which mastered skill unlocks the most opportunities?",
      val: `${insights.mostUnlockingSkill.name} (Unlocks ${insights.mostUnlockingSkill.unlockCount} nodes)`,
      desc: insights.mostUnlockingSkill.explanation,
      icon: Sparkles,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Deterministic Graph Intelligence Insights
            </h3>
            <p className="text-xs text-slate-500">
              Quantitative reflection answers calculated directly from your dependency network
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Evidence-Derived Telemetry
        </span>
      </div>

      {/* Grid of 6 Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl border ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {c.q}
                  </span>
                </div>

                <div className="text-sm font-extrabold text-slate-900 font-mono">
                  {c.val}
                </div>
              </div>

              <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1 border-t border-slate-200/60">
                {c.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
