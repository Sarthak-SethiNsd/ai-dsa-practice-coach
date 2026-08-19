"use client";

import * as React from "react";
import { ProgressReportData } from "@/services/progress/progressTypes";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Share2,
  Download,
  Shield,
  History,
  RefreshCw,
  Flame,
  Target,
  Clock,
  Award,
  Trophy,
  Layers,
} from "lucide-react";

interface ProgressOverviewProps {
  report: ProgressReportData | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenShare: () => void;
  onOpenExport: () => void;
  onOpenPrivacy: () => void;
  onOpenHistory: () => void;
}

export function ProgressOverview({
  report,
  loading,
  onRefresh,
  onOpenShare,
  onOpenExport,
  onOpenPrivacy,
  onOpenHistory,
}: ProgressOverviewProps) {
  if (loading || !report) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-slate-100" />
        ))}
      </div>
    );
  }

  const s = report.summary;
  const p = report.privacy;

  const statCards = [
    {
      label: "Problems Solved",
      value: s.totalSolved,
      sub: `${report.problemSolving.byDifficulty.Easy}E · ${report.problemSolving.byDifficulty.Medium}M · ${report.problemSolving.byDifficulty.Hard}H`,
      icon: Target,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      valueColor: "text-sky-700",
    },
    {
      label: "Active Practice Streak",
      value: `${s.currentStreak} Days`,
      sub: `Longest: ${s.longestStreak} Days`,
      icon: Flame,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      valueColor: "text-orange-700",
    },
    {
      label: "Readiness Score",
      value: `${s.readinessScore}/100`,
      sub: `${s.acceptanceRate}% Acceptance Rate`,
      icon: Award,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    ...(p.showStudyTime
      ? [
          {
            label: "Focus Study Time",
            value: `${s.studyHours}h`,
            sub: `${s.activeDaysCount} active practice days`,
            icon: Clock,
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            valueColor: "text-violet-700",
          },
        ]
      : p.showRatings && p.showContests
      ? [
          {
            label: "Contest Rating",
            value: report.contests.currentCodeforcesRating,
            sub: `Peak: ${report.contests.peakCodeforcesRating} pts`,
            icon: Trophy,
            iconBg: "bg-indigo-100",
            iconColor: "text-indigo-600",
            valueColor: "text-indigo-700",
          },
        ]
      : [
          {
            label: "Pattern Mastery",
            value: `${report.patterns.overallPatternSuccessRate}%`,
            sub: `${report.patterns.patternsTracked} patterns tracked`,
            icon: Layers,
            iconBg: "bg-indigo-100",
            iconColor: "text-indigo-600",
            valueColor: "text-indigo-700",
          },
        ]),
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Verified Progress Report
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Period: {report.timeRange.label}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {p.displayName}&apos;s DSA Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {report.timeRange.startDate} to {report.timeRange.endDate} · {report.achievements.totalUnlocked} verified milestones unlocked
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={onOpenShare}
            className="gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <Share2 className="w-4 h-4" /> Share Snapshot
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenExport}
            className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenPrivacy}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Privacy Settings"
          >
            <Shield className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Report History"
          >
            <History className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Regenerate Report"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-black ${card.valueColor}`}>{card.value}</p>
                <p className="text-xs font-medium text-slate-400 mt-1 truncate">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
