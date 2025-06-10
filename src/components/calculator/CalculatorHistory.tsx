import type React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History as HistoryIcon, Trash2 } from 'lucide-react';

interface CalculatorHistoryProps {
  history: Array<{ expression: string; result: string }>;
  onClearHistory: () => void;
  onHistoryItemClick: (expression: string, result: string) => void;
}

const CalculatorHistory: React.FC<CalculatorHistoryProps> = ({ history, onClearHistory, onHistoryItemClick }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full mb-2 flex items-center justify-center gap-2">
          <HistoryIcon size={20} /> History
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Calculation History</SheetTitle>
          <SheetDescription>
            View your recent calculations. Click an item to load the result.
          </SheetDescription>
        </SheetHeader>
        {history.length > 0 && (
           <Button variant="destructive" size="sm" onClick={onClearHistory} className="my-2 self-end flex items-center gap-1">
            <Trash2 size={16} /> Clear All
          </Button>
        )}
        <ScrollArea className="flex-grow my-4">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center">No history yet.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((item, index) => (
                <li key={index} className="border p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onHistoryItemClick(item.expression, item.result)}>
                  <SheetClose asChild>
                    <div>
                      <div className="text-sm text-muted-foreground break-all">{item.expression} =</div>
                      <div className="text-lg font-semibold text-foreground break-all">{item.result}</div>
                    </div>
                  </SheetClose>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CalculatorHistory;
