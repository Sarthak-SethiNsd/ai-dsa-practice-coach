"use client";

import { VCSubmission } from "@/services/contest/virtualContestTypes";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface VirtualContestSubmissionPanelProps {
  submissions: VCSubmission[];
}

export function VirtualContestSubmissionPanel({
  submissions,
}: VirtualContestSubmissionPanelProps) {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <Clock className="w-6 h-6 mb-2 text-slate-300" />
        <span className="text-xs font-medium">No submissions recorded yet for this problem.</span>
        <span className="text-[11px] text-slate-400 mt-0.5">
          Write code and test locally before submitting.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
        Submissions ({submissions.length})
      </div>
      <div className="space-y-2">
        {submissions.map((sub, idx) => {
          const isAccepted = sub.verdict === "accepted";
          const isWA = sub.verdict === "wrong_answer";
          const isTLE = sub.verdict === "time_limit_exceeded";
          const isRuntime = sub.verdict === "runtime_error";

          return (
            <div
              key={sub.id || idx}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                isAccepted
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  : isWA
                  ? "bg-rose-50/80 border-rose-200 text-rose-950"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isAccepted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isWA ? (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-sans capitalize">
                      {isAccepted
                        ? "Accepted"
                        : isWA
                        ? "Wrong Answer"
                        : isTLE
                        ? "Time Limit Exceeded"
                        : isRuntime
                        ? "Runtime Error"
                        : "Evaluated Locally"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {sub.language}
                    </span>
                  </div>
                  {sub.notes && (
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      {sub.notes}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end text-[11px] text-slate-400 font-mono">
                <span>{new Date(sub.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                {sub.executionTimeMs && <span>{sub.executionTimeMs} ms</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
