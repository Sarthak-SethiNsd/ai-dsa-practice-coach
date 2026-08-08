"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBgColor = "bg-sky-50",
  iconTextColor = "text-sky-600",
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-xl ${iconBgColor} ${iconTextColor} flex items-center justify-center font-bold shrink-0`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>

        {subtext && (
          <p className="text-[11px] text-slate-400 font-medium truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
