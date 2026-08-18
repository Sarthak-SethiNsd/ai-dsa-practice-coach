"use client";

import * as React from "react";
import { useKnowledge } from "@/hooks/useKnowledge";
import { KnowledgeOverview } from "@/components/knowledge/KnowledgeOverview";
import { ProblemNoteCard } from "@/components/knowledge/ProblemNoteCard";
import { ProblemNoteEditor } from "@/components/knowledge/ProblemNoteEditor";
import { PatternLibrary } from "@/components/knowledge/PatternLibrary";
import { PatternDetailPanel } from "@/components/knowledge/PatternDetailPanel";
import { LearningInsightsPanel } from "@/components/knowledge/LearningInsightsPanel";
import { ProblemKnowledgeWorkspace } from "@/components/knowledge/ProblemKnowledgeWorkspace";
import { KnowledgeSearch } from "@/components/knowledge/KnowledgeSearch";
import { KnowledgeFilters } from "@/components/knowledge/KnowledgeFilters";
import { QuickNoteModal } from "@/components/knowledge/QuickNoteModal";
import { Button } from "@/components/ui/Button";
import { ProblemNote, PatternSummary } from "@/services/knowledge/knowledgeTypes";
import { useAppContext } from "@/context/AppContext";
import {
  BookOpen,
  Plus,
  Brain,
  Layers,
  Loader2,
  FileText,
  Lightbulb,
  LayoutGrid,
} from "lucide-react";

type KnowledgeTab = "knowledge-base" | "patterns" | "insights" | "dashboard";

const TABS: { id: KnowledgeTab; label: string; icon: React.ElementType }[] = [
  { id: "knowledge-base", label: "Knowledge Base", icon: FileText },
  { id: "patterns", label: "Pattern Library", icon: Layers },
  { id: "insights", label: "AI Insights", icon: Lightbulb },
  { id: "dashboard", label: "Overview", icon: LayoutGrid },
];

export default function KnowledgePage() {
  const { showToast } = useAppContext();
  const knowledge = useKnowledge();

  const [activeTab, setActiveTab] = React.useState<KnowledgeTab>("knowledge-base");
  const [editingNote, setEditingNote] = React.useState<ProblemNote | null>(null);
  const [workspaceNote, setWorkspaceNote] = React.useState<ProblemNote | null>(null);
  const [selectedPattern, setSelectedPattern] = React.useState<PatternSummary | null>(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSaveNote = async (noteData: Omit<ProblemNote, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    try {
      await knowledge.saveNote(noteData);
      setShowAddForm(false);
      showToast?.("Note saved!");
    } catch (err) {
      console.error("[KnowledgePage] Save note error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<ProblemNote>) => {
    await knowledge.updateNote(id, updates);
    setEditingNote(null);
    showToast?.("Note updated!");
  };

  const handleDeleteNote = async (id: string) => {
    await knowledge.deleteNote(id);
    showToast?.("Note deleted");
  };

  const handleEditNote = (note: ProblemNote) => {
    setEditingNote(note);
    setWorkspaceNote(null);
  };

  const handleViewWorkspace = (note: ProblemNote) => {
    setWorkspaceNote(note);
    setEditingNote(null);
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (knowledge.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading knowledge base...</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <title>Problem Knowledge Base · DSA AI Coach</title>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Problem Knowledge Base</h1>
            <p className="text-sm text-slate-500">
              Capture insights, mistakes, and patterns — your personal DSA learning layer.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Note
        </Button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Workspace / Edit panel ───────────────────────────────────────────── */}
      {workspaceNote && (
        <div className="mb-2">
          <ProblemKnowledgeWorkspace
            note={workspaceNote}
            onClose={() => setWorkspaceNote(null)}
            onEdit={(note) => { setEditingNote(note); setWorkspaceNote(null); }}
            onSetRevisionStatus={knowledge.setRevisionStatus}
          />
        </div>
      )}

      {/* ── Inline Add / Edit Form ───────────────────────────────────────────── */}
      {(showAddForm || editingNote) && (
        <div className="bg-white rounded-2xl border border-sky-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {editingNote ? `Editing: ${editingNote.problemTitle}` : "New Problem Note"}
            </h2>
          </div>
          <ProblemNoteEditor
            initialNote={editingNote ?? undefined}
            availableTags={knowledge.tags}
            onSave={async (noteData) => {
              if (editingNote) {
                await handleUpdateNote(editingNote.id, noteData);
              } else {
                await handleSaveNote(noteData);
              }
            }}
            onCancel={() => { setShowAddForm(false); setEditingNote(null); }}
            onAddCustomTag={knowledge.addCustomTag}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* ── Pattern Detail Panel ─────────────────────────────────────────────── */}
      {selectedPattern && activeTab === "patterns" && (
        <div className="mb-2">
          <PatternDetailPanel
            pattern={selectedPattern}
            onClose={() => setSelectedPattern(null)}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      )}

      {/* ══ Tab Content ══════════════════════════════════════════════════════ */}

      {activeTab === "dashboard" && (
        <KnowledgeOverview metrics={knowledge.dashboardMetrics} />
      )}

      {activeTab === "knowledge-base" && (
        <div className="space-y-4">
          {/* Search + Filters */}
          <div className="space-y-3">
            <KnowledgeSearch
              value={knowledge.searchFilters.query ?? ""}
              onChange={(q) => knowledge.setSearchFilters({ ...knowledge.searchFilters, query: q })}
            />
            <KnowledgeFilters
              filters={knowledge.searchFilters}
              onChange={knowledge.setSearchFilters}
            />
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              {knowledge.filteredNotes.length} note{knowledge.filteredNotes.length !== 1 ? "s" : ""}
              {knowledge.filteredNotes.length !== knowledge.notes.length &&
                ` of ${knowledge.notes.length} total`}
            </p>
          </div>

          {/* Notes grid */}
          {knowledge.filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">
                {knowledge.notes.length === 0 ? "No notes yet" : "No matching notes"}
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mb-4">
                {knowledge.notes.length === 0
                  ? "Add your first problem note to start building your personal knowledge base."
                  : "Try adjusting your search query or filters."}
              </p>
              {knowledge.notes.length === 0 && (
                <Button onClick={() => setShowAddForm(true)} className="gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add First Note
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledge.filteredNotes.map((note) => (
                <ProblemNoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onViewWorkspace={handleViewWorkspace}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "patterns" && (
        <PatternLibrary
          patterns={knowledge.patternLibrary}
          onSelectPattern={(p) => setSelectedPattern(p)}
        />
      )}

      {activeTab === "insights" && (
        <LearningInsightsPanel
          insights={knowledge.insights}
          loading={knowledge.loading}
        />
      )}

      {/* Quick Note Modal (from other pages) */}
      <QuickNoteModal
        isOpen={knowledge.isNoteModalOpen}
        onClose={knowledge.closeNoteModal}
        initialNote={knowledge.noteModalContext ?? undefined}
        existingNote={
          knowledge.noteModalContext?.id
            ? knowledge.notes.find((n) => n.id === knowledge.noteModalContext?.id)
            : undefined
        }
        availableTags={knowledge.tags}
        onSaveNote={knowledge.saveNote}
        onUpdateNote={knowledge.updateNote}
        onAddCustomTag={knowledge.addCustomTag}
        onCaptureMistake={knowledge.captureMistake}
      />
    </main>
  );
}
