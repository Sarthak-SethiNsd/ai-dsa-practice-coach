"use client";

import * as React from "react";
import { PersonalizedLearningPlan } from "@/services/recommendationTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, Compass, Target, ArrowRight, CheckCircle } from "lucide-react";

interface LearningPlanCardProps {
  plan: PersonalizedLearningPlan;
}

export function LearningPlanCard({ plan }: LearningPlanCardProps) {
  const { today, thisWeek, thisMonth } = plan;

  return (
    <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <CardTitle className="text-slate-900 dark:text-white">Personalized Learning Plan</CardTitle>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Structured roadmap tailored specifically to your weak areas and mastery progression
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TODAY */}
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent dark:from-sky-950/30 border border-sky-200/80 dark:border-sky-800/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                  Today&apos;s Strategy
                </span>
              </div>
              <Badge variant="primary" className="bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-none font-semibold">
                Daily Focus
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Focus Area</span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <span>{today.focusArea}</span>
                </h4>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Improvement Goal</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900/40">
                  {today.improvementGoal}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                href="/review"
                variant="primary"
                size="sm"
                className="w-full justify-center bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Start AI Practice Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* THIS WEEK */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    This Week
                  </span>
                </div>
                <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-none font-semibold">
                  3 Core Topics
                </Badge>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Topics to Study</span>
                <div className="space-y-2 mt-2">
                  {thisWeek.topTopicsToStudy.map((topic, idx) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{topic}</span>
                      </div>
                      <CheckCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
              {thisWeek.rationale}
            </p>
          </div>

          {/* THIS MONTH */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    This Month
                  </span>
                </div>
                <Badge variant="success" className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-none font-semibold">
                  Target: {thisMonth.targetReadinessScore} pts
                </Badge>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Long-term Target</span>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 mt-2">
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                    {thisMonth.longTermTarget}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Goal Target Score</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                {thisMonth.targetReadinessScore} / 100
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
