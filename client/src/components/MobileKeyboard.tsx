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
    <div className="w-full flex flex-col gap-1 px-1" data-testid="mobile-keyboard">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-[3px]">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onKeyPress(key)}
              disabled={disabled}
              className={cn(
                "flex-1 max-w-[36px] h-10 rounded-md font-semibold text-sm",
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
                "w-14 h-10 rounded-md font-semibold text-sm flex items-center justify-center",
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
