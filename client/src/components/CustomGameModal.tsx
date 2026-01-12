import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGameFilters } from "@/hooks/use-games";
import { Loader2, DollarSign, Briefcase } from "lucide-react";
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
  "$20B - $50B",
  "<$20B",
];

type MarketCapRange = { label: string; min: number; max: number };

const MARKET_CAP_RANGES: MarketCapRange[] = [
  { label: "$1T+", min: 1000, max: Infinity },
  { label: "$500B - $1T", min: 500, max: 1000 },
  { label: "$200B - $500B", min: 200, max: 500 },
  { label: "$100B - $200B", min: 100, max: 200 },
  { label: "$50B - $100B", min: 50, max: 100 },
  { label: "$20B - $50B", min: 20, max: 50 },
  { label: "<$20B", min: 0, max: 20 },
];

const normalizeCapLabel = (label: string): string => {
  if (label === "$50B - 100B") return "$50B - $100B";
  return label;
};

export function CustomGameModal({ open, onOpenChange, onStartGame, isPending }: CustomGameModalProps) {
  const { data: filters, isLoading } = useGameFilters();
  const [selectedMarketCaps, setSelectedMarketCaps] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'and' | 'or'>('and');

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
    gameFilters.filterMode = filterMode;
    onStartGame(gameFilters);
  };

  const hasSelections = selectedMarketCaps.length > 0 || selectedSectors.length > 0;

  const sortedMarketCaps = filters?.marketCaps.sort((a, b) => {
    const indexA = MARKET_CAP_ORDER.indexOf(a);
    const indexB = MARKET_CAP_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }) || [];

  const formatBillions = (val: number): string => {
    if (val >= 1000) return `$${val / 1000}T`;
    return `$${val}B`;
  };

  const getMergedMarketCapRanges = (caps: string[]): string => {
    const normalizedCaps = caps.map(normalizeCapLabel);
    const selectedRanges = MARKET_CAP_RANGES.filter(r => normalizedCaps.includes(r.label));
    
    if (selectedRanges.length === 0) return "";
    
    selectedRanges.sort((a, b) => b.min - a.min);
    
    const mergedSpans: { min: number; max: number }[] = [];
    let currentSpan = { min: selectedRanges[0].min, max: selectedRanges[0].max };
    
    for (let i = 1; i < selectedRanges.length; i++) {
      const range = selectedRanges[i];
      if (range.max === currentSpan.min) {
        currentSpan.min = range.min;
      } else {
        mergedSpans.push(currentSpan);
        currentSpan = { min: range.min, max: range.max };
      }
    }
    mergedSpans.push(currentSpan);
    
    const formatSpan = (span: { min: number; max: number }): string => {
      const isTop = span.max === Infinity;
      const isBottom = span.min === 0;
      
      if (isTop && isBottom) return "all market caps";
      if (isTop) return `${formatBillions(span.min)}+`;
      if (isBottom) return `<${formatBillions(span.max)}`;
      return `${formatBillions(span.min)} - ${formatBillions(span.max)}`;
    };
    
    mergedSpans.reverse();
    const formattedRanges = mergedSpans.map(formatSpan);
    
    if (formattedRanges.length === 1) {
      return `market cap ${formattedRanges[0]}`;
    }
    return `market cap (${formattedRanges.slice(0, 2).join(" or ")}${formattedRanges.length > 2 ? ` +${formattedRanges.length - 2} more` : ""})`;
  };

  const filterSummary = useMemo(() => {
    if (!hasSelections) {
      return "Your game will include all S&P 500 companies.";
    }

    const parts: string[] = [];
    
    if (selectedMarketCaps.length > 0) {
      parts.push(getMergedMarketCapRanges(selectedMarketCaps));
    }
    
    if (selectedSectors.length > 0) {
      if (selectedSectors.length === 1) {
        parts.push(selectedSectors[0]);
      } else {
        parts.push(`(${selectedSectors.slice(0, 2).join(" or ")}${selectedSectors.length > 2 ? ` +${selectedSectors.length - 2} more` : ""})`);
      }
    }
    
    const connector = filterMode === 'and' ? ' AND ' : ' OR ';
    return `Your game will include companies with ${parts.join(connector)}.`;
  }, [selectedMarketCaps, selectedSectors, filterMode, hasSelections]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Custom Game
          </DialogTitle>
          <DialogDescription>
            Filter by market cap and sector. Leave all unchecked to include all companies.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2 px-1 border rounded-md bg-secondary/20">
              <Label htmlFor="filter-mode" className="text-sm font-medium px-2">
                Match filters with:
              </Label>
              <div className="flex items-center gap-2 px-2">
                <span className={`text-xs font-medium ${filterMode === 'and' ? 'text-primary' : 'text-muted-foreground'}`}>
                  AND
                </span>
                <Switch
                  id="filter-mode"
                  checked={filterMode === 'or'}
                  onCheckedChange={(checked) => setFilterMode(checked ? 'or' : 'and')}
                  data-testid="switch-filter-mode"
                />
                <span className={`text-xs font-medium ${filterMode === 'or' ? 'text-primary' : 'text-muted-foreground'}`}>
                  OR
                </span>
              </div>
            </div>

            <Tabs defaultValue="marketCap" className="flex-1 min-h-0">
              <TabsList className="grid w-full grid-cols-2 gap-1">
                <TabsTrigger value="marketCap" className="text-xs sm:text-sm" data-testid="tab-market-cap">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Market Cap
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

            </Tabs>

            <div className="mt-3 p-3 bg-secondary/30 rounded-md border border-white/5">
              <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-filter-summary">
                {filterSummary}
              </p>
            </div>
          </>
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
