import { useAuth } from "@/hooks/use-auth";
import { useCreateGame, useDailyGame } from "@/hooks/use-games";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { MarketleHeader } from "@/components/MarketleHeader";
import { useLocation } from "wouter";
import { Calendar, Infinity as InfinityIcon, Trophy, Flame, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const createGameMutation = useCreateGame();
  
  // Prefetch daily game to check status
  const { data: dailyGame, isLoading: isDailyLoading } = useDailyGame();

  const handlePlayEndless = () => {
    createGameMutation.mutate({ type: 'endless' }, {
      onSuccess: (game) => {
        setLocation(`/game/${game.id}`);
      }
    });
  };

  const handlePlayDaily = () => {
    // Navigate to the daily game
    if (dailyGame?.id) {
      setTimeout(() => {
        setLocation(`/game/${dailyGame.id}`);
      }, 0);
    }
  };

  if (isAuthLoading || (user && isDailyLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dailyCompleted = dailyGame?.status === 'won' || dailyGame?.status === 'lost';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex flex-col items-center justify-start max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full mb-4 sm:mb-8"
        >
          <MarketleHeader />
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto text-balance text-center mt-3 sm:mt-4">
            Guess the S&P 500 company from 6 clues.
          </p>
        </motion.div>

        {!user ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md px-2"
          >
            <Card className="glass-panel border-white/10 bg-card/50">
              <CardHeader className="text-center pb-2 sm:pb-3 pt-3 sm:pt-5">
                <CardTitle className="text-lg sm:text-2xl">Ready to Invest?</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Login to track your streak and compete.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-3 sm:pt-4 pb-3 sm:pb-4">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = "/api/login"}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Login to Play
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-4xl px-2">
            {/* Daily Challenge Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-primary/20 bg-gradient-to-b from-card to-card/50 hover:border-primary/40 transition-all duration-300 relative overflow-hidden group flex flex-col">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <CardHeader className="pb-1 sm:pb-2">
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg text-primary">
                      <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    {dailyCompleted && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-white/5">
                        DONE
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base sm:text-xl">Daily Challenge</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    One company, everyone plays. Beat the market.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-3 sm:pt-4 mt-auto pb-0">
                  <Button 
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm font-semibold" 
                    variant={dailyCompleted ? "secondary" : "default"}
                    onClick={handlePlayDaily}
                    disabled={isDailyLoading}
                    data-testid="button-play-daily"
                  >
                    {isDailyLoading ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : dailyCompleted ? (
                      "Results"
                    ) : (
                      "Play"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Endless Mode Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-white/10 bg-card/50 hover:border-white/20 transition-all duration-300 group flex flex-col">
                <CardHeader className="pb-1 sm:pb-2">
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg text-purple-400">
                      <InfinityIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-xl text-purple-100">Endless Mode</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Unlimited random companies. Build your streak.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-3 sm:pt-4 mt-auto pb-0">
                  <Button 
                    variant="outline" 
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm border-white/10 hover:bg-white/5 hover:text-white"
                    onClick={handlePlayEndless}
                    disabled={createGameMutation.isPending && createGameMutation.variables?.type === 'endless'}
                  >
                    {createGameMutation.isPending && createGameMutation.variables?.type === 'endless' ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      "Play"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Stats Section */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-4xl mt-4 sm:mt-6 lg:mt-8 px-2"
          >
            <Card className="bg-secondary/20 border-white/5 text-center p-2 sm:p-4 flex flex-col items-center justify-center">
              <Flame className="h-4 w-4 sm:h-6 sm:w-6 text-orange-500 mx-auto mb-0.5 sm:mb-1" />
              <div className="text-xl sm:text-2xl font-bold font-mono">{user.currentStreak}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-tight mt-0.5">Streak</div>
            </Card>
            <Card className="bg-secondary/20 border-white/5 text-center p-2 sm:p-4 flex flex-col items-center justify-center">
              <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-500 mx-auto mb-0.5 sm:mb-1" />
              <div className="text-xl sm:text-2xl font-bold font-mono">{user.totalWins}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-tight mt-0.5">Wins</div>
            </Card>
            <Card className="bg-secondary/20 border-white/5 text-center p-2 sm:p-4 flex flex-col items-center justify-center col-span-2 sm:col-span-1">
              <div className="text-sm sm:text-xl text-blue-500 mx-auto mb-0.5 sm:mb-1 font-bold">%</div>
              <div className="text-xl sm:text-2xl font-bold font-mono">
                {user.totalPlayed > 0 ? Math.round((user.totalWins / user.totalPlayed) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-tight mt-0.5">Win Rate</div>
            </Card>
          </motion.div>
        )}
      </main>
      
      <footer className="w-full py-2 sm:py-4 border-t border-white/5 text-center text-xs text-muted-foreground px-2">
        <p>© 2024 Marketle</p>
      </footer>
    </div>
  );
}
