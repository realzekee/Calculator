import { useReducer, useCallback } from 'react';

type State = {
  currentInput: string;
  previousInput: string | null;
  operation: string | null;
  memory: number;
  history: Array<{ expression: string; result: string }>;
  overwrite: boolean; // True if next digit should overwrite currentInput
  isError: boolean;
};

const initialState: State = {
  currentInput: '0',
  previousInput: null,
  operation: null,
  memory: 0,
  history: [],
  overwrite: true,
  isError: false,
};

type Action =
  | { type: 'INPUT_DIGIT'; payload: string }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'SET_OPERATION'; payload: string }
  | { type: 'CALCULATE_EQUALS' }
  | { type: 'CLEAR'; payload: 'AC' | 'C' } // AC (All Clear) / C (Clear Current Input)
  | { type: 'BACKSPACE' }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'APPLY_UNARY'; payload: 'PERCENT' | 'SQRT' | 'SQUARE' | 'RECIPROCAL' | 'SIN' | 'COS' | 'TAN' | 'LOG' | 'LN' }
  | { type: 'MEMORY_CLEAR' }
  | { type: 'MEMORY_RECALL' }
  | { type: 'MEMORY_ADD' }
  | { type: 'MEMORY_SUBTRACT' }
  | { type: 'SET_X_POWER_Y' };


function evaluate(operand1: string, operand2: string, op: string): number | null {
  const num1 = parseFloat(operand1);
  const num2 = parseFloat(operand2);

  if (isNaN(num1) || isNaN(num2)) return null;

  switch (op) {
    case '+': return num1 + num2;
    case '-': return num1 - num2;
    case '*': return num1 * num2;
    case '/': return num2 === 0 ? null : num1 / num2; // Handle division by zero
    case 'x^y': return Math.pow(num1, num2);
    default: return null;
  }
}

function formatDisplay(value: number | string | null): string {
  if (value === null || value === undefined) return 'Error';
  const stringValue = String(value);
  if (stringValue.length > 15) { // Limit display length
    const num = Number(value);
    if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-4 && num !== 0) ) {
      return num.toExponential(9);
    }
    return parseFloat(num.toPrecision(12)).toString();
  }
  return stringValue;
}


