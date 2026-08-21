"use client";

import { History, Eye, CheckCircle2, Clock, HelpCircle, Trophy } from "lucide-react";
import { InterviewHistoryRecord } from "@/services/interview/interviewTypes";

interface InterviewHistoryProps {
  history: InterviewHistoryRecord[];
  onViewReport: (id: string) => void;
}

const TIER_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  Advanced: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Strong: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Interview Ready": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  Developing: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Beginner: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
};

export function InterviewHistory({
  history,
  onViewReport,
}: InterviewHistoryProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-sky-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Interview History</h3>
            <p className="text-xs text-slate-400">Completed mock technical interviews</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
          {history.length} logged
        </span>
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No mock interviews logged yet. Start your first mock interview to track your readiness.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {history.map((record) => {
            const tierStyle = TIER_BADGES[record.readinessTier] || TIER_BADGES.Developing;

            return (
              <div
                key={record.id}
                className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4 min-w-[580px]"
              >
                {/* Left info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800">
                      {record.interviewType}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100">
                      {record.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100">
                      {record.style} Style
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                    >
                      {record.readinessTier}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{record.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.actualDurationMinutes}m
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {record.hintCount} hint{record.hintCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Right score & action */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-slate-800">
                      {record.overallScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/100</span>
                  </div>

                  <button
                    onClick={() => onViewReport(record.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs border border-sky-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
