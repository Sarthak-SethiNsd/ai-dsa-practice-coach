import {
  InterviewConfig,
  InterviewProblem,
  InterviewType,
  InterviewDifficulty,
  HintLevel,
} from "./interviewTypes";
import { Difficulty } from "@/services/types";
import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";
import { recommendationHistoryStorage } from "@/services/recommendationHistoryStorage";
import { roadmapStorage } from "@/services/roadmapStorage";

// ─── Supported Comprehensive Interview Problem Catalog ────────────────────────
// Fully structured, real platform problems with rich examples, starter code & 4-tier hints

const INTERVIEW_PROBLEM_CATALOG: InterviewProblem[] = [
  {
    id: 1,
    platformProblemId: "1",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing", "Two Pointers"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/two-sum/",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
      java: `import java.util.HashMap;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
    },
    referenceComplexity: {
      time: "O(N)",
      space: "O(N)",
    },
    keyEdgeCases: [
      "Duplicate values that sum to target (e.g. [3, 3] target 6)",
      "Negative numbers in nums and target (e.g. [-1, -2, -3, -4, -5] target -8)",
      "Large numbers up to 10^9 boundary",
      "Complement exists at index 0",
    ],
    hints: {
      1: "Think about trading space for time. Can we remember numbers we've already seen in constant time?",
      2: "As you iterate through nums, what value do you need to pair with nums[i] to reach target? Can a Hash Map store (number -> index)?",
      3: "Compute `complement = target - nums[i]`. If `complement` is already in the map, return `[map.get(complement), i]`. Otherwise, add `nums[i]` to the map.",
      4: "Single-pass algorithm: initialize `map = new Map()`. Loop `i` from 0 to N-1: `diff = target - nums[i]`. If `map.has(diff)` return `[map.get(diff), i]`, else `map.set(nums[i], i)`.",
    },
    optimalSolutionSnippet: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
  },
  {
    id: 15,
    platformProblemId: "15",
    title: "3Sum",
    difficulty: "Medium",
    topics: ["Arrays", "Two Pointers", "Sorting"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/3sum/",
    description:
      "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. Notice that the solution set must not contain duplicate triplets.",
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation: "nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0. nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0. Distinct triplets are [-1,0,1] and [-1,-1,2].",
      },
      {
        input: "nums = [0,1,1]",
        output: "[]",
      },
      {
        input: "nums = [0,0,0]",
        output: "[[0,0,0]]",
      },
    ],
    constraints: [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5",
    ],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @return {number[][]}\n */\nfunction threeSum(nums) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> threeSum(std::vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}`,
    },
    referenceComplexity: {
      time: "O(N^2)",
      space: "O(1) auxiliary (ignoring output)",
    },
    keyEdgeCases: [
      "All zeros: [0, 0, 0, 0] -> should return single triplet [[0,0,0]]",
      "Frequent duplicates requiring pointer skipping (e.g. [-2, 0, 0, 2, 2])",
      "No valid triplets present",
      "Array with exactly 3 elements",
    ],
    hints: {
      1: "Sorting the array upfront costs O(N log N). How does sorting help with duplicate avoidance and two-pointer search?",
      2: "Fix the first number `nums[i]`. Then solve the 2Sum problem on the remaining subarray `[i+1 ... N-1]` using two pointers `left` and `right`.",
      3: "When `nums[i] + nums[left] + nums[right] === 0`, record triplet, then increment `left` and decrement `right` while skipping duplicate values.",
      4: "Sort `nums`. Loop `i` from 0 to N-3. Skip if `i > 0 && nums[i] === nums[i-1]`. Set `l = i+1, r = N-1`. While `l < r`: calculate sum. If sum === 0, push triplet and skip duplicate `l` & `r`. If sum < 0, `l++`; if sum > 0, `r--`.",
    },
    optimalSolutionSnippet: `function threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const res = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const s = nums[i] + nums[l] + nums[r];\n      if (s === 0) {\n        res.push([nums[i], nums[l], nums[r]]);\n        while (l < r && nums[l] === nums[l + 1]) l++;\n        while (l < r && nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (s < 0) l++; else r--;\n    }\n  }\n  return res;\n}`,
  },
  {
    id: 1143,
    platformProblemId: "1143",
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "Strings"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/longest-common-subsequence/",
    description:
      "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.",
    examples: [
      {
        input: 'text1 = "abcde", text2 = "ace"',
        output: "3",
        explanation: 'The longest common subsequence is "ace" and its length is 3.',
      },
      {
        input: 'text1 = "abc", text2 = "abc"',
        output: "3",
      },
      {
        input: 'text1 = "abc", text2 = "def"',
        output: "0",
      },
    ],
    constraints: [
      "1 <= text1.length, text2.length <= 1000",
      "text1 and text2 consist of only lowercase English characters.",
    ],
    starterCode: {
      javascript: `/**\n * @param {string} text1\n * @param {string} text2\n * @return {number}\n */\nfunction longestCommonSubsequence(text1, text2) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <string>\n#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int longestCommonSubsequence(std::string text1, std::string text2) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        // Write your solution here\n        return 0;\n    }\n}`,
    },
    referenceComplexity: {
      time: "O(M * N)",
      space: "O(M * N) or O(min(M, N))",
    },
    keyEdgeCases: [
      "Completely disjoint strings (return 0)",
      "Identical strings",
      "Single character matching at ends",
      "One string is much longer than the other",
    ],
    hints: {
      1: "Think about subproblems: what is the LCS of prefixes text1[0...i] and text2[0...j]?",
      2: "If text1[i-1] === text2[j-1], the answer is 1 + LCS(i-1, j-1). What if they do not match?",
      3: "If characters don't match, take the maximum of skipping a character from text1 or text2: Math.max(dp[i-1][j], dp[i][j-1]).",
      4: "Create a 2D array dp of size (m+1) x (n+1) filled with 0. Iterate i from 1 to m and j from 1 to n. Return dp[m][n].",
    },
    optimalSolutionSnippet: `function longestCommonSubsequence(text1, text2) {\n  const m = text1.length, n = text2.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (text1[i - 1] === text2[j - 1]) dp[i][j] = 1 + dp[i - 1][j - 1];\n      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n  return dp[m][n];\n}`,
  },
  {
    id: 104,
    platformProblemId: "104",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    topics: ["Trees", "DFS", "BFS", "Binary Tree"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    description:
      "Given the `root` of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "3",
      },
      {
        input: "root = [1,null,2]",
        output: "2",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 10^4].",
      "-100 <= Node.val <= 100",
    ],
    starterCode: {
      javascript: `/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @return {number}\n */\nfunction maxDepth(root) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        # Write your solution here\n        pass`,
      cpp: `class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int maxDepth(TreeNode root) {\n        // Write your solution here\n        return 0;\n    }\n}`,
    },
    referenceComplexity: {
      time: "O(N)",
      space: "O(H) where H is tree height",
    },
    keyEdgeCases: [
      "Empty tree: root === null -> should return 0",
      "Single root node -> returns 1",
      "Skewed linked-list tree -> height N, recursion stack space O(N)",
    ],
    hints: {
      1: "Can we solve this recursively? What is the base case when root is null?",
      2: "The depth of any node is 1 + maximum of depth of its left and right subtrees.",
      3: "Base case: `if (!root) return 0;`. Recursive step: `return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));`",
      4: "Alternatively, an iterative BFS using a queue level-by-level gives depth = number of levels processed.",
    },
    optimalSolutionSnippet: `function maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}`,
  },
  {
    id: 200,
    platformProblemId: "200",
    title: "Number of Islands",
    difficulty: "Medium",
    topics: ["Graphs", "BFS", "DFS", "Matrix"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/number-of-islands/",
    description:
      'Given an `m x n` 2D binary grid `grid` which represents a map of `\'1\'`s (land) and `\'0\'`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.',
    examples: [
      {
        input: 'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]',
        output: "1",
      },
      {
        input: 'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]',
        output: "3",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      'grid[i][j] is "0" or "1".',
    ],
    starterCode: {
      javascript: `/**\n * @param {character[][]} grid\n * @return {number}\n */\nfunction numIslands(grid) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n\nclass Solution {\npublic:\n    int numIslands(std::vector<std::vector<char>>& grid) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return 0;\n    }\n}`,
    },
    referenceComplexity: {
      time: "O(M * N)",
      space: "O(M * N) recursion/queue space in worst case",
    },
    keyEdgeCases: [
      "All water grid (return 0)",
      "All land grid (return 1)",
      "1x1 grid with land vs water",
      "Diagonal lands with no horizontal/vertical connection",
    ],
    hints: {
      1: "Iterate through each cell in the grid. Whenever you encounter a '1', increment island count and sink/visit all connected '1's.",
      2: "Use DFS or BFS starting from (r, c) to visit all 4-directionally adjacent cells. Mark visited cells as '0' in-place or use a visited set.",
      3: "DFS helper: check bounds `r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1'`. Then set `grid[r][c] = '0'` and recursively call 4 directions.",
      4: "Count variable `islands = 0`. Nested loop `r` from 0..m-1 and `c` from 0..n-1. If `grid[r][c] === '1'`, call `dfs(r, c)` and `islands++`. Return `islands`.",
    },
    optimalSolutionSnippet: `function numIslands(grid) {\n  let count = 0;\n  const m = grid.length, n = grid[0].length;\n  function dfs(r, c) {\n    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== "1") return;\n    grid[r][c] = "0";\n    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n  }\n  for (let r = 0; r < m; r++) {\n    for (let c = 0; c < n; c++) {\n      if (grid[r][c] === "1") {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}`,
  },
  {
    id: 206,
    platformProblemId: "206",
    title: "Reverse Linked List",
    difficulty: "Easy",
    topics: ["Linked Lists", "Recursion"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/reverse-linked-list/",
    description:
      "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
      },
      {
        input: "head = []",
        output: "[]",
      },
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
    starterCode: {
      javascript: `/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nfunction reverseList(head) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your solution here\n        pass`,
      cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        return nullptr;\n    }\n};`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}`,
    },
    referenceComplexity: {
      time: "O(N)",
      space: "O(1) iterative, O(N) recursive",
    },
    keyEdgeCases: [
      "Empty list: head === null -> returns null",
      "Single node list: returns same node",
      "List with 2 nodes: verify pointer direction reverses correctly",
    ],
    hints: {
      1: "Maintain 3 pointers: `prev`, `curr`, and `nextTemp`.",
      2: "Before altering `curr.next`, save `nextTemp = curr.next`. Then point `curr.next = prev`.",
      3: "Advance pointers: `prev = curr`, `curr = nextTemp`. Repeat until `curr === null`.",
      4: "Initialize `prev = null, curr = head`. While `curr`: `const next = curr.next; curr.next = prev; prev = curr; curr = next;` Return `prev`.",
    },
    optimalSolutionSnippet: `function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}`,
  },
  {
    id: 76,
    platformProblemId: "76",
    title: "Minimum Window Substring",
    difficulty: "Hard",
    topics: ["Strings", "Sliding Window", "Hash Table"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/minimum-window-substring/",
    description:
      'Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.',
    examples: [
      {
        input: 's = "ADOBECODEBANC", t = "ABC"',
        output: '"BANC"',
        explanation: 'The minimum window substring "BANC" includes \'A\', \'B\', and \'C\' from string t.',
      },
      {
        input: 's = "a", t = "a"',
        output: '"a"',
      },
      {
        input: 's = "a", t = "aa"',
        output: '""',
        explanation: "Both 'a's from t must be included in the window, so no valid substring exists.",
      },
    ],
    constraints: [
      "m == s.length",
      "n == t.length",
      "1 <= m, n <= 10^5",
      "s and t consist of uppercase and lowercase English letters.",
    ],
    starterCode: {
      javascript: `/**\n * @param {string} s\n * @param {string} t\n * @return {string}\n */\nfunction minWindow(s, t) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        # Write your solution here\n        pass`,
      cpp: `#include <string>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::string minWindow(std::string s, std::string t) {\n        // Write your solution here\n        return "";\n    }\n};`,
      java: `class Solution {\n    public String minWindow(String s, String t) {\n        // Write your solution here\n        return "";\n    }\n}`,
    },
    referenceComplexity: {
      time: "O(M + N)",
      space: "O(distinct chars in S + T) <= O(1) for alphabet",
    },
    keyEdgeCases: [
      "s is shorter than t (returns empty)",
      "t has duplicate characters (e.g. 'aa')",
      "No character from t exists in s",
      "Minimum window is the entire string s",
    ],
    hints: {
      1: "Use a two-pointer sliding window [left, right] and a frequency map of characters in t.",
      2: "Expand right to include characters until the window satisfies all character counts in t.",
      3: "Once valid, shrink from left to find the minimal valid window, updating the global best answer whenever a smaller window is found.",
      4: "Track `have` and `need` counts of unique characters. When `have === need`, record substring if shorter, then increment `left` and update window map.",
    },
    optimalSolutionSnippet: `function minWindow(s, t) {\n  if (s.length < t.length) return "";\n  const countT = new Map();\n  for (const c of t) countT.set(c, (countT.get(c) || 0) + 1);\n  const window = new Map();\n  let have = 0, need = countT.size;\n  let res = [-1, -1], resLen = Infinity;\n  let l = 0;\n  for (let r = 0; r < s.length; r++) {\n    const c = s[r];\n    window.set(c, (window.get(c) || 0) + 1);\n    if (countT.has(c) && window.get(c) === countT.get(c)) have++;\n    while (have === need) {\n      if ((r - l + 1) < resLen) { res = [l, r]; resLen = r - l + 1; }\n      window.set(s[l], window.get(s[l]) - 1);\n      if (countT.has(s[l]) && window.get(s[l]) < countT.get(s[l])) have--;\n      l++;\n    }\n  }\n  return resLen !== Infinity ? s.slice(res[0], res[1] + 1) : "";\n}`,
  },
];

