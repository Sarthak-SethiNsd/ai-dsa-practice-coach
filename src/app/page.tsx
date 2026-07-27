"use client";

import * as React from "react";
import { useAppContext } from "@/context/AppContext";
import { useSessionArchive } from "@/hooks/useSessionArchive";
import { computeDashboardSummary } from "@/services/analytics/dashboardSummary";
import { DashboardOverviewCards } from "@/components/dashboard/DashboardOverviewCards";
import { DashboardTodayProgress } from "@/components/dashboard/DashboardTodayProgress";
import { DashboardPlatformBreakdown } from "@/components/dashboard/DashboardPlatformBreakdown";
import { DashboardTopicBreakdown } from "@/components/dashboard/DashboardTopicBreakdown";
import { DashboardWeeklyActivity } from "@/components/dashboard/DashboardWeeklyActivity";
import { DashboardRecentSessions } from "@/components/dashboard/DashboardRecentSessions";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";

export default function Home() {
  const { dailySession } = useAppContext();
  const { sessions, loading } = useSessionArchive();

  // Compute overall summary state using memoization
  const summary = React.useMemo(() => {
    return computeDashboardSummary(sessions, dailySession);
  }, [sessions, dailySession]);

  const hasData = sessions.length > 0 || (dailySession && dailySession.questions.length > 0);

  return (
    <div className="space-y-8 select-none">
      {/* Welcome / Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Analytics Dashboard
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Comprehensive overview of your algorithmic progress, daily practice consistency, platform breakdown, and streak metrics.
        </p>
      </div>

      {loading ? (
        /* Skeleton Loading State */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      ) : !hasData ? (
        /* Empty State */
        <DashboardEmptyState />
      ) : (
        /* Analytics Dashboard View */
        <div className="space-y-8">
          {/* Section 1: Overview Cards */}
          <DashboardOverviewCards summary={summary} />

          {/* Section 2: Today's Progress & Platform Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DashboardTodayProgress summary={summary} />
            </div>
            <div className="lg:col-span-1">
              <DashboardPlatformBreakdown summary={summary} />
            </div>
            <div className="lg:col-span-1">
              <DashboardTopicBreakdown summary={summary} />
            </div>
          </div>

          {/* Section 3: 7-Day Weekly Activity */}
          <DashboardWeeklyActivity summary={summary} />

          {/* Section 4: Recent Practice Sessions */}
          <DashboardRecentSessions summary={summary} />
        </div>
      )}
    </div>
  );
}