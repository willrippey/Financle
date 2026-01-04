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
      <DialogContent className="w-[95vw] sm:max-w-lg bg-card border-white/10 shadow-2xl p-2 sm:p-4 rounded-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <DialogHeader className="sm:mb-2 shrink-0">
            <div className="mx-auto mb-1 sm:mb-2 flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full bg-primary/20 relative">
              {isWin ? (
                <Trophy className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-500 animate-bounce" />
              ) : (
                <XCircle className="h-5 sm:h-6 w-5 sm:w-6 text-destructive animate-pulse" />
              )}
              {streakMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="absolute -top-1 -right-1"
                >
                  <div className="bg-orange-500 rounded-full p-0.5">
                    <Flame className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 text-white" />
                  </div>
                </motion.div>
              )}
            </div>
            <DialogTitle className="text-center text-lg sm:text-2xl font-bold">
              {isWin ? "Market Guru!" : "Market Correction"}
            </DialogTitle>
            {streakMilestone && (
              <div className="text-center mt-0.5 sm:mt-1 px-2 py-0.5 sm:py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-[0.65rem] sm:text-xs font-semibold text-orange-500">On fire! {game.endlessStreak} game streak</p>
              </div>
            )}
            {isWin && (
              <DialogDescription className="text-center text-[0.7rem] sm:text-sm mt-0.5 sm:mt-1">
                You identified {target?.name || "the company"} in {Math.max(1, (game?.round || 1) - 1)} rounds
              </DialogDescription>
            )}
            {!isWin && (
              <DialogDescription className="text-center text-[0.7rem] sm:text-sm mt-0.5 sm:mt-1">
                Better luck next time. The market is unpredictable.
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 sm:space-y-4 min-h-0 scrollbar-hide">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-2 sm:p-4 border border-primary/20 shrink-0">
              <div className="text-center">
                <p className="text-[0.6rem] sm:text-[0.7rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-2">The Company</p>
                <h2 className="text-base sm:text-2xl font-bold text-primary mb-0.5">{target.name}</h2>
                <p className="text-xs sm:text-base font-mono text-foreground/70">{target.symbol}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 shrink-0">
              <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-3">
                <p className="text-[0.6rem] sm:text-[0.7rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1 font-semibold">Sector & Industry</p>
                <p className="text-[0.7rem] sm:text-xs font-medium text-foreground line-clamp-1">{target.sector}</p>
                <p className="text-[0.7rem] sm:text-xs font-medium text-foreground line-clamp-1">{target.subIndustry}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-3">
                <p className="text-[0.6rem] sm:text-[0.7rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1 font-semibold">Market Cap</p>
                <p className="text-[0.7rem] sm:text-xs font-medium text-foreground line-clamp-1">{target.marketCap}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-3">
                <p className="text-[0.6rem] sm:text-[0.7rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1 font-semibold">Headquarters</p>
                <p className="text-[0.7rem] sm:text-xs font-medium text-foreground line-clamp-1">{target.headquarters}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-3">
                <p className="text-[0.6rem] sm:text-[0.7rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1 font-semibold">Founded</p>
                <p className="text-[0.7rem] sm:text-xs font-medium text-foreground line-clamp-1">{target.founded}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-3">
                <p className="text-[0.6rem] sm:text-[0.7rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1 font-semibold">First Letter</p>
                <p className="text-base sm:text-xl font-bold text-primary">{target.name.charAt(0)}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-3">
                <p className="text-[0.6rem] sm:text-[0.7rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1 font-semibold">Known For</p>
                <p className="text-foreground/80 leading-tight line-clamp-2 text-[0.65rem] sm:text-[0.75rem]">{target.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center gap-2 pt-2 sm:pt-4 shrink-0">
            {isDaily ? (
              <div className="text-center w-full">
                <p className="text-sm text-muted-foreground mb-2">Come back tomorrow for a new challenge!</p>
                <Button className="w-full" asChild>
                  <a href="/leaderboard">See Leaderboard <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/">Home</a>
                </Button>
                <Button onClick={onPlayAgain} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
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
