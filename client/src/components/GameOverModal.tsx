import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import type { GameStateResponse } from "@shared/schema";
import { motion } from "framer-motion";

interface GameOverModalProps {
  open: boolean;
  game: GameStateResponse;
  onPlayAgain?: () => void;
  isDaily?: boolean;
}

export function GameOverModal({ open, game, onPlayAgain, isDaily }: GameOverModalProps) {
  const isWin = game.status === "won";
  const target = game.targetCompany;

  if (!target) return null;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card border-white/10 shadow-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
            {isWin ? (
              <Trophy className="h-8 w-8 text-yellow-500 animate-bounce" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive animate-pulse" />
            )}
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {isWin ? "Market Guru!" : "Market Correction"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {isWin
              ? `You identified the company in ${game.guesses.length} attempts.`
              : "Better luck next time. The market is unpredictable."}
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 p-6 rounded-xl bg-secondary/30 border border-white/5 space-y-4">
          <div className="text-center">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">The Company Was</span>
            <h3 className="text-xl font-bold text-primary mt-1">{target.name}</h3>
            <p className="text-sm font-mono text-foreground/80 mt-1">{target.symbol}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
             <div className="text-center">
               <span className="text-xs text-muted-foreground block mb-1">Sector</span>
               <span className="text-sm font-medium">{target.sector}</span>
             </div>
             <div className="text-center">
               <span className="text-xs text-muted-foreground block mb-1">Headquarters</span>
               <span className="text-sm font-medium">{target.headquarters}</span>
             </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
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
              <Button onClick={onPlayAgain} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
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
