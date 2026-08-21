"use client";

import { HelpCircle, Lock, Unlock, AlertTriangle } from "lucide-react";
import { HintLevel, InterviewProblem } from "@/services/interview/interviewTypes";
import { HINT_PENALTIES } from "@/services/interview/interviewScoring";

interface HintPanelProps {
  problem: InterviewProblem;
  unlockedLevels: HintLevel[];
  onRequestHint: (level: HintLevel) => void;
  onClose?: () => void;
}

const HINT_TIERS: { level: HintLevel; title: string; subtitle: string }[] = [
  {
    level: 1,
    title: "Level 1: Conceptual Direction",
    subtitle: "High-level intuition & algorithmic pattern direction",
  },
  {
    level: 2,
    title: "Level 2: Approach Guidance",
    subtitle: "Specific data structures & state management details",
  },
  {
    level: 3,
    title: "Level 3: Algorithmic Logic",
    subtitle: "Step-by-step pseudo-logic and pointer rules",
  },
  {
    level: 4,
    title: "Level 4: Near-Solution Breakdown",
    subtitle: "Detailed loop implementation template and boundaries",
  },
];

export function HintPanel({
  problem,
  unlockedLevels,
  onRequestHint,
}: HintPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Controlled Hints (4 Tiers)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Unlocks penalize Hint Dependency
        </span>
      </div>

      <div className="space-y-2.5">
        {HINT_TIERS.map(({ level, title, subtitle }) => {
          const isUnlocked = unlockedLevels.includes(level);
          const penalty = HINT_PENALTIES[level];
          const hintText = problem.hints[level] || "Consider optimizing data access.";

          return (
            <div
              key={level}
              className={`p-3 rounded-xl border transition-all ${
                isUnlocked
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <Unlock className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-slate-800">{title}</span>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isUnlocked
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  -{penalty} pts
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mb-2">{subtitle}</p>

              {isUnlocked ? (
                <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 text-xs text-slate-800 leading-relaxed font-sans">
                  {hintText}
                </div>
              ) : (
                <button
                  onClick={() => onRequestHint(level)}
                  className="w-full text-xs font-semibold py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:border-amber-400 hover:bg-amber-50 text-slate-700 hover:text-amber-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Unlock Hint (-{penalty} pts)
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
