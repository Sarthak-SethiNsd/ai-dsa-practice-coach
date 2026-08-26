"use client";

import * as React from "react";
import { PracticeSession, PracticeSessionScore, PracticeSessionAnalytics } from "@/services/practice/practiceTypes";
import { SESSION_MODE_CONFIGS } from "@/services/practice/practiceTypes";
import { AIPracticeSessionCoach } from "./AIPracticeSessionCoach";
import { generateAIPracticeCoachInsight } from "@/services/practice/practiceSessionAnalytics";

interface PracticeSessionReportProps {
  session: PracticeSession;
  score: PracticeSessionScore;
  analytics: PracticeSessionAnalytics;
  onNewSession: () => void;
  onViewHistory: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function ScoreMeter({ score }: { score: PracticeSessionScore }) {
  const pct = score.overallScore;
  const color =
    pct >= 88 ? "bg-green-500" :
    pct >= 72 ? "bg-sky-500" :
    pct >= 55 ? "bg-amber-500" :
    pct >= 38 ? "bg-orange-500" :
    "bg-red-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9155" fill="none"
            stroke={pct >= 88 ? "#22c55e" : pct >= 72 ? "#0ea5e9" : pct >= 55 ? "#f59e0b" : pct >= 38 ? "#f97316" : "#f87171"}
            strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-900">{score.overallScore}</span>
          <span className="text-[10px] font-bold text-slate-500">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-extrabold px-3 py-1 rounded-full text-white ${color}`}>
        {score.label}
      </span>
    </div>
  );
}

export function PracticeSessionReport({
  session,
  score,
  analytics,
  onNewSession,
  onViewHistory,
}: PracticeSessionReportProps) {
  const [activeTab, setActiveTab] = React.useState<"report" | "coach">("report");
  const modeConfig = SESSION_MODE_CONFIGS.find((m) => m.mode === session.mode);
  const coachInsight = generateAIPracticeCoachInsight(session, score, analytics);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              Session Complete
            </p>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {modeConfig?.icon ?? "🧠"} {session.goalTitle}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {modeConfig?.label ?? session.mode} · {session.durationMinutes}m planned
            </p>
          </div>
          <ScoreMeter score={score} />
        </div>
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
          {score.explanation}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("report")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
            activeTab === "report" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📊 Session Report
        </button>
        <button
          onClick={() => setActiveTab("coach")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
            activeTab === "coach" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🤖 AI Coach
        </button>
      </div>

      {activeTab === "report" ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Problems Attempted" value={String(analytics.problemsAttempted)} color="slate" />
            <StatCard label="Problems Solved" value={String(analytics.problemsSolved)} color="green" />
            <StatCard label="Independent Solves" value={String(analytics.independentSolves)} color="sky" />
            <StatCard label="Hint-Assisted" value={String(analytics.hintAssistedSolves)} color="amber" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Failures" value={String(analytics.failures)} color="red" />
            <StatCard label="Skipped" value={String(analytics.skipped)} color="slate" />
            <StatCard label="Total Time" value={formatDuration(analytics.totalTimeSeconds)} color="indigo" />
          </div>

          {analytics.problemsSolved > 0 && (
            <StatCard label="Avg Solve Time" value={formatDuration(analytics.avgSolveTimeSeconds)} color="purple" fullWidth />
          )}

          {/* Score Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Score Breakdown</h3>
            <div className="space-y-2">
              <ScoreBar label="Completion" value={score.completionScore} max={25} color="bg-sky-500" />
              <ScoreBar label="Independent Solves" value={score.independentSolveScore} max={30} color="bg-green-500" />
              <ScoreBar label="Difficulty Bonus" value={score.difficultyBonus} max={20} color="bg-amber-500" />
              <ScoreBar label="Time Efficiency" value={score.timeEfficiencyScore} max={15} color="bg-indigo-500" />
              <ScoreBar label="Goal Alignment" value={score.goalAlignmentScore} max={10} color="bg-purple-500" />
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Difficulty Distribution (Solved)</h3>
            <div className="flex gap-3">
              <DiffBar label="Easy" count={analytics.difficultyDistribution.Easy} color="bg-green-500" />
              <DiffBar label="Medium" count={analytics.difficultyDistribution.Medium} color="bg-amber-500" />
              <DiffBar label="Hard" count={analytics.difficultyDistribution.Hard} color="bg-red-500" />
            </div>
          </div>

          {/* Skills & Patterns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Skills Practiced</h3>
              <div className="flex flex-wrap gap-1.5">
                {analytics.skillsPracticed.map((s) => (
                  <span key={s} className="text-xs bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded-full border border-sky-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Patterns Practiced</h3>
              <div className="flex flex-wrap gap-1.5">
                {analytics.patternsPracticed.map((p) => (
                  <span key={p} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1">💪 Strongest Evidence</p>
              <p className="text-xs text-green-900">{analytics.strongestEvidence}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wide mb-1">⚠️ Weakest Evidence</p>
              <p className="text-xs text-orange-900">{analytics.weakestEvidence}</p>
            </div>
          </div>

          {/* Next Recommended Action */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wide mb-1">🚀 Next Recommended Action</p>
            <p className="text-sm font-semibold text-sky-900">{analytics.nextRecommendedAction}</p>
          </div>

          {/* Adaptations */}
          {session.adaptations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">
                🔀 Session Adaptations ({session.adaptations.length})
              </h3>
              <div className="space-y-2">
                {session.adaptations.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="shrink-0 text-indigo-500">→</span>
                    <span className="leading-relaxed">{a.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <AIPracticeSessionCoach session={session} score={score} analytics={analytics} insight={coachInsight} />
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <button
          onClick={onNewSession}
          className="py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-700 transition-colors cursor-pointer"
        >
          ▶ New Session
        </button>
        <button
          onClick={onViewHistory}
          className="py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
        >
          📋 View History
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label, value, color, fullWidth = false
}: {
  label: string; value: string; color: string; fullWidth?: boolean;
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 text-slate-800",
    green: "bg-green-50 text-green-800",
    sky: "bg-sky-50 text-sky-800",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-700",
    indigo: "bg-indigo-50 text-indigo-800",
    purple: "bg-purple-50 text-purple-800",
  };
  return (
    <div className={`rounded-xl border border-slate-200 p-3 ${colors[color] ?? "bg-slate-50 text-slate-800"} ${fullWidth ? "col-span-2 sm:col-span-3" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-xl font-extrabold mt-0.5">{value}</p>
    </div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-12 text-right shrink-0">
        {value}/{max}
      </span>
    </div>
  );
}

function DiffBar({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full h-16 bg-slate-100 rounded-lg overflow-hidden flex items-end">
        <div
          className={`w-full ${color} rounded-b-lg transition-all`}
          style={{ height: `${Math.min(100, count * 33)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <span className="text-xs text-slate-500">{count}</span>
    </div>
  );
}
