"use client";

import * as React from "react";
import { PracticeSession } from "@/services/practice/practiceTypes";

interface PracticeQueueProps {
  session: PracticeSession;
}

function getDifficultyDot(difficulty: string): string {
  if (difficulty === "Easy") return "🟢";
  if (difficulty === "Medium") return "🟡";
  return "🔴";
}

function getDifficultyColor(difficulty: string): string {
  if (difficulty === "Easy") return "text-green-700 bg-green-50 border-green-200";
  if (difficulty === "Medium") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

export function PracticeQueue({ session }: PracticeQueueProps) {
  const { plannedProblems, currentProblemIndex } = session;

  const currentProblem = plannedProblems[currentProblemIndex];
  const nextProblem = plannedProblems[currentProblemIndex + 1];
  const laterProblems = plannedProblems.slice(currentProblemIndex + 2);
  const completedCount = session.completedProblems.length;

  if (!currentProblem) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Session Queue · {completedCount}/{plannedProblems.length} complete
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {/* Current Problem */}
        <QueueItem
          problem={currentProblem}
          label="Current"
          labelColor="bg-sky-500 text-white"
          isCurrent
        />

        {/* Next Problem */}
        {nextProblem && (
          <QueueItem
            problem={nextProblem}
            label="Next"
            labelColor="bg-indigo-100 text-indigo-700"
          />
        )}

        {/* Later Problems */}
        {laterProblems.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
              Later ({laterProblems.length})
            </p>
            <div className="space-y-1.5">
              {laterProblems.map((p, idx) => (
                <div
                  key={`${p.problemId}-${idx}`}
                  className="flex items-center gap-2 text-xs text-slate-500"
                >
                  <span>{getDifficultyDot(p.difficulty)}</span>
                  <span className="flex-1 truncate font-medium">{p.title}</span>
                  <span className="text-slate-400 shrink-0">~{p.timeEstimate.estimatedMinutes}m</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QueueItem({
  problem,
  label,
  labelColor,
  isCurrent = false,
}: {
  problem: NonNullable<PracticeSession["plannedProblems"][0]>;
  label: string;
  labelColor: string;
  isCurrent?: boolean;
}) {
  return (
    <div className={`px-4 py-3 ${isCurrent ? "bg-sky-50/60" : ""}`}>
      <div className="flex items-start gap-2">
        <span
          className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${labelColor}`}
        >
          {label}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${isCurrent ? "text-sky-900" : "text-slate-700"}`}>
            {problem.title}
          </p>
          <div className="flex items-center flex-wrap gap-1.5 mt-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {problem.targetSkill}
            </span>
            <span className="text-[10px] text-indigo-600 font-medium">
              {problem.primaryPattern}
            </span>
            <span className="text-[10px] text-slate-400">
              ~{problem.timeEstimate.estimatedMinutes}m
            </span>
            {problem.isRevision && (
              <span className="text-[10px] text-purple-600 font-bold">🔄 SRS</span>
            )}
            {problem.isPrerequisiteBridge && (
              <span className="text-[10px] text-orange-600 font-bold">🔧 Bridge</span>
            )}
            {problem.isChallenge && (
              <span className="text-[10px] text-rose-600 font-bold">🚀 Challenge</span>
            )}
          </div>
          {isCurrent && problem.recommendationReason && (
            <p className="text-[10px] text-sky-700 mt-1 leading-relaxed line-clamp-2">
              {problem.recommendationReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
