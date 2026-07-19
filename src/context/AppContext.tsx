"use client";

import * as React from "react";

export interface Problem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  estimated: string;
  solutions: Record<string, string>;
  complexity: {
    time: string;
    space: string;
  };
  takeaways: string[];
}

export interface HistoryItem {
  id: number;
  problemId: number;
  problemTitle: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Solved" | "Incomplete";
}

export interface ToastState {
  show: boolean;
  message: string;
}

interface AppContextType {
  selectedLanguage: string;
  selectedTopics: string[];
  problems: Problem[];
  history: HistoryItem[];
  selectedReviewProblem: Problem | null;
  toast: ToastState;
  saveProfile: (language: string, topics: string[]) => void;
  selectReviewProblem: (problemId: number) => void;
  clearToast: () => void;
  resetProfile: () => void;
  importProfile: (language: string, topics: string[], history: HistoryItem[]) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Mock Problem Database
const MOCK_PROBLEMS: Problem[] = [
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
    return {};
}`,
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
    ]
  },
  {
    id: 2,
    title: "Dijkstra's Shortest Path",
    difficulty: "Medium",
    topics: ["Graph", "Shortest Path", "Heap", "Priority Queue"],
    estimated: "35 mins",
    solutions: {
      JavaScript: `// Shortest path using Min Priority Queue helper
function dijkstra(graph, start, numVertices) {
  const dist = Array(numVertices).fill(Infinity);
  dist[start] = 0;
  
  const pq = new PriorityQueue(); // Min Heap
  pq.insert({ node: start, weight: 0 });
  
  while (!pq.isEmpty()) {
    const { node, weight } = pq.pop();
    if (weight > dist[node]) continue;
    
    for (const edge of graph[node]) {
      const nextDist = weight + edge.weight;
      if (nextDist < dist[edge.node]) {
        dist[edge.node] = nextDist;
        pq.insert({ node: edge.node, weight: nextDist });
      }
    }
  }
  return dist;
}`,
      TypeScript: `// Shortest path using Min Priority Queue helper
interface Edge {
  node: number;
  weight: number;
}

function dijkstra(graph: Edge[][], start: number, numVertices: number): number[] {
  const dist = Array(numVertices).fill(Infinity);
  dist[start] = 0;
  
  const pq = new MinPriorityQueue<{ node: number; weight: number }>({
    priority: (x) => x.weight
  });
  pq.enqueue({ node: start, weight: 0 });
  
  while (!pq.isEmpty()) {
    const { element: { node, weight } } = pq.dequeue();
    if (weight > dist[node]) continue;
    
    for (const edge of graph[node]) {
      const nextDist = weight + edge.weight;
      if (nextDist < dist[edge.node]) {
        dist[edge.node] = nextDist;
        pq.enqueue({ node: edge.node, weight: nextDist });
      }
    }
  }
  return dist;
}`,
      Python: `import heapq

def dijkstra(graph: dict[int, list[tuple[int, int]]], start: int, num_vertices: int) -> list[float]:
    dist = [float('inf')] * num_vertices
    dist[start] = 0
    pq = [(0, start)] # (weight, node)
    
    while pq:
        weight, node = heapq.heappop(pq)
        if weight > dist[node]:
            continue
            
        for neighbor, edge_weight in graph.get(node, []):
            next_dist = weight + edge_weight
            if next_dist < dist[neighbor]:
                dist[neighbor] = next_dist
                heapq.heappush(pq, (next_dist, neighbor))
                
    return dist`,
      "C++": `#include <vector>
#include <queue>

struct Edge {
    int node;
    int weight;
};

std::vector<int> dijkstra(const std::vector<std::vector<Edge>>& graph, int start, int n) {
    std::vector<int> dist(n, 1e9);
    dist[start] = 0;
    
    std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<std::pair<int, int>>> pq;
    pq.push({0, start}); // {weight, node}
    
    while (!pq.empty()) {
        auto [weight, node] = pq.top();
        pq.pop();
        
        if (weight > dist[node]) continue;
        
        for (const auto& edge : graph[node]) {
            if (weight + edge.weight < dist[edge.node]) {
                dist[edge.node] = weight + edge.weight;
                pq.push({dist[edge.node], edge.node});
            }
        }
    }
    return dist;
}`,
      Java: `import java.util.*;

class Solution {
    static class Edge {
        int node, weight;
        Edge(int node, int weight) { this.node = node; this.weight = weight; }
    }
    
