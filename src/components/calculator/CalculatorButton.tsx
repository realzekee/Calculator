import type React from 'react';
import { Button as ShadButton } from '@/components/ui/button'; // Renamed to avoid conflict
import { cn } from '@/lib/utils';

interface CalculatorButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'accent' | 'special' | 'memory' | 'scientific';
  className?: string;
  title?: string; // For tooltips on special function buttons
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  label,
  onClick,
  variant = 'default',
  className,
  title,
}) => {
  const baseStyle = "h-16 text-2xl font-medium rounded-md shadow-sm active:shadow-inner transition-all duration-150 ease-in-out focus:ring-2 focus:ring-ring focus:ring-offset-1";
  
  let variantStyle = '';
  switch (variant) {
    case 'operator':
      variantStyle = 'bg-primary/80 hover:bg-primary text-primary-foreground'; // Slightly lighter primary
      break;
    case 'accent':
      variantStyle = 'bg-accent hover:bg-accent/90 text-accent-foreground'; // Teal
      break;
    case 'special':
      variantStyle = 'bg-muted hover:bg-muted/80 text-foreground'; // e.g. C, AC
      break;
    case 'memory':
      variantStyle = 'bg-secondary hover:bg-secondary/80 text-secondary-foreground text-lg'; // For M+, M-, etc.
      break;
    case 'scientific':
      variantStyle = 'bg-primary/70 hover:bg-primary/90 text-primary-foreground text-lg'; // For sin, cos, etc.
      break;
    default: // Numbers
      variantStyle = 'bg-secondary hover:bg-secondary/80 text-secondary-foreground';
      break;
  }

  return (
    <ShadButton
      variant="outline" // Base variant, custom styling applied via className
      className={cn(baseStyle, variantStyle, className)}
      onClick={onClick}
      title={title}
      aria-label={typeof label === 'string' ? label : title}
    >
      {label}
    </ShadButton>
  );
};

export default CalculatorButton;
