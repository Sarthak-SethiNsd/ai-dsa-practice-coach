/**
 * Maps problem topic strings to canonical pattern archetypes.
 * All mappings are deterministic and sourced from the real platform datasets.
 */
export const TOPIC_TO_PATTERN_MAP: Record<string, string> = {
  // Arrays & Fundamentals
  "Arrays": "Array Manipulation",
  "Hashing": "Hash Map / Hash Set",
  "Hash Table": "Hash Map / Hash Set",
  "Two Pointers": "Two Pointers",
  "Sliding Window": "Sliding Window",
  "Prefix Sum": "Prefix Sum",

  // Strings
  "Strings": "String Processing",
  "String": "String Processing",

  // Sorting & Search
  "Sorting": "Custom Sort / Comparator",
  "Binary Search": "Binary Search",
  "Searching": "Binary Search",

  // Intervals
  "Intervals": "Interval Scheduling",

  // Linked Lists
  "Linked List": "Linked List Pointer Manipulation",

  // Stacks & Queues
  "Stack": "Stack / LIFO",
  "Monotonic Stack": "Monotonic Stack",
  "Monotonic Queue": "Monotonic Stack",
  "Queue": "Queue / FIFO",

  // Trees
  "Trees": "Tree Traversal (DFS/BFS)",
  "Binary Trees": "Tree Traversal (DFS/BFS)",
  "BST": "Binary Search Tree",

  // Heaps
  "Heap": "Heap / Priority Queue",
  "Priority Queue": "Heap / Priority Queue",

  // Greedy
  "Greedy": "Greedy Choice",

  // Graphs
  "Graph": "Graph Traversal",
  "Shortest Path": "Dijkstra / Shortest Path",

  // DFS / BFS
  "DFS": "Depth-First Search",
  "BFS": "Breadth-First Search",
  "Matrix": "Grid DFS/BFS",

  // Backtracking
  "Backtracking": "Backtracking",
  "Recursion": "Recursion / Divide & Conquer",

  // Dynamic Programming
  "Dynamic Programming": "Dynamic Programming",

  // Miscellaneous
  "Bit Manipulation": "Bit Manipulation",
  "Union Find": "Union-Find (DSU)",
  "Trie": "Trie / Prefix Tree",
  "Topological Sort": "Topological Sort",

  // Fallback
  "Math": "Mathematical Reasoning",
};

/** Canonical patterns to use for over/under-exposure tracking */
export const CANONICAL_PATTERNS = [
  "Array Manipulation",
  "Hash Map / Hash Set",
  "Two Pointers",
  "Sliding Window",
  "Prefix Sum",
  "String Processing",
  "Binary Search",
  "Interval Scheduling",
  "Linked List Pointer Manipulation",
  "Stack / LIFO",
  "Monotonic Stack",
  "Tree Traversal (DFS/BFS)",
  "Binary Search Tree",
  "Heap / Priority Queue",
  "Greedy Choice",
  "Graph Traversal",
  "Depth-First Search",
  "Breadth-First Search",
  "Grid DFS/BFS",
  "Backtracking",
  "Dynamic Programming",
  "Dijkstra / Shortest Path",
  "Union-Find (DSU)",
  "Trie / Prefix Tree",
  "Topological Sort",
  "Bit Manipulation",
] as const;

export function mapTopicsToPattern(topics: string[]): string {
  for (const topic of topics) {
    if (TOPIC_TO_PATTERN_MAP[topic]) {
      return TOPIC_TO_PATTERN_MAP[topic];
    }
  }
  return topics[0] || "General Problem Solving";
}

export function mapTopicToSkillNodeId(topic: string): string {
  const mapping: Record<string, string> = {
    "Arrays": "arrays",
    "Hashing": "hashing",
    "Hash Table": "hashing",
    "Two Pointers": "two_pointers",
    "Sliding Window": "sliding_window",
    "Prefix Sum": "prefix_sum",
    "Strings": "strings",
    "String": "strings",
    "Sorting": "sorting",
    "Binary Search": "binary_search",
    "Intervals": "intervals",
    "Linked List": "linked_lists",
    "Stack": "stacks",
    "Monotonic Stack": "monotonic_stack",
    "Monotonic Queue": "monotonic_stack",
    "Queue": "queues",
    "Trees": "trees",
    "Binary Trees": "trees",
    "BST": "bst",
    "Heap": "heaps",
    "Priority Queue": "heaps",
    "Greedy": "greedy",
    "Graph": "graphs",
    "DFS": "dfs",
    "BFS": "bfs",
    "Matrix": "dfs",
    "Backtracking": "backtracking",
    "Recursion": "recursion",
    "Dynamic Programming": "dp_1d",
    "Bit Manipulation": "bit_manipulation",
    "Union Find": "union_find",
    "Trie": "tries",
    "Topological Sort": "topological_sort",
    "Shortest Path": "shortest_path",
  };
  return mapping[topic] || topic.toLowerCase().replace(/\s+/g, "_");
}