    public int[] dijkstra(List<List<Edge>> graph, int start, int n) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[start] = 0;
        
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.add(new int[] { start, 0 }); // {node, weight}
        
        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int node = curr[0];
            int weight = curr[1];
            
            if (weight > dist[node]) continue;
            
            for (Edge edge : graph.get(node)) {
                int nextDist = weight + edge.weight;
                if (nextDist < dist[edge.node]) {
                    dist[edge.node] = nextDist;
                    pq.add(new int[] { edge.node, nextDist });
                }
            }
        }
        return dist;
    }
}`,
      "C#": `using System;
using System.Collections.Generic;

public class Solution {
    public class Edge {
        public int Node { get; set; }
        public int Weight { get; set; }
    }

    public int[] Dijkstra(List<List<Edge>> graph, int start, int n) {
        int[] dist = new int[n];
        Array.Fill(dist, int.MaxValue);
        dist[start] = 0;
        
        var pq = new SortedSet<(int weight, int node)>();
        pq.Add((0, start));

        while (pq.Count > 0) {
            var curr = pq.Min;
            pq.Remove(curr);
            int node = curr.node;
            int weight = curr.weight;

            if (weight > dist[node]) continue;

            foreach (var edge in graph[node]) {
                int nextDist = weight + edge.Weight;
                if (nextDist < dist[edge.Node]) {
                    pq.Remove((dist[edge.Node], edge.Node));
                    dist[edge.Node] = nextDist;
                    pq.Add((nextDist, edge.Node));
                }
            }
        }
        return dist;
    }
}`,
      Go: `package main
import "container/heap"

type Item struct {
    node, weight, index int
}

type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool { return pq[i].weight < pq[j].weight }
func (pq PriorityQueue) Swap(i, j int) {
    pq[i], pq[j] = pq[j], pq[i]
    pq[i].index = i
    pq[j].index = j
}
func (pq *PriorityQueue) Push(x interface{}) {
    n := len(*pq)
    item := x.(*Item)
    item.index = n
    *pq = append(*pq, item)
}
func (pq *PriorityQueue) Pop() interface{} {
    old := *pq
    n := len(old)
    item := old[n-1]
    old[n-1] = nil
    item.index = -1
    *pq = old[0 : n-1]
    return item
}

func dijkstra(graph [][]struct{node, weight int}, start int, n int) []int {
    dist := make([]int, n)
    for i := range dist { dist[i] = 1e9 }
    dist[start] = 0
    
    pq := &PriorityQueue{}
    heap.Init(pq)
    heap.Push(pq, &Item{node: start, weight: 0})
    
    for pq.Len() > 0 {
        curr := heap.Pop(pq).(*Item)
        node, weight := curr.node, curr.weight
        if weight > dist[node] { continue }
        
        for _, edge := range graph[node] {
            nextDist := weight + edge.weight
            if nextDist < dist[edge.node] {
                dist[edge.node] = nextDist
                heap.Push(pq, &Item{node: edge.node, weight: nextDist})
            }
        }
    }
    return dist
}`,
      Rust: `use std::cmp::Ordering;
use std::collections::BinaryHeap;

#[derive(Copy, Clone, Eq, PartialEq)]
struct State {
    cost: usize,
    position: usize,
}

impl Ord for State {
    fn cmp(&self, other: &Self) -> Ordering {
        other.cost.cmp(&self.cost)
            .then_derived_by(|s| s.position.cmp(&other.position))
    }
}

