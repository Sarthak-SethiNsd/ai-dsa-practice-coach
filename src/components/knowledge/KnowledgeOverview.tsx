"use client";

import * as React from "react";
import {
  BookOpen,
  Tag,
  Brain,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";
import { KnowledgeDashboardMetrics } from "@/services/knowledge/knowledgeTypes";

interface KnowledgeOverviewProps {
  metrics: KnowledgeDashboardMetrics | null;
  loading?: boolean;
}

export function KnowledgeOverview({ metrics, loading }: KnowledgeOverviewProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Notes",
      value: metrics.totalNotes,
      icon: BookOpen,
      color: "sky",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      valueBg: "text-sky-700",
    },
    {
      label: "Tagged Problems",
      value: metrics.totalTaggedProblems,
      icon: Tag,
      color: "violet",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      valueBg: "text-violet-700",
    },
    {
      label: "Patterns Tracked",
      value: metrics.totalPatterns,
      icon: Layers,
      color: "indigo",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      valueBg: "text-indigo-700",
    },
    {
      label: "Mastered",
      value: metrics.masteredCount,
      icon: CheckCircle2,
      color: "emerald",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueBg: "text-emerald-700",
    },
    {
      label: "Needs Revision",
      value: metrics.needsRevisionCount,
      icon: RotateCcw,
      color: "amber",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueBg: "text-amber-700",
    },
    {
      label: "Recently Updated",
      value: metrics.recentlyUpdatedCount,
      icon: Clock,
      color: "slate",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      valueBg: "text-slate-700",
    },
    ...(metrics.mostCommonMistakeType
      ? [
          {
            label: "Top Mistake",
            value: metrics.mostCommonMistakeType.count,
            subtitle: metrics.mostCommonMistakeType.label,
            icon: AlertCircle,
            color: "red",
            iconBg: "bg-red-100",
            iconColor: "text-red-500",
            valueBg: "text-red-600",
          },
        ]
      : []),
    {
      label: "Top Pattern",
      value: metrics.topPatterns[0]?.count ?? 0,
      subtitle: metrics.topPatterns[0]?.pattern ?? "—",
      icon: Brain,
      color: "purple",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      valueBg: "text-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-2"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className={`text-2xl font-extrabold ${card.valueBg}`}>{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{card.subtitle}</p>
                )}
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Tags Row */}
      {metrics.topTags.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">Most Used Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.topTags.map(({ tag, count }) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100"
              >
                {tag}
                <span className="bg-sky-200 text-sky-800 rounded-full px-1.5 py-0.5 text-xs font-extrabold">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topics Row */}
      {metrics.topicsWithMostNotes.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">Topics with Most Notes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.topicsWithMostNotes.map(({ topic, count }) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100"
              >
                {topic}
                <span className="bg-violet-200 text-violet-800 rounded-full px-1.5 py-0.5 text-xs font-extrabold">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
