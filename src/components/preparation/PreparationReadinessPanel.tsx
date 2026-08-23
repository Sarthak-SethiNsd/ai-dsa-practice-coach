"use client";

import { PreparationReadinessSummary } from "@/services/preparation/preparationTypes";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  ShieldCheck,
  Layers,
  Clock,
  RotateCcw,
  Target,
} from "lucide-react";

interface PreparationReadinessPanelProps {
  readiness: PreparationReadinessSummary;
}

const STATUS_COLORS = {
  strong: "bg-emerald-500 text-white",
  developing: "bg-sky-500 text-white",
  needs_attention: "bg-amber-500 text-white",
  critical: "bg-rose-500 text-white",
};

export function PreparationReadinessPanel({
  readiness,
}: PreparationReadinessPanelProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                10-Dimension Preparation Readiness
              </h3>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                {readiness.overallScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {readiness.bandLabel}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Deterministic Cross-System Evaluation
        </span>
      </div>

      {/* Summary Narrative */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {readiness.summaryExplanation}
      </div>

      {/* Strengths & Limiters Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Top Validated Strengths
          </h4>
          <ul className="space-y-1 text-xs text-emerald-900">
            {readiness.topStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600" />
            Critical Levers to Unlock Next Tier
          </h4>
          <ul className="space-y-1 text-xs text-amber-900">
            {readiness.criticalLimiters.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 10 Dimension Meters Grid */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Individual Competency Telemetry
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {readiness.dimensions.map((dim) => (
            <div
              key={dim.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{dim.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">
                    {dim.score}/100
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-md ${
                      STATUS_COLORS[dim.status]
                    }`}
                  >
                    {dim.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Meter bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dim.score >= 75
                      ? "bg-emerald-500"
                      : dim.score >= 50
                      ? "bg-sky-500"
                      : dim.score >= 35
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 font-sans leading-normal">
                {dim.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
