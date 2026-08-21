"use client";

import { useState } from "react";
import {
  Briefcase,
  Play,
  History,
  BarChart2,
  Sliders,
  Sparkles,
  Zap,
  BookOpen,
  Layers,
  Clock,
} from "lucide-react";
import { useMockInterview } from "@/hooks/useMockInterview";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { InterviewProgress } from "@/components/interview/InterviewProgress";
import { InterviewQuestionPanel } from "@/components/interview/InterviewQuestionPanel";
import { InterviewWorkspace } from "@/components/interview/InterviewWorkspace";
import { ComplexityPanel } from "@/components/interview/ComplexityPanel";
import { EdgeCasePanel } from "@/components/interview/EdgeCasePanel";
import { HintPanel } from "@/components/interview/HintPanel";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewControlBar } from "@/components/interview/InterviewControlBar";
import { InterviewReadinessCard } from "@/components/interview/InterviewReadinessCard";
import { InterviewConfigModal } from "@/components/interview/InterviewConfigModal";
import { InterviewPreparationModal } from "@/components/interview/InterviewPreparationModal";
import { InterviewSummaryModal } from "@/components/interview/InterviewSummaryModal";
import { InterviewAnalytics } from "@/components/interview/InterviewAnalytics";
import { InterviewHistory } from "@/components/interview/InterviewHistory";
import { HintLevel } from "@/services/interview/interviewTypes";

type DashboardTab = "overview" | "analytics" | "history";

