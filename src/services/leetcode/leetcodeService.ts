import { Problem, RecommendationRequest, ProblemService, QuestionProvider, Platform } from '../types';

// Mock LeetCode problems dataset
const LEETCODE_PROBLEMS: Problem[] = [
  {
    id: 1,
    title: "Two Sum Optimization",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing", "Two Pointers"],
    estimated: "15 mins",
    solutions: {
      JavaScript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      Python: `def twoSum(nums: list[int], target: int) -> list[int]:
    num_map = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in num_map:
            return [num_map[diff], i]
        num_map[num] = i
    return []`
    },
    complexity: { time: "O(N)", space: "O(N)" },
    takeaways: [
      "Hashing is the primary method to optimize O(N^2) search problems to O(N).",
      "Using a single-pass hash map keeps code readable."
    ],
    platform: "leetcode"
  },
  {
    id: 3,
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "Strings"],
    estimated: "40 mins",
    solutions: {
      JavaScript: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}`
    },
    complexity: { time: "O(M * N)", space: "O(M * N)" },
    takeaways: [
      "LCS is a grid DP problem. Keep track of matches recursively using previous subproblem solutions."
    ],
    platform: "leetcode"
  },
  {
    id: 5,
    title: "Find Duplicate Element",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing", "Two Pointers"],
    estimated: "10 mins",
    solutions: {
      JavaScript: `function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0];
  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);
  fast = nums[0];
  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; }
  return slow;
}`
    },
    complexity: { time: "O(N)", space: "O(1)" },
    takeaways: [
      "Floyd's Tortoise and Hare algorithm detects cycles without extra space."
    ],
    platform: "leetcode"
  },
  {
    id: 7,
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    topics: ["Trees", "Binary Trees", "Recursion"],
    estimated: "45 mins",
    solutions: {
      JavaScript: `function maxPathSum(root) {
  let maxSum = -Infinity;
  function dfs(node) {
    if (!node) return 0;
    const left = Math.max(0, dfs(node.left));
    const right = Math.max(0, dfs(node.right));
    maxSum = Math.max(maxSum, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  dfs(root);
  return maxSum;
}`
    },
    complexity: { time: "O(N)", space: "O(H)" },
    takeaways: ["Paths can split or extend. We update global maxSum by splitting."],
    platform: "leetcode"
  },
  {
    id: 101,
    title: "Sliding Window Maximum",
    difficulty: "Hard",
    topics: ["Sliding Window", "Monotonic Queue", "Arrays", "Heap"],
    estimated: "35 mins",
    solutions: {
      JavaScript: `function maxSlidingWindow(nums, k) {
  const deque = [];
  const res = [];
  for (let i = 0; i < nums.length; i++) {
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
    deque.push(i);
    if (deque[0] === i - k) deque.shift();
    if (i >= k - 1) res.push(nums[deque[0]]);
  }
  return res;
}`
    },
    complexity: { time: "O(N)", space: "O(K)" },
    takeaways: ["Monotonic Deque keeps track of indices in decreasing value order."],
    platform: "leetcode"
  },
  {
    id: 102,
    title: "Valid Anagram",
    difficulty: "Easy",
    topics: ["Strings", "Hashing", "Sorting"],
    estimated: "10 mins",
    solutions: {
      JavaScript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (let c of s) count[c] = (count[c] || 0) + 1;
  for (let c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`
    },
    complexity: { time: "O(N)", space: "O(1)" },
    takeaways: ["Frequency count hash table checks string permutation match."],
    platform: "leetcode"
  },
  {
    id: 103,
    title: "Container With Most Water",
    difficulty: "Medium",
    topics: ["Two Pointers", "Arrays", "Greedy"],
    estimated: "20 mins",
    solutions: {
      JavaScript: `function maxArea(height) {
  let l = 0, r = height.length - 1, max = 0;
  while (l < r) {
    max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return max;
}`
    },
    complexity: { time: "O(N)", space: "O(1)" },
    takeaways: ["Move the shorter line inwards to search for potentially larger areas."],
    platform: "leetcode"
  },
  {
    id: 104,
    title: "Reverse Linked List",
    difficulty: "Easy",
    topics: ["Linked List", "Recursion"],
    estimated: "15 mins",
    solutions: {
      JavaScript: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`
    },
    complexity: { time: "O(N)", space: "O(1)" },
    takeaways: ["Iteratively swap pointers using a three-pointer technique (prev, curr, next)."],
    platform: "leetcode"
  },
  {
    id: 105,
    title: "Binary Search",
    difficulty: "Easy",
    topics: ["Binary Search", "Searching", "Arrays"],
    estimated: "10 mins",
    solutions: {
      JavaScript: `function search(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}`
    },
    complexity: { time: "O(log N)", space: "O(1)" },
    takeaways: ["Divide and conquer search space iteratively."],
    platform: "leetcode"
  },
  {
    id: 106,
    title: "Coin Change Optimization",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "BFS", "Arrays"],
    estimated: "30 mins",
    solutions: {
      JavaScript: `function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`
    },
    complexity: { time: "O(amount * N)", space: "O(amount)" },
    takeaways: ["Unbounded knapsack dynamic programming."],
    platform: "leetcode"
  },
  {
    id: 107,
    title: "Subarray Sum Equals K",
    difficulty: "Medium",
    topics: ["Prefix Sum", "Hashing", "Arrays"],
    estimated: "25 mins",
    solutions: {
      JavaScript: `function subarraySum(nums, k) {
  let count = 0, sum = 0;
  const map = new Map([[0, 1]]);
  for (let num of nums) {
    sum += num;
    if (map.has(sum - k)) count += map.get(sum - k);
    map.set(sum, (map.get(sum) || 0) + 1);
  }
  return count;
}`
    },
    complexity: { time: "O(N)", space: "O(N)" },
    takeaways: ["Prefix Sum + Map lookup reduces O(N^2) contiguous sum query to O(N)."],
    platform: "leetcode"
  },
  {
    id: 108,
    title: "Merge Intervals",
    difficulty: "Medium",
    topics: ["Intervals", "Sorting", "Arrays"],
    estimated: "25 mins",
    solutions: {
      JavaScript: `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = res[res.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      res.push(intervals[i]);
    }
  }
  return res;
}`
    },
    complexity: { time: "O(N log N)", space: "O(N)" },
    takeaways: ["Sort intervals by start time before linear merging pass."],
    platform: "leetcode"
  },
  {
    id: 109,
    title: "Word Search Grid",
    difficulty: "Medium",
    topics: ["Backtracking", "Matrix", "DFS"],
    estimated: "35 mins",
    solutions: {
      JavaScript: `function exist(board, word) {
  const m = board.length, n = board[0].length;
  function dfs(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] !== word[i]) return false;
    const temp = board[r][c];
    board[r][c] = '#';
    const found = dfs(r+1, c, i+1) || dfs(r-1, c, i+1) || dfs(r, c+1, i+1) || dfs(r, c-1, i+1);
    board[r][c] = temp;
    return found;
  }
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}`
    },
    complexity: { time: "O(N * 3^L)", space: "O(L)" },
    takeaways: ["Backtracking with in-place character mutation avoids visiting the same cell twice."],
    platform: "leetcode"
  },
  {
    id: 110,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topics: ["Two Pointers", "Stack", "Monotonic Stack", "Arrays"],
    estimated: "40 mins",
    solutions: {
      JavaScript: `function trap(height) {
  let l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, res = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      if (height[l] >= leftMax) leftMax = height[l];
      else res += leftMax - height[l];
      l++;
    } else {
      if (height[r] >= rightMax) rightMax = height[r];
      else res += rightMax - height[r];
      r--;
    }
  }
  return res;
}`
    },
    complexity: { time: "O(N)", space: "O(1)" },
    takeaways: ["Two Pointers shrink boundaries maintaining maximum left and right heights."],
    platform: "leetcode"
  }
];

export class LeetCodeService implements ProblemService, QuestionProvider {
  readonly platform: Platform = 'leetcode';

  async getProblems(request: RecommendationRequest): Promise<Problem[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    let filtered = [...LEETCODE_PROBLEMS];

    if (request.topics && request.topics.length > 0) {
      filtered = filtered.filter(problem =>
        problem.topics.some(topic => request.topics.includes(topic))
      );
    }

    if (request.difficulty && request.difficulty !== 'Mixed') {
      filtered = filtered.filter(problem => problem.difficulty === request.difficulty);
    }

    if (request.countPerPlatform && request.countPerPlatform > 0) {
      filtered = filtered.slice(0, request.countPerPlatform);
    }

    return filtered;
  }
}