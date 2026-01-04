import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, ArrowRight, RefreshCw, Flame } from "lucide-react";
import type { GameStateResponse } from "@shared/schema";
import { motion } from "framer-motion";

interface GameOverModalProps {
  open: boolean;
  game: any;
  onPlayAgain?: () => void;
  isDaily?: boolean;
  onClose?: () => void;
}

export function GameOverModal({ open, game, onPlayAgain, isDaily, onClose }: GameOverModalProps) {
  const isWin = game?.status === "won";
  const target = game?.targetCompany;
  const streakMilestone = isWin && game?.endlessStreak && game?.endlessStreak >= 5;

  if (!target) return null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg bg-card border-white/10 shadow-2xl p-2 sm:p-4 rounded-xl flex flex-col max-h-[95vh] overflow-hidden outline-none">
        <div className="flex-1 flex flex-col min-h-0">
          <DialogHeader className="sm:mb-1 shrink-0">
            <div className="mx-auto mb-1 sm:mb-2 flex h-8 sm:h-12 w-8 sm:w-12 items-center justify-center rounded-full bg-primary/20 relative">
              {isWin ? (
                <Trophy className="h-4 sm:h-6 w-4 sm:w-6 text-yellow-500 animate-bounce" />
              ) : (
                <XCircle className="h-4 sm:h-6 w-4 sm:w-6 text-destructive animate-pulse" />
              )}
              {streakMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="absolute -top-1 -right-1"
                >
                  <div className="bg-orange-500 rounded-full p-0.5">
                    <Flame className="h-2 sm:h-3.5 w-2 sm:w-3.5 text-white" />
                  </div>
                </motion.div>
              )}
            </div>
            <DialogTitle className="text-center text-base sm:text-2xl font-bold leading-tight">
              {isWin ? "Market Guru!" : "Market Correction"}
            </DialogTitle>
            {streakMilestone && (
              <div className="text-center mt-0.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 rounded-lg mx-auto">
                <p className="text-[0.6rem] sm:text-xs font-semibold text-orange-500">On fire! {game.endlessStreak} game streak</p>
              </div>
            )}
            <DialogDescription className="text-center text-[0.65rem] sm:text-sm mt-0.5">
              {isWin 
                ? `You identified ${target?.name || "the company"} in ${Math.max(1, (game?.round || 1) - 1)} rounds`
                : "Better luck next time. The market is unpredictable."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-1 sm:space-y-3 min-h-0 scrollbar-hide">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-1 sm:p-3 border border-primary/20 shrink-0">
              <div className="text-center">
                <p className="text-[0.45rem] sm:text-[0.7rem] font-mono text-muted-foreground uppercase tracking-widest">The Company</p>
                <h2 className="text-xs sm:text-xl font-bold text-primary leading-tight">{target.name}</h2>
                <p className="text-[0.55rem] sm:text-sm font-mono text-foreground/70">{target.symbol}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 sm:gap-2 shrink-0">
              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1 sm:p-2">
                <p className="text-[0.45rem] sm:text-[0.65rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Sector & Industry</p>
                <p className="text-[0.55rem] sm:text-[0.75rem] font-medium text-foreground line-clamp-1">{target.sector}</p>
                <p className="text-[0.55rem] sm:text-[0.75rem] font-medium text-foreground line-clamp-1">{target.subIndustry}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1 sm:p-2">
                <p className="text-[0.45rem] sm:text-[0.65rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Market Cap</p>
                <p className="text-[0.55rem] sm:text-[0.75rem] font-medium text-foreground line-clamp-1">{target.marketCap}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1 sm:p-2">
                <p className="text-[0.45rem] sm:text-[0.65rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Headquarters</p>
                <p className="text-[0.55rem] sm:text-[0.75rem] font-medium text-foreground line-clamp-1">{target.headquarters}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1 sm:p-2">
                <p className="text-[0.45rem] sm:text-[0.65rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Founded</p>
                <p className="text-[0.55rem] sm:text-[0.75rem] font-medium text-foreground line-clamp-1">{target.founded}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1 sm:p-2">
                <p className="text-[0.45rem] sm:text-[0.65rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">First Letter</p>
                <p className="text-xs sm:text-lg font-bold text-primary leading-none">{target.name.charAt(0)}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1 sm:p-2">
                <p className="text-[0.45rem] sm:text-[0.65rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Known For</p>
                <p className="text-foreground/80 leading-tight line-clamp-2 text-[0.5rem] sm:text-[0.7rem]">{target.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center gap-1.5 pt-1.5 sm:pt-4 shrink-0">
            {isDaily ? (
              <div className="text-center w-full">
                <p className="text-[0.65rem] sm:text-sm text-muted-foreground mb-1.5">New challenge tomorrow!</p>
                <Button className="w-full h-8 sm:h-9" asChild>
                  <a href="/leaderboard">Leaderboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></a>
                </Button>
              </div>
            ) : (
              <div className="flex gap-1.5 w-full">
                <Button variant="outline" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm" asChild>
                  <a href="/">Home</a>
                </Button>
                <Button onClick={onPlayAgain} className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Play Again
                </Button>
              </div>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
