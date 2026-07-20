import { Problem, RecommendationRequest, ProblemService } from '../types';

// Mock Codeforces problems - using subset of existing mock problems
const CODEFORCES_PROBLEMS: Problem[] = [
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
func (pq PriorityQueue) Swap(i, j int) { pq[i], pq[j] = pq[j], pq[i]; pq[i].index = i; pq[j].index = j }
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
    ],
    platform: "codeforces"
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
    ],
    platform: "codeforces"
  },
  {
    id: 6,
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

func (h NodeHeap) Len() int { return len(h) }
func (h NodeHeap) Less(i, j int) bool { return h[i].Val < h[j].Val }
func (h NodeHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
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
    ],
    platform: "codeforces"
  },
  {
    id: 8,
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
    ],
    platform: "codeforces"
  }
];

export class CodeforcesService implements ProblemService {
  async getProblems(request: RecommendationRequest): Promise<Problem[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    let filtered = [...CODEFORCES_PROBLEMS];

    // Filter by topics if provided
    if (request.topics.length > 0) {
      filtered = filtered.filter(problem =>
        problem.topics.some(topic => request.topics.includes(topic))
      );
    }

    // Filter by difficulty if provided (and not Mixed)
    if (request.difficulty && request.difficulty !== 'Mixed') {
      filtered = filtered.filter(problem =>
        problem.difficulty === request.difficulty
      );
    }

    // Apply limit per platform
    if (request.countPerPlatform && request.countPerPlatform > 0) {
      filtered = filtered.slice(0, request.countPerPlatform);
    }

    return filtered;
  }
}