"use client";

import * as React from "react";
import { PatternSummary } from "@/services/knowledge/knowledgeTypes";
import { ProblemNoteCard } from "./ProblemNoteCard";
import { ProblemNote } from "@/services/knowledge/knowledgeTypes";
import { Button } from "@/components/ui/Button";
import {
  X,
  Layers,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface PatternDetailPanelProps {
  pattern: PatternSummary;
  onClose: () => void;
  onEditNote?: (note: ProblemNote) => void;
  onDeleteNote?: (id: string) => void;
}

export function PatternDetailPanel({
  pattern,
  onClose,
  onEditNote,
  onDeleteNote,
}: PatternDetailPanelProps) {
  const successRate = pattern.successRate;
  const successColor =
    successRate >= 80 ? "text-emerald-600" : successRate >= 50 ? "text-amber-600" : "text-red-500";
  const barColor =
    successRate >= 80 ? "bg-emerald-500" : successRate >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{pattern.patternName}</h2>
            <p className="text-xs text-slate-500 font-medium">{pattern.totalProblems} problems tracked</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-700">Success Rate</span>
          <span className={`text-2xl font-extrabold ${successColor}`}>{successRate}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${successRate}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBadge
            icon={<CheckCircle2 className="w-4 h-4" />}
            value={pattern.masteredCount}
            label="Mastered"
            color="emerald"
          />
          <StatBadge
            icon={<TrendingUp className="w-4 h-4" />}
            value={pattern.solvedProblems}
            label="Solved"
            color="sky"
          />
          <StatBadge
            icon={<RotateCcw className="w-4 h-4" />}
            value={pattern.needsRevisionCount}
            label="Need Revision"
            color="amber"
          />
        </div>

        {pattern.commonMistakeLabel && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 mt-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-700">Most common mistake</p>
              <p className="text-xs text-red-600 font-medium">{pattern.commonMistakeLabel}</p>
            </div>
          </div>
        )}
      </div>

      {/* Problem list */}
      <div className="p-5">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Problems</p>
        {pattern.problems.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No problems tagged with this pattern yet.</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {pattern.problems.map((note) => (
              <ProblemNoteCard
                key={note.id}
                note={note}
                compact
                onEdit={onEditNote}
                onDelete={onDeleteNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: "emerald" | "sky" | "amber";
}) {
  const bg = color === "emerald" ? "bg-emerald-50 text-emerald-700" : color === "sky" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700";

  return (
    <div className={`flex flex-col items-center p-3 rounded-xl ${bg}`}>
      {icon}
      <span className="text-lg font-extrabold mt-1">{value}</span>
      <span className="text-xs font-semibold text-center">{label}</span>
    </div>
  );
}
