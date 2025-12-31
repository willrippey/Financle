import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useGame, useSubmitGuess, useCreateGame, useSkipRound } from "@/hooks/use-games";
import { Navbar } from "@/components/Navbar";
import { GameCard } from "@/components/GameCard";
import { CompanySearch } from "@/components/CompanySearch";
import { GameOverModal } from "@/components/GameOverModal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, History, RefreshCw, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const [, params] = useRoute("/game/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const gameId = params ? parseInt(params.id) : undefined;
  const { data: game, isLoading, error } = useGame(gameId);
  const submitGuess = useSubmitGuess();
  const skipRound = useSkipRound();
  const createGame = useCreateGame();

  const [lastGuess, setLastGuess] = useState<string | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const searchCompRef = useRef<{ focusAndOpen: () => void }>(null);

  // Update modal visibility when game status changes
  useEffect(() => {
    if (game && game.status !== 'playing') {
      setShowGameOverModal(true);
    }
  }, [game?.status]);

  // Redirect if game not found
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Game not found. Redirecting home...",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [error, setLocation, toast]);

  // Focus search input when game loads
  useEffect(() => {
    if (game && game.status === 'playing') {
      setTimeout(() => {
        searchCompRef.current?.focusAndOpen();
      }, 100);
    }
  }, [game?.id]);

  if (isLoading || !game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleGuess = (symbol: string) => {
    setLastGuess(symbol);
    submitGuess.mutate({
      gameId: game.id,
      companySymbol: symbol,
    }, {
      onError: (err) => {
        toast({
          title: "Invalid Guess",
          description: err.message,
          variant: "destructive"
        });
        // Auto-focus input after incorrect guess
        searchCompRef.current?.focusAndOpen();
      },
      onSuccess: () => {
        // Auto-focus input after guess
        searchCompRef.current?.focusAndOpen();
      }
    });
  };

  const handleSkip = () => {
    skipRound.mutate({
      gameId: game.id,
    }, {
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      },
      onSuccess: () => {
        searchCompRef.current?.focusAndOpen();
      }
    });
  };

  const handlePlayAgain = () => {
    createGame.mutate({ type: 'endless' }, {
      onSuccess: (newGame) => {
        setLocation(`/game/${newGame.id}`);
      }
    });
  };

  const handleModalClose = () => {
    // Close the modal without navigating
    setShowGameOverModal(false);
  };

  const isGameOver = game.status !== 'playing';
  const attemptsLeft = Math.max(0, 7 - game.round);
  const progress = (game.round / 6) * 100;

  // Clue display logic - always visible or revealed progressively
  const clues = [
    { 
      title: "Sector & Industry", 
      value: game.clues.category && (game.clues as any).subIndustry ? `${game.clues.category}\n${(game.clues as any).subIndustry}` : undefined,
      revealed: !!(game.clues.category && (game.clues as any).subIndustry),
      isMultiLine: true
    },
    { title: "Market Cap", value: game.clues.marketCap, revealed: !!game.clues.marketCap },
    { title: "Headquarters", value: game.clues.headquarters, revealed: !!game.clues.headquarters },
    { title: "Founded", value: game.clues.founded, revealed: !!game.clues.founded },
    { title: "First Letter", value: game.clues.firstLetter, revealed: !!game.clues.firstLetter },
    { title: "Known For", value: game.clues.description, revealed: !!game.clues.description },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-4xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground pl-0 h-8 text-xs sm:text-sm flex-shrink-0">
            <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          {/* Center: Current Streak for endless mode */}
          {game.type === 'endless' && (
            <div className="text-center flex-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-0">Streak</span>
              <span className="text-lg sm:text-2xl font-mono font-bold text-primary">{game.endlessStreak || 0}</span>
            </div>
          )}

          {/* Right: Game type and rounds */}
          <div className="text-right flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-0">
              {game.type === 'daily' ? 'Daily' : 'Endless'}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-mono font-bold">{game.round}/6</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4 relative h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {clues.map((clue, idx) => (
            <div key={clue.title} className={clue.fullWidth ? "col-span-2 md:col-span-3" : "col-span-1"}>
              <GameCard 
                title={clue.title} 
                value={clue.value} 
                revealed={clue.revealed}
                delay={idx}
                className={clue.fullWidth ? "h-28 sm:h-32 md:h-40" : "h-24 sm:h-28 md:h-32"}
                isMultiLine={clue.isMultiLine}
              />
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="max-w-xl mx-auto space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {!isGameOver ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-2"
            >
              <div className="text-center mb-1 sm:mb-2">
                <h3 className="text-sm sm:text-base font-medium text-foreground mb-0">Make your guess</h3>
                <p className="text-xs text-muted-foreground">{attemptsLeft} remaining</p>
              </div>
              
              <div className="flex gap-1 sm:gap-2 w-full overflow-hidden">
                <div className="flex-1 min-w-0">
                  <CompanySearch 
                    onSelect={handleGuess} 
                    disabled={submitGuess.isPending || skipRound.isPending} 
                    inputRef={searchInputRef}
                    guessedSymbols={game.guesses.map(g => g.symbol)}
                    searchRef={searchCompRef}
                  />
                </div>
                <Button 
                  variant="outline"
                  onClick={handleSkip}
                  disabled={submitGuess.isPending || skipRound.isPending}
                  data-testid="button-skip"
                  title="Skip this round to reveal the next clue"
                  className="h-12 px-2 sm:px-4 text-xs sm:text-sm flex-shrink-0"
                >
                  <SkipForward className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Skip</span>
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-2 sm:p-4 bg-secondary/20 rounded-lg border border-white/5">
              <h3 className="text-lg sm:text-xl font-bold mb-1">Game Over</h3>
              {game.targetCompany && (
                <p className="text-base sm:text-lg font-semibold text-primary mb-1">{game.targetCompany.name}</p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground">Check your results!</p>
            </div>
          )}
        </div>

        {/* Previous Guesses Section and Play Again Button */}
        {(game.guesses.length > 0 || (game as any).skippedRounds?.length > 0) && (
          <div className="max-w-xl mx-auto pt-2 sm:pt-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-2 sm:mb-3">
              <History className="h-4 w-4" /> Previous Guesses
            </div>
            <div className="space-y-2 pb-6">
              <AnimatePresence>
                {(() => {
                  const skippedRounds = (game as any).skippedRounds || [];
                  const totalRoundsPlayed = game.round - 1;
                  
                  // Build complete history for all rounds played
                  const attempts = [];
                  let guessIdx = 0;
                  
                  for (let round = 1; round <= totalRoundsPlayed; round++) {
                    if (skippedRounds.includes(round)) {
                      attempts.push({ round, isSkipped: true, guess: undefined });
                    } else {
                      attempts.push({ round, isSkipped: false, guess: game.guesses[guessIdx] });
                      guessIdx++;
                    }
                  }
                  
                  // Sort by round descending for display
                  return attempts.sort((a, b) => b.round - a.round).map((attempt) => {
                    const isCorrectGuess = game.status === 'won' && attempt.guess && !attempt.isSkipped && attempt.round === totalRoundsPlayed;
                    return (
                      <motion.div
                        key={`attempt-${attempt.round}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-white/5 shadow-sm"
                      >
                         <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-muted-foreground w-12">#{attempt.round}</span>
                            {attempt.isSkipped ? (
                              <span className="font-medium text-muted-foreground italic">Skipped</span>
                            ) : (
                              <span className="font-medium">{attempt.guess?.name}</span>
                            )}
                         </div>
                         {attempt.isSkipped ? (
                           <span className="text-xs font-mono text-muted-foreground">—</span>
                         ) : isCorrectGuess ? (
                           <span className="text-xs font-mono text-green-500 font-semibold">Correct!</span>
                         ) : (
                           <span className="text-xs font-mono text-destructive">MISS</span>
                         )}
                      </motion.div>
                    );
                  });
                })()}
              </AnimatePresence>
            </div>

            {/* Play Again Button - Only show when game is over */}
            {isGameOver && !showGameOverModal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 max-w-xl mx-auto pt-4"
              >
                <Button variant="outline" className="flex-1" onClick={() => setLocation("/")} data-testid="button-home">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Home
                </Button>
                <Button onClick={handlePlayAgain} className="flex-1" data-testid="button-play-again">
                  <RefreshCw className="mr-2 h-4 w-4" /> Play Again
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </main>

      <GameOverModal 
        open={showGameOverModal} 
        game={game} 
        onPlayAgain={handlePlayAgain}
        isDaily={game.type === 'daily'}
        onClose={handleModalClose}
      />
    </div>
  );
}
