import * as React from "react";
import { useCompanySearch } from "@/hooks/use-games";
import { cn } from "@/lib/utils";
import { MobileKeyboard } from "./MobileKeyboard";
import { Loader2 } from "lucide-react";

interface MobileCompanySearchProps {
  onSelect: (symbol: string) => void;
  disabled?: boolean;
  guessedSymbols?: string[];
  searchRef?: React.RefObject<{ focusAndOpen: () => void; clearSearch: () => void }>;
}

export function MobileCompanySearch({ onSelect, disabled, guessedSymbols = [], searchRef }: MobileCompanySearchProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  
  const { data: companies, isLoading } = useCompanySearch(searchQuery);

  React.useImperativeHandle(searchRef, () => ({
    focusAndOpen: () => {},
    clearSearch: () => setSearchQuery("")
  }));

  const normalizeCompanyName = (name: string) => {
    return name.replace(/\s+(Inc\.?|PLC|Plc)$/i, "").trim().toLowerCase();
  };

  const filteredCompanies = React.useMemo(() => {
    if (!companies || !searchQuery) return [];

    const query = searchQuery.toLowerCase().trim();
    const queryNoPeriods = query.replace(/\./g, '');

    return companies
      .filter((company) => !guessedSymbols.includes(company.symbol))
      .map((company) => {
        const symbol = company.symbol.toLowerCase();
        const normalizedName = normalizeCompanyName(company.name);
        const nameNoPeriods = normalizedName.replace(/\./g, '');

        const isTickerMatch = symbol === query && query.length >= 4;
        const startsWith = normalizedName.startsWith(query);

        const words = normalizedName.split(/\s+/);
        let wordMatchIndex = -1;
        for (let i = 0; i < words.length; i++) {
          if (words[i] === query || words[i].startsWith(query)) {
            wordMatchIndex = i;
            break;
          }
        }
        const isWordMatch = wordMatchIndex !== -1;

        const initialsMatch = queryNoPeriods.length >= 2 && nameNoPeriods.includes(queryNoPeriods);
        const includes = normalizedName.includes(query);

        let score = 0;
        if (isTickerMatch) score = 100;
        else if (startsWith) score = 90;
        else if (isWordMatch && wordMatchIndex === 0) score = 85;
        else if (isWordMatch) score = 70 - wordMatchIndex;
        else if (initialsMatch && queryNoPeriods.length >= 2) score = 60;
        else if (includes) score = 50;

        return { ...company, score };
      })
      .filter(c => c.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);
  }, [companies, searchQuery, guessedSymbols]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyPress = (key: string) => {
    if (!disabled) {
      setSearchQuery(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    if (!disabled) {
      setSearchQuery(prev => prev.slice(0, -1));
    }
  };

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setSearchQuery("");
    setSelectedIndex(0);
  };

  return (
    <div className="flex flex-col gap-2 w-full" data-testid="mobile-company-search">
      <div className="relative w-full">
        <div className={cn(
          "h-10 w-full px-3 bg-secondary/50 border rounded-md flex items-center",
          searchQuery.length > 0 ? "border-primary/30" : "border-white/10"
        )}>
          <span className={cn(
            "text-sm",
            searchQuery.length === 0 ? "text-muted-foreground" : "text-foreground"
          )}>
            {searchQuery.length === 0 ? "Type to search..." : searchQuery}
          </span>
          {searchQuery.length > 0 && <span className="animate-pulse ml-0.5 text-primary">|</span>}
        </div>
      </div>

      <div className="h-[120px] overflow-y-auto bg-card/50 rounded-md border border-white/10">
        {isLoading && searchQuery.length > 0 && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!isLoading && searchQuery.length === 0 && (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Start typing to find companies
          </div>
        )}

        {!isLoading && searchQuery.length > 0 && filteredCompanies.length === 0 && (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            No matching companies
          </div>
        )}

        {!isLoading && filteredCompanies.length > 0 && (
          <div className="divide-y divide-white/5">
            {filteredCompanies.map((company, idx) => (
              <button
                key={company.symbol}
                type="button"
                onClick={() => handleSelect(company.symbol)}
                onTouchStart={() => setSelectedIndex(idx)}
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 text-left flex items-center gap-2 transition-colors",
                  selectedIndex === idx ? "bg-primary/20" : "bg-transparent",
                  "active:bg-primary/30"
                )}
                data-testid={`company-option-${company.symbol}`}
              >
                <span className="font-mono font-bold text-xs w-12 flex-shrink-0">{company.symbol}</span>
                <span className="text-xs truncate">{company.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <MobileKeyboard 
        onKeyPress={handleKeyPress} 
        onBackspace={handleBackspace}
        disabled={disabled}
      />
    </div>
  );
}
