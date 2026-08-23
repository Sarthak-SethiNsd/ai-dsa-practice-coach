"use client";

import { AdaptivePreparationRoadmap } from "@/services/preparation/preparationTypes";
import {
  Map,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  Trophy,
  Briefcase,
} from "lucide-react";

interface PreparationRoadmapProps {
  roadmap: AdaptivePreparationRoadmap;
}

export function PreparationRoadmap({ roadmap }: PreparationRoadmapProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Adaptive Preparation Timeline
            </h3>
            <p className="text-xs text-slate-500">
              {roadmap.phases.length}-Phase strategic journey from Today to your Target Deadline
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
          Phase 1 of {roadmap.phases.length} Active
        </span>
      </div>

      {/* Timeline Phases */}
      <div className="space-y-6">
        {roadmap.phases.map((phase) => {
          const isCurrent = phase.isCurrent;
          const isCompleted = phase.isCompleted;

          return (
            <div
              key={phase.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                isCurrent
                  ? "bg-purple-50/40 border-purple-300 ring-2 ring-purple-400/20 shadow-xs"
                  : isCompleted
                  ? "bg-slate-50/70 border-emerald-200"
                  : "bg-white border-slate-200"
              }`}
            >
              {/* Phase Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono font-bold flex items-center justify-center text-xs ${
                      isCurrent
                        ? "bg-purple-600 text-white shadow-xs"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {phase.phaseNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {phase.name}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-600 text-white">
                          Current Focus
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-sans">
                      {phase.theme}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                  <span>
                    {phase.startDate} → {phase.endDate}
                  </span>
                  <span>•</span>
                  <span>{phase.durationWeeks} Weeks</span>
                </div>
              </div>

              {/* Phase Body */}
              <div className="py-4 space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 font-sans leading-relaxed">
                  <strong>Objective: </strong>
                  {phase.objective}
                </p>

                {/* Topics & Targets Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Priority Patterns */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Priority Patterns
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {phase.priorityPatterns.map((pat, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                        >
                          {pat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Workload */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1 font-mono">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                      Workload Targets
                    </span>
                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      <div>• {phase.targetProblemCount} Problems Target</div>
                      {phase.targetContestCount > 0 && (
                        <div>• {phase.targetContestCount} Virtual Contests</div>
                      )}
                      {phase.targetInterviewCount > 0 && (
                        <div>• {phase.targetInterviewCount} Mock Interviews</div>
                      )}
                    </div>
                  </div>

                  {/* Expected Gain & Exit Criteria */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Expected Gain
                    </span>
                    <div className="text-emerald-700 font-bold text-xs font-mono">
                      +{phase.expectedReadinessGain} Readiness Pts
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans">
                      Exit: {phase.exitCriteria[0]?.description || "Topic mastery"}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">Phase Progress</span>
                    <span className="font-mono font-bold text-slate-800">
                      {phase.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isCurrent
                          ? "bg-purple-600"
                          : "bg-slate-400"
                      }`}
                      style={{ width: `${phase.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
