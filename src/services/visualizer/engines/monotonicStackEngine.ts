import { AlgorithmFrame, VisualElement } from "../visualizerTypes";

/**
 * Deterministic frame generator for Daily Temperatures (Monotonic Decreasing Stack).
 */
export function generateDailyTemperaturesFrames(input: readonly number[]): readonly AlgorithmFrame[] {
  const temps = [...input];
  const n = temps.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  const stack: number[] = []; // Stack of indices
  const res: number[] = new Array(n).fill(0);

  // Helper to build visual elements and stack elements
  const makeVisualState = (activeIdx: number, poppedIdx?: number) => {
    const elements: VisualElement[] = temps.map((val, idx) => {
      const isTop = stack.length > 0 && stack[stack.length - 1] === idx;
      const inStack = stack.includes(idx);
      const isPopped = idx === poppedIdx;
      const isActive = idx === activeIdx;

      return {
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: isPopped
          ? "swapping"
          : isActive
          ? "comparing"
          : isTop
          ? "stack_top"
          : inStack
          ? "window_active"
          : res[idx] > 0
          ? "matched"
          : "default",
        label: isTop ? "TOP" : inStack ? "STACK" : isActive ? "DAY" : undefined,
        secondaryValue: res[idx] > 0 ? `${res[idx]}d` : undefined,
      };
    });

    const auxiliaryElements: VisualElement[] = stack.map((idx, pos) => ({
      id: `stack_${idx}`,
      value: `${temps[idx]} (day ${idx})`,
      index: pos,
      highlight: pos === stack.length - 1 ? "stack_top" : "window_active",
      label: pos === stack.length - 1 ? "TOP" : `[${pos}]`,
    }));

    return { elements, auxiliaryElements };
  };

  // Initial Frame
  rawFrames.push({
    activeLineNumber: 2,
    explanation: `Initialized empty monotonic stack and result array [${res.join(", ")}].`,
    elements: temps.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: "default",
    })),
    auxiliaryElements: [],
    stateVariables: {
      currentIndex: null,
      currentTemp: null,
      stack: [],
      resultArray: [...res],
    },
    isTerminal: false,
    status: "running",
  });

  for (let i = 0; i < n; i++) {
    const currentTemp = temps[i];

    // Frame: Examine current day
    const { elements: examineElements, auxiliaryElements: examineAux } = makeVisualState(i);
    rawFrames.push({
      activeLineNumber: 3,
      explanation: `Day ${i}: Temperature is ${currentTemp}°F. Comparing with top of stack (${stack.length > 0 ? temps[stack[stack.length - 1]] + "°F" : "empty"}).`,
      elements: examineElements,
      auxiliaryElements: examineAux,
      stateVariables: {
        currentIndex: i,
        currentTemp,
        stack: [...stack],
        resultArray: [...res],
      },
      isTerminal: false,
      status: "running",
    });

    // Pop cooler days from stack
    while (stack.length > 0 && currentTemp > temps[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!;
      const waitDays = i - prevIndex;
      res[prevIndex] = waitDays;

      const { elements: popElements, auxiliaryElements: popAux } = makeVisualState(i, prevIndex);
      rawFrames.push({
        activeLineNumber: 6,
        explanation: `Warmer temperature found! ${currentTemp}°F > ${temps[prevIndex]}°F. Popped day ${prevIndex} from stack. Wait time = ${i} - ${prevIndex} = ${waitDays} day(s).`,
        elements: popElements,
        auxiliaryElements: popAux,
        stateVariables: {
          currentIndex: i,
          currentTemp,
          stack: [...stack],
          resultArray: [...res],
        },
        isTerminal: false,
        status: "running",
      });
    }

    // Push current day onto stack
    stack.push(i);
    const { elements: pushElements, auxiliaryElements: pushAux } = makeVisualState(i);
    rawFrames.push({
      activeLineNumber: 7,
      explanation: `Pushed day ${i} (${currentTemp}°F) onto the monotonic stack.`,
      elements: pushElements,
      auxiliaryElements: pushAux,
      stateVariables: {
        currentIndex: i,
        currentTemp,
        stack: [...stack],
        resultArray: [...res],
      },
      isTerminal: false,
      status: "running",
    });
  }

  // Terminal Frame
  rawFrames.push({
    activeLineNumber: 8,
    explanation: `Completed! Daily temperatures wait times resolved: [${res.join(", ")}]. (Unresolved stack elements remain 0).`,
    elements: temps.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: res[idx] > 0 ? "matched" : "default",
      secondaryValue: `${res[idx]}d`,
    })),
    auxiliaryElements: stack.map((idx, pos) => ({
      id: `stack_${idx}`,
      value: `${temps[idx]} (day ${idx})`,
      index: pos,
      highlight: "default",
      label: `0d`,
    })),
    stateVariables: {
      currentIndex: n - 1,
      currentTemp: temps[n - 1],
      stack: [...stack],
      resultArray: [...res],
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
 * Deterministic frame generator for Next Greater Element (Monotonic Decreasing Stack).
 */
export function generateNextGreaterElementFrames(input: readonly number[]): readonly AlgorithmFrame[] {
  const arr = [...input];
  const n = arr.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  const stack: number[] = []; // Stack of indices
  const res: number[] = new Array(n).fill(-1);

  const makeVisualState = (activeIdx: number, poppedIdx?: number) => {
    const elements: VisualElement[] = arr.map((val, idx) => {
      const isTop = stack.length > 0 && stack[stack.length - 1] === idx;
      const inStack = stack.includes(idx);
      const isPopped = idx === poppedIdx;
      const isActive = idx === activeIdx;

      return {
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: isPopped
          ? "swapping"
          : isActive
          ? "comparing"
          : isTop
          ? "stack_top"
          : inStack
          ? "window_active"
          : res[idx] !== -1
          ? "matched"
          : "default",
        label: isTop ? "TOP" : inStack ? "STACK" : isActive ? "ELEM" : undefined,
        secondaryValue: res[idx] !== -1 ? `➔ ${res[idx]}` : undefined,
      };
    });

    const auxiliaryElements: VisualElement[] = stack.map((idx, pos) => ({
      id: `stack_${idx}`,
      value: `${arr[idx]} [idx ${idx}]`,
      index: pos,
      highlight: pos === stack.length - 1 ? "stack_top" : "window_active",
      label: pos === stack.length - 1 ? "TOP" : `[${pos}]`,
    }));

    return { elements, auxiliaryElements };
  };

  // Initial Frame
  rawFrames.push({
    activeLineNumber: 2,
    explanation: `Initialized empty monotonic stack and result array [${res.join(", ")}].`,
    elements: arr.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: "default",
    })),
    auxiliaryElements: [],
    stateVariables: {
      currentIndex: null,
      currentVal: null,
      stack: [],
      resultArray: [...res],
    },
    isTerminal: false,
    status: "running",
  });

  for (let i = 0; i < n; i++) {
    const currentVal = arr[i];

    // Frame: Examine current element
    const { elements: examineElements, auxiliaryElements: examineAux } = makeVisualState(i);
    rawFrames.push({
      activeLineNumber: 3,
      explanation: `Index ${i}: Element is ${currentVal}. Comparing with stack top (${stack.length > 0 ? arr[stack[stack.length - 1]] : "empty"}).`,
      elements: examineElements,
      auxiliaryElements: examineAux,
      stateVariables: {
        currentIndex: i,
        currentVal,
        stack: [...stack],
        resultArray: [...res],
      },
      isTerminal: false,
      status: "running",
    });

    // Pop smaller elements from stack
    while (stack.length > 0 && currentVal > arr[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!;
      res[prevIndex] = currentVal;

      const { elements: popElements, auxiliaryElements: popAux } = makeVisualState(i, prevIndex);
      rawFrames.push({
        activeLineNumber: 6,
        explanation: `Next greater element found! ${currentVal} > ${arr[prevIndex]}. Popped index ${prevIndex} (val ${arr[prevIndex]}). Set res[${prevIndex}] = ${currentVal}.`,
        elements: popElements,
        auxiliaryElements: popAux,
        stateVariables: {
          currentIndex: i,
          currentVal,
          stack: [...stack],
          resultArray: [...res],
        },
        isTerminal: false,
        status: "running",
      });
    }

    // Push current element index
    stack.push(i);
    const { elements: pushElements, auxiliaryElements: pushAux } = makeVisualState(i);
    rawFrames.push({
      activeLineNumber: 7,
      explanation: `Pushed index ${i} (value ${currentVal}) onto monotonic stack.`,
      elements: pushElements,
      auxiliaryElements: pushAux,
      stateVariables: {
        currentIndex: i,
        currentVal,
        stack: [...stack],
        resultArray: [...res],
      },
      isTerminal: false,
      status: "running",
    });
  }

  // Terminal Frame
  rawFrames.push({
    activeLineNumber: 8,
    explanation: `Completed! Next greater elements resolved: [${res.join(", ")}]. (Unresolved elements remain -1).`,
    elements: arr.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: res[idx] !== -1 ? "matched" : "default",
      secondaryValue: `➔ ${res[idx]}`,
    })),
    auxiliaryElements: stack.map((idx, pos) => ({
      id: `stack_${idx}`,
      value: `${arr[idx]} [idx ${idx}]`,
      index: pos,
      highlight: "default",
      label: `-1`,
    })),
    stateVariables: {
      currentIndex: n - 1,
      currentVal: arr[n - 1],
      stack: [...stack],
      resultArray: [...res],
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
