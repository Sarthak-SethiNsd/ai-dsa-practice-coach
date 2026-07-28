import * as React from "react";
import { DashboardSummary } from "@/services/analytics/dashboardSummary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Layers, Info } from "lucide-react";

interface DashboardTopicBreakdownProps {
  summary: DashboardSummary;
}

export function DashboardTopicBreakdown({ summary }: DashboardTopicBreakdownProps) {
  const { topTopics } = summary;
  const maxCount = topTopics.length > 0 ? Math.max(...topTopics.map(t => t.count)) : 1;

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Skills</span>
          <CardTitle className="text-base font-extrabold text-slate-900">Topic Breakdown</CardTitle>
        </div>
        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1 flex-1 flex flex-col justify-between">
        {topTopics.length > 0 ? (
          <div className="space-y-3">
            {topTopics.map(({ topic, count }) => {
              const barWidth = Math.max(8, Math.round((count / maxCount) * 100));

              return (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 truncate">{topic}</span>
                    <span className="font-extrabold text-slate-500 tabular-nums ml-2">
                      {count} {count === 1 ? "q" : "qs"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No topic practice recorded yet.
          </div>
        )}

        {/* Descriptive Disclaimer Note */}
        <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium flex items-start gap-1">
          <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
          <span>Topic totals may exceed total solved problems because a single problem can belong to multiple topics.</span>
        </div>
      </CardContent>
    </Card>
  );
}
