"use client";

import * as React from "react";
import { ProblemNote, MISTAKE_CATEGORIES } from "@/services/knowledge/knowledgeTypes";
import { TagBadge } from "./ProblemTagSelector";
import { Button } from "@/components/ui/Button";
import {
  X,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Clock,
  Code2,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Layers,
  RefreshCw,
} from "lucide-react";
import { NoteRevisionStatus } from "@/services/knowledge/knowledgeTypes";

const REVISION_STATUS_OPTIONS: { id: NoteRevisionStatus; label: string; color: string }[] = [
  { id: "mastered", label: "Mastered", color: "bg-emerald-600 text-white hover:bg-emerald-700" },
  { id: "in_progress", label: "In Progress", color: "bg-sky-600 text-white hover:bg-sky-700" },
  { id: "revisit", label: "Needs Revisit", color: "bg-amber-500 text-white hover:bg-amber-600" },
  { id: "forgotten", label: "Forgotten", color: "bg-red-500 text-white hover:bg-red-600" },
  { id: "not_started", label: "Not Started", color: "bg-slate-500 text-white hover:bg-slate-600" },
];

interface ProblemKnowledgeWorkspaceProps {
  note: ProblemNote;
  onClose: () => void;
  onEdit: (note: ProblemNote) => void;
  onSetRevisionStatus: (noteId: string, status: NoteRevisionStatus) => Promise<void>;
}

export function ProblemKnowledgeWorkspace({
  note,
  onClose,
  onEdit,
  onSetRevisionStatus,
}: ProblemKnowledgeWorkspaceProps) {
  const [updatingStatus, setUpdatingStatus] = React.useState(false);

  const handleStatusChange = async (status: NoteRevisionStatus) => {
    setUpdatingStatus(true);
    try {
      await onSetRevisionStatus(note.id, status);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const mistakeLabel = note.mistakeCategory
    ? MISTAKE_CATEGORIES.find((m) => m.id === note.mistakeCategory)?.label
    : null;

  const difficultyStyle =
    note.difficulty === "Easy"
      ? "bg-emerald-100 text-emerald-700"
      : note.difficulty === "Medium"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  const createdDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const updatedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-lg font-extrabold text-slate-900">{note.problemTitle}</h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficultyStyle}`}>
              {note.difficulty}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 capitalize border border-slate-200">
              {note.platform}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">{note.topic}</p>
          <p className="text-xs text-slate-400 mt-0.5">Created {createdDate} · Updated {updatedDate}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(note)}
            className="gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Button>
          {note.problemUrl && (
            <a
              href={note.problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Revision Status */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">Revision Status</span>
            <span className="text-xs text-slate-400">(syncs with SRS)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {REVISION_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                disabled={updatingStatus}
                onClick={() => handleStatusChange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  note.revisionStatus === opt.id
                    ? opt.color + " ring-2 ring-offset-1 ring-sky-400/40"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags & Pattern */}
        {(note.tags.length > 0 || note.patternName) && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-700">Tags & Pattern</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
              {note.patternName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                  <Layers className="w-3 h-3" />
                  {note.patternName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Key Insight */}
        {note.keyInsight && (
          <WorkspaceSection
            icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
            title="Key Insight"
            bg="bg-amber-50"
            border="border-amber-100"
          >
            <p className="text-sm text-amber-900 font-medium leading-relaxed">{note.keyInsight}</p>
          </WorkspaceSection>
        )}

        {/* Approach */}
        {note.approachUsed && (
          <WorkspaceSection
            icon={<Code2 className="w-4 h-4 text-sky-500" />}
            title="Approach Used"
            bg="bg-sky-50"
            border="border-sky-100"
          >
            <p className="text-sm text-sky-900 font-medium leading-relaxed">{note.approachUsed}</p>
          </WorkspaceSection>
        )}

        {/* Personal Explanation */}
        {note.personalExplanation && (
          <WorkspaceSection
            icon={<BookOpen className="w-4 h-4 text-violet-500" />}
            title="Personal Explanation"
            bg="bg-violet-50"
            border="border-violet-100"
          >
            <p className="text-sm text-violet-900 font-medium leading-relaxed">{note.personalExplanation}</p>
          </WorkspaceSection>
        )}

        {/* Complexity */}
        {(note.timeComplexity || note.spaceComplexity) && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-700">Complexity</span>
            </div>
            <div className="flex gap-6">
              {note.timeComplexity && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-0.5">Time</p>
                  <code className="text-sm font-bold text-slate-900">{note.timeComplexity}</code>
                </div>
              )}
              {note.spaceComplexity && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-0.5">Space</p>
                  <code className="text-sm font-bold text-slate-900">{note.spaceComplexity}</code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mistake */}
        {note.mistakeCategory && (
          <WorkspaceSection
            icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
            title="Captured Mistake"
            bg="bg-red-50"
            border="border-red-100"
          >
            <p className="text-xs font-bold text-red-700 mb-1">{mistakeLabel}</p>
            {note.mistakeMade && (
              <p className="text-sm text-red-800 font-medium leading-relaxed">{note.mistakeMade}</p>
            )}
          </WorkspaceSection>
        )}

        {/* Edge Cases */}
        {note.edgeCasesDiscovered && (
          <WorkspaceSection
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            title="Edge Cases Discovered"
            bg="bg-emerald-50"
            border="border-emerald-100"
          >
            <p className="text-sm text-emerald-900 font-medium leading-relaxed">{note.edgeCasesDiscovered}</p>
          </WorkspaceSection>
        )}

        {/* Alternative Approach */}
        {note.alternativeApproach && (
          <WorkspaceSection
            icon={<RotateCcw className="w-4 h-4 text-indigo-500" />}
            title="Alternative Approach"
            bg="bg-indigo-50"
            border="border-indigo-100"
          >
            <p className="text-sm text-indigo-900 font-medium leading-relaxed">{note.alternativeApproach}</p>
          </WorkspaceSection>
        )}

        {/* Empty state */}
        {!note.keyInsight && !note.approachUsed && !note.personalExplanation &&
          !note.mistakeCategory && !note.edgeCasesDiscovered && (
          <div className="text-center py-8 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No detailed notes yet.</p>
            <Button variant="ghost" size="sm" onClick={() => onEdit(note)} className="mt-2 cursor-pointer">
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Add notes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceSection({
  icon,
  title,
  bg,
  border,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  bg: string;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`p-4 rounded-2xl ${bg} border ${border}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}
