import { AlgorithmFrame } from "../visualizerTypes";

/**
 * Deterministic frame generator for Two Pointers (Target Sum).
 */
export function generateTwoPointersFrames(
  input: readonly number[],
  target: number
): readonly AlgorithmFrame[] {
  const arr = [...input];
  const n = arr.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  let left = 0;
  let right = n - 1;

  // Frame 1: Initialization
  rawFrames.push({
    activeLineNumber: 2,
    explanation: `Initialized Left pointer at index 0 (val: ${arr[0]}) and Right pointer at index ${n - 1} (val: ${arr[n - 1]}). Target: ${target}.`,
    elements: arr.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: idx === left ? "pointer_left" : idx === right ? "pointer_right" : "default",
      label: idx === left && idx === right ? "L/R" : idx === left ? "L" : idx === right ? "R" : undefined,
    })),
    stateVariables: { left, right, currentSum: null, target, match: null },
    isTerminal: false,
    status: "running",
  });

  let matched = false;

  while (left < right) {
    const currentSum = arr[left] + arr[right];

    // Frame: Compute current sum
    rawFrames.push({
      activeLineNumber: 4,
      explanation: `Evaluating indices [${left}, ${right}]: ${arr[left]} + ${arr[right]} = ${currentSum} (Target: ${target}).`,
      elements: arr.map((val, idx) => ({
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: idx === left ? "pointer_left" : idx === right ? "pointer_right" : "default",
        label: idx === left && idx === right ? "L/R" : idx === left ? "L" : idx === right ? "R" : undefined,
      })),
      stateVariables: { left, right, currentSum, target, match: null },
      isTerminal: false,
      status: "running",
    });

    if (currentSum === target) {
      // Frame: Match found (terminal success)
      rawFrames.push({
        activeLineNumber: 5,
        explanation: `Success! Target sum ${target} found at indices [${left}, ${right}] (${arr[left]} + ${arr[right]} = ${target}).`,
        elements: arr.map((val, idx) => ({
          id: `elem_${idx}`,
          value: val,
          index: idx,
          highlight: idx === left || idx === right ? "matched" : "default",
          label: idx === left ? "MATCH" : idx === right ? "MATCH" : undefined,
        })),
        stateVariables: { left, right, currentSum, target, match: [left, right] },
        isTerminal: true,
        status: "success",
      });
      matched = true;
      break;
    } else if (currentSum < target) {
      // Frame: Sum too small, advance left
      const prevLeft = left;
      left++;
      rawFrames.push({
        activeLineNumber: 6,
        explanation: `Sum ${currentSum} < ${target}. Left pointer advances from index ${prevLeft} to ${left} to increase sum.`,
        elements: arr.map((val, idx) => ({
          id: `elem_${idx}`,
          value: val,
          index: idx,
          highlight: idx === left ? "pointer_left" : idx === right ? "pointer_right" : "default",
          label: idx === left && idx === right ? "L/R" : idx === left ? "L" : idx === right ? "R" : undefined,
        })),
        stateVariables: { left, right, currentSum, target, match: null },
        isTerminal: false,
        status: "running",
      });
    } else {
      // Frame: Sum too large, decrement right
      const prevRight = right;
      right--;
      rawFrames.push({
        activeLineNumber: 7,
        explanation: `Sum ${currentSum} > ${target}. Right pointer decrements from index ${prevRight} to ${right} to decrease sum.`,
        elements: arr.map((val, idx) => ({
          id: `elem_${idx}`,
          value: val,
          index: idx,
          highlight: idx === left ? "pointer_left" : idx === right ? "pointer_right" : "default",
          label: idx === left && idx === right ? "L/R" : idx === left ? "L" : idx === right ? "R" : undefined,
        })),
        stateVariables: { left, right, currentSum, target, match: null },
        isTerminal: false,
        status: "running",
      });
    }
  }

  if (!matched) {
    // Frame: Pointers crossed, not found (terminal failure)
    rawFrames.push({
      activeLineNumber: 8,
      explanation: `Pointers crossed (left: ${left}, right: ${right}). Target sum ${target} was not found in the array.`,
      elements: arr.map((val, idx) => ({
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: "default",
        label: undefined,
      })),
      stateVariables: { left, right, currentSum: null, target, match: null },
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