export default function MockInterviewPage() {
  const {
    session,
    history,
    readinessProfile,
    activeReport,
    coachAdvice,
    analytics,
    analyticsTimeframe,
    isLoading,
    isProcessingMessage,
    isConfigModalOpen,
    isPreparationModalOpen,
    isSummaryModalOpen,
    pendingConfig,
    openConfigModal,
    closeConfigModal,
    openPreparationModal,
    closePreparationModal,
    startInterview,
    sendMessage,
    requestHint,
    advanceToPhase,
    updateCode,
    updateComplexity,
    addEdgeCase,
    removeEdgeCase,
    submitSolution,
    endInterview,
    viewReport,
    closeSummaryModal,
    setAnalyticsTimeframe,
  } = useMockInterview();

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [workspaceTab, setWorkspaceTab] = useState<"code" | "complexity" | "edge_cases" | "hints">("code");

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading && !session) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-12 bg-slate-100 rounded-2xl" />
        <div className="h-72 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  // ─── ACTIVE INTERVIEW MODE ─────────────────────────────────────────────────
  if (session && session.status === "in_progress") {
    const currentQ = session.questions[session.currentQuestionIndex];
    const qId = String(currentQ?.id || "q1");
    const unlockedHints = session.hintsUnlocked[qId] || [];

    return (
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-3.5">
        {/* Modals during active interview */}
        {isSummaryModalOpen && activeReport && (
          <InterviewSummaryModal
            report={activeReport}
            coachAdvice={coachAdvice}
            onClose={closeSummaryModal}
          />
        )}

        {/* Header */}
        <InterviewHeader
          session={session}
          onEndInterview={endInterview}
          onRequestHint={() => setWorkspaceTab("hints")}
        />

        {/* Phase Stepper */}
        <InterviewProgress
          currentPhase={session.currentPhase}
          onSelectPhase={(p) => advanceToPhase(p)}
        />

        {/* Split Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Problem Statement & Tools (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Problem Details */}
            {currentQ && <InterviewQuestionPanel problem={currentQ} />}

            {/* Workspace Tool Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setWorkspaceTab("code")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  workspaceTab === "code" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Code Editor
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceTab("complexity")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  workspaceTab === "complexity" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Complexity Analysis
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceTab("edge_cases")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  workspaceTab === "edge_cases" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Edge Cases ({session.candidateEdgeCases.length})
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceTab("hints")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  workspaceTab === "hints" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hints ({unlockedHints.length}/4)
              </button>
            </div>

            {/* Active Workspace View */}
            {workspaceTab === "code" && currentQ && (
              <InterviewWorkspace
                problem={currentQ}
                code={session.candidateCode[session.selectedLanguage] || ""}
                selectedLanguage={session.selectedLanguage}
                solutionSubmitted={session.solutionSubmitted}
                onCodeChange={updateCode}
                onSubmitSolution={submitSolution}
              />
            )}

            {workspaceTab === "complexity" && (
              <ComplexityPanel
                time={session.candidateComplexity.time}
                space={session.candidateComplexity.space}
                explanation={session.candidateComplexity.explanation}
                onChange={updateComplexity}
              />
            )}

            {workspaceTab === "edge_cases" && (
              <EdgeCasePanel
                edgeCases={session.candidateEdgeCases}
                onAddEdgeCase={addEdgeCase}
                onRemoveEdgeCase={removeEdgeCase}
              />
            )}

            {workspaceTab === "hints" && currentQ && (
              <HintPanel
                problem={currentQ}
                unlockedLevels={unlockedHints}
                onRequestHint={(lvl: HintLevel) => requestHint(lvl)}
              />
            )}
          </div>

          {/* Right Column: AI Interviewer Dialogue (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <InterviewChat
              messages={session.messages}
              currentPhase={session.currentPhase}
              onSendMessage={sendMessage}
              isProcessing={isProcessingMessage}
            />
          </div>
        </div>

        {/* Bottom Control Bar */}
        <InterviewControlBar
          currentPhase={session.currentPhase}
          solutionSubmitted={session.solutionSubmitted}
          onAdvancePhase={() => advanceToPhase()}
          onRequestHint={() => setWorkspaceTab("hints")}
          onSubmitSolution={submitSolution}
        />
      </div>
    );
  }

  // ─── DASHBOARD VIEW (Idle / Setup) ──────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Modals */}
      <InterviewConfigModal
        isOpen={isConfigModalOpen}
        onClose={closeConfigModal}
        onProceed={openPreparationModal}
      />

      <InterviewPreparationModal
        isOpen={isPreparationModalOpen}
        config={pendingConfig}
        onClose={closePreparationModal}
        onConfirmStart={() => pendingConfig && startInterview(pendingConfig)}
      />

      {isSummaryModalOpen && activeReport && (
        <InterviewSummaryModal
          report={activeReport}
          coachAdvice={coachAdvice}
          onClose={closeSummaryModal}
        />
      )}

      {/* Hero Readiness Card */}
      {readinessProfile && (
        <InterviewReadinessCard
          profile={readinessProfile}
          onStartInterview={openConfigModal}
        />
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Dashboard & Practice
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "analytics"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Interview Analytics
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "history"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Interview History ({history.length})
        </button>
      </div>

      {/* Tab 1: Overview & Quick Launch Presets */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Setup Presets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Quick Launch Presets</h3>
                <p className="text-xs text-slate-400">One-click simulated technical interviews</p>
              </div>
              <button
                onClick={openConfigModal}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                Custom Setup
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() =>
                  openPreparationModal({
                    type: "General DSA",
                    difficulty: "Adaptive",
                    durationMinutes: 30,
                    questionCount: 1,
                    style: "Standard",
                  })
                }
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50/50 hover:border-sky-300 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Standard 30m DSA</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Adaptive difficulty · 1 Problem · Standard Style</p>
              </button>

              <button
                onClick={() =>
                  openPreparationModal({
                    type: "Interview Weakness Drill",
                    difficulty: "Medium",
                    durationMinutes: 30,
                    questionCount: 1,
                    style: "Coaching",
                  })
                }
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-orange-50/50 hover:border-orange-300 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Weakness Drill (30m)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Targeted on lowest scoring topics · Coaching Style</p>
              </button>

              <button
                onClick={() =>
                  openPreparationModal({
                    type: "Dynamic Programming",
                    difficulty: "Medium",
                    durationMinutes: 45,
                    questionCount: 1,
                    style: "Strict",
                  })
                }
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50/50 hover:border-purple-300 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Strict 45m Simulation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">High rigor · Strict complexity justification</p>
              </button>
            </div>
          </div>

          {/* Recent History Preview */}
          <InterviewHistory
            history={history.slice(0, 3)}
            onViewReport={viewReport}
          />
        </div>
      )}

      {/* Tab 2: Analytics */}
      {activeTab === "analytics" && analytics && (
        <InterviewAnalytics
          analytics={analytics}
          timeframe={analyticsTimeframe}
          onTimeframeChange={setAnalyticsTimeframe}
        />
      )}

      {/* Tab 3: Full History */}
      {activeTab === "history" && (
        <InterviewHistory
          history={history}
          onViewReport={viewReport}
        />
      )}
    </div>
  );
}
