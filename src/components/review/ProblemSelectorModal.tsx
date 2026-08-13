"use client";

import * as React from "react";
import { X, Search, Check, Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Problem, Platform, Difficulty } from "@/services/types";

interface SolvedProblemOption {
  id: string | number;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topic: string;
  url?: string;
  solutions?: Record<string, string>;
}

interface ProblemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (problem: Problem) => void;
  availableProblems: Problem[];
}

export function ProblemSelectorModal({
  isOpen,
  onClose,
  onSelectProblem,
  availableProblems,
}: ProblemSelectorModalProps) {
  const [search, setSearch] = React.useState("");
  const [platformFilter, setPlatformFilter] = React.useState<Platform | "All">("All");

  if (!isOpen) return null;

  const filtered = availableProblems.filter((p) => {
    if (platformFilter !== "All" && p.platform !== platformFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(q);
      const topicMatch = p.topics.some((t) => t.toLowerCase().includes(q));
      return titleMatch || topicMatch;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Select Solved Problem</h3>
            <p className="text-xs text-slate-500">
              Choose a problem from LeetCode or Codeforces to submit for AI review
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problem title or topic..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setPlatformFilter("All")}
              className={`px-3 py-1 rounded-lg transition-all ${
                platformFilter === "All" ? "bg-violet-100 text-violet-700" : "text-slate-500"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPlatformFilter("leetcode")}
              className={`px-3 py-1 rounded-lg transition-all ${
                platformFilter === "leetcode" ? "bg-amber-100 text-amber-700" : "text-slate-500"
              }`}
            >
              LeetCode
            </button>
            <button
              onClick={() => setPlatformFilter("codeforces")}
              className={`px-3 py-1 rounded-lg transition-all ${
                platformFilter === "codeforces" ? "bg-sky-100 text-sky-700" : "text-slate-500"
              }`}
            >
              Codeforces
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching problems found. Try another search query.
            </div>
          ) : (
            filtered.map((prob) => {
              const diffBadge =
                prob.difficulty === "Easy"
                  ? "bg-emerald-100 text-emerald-700"
                  : prob.difficulty === "Medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700";

              return (
                <div
                  key={`${prob.platform}_${prob.id}`}
                  onClick={() => {
                    onSelectProblem(prob);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-violet-300 bg-white hover:bg-violet-50/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-600">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-violet-700">
                          {prob.title}
                        </span>
                        <span className="capitalize text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {prob.platform}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${diffBadge}`}>
                          {prob.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Topics: {prob.topics.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {prob.url && (
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-slate-600"
                        title="View problem"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <span className="text-xs font-bold text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
