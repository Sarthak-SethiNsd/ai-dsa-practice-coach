"use client";

import { useState } from "react";
import { usePreparationCommandCenter } from "@/hooks/usePreparationCommandCenter";

// UI Components
import { PreparationOverview } from "@/components/preparation/PreparationOverview";
import { PreparationGoalModal } from "@/components/preparation/PreparationGoalModal";
import { PreparationReadinessPanel } from "@/components/preparation/PreparationReadinessPanel";
import { GoalGapAnalysis } from "@/components/preparation/GoalGapAnalysis";
import { PreparationRoadmap } from "@/components/preparation/PreparationRoadmap";
import { WeeklyStrategy } from "@/components/preparation/WeeklyStrategy";
import { RiskDetectionPanel } from "@/components/preparation/RiskDetectionPanel";
import { MilestoneTracker } from "@/components/preparation/MilestoneTracker";
import { AIPreparationCoach } from "@/components/preparation/AIPreparationCoach";
import { PreparationHistory } from "@/components/preparation/PreparationHistory";

import {
  Target,
  Layers,
  Map,
  Calendar,
  ShieldAlert,
  Award,
  Sparkles,
  History,
  Activity,
} from "lucide-react";

type PrepTab =
  | "overview"
  | "readiness"
  | "gaps"
  | "roadmap"
  | "weekly"
  | "risks"
  | "milestones"
  | "coach"
  | "history";

const TABS: { label: string; value: PrepTab; icon: React.ElementType }[] = [
  { label: "Overview", value: "overview", icon: Activity },
  { label: "Readiness (10-Dim)", value: "readiness", icon: Award },
  { label: "Gap Matrix", value: "gaps", icon: Layers },
  { label: "Timeline Roadmap", value: "roadmap", icon: Map },
  { label: "Weekly Targets", value: "weekly", icon: Calendar },
  { label: "Risk Radar", value: "risks", icon: ShieldAlert },
  { label: "Milestones", value: "milestones", icon: Target },
  { label: "AI Coach Debrief", value: "coach", icon: Sparkles },
  { label: "Trajectory History", value: "history", icon: History },
];

export default function PreparationPage() {
  const {
    state,
    isLoading,
    error,
    switchGoal,
    saveGoal,
    updateDailyMinutes,
    showGoalModal,
    setShowGoalModal,
    editingGoal,
    openCreateGoal,
    openEditGoal,
    acknowledgeRisk,
    comparison,
    comparisonTimeframe,
    setComparisonTimeframe,
  } = usePreparationCommandCenter();

  const [activeTab, setActiveTab] = useState<PrepTab>("overview");

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center space-y-3">
        <Target className="w-10 h-10 text-sky-600 animate-spin" />
        <span className="text-xs font-bold text-slate-600">
          Synthesizing preparation telemetry...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Overview Banner */}
      <PreparationOverview
        state={state}
        onSwitchGoal={switchGoal}
        onOpenCreateGoal={openCreateGoal}
        onOpenEditGoal={openEditGoal}
        onUpdateDailyMinutes={updateDailyMinutes}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <GoalGapAnalysis gaps={state.gaps.slice(0, 3)} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyStrategy strategy={state.weeklyStrategy} />
            <RiskDetectionPanel risks={state.risks} onAcknowledge={acknowledgeRisk} />
          </div>
          <AIPreparationCoach coachDebrief={state.coachDebrief} />
        </div>
      )}

      {activeTab === "readiness" && (
        <PreparationReadinessPanel readiness={state.readiness} />
      )}

      {activeTab === "gaps" && (
        <GoalGapAnalysis gaps={state.gaps} />
      )}

      {activeTab === "roadmap" && (
        <PreparationRoadmap roadmap={state.roadmap} />
      )}

      {activeTab === "weekly" && (
        <WeeklyStrategy strategy={state.weeklyStrategy} />
      )}

      {activeTab === "risks" && (
        <RiskDetectionPanel risks={state.risks} onAcknowledge={acknowledgeRisk} />
      )}

      {activeTab === "milestones" && (
        <MilestoneTracker milestones={state.milestones} />
      )}

      {activeTab === "coach" && (
        <AIPreparationCoach coachDebrief={state.coachDebrief} />
      )}

      {activeTab === "history" && (
        <PreparationHistory
          comparison={comparison}
          timeframe={comparisonTimeframe}
          onTimeframeChange={setComparisonTimeframe}
        />
      )}

      {/* Goal Modal */}
      <PreparationGoalModal
        isOpen={showGoalModal}
        editingGoal={editingGoal}
        onSave={saveGoal}
        onClose={() => setShowGoalModal(false)}
      />
    </div>
  );
}
