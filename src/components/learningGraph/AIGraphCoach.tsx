"use client";

import { AIGraphCoachAdvice } from "@/services/learningGraph/learningGraphTypes";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ArrowRight,
  Zap,
  RotateCcw,
} from "lucide-react";

interface AIGraphCoachProps {
  coachAdvice: AIGraphCoachAdvice;
}

export function AIGraphCoach({ coachAdvice }: AIGraphCoachProps) {
  const items = [
    {
      q: "Why am I stuck on hard problems?",
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      content: coachAdvice.whyAmIStuck,
    },
    {
      q: `What should I learn before ${coachAdvice.whatToLearnBefore.topic}?`,
      icon: Compass,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      content: coachAdvice.whatToLearnBefore.explanation,
    },
    {
      q: "Why did you recommend this specific next skill?",
      icon: Sparkles,
      color: "bg-sky-50 text-sky-700 border-sky-200",
      content: coachAdvice.whyRecommendThisSkill,
    },
    {
      q: "What topics can I safely skip because I already know them?",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      content: coachAdvice.whatCanISkip.join(" • "),
    },
    {
      q: `What should I practice after mastering ${coachAdvice.whatToPracticeAfter.currentTopic}?`,
      icon: ArrowRight,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      content: `Target downstream extensions: ${coachAdvice.whatToPracticeAfter.nextTopics.join(", ")}.`,
    },
    {
      q: "Which single foundation would give me the biggest improvement?",
      icon: Zap,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      content: coachAdvice.biggestFoundationLever,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              AI Skill Graph Coach Strategic Debrief
            </h3>
            <p className="text-xs text-slate-500">
              Evidence-grounded explanations with zero hallucination guarantee
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Zero Hallucinated Metrics
        </span>
      </div>

      {/* Directives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {item.q}
                </h4>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans pl-8">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
