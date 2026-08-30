"use client";

import { useState, useEffect } from "react";
import { VCProblemState } from "@/services/contest/virtualContestTypes";
import {
  Code2,
  CheckCircle2,
  XCircle,
  SkipForward,
  Send,
  Info,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface VirtualContestWorkspaceProps {
  problemState: VCProblemState;
  onCodeChange: (code: string, language: string) => void;
  onSubmit: (
    code: string,
    language: string,
    selfVerdict: "accepted" | "wrong_answer" | "not_submitted"
  ) => void;
  onMarkSolved: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
];

export function VirtualContestWorkspace({
  problemState,
  onCodeChange,
  onSubmit,
  onMarkSolved,
  onSkip,
  disabled = false,
}: VirtualContestWorkspaceProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    problemState.language || "javascript"
  );
  const [code, setCode] = useState(problemState.code || "");
  const [selfVerdict, setSelfVerdict] = useState<
    "accepted" | "wrong_answer" | "not_submitted"
  >("accepted");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizes local code editor buffer when active contest problem changes
    setCode(problemState.code);
    setSelectedLanguage(problemState.language || "javascript");
  }, [problemState.problem.id, problemState.code, problemState.language]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    const starter =
      (problemState.problem.starterCode as Record<string, string>)[lang] || "";
    setCode(starter);
    onCodeChange(starter, lang);
  };

  const handleResetStarter = () => {
    const starter =
      (problemState.problem.starterCode as Record<string, string>)[
        selectedLanguage
      ] || "";
    setCode(starter);
    onCodeChange(starter, selectedLanguage);
  };

  const isSolved = problemState.status === "solved";

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Code Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-300">
            Solution Editor
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => handleLanguageChange(l.value)}
                disabled={disabled || isSolved}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedLanguage === l.value
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetStarter}
            disabled={disabled || isSolved}
            title="Reset code template"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 bg-slate-950 p-2 sm:p-3 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onCodeChange(e.target.value, selectedLanguage);
          }}
          disabled={disabled || isSolved}
          placeholder="Write your contest solution here..."
          className="w-full h-full min-h-[260px] bg-transparent text-slate-100 font-mono text-xs sm:text-sm p-2 outline-none resize-none leading-relaxed selection:bg-sky-900/60 scrollbar-thin scrollbar-thumb-slate-800"
          spellCheck={false}
        />

        {isSolved && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex flex-col items-center justify-center text-emerald-400 gap-2 select-none">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
            <span className="font-bold text-sm">
              Problem {problemState.problem.contestLabel} Solved & Locked
            </span>
            <span className="text-xs text-slate-400">
              +{problemState.pointsEarned || problemState.problem.basePoints} points earned
            </span>
          </div>
        )}
      </div>

      {/* Submissions & Actions Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
        {/* Notice */}
        <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
          <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-700">Contest Verification:</strong> Write your solution, verify with problem constraints and sample test cases, then record your evaluated verdict.
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              disabled={disabled || isSolved}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-300 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip Problem
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Self Verdict Selector */}
            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5">
              <button
                onClick={() => setSelfVerdict("accepted")}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  selfVerdict === "accepted"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Pass / Accepted
              </button>
              <button
                onClick={() => setSelfVerdict("wrong_answer")}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  selfVerdict === "wrong_answer"
                    ? "bg-rose-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Wrong Answer
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={() =>
                onSubmit(code, selectedLanguage, selfVerdict)
              }
              disabled={disabled || isSolved || !code.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              Submit Attempt
            </button>

            {/* Quick 1-click Mark Solved */}
            <button
              onClick={onMarkSolved}
              disabled={disabled || isSolved}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Solved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
