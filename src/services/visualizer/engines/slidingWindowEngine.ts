import { AlgorithmFrame, VisualElement } from "../visualizerTypes";

/**
 * Deterministic frame generator for Sliding Window (Maximum Sum Subarray of Size K).
 */
export function generateSlidingWindowMaxSumFrames(
  input: readonly number[],
  k: number
): readonly AlgorithmFrame[] {
  const arr = [...input];
  const n = arr.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  // Helper to build visual elements
  const makeElements = (
    wLeft: number,
    wRight: number,
    activeIdx?: number,
    highlightType: "window_active" | "comparing" | "matched" = "window_active"
  ): readonly VisualElement[] => {
    return arr.map((val, idx) => {
      const inWindow = idx >= wLeft && idx <= wRight;
      return {
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: idx === activeIdx ? "comparing" : inWindow ? highlightType : "default",
        label: idx === wLeft && idx === wRight ? "L/R" : idx === wLeft ? "L" : idx === wRight ? "R" : undefined,
      };
    });
  };

  // Phase 1: Build initial window [0 .. k - 1]
  let currentSum = 0;
  for (let i = 0; i < k; i++) {
    currentSum += arr[i];
    rawFrames.push({
      activeLineNumber: 2,
      explanation: `Building initial window: added arr[${i}] (${arr[i]}) to currentSum = ${currentSum}. Window bounds: [0, ${i}].`,
      elements: makeElements(0, i, i),
      stateVariables: {
        left: 0,
        right: i,
        windowSize: k,
        currentSum,
        maxSum: null,
        bestWindow: null,
      },
      isTerminal: false,
      status: "running",
    });
  }

  let maxSum = currentSum;
  let bestWindow: [number, number] = [0, k - 1];

  // Record initial max sum
  rawFrames.push({
    activeLineNumber: 2,
    explanation: `Initial window [0, ${k - 1}] complete with sum ${currentSum}. Initial maxSum = ${maxSum}.`,
    elements: makeElements(0, k - 1),
    stateVariables: {
      left: 0,
      right: k - 1,
      windowSize: k,
      currentSum,
      maxSum,
      bestWindow: [bestWindow[0], bestWindow[1]],
    },
    isTerminal: false,
    status: "running",
  });

  // Phase 2: Slide window from k to n - 1
  let left = 0;
  for (let right = k; right < n; right++) {
    // Step A: Add incoming right element
    currentSum += arr[right];
    rawFrames.push({
      activeLineNumber: 4,
      explanation: `Sliding: Incoming element arr[${right}] (${arr[right]}) added to window. currentSum = ${currentSum}.`,
      elements: makeElements(left, right, right),
      stateVariables: {
        left,
        right,
        windowSize: k,
        currentSum,
        maxSum,
        bestWindow: [bestWindow[0], bestWindow[1]],
      },
      isTerminal: false,
      status: "running",
    });

    // Step B: Subtract outgoing left element & advance left pointer
    const outgoingVal = arr[left];
    currentSum -= outgoingVal;
    const prevLeft = left;
    left++;

    rawFrames.push({
      activeLineNumber: 5,
      explanation: `Sliding: Outgoing element arr[${prevLeft}] (${outgoingVal}) removed from window. Left pointer moves to ${left}. currentSum = ${currentSum}.`,
      elements: makeElements(left, right),
      stateVariables: {
        left,
        right,
        windowSize: k,
        currentSum,
        maxSum,
        bestWindow: [bestWindow[0], bestWindow[1]],
      },
      isTerminal: false,
      status: "running",
    });

    // Step C: Evaluate new sum vs maxSum
    const isNewMax = currentSum > maxSum;
    if (isNewMax) {
      maxSum = currentSum;
      bestWindow = [left, right];
    }

    rawFrames.push({
      activeLineNumber: 6,
      explanation: isNewMax
        ? `New maximum sum found! currentSum (${currentSum}) > previous maxSum. Updated maxSum = ${maxSum} at window [${left}, ${right}].`
        : `Window sum (${currentSum}) <= maxSum (${maxSum}). Retaining current maxSum = ${maxSum}.`,
      elements: makeElements(left, right, undefined, isNewMax ? "matched" : "window_active"),
      stateVariables: {
        left,
        right,
        windowSize: k,
        currentSum,
        maxSum,
        bestWindow: [bestWindow[0], bestWindow[1]],
      },
      isTerminal: false,
      status: "running",
    });
  }

  // Terminal Frame
  rawFrames.push({
    activeLineNumber: 7,
    explanation: `Completed! Maximum subarray sum of size ${k} is ${maxSum} found in window [${bestWindow[0]}, ${bestWindow[1]}].`,
    elements: makeElements(bestWindow[0], bestWindow[1], undefined, "matched"),
    stateVariables: {
      left: bestWindow[0],
      right: bestWindow[1],
      windowSize: k,
      currentSum: maxSum,
      maxSum,
      bestWindow: [bestWindow[0], bestWindow[1]],
    },
    isTerminal: true,
    status: "completed",
  });

  const totalSteps = rawFrames.length;
  return rawFrames.map((rf, idx) => ({
    ...rf,
    stepIndex: idx,
    totalSteps,
  }));
}

