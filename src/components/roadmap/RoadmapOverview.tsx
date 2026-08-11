"use client";

import * as React from "react";
import {
  Map,
  Zap,
  RefreshCw,
  Trash2,
  Target,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PracticeRoadmap, RoadmapProgress } from "@/services/roadmapTypes";

interface RoadmapOverviewProps {
  roadmap: PracticeRoadmap | null;
  progress: RoadmapProgress | null;
  refreshing: boolean;
  onGenerate: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function RoadmapOverview({
  roadmap,
  progress,
  refreshing,
  onGenerate,
  onRefresh,
  onDelete,
}: RoadmapOverviewProps) {
  const generatedAt = roadmap
    ? new Date(roadmap.generatedAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <section className="roadmap-overview">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Practice Roadmap</h2>
            {generatedAt && (
              <p className="text-xs text-slate-500 mt-0.5">
                Generated {generatedAt} · Based on readiness score{" "}
                <span className="font-semibold text-slate-700">
                  {roadmap?.basedOnReadinessScore ?? "—"}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {roadmap ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
                className="text-slate-600 hover:text-slate-900 gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={onGenerate}
              disabled={refreshing}
              className="gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              {refreshing ? "Generating..." : "Generate Roadmap"}
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {roadmap && progress && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<Target className="w-5 h-5 text-violet-500" />}
            label="Total Tasks"
            value={String(progress.totalAssigned)}
            bg="bg-violet-50"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            label="Completed"
            value={`${progress.completed}/${progress.totalAssigned}`}
            sub={`${progress.completionRate}%`}
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            label="Streak"
            value={`${progress.streak} day${progress.streak !== 1 ? "s" : ""}`}
            bg="bg-orange-50"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-sky-500" />}
            label="Consistency"
            value={`${progress.consistencyScore}%`}
            bg="bg-sky-50"
          />
        </div>
      )}

      {/* Adaptation badge */}
      {roadmap && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <AdaptationBadge level={roadmap.adaptationLevel} />
          <span className="text-xs text-slate-500">{roadmap.summaryNote}</span>
        </div>
      )}

      {/* Empty state */}
      {!roadmap && (
        <div className="mt-8 flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60 text-center px-6">
          <AlertCircle className="w-10 h-10 text-violet-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No roadmap yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Generate a personalized practice roadmap from your recommendation data. It adapts daily, weekly, and monthly.
          </p>
          <Button variant="primary" onClick={onGenerate} disabled={refreshing} className="gap-2 cursor-pointer">
            <Zap className="w-4 h-4" />
            {refreshing ? "Generating..." : "Generate My Roadmap"}
          </Button>
        </div>
      )}
    </section>
  );
}

// ─── Sub components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  bg?: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${bg ?? "bg-slate-50"} flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function AdaptationBadge({ level }: { level: PracticeRoadmap["adaptationLevel"] }) {
  const map = {
    Beginner: "bg-emerald-100 text-emerald-700",
    Intermediate: "bg-sky-100 text-sky-700",
    Advanced: "bg-violet-100 text-violet-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[level]}`}>
      <Zap className="w-3 h-3" />
      {level} Plan
    </span>
  );
}
