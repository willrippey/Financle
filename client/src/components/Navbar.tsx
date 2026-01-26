import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BarChart2, LogOut, TrendingUp, User, HelpCircle } from "lucide-react";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { NewPlayerTooltip } from "@/components/NewPlayerTooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleHowToPlayClick = () => {
    localStorage.setItem('financle_seen_how_to_play', 'true');
    setShowHowToPlay(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">
            Financle
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/stats">
            <Button 
              variant="ghost" 
              size="sm" 
              className={location === "/stats" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              My Stats
            </Button>
          </Link>

          <div className="relative">
            <HowToPlayModal 
              open={showHowToPlay} 
              onOpenChange={setShowHowToPlay}
              trigger={
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-primary"
                  data-testid="button-how-to-play"
                  onClick={handleHowToPlayClick}
                >
                  <HelpCircle className="mr-1 h-4 w-4" />
                  How to Play
                </Button>
              }
            />
            <NewPlayerTooltip />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {(user.firstName || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-white/10" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || "Playing as guest"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => window.location.href = "/api/login"} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
              <User className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
