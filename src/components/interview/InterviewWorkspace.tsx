"use client";

import { Code2, CheckCircle2, RotateCcw } from "lucide-react";
import { InterviewProblem } from "@/services/interview/interviewTypes";

interface InterviewWorkspaceProps {
  problem: InterviewProblem;
  code: string;
  selectedLanguage: string;
  solutionSubmitted: boolean;
  onCodeChange: (code: string, language?: string) => void;
  onSubmitSolution: () => void;
}

const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python 3" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
];

export function InterviewWorkspace({
  problem,
  code,
  selectedLanguage,
  solutionSubmitted,
  onCodeChange,
  onSubmitSolution,
}: InterviewWorkspaceProps) {
  const handleReset = () => {
    const starter = problem.starterCode[selectedLanguage] || "// Write code here\n";
    onCodeChange(starter, selectedLanguage);
  };

  const handleLanguageChange = (lang: string) => {
    const starter = problem.starterCode[lang] || "// Write code here\n";
    onCodeChange(starter, lang);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
      {/* Code Editor Header */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-700">Code Workspace</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Reset Template */}
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
            title="Reset to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="flex-1 relative bg-slate-900 text-slate-100 p-3 font-mono text-xs overflow-hidden flex flex-col">
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value, selectedLanguage)}
          placeholder="// Type your implementation here..."
          spellCheck={false}
          className="w-full flex-1 bg-transparent text-slate-100 placeholder-slate-500 font-mono text-xs leading-relaxed resize-none focus:outline-none scrollbar-thin"
        />
      </div>

      {/* Submit Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {code.split("\n").length} lines · {solutionSubmitted ? "Solution submitted" : "Draft in progress"}
        </span>

        <button
          type="button"
          onClick={onSubmitSolution}
          className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs ${
            solutionSubmitted
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {solutionSubmitted ? "Solution Submitted ✓" : "Submit Implementation"}
        </button>
      </div>
    </div>
  );
}
