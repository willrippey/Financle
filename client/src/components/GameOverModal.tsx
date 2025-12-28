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
  const streakMilestone = game.endlessStreak && game.endlessStreak >= 5;

  if (!target) return null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-white/10 shadow-2xl">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 relative">
            {isWin ? (
              <Trophy className="h-8 w-8 text-yellow-500 animate-bounce" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive animate-pulse" />
            )}
            {streakMilestone && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="absolute -top-2 -right-2"
              >
                <div className="bg-orange-500 rounded-full p-1">
                  <Flame className="h-5 w-5 text-white" />
                </div>
              </motion.div>
            )}
          </div>
          <DialogTitle className="text-center text-3xl font-bold">
            {isWin ? "Market Guru!" : "Market Correction"}
          </DialogTitle>
          {streakMilestone && isWin && (
            <div className="text-center mt-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm font-semibold text-orange-500">On fire! {game.endlessStreak} game streak</p>
            </div>
          )}
          <DialogDescription className="text-center text-base mt-2">
            {isWin
              ? `You identified ${target.name} in ${game.guesses.length} attempt${game.guesses.length !== 1 ? 's' : ''}`
              : "Better luck next time. The market is unpredictable."}
          </DialogDescription>
        </DialogHeader>

        {/* Company Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <div className="text-center">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">The Company</p>
            <h2 className="text-3xl font-bold text-primary mb-1">{target.name}</h2>
            <p className="text-lg font-mono text-foreground/70">{target.symbol}</p>
          </div>
        </div>

        {/* Six Information Sections */}
        <div className="grid grid-cols-2 gap-4">
          {/* Section 1: Sector & Industry */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Sector</p>
            <p className="text-sm font-medium text-foreground">{target.sector}</p>
            <p className="text-xs text-muted-foreground mt-1">{target.subIndustry}</p>
          </div>

          {/* Section 2: Market Cap */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Market Cap</p>
            <p className="text-sm font-medium text-foreground">{target.marketCap}</p>
          </div>

          {/* Section 3: Headquarters */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Headquarters</p>
            <p className="text-sm font-medium text-foreground">{target.headquarters}</p>
          </div>

          {/* Section 4: Founded */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Founded</p>
            <p className="text-sm font-medium text-foreground">{target.founded}</p>
          </div>

          {/* Section 5: First Letter */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 font-semibold">First Letter</p>
            <p className="text-2xl font-bold text-primary">{target.symbol.charAt(0)}</p>
          </div>

          {/* Section 6: Description */}
          <div className="rounded-lg bg-secondary/40 border border-white/5 p-4 col-span-2 md:col-span-1">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 font-semibold">About</p>
            <p className="text-xs text-foreground/80 leading-relaxed">{target.description}</p>
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
