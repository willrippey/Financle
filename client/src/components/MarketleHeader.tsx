import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN"];

export function MarketleHeader() {
  const [directions, setDirections] = useState<Record<string, boolean>>(
    SYMBOLS.reduce((acc, symbol) => ({ ...acc, [symbol]: Math.random() > 0.5 }), {})
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDirections(prev =>
        Object.entries(prev).reduce((acc, [symbol, _]) => ({
          ...acc,
          [symbol]: Math.random() > 0.5
        }), {})
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center w-full space-y-3 sm:space-y-4">
      <h1 className="text-4xl sm:text-5xl lg:text-8xl font-extrabold tracking-tight">
        <span className="text-gradient-primary">Marketle</span>
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6">
        {SYMBOLS.map(symbol => (
          <motion.span
            key={symbol}
            animate={{ color: directions[symbol] ? "#22c55e" : "#ef4444" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-lg font-bold"
          >
            {symbol}
            <motion.span
              animate={{ rotate: directions[symbol] ? 0 : 180 }}
              transition={{ duration: 0.5 }}
            >
              {directions[symbol] ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              )}
            </motion.span>
          </motion.span>
        ))}
      </div>
    </div>
  );
}
