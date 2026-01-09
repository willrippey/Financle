import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    if (selectedSubIndustries.length > 0) gameFilters.subIndustries = selectedSubIndustries;
    gameFilters.filterMode = filterMode;
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

  const getMergedMarketCapRanges = (caps: string[]): string => {
    const sortedCaps = [...caps].sort((a, b) => {
      const indexA = MARKET_CAP_ORDER.indexOf(a);
      const indexB = MARKET_CAP_ORDER.indexOf(b);
      return indexA - indexB;
    });

    const ranges: string[] = [];
    let rangeStart: string | null = null;
    let rangeEnd: string | null = null;
    let prevIndex = -2;

    for (const cap of sortedCaps) {
      const currentIndex = MARKET_CAP_ORDER.indexOf(cap);
      
      if (prevIndex === -2 || currentIndex !== prevIndex + 1) {
        if (rangeStart !== null) {
          ranges.push(rangeStart === rangeEnd ? rangeStart! : formatMergedRange(rangeStart!, rangeEnd!));
        }
        rangeStart = cap;
        rangeEnd = cap;
      } else {
        rangeEnd = cap;
      }
      prevIndex = currentIndex;
    }
    
    if (rangeStart !== null) {
      ranges.push(rangeStart === rangeEnd ? rangeStart! : formatMergedRange(rangeStart!, rangeEnd!));
    }

    if (ranges.length === 1) {
      return `market cap ${ranges[0]}`;
    }
    return `market cap (${ranges.slice(0, 2).join(" or ")}${ranges.length > 2 ? ` +${ranges.length - 2} more` : ""})`;
  };

  const formatMergedRange = (start: string, end: string): string => {
    const getUpperBound = (cap: string): string => {
      if (cap === "$1T+") return "$1T+";
      if (cap === "$500B - $1T") return "$1T";
      if (cap === "$200B - $500B") return "$500B";
      if (cap === "$100B - $200B") return "$200B";
      if (cap === "$50B - $100B" || cap === "$50B - 100B") return "$100B";
      if (cap === "$20B - $50B") return "$50B";
      if (cap === "<$20B") return "$20B";
      return cap;
    };
    
    const getLowerBound = (cap: string): string => {
      if (cap === "$1T+") return "$1T";
      if (cap === "$500B - $1T") return "$500B";
      if (cap === "$200B - $500B") return "$200B";
      if (cap === "$100B - $200B") return "$100B";
      if (cap === "$50B - $100B" || cap === "$50B - 100B") return "$50B";
      if (cap === "$20B - $50B") return "$20B";
      if (cap === "<$20B") return "<$20B";
      return cap;
    };

    const lower = getLowerBound(end);
    const upper = getUpperBound(start);
    
    if (start === "$1T+" && end === "<$20B") return "all market caps";
    if (start === "$1T+") return `${upper}`;
    if (end === "<$20B") return `<${upper}`;
    return `${lower} - ${upper}`;
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
    
    if (selectedSubIndustries.length > 0) {
      if (selectedSubIndustries.length === 1) {
        parts.push(selectedSubIndustries[0]);
      } else {
        parts.push(`(${selectedSubIndustries.slice(0, 2).join(" or ")}${selectedSubIndustries.length > 2 ? ` +${selectedSubIndustries.length - 2} more` : ""})`);
      }
    }

    const connector = filterMode === 'and' ? ' AND ' : ' OR ';
    return `Your game will include companies with ${parts.join(connector)}.`;
  }, [selectedMarketCaps, selectedSectors, selectedSubIndustries, filterMode, hasSelections]);

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