function reducer(state: State, action: Action): State {
  if (state.isError && action.type !== 'CLEAR') {
    if (action.type === 'INPUT_DIGIT' || action.type === 'INPUT_DECIMAL' || action.type === 'SET_OPERATION') {
      // Allow starting new calculation after error by inputting a digit
      return { ...initialState, currentInput: action.type === 'INPUT_DIGIT' ? action.payload : '0', overwrite: action.type !== 'INPUT_DIGIT' };
    }
    return state; // Don't process other actions if in error state
  }
  
  switch (action.type) {
    case 'INPUT_DIGIT':
      if (state.overwrite) {
        return { ...state, currentInput: action.payload, overwrite: false, isError: false };
      }
      if (state.currentInput === '0' && action.payload === '0') return state;
      if (state.currentInput === '0' && action.payload !== '0') return { ...state, currentInput: action.payload, isError: false };
      if (state.currentInput.length >= 15) return state; // Limit input length
      return { ...state, currentInput: state.currentInput + action.payload, isError: false };

    case 'INPUT_DECIMAL':
      if (state.overwrite) {
        return { ...state, currentInput: '0.', overwrite: false, isError: false };
      }
      if (state.currentInput.includes('.')) return state;
      if (state.currentInput.length >= 15) return state;
      return { ...state, currentInput: state.currentInput + '.', isError: false };

    case 'SET_OPERATION': {
      if (state.currentInput === 'Error') return {...state, isError: true};
      if (state.previousInput && state.operation && !state.overwrite) {
        // Calculate intermediate result if there's a pending operation and new input
        const result = evaluate(state.previousInput, state.currentInput, state.operation);
        if (result === null) return { ...state, currentInput: 'Error', isError: true, previousInput: null, operation: null, overwrite: true };
        
        const expression = `${state.previousInput} ${state.operation} ${state.currentInput}`;
        const newHistoryEntry = { expression, result: formatDisplay(result) };
        const newHistory = [newHistoryEntry, ...state.history.slice(0, 19)];


        return {
          ...state,
          previousInput: formatDisplay(result),
          operation: action.payload,
          currentInput: formatDisplay(result), // Show result before next input
          overwrite: true,
          isError: false,
          history: newHistory,
        };
      }
      return {
        ...state,
        previousInput: state.currentInput,
        operation: action.payload,
        overwrite: true,
        isError: false,
      };
    }
    
    case 'SET_X_POWER_Y':
        return {
          ...state,
          previousInput: state.currentInput,
          operation: 'x^y',
          overwrite: true,
          isError: false,
        };

    case 'CALCULATE_EQUALS': {
      if (!state.previousInput || !state.operation) return state;
      if (state.currentInput === 'Error') return {...state, isError: true};
      const result = evaluate(state.previousInput, state.currentInput, state.operation);
      if (result === null) return { ...initialState, currentInput: 'Error', isError: true, history: state.history };
      
      const expression = `${state.previousInput} ${state.operation} ${state.currentInput}`;
      const newHistoryEntry = { expression, result: formatDisplay(result) };
      const newHistory = [newHistoryEntry, ...state.history.slice(0, 19)]; // Keep last 20

      return {
        ...state,
        currentInput: formatDisplay(result),
        previousInput: null,
        operation: null,
        overwrite: true,
        isError: false,
        history: newHistory,
      };
    }
    
    case 'CLEAR':
      if (action.payload === 'AC') return {...initialState, history: state.history}; // Keep history on AC
      return { ...state, currentInput: '0', overwrite: true, isError: false }; // 'C' clears current input

    case 'BACKSPACE':
      if (state.overwrite || state.currentInput.length === 1) {
        return { ...state, currentInput: '0', overwrite: true, isError: false };
      }
      return { ...state, currentInput: state.currentInput.slice(0, -1), isError: false };

    case 'TOGGLE_SIGN': {
      const currentValue = parseFloat(state.currentInput);
      if (isNaN(currentValue) || currentValue === 0) return state;
      return { ...state, currentInput: formatDisplay(-currentValue), overwrite: false, isError: false };
    }
      
    case 'APPLY_UNARY': {
      const value = parseFloat(state.currentInput);
      if (isNaN(value) && action.payload !== 'PERCENT') return { ...state, currentInput: 'Error', isError: true, overwrite: true };

      let result: number | null = null;
      let expressionPrefix = '';

      switch (action.payload) {
        case 'PERCENT':
          // If there's a previous input and an operation, calculate percentage relative to previousInput
          if (state.previousInput && state.operation && (state.operation === '+' || state.operation === '-')) {
            const prevVal = parseFloat(state.previousInput);
            result = prevVal * (value / 100);
            expressionPrefix = `${state.previousInput} ${state.operation} ${value}%`;
          } else if (state.previousInput && state.operation && (state.operation === '*' || state.operation === '/')) {
            result = value / 100;
            expressionPrefix = `${value}%`;
          } else { // standalone percentage
            result = value / 100;
            expressionPrefix = `${value}%`;
          }
          break;
        case 'SQRT':
          if (value < 0) return { ...state, currentInput: 'Error', isError: true, overwrite: true };
          result = Math.sqrt(value);
          expressionPrefix = `√(${state.currentInput})`;
          break;
        case 'SQUARE':
          result = value * value;
          expressionPrefix = `sqr(${state.currentInput})`;
          break;
        case 'RECIPROCAL':
          if (value === 0) return { ...state, currentInput: 'Error', isError: true, overwrite: true };
          result = 1 / value;
          expressionPrefix = `1/(${state.currentInput})`;
          break;
        case 'SIN': result = Math.sin(value * Math.PI / 180); expressionPrefix = `sin(${state.currentInput})`; break; // Assuming degrees
        case 'COS': result = Math.cos(value * Math.PI / 180); expressionPrefix = `cos(${state.currentInput})`; break; // Assuming degrees
        case 'TAN': result = Math.tan(value * Math.PI / 180); expressionPrefix = `tan(${state.currentInput})`; break; // Assuming degrees
        case 'LOG': 
            if (value <= 0) return { ...state, currentInput: 'Error', isError: true, overwrite: true };
            result = Math.log10(value); expressionPrefix = `log(${state.currentInput})`; break;
        case 'LN': 
            if (value <= 0) return { ...state, currentInput: 'Error', isError: true, overwrite: true };
            result = Math.log(value); expressionPrefix = `ln(${state.currentInput})`; break;
      }
      
      if (result === null || isNaN(result)) return { ...state, currentInput: 'Error', isError: true, overwrite: true };

      const newHistoryEntry = { expression: expressionPrefix, result: formatDisplay(result) };
      const newHistory = [newHistoryEntry, ...state.history.slice(0, 19)];


      return { ...state, currentInput: formatDisplay(result), overwrite: true, isError: false, history: newHistory };
    }

    case 'MEMORY_CLEAR':
      return { ...state, memory: 0 };
    case 'MEMORY_RECALL':
      return { ...state, currentInput: formatDisplay(state.memory), overwrite: true, isError: false };
    case 'MEMORY_ADD': {
      const currentValue = parseFloat(state.currentInput);
      if (isNaN(currentValue)) return state;
      return { ...state, memory: state.memory + currentValue };
    }
    case 'MEMORY_SUBTRACT': {
      const currentValue = parseFloat(state.currentInput);
      if (isNaN(currentValue)) return state;
      return { ...state, memory: state.memory - currentValue };
    }

    default:
      return state;
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleDigit = useCallback((digit: string) => dispatch({ type: 'INPUT_DIGIT', payload: digit }), []);
  const handleDecimal = useCallback(() => dispatch({ type: 'INPUT_DECIMAL' }), []);
  const handleOperation = useCallback((op: string) => dispatch({ type: 'SET_OPERATION', payload: op }), []);
  const handleEquals = useCallback(() => dispatch({ type: 'CALCULATE_EQUALS' }), []);
  const handleClear = useCallback((type: 'AC' | 'C') => dispatch({ type: 'CLEAR', payload: type }), []);
  const handleBackspace = useCallback(() => dispatch({ type: 'BACKSPACE' }), []);
  const handleToggleSign = useCallback(() => dispatch({ type: 'TOGGLE_SIGN' }), []);
  const handleUnaryOp = useCallback((opType: 'PERCENT' | 'SQRT' | 'SQUARE' | 'RECIPROCAL' | 'SIN' | 'COS' | 'TAN' | 'LOG' | 'LN') => dispatch({ type: 'APPLY_UNARY', payload: opType }), []);
  const handleMemoryClear = useCallback(() => dispatch({ type: 'MEMORY_CLEAR' }), []);
  const handleMemoryRecall = useCallback(() => dispatch({ type: 'MEMORY_RECALL' }), []);
  const handleMemoryAdd = useCallback(() => dispatch({ type: 'MEMORY_ADD' }), []);
  const handleMemorySubtract = useCallback(() => dispatch({ type: 'MEMORY_SUBTRACT' }), []);
  const handleSetXPowerY = useCallback(() => dispatch({ type: 'SET_X_POWER_Y'}), []);
  
  const loadFromHistory = useCallback((expression: string, result: string) => {
     // For simplicity, just set the result to current input. 
     // A more complex implementation could try to re-evaluate or parse expression.
    dispatch({ type: 'INPUT_DIGIT', payload: '0'}); // Reset state a bit
    // Need to ensure this doesn't conflict with `overwrite`.
    // The easiest is to treat it like typing the number.
    
    // This is a bit hacky way to set currentInput from history
    // A dedicated action might be cleaner.
    // For now, we'll update currentInput directly for display and let user continue.
    dispatch({ type: 'CLEAR', payload: 'C' }); // Clear current input
    // Simulate typing the result
    result.split('').forEach(char => {
      if (char === '.') dispatch({ type: 'INPUT_DECIMAL' });
      else dispatch({ type: 'INPUT_DIGIT', payload: char });
    });

  }, [dispatch]);


  return { state, handleDigit, handleDecimal, handleOperation, handleEquals, handleClear, handleBackspace, handleToggleSign, handleUnaryOp, handleMemoryClear, handleMemoryRecall, handleMemoryAdd, handleMemorySubtract, handleSetXPowerY, loadFromHistory };
}
