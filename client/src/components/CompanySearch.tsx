import * as React from "react";
import { Check, Search } from "lucide-react";
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
  const debouncedQuery = useDebounce(searchQuery, 300);
  const internalRef = React.useRef<HTMLInputElement>(null);
  const ref = inputRef || internalRef;
  
  React.useImperativeHandle(searchRef, () => ({
    focusAndOpen: () => {
      setOpen(true);
      setTimeout(() => {
        ref.current?.focus();
      }, 0);
    }
  }));
  
  const { data: companies, isLoading } = useCompanySearch(debouncedQuery);
  
  // Filter out already guessed companies and sort alphabetically
  const filteredCompanies = companies?.filter(
    (company) => !guessedSymbols.includes(company.symbol)
  ).sort((a, b) => a.name.localeCompare(b.name)) || [];

  // Find exact match based on ticker or company name (excluding Inc./Plc)
  const normalizeCompanyName = (name: string) => {
    return name.replace(/\s+(Inc\.?|PLC|Plc)$/i, "").trim().toLowerCase();
  };
  
  const exactMatch = filteredCompanies.find(company => 
    company.symbol.toLowerCase() === debouncedQuery.toLowerCase() ||
    normalizeCompanyName(company.name) === normalizeCompanyName(debouncedQuery)
  );
  
  // Auto-select exact match when found
  React.useEffect(() => {
    if (exactMatch && debouncedQuery.length > 0) {
      setValue(exactMatch.symbol);
    }
  }, [exactMatch, debouncedQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none z-10" />
          <input
            ref={ref}
            placeholder="Search company or ticker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            disabled={disabled}
            className="h-12 w-full pl-10 pr-4 bg-secondary/50 border border-white/10 rounded-md focus:bg-secondary/70 focus:border-white/20 transition-all focus:outline-none focus:ring-0"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-white/10 shadow-2xl" align="start">
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
              {filteredCompanies.map((company) => (
                <CommandItem
                  key={company.symbol}
                  value={company.symbol}
                  onSelect={(currentValue) => {
                    setValue("");
                    onSelect(currentValue);
                    setOpen(false);
                    setSearchQuery(""); // Reset search after selection
                  }}
                  className="cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === company.symbol ? "opacity-100" : "opacity-0"
                    )}
                  />
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
