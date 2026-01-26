import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MobileKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const LETTER_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const NUMBER_ROW = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function MobileKeyboard({ onKeyPress, onBackspace, disabled }: MobileKeyboardProps) {
  const [showNumbers, setShowNumbers] = useState(false);

  const keyButtonClass = cn(
    "flex-1 rounded-md font-semibold text-base",
    "bg-secondary/80 border border-white/10 text-foreground",
    "active:bg-primary/30 active:scale-95 transition-all",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "h-[54px]"
  );

  const toggleButtonClass = cn(
    "rounded-md font-semibold text-xs flex items-center justify-center",
    "bg-secondary/80 border border-white/10 text-foreground",
    "active:bg-primary/30 active:scale-95 transition-all",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "h-[54px]"
  );

  if (showNumbers) {
    return (
      <div className="w-full flex flex-col gap-1 pb-4" data-testid="mobile-keyboard">
        <div className="flex w-full gap-[3px]">
          {NUMBER_ROW.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onKeyPress(key)}
              disabled={disabled}
              className={keyButtonClass}
              data-testid={`key-${key}`}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="flex w-full gap-[3px] mt-1">
          <button
            type="button"
            onClick={() => setShowNumbers(false)}
            disabled={disabled}
            className={cn(toggleButtonClass, "flex-[2]")}
            data-testid="key-abc"
          >
            ABC
          </button>
          <div className="flex-[5]" />
          <button
            type="button"
            onClick={onBackspace}
            disabled={disabled}
            className={cn(toggleButtonClass, "flex-[2]")}
            data-testid="key-backspace"
          >
            <Delete className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1 pb-4" data-testid="mobile-keyboard">
      {LETTER_ROWS.map((row, rowIdx) => (
        <div 
          key={rowIdx} 
          className="flex w-full gap-[3px]"
          style={{
            paddingLeft: rowIdx === 1 ? '5%' : rowIdx === 2 ? '0' : '0',
            paddingRight: rowIdx === 1 ? '5%' : rowIdx === 2 ? '0' : '0',
          }}
        >
          {rowIdx === 2 && (
            <>
              <button
                type="button"
                onClick={() => setShowNumbers(true)}
                disabled={disabled}
                className={cn(toggleButtonClass, "w-[42px] flex-shrink-0")}
                data-testid="key-123"
              >
                123
              </button>
              <div className="w-1 flex-shrink-0" />
            </>
          )}
          {row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onKeyPress(key)}
              disabled={disabled}
              className={keyButtonClass}
              data-testid={`key-${key}`}
            >
              {key}
            </button>
          ))}
          {rowIdx === 2 && (
            <>
              <div className="w-1 flex-shrink-0" />
              <button
                type="button"
                onClick={onBackspace}
                disabled={disabled}
                className={cn(toggleButtonClass, "w-[52px] flex-shrink-0")}
                data-testid="key-backspace"
              >
                <Delete className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      ))}
      {/* Space bar row - centered between Z and M */}
      <div className="flex w-full gap-[3px] justify-center" style={{ paddingLeft: '46px', paddingRight: '56px' }}>
        <button
          type="button"
          onClick={() => onKeyPress(" ")}
          disabled={disabled}
          className={cn(
            "rounded-md font-semibold text-base",
            "bg-secondary/80 border border-white/10 text-foreground",
            "active:bg-primary/30 active:scale-95 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "h-[46px] w-[50%]"
          )}
          data-testid="key-space"
        >
          space
        </button>
      </div>
    </div>
  );
}
