"use client";

import * as React from "react";
import { ContestCoachAdvice, RatingRoadmapMilestone } from "@/services/contest/contestTypes";
import {
  Bot,
  Lightbulb,
  Sword,
  BookOpen,
  Map,
  Crosshair,
  Star,
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
} from "lucide-react";

interface Props {
  coach: ContestCoachAdvice;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  strategy: Sword,
  topic: BookOpen,
  mindset: Star,
  timing: Clock,
  preparation: Lightbulb,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-sky-50 text-sky-700 border-sky-200",
};

function MilestoneNode({ milestone }: { milestone: RatingRoadmapMilestone }) {
  const achieved = milestone.status === "achieved";
  const upcoming = milestone.status === "upcoming";

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
        achieved
          ? "bg-emerald-50 border-emerald-200"
          : upcoming
          ? "bg-sky-50 border-sky-200"
          : "bg-slate-50 border-slate-100 opacity-70"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          achieved
            ? "bg-emerald-500 text-white"
            : upcoming
            ? "bg-sky-500 text-white"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {achieved ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-extrabold text-slate-800">
            {milestone.rating}
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              achieved
                ? "bg-emerald-100 text-emerald-700"
                : upcoming
                ? "bg-sky-100 text-sky-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {milestone.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {achieved ? "✓ Achieved" : `Est. ${milestone.estimatedDate}`}
          {!achieved && milestone.contestsAway > 0 && ` · ~${milestone.contestsAway} contests away`}
        </p>
      </div>
    </div>
  );
}

export function ContestCoachPanel({ coach }: Props) {
  const [adviceTab, setAdviceTab] = React.useState<"improvement" | "strategy">(
    "improvement"
  );

  const displayAdvice =
    adviceTab === "improvement" ? coach.improvementAdvice : coach.strategyTips;

  return (
    <div className="space-y-6">
      {/* AI Coach Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-500/30">
            <Bot className="w-8 h-8 text-sky-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">AI Contest Coach</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              Personalized coaching based on your contest history, performance patterns,
              and weakness analysis. Advice updates automatically as you log more contests.
            </p>
          </div>
        </div>
      </div>

      {/* Next Milestone Prediction */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            Next Milestone Prediction
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Target Rating
            </p>
            <p className="text-2xl font-extrabold text-sky-700 tabular-nums">
              {coach.nextMilestonePrediction.targetRating}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Estimated Date
            </p>
            <p className="text-lg font-extrabold text-slate-800">
              {coach.nextMilestonePrediction.estimatedDate}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Confidence
            </p>
            <p className={`text-2xl font-extrabold tabular-nums ${
              coach.nextMilestonePrediction.confidencePercent >= 70
                ? "text-emerald-600"
                : "text-amber-600"
            }`}>
              {coach.nextMilestonePrediction.confidencePercent}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Required
            </p>
            <p className="text-sm font-semibold text-slate-700 leading-snug">
              {coach.nextMilestonePrediction.requiredConsistency}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Advice cards (left, wide) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          {/* Tab toggle */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl flex-1">
              <button
                type="button"
                onClick={() => setAdviceTab("improvement")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adviceTab === "improvement"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Improvement Advice
              </button>
              <button
                type="button"
                onClick={() => setAdviceTab("strategy")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adviceTab === "strategy"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Sword className="w-3.5 h-3.5" />
                Strategy Tips
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {displayAdvice.map((adv) => {
              const Icon = CATEGORY_ICONS[adv.category] ?? Lightbulb;
              return (
                <div
                  key={adv.id}
                  className={`p-4 rounded-xl border ${PRIORITY_COLORS[adv.priority]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold">{adv.title}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          adv.priority === "high"
                            ? "bg-rose-200 text-rose-800"
                            : adv.priority === "medium"
                            ? "bg-amber-200 text-amber-800"
                            : "bg-sky-200 text-sky-800"
                        }`}>
                          {adv.priority}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">
                        {adv.advice}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Priorities (right) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-5">
            <Crosshair className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
              Topic Priorities
            </h3>
          </div>
          <div className="space-y-3">
            {coach.topicPriorities.map((tp) => (
              <div key={tp.rank} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    tp.rank === 1
                      ? "bg-rose-100 text-rose-700"
                      : tp.rank === 2
                      ? "bg-orange-100 text-orange-700"
                      : tp.rank === 3
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tp.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-800">{tp.topic}</p>
                  <p className="text-xs text-slate-400 leading-snug mt-0.5">
                    {tp.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Roadmap */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <Map className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            Rating Roadmap
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {coach.ratingRoadmap.map((milestone) => (
            <MilestoneNode key={milestone.rating} milestone={milestone} />
          ))}
        </div>
      </div>
    </div>
  );
}