impl PartialOrd for State {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

struct Edge {
    node: usize,
    cost: usize,
}

fn dijkstra(graph: &Vec<Vec<Edge>>, start: usize, n: usize) -> Vec<usize> {
    let mut dist: Vec<usize> = (0..n).map(|_| usize::MAX).collect();
    dist[start] = 0;
    
    let mut heap = BinaryHeap::new();
    heap.push(State { cost: 0, position: start });
    
    while let Some(State { cost, position }) = heap.pop() {
        if cost > dist[position] { continue; }
        
        for edge in &graph[position] {
            let next_dist = cost + edge.cost;
            if next_dist < dist[edge.node] {
                dist[edge.node] = next_dist;
                heap.push(State { cost: next_dist, position: edge.node });
            }
        }
    }
    dist
}`
    },
    complexity: {
      time: "O(E log V)",
      space: "O(V + E)"
    },
    takeaways: [
      "Min-Priority Queue ensures we always relax nodes with the smallest temporary distance.",
      "Check graph constraints; if edges have negative weights, Dijkstra fails and Bellman-Ford must be used."
    ]
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
    ]
  },
  {
    id: 4,
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    topics: ["Binary Search", "Searching", "Arrays"],
    estimated: "30 mins",
    solutions: {
      JavaScript: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}`,
      TypeScript: `function search(nums: number[], target: number): number {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}`,
      Python: `def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
            
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1`,
      "C++": `#include <vector>

int search(std::vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    return -1;
}`,
      Java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
}`,
      "C#": `public class Solution {
    public int Search(int[] nums, int target) {
        int left = 0, right = nums.Length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;

            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
}`,
      Go: `func search(nums []int, target int) int {
    left, right := 0, len(nums)-1
    for left <= right {
        mid := (left + right) / 2
        if nums[mid] == target { return mid }
        
        if nums[left] <= nums[mid] {
            if nums[left] <= target && target < nums[mid] {
                right = mid - 1
            } else {
                left = mid + 1
            }
        } else {
            if nums[mid] < target && target <= nums[right] {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
    }
    return -1
}`,
      Rust: `pub fn search(nums: Vec<i32>, target: i32) -> i32 {
    let mut left = 0;
    let mut right = nums.len() as i32 - 1;
    while left <= right {
        let mid = left + (right - left) / 2;
        if nums[mid as usize] == target { return mid; }
        
        if nums[left as usize] <= nums[mid as usize] {
            if nums[left as usize] <= target && target < nums[mid as usize] {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if nums[mid as usize] < target && target <= nums[right as usize] {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    -1
}`
    },
    complexity: {
      time: "O(log N)",
      space: "O(1)"
    },
    takeaways: [
      "In a rotated sorted array, one half is always strictly sorted. Identify the sorted half first.",
      "Check boundaries carefully using inequality signs to ensure target lies in the expected range."
    ]
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
    ]
  },
  {
    id: 6,
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

#include <algorithm>

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
    ]
  },
  {
    id: 7,
    title: "LRU Cache Design",
    difficulty: "Hard",
    topics: ["Linked List", "Hashing", "Doubly Linked List"],
    estimated: "45 mins",
    solutions: {
      JavaScript: `class Node {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  
  insert(node) {
    node.next = this.head.next;
    node.next.prev = node;
    this.head.next = node;
    node.prev = this.head;
  }
  
  get(key) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      this.remove(node);
      this.insert(node);
      return node.val;
    }
    return -1;
  }
  
  put(key, value) {
    if (this.map.has(key)) {
      this.remove(this.map.get(key));
    }
    const node = new Node(key, value);
    this.insert(node);
    this.map.set(key, node);
    
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}`,
      TypeScript: `class LRUNode {
  key: number;
  val: number;
  prev: LRUNode | null = null;
  next: LRUNode | null = null;
  constructor(key: number, val: number) {
    this.key = key;
    this.val = val;
  }
}

class LRUCache {
  capacity: number;
  map = new Map<number, LRUNode>();
  head = new LRUNode(0, 0);
  tail = new LRUNode(0, 0);

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  private remove(node: LRUNode) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }
  
  private insert(node: LRUNode) {
    node.next = this.head.next;
    node.next!.prev = node;
    this.head.next = node;
    node.prev = this.head;
  }
  
  get(key: number): number {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      this.remove(node);
      this.insert(node);
      return node.val;
    }
    return -1;
  }
  
  put(key: number, value: number): void {
    if (this.map.has(key)) {
      this.remove(this.map.get(key)!);
    }
    const node = new LRUNode(key, value);
    this.insert(node);
    this.map.set(key, node);
    
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev!;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}`,
      Python: `class Node:
    def __init__(self, key: int, val: int):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.map = {}
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def remove(self, node: Node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def insert(self, node: Node):
        node.next = self.head.next
        node.next.prev = node
        self.head.next = node
        node.prev = self.head

    def get(self, key: int) -> int:
        if key in self.map:
            node = self.map[key]
            self.remove(node)
            self.insert(node)
            return node.val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self.remove(self.map[key])
        node = Node(key, value)
        self.insert(node)
        self.map[key] = node
        
        if len(self.map) > self.capacity:
            lru = self.tail.prev
            self.remove(lru)
            del self.map[lru.key]`,
      "C++": `#include <unordered_map>

class LRUCache {
private:
    struct Node {
        int key, val;
        Node* prev = nullptr;
        Node* next = nullptr;
        Node(int k, int v) : key(k), val(v) {}
    };
    
    int capacity;
    std::unordered_map<int, Node*> map;
    Node* head;
    Node* tail;
    
    void remove(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }
    
    void insert(Node* node) {
        node->next = head->next;
        node->next->prev = node;
        head->next = node;
        node->prev = head;
    }
public:
    LRUCache(int cap) : capacity(cap) {
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head->next = tail;
        tail->prev = head;
    }
    
    int get(int key) {
        if (map.find(key) != map.end()) {
            Node* node = map[key];
            remove(node);
            insert(node);
            return node->val;
        }
        return -1;
    }
    
    void put(int key, int value) {
        if (map.find(key) != map.end()) {
            remove(map[key]);
            delete map[key];
        }
        Node* node = new Node(key, value);
        insert(node);
        map[key] = node;
        
        if (map.size() > capacity) {
            Node* lru = tail->prev;
            remove(lru);
            map.erase(lru->key);
            delete lru;
        }
    }
};`,
      Java: `import java.util.HashMap;

class LRUCache {
    private static class Node {
        int key, val;
        Node prev, next;
        Node(int key, int val) { this.key = key; this.val = val; }
    }
    
    private final int capacity;
    private final HashMap<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }
    
    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    private void insert(Node node) {
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
    }
    
    public int get(int key) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            remove(node);
            insert(node);
            return node.val;
        }
        return -1;
    }
    
    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        Node node = new Node(key, value);
        insert(node);
        map.put(key, node);
        
        if (map.size() > capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }
}`,
      "C#": `using System.Collections.Generic;

public class LRUCache {
    private class Node {
        public int key, val;
        public Node prev, next;
        public Node(int k, int v) { key = k; val = v; }
    }

    private readonly int capacity;
    private readonly Dictionary<int, Node> map = new Dictionary<int, Node>();
    private readonly Node head = new Node(0, 0);
    private readonly Node tail = new Node(0, 0);

    public LRUCache(int cap) {
        capacity = cap;
        head.next = tail;
        tail.prev = head;
    }

    private void Remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void Insert(Node node) {
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
    }

    public int Get(int key) {
        if (map.TryGetValue(key, out var node)) {
            Remove(node);
            Insert(node);
            return node.val;
        }
        return -1;
    }

    public void Put(int key, int value) {
        if (map.TryGetValue(key, out var old)) {
            Remove(old);
        }
        var node = new Node(key, value);
        Insert(node);
        map[key] = node;

        if (map.Count > capacity) {
            var lru = tail.prev;
            Remove(lru);
            map.Remove(lru.key);
        }
    }
}`,
      Go: `package main

type Node struct {
    key, val int
    prev, next *Node
}

type LRUCache struct {
    capacity int
    mapStore map[int]*Node
    head, tail *Node
}

func Constructor(capacity int) LRUCache {
    c := LRUCache{
        capacity: capacity,
        mapStore: make(map[int]*Node),
        head: &Node{key: 0, val: 0},
        tail: &Node{key: 0, val: 0},
    }
    c.head.next = c.tail
    c.tail.prev = c.head
    return c
}

func (this *LRUCache) remove(node *Node) {
    node.prev.next = node.next
    node.next.prev = node.prev
}

func (this *LRUCache) insert(node *Node) {
    node.next = this.head.next
    node.next.prev = node
    this.head.next = node
    node.prev = this.head
}

func (this *LRUCache) Get(key int) int {
    if node, ok := this.mapStore[key]; ok {
        this.remove(node)
        this.insert(node)
        return node.val
    }
    return -1
}

func (this *LRUCache) Put(key int, value int) {
    if node, ok := this.mapStore[key]; ok {
        this.remove(node)
    }
    node := &Node{key: key, val: value}
    this.insert(node)
    this.mapStore[key] = node
    
    if len(this.mapStore) > this.capacity {
        lru := this.tail.prev
        this.remove(lru)
        delete(this.mapStore, lru.key)
    }
}`,
      Rust: `use std::collections::HashMap;
use std::rc::Rc;
use std::cell::RefCell;

type Link = Option<Rc<RefCell<Node>>>;

struct Node {
    key: i32,
    val: i32,
    prev: Link,
    next: Link,
}

struct LRUCache {
    capacity: usize,
    map: HashMap<i32, Rc<RefCell<Node>>>,
    head: Link,
    tail: Link,
}

impl LRUCache {
    // Mock LRU setup
}`
    },
    complexity: {
      time: "O(1) for both get and put",
      space: "O(C) where C is the capacity"
    },
    takeaways: [
      "Combine HashMap (for O(1) key search) and Doubly LinkedList (for O(1) insertion/eviction).",
      "Sentinel dummy head and tail simplify edge cases when modifying pointer link nodes."
    ]
  },
  {
    id: 8,
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    topics: ["Linked List", "Heap", "Priority Queue", "Sorting"],
    estimated: "30 mins",
    solutions: {
      JavaScript: `function mergeKLists(lists) {
  // Heap representation or divide-and-conquer merge
  if (lists.length === 0) return null;
  
  function merge(l1, l2) {
    const dummy = new ListNode(0);
    let curr = dummy;
    while (l1 && l2) {
      if (l1.val < l2.val) {
        curr.next = l1;
        l1 = l1.next;
      } else {
        curr.next = l2;
        l2 = l2.next;
      }
      curr = curr.next;
    }
    curr.next = l1 || l2;
    return dummy.next;
  }
  
  while (lists.length > 1) {
    const nextLists = [];
    for (let i = 0; i < lists.length; i += 2) {
      const l1 = lists[i];
      const l2 = i + 1 < lists.length ? lists[i + 1] : null;
      nextLists.push(merge(l1, l2));
    }
    lists = nextLists;
  }
  return lists[0];
}`,
      TypeScript: `interface ListNode {
  val: number;
  next: ListNode | null;
}

function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  if (lists.length === 0) return null;
  
  function merge(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = { val: 0, next: null as ListNode | null };
    let curr = dummy;
    while (l1 && l2) {
      if (l1.val < l2.val) {
        curr.next = l1;
        l1 = l1.next;
      } else {
        curr.next = l2;
        l2 = l2.next;
      }
      curr = curr.next!;
    }
    curr.next = l1 || l2;
    return dummy.next;
  }
  
  let currentLists = lists;
  while (currentLists.length > 1) {
    const nextLists: (ListNode | null)[] = [];
    for (let i = 0; i < currentLists.length; i += 2) {
      const l1 = currentLists[i];
      const l2 = i + 1 < currentLists.length ? currentLists[i + 1] : null;
      nextLists.push(merge(l1, l2));
    }
    currentLists = nextLists;
  }
  return currentLists[0];
}`,
      Python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeKLists(lists: list[ListNode | None]) -> ListNode | None:
    if not lists:
        return None
        
    def merge(l1, l2):
        dummy = ListNode()
        curr = dummy
        while l1 and l2:
            if l1.val < l2.val:
                curr.next = l1
                l1 = l1.next
            else:
                curr.next = l2
                l2 = l2.next
            curr = curr.next
        curr.next = l1 or l2
        return dummy.next
        
    while len(lists) > 1:
        merged = []
        for i in range(0, len(lists), 2):
            l1 = lists[i]
            l2 = lists[i + 1] if i + 1 < len(lists) else None
            merged.append(merge(l1, l2))
        lists = merged
    return lists[0]`,
      "C++": `struct ListNode {
    int val;
    ListNode *next;
};

#include <vector>
#include <queue>

class Solution {
public:
    ListNode* mergeKLists(std::vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        std::priority_queue<ListNode*, std::vector<ListNode*>, decltype(cmp)> pq(cmp);
        
        for (auto list : lists) {
            if (list) pq.push(list);
        }
        
        ListNode* dummy = new ListNode();
        ListNode* curr = dummy;
        
        while (!pq.empty()) {
            ListNode* node = pq.top();
            pq.pop();
            curr->next = node;
            curr = curr->next;
            if (node->next) pq.push(node->next);
        }
        return dummy->next;
    }
};`,
      Java: `import java.util.PriorityQueue;

class ListNode {
    int val;
    ListNode next;
}

class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists == null || lists.length == 0) return null;
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        
        for (ListNode node : lists) {
            if (node != null) pq.add(node);
        }
        
        ListNode dummy = new ListNode();
        ListNode curr = dummy;
        
        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            curr.next = node;
            curr = curr.next;
            if (node.next != null) pq.add(node.next);
        }
        return dummy.next;
    }
}`,
      "C#": `using System.Collections.Generic;

public class ListNode {
    public int val;
    public ListNode next;
}

public class Solution {
    public ListNode MergeKLists(ListNode[] lists) {
        var pq = new SortedSet<(int val, int index, ListNode node)>();
        for (int i = 0; i < lists.Length; i++) {
            if (lists[i] != null) {
                pq.Add((lists[i].val, i, lists[i]));
            }
        }

        ListNode dummy = new ListNode();
        ListNode curr = dummy;

        while (pq.Count > 0) {
            var min = pq.Min;
            pq.Remove(min);

            curr.next = min.node;
            curr = curr.next;

            if (min.node.next != null) {
                pq.Add((min.node.next.val, min.index, min.node.next));
            }
        }
        return dummy.next;
    }
}`,
      Go: `package main
import "container/heap"

type NodeHeap []*ListNode

func (h NodeHeap) Len() int           { return len(h) }
func (h NodeHeap) Less(i, j int) bool { return h[i].Val < h[j].Val }
func (h NodeHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *NodeHeap) Push(x interface{}) { *h = append(*h, x.(*ListNode)) }
func (h *NodeHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

type ListNode struct {
    Val int
    Next *ListNode
}

func mergeKLists(lists []*ListNode) *ListNode {
    h := &NodeHeap{}
    heap.Init(h)
    
    for _, list := range lists {
        if list != nil { heap.Push(h, list) }
    }
    
    dummy := &ListNode{}
    curr := dummy
    
    for h.Len() > 0 {
        node := heap.Pop(h).(*ListNode)
        curr.Next = node
        curr = curr.Next
        if node.Next != nil { heap.Push(h, node.Next) }
    }
    return dummy.Next
}`,
      Rust: `// Merge lists divide-and-conquer implementation`
    },
    complexity: {
      time: "O(N log K) where N is total nodes",
      space: "O(K) for Priority Queue"
    },
    takeaways: [
      "Divide-and-Conquer or Heap priority queue allows optimal merging in logarithmic steps.",
      "Always verify edge cases: empty list array `[]`, or list array with only null nodes `[null]`."
    ]
  }
];

