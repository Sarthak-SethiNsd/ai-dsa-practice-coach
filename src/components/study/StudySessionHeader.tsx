"use client";

import * as React from "react";
import { StudyStreakData } from "@/services/study/studyTypes";
import { Flame, Clock, Zap, Award, Play } from "lucide-react";

interface Props {
  streakData: StudyStreakData | null;
  onQuickStart: () => void;
}

export function StudySessionHeader({ streakData, onQuickStart }: Props) {
  const currentStreak = streakData?.currentStreak || 0;
  const totalMinutes = streakData?.totalStudyMinutes || 0;
  const totalSessions = streakData?.totalSessionsCompleted || 0;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 rounded-full bg-white" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-extrabold uppercase tracking-widest text-amber-100">
                Focus Mode & Execution
              </span>
              {currentStreak > 0 && (
                <span className="flex items-center gap-1 bg-white/30 text-white px-3 py-1 rounded-full text-xs font-extrabold">
                  <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  {currentStreak}-Day Active Streak
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Actionable Study Session & Focus Mode
            </h1>

            <p className="text-amber-100 text-sm max-w-2xl leading-relaxed">
              Synthesizes your Roadmap missions, Spaced Repetition queue, Weak Topics, and AI recommendations into a single distraction-free learning session.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onQuickStart}
              className="flex items-center gap-2 px-6 py-4 bg-white text-orange-700 hover:bg-amber-50 text-sm font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-orange-600 text-orange-600" />
              Quick Start 30m Session
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{currentStreak} Days</p>
            <p className="text-xs font-semibold text-slate-400">Current Study Streak</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{totalMinutes} Mins</p>
            <p className="text-xs font-semibold text-slate-400">Total Focused Time</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{totalSessions}</p>
            <p className="text-xs font-semibold text-slate-400">Sessions Completed</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 tabular-nums">92%</p>
            <p className="text-xs font-semibold text-slate-400">Focus Efficiency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
