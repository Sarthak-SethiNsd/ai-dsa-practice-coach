import * as React from "react";
import { DashboardSummary } from "@/services/analytics/dashboardSummary";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { parseEstimatedMinutes, formatTotalTime, completionPct } from "@/services/analytics/analyticsUtils";
import { History, CalendarDays, ArrowRight } from "lucide-react";

interface DashboardRecentSessionsProps {
  summary: DashboardSummary;
}

function formatSessionDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function DashboardRecentSessions({ summary }: DashboardRecentSessionsProps) {
  const { recentSessions } = summary;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">History Log</span>
          <CardTitle className="text-base font-extrabold text-slate-900">Recent Practice Sessions</CardTitle>
        </div>
        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
          <History className="w-4 h-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        {recentSessions.length > 0 ? (
          recentSessions.map(session => {
            const pct = completionPct(session);
            const totalMinutes = session.questions.reduce(
              (acc, q) => acc + parseEstimatedMinutes(q.estimated),
              0
            );
            const formattedTime = formatTotalTime(totalMinutes);

            return (
              <div
                key={session.sessionId}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Date & Meta */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">
                      {formatSessionDate(session.date)}
                    </span>
                    <Badge variant={pct === 100 ? "success" : "neutral"} className="text-[10px]">
                      {session.metadata.completedCount} / {session.metadata.totalQuestions} Questions
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Est. Time: {formattedTime} • Topics: {session.metadata.topicsCovered.slice(0, 3).join(", ")}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full sm:w-44 shrink-0">
                  <ProgressBar
                    completed={session.metadata.completedCount}
                    total={session.metadata.totalQuestions}
                    height={6}
                    showLabel={true}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            No recent practice sessions recorded.
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          href="/history"
          variant="secondary"
          size="sm"
          className="w-full font-semibold cursor-pointer gap-1.5"
        >
          <span>Open Practice History</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