// Helper to determine active problems matching selected topics
const getFilteredProblems = (topics: string[]): Problem[] => {
  if (topics.length === 0) return [];
  // Returns problems where at least one topic matches selected topics
  return MOCK_PROBLEMS.filter((prob) =>
    prob.topics.some((topic) => topics.includes(topic))
  );
};

// Generate static history items using standard mock problems
const getMockHistory = (topics: string[]): HistoryItem[] => {
  const filtered = getFilteredProblems(topics);
  if (filtered.length === 0) return [];
  
  // Return history mappings
  return [
    {
      id: 1,
      problemId: filtered[0].id,
      problemTitle: filtered[0].title,
      date: "Jul 11, 2026",
      difficulty: filtered[0].difficulty,
      status: "Solved"
    },
    ...(filtered.length > 1
      ? [
          {
            id: 2,
            problemId: filtered[1].id,
            problemTitle: filtered[1].title,
            date: "Jul 10, 2026",
            difficulty: filtered[1].difficulty,
            status: "Incomplete" as const
          }
        ]
      : [])
  ];
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("JavaScript");
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([
    "Arrays",
    "Hashing",
    "Two Pointers",
    "Binary Search",
    "Recursion"
  ]);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [selectedReviewProblem, setSelectedReviewProblem] = React.useState<Problem | null>(null);
  const [toast, setToast] = React.useState<ToastState>({ show: false, message: "" });

  const problems = React.useMemo(() => getFilteredProblems(selectedTopics), [selectedTopics]);

  // Synchronise state from localStorage on first render
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("dsa_language");
    const savedTopics = localStorage.getItem("dsa_topics");
    const savedHistory = localStorage.getItem("dsa_history");
    const savedReviewId = localStorage.getItem("dsa_review_problem_id");

    let activeTopics = [
      "Arrays",
      "Hashing",
      "Two Pointers",
      "Binary Search",
      "Recursion"
    ];
    if (savedTopics) {
      try {
        activeTopics = JSON.parse(savedTopics);
      } catch (e) {
        console.error("Failed to parse saved topics", e);
      }
    }

    let activeHistory: HistoryItem[] = [];
    if (savedHistory) {
      try {
        activeHistory = JSON.parse(savedHistory);
      } catch (e) {
        console.error("Failed to parse saved history", e);
      }
    } else {
      activeHistory = getMockHistory(activeTopics);
    }

    let activeReview: Problem | null = null;
    if (savedReviewId) {
      const match = MOCK_PROBLEMS.find((p) => p.id === parseInt(savedReviewId, 10));
      if (match) {
        activeReview = match;
      }
    }

    // Defer state updates to avoid synchronous cascading renders during hydration
    const timer = setTimeout(() => {
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
      setSelectedTopics(activeTopics);
      setHistory(activeHistory);
      if (!savedHistory) {
        localStorage.setItem("dsa_history", JSON.stringify(activeHistory));
      }
      if (activeReview) {
        setSelectedReviewProblem(activeReview);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const saveProfile = (language: string, topics: string[]) => {
    setSelectedLanguage(language);
    setSelectedTopics(topics);
    localStorage.setItem("dsa_language", language);
    localStorage.setItem("dsa_topics", JSON.stringify(topics));

    setToast({
      show: true,
      message: `Profile updated successfully! Main language: ${language}.`
    });
  };

  const selectReviewProblem = (problemId: number) => {
    const match = MOCK_PROBLEMS.find((p) => p.id === problemId);
    if (match) {
      setSelectedReviewProblem(match);
      localStorage.setItem("dsa_review_problem_id", problemId.toString());
    }
  };

  const resetProfile = () => {
    const defaultTopics = [
      "Arrays",
      "Hashing",
      "Two Pointers",
      "Binary Search",
      "Recursion"
    ];
    const defaultHistory = getMockHistory(defaultTopics);

    setSelectedLanguage("JavaScript");
    setSelectedTopics(defaultTopics);
    setHistory(defaultHistory);
    setSelectedReviewProblem(null);

    localStorage.removeItem("dsa_language");
    localStorage.removeItem("dsa_topics");
    localStorage.removeItem("dsa_history");
    localStorage.removeItem("dsa_review_problem_id");

    setToast({
      show: true,
      message: "Permanent knowledge profile reset to defaults."
    });
  };

  const importProfile = (language: string, topics: string[], importedHistory: HistoryItem[]) => {
    setSelectedLanguage(language);
    setSelectedTopics(topics);
    setHistory(importedHistory);
    setSelectedReviewProblem(null);

    localStorage.setItem("dsa_language", language);
    localStorage.setItem("dsa_topics", JSON.stringify(topics));
    localStorage.setItem("dsa_history", JSON.stringify(importedHistory));
    localStorage.removeItem("dsa_review_problem_id");

    setToast({
      show: true,
      message: "Profile imported successfully!"
    });
  };

  const clearToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  return (
    <AppContext.Provider
      value={{
        selectedLanguage,
        selectedTopics,
        problems,
        history,
        selectedReviewProblem,
        toast,
        saveProfile,
        selectReviewProblem,
        clearToast,
        resetProfile,
        importProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
