"use client";

import * as React from "react";
import { usePerformanceAnalytics, TimeframeFilter } from "@/hooks/usePerformanceAnalytics";
import { OverallPerformanceHeader } from "@/components/analytics/OverallPerformanceHeader";
import { TopicMasteryPanel } from "@/components/analytics/TopicMasteryPanel";
import { PlatformAnalyticsPanel } from "@/components/analytics/PlatformAnalyticsPanel";
import { AiInsightsPanel } from "@/components/analytics/AiInsightsPanel";
import { ProgressTimelinePanel } from "@/components/analytics/ProgressTimelinePanel";
import { GoalTrackingPanel } from "@/components/analytics/GoalTrackingPanel";
import { PredictiveReadinessPanel } from "@/components/analytics/PredictiveReadinessPanel";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { CreateGoalModal } from "@/components/analytics/CreateGoalModal";
import { useAppContext } from "@/context/AppContext";
import {
  TrendingUp,
  RotateCw,
  BookOpen,
  Layers,
  Sparkles,
  History,
  Target,
  Gauge,
  BarChart2,
  Loader2,
} from "lucide-react";

type AnalyticsTab =
  | "overview"
  | "topics"
  | "platforms"
  | "insights"
  | "timeline"
  | "goals"
  | "predictive"
  | "charts";

export default function AnalyticsPage() {
  const { showToast } = useAppContext();
  const {
    analytics,
    loading,
    timeframe,
    setTimeframe,
    addGoal,
    updateGoal,
    deleteGoal,
    refresh,
  } = usePerformanceAnalytics();

  const [activeTab, setActiveTab] = React.useState<AnalyticsTab>("overview");
  const [createGoalOpen, setCreateGoalOpen] = React.useState<boolean>(false);

  const tabs = [
    { id: "overview" as AnalyticsTab, label: "Overview", icon: TrendingUp },
    { id: "topics" as AnalyticsTab, label: "Topic Mastery", icon: BookOpen },
    { id: "platforms" as AnalyticsTab, label: "Platforms", icon: Layers },
    { id: "insights" as AnalyticsTab, label: "AI Insights", icon: Sparkles },
    { id: "timeline" as AnalyticsTab, label: "Progress Timeline", icon: History },
    { id: "goals" as AnalyticsTab, label: "Goals & Forecasts", icon: Target },
    { id: "predictive" as AnalyticsTab, label: "Predictive Readiness", icon: Gauge },
    { id: "charts" as AnalyticsTab, label: "Visual Charts", icon: BarChart2 },
  ];

  if (loading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Aggregating performance metrics & running predictive analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Performance Analytics & Intelligence
            </h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
              Live Engine
            </span>
          </div>
          <p className="text-slate-500 text-sm sm:text-base max-w-3xl leading-relaxed">
            Central learning intelligence dashboard aggregating AI review metrics, practice roadmaps, topic mastery, and predictive interview readiness.
          </p>
        </div>

        {/* Toolbar: Refresh & Timeframe */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(["7d", "30d", "90d", "all"] as TimeframeFilter[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                  timeframe === tf ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              refresh();
              showToast("Analytics refreshed successfully.");
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer shadow-2xs"
            title="Refresh Analytics Data"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
        {tabs.map((tab) => {
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
              <Icon className={`w-4 h-4 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "overview" && (
        <div className="space-y-10">
          <OverallPerformanceHeader metrics={analytics.overall} />
          <div className="border-t border-slate-100 pt-8">
            <PredictiveReadinessPanel predictive={analytics.predictive} />
          </div>
          <div className="border-t border-slate-100 pt-8">
            <AiInsightsPanel insights={analytics.aiInsights} />
          </div>
          <div className="border-t border-slate-100 pt-8">
            <AnalyticsCharts analytics={analytics} />
          </div>
        </div>
      )}

      {activeTab === "topics" && (
        <TopicMasteryPanel
          topics={analytics.topicMastery.topics}
          strongestTopics={analytics.topicMastery.strongestTopics}
          weakestTopics={analytics.topicMastery.weakestTopics}
          masteryDistribution={analytics.topicMastery.masteryDistribution}
        />
      )}

      {activeTab === "platforms" && (
        <PlatformAnalyticsPanel platforms={analytics.platforms} />
      )}

      {activeTab === "insights" && (
        <AiInsightsPanel insights={analytics.aiInsights} />
      )}

      {activeTab === "timeline" && (
        <ProgressTimelinePanel timeline={analytics.timeline} />
      )}

      {activeTab === "goals" && (
        <GoalTrackingPanel
          goals={analytics.goals}
          onOpenCreateModal={() => setCreateGoalOpen(true)}
          onUpdateGoal={async (id, updates) => {
            const res = await updateGoal(id, updates);
            if (res) showToast("Goal updated.");
            return res;
          }}
          onDeleteGoal={async (id) => {
            const ok = await deleteGoal(id);
            if (ok) showToast("Goal deleted.");
            return ok;
          }}
        />
      )}

      {activeTab === "predictive" && (
        <PredictiveReadinessPanel predictive={analytics.predictive} />
      )}

      {activeTab === "charts" && (
        <AnalyticsCharts analytics={analytics} />
      )}

      {/* Create Goal Modal */}
      {createGoalOpen && (
        <CreateGoalModal
          onClose={() => setCreateGoalOpen(false)}
          onSubmit={async (payload) => {
            const newG = await addGoal(payload);
            showToast(`Goal "${newG.title}" created!`);
            return newG;
          }}
        />
      )}
    </div>
  );
}
