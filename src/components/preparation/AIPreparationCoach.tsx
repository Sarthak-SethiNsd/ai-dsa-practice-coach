"use client";

import { AIPreparationCoachDebrief } from "@/services/preparation/preparationTypes";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  Compass,
  ArrowRight,
  ShieldCheck,
  Ban,
  Activity,
  Award,
} from "lucide-react";

interface AIPreparationCoachProps {
  coachDebrief: AIPreparationCoachDebrief;
}

export function AIPreparationCoach({ coachDebrief }: AIPreparationCoachProps) {
  const items = [
    {
      q: "1. Am I on track for my target deadline?",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      content: coachDebrief.amIOnTrack,
    },
    {
      q: "2. What is currently holding me back?",
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      content: coachDebrief.whatIsHoldingMeBack,
    },
    {
      q: "3. What should I prioritize this week?",
      icon: Compass,
      color: "bg-sky-50 text-sky-700 border-sky-200",
      content: coachDebrief.weeklyPriorities.join(" • "),
    },
    {
      q: "4. What should I STOP doing?",
      icon: Ban,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      content: coachDebrief.whatToStopDoing,
    },
    {
      q: "5. What should I practice today?",
      icon: Sparkles,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      content: coachDebrief.todayPracticeDirective,
    },
    {
      q: "6. Is my current problem difficulty appropriate?",
      icon: Activity,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      content: coachDebrief.difficultyAppropriateness,
    },
    {
      q: "7. Am I ready for my target interview or contest?",
      icon: Award,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      content: coachDebrief.amIReadyForTarget,
    },
    {
      q: "8. What is the biggest remaining risk to mitigate?",
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      content: coachDebrief.biggestRemainingRisk,
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
              AI Preparation Coach Strategic Debrief
            </h3>
            <p className="text-xs text-slate-500">
              Direct evidence-based counsel derived from multi-system learning telemetry
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Zero Hallucination Telemetry
        </span>
      </div>

      {/* 8 Question Directives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2"
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
