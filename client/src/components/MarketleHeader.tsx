import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
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
            className="inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-lg lg:text-2xl font-bold"
          >
            {symbol}
            <motion.span
              style={{ scaleX: directions[symbol] ? 1 : -1 }}
              transition={{ duration: 0.5 }}
            >
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </motion.span>
          </motion.span>
        ))}
      </div>
    </div>
  );
}
