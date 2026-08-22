"use client";

import { useState } from "react";
import { useVirtualContest } from "@/hooks/useVirtualContest";
import { getContestTopicOptions } from "@/services/contest/virtualContestSelector";
import { loadContestReport } from "@/services/contest/virtualContestStorage";

// UI Components
import { VirtualContestHeader } from "@/components/virtual-contest/VirtualContestHeader";
import { VirtualContestProblemList } from "@/components/virtual-contest/VirtualContestProblemList";
import { VirtualContestProblemPanel } from "@/components/virtual-contest/VirtualContestProblemPanel";
import { VirtualContestWorkspace } from "@/components/virtual-contest/VirtualContestWorkspace";
import { VirtualContestSubmissionPanel } from "@/components/virtual-contest/VirtualContestSubmissionPanel";
import { VirtualContestStatusBar } from "@/components/virtual-contest/VirtualContestStatusBar";
import { VirtualContestPauseModal } from "@/components/virtual-contest/VirtualContestPauseModal";
import { VirtualContestConfigModal } from "@/components/virtual-contest/VirtualContestConfigModal";
import { VirtualContestSummaryModal } from "@/components/virtual-contest/VirtualContestSummaryModal";
import { VirtualContestReadinessCard } from "@/components/virtual-contest/VirtualContestReadinessCard";
import { VirtualContestHistory } from "@/components/virtual-contest/VirtualContestHistory";
import { VirtualContestAnalytics } from "@/components/virtual-contest/VirtualContestAnalytics";

import {
  Trophy,
  Play,
  Settings2,
  Sparkles,
  BarChart2,
  History,
  CheckCircle2,
  Compass,
  ArrowRight,
  Swords,
  Layers,
  Zap,
} from "lucide-react";

