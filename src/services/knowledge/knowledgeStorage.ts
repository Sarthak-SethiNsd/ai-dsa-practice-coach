import {
  ProblemNote,
  KnowledgeTag,
  BUILTIN_TAGS,
  MistakeCategory,
} from "./knowledgeTypes";

// ─── Storage keys ─────────────────────────────────────────────────────────────

const NOTES_KEY = "dsa_knowledge_notes";
const TAGS_KEY = "dsa_knowledge_tags";

// ─── Seed data ───────────────────────────────────────────────────────────────

function buildSeedNotes(): ProblemNote[] {
  const now = new Date();
  const daysAgo = (d: number) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    return dt.toISOString();
  };

  return [
    {
      id: "note_seed_1",
      problemId: 1,
      platformProblemId: "1",
      platform: "leetcode",
      problemTitle: "Two Sum",
      topic: "Arrays",
      difficulty: "Easy",
      problemUrl: "https://leetcode.com/problems/two-sum/",
      personalExplanation:
        "Use a hash map to store each number's index. For each element, check if its complement (target - num) exists in the map.",
      approachUsed: "Hash Map (One-pass)",
      keyInsight:
        "Instead of O(N²) brute force, a hash map makes complement lookup O(1), reducing the overall complexity to O(N).",
      mistakeMade: "Initially tried nested loops — didn't think of hash map immediately.",
      mistakeCategory: "wrong_approach" as MistakeCategory,
      edgeCasesDiscovered: "Duplicate elements with same value but different indices. Ensure map is checked BEFORE inserting current element.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      alternativeApproach: "Sort + Two Pointers gives O(N log N) time and O(1) space, but doesn't preserve original indices.",
      tags: ["Important", "Interview", "Pattern"],
      patternName: "Hashing",
      revisionStatus: "mastered",
      createdAt: daysAgo(14),
      updatedAt: daysAgo(3),
    },
    {
      id: "note_seed_2",
      problemId: 15,
      platformProblemId: "15",
      platform: "leetcode",
      problemTitle: "3Sum",
      topic: "Two Pointers",
      difficulty: "Medium",
      problemUrl: "https://leetcode.com/problems/3sum/",
      personalExplanation:
        "Sort the array. Fix one pointer i, then use two-pointer approach on [i+1, n-1] range to find pairs summing to -nums[i].",
      approachUsed: "Sort + Two Pointers",
      keyInsight:
        "Sorting first allows eliminating duplicates cleanly and enables the two-pointer shrinking pattern.",
      mistakeMade: "Forgot to skip duplicate values of nums[i], nums[l], and nums[r], leading to duplicate triplets in result.",
      mistakeCategory: "edge_case_missed" as MistakeCategory,
      edgeCasesDiscovered: "Must skip consecutive duplicates for all three pointers after finding a valid triplet.",
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1) excluding output",
      tags: ["Revisit", "Mistake", "Edge Case"],
      patternName: "Two Pointers",
      revisionStatus: "revisit",
      createdAt: daysAgo(10),
      updatedAt: daysAgo(5),
    },
    {
      id: "note_seed_3",
      problemId: 200,
      platformProblemId: "200",
      platform: "leetcode",
      problemTitle: "Number of Islands",
      topic: "Graphs",
      difficulty: "Medium",
      problemUrl: "https://leetcode.com/problems/number-of-islands/",
      personalExplanation:
        "Classic DFS grid traversal. Each time we find '1', increment island counter and DFS to mark the entire connected component as visited (set to '0').",
      approachUsed: "DFS Grid Traversal (in-place mutation)",
      keyInsight: "Marking visited cells by mutating '1' → '0' avoids extra visited array overhead.",
      mistakeMade: undefined,
      mistakeCategory: undefined,
      edgeCasesDiscovered: "Empty grid, single cell grids, and all-water/all-land grids.",
      timeComplexity: "O(M × N)",
      spaceComplexity: "O(M × N) for recursion stack in worst case",
      tags: ["Pattern", "Interview"],
      patternName: "DFS",
      revisionStatus: "in_progress",
      createdAt: daysAgo(7),
      updatedAt: daysAgo(2),
    },
    {
      id: "note_seed_4",
      problemId: 53,
      platformProblemId: "53",
      platform: "leetcode",
      problemTitle: "Maximum Subarray",
      topic: "Dynamic Programming",
      difficulty: "Medium",
      problemUrl: "https://leetcode.com/problems/maximum-subarray/",
      personalExplanation:
        "Kadane's Algorithm: Track current subarray sum. If it goes negative, reset to current element. Track global max.",
      approachUsed: "Kadane's Algorithm (DP)",
      keyInsight:
        "The DP recurrence: maxEndingHere = max(nums[i], maxEndingHere + nums[i]). A negative running sum is always worse to include.",
      mistakeMade: "Initially misunderstood problem — thought we needed indices, not the sum value.",
      mistakeCategory: "misread_problem" as MistakeCategory,
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      tags: ["Important", "Pattern", "Difficult"],
      patternName: "Dynamic Programming",
      revisionStatus: "in_progress",
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
    {
      id: "note_seed_5",
      problemId: 70,
      platformProblemId: "70",
      platform: "leetcode",
      problemTitle: "Climbing Stairs",
      topic: "Dynamic Programming",
      difficulty: "Easy",
      problemUrl: "https://leetcode.com/problems/climbing-stairs/",
      personalExplanation:
        "Classic Fibonacci pattern. Number of ways to reach step N = ways(N-1) + ways(N-2). Use bottom-up DP.",
      approachUsed: "Bottom-up DP (space optimized)",
      keyInsight: "This is literally Fibonacci with base cases dp[1]=1, dp[2]=2. Space can be O(1) by keeping only last 2 values.",
      tags: ["Easy Win", "Pattern"],
      patternName: "Dynamic Programming",
      revisionStatus: "mastered",
      createdAt: daysAgo(12),
      updatedAt: daysAgo(12),
    },
  ];
}

