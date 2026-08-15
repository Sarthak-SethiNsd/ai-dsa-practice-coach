"use client";

import * as React from "react";
import { VirtualContestPlan, ContestPlatform } from "@/services/contest/contestTypes";
import {
  Calendar,
  Target,
  Zap,
  TrendingUp,
  Star,
  ArrowRight,
  Flag,
} from "lucide-react";

interface Props {
  plan: VirtualContestPlan;
}

const PLATFORM_LABELS: Record<ContestPlatform, string> = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
  atcoder: "AtCoder",
  other: "Other",
};

const PLATFORM_COLORS: Record<ContestPlatform, string> = {
  codeforces: "bg-blue-100 text-blue-700",
  leetcode: "bg-orange-100 text-orange-700",
  atcoder: "bg-emerald-100 text-emerald-700",
  other: "bg-slate-100 text-slate-700",
};

export function VirtualContestPlanner({ plan }: Props) {
  return (
    <div className="space-y-6">
      {/* Recommended Frequency Card */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-7 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-violet-200 text-xs font-bold uppercase tracking-widest">
              Recommended Frequency
            </p>
            <p className="text-5xl font-black tabular-nums">
              {plan.recommendedFrequency}
              <span className="text-2xl text-violet-300 font-bold ml-1">
                / week
              </span>
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <Zap className="w-7 h-7" />
          </div>
        </div>
        <p className="text-violet-200 text-sm mt-4 leading-relaxed max-w-2xl">
          {plan.recommendedFrequencyReason}
        </p>
      </div>

      {/* Rating Milestones */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            Rating Milestones
          </h3>
        </div>

        {plan.ratingMilestones.length === 0 ? (
          <p className="text-sm text-slate-400">No upcoming milestones — you&apos;ve achieved them all!</p>
        ) : (
          <div className="space-y-3">
            {plan.ratingMilestones.map((milestone, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-extrabold text-slate-800 tabular-nums">
                      {milestone.targetRating}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      (+{milestone.currentGap} from current)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ~{milestone.contestsNeeded} contest{milestone.contestsNeeded !== 1 ? "s" : ""} needed
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-500">Est.</p>
                  <p className="text-sm font-extrabold text-sky-700">
                    {milestone.estimatedDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Target Topics */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            Focus Topics
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.targetTopics.map((topic, i) => (
            <span
              key={topic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                i === 0
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : i === 1
                  ? "bg-orange-50 text-orange-700 border-orange-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {i < 2 && <Star className="w-3 h-3" />}
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Weekly Plan */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            4-Week Plan
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plan.weeklyPlan.map((week, i) => (
            <div
              key={i}
              className="p-5 bg-slate-50 border border-slate-100 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">
                  {week.weekLabel}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    PLATFORM_COLORS[week.suggestedPlatform]
                  }`}
                >
                  {PLATFORM_LABELS[week.suggestedPlatform]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-2xl font-black tabular-nums text-slate-800">
                    {week.recommendedContests}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">contests</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <div className="text-center">
                  <p
                    className={`text-2xl font-black tabular-nums ${
                      week.targetRatingGain >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {week.targetRatingGain >= 0 ? "+" : ""}
                    {week.targetRatingGain}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">rating goal</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {week.focusTopics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Goals */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <Flag className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            Monthly Goals
          </h3>
        </div>
        <div className="space-y-3">
          {plan.monthlyGoals.map((goal, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                M{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-slate-800">{goal.month}</p>
                <p className="text-xs text-slate-500">
                  Focus: <span className="font-bold text-slate-600">{goal.focusArea}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <p className="text-xs font-bold text-slate-400">Target</p>
                  <p className="text-sm font-extrabold text-slate-700">
                    {goal.targetContests} contests
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Rating Goal</p>
                  <p className={`text-sm font-extrabold ${goal.targetRatingGain >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {goal.targetRatingGain >= 0 ? "+" : ""}{goal.targetRatingGain}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
