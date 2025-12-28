import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useGame, useSubmitGuess, useCreateGame } from "@/hooks/use-games";
import { Navbar } from "@/components/Navbar";
import { GameCard } from "@/components/GameCard";
import { CompanySearch } from "@/components/CompanySearch";
import { GameOverModal } from "@/components/GameOverModal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, History, RefreshCw } from "lucide-react";
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
  const attemptsLeft = Math.max(0, 6 - game.guesses.length);
  const progress = (game.guesses.length / 6) * 100;

  // Clue display logic - always visible or revealed progressively
  const clues = [
    { title: "Sector & Industry", value: game.clues.category, revealed: !!game.clues.category },
    { title: "Market Cap", value: game.clues.marketCap, revealed: !!game.clues.marketCap },
    { title: "Headquarters", value: game.clues.headquarters, revealed: !!game.clues.headquarters },
    { title: "Founded", value: game.clues.founded, revealed: !!game.clues.founded },
    { title: "First Letter", value: game.clues.firstLetter, revealed: !!game.clues.firstLetter },
    { title: "Known For", value: game.clues.description, revealed: !!game.clues.description },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-4 max-w-4xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground pl-0 h-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {/* Center: Current Streak for endless mode */}
          {game.type === 'endless' && (
            <div className="text-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-1">Current Streak</span>
              <span className="text-2xl font-mono font-bold text-primary">{game.endlessStreak || 0}</span>
            </div>
          )}

          {/* Right: Game type and rounds */}
          <div className="text-right">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-0">
              {game.type === 'daily' ? 'Daily Challenge' : 'Endless Mode'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-bold">{game.round}/6</span>
              <span className="text-xs text-muted-foreground">Rounds</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 relative h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {clues.map((clue, idx) => (
            <div key={clue.title} className={clue.fullWidth ? "col-span-2 md:col-span-3" : "col-span-1"}>
              <GameCard 
                title={clue.title} 
                value={clue.value} 
                revealed={clue.revealed}
                delay={idx}
                className={clue.fullWidth ? "h-40" : "h-32"}
              />
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="max-w-xl mx-auto space-y-3 mb-6">
          {!isGameOver ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-2"
            >
              <div className="text-center mb-2">
                <h3 className="text-base font-medium text-foreground mb-0">Make your guess</h3>
                <p className="text-xs text-muted-foreground">{attemptsLeft} attempts remaining</p>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <CompanySearch 
                    onSelect={handleGuess} 
                    disabled={submitGuess.isPending} 
                    inputRef={searchInputRef}
                    guessedSymbols={game.guesses.map(g => g.symbol)}
                    searchRef={searchCompRef}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-4 bg-secondary/20 rounded-xl border border-white/5">
              <h3 className="text-xl font-bold mb-2">Game Over</h3>
              {game.targetCompany && (
                <p className="text-lg font-semibold text-primary mb-2">{game.targetCompany.name}</p>
              )}
              <p className="text-muted-foreground">Check out your results!</p>
            </div>
          )}
        </div>

        {/* Previous Guesses Section and Play Again Button */}
        {game.guesses.length > 0 && (
          <div className="max-w-xl mx-auto pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-4">
              <History className="h-4 w-4" /> Previous Guesses
            </div>
            <div className="space-y-2 pb-6">
              <AnimatePresence>
                {game.guesses.slice().reverse().map((guess, idx) => {
                  const isCorrectGuess = game.status === 'won' && idx === 0;
                  return (
                    <motion.div
                      key={guess.symbol + idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-white/5 shadow-sm"
                    >
                       <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-muted-foreground w-12">{guess.symbol}</span>
                          <span className="font-medium">{guess.name}</span>
                       </div>
                       {isCorrectGuess ? (
                         <span className="text-xs font-mono text-green-500 font-semibold">Correct!</span>
                       ) : (
                         <span className="text-xs font-mono text-destructive">MISS</span>
                       )}
                    </motion.div>
                  );
                })}
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
