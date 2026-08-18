"use client";

import * as React from "react";
import { PatternSummary } from "@/services/knowledge/knowledgeTypes";
import { Button } from "@/components/ui/Button";
import {
  Layers,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface PatternLibraryProps {
  patterns: PatternSummary[];
  onSelectPattern: (pattern: PatternSummary) => void;
}

export function PatternLibrary({ patterns, onSelectPattern }: PatternLibraryProps) {
  if (patterns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          <Layers className="w-7 h-7 text-violet-500" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">No patterns yet</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Tag problems with "Pattern" and assign a pattern name to start tracking your pattern mastery here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {patterns.map((pattern) => (
        <PatternCard key={pattern.patternName} pattern={pattern} onSelect={onSelectPattern} />
      ))}
    </div>
  );
}

function PatternCard({
  pattern,
  onSelect,
}: {
  pattern: PatternSummary;
  onSelect: (p: PatternSummary) => void;
}) {
  const successRate = pattern.successRate;
  const successColor =
    successRate >= 80 ? "text-emerald-600" : successRate >= 50 ? "text-amber-600" : "text-red-500";
  const successBg =
    successRate >= 80 ? "bg-emerald-100" : successRate >= 50 ? "bg-amber-100" : "bg-red-100";
  const barColor =
    successRate >= 80 ? "bg-emerald-500" : successRate >= 50 ? "bg-amber-500" : "bg-red-500";

  const lastPracticed = pattern.lastPracticedDate
    ? new Date(pattern.lastPracticedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div
      onClick={() => onSelect(pattern)}
      className="group bg-white rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all duration-200 p-5 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
              {pattern.patternName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{pattern.totalProblems} problem{pattern.totalProblems !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className={`text-sm font-extrabold ${successColor} ${successBg} px-2.5 py-1 rounded-xl`}>
          {successRate}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${successRate}%` }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-sm font-bold">{pattern.masteredCount}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Mastered</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sky-600 mb-0.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-sm font-bold">{pattern.solvedProblems}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Solved</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-0.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-sm font-bold">{pattern.needsRevisionCount}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Revision</p>
        </div>
      </div>

      {/* Common mistake */}
      {pattern.commonMistakeLabel && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-red-50 border border-red-100 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <p className="text-xs text-red-600 font-medium line-clamp-1">
            Common: {pattern.commonMistakeLabel}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {lastPracticed ? (
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Calendar className="w-3 h-3" /> {lastPracticed}
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Not in SRS yet</span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
      </div>
    </div>
  );
}
