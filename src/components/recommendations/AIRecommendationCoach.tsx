"use client";

import {
  AdaptiveProblemRecommendation,
  AIRecommendationCoachAdvice,
} from "@/services/recommendations/recommendationTypes";
import {
  Sparkles,
  ShieldCheck,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight,
} from "lucide-react";

interface AIRecommendationCoachProps {
  topRec: AdaptiveProblemRecommendation | null;
  coachAdvice: AIRecommendationCoachAdvice | null;
  isLoading: boolean;
}

export function AIRecommendationCoach({
  topRec,
  coachAdvice,
  isLoading,
}: AIRecommendationCoachProps) {
  if (!topRec) return null;

  const defaultAdvice: AIRecommendationCoachAdvice = coachAdvice || {
    whyThisProblem: `${topRec.reason} ${topRec.fullExplanation}`,
    whyBetterThanAlternative: `Targeting ${topRec.targetSkill} (${topRec.evidence.targetSkillMasteryScore}% mastery) delivers the highest combined leverage across skill weakness and downstream graph unlock reach.`,
    whatSkillAmIPracticing: `You are practicing the ${topRec.targetPattern} pattern mapping to ${topRec.targetSkill}.`,
    whyThisDifficulty: `${topRec.difficulty} difficulty fits your current performance profile without causing cognitive stall.`,
    shouldSolveNowOrReviseFirst: `Solve this problem now to maintain learning momentum.`,
    whatToSolveAfter: {
      nextTopics: ["Review Knowledge Base notes", "Advance to adjacent pattern variations"],
      explanation: `After completing this problem, record pattern insights into the Knowledge Base.`,
    },
    whyRepeatingThisPattern: `Pattern reinforcement continues until steady accuracy above 75% is demonstrated.`,
  };

  const cards = [
    {
      q: "Why was this problem selected right now?",
      icon: Sparkles,
      color: "bg-sky-50 text-sky-700 border-sky-200",
      content: defaultAdvice.whyThisProblem,
    },
    {
      q: "Why is this better than solving another topic?",
      icon: Compass,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      content: defaultAdvice.whyBetterThanAlternative,
    },
    {
      q: "What skill and pattern am I actually practicing?",
      icon: Zap,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      content: defaultAdvice.whatSkillAmIPracticing,
    },
    {
      q: "Why is this difficulty level appropriate?",
      icon: CheckCircle2,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      content: defaultAdvice.whyThisDifficulty,
    },
    {
      q: "Should I solve this now or revise something first?",
      icon: RotateCcw,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      content: defaultAdvice.shouldSolveNowOrReviseFirst,
    },
    {
      q: "What should I solve after completing this?",
      icon: ArrowRight,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      content: defaultAdvice.whatToSolveAfter.explanation,
    },
    {
      q: "Why does the engine recommend this pattern repeatedly?",
      icon: AlertTriangle,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      content: defaultAdvice.whyRepeatingThisPattern,
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
              AI Recommendation Coach Strategic Guidance
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic evidence-grounded reasoning with zero hallucination guarantee
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Real Dataset Telemetry
        </span>
      </div>

      {/* Grid of Reasoning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl border ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {c.q}
                </h4>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans pl-8">
                {isLoading ? "Analyzing multi-factor evidence..." : c.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
