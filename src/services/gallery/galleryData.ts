import { GalleryItem, VirtualTour } from "./galleryTypes";

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal_two_pointers",
    slug: "two-pointers-fast-slow-flowchart",
    title: "Two Pointers & Fast-Slow Flowchart",
    category: "algorithm_patterns",
    description: "Decision matrix for convergence pointers, sliding bounds, and Floyd's cycle detection algorithm.",
    detailedNotes: [
      "Opposite Direction Pointers: Used on sorted arrays for target sum search (O(N) time, O(1) space).",
      "Fast & Slow Pointers (Floyd's Algorithm): Detects cycles in linked lists and identifies cycle start indices.",
      "Partitioning (Dutch National Flag): Three-way pointer partition for 0/1/2 color sorting.",
    ],
    aspectRatio: "16/9",
    altText: "Flowchart illustrating Opposite Direction pointers converging on sorted arrays and Fast-Slow pointers cycle detection.",
    topics: ["Two Pointers", "Fast & Slow", "Linked Lists", "Arrays"],
    difficulty: "Easy",
    relatedSkillNodeId: "two_pointers",
    relatedProblemId: 1, // Two Sum II / 3Sum
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="boxGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
        <linearGradient id="boxGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" rx="16" fill="url(#bgGrad1)"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Two Pointers &amp; Fast-Slow Strategy Matrix</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Linear Time O(N) Traversal with O(1) Auxiliary Space</text>
      
      <!-- Section 1: Opposite Direction -->
      <rect x="50" y="95" width="330" height="150" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="70" y="125" fill="#38bdf8" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">1. Inward Convergence</text>
      <text x="70" y="148" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Sorted array target search (Two Sum II)</text>
      <text x="70" y="168" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Container With Most Water (greedy width)</text>
      <rect x="70" y="185" width="290" height="40" rx="8" fill="#0f172a" stroke="#0284c7" stroke-dasharray="4"/>
      <text x="85" y="210" fill="#e2e8f0" font-size="12" font-family="monospace">L=0 ──▶ sum &lt; target: L++ | R=n-1 ◀──</text>

      <!-- Section 2: Fast & Slow -->
      <rect x="420" y="95" width="330" height="150" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="440" y="125" fill="#34d399" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">2. Fast &amp; Slow (Floyd Cycle)</text>
      <text x="440" y="148" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Cycle Detection: slow += 1, fast += 2</text>
      <text x="440" y="168" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Middle of Linked List finding</text>
      <rect x="440" y="185" width="290" height="40" rx="8" fill="#0f172a" stroke="#10b981" stroke-dasharray="4"/>
      <text x="455" y="210" fill="#e2e8f0" font-size="12" font-family="monospace">slow (1x) == fast (2x) ⇒ Cycle Exists</text>

      <!-- Section 3: Invariant Matrix -->
      <rect x="50" y="265" width="700" height="150" rx="12" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
      <text x="70" y="295" fill="#fbbf24" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">Core Invariant &amp; Termination Rules</text>
      <line x1="70" y1="310" x2="730" y2="310" stroke="#334155" stroke-width="1"/>
      <text x="70" y="335" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif">Loop Boundary:</text>
      <text x="180" y="335" fill="#f1f5f9" font-size="12" font-family="monospace">while (left &lt; right) or while (fast &amp;&amp; fast.next)</text>
      <text x="70" y="365" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif">Space Complexity:</text>
      <text x="180" y="365" fill="#34d399" font-size="12" font-family="system-ui, sans-serif">Strictly O(1) Auxiliary Memory — zero allocation during pointer movement.</text>
      <text x="70" y="395" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif">Key Pitfall:</text>
      <text x="180" y="395" fill="#f87171" font-size="12" font-family="system-ui, sans-serif">Infinite loop when both pointers step simultaneously without monotonic boundary shift.</text>
    </svg>`,
  },
  {
    id: "gal_sliding_window",
    slug: "sliding-window-state-machine",
    title: "Sliding Window State Machine",
    category: "algorithm_patterns",
    description: "Expansion vs contraction state triggers for contiguous subarray and substring optimization.",
    detailedNotes: [
      "Dynamic Window (Variable Length): Expand 'right' to find valid window; contract 'left' to minimize length or restore invariant.",
      "Fixed Size Window: Slide by advancing 'left' and 'right' in tandem while maintaining running sum or hash map frequency.",
      "Optimization: Shrink only when required, achieving overall amortized O(2N) = O(N) runtime.",
    ],
    aspectRatio: "16/9",
    altText: "Diagram showing Dynamic Sliding Window state machine: Expand Right until Valid, Shrink Left to Optimize, Update Global Min/Max.",
    topics: ["Sliding Window", "Strings", "Subarrays", "Hash Table"],
    difficulty: "Medium",
    relatedSkillNodeId: "sliding_window",
    relatedProblemId: 3, // Longest Substring Without Repeating Characters
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Sliding Window State Engine</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Variable &amp; Fixed Window Traversal Patterns</text>

      <!-- Step 1 Box -->
      <rect x="50" y="110" width="200" height="180" rx="12" fill="#1e293b" stroke="#0284c7" stroke-width="2"/>
      <circle cx="80" cy="140" r="14" fill="#0284c7"/>
      <text x="80" y="145" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">1</text>
      <text x="105" y="145" fill="#38bdf8" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">Expand Right</text>
      <text x="70" y="180" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• window[arr[R]]++</text>
      <text x="70" y="205" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Include element</text>
      <text x="70" y="230" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• R advances right</text>
      <text x="70" y="265" fill="#94a3b8" font-size="11" font-family="monospace">R &lt; arr.length</text>

      <!-- Arrow 1 -->
      <path d="M 260 200 L 290 200" stroke="#38bdf8" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
      <polygon points="295,200 285,195 285,205" fill="#38bdf8"/>

      <!-- Step 2 Box -->
      <rect x="300" y="110" width="200" height="180" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="330" cy="140" r="14" fill="#f59e0b"/>
      <text x="330" y="145" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">2</text>
      <text x="355" y="145" fill="#fbbf24" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">Contract Left</text>
      <text x="320" y="180" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• While invalid window</text>
      <text x="320" y="205" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• window[arr[L]]--</text>
      <text x="320" y="230" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• L advances right</text>
      <text x="320" y="265" fill="#94a3b8" font-size="11" font-family="monospace">while (invalid) L++</text>

      <!-- Arrow 2 -->
      <polygon points="545,200 535,195 535,205" fill="#34d399"/>

      <!-- Step 3 Box -->
      <rect x="550" y="110" width="200" height="180" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <circle cx="580" cy="140" r="14" fill="#10b981"/>
      <text x="580" y="145" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">3</text>
      <text x="605" y="145" fill="#34d399" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">Update Result</text>
      <text x="570" y="180" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Record best length</text>
      <text x="570" y="205" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• ans = max(ans, R-L+1)</text>
      <text x="570" y="230" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Guaranteed valid state</text>
      <text x="570" y="265" fill="#94a3b8" font-size="11" font-family="monospace">Amortized O(N)</text>

      <!-- Bottom Banner -->
      <rect x="50" y="320" width="700" height="95" rx="12" fill="#1e293b" stroke="#334155"/>
      <text x="75" y="350" fill="#e2e8f0" font-size="13" font-weight="bold" font-family="system-ui, sans-serif">Standard Template:</text>
      <text x="75" y="380" fill="#38bdf8" font-size="12" font-family="monospace">for (let r = 0; r &lt; n; r++) { add(r); while (!valid()) { remove(l); l++; } ans = max(ans, r - l + 1); }</text>
    </svg>`,
  },
  {
    id: "gal_binary_search",
    slug: "binary-search-boundary-invariants",
    title: "Binary Search Invariant Boundary Map",
    category: "algorithm_patterns",
    description: "Exact pointer update mechanics for lower-bound, upper-bound, and answer-on-search predicates.",
    detailedNotes: [
      "Search Invariant: Ensure the target solution is always strictly contained in the interval [L, R].",
      "Overflow Prevention: Always compute mid = L + Math.floor((R - L) / 2) instead of (L + R) / 2.",
      "Binary Search on Answer: When monotonic feasibility function f(x) satisfies: False, False, ..., True, True.",
    ],
    aspectRatio: "16/9",
    altText: "Diagram illustrating Binary Search intervals with Low, Mid, and High pointers and the monotonic search space.",
    topics: ["Binary Search", "Arrays", "Search on Answer", "Divide and Conquer"],
    difficulty: "Medium",
    relatedSkillNodeId: "binary_search",
    relatedProblemId: 33, // Search in Rotated Sorted Array
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Binary Search Invariant &amp; Predicate Map</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Logarithmic O(log N) Space Halving Mechanics</text>

      <!-- Interval Visualization -->
      <rect x="50" y="100" width="700" height="90" rx="12" fill="#1e293b" stroke="#334155"/>
      <text x="75" y="130" fill="#38bdf8" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">Search Space: [Left, Right]</text>
      
      <!-- Array Elements -->
      <g transform="translate(75, 145)">
        <rect x="0" y="0" width="70" height="32" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
        <text x="35" y="21" fill="#38bdf8" font-size="12" font-family="monospace" text-anchor="middle">L: 0</text>
        
        <rect x="90" y="0" width="70" height="32" rx="6" fill="#0f172a" stroke="#475569"/>
        <text x="125" y="21" fill="#64748b" font-size="12" font-family="monospace" text-anchor="middle">1</text>
        
        <rect x="180" y="0" width="70" height="32" rx="6" fill="#0f172a" stroke="#475569"/>
        <text x="215" y="21" fill="#64748b" font-size="12" font-family="monospace" text-anchor="middle">2</text>
        
        <rect x="270" y="0" width="80" height="32" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
        <text x="310" y="21" fill="#ffffff" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">Mid: 3</text>
        
        <rect x="370" y="0" width="70" height="32" rx="6" fill="#0f172a" stroke="#475569"/>
        <text x="405" y="21" fill="#64748b" font-size="12" font-family="monospace" text-anchor="middle">4</text>
        
        <rect x="460" y="0" width="70" height="32" rx="6" fill="#0f172a" stroke="#475569"/>
        <text x="495" y="21" fill="#64748b" font-size="12" font-family="monospace" text-anchor="middle">5</text>
        
        <rect x="550" y="0" width="80" height="32" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
        <text x="590" y="21" fill="#34d399" font-size="12" font-family="monospace" text-anchor="middle">R: 6</text>
      </g>

      <!-- Condition 1 -->
      <rect x="50" y="210" width="335" height="195" rx="12" fill="#1e293b" stroke="#0284c7"/>
      <text x="75" y="240" fill="#38bdf8" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">Case A: target &gt; arr[mid]</text>
      <text x="75" y="265" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Target lies strictly in right half.</text>
      <text x="75" y="290" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Discard left half including mid.</text>
      <rect x="75" y="315" width="285" height="40" rx="8" fill="#0f172a"/>
      <text x="90" y="340" fill="#38bdf8" font-size="13" font-family="monospace">left = mid + 1;</text>
      <text x="75" y="380" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif">Invariant: solution in [mid + 1, right]</text>

      <!-- Condition 2 -->
      <rect x="415" y="210" width="335" height="195" rx="12" fill="#1e293b" stroke="#10b981"/>
      <text x="440" y="240" fill="#34d399" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">Case B: target &lt; arr[mid]</text>
      <text x="440" y="265" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Target lies strictly in left half.</text>
      <text x="440" y="290" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Discard right half including mid.</text>
      <rect x="440" y="315" width="285" height="40" rx="8" fill="#0f172a"/>
      <text x="455" y="340" fill="#34d399" font-size="13" font-family="monospace">right = mid - 1;</text>
      <text x="440" y="380" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif">Invariant: solution in [left, mid - 1]</text>
    </svg>`,
  },
  {
    id: "gal_dp_memo_tree",
    slug: "dp-memoization-tree",
    title: "Dynamic Programming Memoization Tree",
    category: "algorithm_patterns",
    description: "DAG state space transitions, overlapping subproblems, and optimal substructure memoization.",
    detailedNotes: [
      "Overlapping Subproblems: Multiple recursion paths resolve to identical state tuple (e.g. fib(3)).",
      "Memoization Cache: Store result upon first visit, truncating exponential O(2^N) recursion into polynomial O(N) DAG.",
      "Tabulation (Bottom-Up): Fill DP table in topological dependency order to optimize stack memory and enable space compression.",
    ],
    aspectRatio: "16/9",
    altText: "Recursion tree showing overlapping subproblem nodes cached with memoization table.",
    topics: ["Dynamic Programming", "Memoization", "Recursion", "Trees"],
    difficulty: "Hard",
    relatedSkillNodeId: "dynamic_programming",
    relatedProblemId: 70, // Climbing Stairs / House Robber
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Dynamic Programming State Space DAG</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Overlapping Subproblems &amp; Optimal Substructure</text>

      <!-- Root Node -->
      <circle cx="400" cy="120" r="24" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <text x="400" y="126" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="monospace">f(4)</text>

      <!-- Level 1 Nodes -->
      <line x1="380" y1="135" x2="260" y2="190" stroke="#475569" stroke-width="2"/>
      <line x1="420" y1="135" x2="540" y2="190" stroke="#475569" stroke-width="2"/>

      <circle cx="250" cy="200" r="22" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <text x="250" y="206" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="monospace">f(3)</text>

      <circle cx="550" cy="200" r="22" fill="#10b981" stroke="#34d399" stroke-width="2"/>
      <text x="550" y="206" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="monospace">f(2)*</text>

      <!-- Level 2 Nodes -->
      <line x1="235" y1="215" x2="150" y2="280" stroke="#475569" stroke-width="2"/>
      <line x1="265" y1="215" x2="350" y2="280" stroke="#475569" stroke-width="2"/>

      <circle cx="140" cy="295" r="20" fill="#10b981" stroke="#34d399" stroke-width="2"/>
      <text x="140" y="300" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">f(2)</text>

      <circle cx="360" cy="295" r="20" fill="#64748b" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="360" y="300" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">f(1)</text>

      <!-- Memo Callout -->
      <rect x="470" y="250" width="280" height="150" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
      <text x="490" y="280" fill="#34d399" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">⚡ Memoization Hit (O(1))</text>
      <text x="490" y="305" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">Node f(2)* is already resolved</text>
      <text x="490" y="325" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">and cached in memo[2]. Subtree</text>
      <text x="490" y="345" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">execution is pruned completely.</text>
      <text x="490" y="380" fill="#fbbf24" font-size="11" font-family="monospace">Complexity: O(2^N) ➔ O(N)</text>
    </svg>`,
  },
  {
    id: "gal_backtracking_space",
    slug: "backtracking-state-space",
    title: "Backtracking State Space Matrix",
    category: "algorithm_patterns",
    description: "Decision tree exploration using the Choose, Explore, Unchoose paradigm for permutations and subsets.",
    detailedNotes: [
      "State Restoration: Revert mutations on mutable containers before backtracking to parent caller.",
      "Pruning Invariant: Check validity constraints before recursing deeper to eliminate unproductive subtrees early.",
      "Base Cases: Push snapshot copies of candidate path (e.g. [...path]) when depth equals target goal.",
    ],
    aspectRatio: "16/9",
    altText: "Diagram of Backtracking Choice Matrix showing Choose, Explore, Unchoose cycles with constraint pruning.",
    topics: ["Backtracking", "Recursion", "Combinatorics", "Trees"],
    difficulty: "Hard",
    relatedSkillNodeId: "backtracking",
    relatedProblemId: 46, // Permutations / Subsets
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Backtracking Invariant: Choose ➔ Explore ➔ Unchoose</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Depth-First Search with Explicit State Restoration</text>

      <!-- 3 Stage Process -->
      <rect x="60" y="110" width="200" height="150" rx="12" fill="#1e293b" stroke="#38bdf8"/>
      <text x="80" y="145" fill="#38bdf8" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">1. CHOOSE</text>
      <text x="80" y="175" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Select candidate choice</text>
      <text x="80" y="200" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• path.push(candidate)</text>
      <text x="80" y="225" fill="#94a3b8" font-size="11" font-family="monospace">visited.add(val)</text>

      <rect x="300" y="110" width="200" height="150" rx="12" fill="#1e293b" stroke="#10b981"/>
      <text x="320" y="145" fill="#34d399" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">2. EXPLORE</text>
      <text x="320" y="175" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Recurse next level</text>
      <text x="320" y="200" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• backtrack(step + 1)</text>
      <text x="320" y="225" fill="#94a3b8" font-size="11" font-family="monospace">dfs(index + 1)</text>

      <rect x="540" y="110" width="200" height="150" rx="12" fill="#1e293b" stroke="#f43f5e"/>
      <text x="560" y="145" fill="#fb7185" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">3. UNCHOOSE</text>
      <text x="560" y="175" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Undo choice state</text>
      <text x="560" y="200" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• path.pop()</text>
      <text x="560" y="225" fill="#94a3b8" font-size="11" font-family="monospace">visited.delete(val)</text>

      <!-- Bottom Code Box -->
      <rect x="60" y="285" width="680" height="130" rx="12" fill="#0f172a" stroke="#475569"/>
      <text x="80" y="315" fill="#fbbf24" font-size="13" font-weight="bold" font-family="system-ui, sans-serif">Universal Backtracking Skeleton:</text>
      <text x="80" y="345" fill="#e2e8f0" font-size="12" font-family="monospace">if (isGoal(path)) { result.push([...path]); return; }</text>
      <text x="80" y="370" fill="#38bdf8" font-size="12" font-family="monospace">for (const c of choices) { if (!isValid(c)) continue; path.push(c); backtrack(); path.pop(); }</text>
    </svg>`,
  },
  {
    id: "gal_trie_prefix_tree",
    slug: "trie-prefix-tree-layout",
    title: "Trie (Prefix Tree) Memory Structure",
    category: "data_structures",
    description: "Multi-way tree memory representation with character edges and boolean terminal markers.",
    detailedNotes: [
      "Prefix Compression: Common prefixes share identical ancestor paths, yielding O(L) search time where L is word length.",
      "Children Representation: Fixed 26-element array for lowercase alphabet (O(1) access) vs Hash Map for sparse charsets.",
      "End-of-Word Flag: Boolean isEndOfWord distinguishes prefixes ('app') from complete dictionary keys ('apple').",
    ],
    aspectRatio: "16/9",
    altText: "Trie diagram showing root node branching into character nodes with isEnd markers.",
    topics: ["Trie", "Trees", "Strings", "Memory Layout"],
    difficulty: "Medium",
    relatedSkillNodeId: "trie",
    relatedProblemId: 208, // Implement Trie
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Trie (Prefix Tree) Node Architecture</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Storing: &quot;app&quot;, &quot;apple&quot;, &quot;bat&quot;</text>

      <!-- Root -->
      <circle cx="400" cy="110" r="22" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
      <text x="400" y="115" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="monospace">ROOT</text>

      <!-- Branches -->
      <line x1="380" y1="125" x2="250" y2="185" stroke="#0284c7" stroke-width="2"/>
      <text x="300" y="150" fill="#38bdf8" font-size="14" font-weight="bold" font-family="monospace">'a'</text>

      <line x1="420" y1="125" x2="550" y2="185" stroke="#10b981" stroke-width="2"/>
      <text x="500" y="150" fill="#34d399" font-size="14" font-weight="bold" font-family="monospace">'b'</text>

      <!-- Node 'a' -->
      <circle cx="250" cy="195" r="20" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <text x="250" y="200" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="monospace">a</text>

      <!-- Node 'b' -->
      <circle cx="550" cy="195" r="20" fill="#10b981" stroke="#34d399" stroke-width="2"/>
      <text x="550" y="200" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="monospace">b</text>

      <!-- 'a' -> 'p' -->
      <line x1="250" y1="215" x2="250" y2="265" stroke="#0284c7" stroke-width="2"/>
      <text x="260" y="245" fill="#38bdf8" font-size="14" font-weight="bold" font-family="monospace">'p'</text>

      <circle cx="250" cy="285" r="20" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <text x="250" y="290" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="monospace">p</text>

      <!-- 'p' -> 'p' (end for "app") -->
      <line x1="250" y1="305" x2="250" y2="355" stroke="#0284c7" stroke-width="2"/>
      <text x="260" y="335" fill="#38bdf8" font-size="14" font-weight="bold" font-family="monospace">'p'</text>

      <circle cx="250" cy="375" r="22" fill="#0284c7" stroke="#fbbf24" stroke-width="3"/>
      <text x="250" y="380" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle" font-family="monospace">p*</text>

      <!-- Notes Box -->
      <rect x="420" y="260" width="330" height="145" rx="10" fill="#1e293b" stroke="#475569"/>
      <text x="440" y="290" fill="#fbbf24" font-size="13" font-weight="bold" font-family="system-ui, sans-serif">⭐ Star Marker = isEndOfWord</text>
      <text x="440" y="315" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Search &quot;app&quot; ➔ Found &amp; isEnd = true</text>
      <text x="440" y="335" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• StartsWith &quot;ap&quot; ➔ Found prefix</text>
      <text x="440" y="360" fill="#38bdf8" font-size="12" font-family="monospace">Time Complexity: O(Length)</text>
    </svg>`,
  },
  {
    id: "gal_monotonic_stack",
    slug: "monotonic-stack-evolution",
    title: "Monotonic Stack Evolution",
    category: "data_structures",
    description: "Next Greater / Smaller element resolution in linear O(N) time with monotonic order preservation.",
    detailedNotes: [
      "Monotonic Increasing Stack: Resolves Next Smaller Element; elements popped when incoming element is smaller.",
      "Monotonic Decreasing Stack: Resolves Next Greater Element; elements popped when incoming element is larger.",
      "Amortized O(N) Invariant: Every element is pushed onto the stack exactly once and popped at most once.",
    ],
    aspectRatio: "16/9",
    altText: "Diagram showing Monotonic Stack push and pop mechanics for Next Greater Element.",
    topics: ["Monotonic Stack", "Stacks", "Arrays", "Next Greater Element"],
    difficulty: "Medium",
    relatedSkillNodeId: "stack",
    relatedProblemId: 739, // Daily Temperatures
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Monotonic Stack Evolution &amp; Invariants</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Linear Time O(N) Next Greater / Smaller Element Resolution</text>

      <!-- Input Array -->
      <rect x="60" y="100" width="680" height="75" rx="10" fill="#1e293b" stroke="#334155"/>
      <text x="80" y="125" fill="#38bdf8" font-size="13" font-weight="bold" font-family="system-ui, sans-serif">Input Array: [73, 74, 75, 71, 69, 72, 76]</text>
      <text x="80" y="155" fill="#94a3b8" font-size="12" font-family="monospace">Indexes:      0   1   2   3   4   5   6</text>

      <!-- Stack Visual -->
      <rect x="60" y="195" width="320" height="220" rx="12" fill="#1e293b" stroke="#0284c7" stroke-width="2"/>
      <text x="80" y="225" fill="#38bdf8" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">Monotonic Decreasing Stack</text>
      <g transform="translate(80, 245)">
        <rect x="0" y="0" width="280" height="35" rx="6" fill="#0f172a" stroke="#0284c7"/>
        <text x="20" y="22" fill="#38bdf8" font-size="12" font-family="monospace">idx: 4 (val: 69)  ◀ TOP</text>
        <rect x="0" y="45" width="280" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
        <text x="20" y="67" fill="#cbd5e1" font-size="12" font-family="monospace">idx: 3 (val: 71)</text>
        <rect x="0" y="90" width="280" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
        <text x="20" y="112" fill="#cbd5e1" font-size="12" font-family="monospace">idx: 2 (val: 75)  ◀ BOTTOM</text>
      </g>

      <!-- Action Card -->
      <rect x="410" y="195" width="330" height="220" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <text x="430" y="225" fill="#34d399" font-size="15" font-weight="bold" font-family="system-ui, sans-serif">Incoming Element: 72 (idx 5)</text>
      <text x="430" y="255" fill="#fbbf24" font-size="12" font-family="system-ui, sans-serif">1. 72 &gt; 69 (Top) ➔ POP idx 4</text>
      <text x="450" y="275" fill="#94a3b8" font-size="11" font-family="monospace">res[4] = 5 - 4 = 1 day</text>
      <text x="430" y="305" fill="#fbbf24" font-size="12" font-family="system-ui, sans-serif">2. 72 &gt; 71 (Top) ➔ POP idx 3</text>
      <text x="450" y="325" fill="#94a3b8" font-size="11" font-family="monospace">res[3] = 5 - 3 = 2 days</text>
      <text x="430" y="355" fill="#34d399" font-size="12" font-family="system-ui, sans-serif">3. 72 &lt; 75 ➔ PUSH idx 5 (72)</text>
      <text x="430" y="390" fill="#38bdf8" font-size="12" font-family="monospace">Total Ops: 2N ➔ O(N) Linear Time</text>
    </svg>`,
  },
  {
    id: "gal_heap_array_layout",
    slug: "heap-array-layout",
    title: "Binary Heap Array Layout & Arithmetic",
    category: "data_structures",
    description: "0-indexed array arithmetic mapping parent and child pointers without explicit reference node allocations.",
    detailedNotes: [
      "Parent/Child Index Arithmetic: Left child = 2i + 1, Right child = 2i + 2, Parent = floor((i - 1) / 2).",
      "Heap Invariant (Min-Heap): parent.val <= child.val for all subtree nodes.",
      "Logarithmic Sift Operations: siftUp (on push) and siftDown (on popMin) execute in O(log N) depth operations.",
    ],
    aspectRatio: "16/9",
    altText: "Visual mapping between binary heap tree structure and flat array index arithmetic.",
    topics: ["Heaps", "Priority Queue", "Binary Tree", "Array Layout"],
    difficulty: "Medium",
    relatedSkillNodeId: "heap",
    relatedProblemId: 215, // Kth Largest Element
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Binary Heap Array Index Mapping</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">0-Indexed Complete Binary Tree Flattened into Memory</text>

      <!-- Tree Nodes -->
      <circle cx="200" cy="120" r="20" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <text x="200" y="125" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="monospace">10 [0]</text>

      <line x1="185" y1="135" x2="135" y2="185" stroke="#475569" stroke-width="2"/>
      <line x1="215" y1="135" x2="265" y2="185" stroke="#475569" stroke-width="2"/>

      <circle cx="125" cy="195" r="18" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <text x="125" y="200" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">15 [1]</text>

      <circle cx="275" cy="195" r="18" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <text x="275" y="200" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">30 [2]</text>

      <!-- Array Mapping -->
      <rect x="60" y="270" width="680" height="70" rx="10" fill="#1e293b" stroke="#334155"/>
      <text x="80" y="295" fill="#38bdf8" font-size="12" font-weight="bold" font-family="system-ui, sans-serif">Array Indices &amp; Values:</text>
      
      <g transform="translate(80, 305)">
        <rect x="0" y="0" width="80" height="28" rx="4" fill="#0284c7"/>
        <text x="40" y="18" fill="#ffffff" font-size="11" font-family="monospace" text-anchor="middle">[0]: 10</text>
        <rect x="90" y="0" width="80" height="28" rx="4" fill="#0369a1"/>
        <text x="130" y="18" fill="#ffffff" font-size="11" font-family="monospace" text-anchor="middle">[1]: 15</text>
        <rect x="180" y="0" width="80" height="28" rx="4" fill="#0369a1"/>
        <text x="220" y="18" fill="#ffffff" font-size="11" font-family="monospace" text-anchor="middle">[2]: 30</text>
      </g>

      <!-- Formulas -->
      <rect x="400" y="100" width="340" height="150" rx="10" fill="#1e293b" stroke="#10b981"/>
      <text x="420" y="130" fill="#34d399" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">Index Arithmetic Invariants:</text>
      <text x="420" y="160" fill="#cbd5e1" font-size="12" font-family="monospace">• Left Child  = 2 * i + 1</text>
      <text x="420" y="185" fill="#cbd5e1" font-size="12" font-family="monospace">• Right Child = 2 * i + 2</text>
      <text x="420" y="210" fill="#cbd5e1" font-size="12" font-family="monospace">• Parent      = Math.floor((i - 1) / 2)</text>
      <text x="420" y="235" fill="#fbbf24" font-size="11" font-family="system-ui, sans-serif">Zero node pointer overhead!</text>
    </svg>`,
  },
  {
    id: "gal_graph_representations",
    slug: "graph-representations-matrix-list",
    title: "Graph Representations: Adjacency List vs Matrix",
    category: "data_structures",
    description: "Memory footprint, neighbor lookup velocity, and cache locality trade-offs between Matrix and List representations.",
    detailedNotes: [
      "Adjacency Matrix: O(V^2) space, O(1) edge existence check (good for dense graphs where E ~ V^2).",
      "Adjacency List: O(V + E) space, O(degree(u)) neighbor iteration (optimal for sparse graphs where E << V^2).",
      "Contest Standard: Vector of Vectors / Map of Arrays is standard across LeetCode & Codeforces.",
    ],
    aspectRatio: "16/9",
    altText: "Comparison of Graph Adjacency List versus Adjacency Matrix memory layout and asymptotic complexity.",
    topics: ["Graphs", "Adjacency List", "Adjacency Matrix", "Data Structures"],
    difficulty: "Medium",
    relatedSkillNodeId: "graphs",
    relatedProblemId: 200, // Number of Islands / Course Schedule
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Graph Memory: Adjacency List vs Matrix</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Space-Time Complexity &amp; Density Trade-offs</text>

      <!-- Left Card: Adjacency List -->
      <rect x="50" y="95" width="335" height="315" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <text x="75" y="125" fill="#34d399" font-size="16" font-weight="bold" font-family="system-ui, sans-serif">Adjacency List (Sparse Standard)</text>
      <text x="75" y="150" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif">Memory: <tspan fill="#34d399" font-weight="bold">O(V + E)</tspan></text>
      
      <rect x="75" y="170" width="285" height="130" rx="8" fill="#0f172a"/>
      <text x="90" y="195" fill="#e2e8f0" font-size="12" font-family="monospace">0 ➔ [1, 4]</text>
      <text x="90" y="220" fill="#e2e8f0" font-size="12" font-family="monospace">1 ➔ [0, 2, 3]</text>
      <text x="90" y="245" fill="#e2e8f0" font-size="12" font-family="monospace">2 ➔ [1, 3]</text>
      <text x="90" y="270" fill="#e2e8f0" font-size="12" font-family="monospace">3 ➔ [1, 2, 4]</text>

      <text x="75" y="325" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">✓ Iterate neighbors in O(degree)</text>
      <text x="75" y="345" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">✓ Optimal for E &lt;&lt; V^2</text>
      <text x="75" y="385" fill="#fbbf24" font-size="11" font-family="system-ui, sans-serif">Recommended for 95% of contest problems</text>

      <!-- Right Card: Adjacency Matrix -->
      <rect x="415" y="95" width="335" height="315" rx="12" fill="#1e293b" stroke="#0284c7" stroke-width="2"/>
      <text x="440" y="125" fill="#38bdf8" font-size="16" font-weight="bold" font-family="system-ui, sans-serif">Adjacency Matrix (Dense / Weights)</text>
      <text x="440" y="150" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif">Memory: <tspan fill="#f87171" font-weight="bold">O(V^2)</tspan></text>

      <rect x="440" y="170" width="285" height="130" rx="8" fill="#0f172a"/>
      <text x="460" y="195" fill="#38bdf8" font-size="11" font-family="monospace">  0 1 2 3</text>
      <text x="460" y="220" fill="#e2e8f0" font-size="11" font-family="monospace">0 [0,1,0,1]</text>
      <text x="460" y="245" fill="#e2e8f0" font-size="11" font-family="monospace">1 [1,0,1,1]</text>
      <text x="460" y="270" fill="#e2e8f0" font-size="11" font-family="monospace">2 [0,1,0,1]</text>

      <text x="440" y="325" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">✓ O(1) edge existence query</text>
      <text x="440" y="345" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">✗ Excessive memory when V &gt; 10^4</text>
      <text x="440" y="385" fill="#38bdf8" font-size="11" font-family="system-ui, sans-serif">Useful for Floyd-Warshall all-pairs</text>
    </svg>`,
  },
  {
    id: "gal_dsa_coach_architecture",
    slug: "dsa-coach-architecture-flow",
    title: "DSA AI Coach Engine Coordination",
    category: "system_architecture",
    description: "Unified data flow across Performance Intelligence, Strategic Interventions, Preparation Orchestrator, and Daily Planner.",
    detailedNotes: [
      "Preparation Command Center (/preparation): Authoritative goal specification and milestone tracking.",
      "Longitudinal Performance Intelligence (/performance): Aggregates 7d/30d/90d event trends and persistent weaknesses.",
      "Adaptive Intervention Engine (/strategy): Diagnoses plateau/decay modes and publishes tactical signals.",
      "Preparation Orchestrator (/prepare): Deterministic 10-level constraint resolver creating actionable handoffs.",
    ],
    aspectRatio: "16/9",
    altText: "Architecture flowchart showing coordination among Performance Intelligence, Strategic Intervention, Preparation Orchestration, and Daily Planner.",
    topics: ["Architecture", "System Flow", "AI Coach", "Orchestration"],
    difficulty: "Easy",
    createdAt: "2026-09-01T00:00:00Z",
    svgContent: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect width="800" height="450" rx="16" fill="#0f172a"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">DSA AI Coach Subsystem Coordination</text>
      <text x="400" y="70" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">Deterministic Authority Separation &amp; Signal Pipeline</text>

      <!-- Flow Boxes -->
      <!-- Box 1 -->
      <rect x="50" y="110" width="150" height="120" rx="10" fill="#1e293b" stroke="#0284c7" stroke-width="2"/>
      <text x="125" y="140" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Performance</text>
      <text x="125" y="160" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">7d/30d/90d Trends</text>
      <text x="125" y="180" fill="#cbd5e1" font-size="10" text-anchor="middle" font-family="monospace">Weakness Signals</text>

      <!-- Arrow 1 -->
      <polygon points="225,170 215,165 215,175" fill="#38bdf8"/>

      <!-- Box 2 -->
      <rect x="230" y="110" width="150" height="120" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <text x="305" y="140" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Intervention</text>
      <text x="305" y="160" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">Strategy Engine</text>
      <text x="305" y="180" fill="#cbd5e1" font-size="10" text-anchor="middle" font-family="monospace">Diagnosis Pipeline</text>

      <!-- Arrow 2 -->
      <polygon points="405,170 395,165 395,175" fill="#fbbf24"/>

      <!-- Box 3 -->
      <rect x="410" y="110" width="150" height="120" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <text x="485" y="140" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Orchestrator</text>
      <text x="485" y="160" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">Plan Generation</text>
      <text x="485" y="180" fill="#cbd5e1" font-size="10" text-anchor="middle" font-family="monospace">10-Tier Precedence</text>

      <!-- Arrow 3 -->
      <polygon points="585,170 575,165 575,175" fill="#34d399"/>

      <!-- Box 4 -->
      <rect x="590" y="110" width="160" height="120" rx="10" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
      <text x="670" y="140" fill="#a5b4fc" font-size="13" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Daily Plan</text>
      <text x="670" y="160" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">Action Execution</text>
      <text x="670" y="180" fill="#cbd5e1" font-size="10" text-anchor="middle" font-family="monospace">SRS + Roadmap</text>

      <!-- Bottom Summary Box -->
      <rect x="50" y="260" width="700" height="150" rx="12" fill="#1e293b" stroke="#334155"/>
      <text x="75" y="290" fill="#38bdf8" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">Unified Execution Invariant:</text>
      <text x="75" y="320" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Goal Authority: Preparation Command Center sets target date and domain objectives.</text>
      <text x="75" y="345" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Analysis Authority: Performance Intelligence tracks longitudinal mastery without mutating goals.</text>
      <text x="75" y="370" fill="#cbd5e1" font-size="12" font-family="system-ui, sans-serif">• Execution Authority: Practice Session Engine enforces active timer recovery and queue trimming.</text>
      <text x="75" y="395" fill="#34d399" font-size="11" font-family="monospace">All state flows deterministically without circular feedback loops.</text>
    </svg>`,
  },
];

