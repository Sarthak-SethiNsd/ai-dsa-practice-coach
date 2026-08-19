"use client";

import * as React from "react";
import { useProgressReports } from "@/hooks/useProgressReports";
import { ProgressOverview } from "@/components/progress/ProgressOverview";
import { ReportFilters } from "@/components/progress/ReportFilters";
import { ProgressSnapshotCard } from "@/components/progress/ProgressSnapshotCard";
import { ProgressReport } from "@/components/progress/ProgressReport";
import { AchievementGrid } from "@/components/progress/AchievementGrid";
import { ProgressTimeline } from "@/components/progress/ProgressTimeline";
import { ProgressComparison } from "@/components/progress/ProgressComparison";
import { ProgressCharts } from "@/components/progress/ProgressCharts";
import { AIProgressSummary } from "@/components/progress/AIProgressSummary";
import { ShareReportModal } from "@/components/progress/ShareReportModal";
import { ExportReportModal } from "@/components/progress/ExportReportModal";
import { ReportPrivacySettingsModal } from "@/components/progress/ReportPrivacySettings";
import { ReportHistory } from "@/components/progress/ReportHistory";
import { useAppContext } from "@/context/AppContext";
import {
  FileText,
  Image as ImageIcon,
  BarChart3,
  Trophy,
  History as HistoryIcon,
  Loader2,
  TrendingUp,
} from "lucide-react";

type ProgressPageTab = "report" | "card" | "analytics" | "achievements" | "timeline";

const TABS: { id: ProgressPageTab; label: string; icon: React.ElementType }[] = [
  { id: "report", label: "Comprehensive Report", icon: FileText },
  { id: "card", label: "Shareable Card", icon: ImageIcon },
  { id: "analytics", label: "Analytics & Trends", icon: BarChart3 },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "timeline", label: "Timeline & Comparison", icon: TrendingUp },
];

export default function ProgressPage() {
  const { showToast } = useAppContext();
  const progress = useProgressReports();
  const [activeTab, setActiveTab] = React.useState<ProgressPageTab>("report");

  if (progress.loading || !progress.report) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Synthesizing verified DSA progress & learning analytics...
        </p>
      </div>
    );
  }

  const report = progress.report;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <title>DSA Progress Reports & Social Sharing · DSA AI Coach</title>

      {/* Header Banner & Core Summary Metrics */}
      <ProgressOverview
        report={report}
        loading={progress.loading}
        onRefresh={() => {
          progress.regenerateReport();
          showToast?.("Progress report refreshed with latest data!");
        }}
        onOpenShare={() => progress.setIsShareModalOpen(true)}
        onOpenExport={() => progress.setIsExportModalOpen(true)}
        onOpenPrivacy={() => progress.setIsPrivacyModalOpen(true)}
        onOpenHistory={() => progress.setIsHistoryDrawerOpen(true)}
      />

      {/* Time Range Filter Bar */}
      <ReportFilters
        timeRange={progress.timeRange}
        onSelectPreset={progress.setTimeRangePreset}
      />

      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "report" && (
        <div className="space-y-6">
          <AIProgressSummary narrative={report.aiNarrative} />
          <ProgressReport report={report} />
        </div>
      )}

      {activeTab === "card" && (
        <div className="max-w-2xl mx-auto py-2">
          <ProgressSnapshotCard
            card={report.snapshotCard}
            onDownloadPNG={progress.downloadPNG}
          />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <ProgressCharts report={report} />
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="space-y-6">
          <AchievementGrid achievements={report.achievements.allAchievements} />
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="space-y-8">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Period-Over-Period Comparison</h3>
            <p className="text-xs text-slate-500 mb-4">Metric progression relative to prior timeframe</p>
            <ProgressComparison comparison={report.comparison} />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Milestones Timeline</h3>
            <p className="text-xs text-slate-500 mb-4">Chronological event log of solved problems, contests, and reviews</p>
            <ProgressTimeline milestones={report.timeline} />
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <ShareReportModal
        isOpen={progress.isShareModalOpen}
        onClose={() => progress.setIsShareModalOpen(false)}
        card={report.snapshotCard}
        onDownloadPNG={progress.downloadPNG}
      />

      <ExportReportModal
        isOpen={progress.isExportModalOpen}
        onClose={() => progress.setIsExportModalOpen(false)}
        onDownloadPDF={progress.downloadPDF}
        onDownloadPNG={progress.downloadPNG}
        periodLabel={progress.timeRange.label}
      />

      <ReportPrivacySettingsModal
        isOpen={progress.isPrivacyModalOpen}
        onClose={() => progress.setIsPrivacyModalOpen(false)}
        settings={progress.privacySettings}
        onSave={progress.updatePrivacySettings}
      />

      <ReportHistory
        isOpen={progress.isHistoryDrawerOpen}
        onClose={() => progress.setIsHistoryDrawerOpen(false)}
        savedReports={progress.savedReports}
        onSelectReport={(rec) => {
          progress.setTimeRangePreset(rec.timeRangePreset, rec.startDate, rec.endDate);
          showToast?.(`Loaded ${rec.title}`);
        }}
        onDeleteReport={progress.deleteSavedReport}
        onSaveCurrentReport={async () => {
          await progress.saveCurrentReportToHistory();
          showToast?.("Report saved to history!");
        }}
      />
    </main>
  );
}
