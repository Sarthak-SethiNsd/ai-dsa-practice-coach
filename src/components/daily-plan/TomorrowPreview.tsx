"use client";

import { Calendar, RotateCcw, Trophy, Map } from "lucide-react";
import { TomorrowPreviewData } from "@/services/dailyPlan/dailyPlanTypes";

interface TomorrowPreviewProps {
  data: TomorrowPreviewData;
}

export function TomorrowPreview({ data }: TomorrowPreviewProps) {
  const hasSomething =
    data.srsItemsDue > 0 ||
    data.srsItemsOverdue > 0 ||
    data.upcomingRoadmapStep ||
    data.upcomingContest;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-sky-500" />
        <h2 className="text-sm font-semibold text-slate-700">Tomorrow&apos;s Preview</h2>
        {data.estimatedMinutes > 0 && (
          <span className="ml-auto text-xs text-slate-400">
            ~{data.estimatedMinutes}m estimated
          </span>
        )}
      </div>

      {!hasSomething ? (
        <p className="text-sm text-slate-400">No upcoming SRS items or milestones for tomorrow.</p>
      ) : (
        <div className="space-y-2.5">
          {/* SRS due */}
          {(data.srsItemsDue > 0 || data.srsItemsOverdue > 0) && (
            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-700 font-medium">
                  {data.srsItemsDue} SRS item{data.srsItemsDue !== 1 ? "s" : ""} due
                  {data.srsItemsOverdue > 0 && (
                    <span className="text-red-600 ml-1.5">
                      + {data.srsItemsOverdue} overdue
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">Spaced repetition revisions</p>
              </div>
            </div>
          )}

          {/* Roadmap step */}
          {data.upcomingRoadmapStep && (
            <div className="flex items-start gap-2.5">
              <Map className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-700 font-medium line-clamp-1">
                  {data.upcomingRoadmapStep}
                </p>
                <p className="text-xs text-slate-400">Next roadmap milestone</p>
              </div>
            </div>
          )}

          {/* Upcoming contest */}
          {data.upcomingContest && (
            <div className="flex items-start gap-2.5">
              <Trophy className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-700 font-medium">
                  {data.upcomingContest.name}
                </p>
                <p className="text-xs text-slate-400">
                  In {data.upcomingContest.daysUntil} day
                  {data.upcomingContest.daysUntil !== 1 ? "s" : ""} — {data.upcomingContest.date}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
