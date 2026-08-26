"use client";

import * as React from "react";
import { PracticeSession } from "@/services/practice/practiceTypes";
import { computeRemainingSeconds } from "@/services/practice/practiceSessionStorage";
import { SESSION_MODE_CONFIGS } from "@/services/practice/practiceTypes";
import { PracticeQueue } from "./PracticeQueue";
import { PracticeHintModal } from "./PracticeHintModal";

interface PracticeSessionViewProps {
  session: PracticeSession;
  onSolvedIndependently: () => void;
  onSolvedWithHints: (hintCount: number) => void;
  onFailed: () => void;
  onSkip: () => void;
  onPause: () => void;
  onResume: () => void;
  onEndSession: () => void;
  onTimeout: () => void;
  isSubmitting?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getDifficultyColors(difficulty: string) {
  if (difficulty === "Easy") return { badge: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" };
  if (difficulty === "Medium") return { badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" };
  return { badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" };
}

export function PracticeSessionView({
  session,
  onSolvedIndependently,
  onSolvedWithHints,
  onFailed,
  onSkip,
  onPause,
  onResume,
  onEndSession,
  onTimeout,
  isSubmitting = false,
}: PracticeSessionViewProps) {
  const [remainingSeconds, setRemainingSeconds] = React.useState(() =>
    computeRemainingSeconds(session)
  );
  const [hintCount, setHintCount] = React.useState(0);
  const [showHints, setShowHints] = React.useState(false);
  const [whyExpanded, setWhyExpanded] = React.useState(false);
  const [hasExpired, setHasExpired] = React.useState(false);

  const currentProblem = session.plannedProblems[session.currentProblemIndex];
  const modeConfig = SESSION_MODE_CONFIGS.find((m) => m.mode === session.mode);
  const planned = session.plannedProblems.length;
  const completed = session.completedProblems.length;
  const progress = planned > 0 ? Math.round((completed / planned) * 100) : 0;

  // ─── Accurate timestamp-based timer ────────────────────────────────────────
  React.useEffect(() => {
    if (session.status !== "ACTIVE") return;

    const tick = () => {
      const rem = computeRemainingSeconds(session);
      setRemainingSeconds(rem);
      if (rem <= 0 && !hasExpired) {
        setHasExpired(true);
        onTimeout();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session, session.timerStartedAt, session.totalPausedMs, hasExpired, onTimeout]);

  const isWarning = remainingSeconds <= 600 && remainingSeconds > 300;
  const isUrgent = remainingSeconds <= 300;
  const isPaused = session.status === "PAUSED";

  const timerClasses = isUrgent
    ? "text-red-600 font-extrabold animate-pulse"
    : isWarning
    ? "text-amber-600 font-extrabold"
    : "text-sky-700 font-extrabold";

  const handleSolvedWithHints = () => {
    onSolvedWithHints(hintCount);
    setHintCount(0);
  };

  if (!currentProblem) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <span className="text-5xl">🎉</span>
        <p className="text-lg font-bold text-slate-800">All planned problems completed!</p>
        <button
          onClick={onEndSession}
          className="px-6 py-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-colors cursor-pointer"
        >
          View Session Report
        </button>
      </div>
    );
  }

  const diffColors = getDifficultyColors(currentProblem.difficulty);

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* ── TOP: Session Header ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{modeConfig?.icon ?? "🧠"}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{session.goalTitle}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${modeConfig?.bgColor} ${modeConfig?.color}`}>
                {modeConfig?.label ?? session.mode}
              </span>
            </div>
          </div>
          {/* Timer */}
          <div className="flex flex-col items-end shrink-0">
            <span className={`text-2xl tabular-nums ${timerClasses}`}>
              {formatTime(remainingSeconds)}
            </span>
            {isUrgent && (
              <span className="text-xs text-red-500 font-semibold animate-pulse">⚠ Time running out!</span>
            )}
            {isWarning && !isUrgent && (
              <span className="text-xs text-amber-500 font-semibold">⏱ Under 10 min</span>
            )}
            {isPaused && (
              <span className="text-xs text-slate-400 font-semibold">⏸ Paused</span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2 bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-500 shrink-0">
            {completed}/{planned}
          </span>
        </div>
      </div>

      {/* ── CENTER: Current Problem ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        {/* Problem header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${diffColors.badge}`}>
                {currentProblem.difficulty}
              </span>
              {currentProblem.isRevision && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  🔄 SRS Revision
                </span>
              )}
              {currentProblem.isPrerequisiteBridge && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  🔧 Prerequisite Bridge
                </span>
              )}
              {currentProblem.isChallenge && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  🚀 Challenge
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
              {currentProblem.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentProblem.platform === "leetcode" ? "LeetCode" : "Codeforces"} ·{" "}
              {currentProblem.topics.slice(0, 3).join(", ")}
            </p>
          </div>
          <a
            href={currentProblem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
          >
            Open ↗
          </a>
        </div>

        {/* Target skill & estimated time */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-sky-50 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wide mb-0.5">Target Skill</p>
            <p className="text-sm font-bold text-sky-900">{currentProblem.targetSkill}</p>
          </div>
          <div className="bg-slate-50 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">
              Est. Time
              <span className={`ml-1 ${currentProblem.timeEstimate.confidence === "HIGH" ? "text-green-500" : currentProblem.timeEstimate.confidence === "MEDIUM" ? "text-amber-500" : "text-slate-400"}`}>
                {currentProblem.timeEstimate.confidence === "HIGH" ? "●" : currentProblem.timeEstimate.confidence === "MEDIUM" ? "◐" : "○"}
              </span>
            </p>
            <p className="text-sm font-bold text-slate-800">
              ~{currentProblem.timeEstimate.estimatedMinutes} min
            </p>
          </div>
        </div>

        {/* Pattern badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-slate-500">Pattern:</span>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
            {currentProblem.primaryPattern}
          </span>
        </div>

        {/* Why this problem? */}
        <button
          onClick={() => setWhyExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-left cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <span className="text-xs font-bold text-amber-800">💡 Why this problem?</span>
          <span className="text-amber-600 text-xs">{whyExpanded ? "▲" : "▼"}</span>
        </button>
        {whyExpanded && (
          <div className="mt-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-900 leading-relaxed">{currentProblem.recommendationReason}</p>
            {currentProblem.fullExplanation && currentProblem.fullExplanation !== currentProblem.recommendationReason && (
              <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">{currentProblem.fullExplanation}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Upcoming Queue ──────────────────────────────────────────────────── */}
      <PracticeQueue session={session} />

      {/* Adaptation notifications */}
      {session.adaptations.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
          <p className="text-xs font-bold text-indigo-700 mb-1">🔀 Session Adapted</p>
          <p className="text-xs text-indigo-800">{session.adaptations[session.adaptations.length - 1].reason}</p>
        </div>
      )}

      {/* ── BOTTOM: Action Dock ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        {/* Primary actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <button
            onClick={onSolvedIndependently}
            disabled={isSubmitting || isPaused}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ✅ Solved Independently
          </button>
          <button
            onClick={handleSolvedWithHints}
            disabled={isSubmitting || isPaused}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            🤔 Solved with Hints {hintCount > 0 && `(${hintCount})`}
          </button>
        </div>

        {/* Secondary actions */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => { setShowHints(true); setHintCount((n) => n + 1); }}
            disabled={isSubmitting || isPaused}
            className="px-3 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-800 font-bold text-xs hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            💡 Need Hint {hintCount > 0 && `(${hintCount})`}
          </button>
          <button
            onClick={onFailed}
            disabled={isSubmitting || isPaused}
            className="px-3 py-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            ❌ Failed
          </button>
          <button
            onClick={onSkip}
            disabled={isSubmitting || isPaused}
            className="px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            ⏭ Skip
          </button>
        </div>

        {/* Session controls */}
        <div className="flex gap-2">
          {isPaused ? (
            <button
              onClick={onResume}
              className="flex-1 py-2 rounded-xl border border-sky-300 text-sky-700 font-bold text-xs hover:bg-sky-50 transition-colors cursor-pointer"
            >
              ▶ Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ⏸ Pause
            </button>
          )}
          <button
            onClick={onEndSession}
            className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors cursor-pointer"
          >
            🏁 End Session
          </button>
        </div>
      </div>

      {/* Hint Modal */}
      {showHints && (
        <PracticeHintModal
          problem={currentProblem}
          hintLevel={hintCount}
          onRequestMoreHint={() => setHintCount((n) => n + 1)}
          onClose={() => setShowHints(false)}
        />
      )}
    </div>
  );
}
