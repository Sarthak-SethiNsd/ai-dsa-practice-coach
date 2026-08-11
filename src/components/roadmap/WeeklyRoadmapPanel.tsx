"use client";

import * as React from "react";
import { CalendarDays, BookOpen, ChevronDown, BarChart3 } from "lucide-react";
import { WeeklyRoadmap, PracticeTask } from "@/services/roadmapTypes";
import { TaskRow } from "./DailyMissionPanel";

interface WeeklyRoadmapPanelProps {
  weeklyRoadmap: WeeklyRoadmap;
  completedTaskIds: Set<string>;
  onComplete: (taskId: string) => Promise<void>;
  onIncomplete: (taskId: string) => Promise<void>;
}

export function WeeklyRoadmapPanel({
  weeklyRoadmap,
  completedTaskIds,
  onComplete,
  onIncomplete,
}: WeeklyRoadmapPanelProps) {
  const [expandedTopics, setExpandedTopics] = React.useState<Set<string>>(new Set());

  const completionPct =
    weeklyRoadmap.completionTarget > 0
      ? Math.round((weeklyRoadmap.completedCount / weeklyRoadmap.completionTarget) * 100)
      : 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  // Group tasks by topic
  const tasksByTopic = React.useMemo(() => {
    const map = new Map<string, PracticeTask[]>();
    weeklyRoadmap.assignedTasks.forEach((t) => {
      if (!map.has(t.topic)) map.set(t.topic, []);
      map.get(t.topic)!.push(t);
    });
    return map;
  }, [weeklyRoadmap.assignedTasks]);

  return (
    <section className="roadmap-weekly">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Weekly Roadmap</h3>
            <p className="text-xs text-slate-500">
              {formatDate(weeklyRoadmap.weekStart)} – {formatDate(weeklyRoadmap.weekEnd)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            completionPct >= 80
              ? "bg-emerald-100 text-emerald-700"
              : completionPct >= 40
              ? "bg-sky-100 text-sky-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {weeklyRoadmap.completedCount}/{weeklyRoadmap.completionTarget} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Weekly progress</span>
          <span className="font-semibold text-slate-700">{completionPct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-emerald-50 rounded-xl">
          <p className="text-lg font-bold text-emerald-600">{weeklyRoadmap.difficultyMix.easy}</p>
          <p className="text-[11px] text-slate-500 font-medium">Easy</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <p className="text-lg font-bold text-amber-600">{weeklyRoadmap.difficultyMix.medium}</p>
          <p className="text-[11px] text-slate-500 font-medium">Medium</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-xl">
          <p className="text-lg font-bold text-red-500">{weeklyRoadmap.difficultyMix.hard}</p>
          <p className="text-[11px] text-slate-500 font-medium">Hard</p>
        </div>
      </div>

      {/* Topic target chips */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Topic Targets
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {weeklyRoadmap.topicTargets.map((target) => {
            const pct =
              target.targetCount > 0
                ? Math.round((target.completedCount / target.targetCount) * 100)
                : 0;
            const masteryColor =
              target.mastery === "Mastered"
                ? "text-emerald-600"
                : target.mastery === "Proficient"
                ? "text-sky-600"
                : target.mastery === "Developing"
                ? "text-amber-600"
                : "text-red-500";

            return (
              <div key={target.topic} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-32 truncate">{target.topic}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-14 text-right">
                  {target.completedCount}/{target.targetCount}
                </span>
                <span className={`text-[11px] font-semibold w-28 text-right ${masteryColor}`}>
                  {target.mastery}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collapsible topic task lists */}
      <div className="flex flex-col gap-3">
        {weeklyRoadmap.priorityTopics.map((topic) => {
          const tasks = tasksByTopic.get(topic) ?? [];
          const completed = tasks.filter((t) => completedTaskIds.has(t.id)).length;
          const isExpanded = expandedTopics.has(topic);

          return (
            <div key={topic} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => toggleTopic(topic)}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-semibold text-slate-800">{topic}</span>
                  <span className="text-xs text-slate-500">
                    ({completed}/{tasks.length})
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="p-3 flex flex-col gap-2">
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isCompleted={completedTaskIds.has(task.id)}
                      onComplete={onComplete}
                      onIncomplete={onIncomplete}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Est. study hours */}
      <p className="text-xs text-slate-500 mt-4 text-right">
        Est. study time this week:{" "}
        <span className="font-semibold text-slate-700">{weeklyRoadmap.estimatedStudyHours} hrs</span>
      </p>
    </section>
  );
}
