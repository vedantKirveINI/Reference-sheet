import { useState, forwardRef, useImperativeHandle } from 'react';
import { Country, State, City } from 'country-state-city';
import { X, ChevronDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type LocationField =
  | 'countriesInclude'
  | 'countriesExclude'
  | 'statesInclude'
  | 'statesExclude'
  | 'citiesInclude'
  | 'citiesExclude';

type LocationState = Record<LocationField, string[]>;

const FIELD_LABELS: Record<LocationField, string> = {
  countriesInclude: 'Countries Include',
  countriesExclude: 'Countries Exclude',
  statesInclude: 'States Include',
  statesExclude: 'States Exclude',
  citiesInclude: 'Cities Include',
  citiesExclude: 'Cities Exclude',
};

const FIELDS: LocationField[] = [
  'countriesInclude',
  'countriesExclude',
  'statesInclude',
  'statesExclude',
  'citiesInclude',
  'citiesExclude',
];

const getAllCountries = () =>
  Country.getAllCountries().map((c) => c.name).slice(0, 200);

const searchCountries = (q: string) =>
  Country.getAllCountries()
    .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    .map((c) => c.name)
    .slice(0, 50);

const searchStates = (q: string) =>
  State.getAllStates()
    .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
    .map((s) => `${s.name}, ${s.countryCode}`)
    .slice(0, 50);

const searchCities = (q: string) => {
  if (q.length < 2) return [];
  return City.getAllCities()
    .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    .map((c) => `${c.name}, ${c.countryCode}`)
    .slice(0, 50);
};

const getOptions = (field: LocationField, search: string): string[] => {
  if (field.startsWith('countries')) {
    if (search.length >= 2) return searchCountries(search);
    return getAllCountries().slice(0, 50);
  }
  if (field.startsWith('states')) {
    if (search.length >= 2) return searchStates(search);
    return [];
  }
  if (field.startsWith('cities')) {
    return searchCities(search);
  }
  return [];
};

interface LocationFilterProps {
  sectionId: string;
  onFilterCountChange: (sectionId: string, count: number) => void;
}

export interface LocationFilterHandle {
  getFilterData: () => Promise<LocationState>;
}

export const LocationFilter = forwardRef<LocationFilterHandle, LocationFilterProps>(
  ({ sectionId, onFilterCountChange }, ref) => {
    const [values, setValues] = useState<LocationState>({
      countriesInclude: [],
      countriesExclude: [],
      statesInclude: [],
      statesExclude: [],
      citiesInclude: [],
      citiesExclude: [],
    });
    const [openField, setOpenField] = useState<LocationField | null>(null);
    const [searches, setSearches] = useState<Record<string, string>>({});

    useImperativeHandle(ref, () => ({
      getFilterData: async () => values,
    }));

    const handleToggle = (field: LocationField, val: string) => {
      setValues((prev) => {
        const curr = prev[field];
        const next = curr.includes(val) ? curr.filter((v) => v !== val) : [...curr, val];
        const newValues = { ...prev, [field]: next };
        const total = Object.values(newValues).reduce((sum, arr) => sum + arr.length, 0);
        onFilterCountChange(sectionId, total);
        return newValues;
      });
    };

    const handleRemove = (field: LocationField, val: string) => {
      setValues((prev) => {
        const next = { ...prev, [field]: prev[field].filter((v) => v !== val) };
        const total = Object.values(next).reduce((sum, arr) => sum + arr.length, 0);
        onFilterCountChange(sectionId, total);
        return next;
      });
    };

    return (
      <div className="flex flex-col gap-3">
        {FIELDS.map((field) => {
          const selected = values[field];
          const search = searches[field] || '';
          const options = getOptions(field, search).filter((o) => !selected.includes(o));
          const isOpen = openField === field;
          const placeholder =
            field.startsWith('cities') && search.length < 2
              ? 'Type at least 2 chars to search...'
              : 'No options';

          return (
            <div key={field} className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-foreground">{FIELD_LABELS[field]}</span>
              <Popover open={isOpen} onOpenChange={(open) => setOpenField(open ? field : null)}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex min-h-[32px] w-full items-start justify-between rounded-xl border border-border bg-background px-3 py-1.5 text-left text-xs transition-all',
                      'hover:border-border/80',
                      isOpen && 'ring-2 ring-[#39A380]/30 border-[#39A380]/40'
                    )}
                  >
                    <div className="flex flex-1 flex-wrap gap-1">
                      {selected.length === 0 ? (
                        <span className="text-muted-foreground text-[11px]">Select...</span>
                      ) : (
                        selected.map((chip) => (
                          <span
                            key={chip}
                            className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium"
                          >
                            {chip}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(field, chip);
                              }}
                              className="hover:text-destructive"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        'ml-2 mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180'
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
                      value={search}
                      onChange={(e) =>
                        setSearches((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      placeholder="Search..."
                      className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto p-1.5">
                    {selected.map((chip) => (
                      <button
                        key={`sel-${chip}`}
                        type="button"
                        onClick={() => handleToggle(field, chip)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#39A380]">
                          <span className="text-[9px] text-white font-bold">✓</span>
                        </span>
                        <span className="flex-1 text-left">{chip}</span>
                      </button>
                    ))}
                    {options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggle(field, opt)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
                      >
                        <span className="h-4 w-4 shrink-0 rounded border border-border" />
                        <span className="flex-1 text-left">{opt}</span>
                      </button>
                    ))}
                    {options.length === 0 && selected.length === 0 && (
                      <div className="px-3 py-3 text-center text-[11px] text-muted-foreground">
                        {placeholder}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        })}
      </div>
    );
  }
);

LocationFilter.displayName = 'LocationFilter';
