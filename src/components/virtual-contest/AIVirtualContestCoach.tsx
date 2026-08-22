"use client";

import { VCAICoachAdvice, VCScoreBreakdown } from "@/services/contest/virtualContestTypes";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

interface AIVirtualContestCoachProps {
  advice: VCAICoachAdvice;
  score: VCScoreBreakdown;
}

export function AIVirtualContestCoach({ advice, score }: AIVirtualContestCoachProps) {
  const isHarder = advice.nextContestDifficulty === "harder";
  const isEasier = advice.nextContestDifficulty === "easier";

  const questions = [
    {
      q: "What did I do well?",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      content: advice.whatWentWell,
    },
    {
      q: "Where did I lose the most time?",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      content: advice.timeManagementFeedback,
    },
    {
      q: "Which topics hurt my score?",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      content:
        advice.topicsToImprove.length > 0
          ? `Primary topics needing reinforcement: ${advice.topicsToImprove.join(", ")}.`
          : "No specific topic caused significant point loss.",
    },
    {
      q: "Which mistakes should I revisit?",
      icon: RotateCcw,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      content: advice.mistakesToRevisit.join(" • "),
    },
    {
      q: "What should I practice next?",
      icon: Compass,
      color: "text-sky-600 bg-sky-50 border-sky-200",
      content: advice.practiceNext,
    },
    {
      q: "Should my next contest be easier, similar, or harder?",
      icon: ArrowUpRight,
      color: isHarder
        ? "text-emerald-700 bg-emerald-50 border-emerald-300"
        : isEasier
        ? "text-amber-700 bg-amber-50 border-amber-300"
        : "text-blue-700 bg-blue-50 border-blue-300",
      content: `Recommendation: ${advice.nextContestDifficulty.toUpperCase()} — ${advice.nextContestDifficultyReason}`,
    },
  ];

  return (
    <div className="space-y-4 bg-slate-50/70 p-5 sm:p-6 rounded-3xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Contest Coach Debrief</h3>
            <span className="text-[11px] text-slate-500">
              Evidence-based reflection derived from observed metrics
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Verified Telemetry
        </span>
      </div>

      {/* 6 Directives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {questions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-lg border ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {item.q}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans pl-6">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
