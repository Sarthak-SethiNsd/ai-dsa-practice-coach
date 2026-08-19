"use client";

import * as React from "react";
import { ProgressSnapshotCardData } from "@/services/progress/progressTypes";
import { Button } from "@/components/ui/Button";
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  FileText,
  Code2,
  Sparkles,
} from "lucide-react";
import {
  generateLinkedInPost,
  generateMarkdownSnippet,
  generatePlainSummary,
} from "@/services/progress/progressExport";

type ShareTab = "linkedin" | "markdown" | "text";

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ProgressSnapshotCardData;
  onDownloadPNG: () => Promise<void>;
}

export function ShareReportModal({
  isOpen,
  onClose,
  card,
  onDownloadPNG,
}: ShareReportModalProps) {
  const [activeTab, setActiveTab] = React.useState<ShareTab>("linkedin");
  const [copied, setCopied] = React.useState(false);
  const [downloadingPNG, setDownloadingPNG] = React.useState(false);

  if (!isOpen) return null;

  const getContent = () => {
    switch (activeTab) {
      case "linkedin":
        return generateLinkedInPost(card);
      case "markdown":
        return generateMarkdownSnippet(card);
      case "text":
        return generatePlainSummary(card);
    }
  };

  const handleCopy = async () => {
    const text = getContent();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloadingPNG(true);
    try {
      await onDownloadPNG();
    } finally {
      setDownloadingPNG(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Share Progress Snapshot</h3>
                <p className="text-xs text-slate-500">Copy formatted text or download verified image card</p>
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
            {/* Format selection tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
              <button
                onClick={() => setActiveTab("linkedin")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "linkedin"
                    ? "bg-white text-sky-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                LinkedIn Post
              </button>
              <button
                onClick={() => setActiveTab("markdown")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "markdown"
                    ? "bg-white text-sky-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                GitHub / Markdown
              </button>
              <button
                onClick={() => setActiveTab("text")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "text"
                    ? "bg-white text-sky-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Plain Text
              </button>
            </div>

            {/* Preview Box */}
            <div className="relative">
              <textarea
                readOnly
                value={getContent()}
                rows={10}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Portable sharing notice */}
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-500 shrink-0" />
              Portable copy format — ready for direct pasting into social posts or portfolio readmes.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              disabled={downloadingPNG}
              className="gap-1.5 cursor-pointer text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingPNG ? "Generating..." : "Download Card (PNG)"}
            </Button>

            <Button
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 cursor-pointer text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied to Clipboard!" : "Copy Snippet"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
