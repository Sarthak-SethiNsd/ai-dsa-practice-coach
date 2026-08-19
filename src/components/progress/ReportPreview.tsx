"use client";

import * as React from "react";
import { ProgressReportData } from "@/services/progress/progressTypes";
import { ProgressReport } from "./ProgressReport";
import { ProgressSnapshotCard } from "./ProgressSnapshotCard";
import { AIProgressSummary } from "./AIProgressSummary";
import { FileText, Image as ImageIcon } from "lucide-react";

interface ReportPreviewProps {
  report: ProgressReportData;
  onDownloadPNG: () => Promise<void>;
}

export function ReportPreview({ report, onDownloadPNG }: ReportPreviewProps) {
  const [viewMode, setViewMode] = React.useState<"full" | "card">("full");

  return (
    <div className="space-y-6">
      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setViewMode("full")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "full"
                ? "bg-white text-sky-700 shadow-xs border border-sky-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Full Progress Document
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "card"
                ? "bg-white text-sky-700 shadow-xs border border-sky-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Shareable Snapshot Card
          </button>
        </div>
      </div>

      {/* Render View */}
      {viewMode === "full" ? (
        <div className="space-y-6">
          <AIProgressSummary narrative={report.aiNarrative} />
          <ProgressReport report={report} />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <ProgressSnapshotCard card={report.snapshotCard} onDownloadPNG={onDownloadPNG} />
        </div>
      )}
    </div>
  );
}
