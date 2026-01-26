import { useState, useEffect } from "react";
import { X, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewPlayerTooltipProps {
  onDismiss?: () => void;
}

export function NewPlayerTooltip({ onDismiss }: NewPlayerTooltipProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenHowToPlay = localStorage.getItem('financle_seen_how_to_play');
    if (!hasSeenHowToPlay) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('financle_seen_how_to_play', 'true');
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed left-1/2 -translate-x-1/2 z-50"
          style={{ top: 'calc(50% + 80px)' }}
        >
          <div className="bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg shadow-lg flex flex-col items-center gap-1 whitespace-nowrap">
            <ArrowUp className="h-3 w-3" />
            <div className="flex items-center gap-2">
              <span>New player? Click here to learn how to play</span>
              <button 
                onClick={handleDismiss}
                className="hover:bg-primary-foreground/20 rounded p-0.5"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
