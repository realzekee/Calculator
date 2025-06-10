
'use client';

import React, { useState } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import CalculatorDisplay from './CalculatorDisplay';
import CalculatorButton from './CalculatorButton';
import CalculatorHistory from './CalculatorHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Percent, Divide, X, Minus, Plus, Equal, SquareRadical, Delete, Sigma } from 'lucide-react';

const Calculator: React.FC = () => {
  const { state, handleDigit, handleDecimal, handleOperation, handleEquals, handleClear, handleBackspace, handleToggleSign, handleUnaryOp, handleMemoryClear, handleMemoryRecall, handleMemoryAdd, handleMemorySubtract, handleSetXPowerY, loadFromHistory } = useCalculator();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const clearHistory = () => {
    // Placeholder for actual history clearing logic if needed beyond the hook
    // For now, the hook's clear history (via AC) should suffice for calculation history.
    // This function might be used for a dedicated "Clear Displayed History" button if different.
    console.log("Clear history clicked - needs hook implementation if not already covered");
  };
  
  const onHistoryItemClick = (expression: string, result: string) => {
    loadFromHistory(expression, result);
  };

  const advancedFunctionButtons = [
    // Row 1
    { 
      label: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <line x1="5" y1="18" x2="19" y2="18"></line>
        </svg>
      ), 
      onClick: handleToggleSign, 
      variant: 'special' as const, 
      title: 'Toggle Sign (±)'
    },
    { label: '1/x', onClick: () => handleUnaryOp('RECIPROCAL'), variant: 'scientific' as const, title: 'Reciprocal (1/x)'},
    { label: 'x²', onClick: () => handleUnaryOp('SQUARE'), variant: 'scientific' as const, title: 'Square (x²)'},
    { label: <SquareRadical size={24}/>, onClick: () => handleUnaryOp('SQRT'), variant: 'scientific' as const, title: 'Square Root (√)'},

    // Row 2: Memory
    { label: 'MC', onClick: handleMemoryClear, variant: 'memory' as const, title: 'Memory Clear' },
    { label: 'MR', onClick: handleMemoryRecall, variant: 'memory' as const, title: 'Memory Recall' },
    { label: 'M+', onClick: handleMemoryAdd, variant: 'memory' as const, title: 'Memory Add' },
    { label: 'M-', onClick: handleMemorySubtract, variant: 'memory' as const, title: 'Memory Subtract' },

    // Row 3: Scientific
    { label: 'sin', onClick: () => handleUnaryOp('SIN'), variant: 'scientific' as const, title: 'Sine (degrees)' },
    { label: 'cos', onClick: () => handleUnaryOp('COS'), variant: 'scientific' as const, title: 'Cosine (degrees)' },
    { label: 'tan', onClick: () => handleUnaryOp('TAN'), variant: 'scientific' as const, title: 'Tangent (degrees)' },
    { label: <Percent size={24} />, onClick: () => handleUnaryOp('PERCENT'), variant: 'special' as const, title: 'Percentage (%)' },
    
    // Row 4: More Scientific
    { label: 'log', onClick: () => handleUnaryOp('LOG'), variant: 'scientific' as const, title: 'Logarithm (base 10)' },
    { label: 'ln', onClick: () => handleUnaryOp('LN'), variant: 'scientific' as const, title: 'Natural Logarithm (ln)' },
    { label: 'xʸ', onClick: handleSetXPowerY, variant: 'scientific' as const, title: 'Power (xʸ)' },
    // Empty slot for 4x4 grid alignment if needed, or add another function. Let's add PI constant.
    { label: 'π', onClick: () => { handleClear('C'); '3.1415926535'.split('').forEach(handleDigit); }, variant: 'scientific' as const, title: 'Pi (π)' },
  ];

  // Corrected standard buttons structure for a consistent 5x4 grid (0 spans 2, Eq spans 1)
  const finalStandardButtonsCorrected = [
    { label: 'C', onClick: () => handleClear('C'), variant: 'special' as const, title: 'Clear Entry' },
    { label: 'AC', onClick: () => handleClear('AC'), variant: 'special' as const, title: 'All Clear' },
    { label: <Delete size={24} />, onClick: handleBackspace, variant: 'special' as const, title: 'Backspace' },
    { label: <Divide size={24} />, onClick: () => handleOperation('/'), variant: 'operator' as const, title: 'Divide (÷)' },
    
    { label: '7', onClick: () => handleDigit('7') },
    { label: '8', onClick: () => handleDigit('8') },
    { label: '9', onClick: () => handleDigit('9') },
    { label: <X size={24} />, onClick: () => handleOperation('*'), variant: 'operator' as const, title: 'Multiply (×)' },
    
    { label: '4', onClick: () => handleDigit('4') },
    { label: '5', onClick: () => handleDigit('5') },
    { label: '6', onClick: () => handleDigit('6') },
    { label: <Minus size={24} />, onClick: () => handleOperation('-'), variant: 'operator' as const, title: 'Subtract (−)' },
    
    { label: '1', onClick: () => handleDigit('1') },
    { label: '2', onClick: () => handleDigit('2') },
    { label: '3', onClick: () => handleDigit('3') },
    { label: <Plus size={24} />, onClick: () => handleOperation('+'), variant: 'operator' as const, title: 'Add (+)' },
    
    { label: '0', onClick: () => handleDigit('0'), className: "col-span-2 !w-auto" },
    { label: '.', onClick: handleDecimal, variant: 'special' as const, title: 'Decimal Point (.)' },
    { label: <Equal size={24} />, onClick: handleEquals, variant: 'accent' as const, title: 'Equals (=)', className: "col-span-1" },
  ];


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl rounded-lg bg-card overflow-hidden">
        <CalculatorDisplay value={state.isError ? 'Error' : state.currentInput} />
        <CardContent className="p-4">
          <CalculatorHistory 
            history={state.history} 
            onClearHistory={clearHistory} // This is for the history sheet's clear button. AC clears calc history.
            onHistoryItemClick={onHistoryItemClick} 
          />
          <CalculatorButton
            label={<div className="flex items-center justify-center gap-2"><Sigma size={20} /> Advanced</div>}
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant={showAdvanced ? 'accent' : 'outline'} // 'outline' is a default ShadCN Button variant
            title={showAdvanced ? "Hide Advanced Functions" : "Show Advanced Functions"}
            className="w-full mb-2"
          />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {showAdvanced && advancedFunctionButtons.map((btn, idx) => (
              <CalculatorButton
                key={`adv-${idx}`}
                label={btn.label}
                onClick={btn.onClick}
                variant={btn.variant || 'default'}
                className={btn.className}
                title={btn.title}
              />
            ))}
            {finalStandardButtonsCorrected.map((btn, idx) => (
              <CalculatorButton
                key={`std-${idx}`}
                label={btn.label}
                onClick={btn.onClick}
                variant={btn.variant || 'default'}
                className={btn.className}
                title={btn.title}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground">
        <p className="text-sm">Calculator App</p>
        <p className="text-xs">Copyright © Zeke</p>
      </footer>
    </div>
  );
};

export default Calculator;
