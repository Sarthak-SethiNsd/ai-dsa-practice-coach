import * as React from "react";
import { DashboardSummary } from "@/services/analytics/dashboardSummary";
import { Trophy, Flame, CheckCircle2, FastForward, Award, Percent } from "lucide-react";

interface DashboardOverviewCardsProps {
  summary: DashboardSummary;
}

interface OverviewCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function OverviewCard({ title, value, subtext, icon, iconBg, iconColor }: OverviewCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{value}</div>
        {subtext && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

export function DashboardOverviewCards({ summary }: DashboardOverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <OverviewCard
        title="Total Sessions"
        value={summary.totalSessions}
        subtext="Recorded practice days"
        icon={<Trophy className="w-4 h-4" />}
        iconBg="bg-sky-50"
        iconColor="text-sky-600"
      />
      <OverviewCard
        title="Completed"
        value={summary.totalCompleted}
        subtext="Solved questions"
        icon={<CheckCircle2 className="w-4 h-4" />}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <OverviewCard
        title="Skipped"
        value={summary.totalSkipped}
        subtext="Skipped questions"
        icon={<FastForward className="w-4 h-4" />}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
      />
      <OverviewCard
        title="Current Streak"
        value={`${summary.currentStreak} ${summary.currentStreak === 1 ? "day" : "days"}`}
        subtext={summary.currentStreak > 0 ? "Keep it going!" : "Start today"}
        icon={<Flame className="w-4 h-4" />}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
      />
      <OverviewCard
        title="Longest Streak"
        value={`${summary.longestStreak} ${summary.longestStreak === 1 ? "day" : "days"}`}
        subtext="Personal best record"
        icon={<Award className="w-4 h-4" />}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
      />
      <OverviewCard
        title="Avg Completion"
        value={`${summary.avgCompletionPct}%`}
        subtext="Across all sessions"
        icon={<Percent className="w-4 h-4" />}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      />
    </div>
  );
}
