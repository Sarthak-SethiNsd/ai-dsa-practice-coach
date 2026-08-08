"use client";

import * as React from "react";
import { AchievementBadge as AchievementBadgeType } from "@/services/dashboardTypes";
import {
  Sparkles,
  Award,
  Medal,
  Trophy,
  Flame,
  Zap,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Lock,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Award,
  Medal,
  Trophy,
  Flame,
  Zap,
  TrendingUp,
  Cpu,
  ShieldAlert,
};

interface AchievementBadgeProps {
  badge: AchievementBadgeType;
}

export function AchievementBadge({ badge }: AchievementBadgeProps) {
  const IconComponent = ICON_MAP[badge.iconName] || Award;

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
        badge.unlocked
          ? "bg-gradient-to-br from-amber-500/10 via-white to-white border-amber-200/80 shadow-xs"
          : "bg-slate-50/70 border-slate-200/60 opacity-65"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 transition-transform ${
          badge.unlocked
            ? "bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105"
            : "bg-slate-200 text-slate-400"
        }`}
      >
        {badge.unlocked ? (
          <IconComponent className="w-5 h-5" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-extrabold text-slate-900 truncate">
            {badge.title}
          </h4>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              badge.unlocked
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {badge.unlocked ? "Unlocked" : `${Math.round(badge.progress)}%`}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
          {badge.description}
        </p>

        {/* Progress Bar for Locked */}
        {!badge.unlocked && (
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, badge.progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
