"use client";

import * as React from "react";
import { useRoadmap } from "@/hooks/useRoadmap";
import { RoadmapOverview } from "@/components/roadmap/RoadmapOverview";
import { DailyMissionPanel } from "@/components/roadmap/DailyMissionPanel";
import { WeeklyRoadmapPanel } from "@/components/roadmap/WeeklyRoadmapPanel";
import { MonthlyGoalPanel } from "@/components/roadmap/MonthlyGoalPanel";
import { RoadmapAnalyticsPanel } from "@/components/roadmap/RoadmapAnalyticsPanel";
import { Loader2, Map } from "lucide-react";

export default function RoadmapPage() {
  const {
    loading,
    refreshing,
    roadmap,
    progress,
    analytics,
    dailyMission,
    weeklyRoadmap,
    monthlyGoal,
    completedTaskIds,
    generateRoadmap,
    refreshRoadmap,
    markTaskCompleted,
    markTaskIncomplete,
    deleteRoadmap,
  } = useRoadmap();

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
          <p className="text-sm font-medium">Loading your practice roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="roadmap-page max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* SEO */}
      <title>Practice Roadmap · DSA AI Coach</title>

      {/* Page title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600">
          <Map className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Practice Roadmap</h1>
          <p className="text-sm text-slate-500">
            Your AI-powered adaptive coding study plan — built from your review history and recommendations.
          </p>
        </div>
      </div>

      {/* ─── Overview ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <RoadmapOverview
          roadmap={roadmap}
          progress={progress}
          refreshing={refreshing}
          onGenerate={generateRoadmap}
          onRefresh={refreshRoadmap}
          onDelete={deleteRoadmap}
        />
      </div>

      {/* ─── Main content (only shown when roadmap exists) ────────────────────── */}
      {roadmap && (
        <>
          {/* Two-column layout on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Mission */}
            {dailyMission && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <DailyMissionPanel
                  mission={dailyMission}
                  completedTaskIds={completedTaskIds}
                  onComplete={markTaskCompleted}
                  onIncomplete={markTaskIncomplete}
                />
              </div>
            )}

            {/* Monthly Goal */}
            {monthlyGoal && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <MonthlyGoalPanel
                  monthlyGoal={monthlyGoal}
                  completedTaskIds={completedTaskIds}
                />
              </div>
            )}
          </div>

          {/* Weekly Roadmap — full width */}
          {weeklyRoadmap && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <WeeklyRoadmapPanel
                weeklyRoadmap={weeklyRoadmap}
                completedTaskIds={completedTaskIds}
                onComplete={markTaskCompleted}
                onIncomplete={markTaskIncomplete}
              />
            </div>
          )}

          {/* Analytics — full width */}
          {analytics && progress && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <RoadmapAnalyticsPanel analytics={analytics} progress={progress} />
            </div>
          )}
        </>
      )}
    </main>
  );
}
