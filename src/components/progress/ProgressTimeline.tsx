"use client";

import * as React from "react";
import { ProgressMilestone } from "@/services/progress/progressTypes";
import {
  Trophy,
  Target,
  Clock,
  Sparkles,
  Award,
  Calendar,
  Layers,
  Flame,
} from "lucide-react";

interface ProgressTimelineProps {
  milestones: ProgressMilestone[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy,
  Target,
  Clock,
  Sparkles,
  Award,
  Calendar,
  Layers,
  Flame,
};

const CATEGORY_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  contest: { dot: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700" },
  problem: { dot: "bg-sky-500", bg: "bg-sky-50", text: "text-sky-700" },
  streak: { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
  review: { dot: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
  achievement: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
};

export function ProgressTimeline({ milestones }: ProgressTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 text-xs font-semibold">
        No milestones logged for this time range. Complete practice tasks or contests to build your timeline!
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {milestones.map((item) => {
        const Icon = ICON_MAP[item.iconName] || Target;
        const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.problem;

        return (
          <div key={item.id} className="relative group">
            {/* Timeline Dot with Icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-xs ${color.dot}`}
            >
              <Icon className="w-3 h-3" />
            </div>

            {/* Card Body */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-900">{item.title}</span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {item.description}
              </p>

              {item.valueBadge && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${color.bg} ${color.text}`}
                  >
                    {item.valueBadge}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
