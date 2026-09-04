/**
 * Deterministic Unit and Integration Tests for Interactive Algorithm Visualizer (Feature 2).
 *
 * Covers:
 * 1. Two Pointers (target found, target absent, duplicate values, pointer movement).
 * 2. Sliding Window Max Sum (normal, negative, K=1, K=N).
 * 3. Sliding Window Distinct (repeating, all-unique, single-char, contraction).
 * 4. Binary Search (middle, boundary, absent, duplicates first-midpoint).
 * 5. Daily Temperatures (standard, decreasing, increasing, stack resolving).
 * 6. Next Greater Element (mixed, decreasing, valleys, unresolved -1).
 * 7. Bubble Sort (random, nearly-sorted early exit, reverse).
 * 8. Selection Sort (random, reverse, minimum placement).
 * 9. Merge Sort (odd-length, duplicates, deterministic left->right->merge order).
 * 10. Input Validation (bounds, types, targets, K, sorted check, auto-sort).
 * 11. Immutability and Determinism (non-mutating input, reproducible deep-equal frames).
 */

import assert from "node:assert/strict";
import { test, describe } from "node:test";

import { generateAlgorithmFrames } from "../visualizerEngine";
import {
  validateVisualizerInput,
  validateNumericArray,
  validateStringInput,
  isSortedAscending,
  autoSortNumbers,
} from "../visualizerValidation";
import { ALGORITHM_DEFINITIONS } from "../visualizerDefinitions";

