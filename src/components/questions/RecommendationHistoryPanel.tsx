"use client";

import * as React from "react";
import { History, CheckCircle2, XCircle, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuestionRecommendation } from "@/services/questionRecommendationTypes";

interface RecommendationHistoryPanelProps {
  questions: QuestionRecommendation[];
  onClearHistory: () => Promise<void>;
}

export function RecommendationHistoryPanel({
  questions,
  onClearHistory,
}: RecommendationHistoryPanelProps) {
  const [tab, setTab] = React.useState<"all" | "solved" | "skipped">("all");

  const historyItems = React.useMemo(() => {
    return questions.filter((q) => {
      if (q.status === "Pending") return false;
      if (tab === "solved") return q.status === "Solved";
      if (tab === "skipped") return q.status === "Skipped";
      return true;
    });
  }, [questions, tab]);

  return (
    <section className="recommendation-history border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recommendation History</h3>
            <p className="text-xs text-slate-500">View past interactions with recommended questions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-semibold">
            <button
              onClick={() => setTab("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTab("solved")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tab === "solved" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Solved
            </button>
            <button
              onClick={() => setTab("skipped")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tab === "skipped" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Skipped
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-red-500 hover:bg-red-50 hover:text-red-700 gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      {historyItems.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-xs font-medium text-slate-500">No history records found for this view.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {historyItems.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-xs"
            >
              <div className="flex items-center gap-3">
                {q.status === "Solved" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : q.status === "Skipped" ? (
                  <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-sky-500 shrink-0" />
                )}
                <div>
                  <a
                    href={q.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-900 hover:text-violet-600 hover:underline"
                  >
                    {q.title}
                  </a>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {q.platform} · {q.topic} · {q.difficulty}
                  </p>
                </div>
              </div>

              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  q.status === "Solved"
                    ? "bg-emerald-100 text-emerald-800"
                    : q.status === "Skipped"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {q.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
