import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, ArrowRight, RefreshCw, Flame, Share2, Check, CalendarDays, Home } from "lucide-react";
import type { GameStateResponse } from "@shared/schema";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface GameOverModalProps {
  open: boolean;
  game: any;
  onPlayAgain?: () => void;
  isDaily?: boolean;
  onClose?: () => void;
}

function generateShareText(game: any, isDaily: boolean): string {
  const isWin = game?.status === "won";
  const totalRounds = 6;
  const skippedRounds = game?.skippedRounds || [];
  const guesses = game?.guesses || [];
  // Calculate actual rounds used from guesses + skips (more reliable than game.round which may be incremented)
  const roundsUsed = isWin 
    ? guesses.length + skippedRounds.length 
    : Math.min(game?.round || 6, 6);
  const target = game?.targetCompany;
  
  // Check if a guess matches the specific clue for that round
  const matchesClueAtRound = (guess: any, round: number): boolean => {
    if (!target || !guess) return false;
    
    // Each round checks ONLY the clue revealed at that round:
    // Round 1: Sector + Sub-Industry
    // Round 2: Market Cap  
    // Round 3: Headquarters
    // Round 4: Founded
    // Round 5: First Letter
    // Round 6: Description (no match possible)
    
    switch (round) {
      case 1:
        return guess.sector === target.sector || guess.subIndustry === target.subIndustry;
      case 2:
        return guess.marketCap === target.marketCap;
      case 3:
        return guess.headquarters === target.headquarters;
      case 4:
        return guess.founded === target.founded;
      case 5:
        return guess.firstLetter === target.name?.[0];
      default:
        return false;
    }
  };
  
  // Build emoji grid - only show squares up to the winning/final round
  let emojiGrid = "";
  let guessIndex = 0;
  const roundsToShow = isWin ? roundsUsed : totalRounds;
  
  for (let round = 1; round <= roundsToShow; round++) {
    if (isWin && round === roundsUsed) {
      emojiGrid += "\u2705"; // check mark - correct
    } else if (skippedRounds.includes(round)) {
      emojiGrid += "\u27A1\uFE0F"; // arrow - skipped
    } else {
      // Get the guess for this round
      const guess = guesses[guessIndex];
      guessIndex++;
      
      if (matchesClueAtRound(guess, round)) {
        emojiGrid += "\uD83D\uDFE8"; // yellow square - partial match
      } else {
        emojiGrid += "\uD83D\uDFE5"; // red square - no match
      }
    }
  }
  
  // Format date for daily
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  
  // Build share text
  const gameType = isDaily ? "Daily" : game?.filters?.difficulty === "easy" ? "Easy" : "Endless";
  const title = `Financle ${gameType} ${isDaily ? dateStr : ""}`.trim();
  const score = isWin ? `${roundsUsed}/6` : "X/6";
  
  let text = `${title}\n${score}\n\n${emojiGrid}`;
  
  // Add streak for endless mode
  if (!isDaily && game?.endlessStreak && game.endlessStreak > 1) {
    text += `\n\nStreak: ${game.endlessStreak}`;
  }
  
  text += "\n\nhttps://financlegame.com";
  
  return text;
}

