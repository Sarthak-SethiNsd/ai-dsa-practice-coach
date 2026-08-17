"use client";

import * as React from "react";
import { CompletedStudySession } from "@/services/study/studyTypes";
import { History, ChevronDown, Trash2 } from "lucide-react";

interface Props {
  sessions: CompletedStudySession[];
  onDeleteSession: (id: string) => void;
}

export function SessionHistory({ sessions, onDeleteSession }: Props) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    return `${mins} min${mins !== 1 ? "s" : ""}`;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-extrabold text-slate-900">
            Study Session History
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          {sessions.length} Recorded Session{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm space-y-2">
          <p>No study sessions completed yet.</p>
          <p className="text-xs text-slate-300">Complete your first Focus Mode session to start building your history!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isExpanded = expandedId === session.id;
            const topicsList = Object.keys(session.topicDistribution);

            return (
              <div
                key={session.id}
                className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-slate-200 transition-all"
              >
                {/* Main Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-900">
                          {session.date}
                        </span>
                        <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-xs font-bold capitalize">
                          {session.focusCategory.replace("_", " ")}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {session.durationMinutes}m duration
                        </span>
                      </div>
                      {topicsList.length > 0 && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                          Topics: {topicsList.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right stats */}
                  <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                    <span className="font-extrabold text-emerald-600">
                      {session.solvedCount}/{session.tasks.length} Solved ({session.completionRatePct}%)
                    </span>
                    <span className="text-slate-500 font-semibold">
                      Time: {formatSeconds(session.actualTimeSpentSeconds)}
                    </span>

                    <div onClick={(e) => e.stopPropagation()}>
                      {deleteConfirmId === session.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteSession(session.id);
                              setDeleteConfirmId(null);
                            }}
                            className="text-xs font-extrabold text-rose-600 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-xs font-bold text-slate-400 cursor-pointer ml-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(session.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer rounded"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-5 border-t border-slate-100 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Problems Completed in Session
                    </p>

                    <div className="space-y-2">
                      {session.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-extrabold text-slate-800">{task.title}</p>
                            <p className="text-slate-400 font-semibold">
                              {task.platform} · {task.difficulty} · {task.topics.join(", ")}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                              task.status === "solved"
                                ? "bg-emerald-100 text-emerald-700"
                                : task.status === "failed"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {session.coachSummary && (
                      <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-900 font-medium space-y-1">
                        <strong className="block font-bold">Coach Feedback</strong>
                        <p>{session.coachSummary.pacingFeedback}</p>
                        <p className="text-sky-700">{session.coachSummary.nextSessionRecommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
