"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Download, FileText, Image as ImageIcon, X, CheckCircle2, Shield } from "lucide-react";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: () => void;
  onDownloadPNG: () => Promise<void>;
  periodLabel: string;
}

export function ExportReportModal({
  isOpen,
  onClose,
  onDownloadPDF,
  onDownloadPNG,
  periodLabel,
}: ExportReportModalProps) {
  const [downloadingPNG, setDownloadingPNG] = React.useState(false);
  const [pdfDownloaded, setPdfDownloaded] = React.useState(false);

  if (!isOpen) return null;

  const handlePDF = () => {
    onDownloadPDF();
    setPdfDownloaded(true);
    setTimeout(() => {
      setPdfDownloaded(false);
      onClose();
    }, 1200);
  };

  const handlePNG = async () => {
    setDownloadingPNG(true);
    try {
      await onDownloadPNG();
      onClose();
    } finally {
      setDownloadingPNG(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Export Progress Report</h3>
                <p className="text-xs text-slate-500">{periodLabel}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Option 1: PDF */}
            <div
              onClick={handlePDF}
              className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                  Comprehensive Report (PDF)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Full multi-page document with problem statistics, topic mastery tables, pattern analytics, and AI evaluation.
                </p>
              </div>
              {pdfDownloaded && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            </div>

            {/* Option 2: PNG */}
            <div
              onClick={downloadingPNG ? undefined : handlePNG}
              className={`p-4 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer flex items-start gap-3.5 group ${
                downloadingPNG ? "opacity-60 cursor-wait pointer-events-none" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                  Shareable Snapshot Card (PNG)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  High-resolution social card formatted for LinkedIn, GitHub repositories, and resumes.
                </p>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Exported documents strictly respect your privacy settings.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50">
            <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer text-xs font-semibold">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
