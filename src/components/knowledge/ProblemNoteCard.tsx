"use client";

import * as React from "react";
import { ProblemNote, MISTAKE_CATEGORIES } from "@/services/knowledge/knowledgeTypes";
import { TagBadge } from "./ProblemTagSelector";
import { Button } from "@/components/ui/Button";
import {
  Lightbulb,
  AlertTriangle,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

interface ProblemNoteCardProps {
  note: ProblemNote;
  onEdit?: (note: ProblemNote) => void;
  onDelete?: (id: string) => void;
  onViewWorkspace?: (note: ProblemNote) => void;
  compact?: boolean;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

const REVISION_STATUS_STYLE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  mastered: { label: "Mastered", color: "text-emerald-600", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress", color: "text-sky-600", icon: <Clock className="w-3.5 h-3.5" /> },
  revisit: { label: "Needs Revisit", color: "text-amber-600", icon: <RotateCcw className="w-3.5 h-3.5" /> },
  forgotten: { label: "Forgotten", color: "text-red-500", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  not_started: { label: "Not Started", color: "text-slate-500", icon: <Clock className="w-3.5 h-3.5" /> },
};

export function ProblemNoteCard({
  note,
  onEdit,
  onDelete,
  onViewWorkspace,
  compact = false,
}: ProblemNoteCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const statusInfo = REVISION_STATUS_STYLE[note.revisionStatus] ?? REVISION_STATUS_STYLE.not_started;
  const mistakeLabel = note.mistakeCategory
    ? MISTAKE_CATEGORIES.find((m) => m.id === note.mistakeCategory)?.label
    : null;

  const updatedAt = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all duration-200 overflow-hidden ${
        compact ? "p-3" : "p-5"
      }`}
    >
      {/* Left accent bar based on revision status */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
          note.revisionStatus === "mastered"
            ? "bg-emerald-400"
            : note.revisionStatus === "revisit" || note.revisionStatus === "forgotten"
            ? "bg-amber-400"
            : note.revisionStatus === "in_progress"
            ? "bg-sky-400"
            : "bg-slate-200"
        }`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 pl-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 truncate">{note.problemTitle}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLE[note.difficulty] ?? "bg-slate-100 text-slate-600"}`}>
              {note.difficulty}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
              {note.platform}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{note.topic}</p>
        </div>

        {/* Status + Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`flex items-center gap-1 text-xs font-semibold ${statusInfo.color}`}>
            {statusInfo.icon}
            {!compact && <span>{statusInfo.label}</span>}
          </span>

          {/* Actions menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 min-w-36">
                {onViewWorkspace && (
                  <button
                    onClick={() => { onViewWorkspace(note); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" /> View Workspace
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => { onEdit(note); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Note
                  </button>
                )}
                {note.problemUrl && (
                  <a
                    href={note.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setShowMenu(false)}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Problem
                  </a>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(note.id); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      {note.keyInsight && !compact && (
        <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 font-medium leading-relaxed line-clamp-2">
            {note.keyInsight}
          </p>
        </div>
      )}

      {/* Mistake capture signal */}
      {note.mistakeCategory && !compact && (
        <div className="flex gap-2 p-2.5 rounded-xl bg-red-50 border border-red-100 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700">{mistakeLabel}</p>
            {note.mistakeMade && (
              <p className="text-xs text-red-600 font-medium mt-0.5 line-clamp-1">{note.mistakeMade}</p>
            )}
          </div>
        </div>
      )}

      {/* Pattern badge */}
      {note.patternName && (
        <div className="flex items-center gap-1.5 mb-3">
          <Layers className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
            {note.patternName}
          </span>
        </div>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {note.tags.slice(0, compact ? 3 : 6).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {note.tags.length > (compact ? 3 : 6) && (
            <span className="text-xs text-slate-400 font-medium">+{note.tags.length - (compact ? 3 : 6)}</span>
          )}
        </div>
      )}

      {/* Complexity row */}
      {(note.timeComplexity || note.spaceComplexity) && !compact && (
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
          {note.timeComplexity && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Time: <code className="font-bold text-slate-700">{note.timeComplexity}</code>
            </span>
          )}
          {note.spaceComplexity && (
            <span className="flex items-center gap-1">
              Space: <code className="font-bold text-slate-700">{note.spaceComplexity}</code>
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <span className="text-xs text-slate-400 font-medium">Updated {updatedAt}</span>
        {onViewWorkspace && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewWorkspace(note)}
            className="text-xs gap-1 text-slate-500 hover:text-sky-600 cursor-pointer"
          >
            View Details
          </Button>
        )}
      </div>
    </div>
  );
}
