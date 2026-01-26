import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Target, Lightbulb, Trophy, SkipForward } from "lucide-react";

interface HowToPlayModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function HowToPlayModal({ open, onOpenChange, trigger }: HowToPlayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-primary" />
            How to Play
          </DialogTitle>
          <DialogDescription className="sr-only">
            Instructions on how to play Financle
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Guess the Company</h4>
              <p className="text-sm text-muted-foreground">
                Identify the S&P 500 company based on progressively revealed clues.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Clues Revealed Each Round</h4>
              <p className="text-sm text-muted-foreground">
                Each wrong guess or skip reveals a new clue: Sector, Market Cap, HQ, Founded Year, First Letter, and Description.
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
                You have 6 rounds to guess correctly. The fewer clues you need, the better your score!
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-muted-foreground text-center">
              Play the Daily Challenge or try Endless Mode for unlimited practice!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
