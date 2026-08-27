"use client";

import * as React from "react";
import { FullPerformanceIntelligence } from "@/services/performance/performanceTypes";

interface AIPerformanceCoachProps {
  intelligence: FullPerformanceIntelligence;
}

interface CoachQnA {
  question: string;
  icon: string;
  accent: string;
  answer: string;
}

export function AIPerformanceCoach({ intelligence }: AIPerformanceCoachProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const {
    metrics,
    skillTrends,
    patternTrends,
    difficultyTrend,
    timeTrend,
    persistentWeaknesses,
    learningVelocity,
    strategicRecommendations,
    diagnosisSummary,
    windowConfig,
  } = intelligence;

  const questions: CoachQnA[] = [
    {
      question: "Am I actually improving?",
      icon: "📈",
      accent: "border-green-200 bg-green-50/50",
      answer:
        metrics.totalAttempts < 3
          ? "There is not yet enough practice history in this window to establish a statistically reliable improvement trend. Complete at least 3 practice sessions."
          : metrics.independentSolveRate.direction === "IMPROVING"
          ? `Yes, you are measurably improving. Your independent solve rate increased to ${metrics.independentSolveRate.currentValue}% (${metrics.independentSolveRate.delta > 0 ? `+${metrics.independentSolveRate.delta}%` : "steady"} vs prior period) across ${metrics.totalAttempts} attempts. Learning Velocity is rated "${learningVelocity.tier}" (${learningVelocity.overallVelocityScore}/100).`
          : metrics.independentSolveRate.direction === "STABLE"
          ? `Your overall performance is stable at ${metrics.independentSolveRate.currentValue}% independent solve rate. Focus on reducing hint dependency to kickstart the next growth phase.`
          : `Your independent solve rate has experienced a recent decline to ${metrics.independentSolveRate.currentValue}%. This may indicate an overly aggressive jump in problem difficulty or unaddressed prerequisite gaps.`,
    },
    {
      question: "What improved the most?",
      icon: "⭐",
      accent: "border-sky-200 bg-sky-50/50",
      answer:
        diagnosisSummary.strongestImprovingSkill
          ? `${diagnosisSummary.strongestImprovingSkill} demonstrated the strongest verified progress in this window. Independent solve rate and mastery have consistently trended upward with fewer hints required.`
          : "No specific skill has accumulated enough positive delta to qualify as top-improving yet. Continue consistent practice to build evidence.",
    },
    {
      question: "What is holding me back?",
      icon: "🛑",
      accent: "border-orange-200 bg-orange-50/50",
      answer:
        persistentWeaknesses.length > 0
          ? `The primary limiting factor is persistent weakness in ${persistentWeaknesses[0].skillOrPattern} (${persistentWeaknesses[0].failCount} failures, ${persistentWeaknesses[0].hintCount} hints). ${persistentWeaknesses[0].recommendedIntervention}`
          : difficultyTrend.transitionGap.hasMediumToHardGap
          ? "Your main hurdle is the Medium → Hard transition gap. You solve Medium problems comfortably but struggle to independently decompose Hard problems."
          : "No major systemic bottleneck is holding you back. Your practice distribution is balanced.",
    },
    {
      question: "Which weakness is persistent?",
      icon: "⚠️",
      accent: "border-rose-200 bg-rose-50/50",
      answer:
        persistentWeaknesses.length > 0
          ? `${persistentWeaknesses.map((w) => `${w.skillOrPattern} (${w.severity} severity, observed in ${w.affectedSystems.join(", ")})`).join("; ")}. These require structured prerequisite bridges rather than blind problem repetition.`
          : "No multi-session persistent weaknesses are currently recorded. Any recent mistakes have been resolved or remain isolated.",
    },
    {
      question: "Am I practicing at the right difficulty?",
      icon: "⚖️",
      accent: "border-indigo-200 bg-indigo-50/50",
      answer: `${difficultyTrend.pacingDiagnosis} ${difficultyTrend.recommendedDifficultyAction}`,
    },
    {
      question: "Am I getting faster?",
      icon: "⏱️",
      accent: "border-purple-200 bg-purple-50/50",
      answer: `${timeTrend.diagnosis} Median solve time is ${Math.round(timeTrend.overallMedianSolveTimeSeconds / 60)} minutes. You solve ${timeTrend.canSolveEfficientlyRate}% of problems within standard target time constraints.`,
    },
    {
      question: "What should I change next?",
      icon: "🎯",
      accent: "border-amber-200 bg-amber-50/50",
      answer: strategicRecommendations[0]
        ? `Primary Recommendation: ${strategicRecommendations[0].title}. ${strategicRecommendations[0].suggestedIntervention} Expected outcome: ${strategicRecommendations[0].expectedOutcome}`
        : "Maintain current adaptive practice schedule and continue reviewing SRS due items.",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0">
          AI
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">AI Performance Intelligence Coach</h3>
          <p className="text-xs text-slate-500">
            Interprets verified longitudinal evidence across {metrics.totalAttempts} attempts in {windowConfig.label}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 mb-4">
        🔒 All insights are strictly computed from structured performance data. No numbers, mastery scores, or outcomes are fabricated.
      </p>

      {/* Accordion Questions */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border transition-all overflow-hidden ${
              openIndex === idx ? q.accent : "border-slate-200 bg-white"
            }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">{q.icon}</span>
                <span className="text-sm font-extrabold text-slate-800">{q.question}</span>
              </div>
              <span className={`text-slate-400 text-xs transition-transform ${openIndex === idx ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {openIndex === idx && (
              <div className="px-4 pb-4.5 pt-1">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {q.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
