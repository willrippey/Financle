import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface GameCardProps {
  title: string;
  value?: string;
  revealed: boolean;
  delay?: number;
  className?: string;
  isMultiLine?: boolean;
  dynamicHeight?: boolean;
  compact?: boolean;
  scaleText?: boolean;
}

function ScaledText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(14);

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !text) return;

    const container = containerRef.current;
    const textEl = textRef.current;
    
    const calculateFontSize = () => {
      const containerWidth = container.clientWidth - 8;
      const containerHeight = container.clientHeight - 4;
      
      let size = 16;
      textEl.style.fontSize = `${size}px`;
      
      while (size > 8 && (textEl.scrollWidth > containerWidth || textEl.scrollHeight > containerHeight)) {
        size -= 0.5;
        textEl.style.fontSize = `${size}px`;
      }
      
      setFontSize(size);
    };

    calculateFontSize();
    
    const resizeObserver = new ResizeObserver(calculateFontSize);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();
  }, [text]);

  return (
    <div ref={containerRef} className={cn("flex-1 flex items-center justify-center w-full overflow-hidden px-1", className)}>
      <span 
        ref={textRef}
        className="font-semibold text-foreground text-center leading-tight"
        style={{ fontSize: `${fontSize}px` }}
      >
        {text}
      </span>
    </div>
  );
}

export function GameCard({ title, value, revealed, delay = 0, className, isMultiLine, dynamicHeight, compact, scaleText }: GameCardProps) {
  const displayValue = isMultiLine ? value?.split('\n') : undefined;
  
  return (
    <div className={cn(dynamicHeight ? "relative w-full perspective-1000" : "relative h-32 w-full perspective-1000", className)}>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 90 }}
            transition={{ duration: 0.4, delay: delay * 0.1 }}
            className={cn(
              "absolute inset-0 w-full h-full bg-secondary/30 border border-white/5 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm overflow-hidden",
              compact ? "p-1.5 rounded-lg" : "p-2 sm:p-3 md:p-4"
            )}
          >
            <Lock className={cn(compact ? "w-3 h-3 mb-0.5" : "w-5 h-5 sm:w-6 sm:h-6 mb-1", "text-muted-foreground opacity-50")} />
            <span className={cn(
              "font-medium text-muted-foreground uppercase tracking-tight text-center break-words overflow-hidden max-w-full px-0.5",
              compact ? "text-[9px] leading-tight" : "text-xs sm:text-sm line-clamp-2"
            )}>
              {title}
            </span>
            {!compact && <span className="text-xs text-muted-foreground/50 mt-0.5">Locked</span>}
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={cn(
              dynamicHeight 
                ? "relative w-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl flex flex-col items-center shadow-lg shadow-primary/5 overflow-hidden"
                : "absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl flex flex-col items-center shadow-lg shadow-primary/5 overflow-hidden",
              compact ? "p-1 rounded-lg" : "p-2 sm:p-3 md:p-4"
            )}
          >
            <span className={cn(
              "shrink-0 font-bold text-primary/80 uppercase tracking-tight text-center break-words overflow-hidden max-w-full px-0.5",
              compact ? "text-[8px] mb-0.5" : "text-xs sm:text-sm md:text-lg mb-2 line-clamp-2"
            )}>
              {title}
            </span>
            {scaleText && value ? (
              <ScaledText text={value} />
            ) : isMultiLine && displayValue ? (
              <div className={cn(
                "text-center w-full px-0.5 flex-1 flex flex-col justify-center",
                compact ? "space-y-0" : "space-y-0.5"
              )}>
                {displayValue.map((line, idx) => (
                  <div key={idx} className={cn(
                    "font-semibold text-foreground break-words overflow-hidden max-w-full leading-snug",
                    compact ? "text-[8px]" : "text-xs sm:text-sm md:text-base"
                  )}>
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <span className={cn(
                "font-semibold text-foreground text-center break-words overflow-hidden max-w-full px-0.5 flex-1 flex items-center",
                compact ? "text-[9px] leading-tight" : "text-xs sm:text-sm md:text-base"
              )}>
                {value}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
