import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN"];

export function MarketleHeader() {
  const [directions, setDirections] = useState<Record<string, boolean>>(
    SYMBOLS.reduce((acc, symbol) => ({ ...acc, [symbol]: Math.random() > 0.5 }), {})
  );
  const [flipKeys, setFlipKeys] = useState<Record<string, number>>(
    SYMBOLS.reduce((acc, symbol) => ({ ...acc, [symbol]: 0 }), {})
  );

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    SYMBOLS.forEach(symbol => {
      const scheduleFlip = () => {
        const delay = Math.random() * 2000 + 2000; // 2-4 seconds
        const timeout = setTimeout(() => {
          // 50/50 chance to skip this flip
          if (Math.random() > 0.5) {
            setDirections(prev => {
              const newDir = !prev[symbol];
              setFlipKeys(prevKeys => ({
                ...prevKeys,
                [symbol]: (prevKeys[symbol] || 0) + 1
              }));
              return {
                ...prev,
                [symbol]: newDir
              };
            });
          }
          scheduleFlip();
        }, delay);
        intervals.push(timeout);
      };
      scheduleFlip();
    });

    return () => {
      intervals.forEach(interval => clearTimeout(interval));
    };
  }, []);

  const flipVariants = {
    flip: {
      rotateX: [0, 180, 360, 540, 720],
      transition: {
        duration: 1.0,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="text-center w-full space-y-3 sm:space-y-4">
      <h1 className="text-4xl sm:text-5xl lg:text-8xl font-extrabold tracking-tight">
        <span className="text-gradient-primary">Marketle</span>
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6">
        {SYMBOLS.map(symbol => (
          <div
            key={symbol}
            style={{ color: directions[symbol] ? "#22c55e" : "#ef4444" }}
            className="inline-flex items-center gap-2 sm:gap-3 text-base sm:text-2xl lg:text-4xl font-bold transition-colors duration-500"
          >
            {symbol}
            <motion.div
              key={`${symbol}-${flipKeys[symbol]}`}
              variants={flipVariants}
              animate={flipKeys[symbol] > 0 ? "flip" : "normal"}
              style={{ perspective: 1000 }}
            >
              {directions[symbol] ? (
                <TrendingUp className="h-5 w-5 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              ) : (
                <TrendingDown className="h-5 w-5 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
