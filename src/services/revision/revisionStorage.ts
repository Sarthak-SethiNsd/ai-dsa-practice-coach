import { RevisionItem, RevisionNotification } from "./revisionTypes";

const REVISION_ITEMS_KEY = "dsa_spaced_repetition_items";
const REVISION_NOTIFICATIONS_KEY = "dsa_spaced_repetition_notifications";

function getOffsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function buildSeedRevisionItems(): RevisionItem[] {
  const today = getOffsetDate(0);
  const yesterday = getOffsetDate(-1);
  const threeDaysAgo = getOffsetDate(-3);
  const fiveDaysAgo = getOffsetDate(-5);
  const tenDaysAgo = getOffsetDate(-10);
  const fourteenDaysAgo = getOffsetDate(-14);

  return [
    {
      id: "rev_seed_1",
      problemId: 1,
      problemTitle: "Two Sum",
      platform: "leetcode",
      difficulty: "Easy",
      topics: ["Arrays", "Hash Table"],
      url: "https://leetcode.com/problems/two-sum/",
      repetitions: 2,
      intervalDays: 7,
      easeFactor: 2.5,
      memoryStrength: 45,
      successRate: 100,
      lastSolvedAt: tenDaysAgo,
      lastRevisedAt: threeDaysAgo,
      nextDueDate: today,
      status: "due",
      lastReviewScore: 92,
      previousSolutionSnippet: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      history: [
        { id: "h1", revisedAt: tenDaysAgo, feedback: "remembered", aiScore: 95, intervalDays: 1, memoryStrengthAfter: 90 },
        { id: "h2", revisedAt: threeDaysAgo, feedback: "remembered", aiScore: 92, intervalDays: 7, memoryStrengthAfter: 85 }
      ],
      createdAt: tenDaysAgo,
    },
    {
      id: "rev_seed_2",
      problemId: 15,
      problemTitle: "3Sum",
      platform: "leetcode",
      difficulty: "Medium",
      topics: ["Arrays", "Two Pointers", "Sorting"],
      url: "https://leetcode.com/problems/3sum/",
      repetitions: 1,
      intervalDays: 3,
      easeFactor: 2.2,
      memoryStrength: 25,
      successRate: 50,
      lastSolvedAt: fiveDaysAgo,
      lastRevisedAt: fiveDaysAgo,
      nextDueDate: getOffsetDate(-2), // Overdue by 2 days
      status: "overdue",
      lastReviewScore: 68,
      previousSolutionSnippet: `function threeSum(nums: number[]): number[][] {\n  nums.sort((a, b) => a - b);\n  const res: number[][] = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const sum = nums[i] + nums[l] + nums[r];\n      if (sum === 0) {\n        res.push([nums[i], nums[l], nums[r]]);\n        while (l < r && nums[l] === nums[l + 1]) l++;\n        while (l < r && nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (sum < 0) l++;\n      else r--;\n    }\n  }\n  return res;\n}`,
      history: [
        { id: "h3", revisedAt: fiveDaysAgo, feedback: "forgotten", aiScore: 68, intervalDays: 1, memoryStrengthAfter: 40 }
      ],
      createdAt: fiveDaysAgo,
    },
    {
      id: "rev_seed_3",
      problemId: 2,
      problemTitle: "Dijkstra's Shortest Path",
      platform: "codeforces",
      difficulty: "Medium",
      topics: ["Graphs", "Shortest Path", "Heaps"],
      repetitions: 3,
      intervalDays: 14,
      easeFactor: 2.6,
      memoryStrength: 85,
      successRate: 100,
      lastSolvedAt: fourteenDaysAgo,
      lastRevisedAt: yesterday,
      nextDueDate: getOffsetDate(13),
      status: "upcoming",
      lastReviewScore: 98,
      previousSolutionSnippet: `// Min Heap Dijkstra implementation`,
      history: [
        { id: "h4", revisedAt: fourteenDaysAgo, feedback: "remembered", aiScore: 90, intervalDays: 3, memoryStrengthAfter: 90 },
        { id: "h5", revisedAt: yesterday, feedback: "remembered", aiScore: 98, intervalDays: 14, memoryStrengthAfter: 95 }
      ],
      createdAt: fourteenDaysAgo,
    },
    {
      id: "rev_seed_4",
      problemId: 53,
      problemTitle: "Maximum Subarray (Kadane's Algorithm)",
      platform: "leetcode",
      difficulty: "Medium",
      topics: ["Dynamic Programming", "Arrays"],
      url: "https://leetcode.com/problems/maximum-subarray/",
      repetitions: 1,
      intervalDays: 1,
      easeFactor: 2.1,
      memoryStrength: 30,
      successRate: 60,
      lastSolvedAt: yesterday,
      lastRevisedAt: yesterday,
      nextDueDate: today,
      status: "due",
      lastReviewScore: 75,
      previousSolutionSnippet: `function maxSubArray(nums: number[]): number {\n  let maxSoFar = nums[0], maxEndingHere = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);\n    maxSoFar = Math.max(maxSoFar, maxEndingHere);\n  }\n  return maxSoFar;\n}`,
      history: [
        { id: "h6", revisedAt: yesterday, feedback: "hard", aiScore: 75, intervalDays: 1, memoryStrengthAfter: 60 }
      ],
      createdAt: yesterday,
    },
    {
      id: "rev_seed_5",
      problemId: 200,
      problemTitle: "Number of Islands",
      platform: "leetcode",
      difficulty: "Medium",
      topics: ["Graphs", "BFS", "DFS"],
      url: "https://leetcode.com/problems/number-of-islands/",
      repetitions: 2,
      intervalDays: 7,
      easeFactor: 2.4,
      memoryStrength: 70,
      successRate: 85,
      lastSolvedAt: tenDaysAgo,
      lastRevisedAt: threeDaysAgo,
      nextDueDate: getOffsetDate(4),
      status: "upcoming",
      lastReviewScore: 88,
      previousSolutionSnippet: `// DFS Island Grid Traversal`,
      history: [
        { id: "h7", revisedAt: threeDaysAgo, feedback: "remembered", aiScore: 88, intervalDays: 7, memoryStrengthAfter: 80 }
      ],
      createdAt: tenDaysAgo,
    },
    {
      id: "rev_seed_6",
      problemId: 70,
      problemTitle: "Climbing Stairs",
      platform: "leetcode",
      difficulty: "Easy",
      topics: ["Dynamic Programming", "Recursion"],
      url: "https://leetcode.com/problems/climbing-stairs/",
      repetitions: 4,
      intervalDays: 30,
      easeFactor: 2.7,
      memoryStrength: 95,
      successRate: 100,
      lastSolvedAt: fourteenDaysAgo,
      lastRevisedAt: getOffsetDate(-7),
      nextDueDate: getOffsetDate(23),
      status: "upcoming",
      lastReviewScore: 100,
      history: [],
      createdAt: fourteenDaysAgo,
    }
  ];
}

