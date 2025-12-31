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
  game: GameStateResponse;
  onPlayAgain?: () => void;
  isDaily?: boolean;
  onClose?: () => void;
}

export function GameOverModal({ open, game, onPlayAgain, isDaily, onClose }: GameOverModalProps) {
  const isWin = game.status === "won";
  const target = game.targetCompany;
  const streakMilestone = isWin && game.endlessStreak && game.endlessStreak >= 5;

  if (!target) return null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[85vw] sm:max-w-2xl bg-card border-white/10 shadow-2xl p-3 sm:p-6">
        <DialogHeader>
          <div className="mx-auto mb-2 sm:mb-4 flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-full bg-primary/20 relative">
            {isWin ? (
              <Trophy className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 animate-bounce" />
            ) : (
              <XCircle className="h-6 sm:h-8 w-6 sm:w-8 text-destructive animate-pulse" />
            )}
            {streakMilestone && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="absolute -top-2 -right-2"
              >
                <div className="bg-orange-500 rounded-full p-0.5">
                  <Flame className="h-3 sm:h-5 w-3 sm:w-5 text-white" />
                </div>
              </motion.div>
            )}
          </div>
          <DialogTitle className="text-center text-xl sm:text-3xl font-bold">
            {isWin ? "Market Guru!" : "Market Correction"}
          </DialogTitle>
          {streakMilestone && (
            <div className="text-center mt-1 sm:mt-2 px-3 py-1 sm:py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-xs sm:text-sm font-semibold text-orange-500">On fire! {game.endlessStreak} game streak</p>
            </div>
          )}
          {isWin && (
            <DialogDescription className="text-center text-xs sm:text-base mt-1 sm:mt-2">
              You identified {target.name} in {Math.max(1, game.round - 1)} rounds
            </DialogDescription>
          )}
          {!isWin && (
            <DialogDescription className="text-center text-xs sm:text-base mt-1 sm:mt-2">
              Better luck next time. The market is unpredictable.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Company Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 sm:p-6 border border-primary/20">
          <div className="text-center">
            <p className="text-[0.625rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1 sm:mb-3">The Company</p>
            <h2 className="text-lg sm:text-3xl font-bold text-primary mb-1">{target.name}</h2>
            <p className="text-sm sm:text-lg font-mono text-foreground/70">{target.symbol}</p>
          </div>
        </div>

        {/* Six Information Sections */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
          {/* Section 1: Sector & Industry */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-4">
            <p className="text-[0.625rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2 font-semibold">Sector & Industry</p>
            <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{target.sector}</p>
            <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{target.subIndustry}</p>
          </div>

          {/* Section 2: Market Cap */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-4">
            <p className="text-[0.625rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2 font-semibold">Market Cap</p>
            <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{target.marketCap}</p>
          </div>

          {/* Section 3: Headquarters */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-4">
            <p className="text-[0.625rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2 font-semibold">Headquarters</p>
            <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{target.headquarters}</p>
          </div>

          {/* Section 4: Founded */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-4">
            <p className="text-[0.625rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2 font-semibold">Founded</p>
            <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{target.founded}</p>
          </div>

          {/* Section 5: First Letter */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-4">
            <p className="text-[0.625rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2 font-semibold">First Letter</p>
            <p className="text-lg sm:text-2xl font-bold text-primary">{target.symbol.charAt(0)}</p>
          </div>

          {/* Section 6: Known For */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-2 sm:p-4 col-span-1">
            <p className="text-[0.625rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2 font-semibold">Known For</p>
            <p className="text-foreground/80 leading-tight sm:leading-relaxed line-clamp-3 text-[0.65rem] sm:text-sm">{target.description}</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2 pt-4">
          {isDaily ? (
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground mb-4">Come back tomorrow for a new challenge!</p>
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
      </DialogContent>
    </Dialog>
  );
}
