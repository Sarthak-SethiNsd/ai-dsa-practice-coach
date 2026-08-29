"use client";

import * as React from "react";
import { PreparationActivity } from "@/services/orchestration/orchestrationTypes";

interface PreparationActivityCardProps {
  activity: PreparationActivity;
  index?: number;
  isPrimary?: boolean;
}

export function PreparationActivityCard({
  activity,
  index,
  isPrimary = false,
}: PreparationActivityCardProps) {
  const getPriorityStyle = (p: PreparationActivity["priority"]) => {
    switch (p) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "HIGH":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "MEDIUM":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "LOW":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getActivityIcon = (t: PreparationActivity["activityType"]) => {
    switch (t) {
      case "FOUNDATION_REPAIR":
        return "🏗️";
      case "RECOVERY_SESSION":
        return "🌱";
      case "TIMED_PRACTICE":
        return "⏱️";
      case "MOCK_INTERVIEW":
        return "💼";
      case "CONTEST_PRACTICE":
      case "CONTEST":
        return "🏆";
      case "REVISION":
        return "🔄";
      case "MIXED_PRACTICE":
        return "🔀";
      case "LEARNING_SESSION":
        return "📖";
      case "PATTERN_PRACTICE":
      case "PROBLEM_PRACTICE":
      default:
        return "🎯";
    }
  };

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 transition-all select-none ${
        isPrimary
          ? "bg-white border-emerald-300 shadow-md ring-2 ring-emerald-100"
          : "bg-white border-slate-200/90 shadow-xs hover:border-slate-300"
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {index !== undefined && (
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
              #{index + 1}
            </span>
          )}
          <span className="text-base">{getActivityIcon(activity.activityType)}</span>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityStyle(activity.priority)}`}>
            {activity.priority} Priority ({activity.priorityScore}/100)
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {activity.sourceSubsystem}
          </span>
          {isPrimary && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
              Do First
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>⏱️ {activity.estimatedMinutes} min</span>
          <span>•</span>
          <span className="text-slate-700">{activity.difficulty}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
        {activity.title}
      </h3>

      {/* Reason */}
      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
        {activity.reason}
      </p>

      {/* Success Criteria Box */}
      <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
          Success Criteria
        </p>
        <p className="text-xs font-semibold text-slate-800 mt-0.5">
          {activity.successCriteria.description}
        </p>
      </div>

      {/* Prerequisites callout if any */}
      {activity.prerequisites.length > 0 && (
        <div className="mt-3 text-[11px] text-slate-500 font-medium">
          <span className="font-bold text-slate-700">Prerequisites: </span>
          {activity.prerequisites.join(", ")}
        </div>
      )}
    </div>
  );
}
