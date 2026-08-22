"use client";

import { VCHistoryRecord } from "@/services/contest/virtualContestTypes";
import {
  Trophy,
  Clock,
  CheckCircle2,
  Calendar,
  Eye,
  FileText,
  Award,
} from "lucide-react";

interface VirtualContestHistoryProps {
  history: VCHistoryRecord[];
  onViewReport: (reportId: string) => void;
}

export function VirtualContestHistory({
  history,
  onViewReport,
}: VirtualContestHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
        <Trophy className="w-10 h-10 mb-3 text-slate-300" />
        <h3 className="text-sm font-bold text-slate-700">No Contest History Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Complete a virtual contest simulation to view historical telemetry, solve rates, and AI post-contest debriefs.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Virtual Contest History</h3>
          <span className="text-xs text-slate-500">
            {history.length} simulation records tracked
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3">Contest</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Solved</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Accuracy</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-5 py-3 text-right">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {history.map((rec) => {
              const isLeetCode = rec.platform === "leetcode";
              const isCodeforces = rec.platform === "codeforces";

              return (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {rec.contestType} Drill
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{rec.date}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isLeetCode
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : isCodeforces
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-purple-50 text-purple-800 border-purple-200"
                      }`}
                    >
                      {rec.platform}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-bold font-mono text-emerald-700">
                      {rec.problemsSolved} / {rec.problemCount}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-mono font-bold text-slate-900">
                    {rec.score} pts
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-mono">{rec.accuracy}%</span>
                  </td>

                  <td className="px-4 py-4 text-slate-500">
                    {rec.durationMinutes}m
                  </td>

                  <td className="px-5 py-4 text-right">
                    {rec.reportId ? (
                      <button
                        onClick={() => onViewReport(rec.reportId!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
