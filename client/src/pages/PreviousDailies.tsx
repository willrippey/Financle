import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, ArrowLeft, Check, X, Play } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

type PreviousDaily = {
  date: string;
  status: 'completed' | 'available' | 'locked';
  won?: boolean;
  guesses?: number;
  companyName?: string;
};

export default function PreviousDailies() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: previousDailies, isLoading } = useQuery<PreviousDaily[]>({
    queryKey: ['/api/previous-dailies'],
    refetchOnMount: 'always', // Always refetch when navigating to this page
    staleTime: 0, // Consider data always stale to ensure fresh results
  });

  const playPreviousMutation = useMutation({
    mutationFn: async (date: string) => {
      const res = await apiRequest("POST", "/api/games/previous-daily", { date });
      return res.json();
    },
    onSuccess: (game) => {
      queryClient.invalidateQueries({ queryKey: ['/api/previous-dailies'] });
      setLocation(`/game/${game.id}`);
    }
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00Z');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Previous Dailies</h1>
        </div>
        
        {!user && (
          <Card className="border-white/10 bg-card/50 mb-4">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-4">Login to play previous daily challenges and track your progress.</p>
              <Button onClick={() => window.location.href = "/api/login"}>
                Login
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="space-y-2">
          {previousDailies?.map((daily) => (
            <Card 
              key={daily.date} 
              className={`border-white/10 bg-card/50 ${daily.status === 'locked' ? 'opacity-50' : ''}`}
            >
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{formatDate(daily.date)}</p>
                    {daily.status === 'completed' && (
                      <p className="text-xs text-muted-foreground">
                        {daily.won ? (
                          <span className="text-green-500">Won in {daily.guesses} {daily.guesses === 1 ? 'guess' : 'guesses'}</span>
                        ) : (
                          <span className="text-red-500">Not solved</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {daily.status === 'completed' ? (
                    <>
                      {daily.companyName && (
                        <span className="text-xs sm:text-sm font-bold text-foreground text-right">
                          {daily.companyName}
                        </span>
                      )}
                      <div className={`p-2 rounded-full ${daily.won ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {daily.won ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </>
                  ) : daily.status === 'available' ? (
                    <Button 
                      size="sm"
                      onClick={() => playPreviousMutation.mutate(daily.date)}
                      disabled={playPreviousMutation.isPending}
                      data-testid={`button-play-${daily.date}`}
                    >
                      {playPreviousMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Play
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Coming soon</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {(!previousDailies || previousDailies.length === 0) && (
            <Card className="border-white/10 bg-card/50">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No previous daily challenges available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
