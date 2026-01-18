import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function MobileKeyboard({ onKeyPress, onBackspace, disabled }: MobileKeyboardProps) {
  return (
    <div className="w-full flex flex-col gap-1.5 pb-2" data-testid="mobile-keyboard">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div 
          key={rowIdx} 
          className="flex w-full gap-[3px]"
          style={{
            paddingLeft: rowIdx === 1 ? '5%' : rowIdx === 2 ? '8%' : '0',
            paddingRight: rowIdx === 1 ? '5%' : rowIdx === 2 ? '0' : '0',
          }}
        >
          {row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onKeyPress(key)}
              disabled={disabled}
              className={cn(
                "flex-1 h-12 rounded-md font-semibold text-lg",
                "bg-secondary/80 border border-white/10 text-foreground",
                "active:bg-primary/30 active:scale-95 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              data-testid={`key-${key}`}
            >
              {key}
            </button>
          ))}
          {rowIdx === 2 && (
            <button
              type="button"
              onClick={onBackspace}
              disabled={disabled}
              className={cn(
                "flex-[1.5] h-12 rounded-md font-semibold text-sm flex items-center justify-center",
                "bg-secondary/80 border border-white/10 text-foreground",
                "active:bg-destructive/30 active:scale-95 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              data-testid="key-backspace"
            >
              <Delete className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
