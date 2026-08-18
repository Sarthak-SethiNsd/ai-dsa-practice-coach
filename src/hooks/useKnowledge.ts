"use client";

import * as React from "react";
import { ProblemNote, KnowledgeTag, KnowledgeSearchFilters, NoteRevisionStatus, MistakeCategory } from "@/services/knowledge/knowledgeTypes";
import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";
import { computeAiKnowledgeInsights, computeKnowledgeDashboardMetrics, computePatternLibrary, filterAndSortNotes } from "@/services/knowledge/knowledgeEngine";
import type { AiKnowledgeInsight, KnowledgeDashboardMetrics, PatternSummary } from "@/services/knowledge/knowledgeTypes";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { RevisionItem } from "@/services/revision/revisionTypes";

export interface UseKnowledgeReturn {
  // Data
  notes: ProblemNote[];
  filteredNotes: ProblemNote[];
  tags: KnowledgeTag[];
  insights: AiKnowledgeInsight[];
  dashboardMetrics: KnowledgeDashboardMetrics | null;
  patternLibrary: PatternSummary[];
  revisionItems: RevisionItem[];

  // State
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchFilters: KnowledgeSearchFilters;
  setSearchFilters: (f: KnowledgeSearchFilters) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  // Quick note modal
  isNoteModalOpen: boolean;
  noteModalContext: Partial<ProblemNote> | null;
  openNoteModal: (context?: Partial<ProblemNote>) => void;
  closeNoteModal: () => void;

