import {
  VCConfig,
  VCProblem,
} from "./virtualContestTypes";
import { Difficulty, Platform } from "@/services/types";
import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";
import { recommendationHistoryStorage } from "@/services/recommendationHistoryStorage";

// ─── Real Supported Problem Catalog ───────────────────────────────────────────
// Real problems with real constraints, examples, starter code, and reference complexity.

const VIRTUAL_CONTEST_CATALOG: Omit<VCProblem, "contestLabel">[] = [
  {
    id: 101,
    platformProblemId: "1",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/two-sum/",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
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
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n    // Write your code here\n    \n}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(N)" },
    basePoints: 250,
  },
  {
    id: 102,
    platformProblemId: "20",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: ["Strings", "Stack"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/valid-parentheses/",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets and in the correct order.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    starterCode: {
      javascript: `function isValid(s) {\n    // Write your code here\n    \n}`,
      python: `def isValid(s: str) -> bool:\n    # Write your code here\n    pass`,
      cpp: `#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(N)" },
    basePoints: 250,
  },
  {
    id: 103,
    platformProblemId: "121",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topics: ["Arrays", "Dynamic Programming"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    description:
      "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0.",
      },
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4",
    ],
    starterCode: {
      javascript: `function maxProfit(prices) {\n    // Write your code here\n    \n}`,
      python: `def maxProfit(prices: list[int]) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(1)" },
    basePoints: 250,
  },
  {
    id: 104,
    platformProblemId: "206",
    title: "Reverse Linked List",
    difficulty: "Easy",
    topics: ["Linked Lists", "Recursion"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/reverse-linked-list/",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
    starterCode: {
      javascript: `function reverseList(head) {\n    // Write your code here\n    \n}`,
      python: `def reverseList(head):\n    # Write your code here\n    pass`,
      cpp: `struct ListNode { int val; ListNode *next; ListNode(int x) : val(x), next(nullptr) {} };\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        \n    }\n};`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(1)" },
    basePoints: 250,
  },
  {
    id: 105,
    platformProblemId: "704",
    title: "Binary Search",
    difficulty: "Easy",
    topics: ["Binary Search", "Arrays"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/binary-search/",
    description:
      "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4.",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1.",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    starterCode: {
      javascript: `function search(nums, target) {\n    // Write your code here\n    \n}`,
      python: `def search(nums: list[int], target: int) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(log N)", space: "O(1)" },
    basePoints: 250,
  },
  {
    id: 106,
    platformProblemId: "3",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topics: ["Strings", "Sliding Window", "Hashing"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n    // Write your code here\n    \n}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(min(N, M))" },
    basePoints: 500,
  },
  {
    id: 107,
    platformProblemId: "11",
    title: "Container With Most Water",
    difficulty: "Medium",
    topics: ["Arrays", "Two Pointers", "Greedy"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/container-with-most-water/",
    description:
      "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The max area is between index 1 (height 8) and index 8 (height 7).",
      },
      { input: "height = [1,1]", output: "1" },
    ],
    constraints: [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4",
    ],
    starterCode: {
      javascript: `function maxArea(height) {\n    // Write your code here\n    \n}`,
      python: `def maxArea(height: list[int]) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        \n    }\n};`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(1)" },
    basePoints: 500,
  },
  {
    id: 108,
    platformProblemId: "200",
    title: "Number of Islands",
    difficulty: "Medium",
    topics: ["Graphs", "Breadth-First Search", "Depth-First Search"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/number-of-islands/",
    description:
      "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: "1",
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: "3",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'.",
    ],
    starterCode: {
      javascript: `function numIslands(grid) {\n    // Write your code here\n    \n}`,
      python: `def numIslands(grid: list[list[str]]) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        \n    }\n};`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(M * N)", space: "O(M * N)" },
    basePoints: 500,
  },
  {
    id: 109,
    platformProblemId: "300",
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "Binary Search"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/longest-increasing-subsequence/",
    description:
      "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    examples: [
      {
        input: "nums = [10,9,2,5,3,7,101,18]",
        output: "4",
        explanation: "The longest increasing subsequence is [2,3,7,101], therefore the length is 4.",
      },
      { input: "nums = [0,1,0,3,2,3]", output: "4" },
      { input: "nums = [7,7,7,7,7,7,7]", output: "1" },
    ],
    constraints: [
      "1 <= nums.length <= 2500",
      "-10^4 <= nums[i] <= 10^4",
    ],
    starterCode: {
      javascript: `function lengthOfLIS(nums) {\n    // Write your code here\n    \n}`,
      python: `def lengthOfLIS(nums: list[int]) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        \n    }\n};`,
      java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N log N)", space: "O(N)" },
    basePoints: 500,
  },
  {
    id: 110,
    platformProblemId: "322",
    title: "Coin Change",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "Breadth-First Search"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/coin-change/",
    description:
      "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 = 5 + 5 + 1",
      },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4",
    ],
    starterCode: {
      javascript: `function coinChange(coins, amount) {\n    // Write your code here\n    \n}`,
      python: `def coinChange(coins: list[int], amount: int) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        \n    }\n};`,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(amount * coins.length)", space: "O(amount)" },
    basePoints: 500,
  },
  {
    id: 111,
    platformProblemId: "42",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topics: ["Arrays", "Two Pointers", "Stack", "Dynamic Programming"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/trapping-rain-water/",
    description:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are trapped.",
      },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    constraints: [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5",
    ],
    starterCode: {
      javascript: `function trap(height) {\n    // Write your code here\n    \n}`,
      python: `def trap(height: list[int]) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        \n    }\n};`,
      java: `class Solution {\n    public int trap(int[] height) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(1)" },
    basePoints: 1000,
  },
  {
    id: 112,
    platformProblemId: "23",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    topics: ["Linked Lists", "Heap", "Divide and Conquer"],
    platform: "leetcode",
    url: "https://leetcode.com/problems/merge-k-sorted-lists/",
    description:
      "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        explanation: "The linked-lists are merged into one sorted list.",
      },
      { input: "lists = []", output: "[]" },
    ],
    constraints: [
      "k == lists.length",
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= lists[i][j] <= 10^4",
    ],
    starterCode: {
      javascript: `function mergeKLists(lists) {\n    // Write your code here\n    \n}`,
      python: `def mergeKLists(lists):\n    # Write your code here\n    pass`,
      cpp: `struct ListNode { int val; ListNode *next; ListNode(int x) : val(x), next(nullptr) {} };\nclass Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        \n    }\n};`,
      java: `class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N log k)", space: "O(k)" },
    basePoints: 1000,
  },
  // Codeforces Problems
  {
    id: 201,
    platformProblemId: "71A",
    title: "Way Too Long Words",
    difficulty: "Easy",
    topics: ["Strings"],
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/71/A",
    description:
      "Sometimes some words like 'localization' or 'internationalization' are so long that writing them many times in one text is quite tiresome. Let's consider a word too long if its length is strictly more than 10 characters. Replace all too long words with an abbreviation: write the first and last letter of the word and between them write the number of letters between.",
    examples: [
      {
        input: 'words = ["word", "localization", "internationalization", "pneumonoultramicroscopicsilicovolcanoconiosis"]',
        output: '["word", "l10n", "i18n", "p43s"]',
      },
    ],
    constraints: [
      "1 <= n <= 100",
      "Each word consists of lowercase Latin letters and has length 1 to 100.",
    ],
    starterCode: {
      javascript: `function abbreviate(word) {\n    // Write your code here\n    \n}`,
      python: `def abbreviate(word: str) -> str:\n    # Write your code here\n    pass`,
      cpp: `#include <string>\nusing namespace std;\n\nstring abbreviate(string word) {\n    \n}`,
      java: `class Solution {\n    public String abbreviate(String word) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(1)", space: "O(1)" },
    basePoints: 250,
  },
  {
    id: 202,
    platformProblemId: "158A",
    title: "Next Round",
    difficulty: "Easy",
    topics: ["Arrays"],
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/158/A",
    description:
      "'Contestant who earns a score equal to or greater than the k-th place finisher's score will advance to the next round, as long as the contestant earns a positive score...' Calculate how many participants will advance to the next round.",
    examples: [
      {
        input: "n = 8, k = 5, scores = [10, 9, 8, 7, 7, 7, 5, 5]",
        output: "6",
        explanation: "The 5th participant has 7 points. Participants with >= 7 positive points are 6.",
      },
    ],
    constraints: [
      "1 <= k <= n <= 50",
      "0 <= scores[i] <= 100",
      "scores is sorted in non-increasing order.",
    ],
    starterCode: {
      javascript: `function nextRound(n, k, scores) {\n    // Write your code here\n    \n}`,
      python: `def nextRound(n: int, k: int, scores: list[int]) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nint nextRound(int n, int k, vector<int>& scores) {\n    \n}`,
      java: `class Solution {\n    public int nextRound(int n, int k, int[] scores) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(1)" },
    basePoints: 250,
  },
  {
    id: 203,
    platformProblemId: "4A",
    title: "Watermelon",
    difficulty: "Easy",
    topics: ["Greedy", "Math"],
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/4/A",
    description:
      "One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed w kilos. They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem: Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon into two parts, each of them weighing even number of kilos; and it is not obligatory that the parts are equal in size. Can they divide it?",
    examples: [
      { input: "w = 8", output: "YES", explanation: "e.g. 2 and 6 or 4 and 4" },
      { input: "w = 2", output: "NO", explanation: "Only 1 and 1, which are odd" },
    ],
    constraints: [
      "1 <= w <= 100",
    ],
    starterCode: {
      javascript: `function canDivide(w) {\n    // Return "YES" or "NO"\n    \n}`,
      python: `def canDivide(w: int) -> str:\n    # Return "YES" or "NO"\n    pass`,
      cpp: `#include <string>\nusing namespace std;\n\nstring canDivide(int w) {\n    \n}`,
      java: `class Solution {\n    public String canDivide(int w) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(1)", space: "O(1)" },
    basePoints: 250,
  },
  {
    id: 204,
    platformProblemId: "231A",
    title: "Team",
    difficulty: "Easy",
    topics: ["Arrays", "Greedy"],
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/231/A",
    description:
      "One day three best friends Petya, Vasya and Tonya decided to form a team and take part in programming contests. For each problem, they decide to write a solution only if at least two of them are sure about the solution. Find the number of problems the friends will implement.",
    examples: [
      {
        input: "problems = [[1,1,0], [1,1,1], [1,0,0]]",
        output: "2",
      },
    ],
    constraints: [
      "1 <= n <= 1000",
      "Each element is 0 or 1.",
    ],
    starterCode: {
      javascript: `function countProblems(problems) {\n    // Write your code here\n    \n}`,
      python: `def countProblems(problems: list[list[int]]) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nint countProblems(vector<vector<int>>& problems) {\n    \n}`,
      java: `class Solution {\n    public int countProblems(int[][] problems) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(1)" },
    basePoints: 250,
  },
  {
    id: 205,
    platformProblemId: "489C",
    title: "Given Length and Sum of Digits...",
    difficulty: "Medium",
    topics: ["Greedy", "Dynamic Programming"],
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/489/C",
    description:
      "You have a positive integer m and a non-negative integer s. Your task is to find the smallest and the largest of all numbers that have length m and sum of digits s. If no such numbers exist, return '-1 -1'.",
    examples: [
      { input: "m = 2, s = 15", output: "69 96" },
      { input: "m = 3, s = 0", output: "-1 -1" },
    ],
    constraints: [
      "1 <= m <= 100",
      "0 <= s <= 900",
    ],
    starterCode: {
      javascript: `function findNumbers(m, s) {\n    // Write your code here\n    \n}`,
      python: `def findNumbers(m: int, s: int) -> tuple[str, str]:\n    # Write your code here\n    pass`,
      cpp: `#include <string>\nusing namespace std;\n\npair<string, string> findNumbers(int m, int s) {\n    \n}`,
      java: `class Solution {\n    public String[] findNumbers(int m, int s) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(M)", space: "O(M)" },
    basePoints: 500,
  },
  {
    id: 206,
    platformProblemId: "1352C",
    title: "K-th Not Divisible by n",
    difficulty: "Medium",
    topics: ["Binary Search", "Math"],
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/1352/C",
    description:
      "You are given two positive integers n and k. Print the k-th positive integer that is not divisible by n.",
    examples: [
      { input: "n = 3, k = 7", output: "10", explanation: "Sequence: 1, 2, 4, 5, 7, 8, 10... 7th is 10" },
      { input: "n = 4, k = 3", output: "3" },
      { input: "n = 7, k = 97", output: "113" },
    ],
    constraints: [
      "2 <= n <= 10^9",
      "1 <= k <= 10^9",
    ],
    starterCode: {
      javascript: `function findKthNotDivisible(n, k) {\n    // Write your code here\n    \n}`,
      python: `def findKthNotDivisible(n: int, k: int) -> int:\n    # Write your code here\n    pass`,
      cpp: `long long findKthNotDivisible(long long n, long long k) {\n    \n}`,
      java: `class Solution {\n    public long findKthNotDivisible(long n, long k) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(1)", space: "O(1)" },
    basePoints: 500,
  },
  {
    id: 207,
    platformProblemId: "580A",
    title: "Kefa and First Steps",
    difficulty: "Easy",
    topics: ["Arrays", "Dynamic Programming"],
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/580/A",
    description:
      "Kefa decides to celebrate his first progress by becoming more and more active. He is given an array of integers a of length n. Find the length of the maximum non-decreasing contiguous subsegment.",
    examples: [
      {
        input: "a = [2, 2, 1, 3, 4, 1]",
        output: "3",
        explanation: "Subsegment [1, 3, 4] has length 3.",
      },
    ],
    constraints: [
      "1 <= n <= 10^5",
      "1 <= a[i] <= 10^9",
    ],
    starterCode: {
      javascript: `function maxNonDecreasing(a) {\n    // Write your code here\n    \n}`,
      python: `def maxNonDecreasing(a: list[int]) -> int:\n    # Write your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nint maxNonDecreasing(vector<int>& a) {\n    \n}`,
      java: `class Solution {\n    public int maxNonDecreasing(int[] a) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(N)", space: "O(1)" },
    basePoints: 250,
  },
  {
    id: 208,
    platformProblemId: "479A",
    title: "Expression",
    difficulty: "Easy",
    topics: ["Math", "Greedy"],
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/479/A",
    description:
      "Petya has three integers a, b and c. Petya can insert operators '+' and '*' and parentheses between them. Find the maximum value of the expression he can get.",
    examples: [
      { input: "a = 1, b = 2, c = 3", output: "9", explanation: "(1 + 2) * 3 = 9" },
      { input: "a = 2, b = 10, c = 3", output: "60", explanation: "2 * 10 * 3 = 60" },
    ],
    constraints: [
      "1 <= a, b, c <= 10",
    ],
    starterCode: {
      javascript: `function maxExpression(a, b, c) {\n    // Write your code here\n    \n}`,
      python: `def maxExpression(a: int, b: int, c: int) -> int:\n    # Write your code here\n    pass`,
      cpp: `int maxExpression(int a, int b, int c) {\n    \n}`,
      java: `class Solution {\n    public int maxExpression(int a, int b, int c) {\n        \n    }\n}`,
    },
    referenceComplexity: { time: "O(1)", space: "O(1)" },
    basePoints: 250,
  },
];

const CONTEST_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function getContestTopicOptions(): string[] {
  const topics = new Set<string>();
  for (const p of VIRTUAL_CONTEST_CATALOG) {
    for (const t of p.topics) {
      topics.add(t);
    }
  }
  return Array.from(topics).sort();
}

export async function selectContestProblems(config: VCConfig): Promise<VCProblem[]> {
  // 1. Get weak topics from Knowledge Base notes
  let weakTopics: string[] = [];
  try {
    const notes = await knowledgeStorage.getNotes();
    weakTopics = notes
      .filter((n) => n.revisionStatus === "in_progress" || n.revisionStatus === "forgotten" || n.revisionStatus === "not_started")
      .flatMap((n) => n.tags || []);
  } catch {
    weakTopics = [];
  }

  // 2. Get weak topics from Recommendation Snapshots
  const recentProblemIds = new Set<number>();
  try {
    const snapshots = await recommendationHistoryStorage.getAllSnapshots();
    const snapWeakTopics = snapshots.flatMap((s) =>
      s.topicPerformance
        .filter((t) => t.masteryLevel === "Needs Attention" || t.masteryLevel === "Developing")
        .map((t) => t.topic)
    );
    weakTopics = Array.from(new Set([...weakTopics, ...snapWeakTopics]));
  } catch {
    // Ignore snapshot read failures
  }

  // 3. Filter catalog by platform
  let filtered = VIRTUAL_CONTEST_CATALOG.filter((p) => {
    if (config.platform === "mixed") return true;
    return p.platform === config.platform;
  });

  // If platform filter resulted in too few problems, allow mixed fallback
  if (filtered.length < config.problemCount) {
    filtered = [...VIRTUAL_CONTEST_CATALOG];
  }

  // 4. Topic filter
  if (config.topic !== "All Topics") {
    if (config.topic === "Weak Topics" && weakTopics.length > 0) {
      const weakFiltered = filtered.filter((p) =>
        p.topics.some((t) => weakTopics.map((w) => w.toLowerCase()).includes(t.toLowerCase()))
      );
      if (weakFiltered.length >= config.problemCount) {
        filtered = weakFiltered;
      }
    } else if (config.topic !== "Weak Topics") {
      const topicFiltered = filtered.filter((p) =>
        p.topics.some((t) => t.toLowerCase() === config.topic.toLowerCase())
      );
      if (topicFiltered.length >= config.problemCount) {
        filtered = topicFiltered;
      }
    }
  }

  // 5. Difficulty Progression / Distribution
  const targetCount = Math.min(config.problemCount, 5);
  const selected: (typeof VIRTUAL_CONTEST_CATALOG)[0][] = [];

  const easyPool = filtered.filter((p) => p.difficulty === "Easy");
  const medPool = filtered.filter((p) => p.difficulty === "Medium");
  const hardPool = filtered.filter((p) => p.difficulty === "Hard");

  const pickOne = (pool: typeof filtered, fallbackPool: typeof filtered): (typeof filtered)[0] | null => {
    // Prefer problems matching weak topics first, then avoid recent problems
    const weakMatch = pool.find(
      (p) =>
        !selected.some((s) => s.id === p.id) &&
        p.topics.some((t) => weakTopics.map((w) => w.toLowerCase()).includes(t.toLowerCase()))
    );
    if (weakMatch) return weakMatch;

    const notRecent = pool.find(
      (p) => !selected.some((s) => s.id === p.id) && !recentProblemIds.has(p.id)
    );
    if (notRecent) return notRecent;

    const anyInPool = pool.find((p) => !selected.some((s) => s.id === p.id));
    if (anyInPool) return anyInPool;

    return fallbackPool.find((p) => !selected.some((s) => s.id === p.id)) || null;
  };

  if (config.difficulty === "Easy") {
    for (let i = 0; i < targetCount; i++) {
      const p = pickOne(easyPool, filtered);
      if (p) selected.push(p);
    }
  } else if (config.difficulty === "Medium") {
    for (let i = 0; i < targetCount; i++) {
      const p = pickOne(medPool, filtered);
      if (p) selected.push(p);
    }
  } else if (config.difficulty === "Hard") {
    for (let i = 0; i < targetCount; i++) {
      const p = pickOne(hardPool, medPool.length > 0 ? medPool : filtered);
      if (p) selected.push(p);
    }
  } else if (config.difficulty === "Adaptive" || config.difficulty === "Mixed") {
    // Progressive structure:
    // 2 problems: Easy, Medium
    // 3 problems: Easy, Medium, Hard (or Medium)
    // 4 problems: Easy, Easy/Med, Medium, Hard
    // 5 problems: Easy, Easy, Medium, Medium, Hard
    const targetDifficulties: Difficulty[] =
      targetCount === 2
        ? ["Easy", "Medium"]
        : targetCount === 3
        ? ["Easy", "Medium", "Hard"]
        : targetCount === 4
        ? ["Easy", "Easy", "Medium", "Hard"]
        : ["Easy", "Easy", "Medium", "Medium", "Hard"];

    for (let i = 0; i < targetCount; i++) {
      const diff = targetDifficulties[i] || "Medium";
      const targetPool = diff === "Easy" ? easyPool : diff === "Medium" ? medPool : hardPool;
      const p = pickOne(targetPool, filtered);
      if (p) selected.push(p);
    }
  }

  // If we still need more problems, fill from remainder of filtered
  while (selected.length < targetCount) {
    const p = filtered.find((item) => !selected.some((s) => s.id === item.id));
    if (!p) break;
    selected.push(p);
  }

  // 6. Assign contest labels (A, B, C, D, E)
  return selected.map((p, idx) => ({
    ...p,
    contestLabel: CONTEST_LABELS[idx] || `P${idx + 1}`,
  }));
}
