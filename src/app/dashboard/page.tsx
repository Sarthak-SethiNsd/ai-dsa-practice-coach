"use client";

import * as React from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { ImprovementPanel } from "@/components/dashboard/ImprovementPanel";
import { CollectionAnalyticsPanel } from "@/components/dashboard/CollectionAnalyticsPanel";
import { AchievementsPanel } from "@/components/dashboard/AchievementsPanel";
import {
  exportDashboardPDF,
  exportDashboardMarkdown,
  exportDashboardJSON,
} from "@/services/dashboardExportService";
import { useAppContext } from "@/context/AppContext";
import {
  BarChart2,
  Calendar,
  Zap,
  Clock,
  Code2,
  Layers,
  Award,
  Download,
  ChevronDown,
  FileType,
  FileText,
  FileCode,
  Loader2,
  Folder,
  CheckCircle,
  Timer,
} from "lucide-react";

function formatDurationHuman(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return `${totalSec}s`;
}

export default function DashboardPage() {
  const { showToast } = useAppContext();

  const {
    loading,
    filters,
    setFilters,
    resetFilters,
    rawEntries,
    filteredEntries,
    collections,
    availableLanguages,
    availableCategories,
    availableProviders,
    availableModels,
    stats,
    timeSeries,
    distributions,
    improvements,
    collectionAnalytics,
    achievements,
  } = useDashboardData();

  const [exportOpen, setExportOpen] = React.useState(false);
  const exportRef = React.useRef<HTMLDivElement>(null);

  // Click outside listener for Export dropdown
  React.useEffect(() => {
    if (!exportOpen) return;
    const h = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [exportOpen]);

  const handleExport = (fmt: "pdf" | "markdown" | "json") => {
    setExportOpen(false);
    try {
      if (fmt === "pdf") {
        exportDashboardPDF(stats, distributions, improvements, collectionAnalytics, achievements);
      } else if (fmt === "markdown") {
        exportDashboardMarkdown(stats, distributions, improvements, collectionAnalytics, achievements);
      } else {
        exportDashboardJSON(stats, distributions, improvements, collectionAnalytics, achievements);
      }
      showToast(`Exported dashboard report as .${fmt.toUpperCase()}`);
    } catch (err) {
      console.error("[DashboardPage] Export error:", err);
      showToast("Dashboard export failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Loading AI Progress Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              AI Progress Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-700 border border-sky-200">
              Live
            </span>
          </div>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            Visualize learning progress, code quality trends, token consumption, and achievement milestones.
          </p>
        </div>

        {/* EXPORT DROPDOWN */}
        <div ref={exportRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setExportOpen((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 hover:border-sky-400 hover:text-sky-700 hover:bg-sky-50/50 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Export Dashboard Report</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`}
            />
          </button>

          {exportOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
              >
                <FileType className="w-4 h-4 text-slate-400" />
                <span>Export Executive PDF</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">.pdf</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("markdown")}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Export Markdown Summary</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">.md</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("json")}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left border-t border-slate-100"
              >
                <FileCode className="w-4 h-4 text-slate-400" />
                <span>Export Raw Analytics JSON</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">.json</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        availableLanguages={availableLanguages}
        availableCategories={availableCategories}
        availableProviders={availableProviders}
        availableModels={availableModels}
        collections={collections}
        resultCount={filteredEntries.length}
        totalCount={rawEntries.length}
      />

      {/* 11 DASHBOARD STAT CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* 1. Total Reviews */}
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          subtext="All historical AI reviews"
          icon={BarChart2}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
        />

        {/* 2. Reviews This Week */}
        <StatCard
          title="This Week"
          value={stats.reviewsThisWeek}
          subtext="Past 7 days activity"
          icon={Calendar}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />

        {/* 3. Reviews This Month */}
        <StatCard
          title="This Month"
          value={stats.reviewsThisMonth}
          subtext="Past 30 days activity"
          icon={Calendar}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />

        {/* 4. Average AI Score */}
        <StatCard
          title="Avg AI Score"
          value={`${stats.avgScore} pts`}
          subtext="Quality rating index"
          icon={CheckCircle}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          trend={{
            value: `${improvements.scoreImprovementPct >= 0 ? "+" : ""}${improvements.scoreImprovementPct}%`,
            isPositive: improvements.scoreImprovementPct >= 0,
          }}
        />

        {/* 5. Best AI Score */}
        <StatCard
          title="Best AI Score"
          value={`${stats.bestScore} pts`}
          subtext="Peak review quality"
          icon={Award}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />

        {/* 6. Avg Token Usage */}
        <StatCard
          title="Avg Tokens"
          value={stats.avgTokens.toLocaleString()}
          subtext="Tokens / review request"
          icon={Zap}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-500"
        />

        {/* 7. Avg Response Duration */}
        <StatCard
          title="Avg Duration"
          value={`${(stats.avgDurationMs / 1000).toFixed(1)}s`}
          subtext="AI response latency"
          icon={Clock}
          iconBgColor="bg-cyan-50"
          iconTextColor="text-cyan-600"
        />

        {/* 8. Total Coding Time Analyzed */}
        <StatCard
          title="Coding Time"
          value={formatDurationHuman(stats.totalCodingTimeMs)}
          subtext="Estimated code time"
          icon={Timer}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />

        {/* 9. Collections Count */}
        <StatCard
          title="Collections"
          value={stats.collectionsCount}
          subtext="Saved review sets"
          icon={Folder}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />

        {/* 10. Most Active Language */}
        <StatCard
          title="Top Language"
          value={stats.mostActiveLanguage}
          subtext="Most submitted language"
          icon={Code2}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
        />

        {/* 11. Most Active Category */}
        <StatCard
          title="Top Category"
          value={stats.mostActiveCategory}
          subtext="Most used prompt category"
          icon={Layers}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* IMPROVEMENT ANALYTICS SECTION */}
      <ImprovementPanel improvements={improvements} />

      {/* 10 VISUAL CHARTS SECTION */}
      <DashboardCharts timeSeries={timeSeries} distributions={distributions} />

      {/* COLLECTION ANALYTICS SECTION */}
      <CollectionAnalyticsPanel analytics={collectionAnalytics} />

      {/* ACHIEVEMENTS & BADGES SECTION */}
      <AchievementsPanel badges={achievements} />
    </div>
  );
}
