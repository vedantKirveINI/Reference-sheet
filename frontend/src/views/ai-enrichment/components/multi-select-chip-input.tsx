import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MultiSelectChipInputProps {
  label?: string;
  placeholder?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function MultiSelectChipInput({
  label,
  placeholder = 'Select or add...',
  options,
  value,
  onChange,
  disabled = false,
  className,
}: MultiSelectChipInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) && !value.includes(opt)
  );

  const searchMatchesExisting = options.some(
    (opt) => opt.toLowerCase() === search.toLowerCase()
  );
  const canAddCustom = search.trim().length > 0 && !searchMatchesExisting && !value.includes(search.trim());

  const handleToggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const handleRemove = (opt: string) => {
    onChange(value.filter((v) => v !== opt));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canAddCustom) {
      e.preventDefault();
      onChange([...value, search.trim()]);
      setSearch('');
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-xs font-semibold text-foreground">{label}</span>
      )}
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex min-h-[36px] w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-1.5 text-left text-xs transition-all',
              'hover:border-border/80 focus:outline-none focus:ring-2 focus:ring-[#39A380]/30',
              disabled && 'cursor-not-allowed opacity-50',
              open && 'ring-2 ring-[#39A380]/30 border-[#39A380]/40'
            )}
          >
            <div className="flex flex-1 flex-wrap gap-1 overflow-hidden">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                value.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {chip}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(chip);
                      }}
                      className="hover:text-destructive transition-colors ml-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <ChevronDown
              className={cn(
                'ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg rounded-xl border border-border"
          align="start"
          side="bottom"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or add new..."
              className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1.5">
            {value.map((chip) => (
              <button
                key={`selected-${chip}`}
                type="button"
                onClick={() => handleToggle(chip)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#39A380]">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
                <span className="flex-1 text-left">{chip}</span>
              </button>
            ))}
            {filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleToggle(opt)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
              >
                <span className="h-4 w-4 shrink-0 rounded border border-border" />
                <span className="flex-1 text-left">{opt}</span>
              </button>
            ))}
            {filteredOptions.length === 0 && value.length === 0 && !canAddCustom && (
              <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                No options found
              </div>
            )}
            {canAddCustom && (
              <button
                type="button"
                onClick={() => {
                  onChange([...value, search.trim()]);
                  setSearch('');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#39A380] hover:bg-[#39A380]/10 transition-colors"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#39A380] text-[#39A380]">
                  +
                </span>
                <span>Add "{search.trim()}"</span>
              </button>
            )}
          </div>
          {search && (
            <div className="border-t border-border px-3 py-1.5">
              <p className="text-[10px] text-muted-foreground">Press Enter to add custom option</p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
