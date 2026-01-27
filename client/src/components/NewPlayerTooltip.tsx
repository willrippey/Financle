import { useState, useEffect } from "react";
import { X, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NewPlayerTooltip() {
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
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mt-3 flex justify-center"
        >
          <div className="bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg shadow-lg flex flex-col items-center gap-1">
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
