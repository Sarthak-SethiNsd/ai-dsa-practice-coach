import * as React from "react";

interface ProgressBarProps {
  /** Number of completed items. */
  completed: number;
  /** Total number of items. */
  total: number;
  /** Optional additional class names for the outer wrapper. */
  className?: string;
  /** Height of the bar track in pixels. Defaults to 6. */
  height?: number;
  /** Show percentage label beside the bar. Defaults to true. */
  showLabel?: boolean;
}

/**
 * Reusable linear progress bar for visualising completed/total ratios.
 * Used by Practice History session cards and the Dashboard.
 *
 * @example
 * <ProgressBar completed={7} total={10} />
 */
export function ProgressBar({
  completed,
  total,
  className = "",
  height = 6,
  showLabel = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const barColor =
    percentage >= 80
      ? "bg-emerald-500"
      : percentage >= 50
      ? "bg-sky-500"
      : percentage > 0
      ? "bg-amber-400"
      : "bg-slate-200";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Track */}
      <div
        className="flex-1 bg-slate-100 rounded-full overflow-hidden"
        style={{ height }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percentage}% complete`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-xs font-bold text-slate-500 tabular-nums w-9 text-right shrink-0">
          {percentage}%
        </span>
      )}
    </div>
  );
}
