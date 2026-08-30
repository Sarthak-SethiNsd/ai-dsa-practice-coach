"use client";

import * as React from "react";
import { PreparationPlan } from "@/services/orchestration/orchestrationTypes";
import { orchestratePreparationPlan } from "@/services/orchestration/orchestrationEngine";

// Component imports
import { PreparationOverview } from "@/components/orchestration/PreparationOverview";
import { PreparationPlanView } from "@/components/orchestration/PreparationPlanView";
import { PreparationActivityCard } from "@/components/orchestration/PreparationActivityCard";
import { NextBestAction } from "@/components/orchestration/NextBestAction";
import { PreparationPriorityPanel } from "@/components/orchestration/PreparationPriorityPanel";
import { DeferredActivities } from "@/components/orchestration/DeferredActivities";
import { PreparationConstraints } from "@/components/orchestration/PreparationConstraints";
import { PlanConfidenceCard } from "@/components/orchestration/PlanConfidenceCard";
import { PreparationTimeline } from "@/components/orchestration/PreparationTimeline";
import { PreparationHistory } from "@/components/orchestration/PreparationHistory";
import { AIPreparationCoach } from "@/components/orchestration/AIPreparationCoach";
import { getPreparationPlanHistory } from "@/services/orchestration/orchestrationEngine";

type PrepareTab =
  | "overview"
  | "plan"
  | "next_action"
  | "priority"
  | "deferred"
  | "constraints"
  | "confidence"
  | "timeline"
  | "history"
  | "coach";

export default function PreparePage() {
  const [activeTab, setActiveTab] = React.useState<PrepareTab>("overview");
  const [availableMinutes, setAvailableMinutes] = React.useState<number>(45);
  const [plan, setPlan] = React.useState<PreparationPlan | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadPlan = React.useCallback(async (mins: number, force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orchestratePreparationPlan(mins, force);
      setPlan(data);
    } catch (err) {
      console.error("[PreparePage] Load error:", err);
      setError("Failed to orchestrate preparation plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Asynchronous data loader; synchronizes plan with Orchestrator engine
    loadPlan(availableMinutes);
  }, [availableMinutes, loadPlan]);

  const handleTimeBudgetChange = (mins: number) => {
    setAvailableMinutes(mins);
  };

  const tabs: { id: PrepareTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "next_action", label: "Next Best Action", icon: "🎯" },
    { id: "plan", label: "Today's Plan", icon: "📋" },
    { id: "priority", label: "Priority Ranking", icon: "🔢" },
    { id: "deferred", label: "Deferred Work", icon: "⏳" },
    { id: "constraints", label: "Constraints", icon: "🛡️" },
    { id: "confidence", label: "Confidence", icon: "💎" },
    { id: "timeline", label: "Session Blocks", icon: "⏱️" },
    { id: "history", label: "Plan History", icon: "📜" },
    { id: "coach", label: "AI Coach", icon: "🤖" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Adaptive Preparation Orchestrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            The coordination layer uniting goals, performance evidence, strategy interventions, learning graphs, and available time into an immediate action plan.
          </p>
        </div>

        <button
          onClick={() => loadPlan(availableMinutes, true)}
          className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs shrink-0 self-start md:self-auto"
        >
          🔄 Re-orchestrate Plan
        </button>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Loading / Error State ───────────────────────────────────────────── */}
      {isLoading && !plan ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl mx-auto mb-3">
            🧭
          </div>
          <p className="text-sm font-bold text-slate-800">Orchestrating Preparation Plan...</p>
          <p className="text-xs text-slate-400 mt-1">Evaluating goals, active strategy, learning graph prerequisites, and time constraints.</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <p className="text-sm font-bold text-red-800">{error}</p>
          <button
            onClick={() => loadPlan(availableMinutes, true)}
            className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer hover:bg-red-700"
          >
            Retry Orchestration
          </button>
        </div>
      ) : plan ? (
        <div className="space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <PreparationOverview
              plan={plan}
              availableMinutes={availableMinutes}
              onTimeBudgetChange={handleTimeBudgetChange}
              onSelectTab={(t) => setActiveTab(t as PrepareTab)}
            />
          )}

          {/* Tab 2: Next Best Action */}
          {activeTab === "next_action" && (
            <div className="space-y-6">
              <NextBestAction action={plan.nextBestAction} />
              <PreparationActivityCard activity={plan.nextBestAction.activityRef} isPrimary />
            </div>
          )}

          {/* Tab 3: Today's Plan */}
          {activeTab === "plan" && (
            <PreparationPlanView plan={plan} />
          )}

          {/* Tab 4: Priority */}
          {activeTab === "priority" && (
            <PreparationPriorityPanel plan={plan} />
          )}

          {/* Tab 5: Deferred */}
          {activeTab === "deferred" && (
            <DeferredActivities deferred={plan.deferredActivities} />
          )}

          {/* Tab 6: Constraints */}
          {activeTab === "constraints" && (
            <PreparationConstraints constraintsApplied={plan.constraintsApplied} />
          )}

          {/* Tab 7: Confidence */}
          {activeTab === "confidence" && (
            <PlanConfidenceCard confidence={plan.planConfidence} />
          )}

          {/* Tab 8: Timeline */}
          {activeTab === "timeline" && (
            <PreparationTimeline plan={plan} />
          )}

          {/* Tab 9: History */}
          {activeTab === "history" && (
            <PreparationHistory history={getPreparationPlanHistory()} />
          )}

          {/* Tab 10: AI Coach */}
          {activeTab === "coach" && (
            <AIPreparationCoach plan={plan} />
          )}
        </div>
      ) : null}
    </div>
  );
}