/**
 * Deterministic frame generator for Sliding Window (Longest Substring Without Repeating Characters).
 */
export function generateSlidingWindowDistinctFrames(inputStr: string): readonly AlgorithmFrame[] {
  const chars = inputStr.split("");
  const n = chars.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  const charSet = new Set<string>();
  let left = 0;
  let maxLength = 0;
  let bestSubstring = "";

  const makeElements = (
    wLeft: number,
    wRight: number,
    activeIdx?: number,
    highlightType: "window_active" | "comparing" | "matched" | "swapping" = "window_active"
  ): readonly VisualElement[] => {
    return chars.map((ch, idx) => {
      const inWindow = idx >= wLeft && idx <= wRight;
      return {
        id: `elem_${idx}`,
        value: ch,
        index: idx,
        highlight: idx === activeIdx ? highlightType : inWindow ? "window_active" : "default",
        label: idx === wLeft && idx === wRight ? "L/R" : idx === wLeft ? "L" : idx === wRight ? "R" : undefined,
      };
    });
  };

  // Initial Frame
  rawFrames.push({
    activeLineNumber: 2,
    explanation: `Initialized dynamic sliding window on string "${inputStr}". charSet = {}, left = 0, maxLength = 0.`,
    elements: makeElements(0, 0),
    stateVariables: {
      left: 0,
      right: 0,
      charSet: [],
      currentLength: 0,
      maxLength: 0,
      bestSubstring: "",
    },
    isTerminal: false,
    status: "running",
  });

  for (let right = 0; right < n; right++) {
    const currentChar = chars[right];

    // Frame: Examine incoming character
    rawFrames.push({
      activeLineNumber: 3,
      explanation: `Examining character '${currentChar}' at right index ${right}. Current window: [${left}, ${right}].`,
      elements: makeElements(left, right, right, "comparing"),
      stateVariables: {
        left,
        right,
        charSet: Array.from(charSet),
        currentLength: right - left + 1,
        maxLength,
        bestSubstring,
      },
      isTerminal: false,
      status: "running",
    });

    // Contract window if character is duplicate
    while (charSet.has(currentChar)) {
      const charToRemove = chars[left];
      charSet.delete(charToRemove);
      const prevLeft = left;
      left++;

      rawFrames.push({
        activeLineNumber: 5,
        explanation: `Duplicate detected! '${currentChar}' is already in charSet. Contracting: removed '${charToRemove}' at index ${prevLeft}. Left pointer advances to ${left}.`,
        elements: makeElements(left, right, prevLeft, "swapping"),
        stateVariables: {
          left,
          right,
          charSet: Array.from(charSet),
          currentLength: right - left + 1,
          maxLength,
          bestSubstring,
        },
        isTerminal: false,
        status: "running",
      });
    }

    // Insert character into set
    charSet.add(currentChar);
    const currentLength = right - left + 1;
    const currentSubstr = inputStr.substring(left, right + 1);

    rawFrames.push({
      activeLineNumber: 6,
      explanation: `Added '${currentChar}' to charSet. Valid distinct substring: "${currentSubstr}" (length ${currentLength}).`,
      elements: makeElements(left, right),
      stateVariables: {
        left,
        right,
        charSet: Array.from(charSet),
        currentLength,
        maxLength,
        bestSubstring,
      },
      isTerminal: false,
      status: "running",
    });

    // Update max length if larger
    if (currentLength > maxLength) {
      maxLength = currentLength;
      bestSubstring = currentSubstr;

      rawFrames.push({
        activeLineNumber: 7,
        explanation: `New longest distinct substring recorded: "${bestSubstring}" with length ${maxLength}.`,
        elements: makeElements(left, right, undefined, "matched"),
        stateVariables: {
          left,
          right,
          charSet: Array.from(charSet),
          currentLength,
          maxLength,
          bestSubstring,
        },
        isTerminal: false,
        status: "running",
      });
    }
  }

  // Terminal Frame
  rawFrames.push({
    activeLineNumber: 8,
    explanation: `Completed! Longest distinct substring is "${bestSubstring}" with length ${maxLength}.`,
    elements: makeElements(0, n - 1, undefined, "matched"),
    stateVariables: {
      left,
      right: n - 1,
      charSet: Array.from(charSet),
      currentLength: maxLength,
      maxLength,
      bestSubstring,
    },
    isTerminal: true,
    status: "completed",
  });

  const totalSteps = rawFrames.length;
  return rawFrames.map((rf, idx) => ({
    ...rf,
    stepIndex: idx,
    totalSteps,
  }));
}
