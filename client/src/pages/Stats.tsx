import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Target, TrendingUp, TrendingDown, Flame, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

type GuessDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  X: number;
};

type StatsData = {
  daily: {
    totalPlayed: number;
    totalWins: number;
    winPercentage: number;
    avgGuesses: number;
    bestSector: string | null;
    worstSector: string | null;
    guessDistribution: GuessDistribution;
  };
  endless: {
    totalPlayed: number;
    totalWins: number;
    winPercentage: number;
    avgGuesses: number;
    bestSector: string | null;
    worstSector: string | null;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: GuessDistribution;
  };
};

function StatCard({ label, value, icon: Icon, iconColor }: { label: string; value: string | number; icon?: any; iconColor?: string }) {
  return (
    <div className="text-center p-3 bg-secondary/30 rounded-lg border border-white/5 flex flex-col items-center justify-center">
      {Icon && <Icon className={`h-4 w-4 mx-auto mb-1 ${iconColor || 'text-primary'}`} />}
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}

function GuessDistributionChart({ distribution }: { distribution: GuessDistribution }) {
  const maxCount = Math.max(...Object.values(distribution), 1);
  const labels = ['1', '2', '3', '4', '5', '6', 'X'];
  const barMaxHeight = 64;
  
  return (
    <div className="p-3 bg-secondary/30 rounded-lg border border-white/5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 text-center font-semibold">Guess Distribution</p>
      <div className="flex items-end justify-center gap-2">
        {labels.map((label) => {
          const count = distribution[label as keyof GuessDistribution];
          const barHeight = maxCount > 0 ? Math.round((count / maxCount) * barMaxHeight) : 0;
          const isLoss = label === 'X';
          return (
            <div key={label} className="flex flex-col items-center gap-1 flex-1 max-w-10">
              <span className="text-xs text-muted-foreground">{count}</span>
              <div 
                className={`w-full rounded-t transition-all duration-300 ${isLoss ? 'bg-destructive/80' : 'bg-primary/80'}`}
                style={{ height: `${Math.max(barHeight, count > 0 ? 4 : 2)}px` }}
              />
              <span className={`text-xs font-medium ${isLoss ? 'text-destructive' : 'text-foreground'}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsSection({ title, icon: Icon, stats, showStreak = false }: { 
  title: string; 
  icon: any; 
  stats: StatsData['daily'] | StatsData['endless']; 
  showStreak?: boolean 
}) {
  const endlessStats = stats as StatsData['endless'];
  const formattedAvgGuesses = stats.avgGuesses > 0 ? stats.avgGuesses.toFixed(2) : "—";
  
  return (
    <Card className="border-white/10 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 bg-primary/20 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Wins" value={stats.totalWins} icon={Trophy} iconColor="text-yellow-500" />
          <StatCard label="Played" value={stats.totalPlayed} icon={Target} />
          <StatCard label="Win %" value={`${stats.winPercentage}%`} />
          <StatCard label="Avg Guesses" value={formattedAvgGuesses} />
        </div>
        
        {showStreak && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Current Streak" value={endlessStats.currentStreak} icon={Flame} />
            <StatCard label="Best Streak" value={endlessStats.maxStreak} icon={Flame} />
          </div>
        )}
        
        <GuessDistributionChart distribution={stats.guessDistribution} />
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium uppercase">Best Sector</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {stats.bestSector || "Play more to see"}
            </p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-500 font-medium uppercase">Worst Sector</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {stats.worstSector || "Play more to see"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Stats() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-white/10 bg-card/50">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Login to View Stats</h2>
              <p className="text-muted-foreground mb-4">Track your progress and see how you perform across different sectors.</p>
              <Button onClick={() => window.location.href = "/api/login"}>
                Login
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-white/10 bg-card/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Unable to load stats. Please try again.</p>
              <Button variant="outline" className="mt-4" onClick={() => setLocation("/")}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-center mb-6">My Stats</h1>
        
        <StatsSection 
          title="Daily Challenge" 
          icon={Calendar} 
          stats={stats.daily} 
        />
        
        <div className="text-center pt-4">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
}
