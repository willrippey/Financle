import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { HelpCircle, Target, Trophy, SkipForward, Gamepad2 } from "lucide-react";

interface HowToPlayModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function HowToPlayModal({ open, onOpenChange, trigger }: HowToPlayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md bg-card border-white/10 max-h-[85vh] overflow-y-auto top-[50%]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-primary" />
            How to Play
          </DialogTitle>
          <DialogDescription className="sr-only">
            Instructions on how to play Financle
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-1">
          <p className="text-sm text-muted-foreground">
            Financle (pronounced "Financial") is a Wordle-inspired game to test your market knowledge. Here's how it works:
          </p>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Guess the Company</h4>
              <p className="text-sm text-muted-foreground">
                Identify the S&P 500 company based on progressively revealed clues. Each wrong guess or skip reveals a new clue: Sector, Market Cap, HQ, Founded Year, First Letter, and Description.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <SkipForward className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Skip for More Clues</h4>
              <p className="text-sm text-muted-foreground">
                Not sure? Skip to reveal the next clue without making a wrong guess.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Win in 6 Rounds</h4>
              <p className="text-sm text-muted-foreground">
                You have 6 rounds to guess correctly. Show off your market knowledge by guessing correctly with fewer clues!
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Gamepad2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Different Game Modes</h4>
              <p className="text-sm text-muted-foreground">
                Play the Daily Challenge for a new puzzle every day. Practice anytime with Endless Mode featuring Easy and Hard difficulty, or create a Custom Game to focus on specific sectors or market caps!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
