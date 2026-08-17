"use client";

import * as React from "react";
import { useStudySession } from "@/hooks/useStudySession";
import { StudySessionHeader } from "@/components/study/StudySessionHeader";
import { SessionConfiguration } from "@/components/study/SessionConfiguration";
import { FocusTaskCard } from "@/components/study/FocusTaskCard";
import { StudyTimer } from "@/components/study/StudyTimer";
import { SessionTaskQueue } from "@/components/study/SessionTaskQueue";
import { SessionProgress } from "@/components/study/SessionProgress";
import { SessionCoachPanel } from "@/components/study/SessionCoachPanel";
import { SessionSummaryModal } from "@/components/study/SessionSummaryModal";
import { SessionHistory } from "@/components/study/SessionHistory";
import { StudyAnalytics } from "@/components/study/StudyAnalytics";
import { StudyStreakCard } from "@/components/study/StudyStreakCard";
import { useAppContext } from "@/context/AppContext";
import {
  Flame,
  History,
  BarChart2,
  Bot,
  Play,
  RotateCw,
  Loader2,
} from "lucide-react";

type StudyTab = "dashboard" | "history" | "analytics" | "coach";

const TABS: { id: StudyTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Session Dashboard & Focus Mode", icon: Play },
  { id: "history", label: "Session History", icon: History },
  { id: "analytics", label: "Study Analytics", icon: BarChart2 },
  { id: "coach", label: "AI Session Coach", icon: Bot },
];

export default function StudySessionPage() {
  const { showToast } = useAppContext();
  const {
    isSessionActive,
    config,
    setConfig,
    taskQueue,
    currentTaskIndex,
    currentTask,
    timerSeconds,
    isTimerRunning,
    completedSessions,
    streakData,
    analyticsData,
    lastSessionResult,
    loading,
    startSession,
    pauseTimer,
    resumeTimer,
    restartTimer,
    markTaskSolved,
    markTaskFailed,
    skipTask,
    addToRevision,
    endSession,
    deleteHistorySession,
    refresh,
  } = useStudySession();

  const [activeTab, setActiveTab] = React.useState<StudyTab>("dashboard");
  const [showSummaryModal, setShowSummaryModal] = React.useState(false);

  const handleEndSession = async () => {
    const res = await endSession();
    if (res) {
      setShowSummaryModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Synthesizing Roadmap, SRS, and AI Recommendations into Focus Mode...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Study Session & Focus Mode
            </h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
              Focus Engine
            </span>
          </div>
          <p className="text-slate-500 text-sm sm:text-base max-w-3xl leading-relaxed">
            Synthesizes all platform intelligence into a single focused, distraction-free DSA study session.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              refresh();
              showToast("Study session engine refreshed.");
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer shadow-xs"
            title="Refresh Engine"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Tab Navigation (only when not in active Focus Mode) ── */}
      {!isSessionActive && (
        <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-orange-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Active Focus Mode Interface ── */}
      {isSessionActive && currentTask && (
        <div className="space-y-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between bg-amber-500 text-white p-4 rounded-2xl shadow-md">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 fill-white" />
              <span className="text-sm font-extrabold">Active Focus Mode Session</span>
            </div>
            <button
              type="button"
              onClick={handleEndSession}
              className="px-4 py-1.5 bg-white text-amber-900 hover:bg-amber-100 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
            >
              Finish & Summary
            </button>
          </div>

          {/* Timer & Live Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StudyTimer
                timerSeconds={timerSeconds}
                isRunning={isTimerRunning}
                onPause={pauseTimer}
                onResume={resumeTimer}
                onRestart={restartTimer}
              />
            </div>
            <div>
              <SessionProgress
                tasks={taskQueue}
                durationMinutes={config.durationMinutes}
                timerSeconds={timerSeconds}
              />
            </div>
          </div>

          {/* Active Task & Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FocusTaskCard
                task={currentTask}
                taskIndex={currentTaskIndex}
                totalTasks={taskQueue.length}
                onSolved={async () => {
                  await markTaskSolved();
                  showToast("Task marked as Solved! SRS interval updated.");
                }}
                onFailed={async () => {
                  await markTaskFailed();
                  showToast("Task marked as Failed. Interval reset.");
                }}
                onSkip={() => {
                  skipTask();
                  showToast("Task skipped.");
                }}
                onAddToRevision={() => {
                  addToRevision(currentTask);
                  showToast("Added to Spaced Repetition Queue.");
                }}
                onEndSession={handleEndSession}
              />
            </div>

            <div>
              <SessionTaskQueue
                tasks={taskQueue}
                currentIndex={currentTaskIndex}
                onSelectTask={() => {
                  // Direct navigation in queue
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Non-Active Tab Content ── */}
      {!isSessionActive && (
        <>
          {activeTab === "dashboard" && (
            <div className="space-y-10">
              <StudySessionHeader
                streakData={streakData}
                onQuickStart={() => {
                  startSession({ durationMinutes: 30, focusCategory: "balanced" });
                  showToast("30m Focus Session Launched!");
                }}
              />

              <div className="border-t border-slate-100 pt-8">
                <SessionConfiguration
                  config={config}
                  onChangeConfig={setConfig}
                  onStartSession={() => {
                    startSession(config);
                    showToast(`${config.durationMinutes}m Focus Session Launched!`);
                  }}
                />
              </div>

              <div className="border-t border-slate-100 pt-8">
                <StudyStreakCard streak={streakData} />
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <SessionHistory
              sessions={completedSessions}
              onDeleteSession={async (id) => {
                const ok = await deleteHistorySession(id);
                if (ok) showToast("Study session deleted.");
              }}
            />
          )}

          {activeTab === "analytics" && (
            <StudyAnalytics analytics={analyticsData} />
          )}

          {activeTab === "coach" && (
            <div className="space-y-6">
              {completedSessions[0] ? (
                <SessionCoachPanel session={completedSessions[0]} />
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
                  Complete your first study session to view AI Session Coach reports!
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Post-Session Summary Report Modal */}
      {showSummaryModal && lastSessionResult && (
        <SessionSummaryModal
          session={lastSessionResult}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
}