  // CRUD
  saveNote: (noteData: Omit<ProblemNote, "id" | "createdAt" | "updatedAt">) => Promise<ProblemNote>;
  updateNote: (id: string, updates: Partial<ProblemNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteByProblem: (platform: string, problemId: number | string) => Promise<ProblemNote | null>;

  // Tags
  addCustomTag: (name: string, color?: string) => Promise<KnowledgeTag>;
  deleteCustomTag: (id: string) => Promise<void>;

  // SRS sync
  setRevisionStatus: (noteId: string, status: NoteRevisionStatus) => Promise<void>;

  // Mistake capture shorthand
  captureMistake: (
    noteId: string,
    mistakeCategory: MistakeCategory,
    mistakeMade?: string
  ) => Promise<void>;

  refresh: () => void;
}

export function useKnowledge(): UseKnowledgeReturn {
  const [notes, setNotes] = React.useState<ProblemNote[]>([]);
  const [tags, setTags] = React.useState<KnowledgeTag[]>([]);
  const [revisionItems, setRevisionItems] = React.useState<RevisionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("knowledge-base");
  const [searchFilters, setSearchFilters] = React.useState<KnowledgeSearchFilters>({
    sortBy: "recently_updated",
  });
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = React.useState(false);
  const [noteModalContext, setNoteModalContext] = React.useState<Partial<ProblemNote> | null>(null);
  const [refreshSignal, setRefreshSignal] = React.useState(0);

  const refresh = React.useCallback(() => setRefreshSignal((n) => n + 1), []);

  // ── Load data ──────────────────────────────────────────────────────────────

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [loadedNotes, loadedTags, loadedRevItems] = await Promise.all([
          knowledgeStorage.getNotes(),
          knowledgeStorage.getTags(),
          revisionStorage.getItems(),
        ]);
        if (cancelled) return;
        setNotes(loadedNotes);
        setTags(loadedTags);
        setRevisionItems(loadedRevItems);
      } catch (err) {
        console.error("[useKnowledge] Load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [refreshSignal]);

  // ── Derived computations ──────────────────────────────────────────────────

  const filteredNotes = React.useMemo(
    () => filterAndSortNotes(notes, searchFilters),
    [notes, searchFilters]
  );

  const insights = React.useMemo(() => computeAiKnowledgeInsights(notes), [notes]);

  const dashboardMetrics = React.useMemo(
    () => (notes.length > 0 ? computeKnowledgeDashboardMetrics(notes) : null),
    [notes]
  );

  const patternLibrary = React.useMemo(
    () => computePatternLibrary(notes, revisionItems),
    [notes, revisionItems]
  );

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const saveNote = React.useCallback(
    async (noteData: Omit<ProblemNote, "id" | "createdAt" | "updatedAt">) => {
      const created = await knowledgeStorage.addNote(noteData);
      refresh();
      return created;
    },
    [refresh]
  );

  const updateNote = React.useCallback(
    async (id: string, updates: Partial<ProblemNote>) => {
      await knowledgeStorage.updateNote(id, updates);
      refresh();
    },
    [refresh]
  );

  const deleteNote = React.useCallback(
    async (id: string) => {
      await knowledgeStorage.deleteNote(id);
      if (selectedNoteId === id) setSelectedNoteId(null);
      refresh();
    },
    [refresh, selectedNoteId]
  );

  const getNoteByProblem = React.useCallback(
    async (platform: string, problemId: number | string) => {
      return knowledgeStorage.getNoteByProblem(platform, problemId);
    },
    []
  );

  // ── Tags ──────────────────────────────────────────────────────────────────

  const addCustomTag = React.useCallback(async (name: string, color?: string) => {
    const newTag = await knowledgeStorage.addCustomTag(name, color);
    refresh();
    return newTag;
  }, [refresh]);

  const deleteCustomTag = React.useCallback(async (id: string) => {
    await knowledgeStorage.deleteTag(id);
    refresh();
  }, [refresh]);

  // ── SRS Sync ──────────────────────────────────────────────────────────────

  /**
   * Updates the note's revisionStatus. If the note is marked "revisit" or "forgotten",
   * this also updates the corresponding SRS item's due date via revisionStorage —
   * without creating a second scheduler.
   */
  const setRevisionStatus = React.useCallback(
    async (noteId: string, status: NoteRevisionStatus) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      // Update note revision status
      await knowledgeStorage.updateNote(noteId, { revisionStatus: status });

      // Sync with SRS: find matching revision item by problem title
      if (status === "revisit" || status === "forgotten") {
        const matchingRevItem = revisionItems.find(
          (r) =>
            r.problemTitle.toLowerCase() === note.problemTitle.toLowerCase() &&
            r.platform === note.platform
        );
        if (matchingRevItem) {
          // Bump due date to today so it appears in the SRS revision queue
          const today = new Date().toISOString().split("T")[0];
          await revisionStorage.updateItem(matchingRevItem.id, {
            nextDueDate: today,
            status: "due",
          });
        }
      }

      refresh();
    },
    [notes, revisionItems, refresh]
  );

  // ── Mistake Capture ───────────────────────────────────────────────────────

  const captureMistake = React.useCallback(
    async (noteId: string, mistakeCategory: MistakeCategory, mistakeMade?: string) => {
      const updates: Partial<ProblemNote> = {
        mistakeCategory,
        revisionStatus: "revisit",
        tags: [], // will be merged below
      };

      const note = notes.find((n) => n.id === noteId);
      if (note) {
        const newTags = [...note.tags];
        if (!newTags.includes("Mistake")) newTags.push("Mistake");
        if (!newTags.includes("Revisit")) newTags.push("Revisit");
        updates.tags = newTags;
      }

      if (mistakeMade !== undefined) updates.mistakeMade = mistakeMade;

      await knowledgeStorage.updateNote(noteId, updates);
      refresh();
    },
    [notes, refresh]
  );

  // ── Quick Note Modal ──────────────────────────────────────────────────────

  const openNoteModal = React.useCallback((context?: Partial<ProblemNote>) => {
    setNoteModalContext(context ?? null);
    setIsNoteModalOpen(true);
  }, []);

  const closeNoteModal = React.useCallback(() => {
    setIsNoteModalOpen(false);
    setNoteModalContext(null);
  }, []);

  return {
    notes,
    filteredNotes,
    tags,
    insights,
    dashboardMetrics,
    patternLibrary,
    revisionItems,
    loading,
    activeTab,
    setActiveTab,
    searchFilters,
    setSearchFilters,
    selectedNoteId,
    setSelectedNoteId,
    isNoteModalOpen,
    noteModalContext,
    openNoteModal,
    closeNoteModal,
    saveNote,
    updateNote,
    deleteNote,
    getNoteByProblem,
    addCustomTag,
    deleteCustomTag,
    setRevisionStatus,
    captureMistake,
    refresh,
  };
}
