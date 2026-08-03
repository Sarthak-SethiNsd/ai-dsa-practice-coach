"use client";

import * as React from "react";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";
import { exportPDF, exportMarkdown, exportText } from "@/services/reviewExportService";
import { Download, FileText, FileType, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportMenuProps {
  /** The full review entry to export */
  entry: ReviewHistoryEntry;
  /** Called with an error message if export fails */
  onError: (message: string) => void;
  className?: string;
}

type ExportFormat = "pdf" | "markdown" | "text";

// ─── Component ────────────────────────────────────────────────────────────────

export function ExportMenu({ entry, onError, className = "" }: ExportMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleExport = (format: ExportFormat) => {
    setOpen(false);
    try {
      if (format === "pdf")      exportPDF(entry);
      else if (format === "markdown") exportMarkdown(entry);
      else                       exportText(entry);
    } catch (err) {
      console.error("[ExportMenu] Export failed:", err);
      onError("Export failed. Please try again.");
    }
  };

  const menuItems: { format: ExportFormat; label: string; ext: string; icon: React.ElementType }[] = [
    { format: "pdf",      label: "Export as PDF",      ext: ".pdf", icon: FileType },
    { format: "markdown", label: "Export as Markdown",  ext: ".md",  icon: FileText },
    { format: "text",     label: "Export as Text",      ext: ".txt", icon: FileText },
  ];

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-sky-400 hover:text-sky-700 hover:bg-sky-50 transition-all cursor-pointer shadow-sm select-none"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          role="menu"
        >
          {menuItems.map(({ format, label, ext, icon: Icon }) => (
            <button
              key={format}
              role="menuitem"
              type="button"
              onClick={() => handleExport(format)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer text-left"
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>{label}</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">{ext}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
