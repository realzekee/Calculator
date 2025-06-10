import type React from 'react';

interface CalculatorDisplayProps {
  value: string;
}

const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({ value }) => {
  // Determine font size based on length to prevent overflow, ensure readability
  let fontSizeClass = 'text-5xl';
  if (value.length > 9) fontSizeClass = 'text-4xl';
  if (value.length > 12) fontSizeClass = 'text-3xl';
  if (value.length > 15) fontSizeClass = 'text-2xl';


  return (
    <div className="bg-input text-right p-4 rounded-t-lg h-24 flex items-end justify-end shadow-inner">
      <span className={`font-headline text-foreground break-all ${fontSizeClass} transition-all duration-200`}>
        {value}
      </span>
    </div>
  );
};

export default CalculatorDisplay;
