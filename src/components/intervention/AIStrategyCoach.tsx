"use client";

import * as React from "react";
import { AdaptiveStrategyResult } from "@/services/intervention/interventionTypes";

interface AIStrategyCoachProps {
  result: AdaptiveStrategyResult;
}

interface CoachQnA {
  question: string;
  icon: string;
  accent: string;
  answer: string;
}

export function AIStrategyCoach({ result }: AIStrategyCoachProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const { state, plans, diagnoses, history, intelligenceSummary } = result;

  const primaryPlan = plans.find((p) => p.status === "ACTIVE") || plans[0];
  const primaryDiag = diagnoses[0];

  const questions: CoachQnA[] = [
    {
      question: "What should I focus on right now?",
      icon: "🎯",
      accent: "border-sky-200 bg-sky-50/50",
      answer: primaryPlan
        ? `Focus on "${primaryPlan.title}". Objective: ${primaryPlan.objective}. Next action: ${primaryPlan.suggestedAction}`
        : "Maintain balanced multi-topic practice with standard difficulty calibration.",
    },
    {
      question: "Why did my strategy change?",
      icon: "🔄",
      accent: "border-indigo-200 bg-indigo-50/50",
      answer: history[0]
        ? `Strategy adjusted from ${history[0].previousMode} to ${history[0].newMode}. Reason: ${history[0].reason}. Evidence: ${history[0].evidence}`
        : `Current mode is ${state.currentMode}. Rationale: ${state.modeRationale}`,
    },
    {
      question: "What intervention is active?",
      icon: "⚡",
      accent: "border-amber-200 bg-amber-50/50",
      answer: primaryPlan
        ? `Active Intervention: ${primaryPlan.interventionType} (${primaryPlan.title}). Priority: ${primaryPlan.priority} (${primaryPlan.priorityScore}/100). Target duration: ${primaryPlan.targetDurationSessions} sessions.`
        : "No urgent interventions are currently active.",
    },
    {
      question: "What evidence triggered it?",
      icon: "🔍",
      accent: "border-purple-200 bg-purple-50/50",
      answer: primaryDiag
        ? `Triggered by ${primaryDiag.category} diagnosis (${primaryDiag.severity} severity, ${primaryDiag.confidence} confidence): ${primaryDiag.evidenceSummary} (Based on ${intelligenceSummary.totalAttempts} historical attempts).`
        : "Regular adaptive baseline evaluation.",
    },
    {
      question: "What should I stop doing?",
      icon: "🛑",
      accent: "border-rose-200 bg-rose-50/50",
      answer:
        state.deprioritizedSkills.length > 0
          ? `Stop over-practicing ${state.deprioritizedSkills.join(", ")} to avoid pattern tunnel-vision.`
          : primaryPlan?.interventionType === "HINT_REDUCTION"
          ? "Stop opening hints within the first 5 minutes of encountering an obstacle."
          : primaryPlan?.interventionType === "DIFFICULTY_DECREASE"
          ? "Stop brute-forcing Hard-tier problems until prerequisite decomposition is solid."
          : "Avoid skipping problem reflection steps after solving.",
    },
    {
      question: "What should I start doing?",
      icon: "🚀",
      accent: "border-emerald-200 bg-emerald-50/50",
      answer: primaryPlan
        ? `Start: ${primaryPlan.suggestedAction} Mode: ${state.preferredPracticeModes[0]} with ${state.timePressureLevel} time pressure.`
        : "Start consistent daily practice sessions aligned with your target goals.",
    },
    {
      question: "How will I know the intervention worked?",
      icon: "📈",
      accent: "border-teal-200 bg-teal-50/50",
      answer: primaryPlan
        ? `Success criteria: ${primaryPlan.successCriteria.targetMetric} must reach ${primaryPlan.successCriteria.threshold} (${primaryPlan.successCriteria.description}). Rollback if: ${primaryPlan.rollbackCriteria.triggerCondition}`
        : "Verified through continuous longitudinal mastery and speed improvements.",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0">
          AI
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">AI Adaptive Strategy Coach</h3>
          <p className="text-xs text-slate-500">
            Explains active interventions, strategy changes, and success criteria strictly from empirical evidence
          </p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400">
        🔒 All coach answers are derived strictly from structured Intervention Engine data. No metrics or outcomes are hallucinated.
      </p>

      <div className="space-y-3 pt-1">
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
