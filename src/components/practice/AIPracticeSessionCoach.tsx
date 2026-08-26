"use client";

import * as React from "react";
import {
  PracticeSession,
  PracticeSessionScore,
  PracticeSessionAnalytics,
} from "@/services/practice/practiceTypes";
import { AIPracticeCoachInsight } from "@/services/practice/practiceSessionAnalytics";

interface AIPracticeSessionCoachProps {
  session: PracticeSession;
  score: PracticeSessionScore;
  analytics: PracticeSessionAnalytics;
  insight: AIPracticeCoachInsight;
}

interface CoachQuestion {
  question: string;
  answer: string;
  icon: string;
  accentClass: string;
}

export function AIPracticeSessionCoach({
  score,
  analytics,
  insight,
}: AIPracticeSessionCoachProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const questions: CoachQuestion[] = [
    {
      question: "How did I perform?",
      answer: insight.performance,
      icon: "📊",
      accentClass: "border-sky-200 bg-sky-50",
    },
    {
      question: "What did I improve?",
      answer: insight.improvements,
      icon: "📈",
      accentClass: "border-green-200 bg-green-50",
    },
    {
      question: "Where did I struggle?",
      answer: insight.struggles,
      icon: "⚠️",
      accentClass: "border-orange-200 bg-orange-50",
    },
    {
      question: "Why did the session adapt?",
      answer: insight.adaptationExplanation,
      icon: "🔀",
      accentClass: "border-indigo-200 bg-indigo-50",
    },
    {
      question: "Which skill needs attention?",
      answer: insight.skillToFocus,
      icon: "🎯",
      accentClass: "border-amber-200 bg-amber-50",
    },
    {
      question: "What should I practice next?",
      answer: insight.nextPractice,
      icon: "🚀",
      accentClass: "border-purple-200 bg-purple-50",
    },
    {
      question: "Should I increase or decrease difficulty?",
      answer: insight.difficultyAdvice,
      icon: "⚖️",
      accentClass: "border-rose-200 bg-rose-50",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
          AI
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900">AI Practice Session Coach</p>
          <p className="text-xs text-slate-500">
            Interpreting your session data — {analytics.problemsAttempted} problems attempted, score {score.overallScore}/100
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-400 px-1">
        All insights are derived from structured session data only. No outcomes, solve times, or mastery scores are invented.
      </p>

      {/* Questions Accordion */}
      <div className="space-y-2">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className={`rounded-xl border overflow-hidden transition-all ${
              openIndex === idx ? q.accentClass : "border-slate-200 bg-white"
            }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
            >
              <span className="text-base shrink-0">{q.icon}</span>
              <span className="text-sm font-bold text-slate-800 flex-1">{q.question}</span>
              <span className={`text-slate-400 text-sm transition-transform ${openIndex === idx ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-700 leading-relaxed">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
