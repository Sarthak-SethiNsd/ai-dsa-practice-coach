"use client";

import { useState } from "react";
import { useAdaptiveRecommendations } from "@/hooks/useAdaptiveRecommendations";
import { RecommendationFilters } from "./RecommendationFilters";
import { RecommendationQueue } from "./RecommendationQueue";
import { WhyThisProblemModal } from "./WhyThisProblemModal";
import { RecommendationHistoryView } from "./RecommendationHistoryView";
import { AIRecommendationCoach } from "./AIRecommendationCoach";
import {
  Sparkles,
  Layers,
  History,
  Award,
  RefreshCw,
  Target,
  Zap,
  RotateCcw,
  BookOpen,
} from "lucide-react";

interface AdaptiveRecommendationsViewProps {
  renderReadinessAnalytics?: () => React.ReactNode;
}

type TabType = "queue" | "revision" | "history" | "coach" | "analytics";

export function AdaptiveRecommendationsView({
  renderReadinessAnalytics,
}: AdaptiveRecommendationsViewProps) {
  const {
    filteredRecommendations,
    priorityGroups,
    topRecommendation,
    isLoading,
    error,
    activeMode,
    switchMode,
    filters,
    setFilters,
    handleFeedback,
    selectedRec,
    coachAdvice,
    isCoachLoading,
    openWhyModal,
    closeWhyModal,
    history,
    analytics,
    refresh,
  } = useAdaptiveRecommendations();

  const [activeTab, setActiveTab] = useState<TabType>("queue");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-800 text-sky-400 border border-slate-700 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Adaptive Intelligence Layer
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Adaptive Problem Recommendation Engine
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Refresh Recommendations"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Deterministic problem selection driven by your Skill Dependency Graph, Knowledge Base mistakes, Spaced Repetition urgency, and active Preparation Command Center goals.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Mode Selector & Filter Toolbar */}
      <RecommendationFilters
        activeMode={activeMode}
        onSwitchMode={switchMode}
        filters={filters}
        onFiltersChange={setFilters}
        totalFilteredCount={filteredRecommendations.length}
      />

      {/* Main View Tabs */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab("queue")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "queue"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Today&apos;s Priority Queue ({filteredRecommendations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("revision")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "revision"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>SRS Revision Problems</span>
          </button>

          <button
            onClick={() => setActiveTab("coach")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "coach"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Recommendation Coach</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Recommendation History ({history.length})</span>
          </button>

          {renderReadinessAnalytics && (
            <button
              onClick={() => setActiveTab("analytics")}
              className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Readiness Analytics & Snapshots</span>
            </button>
          )}
        </div>

        {/* Tab 1: Priority Queue */}
        {activeTab === "queue" && (
          <RecommendationQueue
            priorityGroups={priorityGroups}
            topRecommendation={topRecommendation}
            onFeedback={handleFeedback}
            onWhyClick={openWhyModal}
          />
        )}

        {/* Tab 2: Revision Problems */}
        {activeTab === "revision" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs">
              <strong>Spaced Repetition Integration: </strong>
              Showing problems targeting skills with active or overdue SRS cards.
            </div>
            <RecommendationQueue
              priorityGroups={{
                ...priorityGroups,
                CRITICAL: priorityGroups.CRITICAL.filter((r) => r.evidence.srsOverdueCount > 0),
                HIGH: priorityGroups.HIGH.filter((r) => r.evidence.srsOverdueCount > 0 || r.evidence.srsItemsCount > 0),
                MEDIUM: priorityGroups.MEDIUM.filter((r) => r.evidence.srsItemsCount > 0),
                LOW: priorityGroups.LOW.filter((r) => r.evidence.srsItemsCount > 0),
              }}
              topRecommendation={topRecommendation}
              onFeedback={handleFeedback}
              onWhyClick={openWhyModal}
            />
          </div>
        )}

        {/* Tab 3: AI Recommendation Coach */}
        {activeTab === "coach" && (
          <AIRecommendationCoach
            topRec={topRecommendation}
            coachAdvice={coachAdvice}
            isLoading={isCoachLoading}
          />
        )}

        {/* Tab 4: History */}
        {activeTab === "history" && (
          <RecommendationHistoryView
            history={history}
            analytics={analytics}
            onRefresh={refresh}
          />
        )}

        {/* Tab 5: Legacy Readiness Analytics & Snapshots */}
        {activeTab === "analytics" && renderReadinessAnalytics && (
          <div className="space-y-8 pt-2">
            {renderReadinessAnalytics()}
          </div>
        )}
      </div>

      {/* Why This Problem Evidence Modal */}
      <WhyThisProblemModal
        rec={selectedRec}
        coachAdvice={coachAdvice}
        isLoadingCoach={isCoachLoading}
        onClose={closeWhyModal}
        onSolve={(r) => handleFeedback(r, "accepted")}
      />
    </div>
  );
}
