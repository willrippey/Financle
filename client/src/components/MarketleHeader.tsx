import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

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
    <div className="text-center space-y-2 sm:space-y-3">
      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
        <motion.div
          key="left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg sm:text-2xl font-bold"
        >
          {SYMBOLS.slice(0, 2).map(symbol => (
            <motion.span
              key={symbol}
              animate={{ color: directions[symbol] ? "#22c55e" : "#ef4444" }}
              transition={{ duration: 0.5 }}
              className="mr-3 inline-flex items-center gap-1"
            >
              {symbol}
              <motion.span
                animate={{ rotate: directions[symbol] ? 0 : 180 }}
                transition={{ duration: 0.5 }}
              >
                {directions[symbol] ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </motion.span>
            </motion.span>
          ))}
        </motion.div>

        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight">
          <span className="text-gradient-primary">Marketle</span>
        </h1>

        <motion.div
          key="right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg sm:text-2xl font-bold"
        >
          {SYMBOLS.slice(2, 4).map(symbol => (
            <motion.span
              key={symbol}
              animate={{ color: directions[symbol] ? "#22c55e" : "#ef4444" }}
              transition={{ duration: 0.5 }}
              className="ml-3 inline-flex items-center gap-1"
            >
              <motion.span
                animate={{ rotate: directions[symbol] ? 0 : 180 }}
                transition={{ duration: 0.5 }}
              >
                {directions[symbol] ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </motion.span>
              {symbol}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
