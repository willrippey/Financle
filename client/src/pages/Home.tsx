import { useAuth } from "@/hooks/use-auth";
import { useCreateGame, useDailyGame } from "@/hooks/use-games";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
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
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 flex flex-col items-center justify-center max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-2 sm:space-y-3 lg:space-y-4"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-2 sm:mb-4">
            <span className="text-gradient-primary">Marketle</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Test your market knowledge. Guess the S&P 500 company from 6 clues.
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
              <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6">
                <CardTitle className="text-xl sm:text-2xl">Ready to Invest?</CardTitle>
                <CardDescription className="text-sm sm:text-base">Login to track your streak and compete on the leaderboard.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-4 sm:pt-6 pb-4 sm:pb-6">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = "/api/login"}
                  className="w-full h-11 sm:h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Login to Play
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl px-2">
            {/* Daily Challenge Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-primary/20 bg-gradient-to-b from-card to-card/50 hover:border-primary/40 transition-all duration-300 relative overflow-hidden group flex flex-col">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-primary/20 rounded-lg sm:rounded-xl text-primary">
                      <Calendar className="h-5 w-5 sm:h-8 sm:w-8" />
                    </div>
                    {dailyCompleted && (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-white/5">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg sm:text-2xl">Daily Challenge</CardTitle>
                  <CardDescription className="text-xs sm:text-base">
                    One company, everyone plays the same. Can you beat the market today?
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-4 sm:pt-8 mt-auto">
                  <Button 
                    size="lg" 
                    className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold" 
                    variant={dailyCompleted ? "secondary" : "default"}
                    onClick={handlePlayDaily}
                    disabled={isDailyLoading}
                    data-testid="button-play-daily"
                  >
                    {isDailyLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : dailyCompleted ? (
                      "View Results"
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 fill-current" /> Play Daily
                      </>
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
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg sm:rounded-xl text-purple-400">
                      <InfinityIcon className="h-5 w-5 sm:h-8 sm:w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-2xl text-purple-100">Endless Mode</CardTitle>
                  <CardDescription className="text-xs sm:text-base">
                    Practice your skills with unlimited random companies from the index.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-4 sm:pt-8 mt-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full h-10 sm:h-12 text-sm sm:text-base border-white/10 hover:bg-white/5 hover:text-white"
                    onClick={handlePlayEndless}
                    disabled={createGameMutation.isPending && createGameMutation.variables?.type === 'endless'}
                  >
                    {createGameMutation.isPending && createGameMutation.variables?.type === 'endless' ? (
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      "Play Endless"
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
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-4xl mt-8 sm:mt-10 lg:mt-12 px-2"
          >
            <Card className="bg-secondary/20 border-white/5 text-center p-3 sm:p-6 flex flex-col items-center justify-center">
              <Flame className="h-5 w-5 sm:h-8 sm:w-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-mono">{user.currentStreak}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Streak</div>
            </Card>
            <Card className="bg-secondary/20 border-white/5 text-center p-3 sm:p-6 flex flex-col items-center justify-center">
              <Trophy className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-mono">{user.totalWins}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Wins</div>
            </Card>
            <Card className="bg-secondary/20 border-white/5 text-center p-3 sm:p-6 flex flex-col items-center justify-center">
              <div className="text-lg sm:text-2xl text-blue-500 mx-auto mb-1 sm:mb-2 font-bold">%</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono">
                {user.totalPlayed > 0 ? Math.round((user.totalWins / user.totalPlayed) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Rate</div>
            </Card>
          </motion.div>
        )}
      </main>
      
      <footer className="w-full py-4 sm:py-6 border-t border-white/5 text-center text-xs sm:text-sm text-muted-foreground px-4">
        <p>© 2024 Marketle. Data provided for entertainment purposes only.</p>
      </footer>
    </div>
  );
}
