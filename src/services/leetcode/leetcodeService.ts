import { Problem, RecommendationRequest, ProblemService } from '../types';

// Mock LeetCode problems - using subset of existing mock problems
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
      TypeScript: `function twoSum(nums: number[], target: number): number[] {
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
    return []`,
      "C++": `#include <vector>
#include <unordered_map>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (map.find(diff) != map.end()) {
            return {map[diff], i};
        }
        map[nums[i]] = i;
    }
    return {};}`,
      Java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
      "C#": `using System.Collections.Generic;

public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        var map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int diff = target - nums[i];
            if (map.ContainsKey(diff)) {
                return new int[] { map[diff], i };
            }
            map[nums[i]] = i;
        }
        return new int[] {};
    }
}`,
      Go: `func twoSum(nums []int, target int) []int {
    mapStore := make(map[int]int)
    for i, num := range nums {
        diff := target - num
        if val, ok := mapStore[diff]; ok {
            return []int{val, i}
        }
        mapStore[num] = i
    }
    return nil
}`,
      Rust: `use std::collections::HashMap;

pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut map = HashMap::new();
    for (i, &num) in nums.iter().enumerate() {
        let diff = target - num;
        if let Some(&index) = map.get(&diff) {
            return vec![index as i32, i as i32];
        }
        map.insert(num, i);
    }
    vec![]
}`
    },
    complexity: {
      time: "O(N)",
      space: "O(N)"
    },
    takeaways: [
      "Hashing is the primary method to optimize O(N^2) search problems to O(N).",
      "Using a single-pass hash map keeps code readable and guarantees correctness in index matches."
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
}`,
      TypeScript: `function longestCommonSubsequence(text1: string, text2: string): number {
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
}`,
      Python: `def longestCommonSubsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]`,
      "C++": `#include <string>
#include <vector>
#include <algorithm>

int longestCommonSubsequence(std::string text1, std::string text2) {
    int m = text1.length(), n = text2.length();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));

    for (int i = 1; i <= m; ++i) {
        for (int j = 1; j <= n; ++j) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}`,
      Java: `import java.lang.Math;

class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[m][n];
    }
}`,
      "C#": `using System;

public class Solution {
    public int LongestCommonSubsequence(string text1, string text2) {
        int m = text1.Length, n = text2.Length;
        int[,] dp = new int[m + 1, n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1[i - 1] == text2[j - 1]) {
                    dp[i, j] = dp[i - 1, j - 1] + 1;
                } else {
                    dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
                }
            }
        }
        return dp[m, n];
    }
}`,
      Go: `func longestCommonSubsequence(text1 string, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }

    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            }
        }
    }
    return dp[m][n]
}

func max(a, b int) int {
    if a > b { return a }
    return b
}`,
      Rust: `use std::cmp::max;

pub fn longest_common_subsequence(text1: String, text2: String) -> i32 {
    let text1 = text1.as_bytes();
    let text2 = text2.as_bytes();
    let m = text1.len();
    let n = text2.len();
    let mut dp = vec![vec![0; n + 1]; m + 1];

    for i in 1..=m {
        for j in 1..=n {
            if text1[i - 1] == text2[j - 1] {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    dp[m][n]
}`
    },
    complexity: {
      time: "O(M * N)",
      space: "O(M * N)"
    },
    takeaways: [
      "LCS is a grid DP problem. Keep track of matches recursively using previous subproblem solutions.",
      "Can optimize space to O(N) by keeping track of only two rows at a time."
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
  let slow = nums[0];
  let fast = nums[0];
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);

  fast = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}`,
      TypeScript: `function findDuplicate(nums: number[]): number {
  let slow = nums[0];
  let fast = nums[0];
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);

  fast = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}`,
      Python: `def findDuplicate(nums: list[int]) -> int:
    slow = nums[0]
    fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break

    fast = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`,
      "C++": `#include <vector>

int findDuplicate(std::vector<int>& nums) {
    int slow = nums[0];
    int fast = nums[0];
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow != fast);

    fast = nums[0];
    while (slow != fast) {
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
}`,
      Java: `class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0];
        int fast = nums[0];
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);

        fast = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
}`,
      "C#": `public class Solution {
    public int FindDuplicate(int[] nums) {
        int slow = nums[0];
        int fast = nums[0];
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);

        fast = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
}`,
      Go: `func findDuplicate(nums []int) int {
    slow := nums[0]
    fast := nums[0]
    for {
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast { break }
    }

    fast = nums[0]
    for slow != fast {
        slow = nums[slow]
        fast = nums[fast]
    }
    return slow
}`,
      Rust: `pub fn find_duplicate(nums: Vec<i32>) -> i32 {
    let mut slow = nums[0] as usize;
    let mut fast = nums[0] as usize;
    loop {
        slow = nums[slow] as usize;
        fast = nums[nums[fast] as usize] as usize;
        if slow == fast { break; }
    }

    fast = nums[0] as usize;
    while slow != fast {
        slow = nums[slow] as usize;
        fast = nums[fast] as usize;
    }
    slow as i32
}`
    },
    complexity: {
      time: "O(N)",
      space: "O(1)"
    },
    takeaways: [
      "Floyd's Tortoise and Hare algorithm detects cycles by modeling array index jumps as a linked list.",
      "Guarantees O(1) space, avoiding hash sets, without mutating the read-only input array."
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
    const leftMax = Math.max(0, dfs(node.left));
    const rightMax = Math.max(0, dfs(node.right));

    maxSum = Math.max(maxSum, node.val + leftMax + rightMax);
    return node.val + Math.max(leftMax, rightMax);
  }

  dfs(root);
  return maxSum;
}`,
      TypeScript: `interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function maxPathSum(root: TreeNode | null): number {
  let maxSum = -Infinity;

  function dfs(node: TreeNode | null): number {
    if (!node) return 0;
    const leftMax = Math.max(0, dfs(node.left));
    const rightMax = Math.max(0, dfs(node.right));

    maxSum = Math.max(maxSum, node.val + leftMax + rightMax);
    return node.val + Math.max(leftMax, rightMax);
  }

  dfs(root);
  return maxSum;
}`,
      Python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def maxPathSum(root: TreeNode | None) -> int:
    max_sum = float('-inf')

    def dfs(node):
        nonlocal max_sum
        if not node:
            return 0
        left_max = max(0, dfs(node.left))
        right_max = max(0, dfs(node.right))

        max_sum = max(max_sum, node.val + left_max + right_max)
        return node.val + max(left_max, right_max)

    dfs(root)
    return max_sum`,
      "C++": `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
};

class Solution {
private:
    int maxSum = -2e9;
    int dfs(TreeNode* node) {
        if (!node) return 0;
        int leftMax = std::max(0, dfs(node->left));
        int rightMax = std::max(0, dfs(node->right));

        maxSum = std::max(maxSum, node->val + leftMax + rightMax);
        return node->val + std::max(leftMax, rightMax);
    }
public:
    int maxPathSum(TreeNode* root) {
        dfs(root);
        return maxSum;
    }
};`,
      Java: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
}

