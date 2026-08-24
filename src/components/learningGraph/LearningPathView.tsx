"use client";

import {
  AdaptiveLearningPath,
  SkillNode,
} from "@/services/learningGraph/learningGraphTypes";
import Link from "next/link";
import {
  Map,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface LearningPathViewProps {
  path: AdaptiveLearningPath | null;
  allNodes: SkillNode[];
  targetSkillId: string;
  onSelectTarget: (skillId: string) => void;
  onSelectNode: (nodeId: string) => void;
}

export function LearningPathView({
  path,
  allNodes,
  targetSkillId,
  onSelectTarget,
  onSelectNode,
}: LearningPathViewProps) {
  if (!path) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header & Target Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Shortest Adaptive Learning Path
            </h3>
            <p className="text-xs text-slate-500">
              Topological progression dynamically skipping already-mastered prerequisites
            </p>
          </div>
        </div>

        {/* Target Skill Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Target Skill:</span>
          <select
            value={targetSkillId}
            onChange={(e) => onSelectTarget(e.target.value)}
            className="bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold rounded-xl px-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
          >
            {allNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Path KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Active Steps
          </span>
          <div className="text-xl font-extrabold font-mono text-purple-950">
            {path.activeStepsCount} <span className="text-xs font-normal text-purple-700">of {path.totalSteps}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Skipped Mastered
          </span>
          <div className="text-xl font-extrabold font-mono text-emerald-950">
            {path.skippedMasteredCount} <span className="text-xs font-normal text-emerald-700">nodes</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
            Estimated Effort
          </span>
          <div className="text-xl font-extrabold font-mono text-sky-950">
            {path.estimatedHours} <span className="text-xs font-normal text-sky-700">hours</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Target Difficulty
          </span>
          <div className="text-xl font-extrabold font-mono text-slate-900">
            {path.targetDifficulty}
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Sequenced Path Steps (Foundation → Target)
        </h4>

        <div className="space-y-3">
          {path.pathSteps.map((step) => {
            const isSkipped = step.isSkipped;
            const isTarget = step.node.id === path.targetSkillId;

            return (
              <div
                key={step.stepNumber}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isTarget
                    ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/20"
                    : isSkipped
                    ? "bg-slate-50/50 border-slate-200 opacity-60"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl font-mono font-bold flex items-center justify-center text-xs shrink-0 ${
                      isTarget
                        ? "bg-purple-600 text-white"
                        : isSkipped
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {isSkipped ? "✓" : step.stepNumber}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onSelectNode(step.node.id)}
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors text-left"
                      >
                        {step.node.name}
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({step.node.difficulty})
                      </span>
                      {isSkipped && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                          Skipped
                        </span>
                      )}
                      {isTarget && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-md bg-purple-600 text-white">
                          Target Goal
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-sans leading-relaxed">
                      {isSkipped ? step.skipReason : step.keyLearningObjectives[0]}
                    </p>
                  </div>
                </div>

                {!isSkipped && (
                  <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0">
                    <Link
                      href={`/questions?topic=${encodeURIComponent(step.node.name)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
                    >
                      <span>Start Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