function buildSeedNotifications(): RevisionNotification[] {
  return [
    {
      id: "notif_1",
      type: "due_today",
      title: "Revisions Due Today",
      message: "You have 2 problems due for spaced repetition review today.",
      severity: "info",
      date: new Date().toISOString(),
      read: false,
    },
    {
      id: "notif_2",
      type: "overdue",
      title: "Overdue Problem Alert",
      message: "3Sum is 2 days overdue! Revise now to prevent memory loss.",
      severity: "warning",
      date: new Date().toISOString(),
      read: false,
    },
    {
      id: "notif_3",
      type: "streak_risk",
      title: "Revision Streak Risk",
      message: "Complete today's revisions to maintain your 5-day SRS streak.",
      severity: "error",
      date: new Date().toISOString(),
      read: false,
    }
  ];
}

export interface RevisionStorageProvider {
  getItems(): Promise<RevisionItem[]>;
  saveItems(items: RevisionItem[]): Promise<void>;
  addItem(item: Omit<RevisionItem, "id" | "createdAt" | "history">): Promise<RevisionItem>;
  updateItem(id: string, updates: Partial<RevisionItem>): Promise<RevisionItem | null>;
  deleteItem(id: string): Promise<boolean>;
  getNotifications(): Promise<RevisionNotification[]>;
  saveNotifications(notifs: RevisionNotification[]): Promise<void>;
  markNotificationRead(id: string): Promise<void>;
}

export class LocalStorageRevisionStorage implements RevisionStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private loadRawItems(): RevisionItem[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(REVISION_ITEMS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[RevisionStorage] Load items failed:", e);
      return [];
    }
  }

  private saveRawItems(items: RevisionItem[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(REVISION_ITEMS_KEY, JSON.stringify(items));
  }

  async getItems(): Promise<RevisionItem[]> {
    const items = this.loadRawItems();
    if (items.length === 0) {
      const seed = buildSeedRevisionItems();
      this.saveRawItems(seed);
      return seed;
    }
    return items;
  }

  async saveItems(items: RevisionItem[]): Promise<void> {
    this.saveRawItems(items);
  }

  async addItem(
    payload: Omit<RevisionItem, "id" | "createdAt" | "history">
  ): Promise<RevisionItem> {
    const items = await this.getItems();
    const newItem: RevisionItem = {
      ...payload,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      history: [],
    };
    this.saveRawItems([newItem, ...items]);
    return newItem;
  }

  async updateItem(id: string, updates: Partial<RevisionItem>): Promise<RevisionItem | null> {
    const items = await this.getItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    const updated: RevisionItem = { ...items[idx], ...updates };
    items[idx] = updated;
    this.saveRawItems(items);
    return updated;
  }

  async deleteItem(id: string): Promise<boolean> {
    const items = await this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    this.saveRawItems(filtered);
    return true;
  }

  private loadRawNotifs(): RevisionNotification[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(REVISION_NOTIFICATIONS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[RevisionStorage] Load notifs failed:", e);
      return [];
    }
  }

  private saveRawNotifs(notifs: RevisionNotification[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(REVISION_NOTIFICATIONS_KEY, JSON.stringify(notifs));
  }

  async getNotifications(): Promise<RevisionNotification[]> {
    const notifs = this.loadRawNotifs();
    if (notifs.length === 0) {
      const seed = buildSeedNotifications();
      this.saveRawNotifs(seed);
      return seed;
    }
    return notifs;
  }

  async saveNotifications(notifs: RevisionNotification[]): Promise<void> {
    this.saveRawNotifs(notifs);
  }

  async markNotificationRead(id: string): Promise<void> {
    const notifs = await this.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveRawNotifs(updated);
  }
}

export const revisionStorage = new LocalStorageRevisionStorage();
