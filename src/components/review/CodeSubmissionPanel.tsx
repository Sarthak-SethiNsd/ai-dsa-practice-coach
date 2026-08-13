"use client";

import * as React from "react";
import {
  FileCode,
  Upload,
  Zap,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReviewCategory } from "@/services/ai/aiTypes";

interface CodeSubmissionPanelProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFileName: string | null;
  validation: { isValid: boolean; error?: string };
  selectedCategory: ReviewCategory | null;
  onSelectCategory: (cat: ReviewCategory) => void;
  onSubmitReview: (cat: ReviewCategory) => void;
  isLoading: boolean;
  disabled: boolean;
}

const SUPPORTED_LANGUAGES = [
  "Java",
  "Python",
  "C++",
  "JavaScript",
  "TypeScript",
  "Go",
  "Rust",
];

export function CodeSubmissionPanel({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onFileUpload,
  uploadedFileName,
  validation,
  selectedCategory,
  onSelectCategory: _onSelectCategory,
  onSubmitReview,
  isLoading,
  disabled,
}: CodeSubmissionPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const lineCount = code.split("\n").length;
  const charCount = code.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-submission-panel border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-violet-600" />
          <h3 className="text-sm font-bold text-slate-900">Solution Code Editor</h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Language:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang} {lang === "Java" ? "(Primary)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploadedFileName ? uploadedFileName : "Upload File"}</span>
            <input
              type="file"
              onChange={onFileUpload}
              accept=".java,.py,.cpp,.cc,.js,.ts,.go,.rs,.txt"
              className="hidden"
            />
          </label>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Textarea with Line Numbers overlay feel */}
      <div className="relative rounded-xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden font-mono text-xs">
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder={`// Paste your ${language} solution here...`}
          rows={14}
          className="w-full p-4 bg-transparent text-slate-100 resize-none focus:outline-none leading-relaxed font-mono selection:bg-violet-500 selection:text-white"
          spellCheck={false}
        />
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400">
          <span>
            {lineCount} lines · {charCount} chars
          </span>
          <span className="text-violet-400 font-semibold">{language} Solution</span>
        </div>
      </div>

      {/* Validation Message */}
      {!validation.isValid && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{validation.error}</span>
        </div>
      )}

      {/* Trigger Submit Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Select standard review mode or category to generate AI breakdown.
        </p>

        <Button
          variant="primary"
          onClick={() => onSubmitReview(selectedCategory ?? "FULL_CODE_REVIEW")}
          disabled={disabled || !validation.isValid || isLoading}
          className="w-full sm:w-auto gap-2 shadow-md cursor-pointer"
        >
          {isLoading ? (
            <>
              <Zap className="w-4 h-4 animate-spin" />
              <span>Analyzing Solution...</span>
            </>
          ) : (
            <>
              <Code2 className="w-4 h-4" />
              <span>Generate Full AI Review</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
