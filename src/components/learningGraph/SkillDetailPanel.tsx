"use client";

import {
  SkillNode,
  MasteryStatus,
} from "@/services/learningGraph/learningGraphTypes";
import Link from "next/link";
import {
  X,
  Target,
  ArrowRight,
  BookOpen,
  Brain,
  RotateCcw,
  Swords,
  Briefcase,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";

interface SkillDetailPanelProps {
  node: SkillNode | null;
  allNodes: SkillNode[];
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
  onSetFocusMode: (mode: "none" | "prerequisites" | "dependents") => void;
  focusMode: "none" | "prerequisites" | "dependents";
}

export function SkillDetailPanel({
  node,
  allNodes,
  onSelectNode,
  onClose,
  onSetFocusMode,
  focusMode,
}: SkillDetailPanelProps) {
  if (!node) return null;

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const prereqNodes = node.prerequisites
    .map((pId) => nodeMap.get(pId))
    .filter((n): n is SkillNode => n !== undefined);
  const dependentNodes = node.dependents
    .map((dId) => nodeMap.get(dId))
    .filter((n): n is SkillNode => n !== undefined);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono">
              {node.category.replace("_", " ")}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              {node.difficulty}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            {node.name}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mastery Dial & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mastery
          </span>
          <div className="text-lg font-extrabold font-mono text-sky-600">
            {node.masteryScore}%
          </div>
          <span className="text-[10px] text-slate-500 capitalize">{node.status.toLowerCase()}</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Accuracy
          </span>
          <div className="text-lg font-extrabold font-mono text-slate-800">
            {node.recentAccuracy}%
          </div>
          <span className="text-[10px] text-slate-500">Recent rate</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Solved
          </span>
          <div className="text-lg font-extrabold font-mono text-slate-800">
            {node.solvedProblemsCount}
          </div>
          <span className="text-[10px] text-slate-500">Verified problems</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Retention
          </span>
          <div className="text-lg font-extrabold font-mono text-emerald-600">
            {Math.round((1 - node.decayFactor) * 100)}%
          </div>
          <span className="text-[10px] text-slate-500">Memory health</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed font-sans">
        {node.description}
      </p>

      {/* Patterns Covered */}
      {node.patterns.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Algorithmic Patterns
          </span>
          <div className="flex flex-wrap gap-1.5">
            {node.patterns.map((pat, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
              >
                {pat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Graph Isolation Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-400 font-semibold text-[11px]">
          Graph Focus:
        </span>
        <button
          onClick={() => onSetFocusMode(focusMode === "prerequisites" ? "none" : "prerequisites")}
          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            focusMode === "prerequisites"
              ? "bg-sky-500 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Prerequisites Tree ({prereqNodes.length})
        </button>
        <button
          onClick={() => onSetFocusMode(focusMode === "dependents" ? "none" : "dependents")}
          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            focusMode === "dependents"
              ? "bg-purple-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Unlocks Tree ({dependentNodes.length})
        </button>
      </div>

      {/* Prerequisites & Dependent Lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Prerequisites */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Direct Prerequisites ({prereqNodes.length})
          </span>
          {prereqNodes.length === 0 ? (
            <p className="text-[11px] text-slate-400">Foundational node (no prerequisites required).</p>
          ) : (
            <div className="space-y-1">
              {prereqNodes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectNode(p.id)}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center justify-between font-medium text-slate-700"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {p.masteryScore}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dependents */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Enables Downstream ({dependentNodes.length})
          </span>
          {dependentNodes.length === 0 ? (
            <p className="text-[11px] text-slate-400">Terminal node or advanced specialty.</p>
          ) : (
            <div className="space-y-1">
              {dependentNodes.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectNode(d.id)}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center justify-between font-medium text-slate-700"
                >
                  <span className="truncate">{d.name}</span>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {d.masteryScore}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cross-System Action Triggers */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Jump to Subsystems
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <Link
            href={`/today`}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Daily Plan</span>
          </Link>
          <Link
            href={`/questions?topic=${encodeURIComponent(node.name)}`}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>Practice</span>
          </Link>
          <Link
            href={`/knowledge`}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            <span>Mistakes</span>
          </Link>
          <Link
            href={`/revision`}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>SRS Review</span>
          </Link>
          <Link
            href={`/mock-interview`}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
            <span>Mock Drill</span>
          </Link>
          <Link
            href={`/virtual-contest`}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <Swords className="w-3.5 h-3.5 text-rose-500" />
            <span>Timed Drill</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
