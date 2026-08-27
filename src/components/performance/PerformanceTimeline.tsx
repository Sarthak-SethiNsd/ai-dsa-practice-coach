"use client";

import * as React from "react";
import { PerformanceTimelineEvent } from "@/services/performance/performanceTypes";

interface PerformanceTimelineProps {
  timeline: PerformanceTimelineEvent[];
}

export function PerformanceTimeline({ timeline }: PerformanceTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center select-none shadow-xs">
        <p className="text-3xl mb-2">📜</p>
        <p className="text-sm font-bold text-slate-800">No Timeline Events Recorded Yet</p>
        <p className="text-xs text-slate-500 mt-1">Complete practice sessions, virtual contests, or mock interviews to populate your timeline.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      <div className="pb-4 border-b border-slate-100 mb-6">
        <h3 className="text-base font-extrabold text-slate-900">Longitudinal Performance Timeline</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Chronological milestone log of verified skill breakthroughs, weakness detections, and session outcomes
        </p>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
        {timeline.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline Icon Node */}
            <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-white border-2 border-slate-200 group-hover:border-sky-500 flex items-center justify-center text-sm shadow-xs transition-colors">
              {event.icon}
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-extrabold text-slate-900">{event.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 tabular-nums">{event.date}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
