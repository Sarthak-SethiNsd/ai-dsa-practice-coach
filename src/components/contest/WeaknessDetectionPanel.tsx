"use client";

import * as React from "react";
import { WeaknessDetectionResult, WeaknessSeverity } from "@/services/contest/contestTypes";
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Zap,
  Lightbulb,
  XCircle,
  CheckCircle,
  Target,
} from "lucide-react";

interface Props {
  weakness: WeaknessDetectionResult;
}

const SEVERITY_CONFIG: Record<
  WeaknessSeverity,
  { color: string; bg: string; label: string }
> = {
  critical: {
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
    label: "Critical",
  },
  high: {
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    label: "High",
  },
  medium: {
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Medium",
  },
  low: {
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-200",
    label: "Low",
  },
};

function SectionHeader({
  icon: Icon,
  title,
  count,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-slate-500" />
      <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
        {title}
      </h3>
      {count !== undefined && (
        <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export function WeaknessDetectionPanel({ weakness }: Props) {
  return (
    <div className="space-y-6">
      {/* Overall weakness score */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Overall Weakness Index
            </p>
            <p className="text-5xl font-black tabular-nums">
              {weakness.overallWeaknessScore}
              <span className="text-2xl text-slate-400 font-bold">/100</span>
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {weakness.overallWeaknessScore < 25
                ? "Strong performance — minimal weaknesses detected"
                : weakness.overallWeaknessScore < 50
                ? "Moderate weaknesses — targeted practice recommended"
                : "Significant weaknesses — intensive focus needed"}
            </p>
          </div>
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
              weakness.overallWeaknessScore < 25
                ? "border-emerald-500 text-emerald-400"
                : weakness.overallWeaknessScore < 50
                ? "border-amber-500 text-amber-400"
                : "border-rose-500 text-rose-400"
            }`}
          >
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <SectionHeader icon={Lightbulb} title="AI-Generated Insights" count={weakness.aiInsights.length} />
        <div className="space-y-3">
          {weakness.aiInsights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-sky-50 border border-sky-100 rounded-xl"
            >
              <Zap className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
              <p className="text-sm text-sky-800 font-medium leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <SectionHeader
            icon={TrendingDown}
            title="Weak Topics"
            count={weakness.weakTopics.length}
          />
          {weakness.weakTopics.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              No significant weak topics detected!
            </div>
          ) : (
            <div className="space-y-3">
              {weakness.weakTopics.map((t) => {
                const cfg = SEVERITY_CONFIG[t.severity];
                return (
                  <div
                    key={t.topic}
                    className={`p-4 rounded-xl border ${cfg.bg}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-extrabold ${cfg.color}`}>
                        {t.topic}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border`}
                        >
                          {cfg.label}
                        </span>
                        <span className={`text-xs font-bold ${cfg.color}`}>
                          {t.successRate}% success
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-white/60 rounded-full h-1.5 mb-2">
                      <div
                        className={`h-1.5 rounded-full ${
                          t.severity === "critical"
                            ? "bg-rose-500"
                            : t.severity === "high"
                            ? "bg-orange-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${t.successRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {t.recommendation}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {t.contestAppearances} contest appearance{t.contestAppearances !== 1 ? "s" : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mistake Patterns */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <SectionHeader
            icon={XCircle}
            title="Mistake Patterns"
            count={weakness.mistakePatterns.length}
          />
          {weakness.mistakePatterns.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              No recurring mistake patterns detected!
            </div>
          ) : (
            <div className="space-y-3">
              {weakness.mistakePatterns.map((p, i) => (
                <div
                  key={i}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-rose-700">
                      {p.pattern}
                    </span>
                    <span className="text-xs font-bold text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full">
                      {p.frequency}× occurrence
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{p.description}</p>
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">{p.suggestedFix}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slow Areas */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <SectionHeader icon={Clock} title="Slow Areas" count={weakness.slowAreas.length} />
          {weakness.slowAreas.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              Time efficiency looks good!
            </div>
          ) : (
            <div className="space-y-3">
              {weakness.slowAreas.map((a, i) => (
                <div key={i} className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-amber-700">
                      {a.area}
                    </span>
                    <span className="text-xs font-bold text-amber-600">
                      +{a.overagePercent}% over benchmark
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Avg: {a.avgTimeMinutes} min/problem vs {a.benchmarkMinutes} min benchmark
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pacing Issues + Difficulty Bottleneck */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <SectionHeader icon={Target} title="Contest Pacing" />
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Difficulty Bottleneck
              </p>
              <p
                className={`text-lg font-extrabold ${
                  weakness.difficultyBottleneck === "None"
                    ? "text-emerald-600"
                    : weakness.difficultyBottleneck === "Hard"
                    ? "text-violet-700"
                    : "text-amber-700"
                }`}
              >
                {weakness.difficultyBottleneck === "None"
                  ? "None Detected ✓"
                  : `${weakness.difficultyBottleneck} Problems`}
              </p>
            </div>
            {weakness.paceIssues.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                No pacing issues detected
              </div>
            ) : (
              <div className="space-y-2">
                {weakness.paceIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl"
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-orange-800 font-medium leading-snug">
                      {issue}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
