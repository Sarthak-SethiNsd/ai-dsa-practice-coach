"use client";

import * as React from "react";
import { RevisionCalendarDay, RevisionItem } from "@/services/revision/revisionTypes";
import { Calendar as CalendarIcon, X } from "lucide-react";

interface Props {
  calendarDays: RevisionCalendarDay[];
  onSelectItem: (item: RevisionItem) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RevisionCalendar({ calendarDays, onSelectItem }: Props) {
  const [selectedDay, setSelectedDay] = React.useState<RevisionCalendarDay | null>(null);

  const currentDate = new Date();
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-extrabold text-slate-900">{monthName}</h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Due
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Overdue
            </span>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            const hasDue = day.dueCount > 0;
            const hasCompleted = day.completedCount > 0;
            const hasMissed = day.missedCount > 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`min-h-[80px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  day.isToday
                    ? "bg-sky-50/70 border-sky-300 ring-2 ring-sky-200"
                    : day.isCurrentMonth
                    ? "bg-white border-slate-100 hover:border-slate-300 hover:shadow-2xs"
                    : "bg-slate-50/40 border-transparent opacity-40"
                }`}
              >
                <span
                  className={`text-xs font-extrabold ${
                    day.isToday ? "text-sky-700" : "text-slate-700"
                  }`}
                >
                  {day.dayOfMonth}
                </span>

                {/* Badges */}
                <div className="space-y-1">
                  {hasMissed && (
                    <div className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold truncate">
                      {day.missedCount} overdue
                    </div>
                  )}
                  {hasDue && (
                    <div className="px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded-md text-[10px] font-bold truncate">
                      {day.dueCount} due
                    </div>
                  )}
                  {hasCompleted && (
                    <div className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold truncate">
                      {day.completedCount} done
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Drawer Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Scheduled Revisions
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedDay.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedDay.items.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  No revisions scheduled for this date.
                </p>
              ) : (
                selectedDay.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {item.problemTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {item.platform} · {item.difficulty}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectItem(item);
                        setSelectedDay(null);
                      }}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Revise
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
