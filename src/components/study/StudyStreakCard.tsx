"use client";

import * as React from "react";
import { StudyStreakData } from "@/services/study/studyTypes";
import { Flame, CheckCircle } from "lucide-react";

interface Props {
  streak: StudyStreakData | null;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StudyStreakCard({ streak }: Props) {
  if (!streak) return null;

  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
            <Flame className="w-6 h-6 fill-white text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black">Focus Streak System</h3>
            <p className="text-xs text-amber-100 font-medium">
              Streak increments only when a meaningful study session is completed.
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-4xl font-black tabular-nums">{streak.currentStreak}</p>
          <p className="text-xs font-extrabold uppercase text-amber-100">Day Streak</p>
        </div>
      </div>

      {/* Weekly consistency checkboxes */}
      <div className="space-y-2 pt-2 border-t border-white/20">
        <p className="text-xs font-extrabold uppercase tracking-widest text-amber-100">
          This Week&apos;s Active Days
        </p>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => {
            const isActive = streak.weeklyConsistency[day];
            return (
              <div
                key={day}
                className={`py-2 rounded-xl text-center border transition-all ${
                  isActive
                    ? "bg-white text-orange-700 border-white font-extrabold shadow-xs"
                    : "bg-white/10 text-amber-100 border-white/10 font-semibold"
                }`}
              >
                <p className="text-xs">{day}</p>
                {isActive && <CheckCircle className="w-3.5 h-3.5 mx-auto mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
