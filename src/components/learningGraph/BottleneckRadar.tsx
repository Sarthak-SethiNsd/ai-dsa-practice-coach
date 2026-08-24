"use client";

import { GraphBottleneck } from "@/services/learningGraph/learningGraphTypes";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Layers,
} from "lucide-react";

interface BottleneckRadarProps {
  bottlenecks: GraphBottleneck[];
  onSelectNode: (nodeId: string) => void;
}

export function BottleneckRadar({
  bottlenecks,
  onSelectNode,
}: BottleneckRadarProps) {
  if (bottlenecks.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
        <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-800">
          No Critical Bottlenecks Detected
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          All high-leverage prerequisite foundations are currently performing above downstream blockage thresholds.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              High-Leverage Bottleneck Radar
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by Impact × Weakness × Dependency Reach × Goal Relevance
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
          {bottlenecks.length} Active Bottlenecks
        </span>
      </div>

      {/* Bottleneck Cards */}
      <div className="space-y-4">
        {bottlenecks.map((b, idx) => (
          <div
            key={b.skillId || idx}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono">
                  Rank #{idx + 1}
                </span>
                <button
                  onClick={() => onSelectNode(b.skillId)}
                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors text-left"
                >
                  {b.skillName}
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  (Mastery: {b.masteryScore}%)
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-500">
                Composite Score: {b.compositeRank}
              </span>
            </div>

            {/* Blocked Downstream Skills */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Directly Blocking ({b.blockedSkillsCount} Skills):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {b.blockedSkillNames.map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 font-medium text-[11px]"
                  >
                    🔒 {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 text-xs">
              <div className="text-slate-600 font-medium max-w-lg">
                <strong>Recommendation: </strong>
                {b.recommendedAction}
              </div>

              <Link
                href={b.actionHref}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
              >
                <span>Drill {b.skillName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
