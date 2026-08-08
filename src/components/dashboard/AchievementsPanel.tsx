"use client";

import * as React from "react";
import { AchievementBadge as AchievementBadgeType } from "@/services/dashboardTypes";
import { AchievementBadge } from "./AchievementBadge";
import { Award } from "lucide-react";

interface AchievementsPanelProps {
  badges: AchievementBadgeType[];
}

export function AchievementsPanel({ badges }: AchievementsPanelProps) {
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const pct = Math.round((unlockedCount / (badges.length || 1)) * 100);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Learning Achievements &amp; Badges
            </h3>
            <p className="text-[11px] text-slate-400">
              Automatically unlocked based on your practice milestones and quality consistency.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-amber-600">
            {unlockedCount} / {badges.length} Unlocked
          </span>
          <p className="text-[10px] text-slate-400 font-bold">({pct}% Complete)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {badges.map((b) => (
          <AchievementBadge key={b.id} badge={b} />
        ))}
      </div>
    </div>
  );
}
