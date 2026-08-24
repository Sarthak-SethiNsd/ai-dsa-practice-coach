import { SkillNode, DependencyEdge, GRAPH_VERSION } from "./learningGraphTypes";
import { INITIAL_SKILL_NODES, INITIAL_DEPENDENCY_EDGES } from "./learningGraphData";

const NODES_KEY = "dsa_learning_graph_nodes";
const CUSTOM_EDGES_KEY = "dsa_learning_graph_custom_edges";
const VERSION_KEY = "dsa_learning_graph_version";
const LAST_SYNC_KEY = "dsa_learning_graph_last_sync";

export function getStoredSkillNodes(): SkillNode[] {
  if (typeof window === "undefined") return INITIAL_SKILL_NODES;

  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const rawNodes = localStorage.getItem(NODES_KEY);

    // If no version or version upgrade, merge stored user scores into new canonical nodes
    if (storedVersion !== GRAPH_VERSION || !rawNodes) {
      localStorage.setItem(VERSION_KEY, GRAPH_VERSION);
      localStorage.setItem(NODES_KEY, JSON.stringify(INITIAL_SKILL_NODES));
      return INITIAL_SKILL_NODES;
    }

    const parsed: SkillNode[] = JSON.parse(rawNodes);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_SKILL_NODES;
    }

    // Merge in case canonical graph added new nodes
    const storedMap = new Map(parsed.map((n) => [n.id, n]));
    return INITIAL_SKILL_NODES.map((canonical) => {
      const stored = storedMap.get(canonical.id);
      if (!stored) return canonical;
      return {
        ...canonical,
        masteryScore: stored.masteryScore ?? canonical.masteryScore,
        confidenceScore: stored.confidenceScore ?? canonical.confidenceScore,
        status: stored.status ?? canonical.status,
        decayFactor: stored.decayFactor ?? canonical.decayFactor,
        recentAccuracy: stored.recentAccuracy ?? canonical.recentAccuracy,
        solvedProblemsCount: stored.solvedProblemsCount ?? canonical.solvedProblemsCount,
        evidenceCount: stored.evidenceCount ?? canonical.evidenceCount,
      };
    });
  } catch (err) {
    console.error("[learningGraphStorage] Error loading skill nodes:", err);
    return INITIAL_SKILL_NODES;
  }
}

export function saveStoredSkillNodes(nodes: SkillNode[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (err) {
    console.error("[learningGraphStorage] Error saving skill nodes:", err);
  }
}

export function getStoredDependencyEdges(): DependencyEdge[] {
  if (typeof window === "undefined") return INITIAL_DEPENDENCY_EDGES;
  try {
    const raw = localStorage.getItem(CUSTOM_EDGES_KEY);
    if (!raw) return INITIAL_DEPENDENCY_EDGES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEPENDENCY_EDGES;
  } catch {
    return INITIAL_DEPENDENCY_EDGES;
  }
}

export function saveStoredDependencyEdges(edges: DependencyEdge[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_EDGES_KEY, JSON.stringify(edges));
  } catch (err) {
    console.error("[learningGraphStorage] Error saving dependency edges:", err);
  }
}

export function resetGraphToCanonical(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VERSION_KEY, GRAPH_VERSION);
    localStorage.setItem(NODES_KEY, JSON.stringify(INITIAL_SKILL_NODES));
    localStorage.setItem(CUSTOM_EDGES_KEY, JSON.stringify(INITIAL_DEPENDENCY_EDGES));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (err) {
    console.error("[learningGraphStorage] Error resetting graph:", err);
  }
}
