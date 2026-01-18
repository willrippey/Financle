import * as React from "react";
import { Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCompanySearch } from "@/hooks/use-games";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface CompanySearchProps {
  onSelect: (symbol: string) => void;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  guessedSymbols?: string[];
  searchRef?: React.RefObject<{ focusAndOpen: () => void }>;
}

export function CompanySearch({ onSelect, disabled, inputRef, guessedSymbols = [], searchRef }: CompanySearchProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const internalRef = React.useRef<HTMLInputElement>(null);
  const ref = inputRef || internalRef;
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  
  React.useImperativeHandle(searchRef, () => ({
    focusAndOpen: () => {
      setOpen(true);
      setTimeout(() => {
        ref.current?.focus();
      }, 0);
    }
  }));
  
  const { data: companies, isLoading } = useCompanySearch(debouncedQuery);

  const normalizeCompanyName = (name: string) => {
    return name.replace(/\s+(Inc\.?|PLC|Plc)$/i, "").trim().toLowerCase();
  };

  // Custom sorting and matching logic
  const filteredCompanies = React.useMemo(() => {
    if (!companies || !debouncedQuery) return [];

    const query = debouncedQuery.toLowerCase().trim();
    const queryNoPeriods = query.replace(/\./g, '');

    return companies
      .filter((company) => !guessedSymbols.includes(company.symbol))
      .map((company) => {
        const symbol = company.symbol.toLowerCase();
        const normalizedName = normalizeCompanyName(company.name);
        const nameNoPeriods = normalizedName.replace(/\./g, '');

        // Exact ticker match (only for 4+ chars)
        const isTickerMatch = symbol === query && query.length >= 4;

        // Name starts with query
        const startsWith = normalizedName.startsWith(query);

        // Query exists as a word in the name (or word starts with query)
        const words = normalizedName.split(/\s+/);
        let wordMatchIndex = -1;
        for (let i = 0; i < words.length; i++) {
          if (words[i] === query || words[i].startsWith(query)) {
            wordMatchIndex = i;
            break;
          }
        }
        const isWordMatch = wordMatchIndex !== -1;

        // Initials match (e.g., "jm" matches "j.m." in "J.M. Smucker")
        const initialsMatch = queryNoPeriods.length >= 2 && nameNoPeriods.includes(queryNoPeriods);

        // General inclusion
        const includes = normalizedName.includes(query);

        // Calculate relevance score
        let score = 0;
        if (isTickerMatch) score = 100;
        else if (startsWith) score = 90;
        else if (isWordMatch && wordMatchIndex === 0) score = 85; // First word match
        else if (isWordMatch) score = 70 - wordMatchIndex; // Later words are lower priority
        else if (initialsMatch && queryNoPeriods.length >= 2) score = 60; // Initials match
        else if (includes) score = 50;

        return { ...company, score };
      })
      .filter(c => c.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      });
  }, [companies, debouncedQuery, guessedSymbols]);

  const exactMatch = filteredCompanies.length > 0 && filteredCompanies[0].score >= 90 ? filteredCompanies[0] : undefined;

  // Auto-select exact match when found
  React.useEffect(() => {
    if (exactMatch && debouncedQuery.length > 0) {
      setValue(exactMatch.symbol);
    }
  }, [exactMatch, debouncedQuery]);

  // Reset selected index when query changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  // Scroll selected item into view
  React.useEffect(() => {
    requestAnimationFrame(() => {
      const item = itemRefs.current[selectedIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }, [selectedIndex]);

  // Clear refs when filtered companies change
  React.useEffect(() => {
    itemRefs.current = [];
  }, [filteredCompanies.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < filteredCompanies.length - 1 ? prev + 1 : prev
      );
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      setOpen(true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCompanies.length > 0 && selectedIndex < filteredCompanies.length) {
        const selected = filteredCompanies[selectedIndex];
        setValue("");
        onSelect(selected.symbol);
        setOpen(false);
        setSearchQuery("");
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none z-10" />
          <input
            ref={ref}
            placeholder="Search company or ticker..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setValue("");
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              "h-12 w-full pl-10 pr-4 bg-secondary/50 border rounded-md transition-all focus:outline-none focus:ring-0",
              exactMatch
                ? "border-primary/30 focus:bg-secondary/70 focus:border-primary/50"
                : "border-white/10 focus:bg-secondary/70 focus:border-white/20"
            )}
          />
          {exactMatch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 animate-in fade-in zoom-in duration-300">
                {exactMatch.name}
              </span>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-white/10 shadow-2xl z-[100]" 
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={16}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} className="bg-transparent">
          <CommandList className="max-h-[300px]">
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching market data...
              </div>
            )}
            
            {!isLoading && companies?.length === 0 && debouncedQuery.length > 0 && (
              <CommandEmpty>No company found.</CommandEmpty>
            )}

            <CommandGroup>
              {filteredCompanies.map((company, idx) => (
                <CommandItem
                  key={company.symbol}
                  value={company.symbol}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  onSelect={(currentValue) => {
                    setValue("");
                    onSelect(currentValue);
                    setOpen(false);
                    setSearchQuery(""); // Reset search after selection
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "cursor-pointer outline-none",
                    "data-[selected='true']:bg-transparent data-[highlighted='true']:bg-transparent",
                    "hover:bg-transparent focus:bg-transparent",
                    selectedIndex === idx
                      ? "bg-primary/20 text-primary !bg-primary/20 !text-primary"
                      : "text-foreground"
                  )}
                >
                  <span className="font-mono font-bold w-16">{company.symbol}</span>
                  <span className="truncate">{company.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