function buildSeedTags(): KnowledgeTag[] {
  const now = new Date().toISOString();
  return BUILTIN_TAGS.map((name) => ({
    id: `tag_builtin_${name.toLowerCase().replace(/\s+/g, "_")}`,
    name,
    isCustom: false,
    createdAt: now,
  }));
}

// ─── Storage Provider Interface ───────────────────────────────────────────────

export interface KnowledgeStorageProvider {
  getNotes(): Promise<ProblemNote[]>;
  saveNotes(notes: ProblemNote[]): Promise<void>;
  addNote(payload: Omit<ProblemNote, "id" | "createdAt" | "updatedAt">): Promise<ProblemNote>;
  updateNote(id: string, updates: Partial<ProblemNote>): Promise<ProblemNote | null>;
  deleteNote(id: string): Promise<boolean>;
  getNoteByProblem(platform: string, problemId: number | string): Promise<ProblemNote | null>;

  getTags(): Promise<KnowledgeTag[]>;
  saveTags(tags: KnowledgeTag[]): Promise<void>;
  addCustomTag(name: string, color?: string): Promise<KnowledgeTag>;
  deleteTag(id: string): Promise<boolean>;
}

// ─── LocalStorage Implementation ──────────────────────────────────────────────

export class LocalStorageKnowledgeStorage implements KnowledgeStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  // ── Notes ─────────────────────────────────────────────────────────────────

  private loadRawNotes(): ProblemNote[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[KnowledgeStorage] Failed to load notes:", e);
      return [];
    }
  }

  private saveRawNotes(notes: ProblemNote[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }

  async getNotes(): Promise<ProblemNote[]> {
    const notes = this.loadRawNotes();
    if (notes.length === 0) {
      const seed = buildSeedNotes();
      this.saveRawNotes(seed);
      return seed;
    }
    return notes;
  }

  async saveNotes(notes: ProblemNote[]): Promise<void> {
    this.saveRawNotes(notes);
  }

  async addNote(
    payload: Omit<ProblemNote, "id" | "createdAt" | "updatedAt">
  ): Promise<ProblemNote> {
    const notes = await this.getNotes();
    const now = new Date().toISOString();
    const newNote: ProblemNote = {
      ...payload,
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.saveRawNotes([newNote, ...notes]);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<ProblemNote>): Promise<ProblemNote | null> {
    const notes = await this.getNotes();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    const updated: ProblemNote = {
      ...notes[idx],
      ...updates,
      id, // preserve ID
      createdAt: notes[idx].createdAt, // preserve original timestamp
      updatedAt: new Date().toISOString(),
    };
    notes[idx] = updated;
    this.saveRawNotes(notes);
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    const notes = await this.getNotes();
    const filtered = notes.filter((n) => n.id !== id);
    if (filtered.length === notes.length) return false;
    this.saveRawNotes(filtered);
    return true;
  }

  async getNoteByProblem(
    platform: string,
    problemId: number | string
  ): Promise<ProblemNote | null> {
    const notes = await this.getNotes();
    return (
      notes.find(
        (n) =>
          n.platform === platform &&
          (String(n.problemId) === String(problemId) ||
            n.platformProblemId === String(problemId))
      ) ?? null
    );
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  private loadRawTags(): KnowledgeTag[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(TAGS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[KnowledgeStorage] Failed to load tags:", e);
      return [];
    }
  }

  private saveRawTags(tags: KnowledgeTag[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  }

  async getTags(): Promise<KnowledgeTag[]> {
    const tags = this.loadRawTags();
    if (tags.length === 0) {
      const seed = buildSeedTags();
      this.saveRawTags(seed);
      return seed;
    }
    return tags;
  }

  async saveTags(tags: KnowledgeTag[]): Promise<void> {
    this.saveRawTags(tags);
  }

  async addCustomTag(name: string, color?: string): Promise<KnowledgeTag> {
    const tags = await this.getTags();
    // Don't allow duplicate tag names (case-insensitive)
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newTag: KnowledgeTag = {
      id: `tag_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      isCustom: true,
      color,
      createdAt: new Date().toISOString(),
    };
    this.saveRawTags([...tags, newTag]);
    return newTag;
  }

  async deleteTag(id: string): Promise<boolean> {
    const tags = await this.getTags();
    // Don't allow deleting built-in tags
    const tag = tags.find((t) => t.id === id);
    if (!tag || !tag.isCustom) return false;
    const filtered = tags.filter((t) => t.id !== id);
    this.saveRawTags(filtered);
    return true;
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const knowledgeStorage = new LocalStorageKnowledgeStorage();
