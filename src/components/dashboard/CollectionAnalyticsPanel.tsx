"use client";

import * as React from "react";
import { CollectionAnalytics } from "@/services/dashboardTypes";
import { Folder, Award, Layers } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface CollectionAnalyticsPanelProps {
  analytics: CollectionAnalytics;
}

export function CollectionAnalyticsPanel({
  analytics,
}: CollectionAnalyticsPanelProps) {
  if (analytics.collections.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Saved Collection Analytics
            </h3>
            <p className="text-[11px] text-slate-400">
              No saved collections created yet. Organize reviews in History to see stats here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Saved Collection Analytics
            </h3>
            <p className="text-[11px] text-slate-400">
              Performance and activity breakdown per review collection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {analytics.mostActiveCollection && (
            <Badge variant="neutral" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200">
              <Layers className="w-3 h-3 mr-1" /> Most Active: {analytics.mostActiveCollection}
            </Badge>
          )}
          {analytics.bestPerformingCollection && (
            <Badge variant="neutral" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
              <Award className="w-3 h-3 mr-1" /> Top Rated: {analytics.bestPerformingCollection}
            </Badge>
          )}
        </div>
      </div>

      {/* Collection Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Collection Name</th>
              <th className="py-2.5 px-3">Reviews</th>
              <th className="py-2.5 px-3">Avg AI Score</th>
              <th className="py-2.5 px-3">Avg Tokens</th>
              <th className="py-2.5 px-3">Languages</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {analytics.collections.map((col) => (
              <tr key={col.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span>{col.name}</span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-800">
                  {col.reviewCount}
                </td>
                <td className="py-3 px-3">
                  <span className="font-extrabold text-sky-600">
                    {col.avgScore} pts
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  {col.avgTokens.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-slate-500">
                  {col.languages.join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
