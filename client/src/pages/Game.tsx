import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useGame, useSubmitGuess, useCreateGame } from "@/hooks/use-games";
import { Navbar } from "@/components/Navbar";
import { GameCard } from "@/components/GameCard";
import { CompanySearch } from "@/components/CompanySearch";
import { GameOverModal } from "@/components/GameOverModal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, History } from "lucide-react";
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
      },
      onSuccess: () => {
        // Auto-focus input after guess
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
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
    setLocation('/');
  };

  const isGameOver = game.status !== 'playing';
  const attemptsLeft = 6 - game.round;
  const progress = (game.round / 6) * 100;

  // Clue display logic - always visible or revealed progressively
  const clues = [
    { title: "Sector & Industry", value: game.clues.category, revealed: !!game.clues.category },
    { title: "Market Cap", value: game.clues.marketCap, revealed: !!game.clues.marketCap },
    { title: "Headquarters", value: game.clues.headquarters, revealed: !!game.clues.headquarters },
    { title: "Founded", value: game.clues.founded, revealed: !!game.clues.founded },
    { title: "First Letter", value: game.clues.firstLetter, revealed: !!game.clues.firstLetter },
    { title: "Description", value: game.clues.description, revealed: !!game.clues.description },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground pl-0 h-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
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
        <div className="max-w-xl mx-auto space-y-3 mb-8">
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
                  <CompanySearch onSelect={handleGuess} disabled={submitGuess.isPending} inputRef={searchInputRef} />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-4 bg-secondary/20 rounded-xl border border-white/5">
              <h3 className="text-xl font-bold mb-2">Game Over</h3>
              <p className="text-muted-foreground">Check out your results!</p>
            </div>
          )}
        </div>
      </main>

      {/* Previous Guesses Section at Bottom */}
      {game.guesses.length > 0 && (
        <div className="border-t border-white/5 bg-background/50 backdrop-blur-sm sticky bottom-0 w-full">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-4">
              <History className="h-4 w-4" /> Previous Guesses
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {game.guesses.slice().reverse().map((guess, idx) => (
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
                     <span className="text-xs font-mono text-destructive">MISS</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )} 

      <GameOverModal 
        open={isGameOver} 
        game={game} 
        onPlayAgain={handlePlayAgain}
        isDaily={game.type === 'daily'}
        onClose={handleModalClose}
      />
    </div>
  );
}
