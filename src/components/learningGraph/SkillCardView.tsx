"use client";

import {
  SkillNode,
  MasteryStatus,
} from "@/services/learningGraph/learningGraphTypes";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface SkillCardViewProps {
  nodes: SkillNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

const STATUS_BADGES: Record<
  MasteryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  MASTERED: {
    label: "Mastered",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  DEVELOPING: {
    label: "Developing",
    bg: "bg-sky-100",
    text: "text-sky-800",
    border: "border-sky-200",
  },
  LEARNING: {
    label: "Learning",
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  DISCOVERED: {
    label: "Discovered",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  DECAYING: {
    label: "Decaying",
    bg: "bg-rose-100",
    text: "text-rose-800",
    border: "border-rose-200",
  },
  LOCKED: {
    label: "Locked",
    bg: "bg-slate-100",
    text: "text-slate-400",
    border: "border-slate-200",
  },
};

export function SkillCardView({
  nodes,
  selectedNodeId,
  onSelectNode,
}: SkillCardViewProps) {
  if (nodes.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No skills match the selected filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const badge = STATUS_BADGES[node.status];

        return (
          <div
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              isSelected
                ? "bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-sky-400/30"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isSelected ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {node.difficulty}
                </span>
              </div>

              <div>
                <h4
                  className={`text-xs sm:text-sm font-bold ${
                    isSelected ? "text-white" : "text-slate-900"
                  }`}
                >
                  {node.name}
                </h4>
                <p
                  className={`text-[11px] mt-0.5 line-clamp-2 ${
                    isSelected ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {node.description}
                </p>
              </div>
            </div>

            {/* Mastery Meter & Dependencies footer */}
            <div className="space-y-2 pt-2 border-t border-slate-100/10">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className={isSelected ? "text-slate-400" : "text-slate-500"}>
                  Mastery
                </span>
                <span className="font-bold text-sky-400">
                  {node.masteryScore}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-200/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    node.masteryScore >= 75
                      ? "bg-emerald-500"
                      : node.masteryScore >= 50
                      ? "bg-sky-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${node.masteryScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>
                  {node.prerequisites.length} Prereqs • {node.dependents.length} Unlocks
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
