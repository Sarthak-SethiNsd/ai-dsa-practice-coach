import { AlgorithmFrame } from "../visualizerTypes";

/**
 * Deterministic frame generator for Binary Search.
 * Note: When duplicate target values exist, returns the first midpoint index encountered by the midpoint formula.
 */
export function generateBinarySearchFrames(
  input: readonly number[],
  target: number
): readonly AlgorithmFrame[] {
  const arr = [...input];
  const n = arr.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  let low = 0;
  let high = n - 1;

  // Frame 1: Initialization
  rawFrames.push({
    activeLineNumber: 2,
    explanation: `Initialized Binary Search for target ${target}. Search interval: [low: 0, high: ${n - 1}].`,
    elements: arr.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: idx === 0 ? "pointer_left" : idx === n - 1 ? "pointer_right" : "default",
      label: idx === 0 ? "LOW" : idx === n - 1 ? "HIGH" : undefined,
    })),
    stateVariables: { low, high, mid: null, midVal: null, target, matchIndex: null },
    isTerminal: false,
    status: "running",
  });

  let foundIndex = -1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const midVal = arr[mid];

    // Frame: Midpoint Calculation
    rawFrames.push({
      activeLineNumber: 4,
      explanation: `Calculated mid = ${low} + floor((${high} - ${low}) / 2) = ${mid} (val: ${midVal}). Evaluating vs target ${target}.`,
      elements: arr.map((val, idx) => {
        const isDiscarded = idx < low || idx > high;
        return {
          id: `elem_${idx}`,
          value: val,
          index: idx,
          highlight: isDiscarded
            ? "discarded"
            : idx === mid
            ? "pointer_mid"
            : idx === low
            ? "pointer_left"
            : idx === high
            ? "pointer_right"
            : "default",
          label: idx === mid ? "MID" : idx === low ? "LOW" : idx === high ? "HIGH" : undefined,
        };
      }),
      stateVariables: { low, high, mid, midVal, target, matchIndex: null },
      isTerminal: false,
      status: "running",
    });

    if (midVal === target) {
      // Frame: Target matched (terminal success)
      rawFrames.push({
        activeLineNumber: 5,
        explanation: `Success! Target ${target} matched at midpoint index ${mid}.`,
        elements: arr.map((val, idx) => {
          const isDiscarded = idx < low || idx > high;
          return {
            id: `elem_${idx}`,
            value: val,
            index: idx,
            highlight: idx === mid ? "matched" : isDiscarded ? "discarded" : "default",
            label: idx === mid ? "FOUND" : undefined,
          };
        }),
        stateVariables: { low, high, mid, midVal, target, matchIndex: mid },
        isTerminal: true,
        status: "success",
      });
      foundIndex = mid;
      break;
    } else if (midVal < target) {
      // Frame: Discard left half
      const prevLow = low;
      low = mid + 1;

      rawFrames.push({
        activeLineNumber: 6,
        explanation: `arr[${mid}] (${midVal}) < target (${target}). Discarding left interval [${prevLow} .. ${mid}]. low advances to ${low}.`,
        elements: arr.map((val, idx) => {
          const isDiscarded = idx < low || idx > high;
          return {
            id: `elem_${idx}`,
            value: val,
            index: idx,
            highlight: isDiscarded
              ? "discarded"
              : idx === low
              ? "pointer_left"
              : idx === high
              ? "pointer_right"
              : "default",
            label: idx === low ? "LOW" : idx === high ? "HIGH" : undefined,
          };
        }),
        stateVariables: { low, high, mid, midVal, target, matchIndex: null },
        isTerminal: false,
        status: "running",
      });
    } else {
      // Frame: Discard right half
      const prevHigh = high;
      high = mid - 1;

      rawFrames.push({
        activeLineNumber: 7,
        explanation: `arr[${mid}] (${midVal}) > target (${target}). Discarding right interval [${mid} .. ${prevHigh}]. high decrements to ${high}.`,
        elements: arr.map((val, idx) => {
          const isDiscarded = idx < low || idx > high;
          return {
            id: `elem_${idx}`,
            value: val,
            index: idx,
            highlight: isDiscarded
              ? "discarded"
              : idx === low
              ? "pointer_left"
              : idx === high
              ? "pointer_right"
              : "default",
            label: idx === low ? "LOW" : idx === high ? "HIGH" : undefined,
          };
        }),
        stateVariables: { low, high, mid, midVal, target, matchIndex: null },
        isTerminal: false,
        status: "running",
      });
    }
  }

  if (foundIndex === -1) {
    // Frame: Search interval exhausted (terminal failure)
    rawFrames.push({
      activeLineNumber: 8,
      explanation: `Search interval exhausted (low: ${low} > high: ${high}). Target ${target} is not present in the array.`,
      elements: arr.map((val, idx) => ({
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: "discarded",
        label: undefined,
      })),
      stateVariables: { low, high, mid: null, midVal: null, target, matchIndex: null },
      isTerminal: true,
      status: "failure",
    });
  }

  const totalSteps = rawFrames.length;
  return rawFrames.map((rf, idx) => ({
    ...rf,
    stepIndex: idx,
    totalSteps,
  }));
}
