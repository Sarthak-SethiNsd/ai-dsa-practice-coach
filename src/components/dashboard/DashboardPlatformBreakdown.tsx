import * as React from "react";
import { DashboardSummary } from "@/services/analytics/dashboardSummary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Code2, Terminal } from "lucide-react";

interface DashboardPlatformBreakdownProps {
  summary: DashboardSummary;
}

export function DashboardPlatformBreakdown({ summary }: DashboardPlatformBreakdownProps) {
  const leetcode = summary.platformBreakdown.find(p => p.platform === "leetcode") || {
    completed: 0,
    total: 0,
    pct: 0,
  };

  const codeforces = summary.platformBreakdown.find(p => p.platform === "codeforces") || {
    completed: 0,
    total: 0,
    pct: 0,
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="pb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Distribution</span>
        <CardTitle className="text-base font-extrabold text-slate-900">Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-1">
        {/* LeetCode */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">LeetCode</span>
            </div>
            <span className="text-xs font-extrabold text-slate-700 tabular-nums">
              {leetcode.completed} / {leetcode.total} Solved
            </span>
          </div>
          <ProgressBar completed={leetcode.completed} total={leetcode.total} height={6} showLabel={true} />
        </div>

        {/* Codeforces */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Codeforces</span>
            </div>
            <span className="text-xs font-extrabold text-slate-700 tabular-nums">
              {codeforces.completed} / {codeforces.total} Solved
            </span>
          </div>
          <ProgressBar completed={codeforces.completed} total={codeforces.total} height={6} showLabel={true} />
        </div>
      </CardContent>
    </Card>
  );
}
