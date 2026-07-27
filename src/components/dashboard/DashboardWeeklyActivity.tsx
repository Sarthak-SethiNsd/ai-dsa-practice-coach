import * as React from "react";
import { DashboardSummary } from "@/services/analytics/dashboardSummary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CheckCircle, Activity, Minus } from "lucide-react";

interface DashboardWeeklyActivityProps {
  summary: DashboardSummary;
}

export function DashboardWeeklyActivity({ summary }: DashboardWeeklyActivityProps) {
  const { weeklyActivity } = summary;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">7-Day Consistency</span>
          <CardTitle className="text-base font-extrabold text-slate-900">Weekly Activity</CardTitle>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Activity className="w-4 h-4" />
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {weeklyActivity.map(day => {
            const barHeight = Math.max(12, day.pct);
            const isToday = day.date === summary.weeklyActivity[summary.weeklyActivity.length - 1]?.date;

            return (
              <div
                key={day.date}
                className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                  isToday
                    ? "bg-sky-50/40 border-sky-200"
                    : "bg-slate-50/50 border-slate-100"
                }`}
              >
                {/* Header info */}
                <div className="text-center space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 block">{day.label}</span>
                  <span className="text-[10px] font-medium text-slate-400 block">{day.dayNum}</span>
                </div>

                {/* Pure CSS Vertical Bar Meter */}
                <div className="w-full h-20 bg-slate-100 rounded-full my-3 flex flex-col justify-end p-1 overflow-hidden relative">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${
                      day.goalMet
                        ? "bg-emerald-500"
                        : day.completed > 0
                        ? "bg-sky-500"
                        : "bg-slate-200"
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>

                {/* Question count & pct */}
                <div className="text-center space-y-1">
                  <span className="text-xs font-extrabold text-slate-800 block tabular-nums">
                    {day.completed}/{day.total}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 block tabular-nums">
                    {day.pct}%
                  </span>

                  {/* Goal Met Indicator */}
                  <div className="flex justify-center pt-0.5">
                    {day.goalMet ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : day.completed > 0 ? (
                      <CheckCircle className="w-3.5 h-3.5 text-sky-400 opacity-60" />
                    ) : (
                      <Minus className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
