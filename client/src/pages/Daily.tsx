import { useEffect } from "react";
import { useLocation } from "wouter";
import { useDailyGame } from "@/hooks/use-games";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Daily() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: dailyGame, isLoading: isDailyLoading, error } = useDailyGame(!!user);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      window.location.href = "/api/login";
      return;
    }
    
    if (dailyGame?.id) {
      setLocation(`/game/${dailyGame.id}`);
    }
  }, [isAuthLoading, user, dailyGame, setLocation]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load daily challenge</p>
          <button 
            onClick={() => setLocation("/")}
            className="text-primary underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading Daily Challenge...</p>
      </div>
    </div>
  );
}
