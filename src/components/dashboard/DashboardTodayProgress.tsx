import * as React from "react";
import { DashboardSummary } from "@/services/analytics/dashboardSummary";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

interface DashboardTodayProgressProps {
  summary: DashboardSummary;
}

export function DashboardTodayProgress({ summary }: DashboardTodayProgressProps) {
  const { todayCompleted, todayTotal, todayRemaining, todayPct } = summary;

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Day</span>
          <CardTitle className="text-base font-extrabold text-slate-900">Today&apos;s Progress</CardTitle>
        </div>
        <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <Calendar className="w-4.5 h-4.5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 pt-1">
        <div className="flex items-baseline justify-between">
          <div className="space-y-0.5">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {todayCompleted}
            </span>
            <span className="text-slate-400 font-bold text-sm"> / {todayTotal} Completed</span>
          </div>
          <Badge variant={todayPct === 100 && todayTotal > 0 ? "success" : "primary"}>
            {todayPct === 100 && todayTotal > 0 ? "Daily Goal Met!" : `${todayRemaining} Remaining`}
          </Badge>
        </div>

        {/* Reusable ProgressBar */}
        <div className="space-y-1">
          <ProgressBar completed={todayCompleted} total={todayTotal} height={8} showLabel={true} />
        </div>

        <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {todayCompleted} Done
          </span>
          <span>•</span>
          <span>{todayRemaining} Pending</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          href="/practice"
          variant="primary"
          size="sm"
          className="w-full font-semibold cursor-pointer gap-1.5"
        >
          <span>Continue Today&apos;s Practice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
