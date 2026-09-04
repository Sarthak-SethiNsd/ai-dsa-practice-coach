import { AlgorithmPreset, VisualizerAlgorithmId } from "./visualizerTypes";

export const ALGORITHM_PRESETS: Record<VisualizerAlgorithmId, readonly AlgorithmPreset[]> = {
  two_pointers: [
    {
      id: "two_pointers_found",
      title: "Target Found in Middle",
      description: "Standard pair convergence finding target sum 9 at indices [0, 1].",
      inputArray: [2, 7, 11, 15],
      targetValue: 9,
      expectedOutcome: "Found pair at indices [0, 1] (2 + 7 = 9)",
    },
    {
      id: "two_pointers_not_found",
      title: "Target Not Found",
      description: "Pointers cross without finding pair summing to 15.",
      inputArray: [1, 2, 4, 8, 16],
      targetValue: 15,
      expectedOutcome: "Pointers crossed without finding target sum 15",
    },
    {
      id: "two_pointers_far_ends",
      title: "Target at Extreme Ends",
      description: "First and last elements sum to target 29.",
      inputArray: [1, 3, 6, 10, 15, 21, 28],
      targetValue: 29,
      expectedOutcome: "Found pair at indices [0, 6] (1 + 28 = 29)",
    },
    {
      id: "two_pointers_duplicates",
      title: "Duplicate Values",
      description: "Deterministic pair matching with duplicate numbers summing to 6.",
      inputArray: [2, 2, 3, 3, 5, 8],
      targetValue: 6,
      expectedOutcome: "Found pair at indices [2, 3] (3 + 3 = 6)",
    },
  ],

  sliding_window_max_sum: [
    {
      id: "sliding_max_k3",
      title: "Window Size K=3",
      description: "Standard fixed window finding maximum contiguous sum of 9.",
      inputArray: [2, 1, 5, 1, 3, 2],
      windowSize: 3,
      expectedOutcome: "Maximum window sum is 9 (elements [5, 1, 3])",
    },
    {
      id: "sliding_max_negative",
      title: "Mixed Positive & Negative",
      description: "Window size K=2 with negative values reaching maximum sum 5.",
      inputArray: [-1, 2, 3, 1, -3, 2],
      windowSize: 2,
      expectedOutcome: "Maximum window sum is 5 (elements [2, 3])",
    },
    {
      id: "sliding_max_all_pos",
      title: "Window Size K=4",
      description: "Larger window finding maximum sum 39 across [4, 2, 10, 23].",
      inputArray: [1, 4, 2, 10, 23, 3, 1, 0],
      windowSize: 4,
      expectedOutcome: "Maximum window sum is 39 (elements [4, 2, 10, 23])",
    },
  ],

  sliding_window_distinct: [
    {
      id: "sliding_distinct_normal",
      title: "Classic Repeating String",
      description: "Standard string with duplicate character contractions.",
      inputArray: "abcabcbb",
      expectedOutcome: "Longest unique substring is 'abc' with length 3",
    },
    {
      id: "sliding_distinct_all_unique",
      title: "All Unique Characters",
      description: "String without duplicate characters expanding to length 7.",
      inputArray: "abcdefg",
      expectedOutcome: "All characters unique, longest substring is 'abcdefg' with length 7",
    },
    {
      id: "sliding_distinct_repeating",
      title: "Single Repeated Character",
      description: "String with same character repeating, maximum length 1.",
      inputArray: "bbbbb",
      expectedOutcome: "Continuous duplicate contractions; longest unique substring is 'b' with length 1",
    },
    {
      id: "sliding_distinct_pwwkew",
      title: "Substring 'pwwkew'",
      description: "Substring contraction resolving 'wke' with length 3.",
      inputArray: "pwwkew",
      expectedOutcome: "Longest unique substring is 'wke' with length 3",
    },
  ],

  binary_search: [
    {
      id: "binary_search_middle",
      title: "Target in Middle",
      description: "Target 9 located at midpoint index 4.",
      inputArray: [1, 3, 5, 7, 9, 11, 13, 15],
      targetValue: 9,
      expectedOutcome: "Matched target 9 at midpoint index 4",
    },
    {
      id: "binary_search_left_boundary",
      title: "Target at Left Boundary",
      description: "Target 2 located at index 0.",
      inputArray: [2, 4, 6, 8, 10, 12],
      targetValue: 2,
      expectedOutcome: "Matched target 2 at left boundary index 0",
    },
    {
      id: "binary_search_absent",
      title: "Target Absent",
      description: "Search interval exhausted without finding target 25.",
      inputArray: [10, 20, 30, 40, 50],
      targetValue: 25,
      expectedOutcome: "Search interval exhausted; target 25 is absent",
    },
    {
      id: "binary_search_duplicates",
      title: "Duplicate Values",
      description: "Returns the first midpoint encountered (index 3) for target 4.",
      inputArray: [1, 2, 4, 4, 4, 6, 8],
      targetValue: 4,
      expectedOutcome: "Matched target 4 at midpoint index 3 (first encountered index by deterministic midpoint)",
    },
  ],

  daily_temperatures: [
    {
      id: "daily_temps_standard",
      title: "Standard Temperature Sequence",
      description: "Resolves wait days array [1, 1, 4, 2, 1, 1, 0].",
      inputArray: [73, 74, 75, 71, 69, 72, 76],
      expectedOutcome: "Resolved wait days array: [1, 1, 4, 2, 1, 1, 0]",
    },
    {
      id: "daily_temps_decreasing",
      title: "Strictly Decreasing Temps",
      description: "No warmer days ahead; all elements remain on stack.",
      inputArray: [80, 70, 60, 50],
      expectedOutcome: "Monotonically decreasing; resolved wait days array: [0, 0, 0, 0]",
    },
    {
      id: "daily_temps_increasing",
      title: "Strictly Increasing Temps",
      description: "Every day has a warmer next day.",
      inputArray: [50, 60, 70, 80],
      expectedOutcome: "Immediate next-day increases; resolved wait days array: [1, 1, 1, 0]",
    },
  ],

  next_greater_element: [
    {
      id: "nge_mixed",
      title: "Mixed Sequence",
      description: "Resolves next greater elements [5, 10, 10, -1, -1].",
      inputArray: [4, 5, 2, 10, 8],
      expectedOutcome: "Resolved next greater elements: [5, 10, 10, -1, -1]",
    },
    {
      id: "nge_decreasing",
      title: "Strictly Decreasing",
      description: "No greater elements to the right for any item.",
      inputArray: [9, 8, 7, 6, 5],
      expectedOutcome: "No greater elements; resolved array: [-1, -1, -1, -1, -1]",
    },
    {
      id: "nge_valleys",
      title: "Valleys & Peaks",
      description: "Resolves elements with local dips and peaks [4, 2, 4, -1, -1].",
      inputArray: [2, 1, 2, 4, 3],
      expectedOutcome: "Resolved next greater elements: [4, 2, 4, -1, -1]",
    },
  ],

  bubble_sort: [
    {
      id: "bubble_random",
      title: "Random Scramble",
      description: "Sorts scrambled array [34, 12, 89, 5, 45, 23, 7] in ascending order.",
      inputArray: [34, 12, 89, 5, 45, 23, 7],
      expectedOutcome: "Sorted to: [5, 7, 12, 23, 34, 45, 89]",
    },
    {
      id: "bubble_nearly_sorted",
      title: "Nearly Sorted (Early Exit)",
      description: "Early termination after 1 swap pass on [1, 2, 4, 3, 5, 6, 7].",
      inputArray: [1, 2, 4, 3, 5, 6, 7],
      expectedOutcome: "Early termination after 1 swap pass: [1, 2, 3, 4, 5, 6, 7]",
    },
    {
      id: "bubble_reverse",
      title: "Reverse Sorted",
      description: "Maximum number of adjacent swaps on reverse sorted array.",
      inputArray: [9, 8, 7, 6, 5, 4, 3],
      expectedOutcome: "Maximum swap passes completed: [3, 4, 5, 6, 7, 8, 9]",
    },
  ],

  selection_sort: [
    {
      id: "selection_random",
      title: "Random Array",
      description: "Repeatedly locates minimum in unsorted suffix and swaps to front.",
      inputArray: [64, 25, 12, 22, 11],
      expectedOutcome: "Sorted to: [11, 12, 22, 25, 64]",
    },
    {
      id: "selection_reverse",
      title: "Reverse Sorted",
      description: "Swaps global minimum to current prefix index on every pass.",
      inputArray: [9, 8, 7, 6, 5],
      expectedOutcome: "Minimum swapped to front on each pass: [5, 6, 7, 8, 9]",
    },
  ],

  merge_sort: [
    {
      id: "merge_random",
      title: "Random Odd-Length Array",
      description: "Deterministic left-first divide-and-conquer merges on odd-sized array.",
      inputArray: [38, 27, 43, 3, 9, 82, 10],
      expectedOutcome: "Divide-and-conquer merges completed: [3, 9, 10, 27, 38, 43, 82]",
    },
    {
      id: "merge_halves",
      title: "Two Pre-Sorted Halves",
      description: "Merges left half [4, 5, 6] and right half [1, 2, 3].",
      inputArray: [4, 5, 6, 1, 2, 3],
      expectedOutcome: "Two sorted halves merged into: [1, 2, 3, 4, 5, 6]",
    },
  ],
};