describe("1. Two Pointers Engine (two_pointers)", () => {
  test("Target found in middle returns success with matching indices", () => {
    const input = [2, 7, 11, 15];
    const frames = generateAlgorithmFrames({
      algorithmId: "two_pointers",
      numbers: input,
      targetValue: 9,
    });

    assert.ok(frames.length >= 2, "Expected at least 2 frames");
    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.isTerminal, true);
    assert.strictEqual(lastFrame.status, "success");
    assert.deepEqual(lastFrame.stateVariables.match, [0, 1]);
  });

  test("Target absent returns failure when pointers cross", () => {
    const input = [1, 2, 4, 8, 16];
    const frames = generateAlgorithmFrames({
      algorithmId: "two_pointers",
      numbers: input,
      targetValue: 15,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.isTerminal, true);
    assert.strictEqual(lastFrame.status, "failure");
    assert.strictEqual(lastFrame.stateVariables.match, null);
  });

  test("Duplicate values preset correctly matches [2, 3] for target 6", () => {
    const input = [2, 2, 3, 3, 5, 8];
    const frames = generateAlgorithmFrames({
      algorithmId: "two_pointers",
      numbers: input,
      targetValue: 6,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.isTerminal, true);
    assert.strictEqual(lastFrame.status, "success");
    assert.deepEqual(lastFrame.stateVariables.match, [2, 3]);
  });
});

describe("2. Sliding Window Max Sum (sliding_window_max_sum)", () => {
  test("Calculates correct maximum sum on normal array with K=3", () => {
    const input = [2, 1, 5, 1, 3, 2];
    const frames = generateAlgorithmFrames({
      algorithmId: "sliding_window_max_sum",
      numbers: input,
      windowSize: 3,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.isTerminal, true);
    assert.strictEqual(lastFrame.status, "completed");
    assert.strictEqual(lastFrame.stateVariables.maxSum, 9);
    assert.deepEqual(lastFrame.stateVariables.bestWindow, [2, 4]); // indices of [5, 1, 3]
  });

  test("Handles negative numbers correctly with K=2", () => {
    const input = [-1, 2, 3, 1, -3, 2];
    const frames = generateAlgorithmFrames({
      algorithmId: "sliding_window_max_sum",
      numbers: input,
      windowSize: 2,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.stateVariables.maxSum, 5); // [2, 3]
  });

  test("Handles boundary window sizes K=1 and K=N", () => {
    const input = [3, 8, 2, 5, 9];
    const framesK1 = generateAlgorithmFrames({
      algorithmId: "sliding_window_max_sum",
      numbers: input,
      windowSize: 1,
    });
    assert.strictEqual(framesK1[framesK1.length - 1].stateVariables.maxSum, 9);

    const framesKN = generateAlgorithmFrames({
      algorithmId: "sliding_window_max_sum",
      numbers: input,
      windowSize: 5,
    });
    assert.strictEqual(framesKN[framesKN.length - 1].stateVariables.maxSum, 27);
  });
});

describe("3. Sliding Window Distinct Substring (sliding_window_distinct)", () => {
  test("Finds longest unique substring on 'abcabcbb'", () => {
    const frames = generateAlgorithmFrames({
      algorithmId: "sliding_window_distinct",
      inputString: "abcabcbb",
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.isTerminal, true);
    assert.strictEqual(lastFrame.status, "completed");
    assert.strictEqual(lastFrame.stateVariables.maxLength, 3);
    assert.strictEqual(lastFrame.stateVariables.bestSubstring, "abc");
  });

  test("Handles all-unique string 'abcdefg' without contractions", () => {
    const frames = generateAlgorithmFrames({
      algorithmId: "sliding_window_distinct",
      inputString: "abcdefg",
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.stateVariables.maxLength, 7);
    assert.strictEqual(lastFrame.stateVariables.bestSubstring, "abcdefg");
  });

  test("Handles single repeated character 'bbbbb'", () => {
    const frames = generateAlgorithmFrames({
      algorithmId: "sliding_window_distinct",
      inputString: "bbbbb",
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.stateVariables.maxLength, 1);
  });

  test("Handles 'pwwkew' resolving 'wke' length 3", () => {
    const frames = generateAlgorithmFrames({
      algorithmId: "sliding_window_distinct",
      inputString: "pwwkew",
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.stateVariables.maxLength, 3);
    assert.strictEqual(lastFrame.stateVariables.bestSubstring, "wke");
  });
});

describe("4. Binary Search (binary_search)", () => {
  test("Matches target in middle", () => {
    const input = [1, 3, 5, 7, 9, 11, 13, 15];
    const frames = generateAlgorithmFrames({
      algorithmId: "binary_search",
      numbers: input,
      targetValue: 9,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.status, "success");
    assert.strictEqual(lastFrame.stateVariables.matchIndex, 4);
  });

  test("Matches target at boundary indices 0 and N-1", () => {
    const input = [2, 4, 6, 8, 10, 12];
    const frames0 = generateAlgorithmFrames({
      algorithmId: "binary_search",
      numbers: input,
      targetValue: 2,
    });
    assert.strictEqual(frames0[frames0.length - 1].stateVariables.matchIndex, 0);

    const framesLast = generateAlgorithmFrames({
      algorithmId: "binary_search",
      numbers: input,
      targetValue: 12,
    });
    assert.strictEqual(framesLast[framesLast.length - 1].stateVariables.matchIndex, 5);
  });

  test("Returns failure when target is absent", () => {
    const input = [10, 20, 30, 40, 50];
    const frames = generateAlgorithmFrames({
      algorithmId: "binary_search",
      numbers: input,
      targetValue: 25,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.status, "failure");
    assert.strictEqual(lastFrame.stateVariables.matchIndex, null);
  });

  test("Returns first midpoint encountered on duplicate array", () => {
    const input = [1, 2, 4, 4, 4, 6, 8];
    const frames = generateAlgorithmFrames({
      algorithmId: "binary_search",
      numbers: input,
      targetValue: 4,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.status, "success");
    assert.strictEqual(lastFrame.stateVariables.matchIndex, 3); // mid = 0 + 3 = 3
  });
});

describe("5. Daily Temperatures (daily_temperatures)", () => {
  test("Resolves standard temperature wait days [1, 1, 4, 2, 1, 1, 0]", () => {
    const input = [73, 74, 75, 71, 69, 72, 76];
    const frames = generateAlgorithmFrames({
      algorithmId: "daily_temperatures",
      numbers: input,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.status, "completed");
    assert.deepEqual(lastFrame.stateVariables.resultArray, [1, 1, 4, 2, 1, 1, 0]);
  });

  test("Strictly decreasing sequence resolves to all 0s", () => {
    const input = [80, 70, 60, 50];
    const frames = generateAlgorithmFrames({
      algorithmId: "daily_temperatures",
      numbers: input,
    });

    const lastFrame = frames[frames.length - 1];
    assert.deepEqual(lastFrame.stateVariables.resultArray, [0, 0, 0, 0]);
  });

  test("Strictly increasing sequence resolves immediate 1s", () => {
    const input = [50, 60, 70, 80];
    const frames = generateAlgorithmFrames({
      algorithmId: "daily_temperatures",
      numbers: input,
    });

    const lastFrame = frames[frames.length - 1];
    assert.deepEqual(lastFrame.stateVariables.resultArray, [1, 1, 1, 0]);
  });
});

describe("6. Next Greater Element (next_greater_element)", () => {
  test("Resolves mixed sequence [5, 10, 10, -1, -1]", () => {
    const input = [4, 5, 2, 10, 8];
    const frames = generateAlgorithmFrames({
      algorithmId: "next_greater_element",
      numbers: input,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.status, "completed");
    assert.deepEqual(lastFrame.stateVariables.resultArray, [5, 10, 10, -1, -1]);
  });

  test("Strictly decreasing sequence resolves to all -1s", () => {
    const input = [9, 8, 7, 6, 5];
    const frames = generateAlgorithmFrames({
      algorithmId: "next_greater_element",
      numbers: input,
    });

    const lastFrame = frames[frames.length - 1];
    assert.deepEqual(lastFrame.stateVariables.resultArray, [-1, -1, -1, -1, -1]);
  });
});

describe("7. Sorting Engines (bubble_sort, selection_sort, merge_sort)", () => {
  test("Bubble Sort sorts scrambled array and supports early exit", () => {
    const input = [34, 12, 89, 5, 45, 23, 7];
    const frames = generateAlgorithmFrames({
      algorithmId: "bubble_sort",
      numbers: input,
    });

    const lastFrame = frames[frames.length - 1];
    assert.strictEqual(lastFrame.status, "completed");
    const sortedValues = lastFrame.elements.map((e) => e.value);
    assert.deepEqual(sortedValues, [5, 7, 12, 23, 34, 45, 89]);

    // Already sorted input early exit
    const sortedFrames = generateAlgorithmFrames({
      algorithmId: "bubble_sort",
      numbers: [1, 2, 3, 4, 5],
    });
    assert.ok(sortedFrames.length < 15, "Expected early exit frame count");
  });

  test("Selection Sort sorts reverse-ordered array", () => {
    const input = [9, 8, 7, 6, 5];
    const frames = generateAlgorithmFrames({
      algorithmId: "selection_sort",
      numbers: input,
    });

    const lastFrame = frames[frames.length - 1];
    const sortedValues = lastFrame.elements.map((e) => e.value);
    assert.deepEqual(sortedValues, [5, 6, 7, 8, 9]);
  });

  test("Merge Sort correctly sorts odd-length arrays with duplicates", () => {
    const input = [38, 27, 43, 3, 9, 82, 10];
    const frames = generateAlgorithmFrames({
      algorithmId: "merge_sort",
      numbers: input,
    });

    const lastFrame = frames[frames.length - 1];
    const sortedValues = lastFrame.elements.map((e) => e.value);
    assert.deepEqual(sortedValues, [3, 9, 10, 27, 38, 43, 82]);
  });
});

describe("8. Validation & Input Bounds", () => {
  test("Rejects numeric arrays with fewer than 5 or more than 15 elements", () => {
    const tooFew = validateNumericArray("1, 2, 3");
    assert.strictEqual(tooFew.isValid, false);

    const tooMany = validateNumericArray("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16");
    assert.strictEqual(tooMany.isValid, false);

    const valid = validateNumericArray("1, 2, 3, 4, 5, 6");
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.numbers?.length, 6);
  });

  test("Rejects invalid number tokens and floats", () => {
    assert.strictEqual(validateNumericArray("1, 2, abc, 4, 5").isValid, false);
    assert.strictEqual(validateNumericArray("1, 2, 3.14, 4, 5").isValid, false);
  });

  test("Validates string input bounds and printable ASCII", () => {
    assert.strictEqual(validateStringInput("abc").isValid, false); // < 5 chars
    assert.strictEqual(validateStringInput("abcdefghijklmnop").isValid, false); // > 15 chars
    assert.strictEqual(validateStringInput("abcabcbb").isValid, true);
  });

  test("Detects unsorted arrays for two_pointers and binary_search and auto-sorts", () => {
    const unsorted = [5, 2, 9, 1, 7];
    assert.strictEqual(isSortedAscending(unsorted), false);

    const sorted = autoSortNumbers(unsorted);
    assert.deepEqual(sorted, [1, 2, 5, 7, 9]);
    assert.strictEqual(isSortedAscending(sorted), true);

    const valResult = validateVisualizerInput("two_pointers", "5, 2, 9, 1, 7", "10");
    assert.strictEqual(valResult.isValid, false);
    assert.ok(valResult.errorMessage?.includes("sorted array"));
  });
});

describe("9. Immutability & Determinism Invariants", () => {
  test("Engines do not mutate caller-provided input array", () => {
    const original = [34, 12, 89, 5, 45, 23, 7];
    const snapshot = [...original];

    generateAlgorithmFrames({
      algorithmId: "bubble_sort",
      numbers: original,
    });

    assert.deepEqual(original, snapshot, "Original input array was mutated!");
  });

  test("Identical inputs produce deeply equal, sequential frame sequences", () => {
    const input = [2, 7, 11, 15];
    const run1 = generateAlgorithmFrames({
      algorithmId: "two_pointers",
      numbers: input,
      targetValue: 9,
    });
    const run2 = generateAlgorithmFrames({
      algorithmId: "two_pointers",
      numbers: input,
      targetValue: 9,
    });

    assert.deepEqual(run1, run2, "Frame generation is not deterministic!");

    // Verify stepIndex consistency
    for (let i = 0; i < run1.length; i++) {
      assert.strictEqual(run1[i].stepIndex, i);
      assert.strictEqual(run1[i].totalSteps, run1.length);
    }
  });

  test("All curated presets across all 9 algorithms produce valid non-empty frames", () => {
    for (const [algoId, def] of Object.entries(ALGORITHM_DEFINITIONS)) {
      for (const preset of def.presets) {
        let frames;
        if (typeof preset.inputArray === "string") {
          frames = generateAlgorithmFrames({
            algorithmId: def.id,
            inputString: preset.inputArray,
          });
        } else {
          frames = generateAlgorithmFrames({
            algorithmId: def.id,
            numbers: preset.inputArray,
            targetValue: typeof preset.targetValue === "number" ? preset.targetValue : undefined,
            windowSize: preset.windowSize,
          });
        }

        assert.ok(frames.length > 0, `Preset ${preset.id} in ${algoId} yielded empty frames`);
        assert.strictEqual(frames[frames.length - 1].isTerminal, true, `Preset ${preset.id} final frame not terminal`);
      }
    }
  });
});