export function GameOverModal({ open, game, onPlayAgain, isDaily, onClose }: GameOverModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isWin = game?.status === "won";
  const target = game?.targetCompany;
  
  // Check if this is a previous daily (date is before today)
  const isPreviousDaily = isDaily && game?.dailyDate && (() => {
    const today = new Date().toISOString().split('T')[0];
    return game.dailyDate < today;
  })();

  const handleShare = async () => {
    const shareText = generateShareText(game, isDaily || false);
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Share your results with friends.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      toast({
        title: "Unable to copy",
        description: "Please copy the text manually.",
        variant: "destructive",
      });
    }
  };
  const streakMilestone = isWin && game?.endlessStreak && game?.endlessStreak >= 5;

  if (!target) return null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl bg-card border-white/10 shadow-2xl p-3 sm:p-6 rounded-xl flex flex-col max-h-[95vh] overflow-hidden outline-none">
        <div className="flex-1 flex flex-col min-h-0">
          <DialogHeader className="sm:mb-2 shrink-0">
            <div className="mx-auto mb-2 sm:mb-3 flex h-10 sm:h-14 w-10 sm:w-14 items-center justify-center rounded-full bg-primary/20 relative">
              {isWin ? (
                <Trophy className="h-5 sm:h-7 w-5 sm:w-7 text-yellow-500 animate-bounce" />
              ) : (
                <XCircle className="h-5 sm:h-7 w-5 sm:w-7 text-destructive animate-pulse" />
              )}
              {streakMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="absolute -top-1 -right-1"
                >
                  <div className="bg-orange-500 rounded-full p-1">
                    <Flame className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
                  </div>
                </motion.div>
              )}
            </div>
            <DialogTitle className="text-center text-xl sm:text-3xl font-bold leading-tight">
              {isWin ? "Market Guru!" : "Market Correction"}
            </DialogTitle>
            {streakMilestone && (
              <div className="text-center mt-1 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg mx-auto">
                <p className="text-xs sm:text-sm font-semibold text-orange-500">On fire! {game.endlessStreak} game streak</p>
              </div>
            )}
            <DialogDescription className="text-center text-sm sm:text-base mt-1">
              {isWin 
                ? `You identified ${target?.name || "the company"} in ${Math.max(1, (game?.round || 1) - 1)} ${Math.max(1, (game?.round || 1) - 1) === 1 ? 'round' : 'rounds'}`
                : "Better luck next time. The market is unpredictable."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 sm:space-y-4 min-h-0 scrollbar-hide">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-2 sm:p-4 border border-primary/20 shrink-0">
              <div className="text-center">
                <p className="text-[0.6rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest">The Company</p>
                <h2 className="text-base sm:text-2xl font-bold text-primary leading-tight">{target.name}</h2>
                <p className="text-xs sm:text-base font-mono text-foreground/70">{target.symbol}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-3 shrink-0">
              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1.5 sm:p-3">
                <p className="text-[0.55rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Sector & Industry</p>
                <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">{target.sector}</p>
                <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">{target.subIndustry}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1.5 sm:p-3">
                <p className="text-[0.55rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Market Cap</p>
                <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">{target.marketCap}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1.5 sm:p-3">
                <p className="text-[0.55rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Headquarters</p>
                <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">{target.headquarters}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1.5 sm:p-3">
                <p className="text-[0.55rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Founded</p>
                <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">{target.founded}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1.5 sm:p-3">
                <p className="text-[0.55rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">First Letter</p>
                <p className="text-sm sm:text-xl font-bold text-primary leading-none">{target.name.charAt(0)}</p>
              </div>

              <div className="rounded-lg bg-secondary/40 border border-white/5 p-1.5 sm:p-3">
                <p className="text-[0.55rem] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5 font-semibold">Known For</p>
                <p className="text-foreground/80 leading-tight line-clamp-2 text-xs sm:text-sm">{target.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center gap-2 pt-2 sm:pt-5 shrink-0">
            {isPreviousDaily ? (
              <div className="w-full space-y-2">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 h-10 sm:h-11 text-sm sm:text-base" asChild>
                    <a href="/">
                      <Home className="mr-1.5 h-4 w-4" />
                      Home
                    </a>
                  </Button>
                  <Button className="flex-1 h-10 sm:h-11 text-sm sm:text-base" asChild>
                    <a href="/previous-dailies">
                      <CalendarDays className="mr-1.5 h-4 w-4" />
                      More Dailies
                    </a>
                  </Button>
                </div>
              </div>
            ) : isDaily ? (
              <div className="w-full space-y-2">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 h-10 sm:h-11 text-sm sm:text-base" asChild>
                    <a href="/">Home</a>
                  </Button>
                  <Button 
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base" 
                    onClick={handleShare}
                    data-testid="button-share"
                  >
                    {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Share2 className="mr-1.5 h-4 w-4" />}
                    {copied ? "Copied!" : "Share"}
                  </Button>
                </div>
                <p className="text-xs sm:text-base text-muted-foreground text-center">New challenge tomorrow!</p>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 h-10 sm:h-11 text-sm sm:text-base" asChild>
                    <a href="/">Home</a>
                  </Button>
                  <Button onClick={onPlayAgain} className="flex-1 h-10 sm:h-11 text-sm sm:text-base">
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
