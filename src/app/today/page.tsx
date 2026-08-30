"use client";

import { useDailyPlan } from "@/hooks/useDailyPlan";
import { DailyPlanHeader } from "@/components/daily-plan/DailyPlanHeader";
import { TimeBudgetCard } from "@/components/daily-plan/TimeBudgetCard";
import { PlanProgress } from "@/components/daily-plan/PlanProgress";
import { DailyActionList } from "@/components/daily-plan/DailyActionList";
import { QuickActionPanel } from "@/components/daily-plan/QuickActionPanel";
import { AIDailyCoach } from "@/components/daily-plan/AIDailyCoach";
import { TomorrowPreview } from "@/components/daily-plan/TomorrowPreview";
import { PlanCompletionModal } from "@/components/daily-plan/PlanCompletionModal";
import { DailyPlanHistory } from "@/components/daily-plan/DailyPlanHistory";

export default function TodayPage() {
  const {
    plan,
    coachAdvice,
    tomorrowPreview,
    history,
    analytics,
    timeBudget,
    isLoading,
    isReplanning,
    completionModalOpen,
    completeAction,
    skipAction,
    undoAction,
    changeBudget,
    replan,
    closeCompletionModal,
  } = useDailyPlan();

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="h-24 bg-slate-100 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!plan || plan.actions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          No plan generated yet
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Add some problems to your SRS revision queue, generate a roadmap, or log
          AI code reviews to get personalized daily actions.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="/revision"
            className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors"
          >
            Add SRS Items
          </a>
          <a
            href="/roadmap"
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Build Roadmap
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Completion modal */}
      {completionModalOpen && (
        <PlanCompletionModal plan={plan} onClose={closeCompletionModal} />
      )}

      {/* Header */}
      <DailyPlanHeader
        plan={plan}
        onReplan={replan}
        isReplanning={isReplanning}
      />

      {/* Time Budget */}
      <TimeBudgetCard
        currentBudget={timeBudget}
        onChange={changeBudget}
        isReplanning={isReplanning}
      />

      {/* Progress */}
      <PlanProgress plan={plan} />

      {/* Main 2-column layout (sidebar on lg+) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Action list (2 cols wide) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick actions */}
          <QuickActionPanel plan={plan} onComplete={completeAction} />

          {/* Full action list */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Today&apos;s Actions
            </h2>
            <DailyActionList
              actions={plan.actions}
              onComplete={completeAction}
              onSkip={skipAction}
              onUndo={undoAction}
            />
          </div>
        </div>

        {/* Right: Sidebar cards */}
        <div className="space-y-4">
          {/* AI Coach */}
          {coachAdvice && <AIDailyCoach advice={coachAdvice} />}

          {/* Tomorrow Preview */}
          {tomorrowPreview && <TomorrowPreview data={tomorrowPreview} />}
        </div>
      </div>

      {/* History & Analytics */}
      <DailyPlanHistory history={history} analytics={analytics} />
    </div>
  );
}
