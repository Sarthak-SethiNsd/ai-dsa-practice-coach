"use client";

import * as React from "react";
import { PreparationPlan } from "@/services/orchestration/orchestrationTypes";

interface AIPreparationCoachProps {
  plan: PreparationPlan;
}

interface CoachQnA {
  question: string;
  icon: string;
  accent: string;
  answer: string;
}

export function AIPreparationCoach({ plan }: AIPreparationCoachProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const { nextBestAction, activities, deferredActivities, goal, strategyMode, totalPlannedMinutes, expectedOutcomes } = plan;

  const topDeferred = deferredActivities[0];
  const secondActivity = activities[1];

  const questions: CoachQnA[] = [
    {
      question: "What should I do now?",
      icon: "🎯",
      accent: "border-emerald-200 bg-emerald-50/50",
      answer: `Your immediate Next Best Action is "${nextBestAction.actionTitle}" (${nextBestAction.estimatedMinutes} minutes). ${nextBestAction.whyDescription} Focus: ${nextBestAction.focusSkillOrPattern}.`,
    },
    {
      question: "Why is this the priority?",
      icon: "🔍",
      accent: "border-sky-200 bg-sky-50/50",
      answer: `This activity was selected because your active strategy is ${strategyMode} and it directly addresses priority goals for "${goal?.name || "General Improvement"}". Priority score is ${nextBestAction.activityRef.priorityScore}/100 based on measured performance evidence.`,
    },
    {
      question: "Why was another activity deferred?",
      icon: "⏳",
      accent: "border-amber-200 bg-amber-50/50",
      answer: topDeferred
        ? `"${topDeferred.activity.title}" was placed in ${topDeferred.category === "DO_LATER" ? "DO LATER" : "NOT RECOMMENDED"}. Reason: ${topDeferred.deferralReason}`
        : "No high-priority activities were deferred in this session budget.",
    },
    {
      question: "How does this connect to my goal?",
      icon: "🏆",
      accent: "border-indigo-200 bg-indigo-50/50",
      answer: goal
        ? `Target Goal: "${goal.name}" (${goal.type}). This session focuses on ${goal.priorityTopics.join(", ")}, designed to advance your target readiness on ${goal.targetDifficulty} problems.`
        : "Connects to steady multi-topic DSA mastery across core algorithmic paradigms.",
    },
    {
      question: "What should I do after this?",
      icon: "⏭️",
      accent: "border-purple-200 bg-purple-50/50",
      answer: secondActivity
        ? `Next in line is "${secondActivity.title}" (${secondActivity.estimatedMinutes} min, ${secondActivity.difficulty} tier). Focus: ${secondActivity.reason}`
        : "Upon completing the Next Best Action, perform a brief reflection or review pending Spaced Repetition items.",
    },
    {
      question: "How much time should I spend?",
      icon: "⏱️",
      accent: "border-cyan-200 bg-cyan-50/50",
      answer: `Spend exactly ${totalPlannedMinutes} minutes total (${nextBestAction.estimatedMinutes} minutes on the primary activity). The plan is constrained to fit your ${plan.availableMinutes}-minute available budget.`,
    },
    {
      question: "What result would indicate that the plan worked?",
      icon: "📈",
      accent: "border-teal-200 bg-teal-50/50",
      answer: `Success criteria: ${nextBestAction.successCriteria}. Overall session target: ${expectedOutcomes[0] || "100% completion of unassisted solving"}.`,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0">
          AI
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">AI Preparation Orchestration Coach</h3>
          <p className="text-xs text-slate-500">
            Provides deterministic guidance on immediate action, priority rationale, and success criteria
          </p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400">
        🔒 All coach answers are derived strictly from structured Orchestrator output. No numbers, mastery scores, or outcomes are fabricated.
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
