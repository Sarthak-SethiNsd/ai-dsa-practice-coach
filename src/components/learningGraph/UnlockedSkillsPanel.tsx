"use client";

import { RecentlyUnlockedSkill } from "@/services/learningGraph/learningGraphTypes";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";

interface UnlockedSkillsPanelProps {
  unlockedSkills: RecentlyUnlockedSkill[];
  onSelectNode: (nodeId: string) => void;
}

export function UnlockedSkillsPanel({
  unlockedSkills,
  onSelectNode,
}: UnlockedSkillsPanelProps) {
  if (unlockedSkills.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
        <Sparkles className="w-10 h-10 mx-auto text-slate-300" />
        <h3 className="text-sm font-bold text-slate-800">
          No Recent Unlocks
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Complete prerequisite foundations above 60% mastery to unlock advanced algorithmic topics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Recently Unlocked Topics & Patterns
          </h3>
          <p className="text-xs text-slate-500">
            Prerequisites verified. Ready for initial pattern discovery and practice.
          </p>
        </div>
      </div>

      {/* Unlocked Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unlockedSkills.map((item) => (
          <div
            key={item.skillId}
            className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-mono">
                  UNLOCKED
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {item.unlockedAt}
                </span>
              </div>

              <div>
                <button
                  onClick={() => onSelectNode(item.skillId)}
                  className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors text-left"
                >
                  {item.skillName}
                </button>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  Satisfied: {item.satisfiedPrerequisites.join(", ")}
                </p>
              </div>

              {item.whatItEnables.length > 0 && (
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Enables: </strong>
                  {item.whatItEnables.join(", ")}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 truncate mr-2">
                {item.recommendedFirstProblemTitle}
              </span>
              <Link
                href={item.targetHref}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shrink-0"
              >
                <span>Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
