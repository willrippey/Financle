import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameFilters } from "@/hooks/use-games";
import { Loader2, Building2, DollarSign, Briefcase } from "lucide-react";
import type { CustomGameFilters } from "@shared/schema";

interface CustomGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartGame: (filters: CustomGameFilters) => void;
  isPending: boolean;
}

const MARKET_CAP_ORDER = [
  "$1T+",
  "$500B - $1T",
  "$200B - $500B",
  "$100B - $200B",
  "$50B - $100B",
  "$50B - 100B",
  "$20B - $50B",
  "<$20B",
];

export function CustomGameModal({ open, onOpenChange, onStartGame, isPending }: CustomGameModalProps) {
  const { data: filters, isLoading } = useGameFilters();
  const [selectedMarketCaps, setSelectedMarketCaps] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSubIndustries, setSelectedSubIndustries] = useState<string[]>([]);

  const handleToggle = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleStartGame = () => {
    const gameFilters: CustomGameFilters = {};
    if (selectedMarketCaps.length > 0) gameFilters.marketCaps = selectedMarketCaps;
    if (selectedSectors.length > 0) gameFilters.sectors = selectedSectors;
    if (selectedSubIndustries.length > 0) gameFilters.subIndustries = selectedSubIndustries;
    onStartGame(gameFilters);
  };

  const hasSelections = selectedMarketCaps.length > 0 || selectedSectors.length > 0 || selectedSubIndustries.length > 0;

  const sortedMarketCaps = filters?.marketCaps.sort((a, b) => {
    const indexA = MARKET_CAP_ORDER.indexOf(a);
    const indexB = MARKET_CAP_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Custom Game
          </DialogTitle>
          <DialogDescription>
            Filter companies by market cap, sector, or industry. Leave all unchecked to include all companies.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="marketCap" className="flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-3 gap-1">
              <TabsTrigger value="marketCap" className="text-xs sm:text-sm" data-testid="tab-market-cap">
                <DollarSign className="h-3 w-3 mr-1" />
                Cap
                {selectedMarketCaps.length > 0 && (
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 rounded-full">
                    {selectedMarketCaps.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sector" className="text-xs sm:text-sm" data-testid="tab-sector">
                <Briefcase className="h-3 w-3 mr-1" />
                Sector
                {selectedSectors.length > 0 && (
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 rounded-full">
                    {selectedSectors.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="subIndustry" className="text-xs sm:text-sm" data-testid="tab-sub-industry">
                <Building2 className="h-3 w-3 mr-1" />
                Industry
                {selectedSubIndustries.length > 0 && (
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 rounded-full">
                    {selectedSubIndustries.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="marketCap" className="mt-3">
              <ScrollArea className="h-[200px] border rounded-md p-3">
                <div className="space-y-2">
                  {sortedMarketCaps.map((cap) => (
                    <label
                      key={cap}
                      className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                      data-testid={`filter-market-cap-${cap}`}
                    >
                      <Checkbox
                        checked={selectedMarketCaps.includes(cap)}
                        onCheckedChange={() => handleToggle(cap, selectedMarketCaps, setSelectedMarketCaps)}
                      />
                      <span className="text-sm">{cap}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sector" className="mt-3">
              <ScrollArea className="h-[200px] border rounded-md p-3">
                <div className="space-y-2">
                  {filters?.sectors.map((sector) => (
                    <label
                      key={sector}
                      className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                      data-testid={`filter-sector-${sector}`}
                    >
                      <Checkbox
                        checked={selectedSectors.includes(sector)}
                        onCheckedChange={() => handleToggle(sector, selectedSectors, setSelectedSectors)}
                      />
                      <span className="text-sm">{sector}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="subIndustry" className="mt-3">
              <ScrollArea className="h-[200px] border rounded-md p-3">
                <div className="space-y-2">
                  {filters?.subIndustries.map((subIndustry) => (
                    <label
                      key={subIndustry}
                      className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                      data-testid={`filter-sub-industry-${subIndustry}`}
                    >
                      <Checkbox
                        checked={selectedSubIndustries.includes(subIndustry)}
                        onCheckedChange={() => handleToggle(subIndustry, selectedSubIndustries, setSelectedSubIndustries)}
                      />
                      <span className="text-sm">{subIndustry}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-custom-game">
            Cancel
          </Button>
          <Button onClick={handleStartGame} disabled={isPending} data-testid="button-start-custom-game">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasSelections ? (
              "Start Game"
            ) : (
              "Start (All Companies)"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
