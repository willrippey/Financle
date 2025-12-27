import * as React from "react";
import { Check, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCompanySearch } from "@/hooks/use-games";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface CompanySearchProps {
  onSelect: (symbol: string) => void;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  guessedSymbols?: string[];
}

export function CompanySearch({ onSelect, disabled, inputRef, guessedSymbols = [] }: CompanySearchProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const internalRef = React.useRef<HTMLInputElement>(null);
  const ref = inputRef || internalRef;
  
  const { data: companies, isLoading } = useCompanySearch(debouncedQuery);
  
  // Filter out already guessed companies
  const filteredCompanies = companies?.filter(
    (company) => !guessedSymbols.includes(company.symbol)
  ) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 text-base bg-secondary/50 border-white/10 hover:bg-secondary/70 hover:border-white/20 transition-all"
          disabled={disabled}
        >
          {value
            ? companies?.find((company) => company.symbol === value)?.name || value
            : "Search company or ticker..."}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-white/10 shadow-2xl" align="start">
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput 
            ref={ref}
            placeholder="Type company name..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-[300px]">
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching market data...
              </div>
            )}
            
            {!isLoading && companies?.length === 0 && debouncedQuery.length > 0 && (
              <CommandEmpty>No company found.</CommandEmpty>
            )}

            {!isLoading && debouncedQuery.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Start typing to search S&P 500 companies
              </div>
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