export const VIRTUAL_TOURS: VirtualTour[] = [
  {
    id: "tour_algo_patterns",
    slug: "foundational-algo-patterns",
    title: "Foundational Algorithmic Patterns Tour",
    description: "A step-by-step visual journey through the most critical interview patterns: Two Pointers, Sliding Window, Binary Search, DP, and Backtracking.",
    category: "algorithm_patterns",
    estimatedMinutes: 8,
    coverItemId: "gal_two_pointers",
    targetAudience: "All Levels",
    steps: [
      {
        stepNumber: 1,
        galleryItemId: "gal_two_pointers",
        headline: "Step 1: Pointer Convergence & Cycle Invariants",
        narration: "Start by understanding two-pointer mechanics. For sorted arrays, inward pointer convergence yields O(N) pair searches with O(1) space. In linked lists, Floyd's fast and slow pointers detect cycles with mathematical certainty.",
        keyTakeaways: [
          "Inward convergence reduces O(N^2) searches to linear O(N).",
          "Fast & slow pointers confirm cycle existence when slow === fast.",
        ],
        actionPrompt: "Review the pointer boundary termination conditions in the diagram.",
      },
      {
        stepNumber: 2,
        galleryItemId: "gal_sliding_window",
        headline: "Step 2: Subarray Optimization via Sliding Window",
        narration: "Next, transition from two distinct pointers to a continuous window. The sliding window state machine expands the right pointer to include elements, and only contracts the left pointer when constraints are violated.",
        keyTakeaways: [
          "Avoid nested loops: both pointers advance monotonically for amortized O(N).",
          "Always verify the window invariant before updating global answer values.",
        ],
        actionPrompt: "Observe the 3-step state cycle: Expand Right ➔ Contract Left ➔ Update Result.",
      },
      {
        stepNumber: 3,
        galleryItemId: "gal_binary_search",
        headline: "Step 3: Logarithmic Halving with Binary Search",
        narration: "When your search space has a monotonic predicate (False, False, ..., True, True), Binary Search halves the candidate space in O(log N). Always maintain explicit boundary invariants on Low and High.",
        keyTakeaways: [
          "Calculate mid = low + ((high - low) >> 1) to prevent integer overflow.",
          "Identify monotonic properties even on non-sorted array problems (Binary Search on Answer).",
        ],
        actionPrompt: "Check Case A and Case B pointer updates to avoid infinite boundary loops.",
      },
      {
        stepNumber: 4,
        galleryItemId: "gal_dp_memo_tree",
        headline: "Step 4: Pruning Exponential Recursion with DP",
        narration: "Dynamic Programming eliminates redundant computation. When overlapping subproblems exist in a recursion tree, caching state tuple results in a memo table collapses O(2^N) exponential time into O(N) DAG evaluation.",
        keyTakeaways: [
          "Identify overlapping subproblems and optimal substructure.",
          "Memoization caches subproblem results on first visit for O(1) subsequent lookups.",
        ],
        actionPrompt: "Notice how node f(2)* is pruned immediately without recursive re-expansion.",
      },
      {
        stepNumber: 5,
        galleryItemId: "gal_backtracking_space",
        headline: "Step 5: Exhaustive Exploration with State Restoration",
        narration: "Backtracking explores combinatorial search spaces. The universal rule is: Choose candidate ➔ Explore next level ➔ Unchoose to restore exact state before exploring alternative siblings.",
        keyTakeaways: [
          "Always undo state modifications (path.pop(), visited.delete()) after recursion returns.",
          "Prune dead-end search branches early to save computation.",
        ],
        actionPrompt: "Study the Choose-Explore-Unchoose triad and standard recursion skeleton.",
      },
    ],
  },
  {
    id: "tour_data_structures",
    slug: "core-data-structures-tour",
    title: "Core Data Structures Visual Tour",
    description: "Explore the internal memory layout, pointer structures, and index arithmetic of Tries, Stacks, Heaps, and Graphs.",
    category: "data_structures",
    estimatedMinutes: 6,
    coverItemId: "gal_trie_prefix_tree",
    targetAudience: "Intermediate",
    steps: [
      {
        stepNumber: 1,
        galleryItemId: "gal_trie_prefix_tree",
        headline: "Step 1: Prefix Tree Architecture & Word Termination",
        narration: "Tries compress shared prefixes in string datasets. Each node represents character links to child nodes, and isEndOfWord flags distinguish prefix paths from complete dictionary entries.",
        keyTakeaways: [
          "Prefix lookups complete in O(L) time where L is string length, independent of dictionary size.",
          "Array-based children provide O(1) char indexing for fixed alphabets.",
        ],
        actionPrompt: "Observe how 'app' and 'apple' share common ancestor nodes.",
      },
      {
        stepNumber: 2,
        galleryItemId: "gal_monotonic_stack",
        headline: "Step 2: Linear Next-Greater Element with Monotonic Stack",
        narration: "Monotonic stacks maintain elements in strictly ascending or descending order. Elements are popped when an incoming item breaks the monotonic invariant, resolving next-greater/smaller queries in linear time.",
        keyTakeaways: [
          "Each item is pushed once and popped at most once for amortized O(N) runtime.",
          "Ideal for histogram, temperature, and nearest-boundary problems.",
        ],
        actionPrompt: "Follow the push/pop steps when incoming item 72 evaluates the top of stack.",
      },
      {
        stepNumber: 3,
        galleryItemId: "gal_heap_array_layout",
        headline: "Step 3: Complete Binary Heap Flat Array Arithmetic",
        narration: "Binary heaps flatten tree structures into standard 0-indexed memory arrays. Node relationships are calculated directly via 2i+1 and 2i+2 arithmetic, eliminating pointer storage overhead.",
        keyTakeaways: [
          "Min-Heap invariant guarantees root element [0] is always the global minimum.",
          "Sift operations run in logarithmic O(log N) depth time.",
        ],
        actionPrompt: "Verify the parent/child index formula mapping array slots to tree levels.",
      },
      {
        stepNumber: 4,
        galleryItemId: "gal_graph_representations",
        headline: "Step 4: Adjacency List vs Adjacency Matrix Trade-offs",
        narration: "Selecting between Adjacency Lists and Matrices depends on graph density. Adjacency Lists provide optimal O(V + E) space for sparse graphs, while Matrices offer O(1) edge lookups for dense topologies.",
        keyTakeaways: [
          "Adjacency Lists are preferred for sparse graphs (E << V^2).",
          "Adjacency Matrices simplify all-pairs shortest path algorithms like Floyd-Warshall.",
        ],
        actionPrompt: "Compare the memory allocation and neighbor iteration speeds in the summary table.",
      },
    ],
  },
  {
    id: "tour_coach_platform",
    slug: "dsa-coach-platform-tour",
    title: "DSA AI Coach Platform Tour",
    description: "Understand how the AI Coach coordinates longitudinal performance intelligence, adaptive strategy interventions, and daily schedule orchestration.",
    category: "system_architecture",
    estimatedMinutes: 4,
    coverItemId: "gal_dsa_coach_architecture",
    targetAudience: "All Levels",
    steps: [
      {
        stepNumber: 1,
        galleryItemId: "gal_dsa_coach_architecture",
        headline: "Step 1: End-to-End Engine Coordination Flow",
        narration: "The DSA AI Coach utilizes strict authority separation. Performance Intelligence compiles longitudinal trends, Strategy Engine diagnoses learning plateaus, Orchestrator resolves multi-constraint priorities, and Daily Plan schedules actionable practice blocks.",
        keyTakeaways: [
          "Unidirectional data flow guarantees zero circular feedback anomalies.",
          "Deterministic 10-tier precedence resolves competing daily priorities.",
        ],
        actionPrompt: "Trace the signal pipeline from Performance Intelligence through to Daily Plan execution.",
      },
    ],
  },
];
