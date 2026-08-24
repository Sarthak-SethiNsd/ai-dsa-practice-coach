"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  SkillNode,
  SkillCategory,
  MasteryStatus,
  FullLearningGraphState,
  AdaptiveLearningPath,
} from "@/services/learningGraph/learningGraphTypes";
import {
  compileLearningGraphState,
  getAdaptiveLearningPathForTarget,
} from "@/services/learningGraph/learningGraphEngine";

export function useLearningGraph() {
  const [state, setState] = useState<FullLearningGraphState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<MasteryStatus | "all">("all");

  // Selection & Focus states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("sliding_window");
  const [focusMode, setFocusMode] = useState<"none" | "prerequisites" | "dependents">("none");

  // Adaptive Pathfinder target
  const [pathTargetId, setPathTargetId] = useState<string>("dp_1d");

  // ─── Compile State ──────────────────────────────────────────────────────────
  const refreshGraph = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await compileLearningGraphState(force);
      setState(data);
    } catch (err) {
      console.error("[useLearningGraph] Error compiling graph:", err);
      setError("Failed to load skill learning graph. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGraph();
  }, [refreshGraph]);

  // ─── Selected Node ──────────────────────────────────────────────────────────
  const selectedNode = useMemo(() => {
    if (!state || !selectedNodeId) return null;
    return state.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [state, selectedNodeId]);

  // ─── Focused Node IDs (for highlighting prerequisites / dependents) ─────────
  const focusedNodeIds = useMemo(() => {
    if (!selectedNode || focusMode === "none") return new Set<string>();
    const set = new Set<string>();
    set.add(selectedNode.id);

    if (focusMode === "prerequisites") {
      selectedNode.prerequisites.forEach((p) => set.add(p));
    } else if (focusMode === "dependents") {
      selectedNode.dependents.forEach((d) => set.add(d));
    }
    return set;
  }, [selectedNode, focusMode]);

  // ─── Filtered Nodes ─────────────────────────────────────────────────────────
  const filteredNodes = useMemo(() => {
    if (!state) return [];
    return state.nodes.filter((node) => {
      const matchesSearch =
        searchQuery === "" ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.patterns.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || node.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || node.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [state, searchQuery, categoryFilter, statusFilter]);

  // ─── Adaptive Learning Path ─────────────────────────────────────────────────
  const adaptivePath = useMemo<AdaptiveLearningPath | null>(() => {
    if (!state) return null;
    return getAdaptiveLearningPathForTarget(pathTargetId, state);
  }, [state, pathTargetId]);

  return {
    state,
    isLoading,
    error,
    refreshGraph: () => refreshGraph(true),

    // Selection
    selectedNodeId,
    selectedNode,
    setSelectedNodeId,
    focusMode,
    setFocusMode,
    focusedNodeIds,

    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    filteredNodes,

    // Pathfinder
    pathTargetId,
    setPathTargetId,
    adaptivePath,
  };
}
