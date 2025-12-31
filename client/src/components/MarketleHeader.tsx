import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN"];

export function MarketleHeader() {
  const [directions, setDirections] = useState<Record<string, boolean>>(
    SYMBOLS.reduce((acc, symbol) => ({ ...acc, [symbol]: Math.random() > 0.5 }), {})
  );
  const [bounceKeys, setBounceKeys] = useState<Record<string, number>>(
    SYMBOLS.reduce((acc, symbol) => ({ ...acc, [symbol]: 0 }), {})
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDirections(prev => {
        const newDirections = Object.entries(prev).reduce((acc, [symbol, _]) => ({
          ...acc,
          [symbol]: Math.random() > 0.5
        }), {});
        
        // Trigger flip animation for changed symbols
        setBounceKeys(prevKeys =>
          Object.entries(newDirections).reduce((acc, [symbol, newDir]) => ({
            ...acc,
            [symbol]: (prevKeys[symbol] || 0) + (newDir !== prev[symbol] ? 1 : 0)
          }), {})
        );
        
        return newDirections;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const flipVariants = {
    flip: {
      rotateX: [0, 180, 360, 540, 720],
      transition: {
        duration: 0.6,
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
              key={`${symbol}-${bounceKeys[symbol]}`}
              variants={flipVariants}
              animate={bounceKeys[symbol] > 0 ? "flip" : "normal"}
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
