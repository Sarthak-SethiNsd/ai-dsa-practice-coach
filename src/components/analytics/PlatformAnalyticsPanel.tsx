"use client";

import * as React from "react";
import { PlatformAnalyticsDetail } from "@/services/analytics/performanceAnalyticsTypes";
import { Platform } from "@/services/types";
import { Layers, TrendingUp } from "lucide-react";

interface PlatformAnalyticsPanelProps {
  platforms: Record<Platform, PlatformAnalyticsDetail>;
}

export function PlatformAnalyticsPanel({ platforms }: PlatformAnalyticsPanelProps) {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" /> Platform Deep Dive (LeetCode & Codeforces)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Comparative performance analytics, rating progression, difficulty breakdown, and problem topic activity per platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(["leetcode", "codeforces"] as Platform[]).map((pKey) => {
          const p = platforms[pKey];
          const isLC = pKey === "leetcode";
          const theme = isLC
            ? { badgeBg: "bg-amber-50 text-amber-700 border-amber-200", barColor: "bg-amber-500", textAccent: "text-amber-600" }
            : { badgeBg: "bg-sky-50 text-sky-700 border-sky-200", barColor: "bg-sky-500", textAccent: "text-sky-600" };

          const totalDiff = p.difficultyDistribution.Easy + p.difficultyDistribution.Medium + p.difficultyDistribution.Hard;

          return (
            <div key={pKey} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
              {/* Platform Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border ${theme.badgeBg}`}>
                    {isLC ? "LC" : "CF"}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Platform Analytics</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xl font-black ${theme.textAccent}`}>{p.solvedCount}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Solved</p>
                </div>
              </div>

              {/* Difficulty Distribution Bars */}
              <div className="space-y-3">
                <p className="text-xs font-extrabold text-slate-700">Difficulty Distribution</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 space-y-0.5">
                    <p className="text-sm font-black text-emerald-700">{p.difficultyDistribution.Easy}</p>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">Easy</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 space-y-0.5">
                    <p className="text-sm font-black text-amber-700">{p.difficultyDistribution.Medium}</p>
                    <p className="text-[10px] font-bold text-amber-800 uppercase">Medium</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 space-y-0.5">
                    <p className="text-sm font-black text-rose-700">{p.difficultyDistribution.Hard}</p>
                    <p className="text-[10px] font-bold text-rose-800 uppercase">Hard</p>
                  </div>
                </div>

                {/* Combined Progress Bar */}
                {totalDiff > 0 && (
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(p.difficultyDistribution.Easy / totalDiff) * 100}%` }}
                      title={`Easy: ${p.difficultyDistribution.Easy}`}
                    />
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${(p.difficultyDistribution.Medium / totalDiff) * 100}%` }}
                      title={`Medium: ${p.difficultyDistribution.Medium}`}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${(p.difficultyDistribution.Hard / totalDiff) * 100}%` }}
                      title={`Hard: ${p.difficultyDistribution.Hard}`}
                    />
                  </div>
                )}
              </div>

              {/* Rating Progression Estimation */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-sky-600" /> Estimated Rating</span>
                  <span className={theme.textAccent}>
                    {p.estimatedRatingProgression.length > 0 ? p.estimatedRatingProgression[p.estimatedRatingProgression.length - 1].rating : "1400"}
                  </span>
                </div>
              </div>

              {/* Top Practiced Topics */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-extrabold text-slate-700">Top Practiced Topics</p>
                {p.mostPracticedTopics.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.mostPracticedTopics.map((t) => (
                      <span key={t.topic} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                        {t.topic} ({t.count})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">No topics recorded yet for {p.name}.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