export default function VirtualContestPage() {
  const {
    mode,
    setMode,
    config,
    updateConfig,
    session,
    startContest,
    pauseContest,
    resumeContest,
    endContest,
    switchProblem,
    updateProblemCode,
    submitProblem,
    markSolved,
    skipProblem,
    report,
    setReport,
    showSummaryModal,
    setShowSummaryModal,
    showPauseModal,
    showConfigModal,
    setShowConfigModal,
    history,
    readiness,
    analytics,
    analyticsTimeframe,
    setAnalyticsTimeframe,
    analyticsPlatform,
    setAnalyticsPlatform,
    isLoading,
    error,
  } = useVirtualContest();

  const [dashboardTab, setDashboardTab] = useState<"overview" | "analytics" | "history">("overview");

  const topicOptions = getContestTopicOptions();

  const handleViewReport = (reportId: string) => {
    const loaded = loadContestReport(reportId);
    if (loaded) {
      setReport(loaded);
      setShowSummaryModal(true);
    }
  };

  // ─── Active Contest Workspace View ──────────────────────────────────────────
  if (mode === "active" && session) {
    const activeProblemState = session.problems[session.activeProblemIndex];

    return (
      <div className="flex flex-col min-h-screen bg-slate-100/70">
        {/* Top Sticky Header */}
        <VirtualContestHeader
          session={session}
          onPause={pauseContest}
          onEnd={endContest}
        />

        {/* Problem Navigator Bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <VirtualContestProblemList
              problems={session.problems}
              activeProblemIndex={session.activeProblemIndex}
              onSelect={switchProblem}
              sequentialMode={session.config.sequentialMode}
            />
          </div>
        </div>

        {/* Main Split-Screen Workspace */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {activeProblemState && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[600px]">
              {/* Left Column: Problem Statement & Submissions */}
              <div className="lg:col-span-6 flex flex-col gap-4 h-full overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <VirtualContestProblemPanel
                    problem={activeProblemState.problem}
                    problemState={activeProblemState}
                  />
                </div>
                <div className="max-h-[160px] overflow-y-auto bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <VirtualContestSubmissionPanel
                    submissions={activeProblemState.submissions}
                  />
                </div>
              </div>

              {/* Right Column: Code Editor & Submitter */}
              <div className="lg:col-span-6 h-full overflow-hidden">
                <VirtualContestWorkspace
                  problemState={activeProblemState}
                  onCodeChange={updateProblemCode}
                  onSubmit={submitProblem}
                  onMarkSolved={markSolved}
                  onSkip={skipProblem}
                  disabled={session.isPaused}
                />
              </div>
            </div>
          )}
        </main>

        {/* Bottom Status Bar */}
        <VirtualContestStatusBar session={session} />

        {/* Pause Modal */}
        <VirtualContestPauseModal
          isOpen={showPauseModal}
          session={session}
          onResume={resumeContest}
          onEnd={endContest}
        />

        {/* Summary Modal */}
        <VirtualContestSummaryModal
          isOpen={showSummaryModal}
          report={report}
          onClose={() => setShowSummaryModal(false)}
        />
      </div>
    );
  }

  // ─── Dashboard / Configuration / Review View ───────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-semibold">
            <Swords className="w-3.5 h-3.5" />
            <span>Realistic Contest Simulation Layer</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Virtual Contest Mode
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Run timed competitive programming drills with REAL LeetCode & Codeforces problems. Benchmark your pace, track accuracy, and automatically feed weaknesses into your Knowledge Base and Daily Practice Planner.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => startContest()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-900" />
              <span>{isLoading ? "Starting..." : "Start Quick Contest (60m)"}</span>
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-slate-400" />
              <span>Custom Configuration</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Readiness Profile Card */}
      <VirtualContestReadinessCard
        readiness={readiness}
        onStartContest={() => setShowConfigModal(true)}
      />

      {/* Dashboard Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setDashboardTab("overview")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            dashboardTab === "overview"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Contest Modes</span>
        </button>

        <button
          onClick={() => setDashboardTab("analytics")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            dashboardTab === "analytics"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Contest Analytics</span>
        </button>

        <button
          onClick={() => setDashboardTab("history")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            dashboardTab === "history"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Simulation History</span>
        </button>
      </div>

      {/* Tab Contents */}
      {dashboardTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Preset 1: Standard Balanced */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 w-fit">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Standard 3-Problem</h3>
                <p className="text-xs text-slate-500">
                  Easy → Medium → Hard progression. Perfect for weekly benchmark simulation.
                </p>
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>• 60 Minutes</div>
                <div>• 3 Problems (Mixed)</div>
                <div>• Base 1750 pts</div>
              </div>
              <button
                onClick={() =>
                  startContest({
                    ...config,
                    contestType: "Standard",
                    durationMinutes: 60,
                    problemCount: 3,
                    difficulty: "Mixed",
                  })
                }
                className="w-full py-2.5 rounded-xl font-bold text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
              >
                Launch Standard Drill
              </button>
            </div>

            {/* Preset 2: Weak Topic Drill */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 w-fit">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Weak Topic Sprint</h3>
                <p className="text-xs text-slate-500">
                  Targeted questions generated from your active Knowledge Base mistake notes.
                </p>
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>• 45 Minutes</div>
                <div>• 2 Targeted Problems</div>
                <div>• Auto Knowledge Sync</div>
              </div>
              <button
                onClick={() =>
                  startContest({
                    ...config,
                    contestType: "Weak Topic Drill",
                    topic: "Weak Topics",
                    durationMinutes: 45,
                    problemCount: 2,
                    difficulty: "Adaptive",
                  })
                }
                className="w-full py-2.5 rounded-xl font-bold text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
              >
                Launch Weak Topic Drill
              </button>
            </div>

            {/* Preset 3: Rating Challenge */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 w-fit">
                <Swords className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Rating Push Challenge</h3>
                <p className="text-xs text-slate-500">
                  Higher-difficulty problems to push your algorithmic ceiling and time triage.
                </p>
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>• 90 Minutes</div>
                <div>• 4 Problems (Hard focus)</div>
                <div>• Contest Intelligence Sync</div>
              </div>
              <button
                onClick={() =>
                  startContest({
                    ...config,
                    contestType: "Rating Challenge",
                    durationMinutes: 90,
                    problemCount: 4,
                    difficulty: "Hard",
                  })
                }
                className="w-full py-2.5 rounded-xl font-bold text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
              >
                Launch Rating Challenge
              </button>
            </div>
          </div>
        </div>
      )}

      {dashboardTab === "analytics" && (
        <VirtualContestAnalytics
          analytics={analytics}
          timeframe={analyticsTimeframe}
          onTimeframeChange={setAnalyticsTimeframe}
          platform={analyticsPlatform}
          onPlatformChange={setAnalyticsPlatform}
        />
      )}

      {dashboardTab === "history" && (
        <VirtualContestHistory
          history={history}
          onViewReport={handleViewReport}
        />
      )}

      {/* Config Modal */}
      <VirtualContestConfigModal
        isOpen={showConfigModal}
        config={config}
        topicOptions={topicOptions}
        onConfigChange={updateConfig}
        onStart={() => startContest(config)}
        onCancel={() => setShowConfigModal(false)}
        isLoading={isLoading}
      />

      {/* Report Modal */}
      <VirtualContestSummaryModal
        isOpen={showSummaryModal}
        report={report}
        onClose={() => setShowSummaryModal(false)}
      />
    </div>
  );
}
