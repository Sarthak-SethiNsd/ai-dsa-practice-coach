"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  heightClass?: string;
}

export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  heightClass = "h-64",
}: ChartCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Chart Canvas Wrapper */}
      <div className={`w-full ${heightClass} relative flex items-center justify-center`}>
        {children}
      </div>
    </div>
  );
}
