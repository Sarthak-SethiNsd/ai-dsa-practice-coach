"use client";

import * as React from "react";
import { useContestIntelligence } from "@/hooks/useContestIntelligence";
import { ContestDashboardHeader } from "@/components/contest/ContestDashboardHeader";
import { ContestHistoryTable } from "@/components/contest/ContestHistoryTable";
import { RatingProgressCharts } from "@/components/contest/RatingProgressCharts";
import { ContestPerformanceBreakdown } from "@/components/contest/ContestPerformanceBreakdown";
import { WeaknessDetectionPanel } from "@/components/contest/WeaknessDetectionPanel";
import { TopicMatrixPanel } from "@/components/contest/TopicMatrixPanel";
import { ContestReadinessPanel } from "@/components/contest/ContestReadinessPanel";
import { VirtualContestPlanner } from "@/components/contest/VirtualContestPlanner";
import { ContestCoachPanel } from "@/components/contest/ContestCoachPanel";
import { ContestGoalTracker } from "@/components/contest/ContestGoalTracker";
import { AddContestModal } from "@/components/contest/AddContestModal";
import { AddContestGoalModal } from "@/components/contest/AddContestGoalModal";
import { useAppContext } from "@/context/AppContext";
import {
  Trophy,
  History,
  TrendingUp,
  BarChart2,
  AlertTriangle,
  Grid3X3,
  Shield,
  Calendar,
  Bot,
  Target,
  RotateCw,
  Loader2,
} from "lucide-react";

type ContestTab =
  | "dashboard"
  | "history"
  | "rating"
  | "breakdown"
  | "weakness"
  | "matrix"
  | "readiness"
  | "planner"
  | "coach"
  | "goals";

const TABS: { id: ContestTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: Trophy },
  { id: "history", label: "Contest History", icon: History },
  { id: "rating", label: "Rating Progress", icon: TrendingUp },
  { id: "breakdown", label: "Performance", icon: BarChart2 },
  { id: "weakness", label: "Weaknesses", icon: AlertTriangle },
  { id: "matrix", label: "Topic Matrix", icon: Grid3X3 },
  { id: "readiness", label: "Readiness Score", icon: Shield },
  { id: "planner", label: "Virtual Planner", icon: Calendar },
  { id: "coach", label: "AI Coach", icon: Bot },
  { id: "goals", label: "Goals", icon: Target },
];

export default function ContestIntelligencePage() {
  const { showToast } = useAppContext();
  const {
    intelligence,
    loading,
    platformFilter,
    setPlatformFilter,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    filteredEntries,
    addContest,
    deleteContest,
    addGoal,
    deleteGoal,
    refresh,
  } = useContestIntelligence();

  const [activeTab, setActiveTab] = React.useState<ContestTab>("dashboard");
  const [addContestOpen, setAddContestOpen] = React.useState(false);
  const [addGoalOpen, setAddGoalOpen] = React.useState(false);

  if (loading || !intelligence) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Loading contest intelligence & computing analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Contest Intelligence
            </h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 uppercase tracking-wider">
              Coach System
            </span>
          </div>
          <p className="text-slate-500 text-sm sm:text-base max-w-3xl leading-relaxed">
            Your personal competitive programming coach — tracking ratings, analyzing contest patterns,
            detecting weaknesses, and building your growth roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              refresh();
              showToast("Contest data refreshed.");
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer shadow-xs"
            title="Refresh Data"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAddContestOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <Trophy className="w-4 h-4" />
            Log Contest
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${isActive ? "text-sky-600" : "text-slate-400"}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}

      {activeTab === "dashboard" && (
        <div className="space-y-10">
          <ContestDashboardHeader metrics={intelligence.dashboard} />
          <div className="border-t border-slate-100 pt-8">
            <ContestReadinessPanel readiness={intelligence.readiness} />
          </div>
          <div className="border-t border-slate-100 pt-8">
            <RatingProgressCharts analytics={intelligence.ratingProgress} />
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <ContestHistoryTable
          entries={filteredEntries}
          platformFilter={platformFilter}
          onFilterChange={setPlatformFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortDir={sortDir}
          onSortDirChange={setSortDir}
          onAddContest={() => setAddContestOpen(true)}
          onDeleteContest={async (id) => {
            const ok = await deleteContest(id);
            if (ok) showToast("Contest deleted.");
          }}
        />
      )}

      {activeTab === "rating" && (
        <RatingProgressCharts analytics={intelligence.ratingProgress} />
      )}

      {activeTab === "breakdown" && (
        <ContestPerformanceBreakdown entries={intelligence.entries} />
      )}

      {activeTab === "weakness" && (
        <WeaknessDetectionPanel weakness={intelligence.weakness} />
      )}

      {activeTab === "matrix" && (
        <TopicMatrixPanel topicMatrix={intelligence.topicMatrix} />
      )}

      {activeTab === "readiness" && (
        <ContestReadinessPanel readiness={intelligence.readiness} />
      )}

      {activeTab === "planner" && (
        <VirtualContestPlanner plan={intelligence.virtualPlan} />
      )}

      {activeTab === "coach" && (
        <ContestCoachPanel coach={intelligence.coach} />
      )}

      {activeTab === "goals" && (
        <ContestGoalTracker
          goals={intelligence.goals}
          onOpenAddGoal={() => setAddGoalOpen(true)}
          onDeleteGoal={async (id) => {
            const ok = await deleteGoal(id);
            if (ok) showToast("Goal deleted.");
          }}
        />
      )}

      {/* ── Modals ── */}
      {addContestOpen && (
        <AddContestModal
          onClose={() => setAddContestOpen(false)}
          onSubmit={async (entry) => {
            await addContest(entry);
            showToast("Contest logged successfully!");
          }}
        />
      )}

      {addGoalOpen && (
        <AddContestGoalModal
          onClose={() => setAddGoalOpen(false)}
          onSubmit={async (goal) => {
            await addGoal(goal);
            showToast("Goal created!");
          }}
        />
      )}
    </div>
  );
}