class Solution {
    private int maxSum = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        dfs(root);
        return maxSum;
    }

    private int dfs(TreeNode node) {
        if (node == null) return 0;
        int leftMax = Math.max(0, dfs(node.left));
        int rightMax = Math.max(0, dfs(node.right));

        maxSum = Math.max(maxSum, node.val + leftMax + rightMax);
        return node.val + Math.max(leftMax, rightMax);
    }
}`,
      "C#": `using System;

public class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
}

public class Solution {
    private int maxSum = int.MinValue;

    public int MaxPathSum(TreeNode root) {
        Dfs(root);
        return maxSum;
    }

    private int Dfs(TreeNode node) {
        if (node == null) return 0;
        int leftMax = Math.Max(0, Dfs(node.left));
        int rightMax = Math.Max(0, Dfs(node.right));

        maxSum = Math.Max(maxSum, node.val + leftMax + rightMax);
        return node.val + Math.Max(leftMax, rightMax);
    }
}`,
      Go: `package main

type TreeNode struct {
    Val int
    Left *TreeNode
    Right *TreeNode
}

func maxPathSum(root *TreeNode) int {
    maxSum := -1000000000

    var dfs func(*TreeNode) int
    dfs = func(node *TreeNode) int {
        if node == nil { return 0 }
        leftMax := max(0, dfs(node.Left))
        rightMax := max(0, dfs(node.Right))

        maxSum = max(maxSum, node.Val + leftMax + rightMax)
        return node.Val + max(leftMax, rightMax)
    }
    dfs(root)
    return maxSum
}

func max(a, b int) int {
    if a > b { return a }
    return b
}`,
      Rust: `use std::cell::RefCell;
use std::rc::Rc;
use std::cmp::max;

struct TreeNode {
    val: i32,
    left: Option<Rc<RefCell<TreeNode>>>,
    right: Option<Rc<RefCell<TreeNode>>>,
}

pub fn max_path_sum(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
    let mut max_sum = i32::MIN;

    fn dfs(node: &Option<Rc<RefCell<TreeNode>>>, max_sum: &mut i32) -> i32 {
        if let Some(n) = node {
            let n_borrow = n.borrow();
            let left_max = max(0, dfs(&n_borrow.left, max_sum));
            let right_max = max(0, dfs(&n_borrow.right, max_sum));

            *max_sum = max(*max_sum, n_borrow.val + left_max + right_max);
            n_borrow.val + max(left_max, right_max)
        } else {
            0
        }
    }
    dfs(&root, &mut max_sum);
    max_sum
}`
    },
    complexity: {
      time: "O(N)",
      space: "O(H) where H is tree height"
    },
    takeaways: [
      "Paths can split or extend. We update global maxSum by splitting, but return the continuous straight extension value.",
      "Prevent negative child routes by taking Math.max(0, childSum)."
    ],
    platform: "leetcode"
  }
];

export class LeetCodeService implements ProblemService {
  async getProblems(request: RecommendationRequest): Promise<Problem[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    let filtered = [...LEETCODE_PROBLEMS];

    // Filter by topics if provided
    if (request.topics.length > 0) {
      filtered = filtered.filter(problem =>
        problem.topics.some(topic => request.topics.includes(topic))
      );
    }

    // Filter by difficulty if provided
    if (request.difficulty) {
      filtered = filtered.filter(problem =>
        problem.difficulty === request.difficulty
      );
    }

    // Apply limit if provided
    if (request.limit && request.limit > 0) {
      filtered = filtered.slice(0, request.limit);
    }

    return filtered;
  }
}