// ─── Topic Mapping Helpers ────────────────────────────────────────────────────

function matchesType(problem: InterviewProblem, type: InterviewType): boolean {
  if (type === "General DSA" || type === "Mixed DSA" || type === "Interview Weakness Drill") return true;
  const pTopics = problem.topics.map((t) => t.toLowerCase());

  switch (type) {
    case "Arrays & Strings":
      return pTopics.some((t) => t.includes("array") || t.includes("string") || t.includes("two pointer"));
    case "Linked Lists":
      return pTopics.some((t) => t.includes("linked list"));
    case "Trees":
      return pTopics.some((t) => t.includes("tree") || t.includes("binary search tree"));
    case "Graphs":
      return pTopics.some((t) => t.includes("graph") || t.includes("bfs") || t.includes("dfs") || t.includes("matrix"));
    case "Dynamic Programming":
      return pTopics.some((t) => t.includes("dynamic programming") || t.includes("dp"));
    default:
      return true;
  }
}

function matchesDifficulty(problem: InterviewProblem, difficulty: InterviewDifficulty): boolean {
  if (difficulty === "Adaptive") return true;
  return problem.difficulty.toLowerCase() === difficulty.toLowerCase();
}

// ─── Intelligent Question Selection Engine ────────────────────────────────────

export async function selectInterviewQuestions(
  config: InterviewConfig,
  excludeIds: (string | number)[] = []
): Promise<InterviewProblem[]> {
  const [notes, snapshots, roadmap] = await Promise.all([
    knowledgeStorage.getNotes(),
    recommendationHistoryStorage.getAllSnapshots(),
    roadmapStorage.getRoadmap(),
  ]);

  // Extract weak topics from Knowledge notes & recommendation snapshots
  const weakTopics = new Set<string>();
  notes.forEach((n) => {
    if (n.mistakeCategory || n.revisionStatus === "revisit" || n.tags.includes("Concept Gap")) {
      weakTopics.add(n.topic.toLowerCase());
    }
  });

  const latestSnapshot = snapshots[0];
  if (latestSnapshot?.weakTopics) {
    if (latestSnapshot.weakTopics.weakestTopic?.name) {
      weakTopics.add(latestSnapshot.weakTopics.weakestTopic.name.toLowerCase());
    }
    if (latestSnapshot.weakTopics.secondWeakestTopic?.name) {
      weakTopics.add(latestSnapshot.weakTopics.secondWeakestTopic.name.toLowerCase());
    }
  }

  // Filter catalog
  let candidates = INTERVIEW_PROBLEM_CATALOG.filter((p) => {
    if (excludeIds.includes(p.id)) return false;
    if (!matchesType(p, config.type)) return false;
    if (config.difficulty !== "Adaptive" && !matchesDifficulty(p, config.difficulty)) return false;
    return true;
  });

  if (candidates.length === 0) {
    // Relax difficulty filter if specific difficulty produced 0 candidates for that category
    candidates = INTERVIEW_PROBLEM_CATALOG.filter((p) => matchesType(p, config.type));
  }
  if (candidates.length === 0) {
    candidates = [...INTERVIEW_PROBLEM_CATALOG];
  }

  // Score candidate problems based on weak topic match & roadmap alignment
  const scored = candidates.map((p) => {
    let score = 50;
    const hasWeakTopic = p.topics.some((t) => weakTopics.has(t.toLowerCase()));
    if (hasWeakTopic) score += 35;

    if (config.type === "Interview Weakness Drill" && hasWeakTopic) {
      score += 50;
    }

    if (roadmap?.dailyMission?.focusTopic) {
      const isRoadmapFocus = p.topics.some(
        (t) => t.toLowerCase() === roadmap.dailyMission.focusTopic.toLowerCase()
      );
      if (isRoadmapFocus) score += 20;
    }

    // Adaptive sorting baseline: start with Medium if adaptive
    if (config.difficulty === "Adaptive") {
      if (p.difficulty === "Medium") score += 15;
      else if (p.difficulty === "Easy") score += 10;
    }

    return { problem: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const neededCount = Math.min(config.questionCount, scored.length);
  return scored.slice(0, neededCount).map((s) => s.problem);
}

// ─── Adaptive Next Question Selector ──────────────────────────────────────────

export function selectNextAdaptiveQuestion(
  previousProblem: InterviewProblem,
  previousScore: number,
  excludeIds: (string | number)[]
): InterviewProblem | null {
  let targetDifficulty: Difficulty;
  if (previousScore >= 80) {
    targetDifficulty = previousProblem.difficulty === "Easy" ? "Medium" : "Hard";
  } else if (previousScore < 55) {
    targetDifficulty = previousProblem.difficulty === "Hard" ? "Medium" : "Easy";
  } else {
    targetDifficulty = previousProblem.difficulty;
  }

  const candidate = INTERVIEW_PROBLEM_CATALOG.find(
    (p) => !excludeIds.includes(p.id) && p.difficulty === targetDifficulty
  );

  return candidate || INTERVIEW_PROBLEM_CATALOG.find((p) => !excludeIds.includes(p.id)) || null;
}
