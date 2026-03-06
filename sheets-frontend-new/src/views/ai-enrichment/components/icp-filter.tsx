import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { X, ChevronDown, Search, Check, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (value === null || value === undefined) return [];
  if (typeof value === 'object') return [JSON.stringify(value)];
  return [String(value)];
};

const createFormFields = (icpData: Record<string, any>) => {
  return Object.entries(icpData).map(([key, value]) => {
    const label = key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    const arrayValue = ensureArray(value);
    return { key, label, options: arrayValue, value: arrayValue };
  });
};

interface IcpFilterField {
  key: string;
  label: string;
  options: string[];
  value: string[];
}

interface IcpFilterProps {
  data?: Record<string, any>;
  sectionId: string;
  onFilterCountChange: (sectionId: string, count: number) => void;
}

export interface IcpFilterHandle {
  getFilterData: () => Promise<Record<string, { id: string; label: string; value: string }[]>>;
}

export const IcpFilter = forwardRef<IcpFilterHandle, IcpFilterProps>(
  ({ data, sectionId, onFilterCountChange }, ref) => {
    const [fields, setFields] = useState<IcpFilterField[]>([]);
    const [selected, setSelected] = useState<Record<string, string[]>>({});
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const [searches, setSearches] = useState<Record<string, string>>({});

    useEffect(() => {
      if (!data) return;
      const formFields = createFormFields(data);
      setFields(formFields);
      const initial: Record<string, string[]> = {};
      formFields.forEach((f) => {
        initial[f.key] = [...f.value];
      });
      setSelected(initial);
    }, [data]);

    useEffect(() => {
      const total = Object.values(selected).reduce((sum, arr) => sum + arr.length, 0);
      onFilterCountChange(sectionId, total);
    }, [selected]);

    useImperativeHandle(ref, () => ({
      getFilterData: async () => {
        const result: Record<string, { id: string; label: string; value: string }[]> = {};
        for (const [key, values] of Object.entries(selected)) {
          result[key] = values.map((v) => ({ id: v, label: v, value: v }));
        }
        return result;
      },
    }));

    const handleRemove = (key: string, val: string) => {
      setSelected((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((v) => v !== val),
      }));
    };

    const handleToggle = (key: string, val: string) => {
      setSelected((prev) => {
        const curr = prev[key] || [];
        if (curr.includes(val)) {
          return { ...prev, [key]: curr.filter((v) => v !== val) };
        }
        return { ...prev, [key]: [...curr, val] };
      });
    };

    const handleAddCustom = (key: string, searchVal: string) => {
      if (!searchVal.trim()) return;
      const trimmed = searchVal.trim();
      setSelected((prev) => {
        const curr = prev[key] || [];
        if (curr.includes(trimmed)) return prev;
        return { ...prev, [key]: [...curr, trimmed] };
      });
      setSearches((prev) => ({ ...prev, [key]: '' }));
    };

    if (fields.length === 0) {
      return (
        <div className="py-4 text-center text-xs text-muted-foreground">
          No ICP data available
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {fields.map((field) => {
          const fieldSelected = selected[field.key] || [];
          const search = searches[field.key] || '';
          const filteredOpts = field.options.filter(
            (o) => o.toLowerCase().includes(search.toLowerCase()) && !fieldSelected.includes(o)
          );
          const canAdd =
            search.trim().length > 0 &&
            !field.options.some((o) => o.toLowerCase() === search.toLowerCase()) &&
            !fieldSelected.includes(search.trim());

          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-foreground">{field.label}</span>
              <Popover
                open={openPopover === field.key}
                onOpenChange={(open) => setOpenPopover(open ? field.key : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex min-h-[34px] w-full items-start justify-between rounded-xl border border-border bg-background px-3 py-1.5 text-left text-xs transition-all',
                      'hover:border-border/80 focus:outline-none',
                      openPopover === field.key && 'ring-2 ring-[#39A380]/30 border-[#39A380]/40'
                    )}
                  >
                    <div className="flex flex-1 flex-wrap gap-1">
                      {fieldSelected.length === 0 ? (
                        <span className="text-muted-foreground text-[11px]">Select or add...</span>
                      ) : (
                        fieldSelected.map((chip) => (
                          <span
                            key={chip}
                            className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-foreground"
                          >
                            {chip}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(field.key, chip);
                              }}
                              className="hover:text-destructive transition-colors"
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
                        openPopover === field.key && 'rotate-180'
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
                        setSearches((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && canAdd) {
                          handleAddCustom(field.key, search);
                        }
                      }}
                      placeholder="Search or type to add..."
                      className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto p-1.5">
                    {fieldSelected.map((chip) => (
                      <button
                        key={`sel-${chip}`}
                        type="button"
                        onClick={() => handleToggle(field.key, chip)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#39A380]">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </span>
                        <span className="flex-1 text-left">{chip}</span>
                      </button>
                    ))}
                    {filteredOpts.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggle(field.key, opt)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
                      >
                        <span className="h-4 w-4 shrink-0 rounded border border-border" />
                        <span className="flex-1 text-left">{opt}</span>
                      </button>
                    ))}
                    {filteredOpts.length === 0 && fieldSelected.length === 0 && !canAdd && (
                      <div className="px-3 py-3 text-center text-[11px] text-muted-foreground">
                        No options
                      </div>
                    )}
                    {canAdd && (
                      <button
                        type="button"
                        onClick={() => handleAddCustom(field.key, search)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#39A380] hover:bg-[#39A380]/10 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add "{search.trim()}"</span>
                      </button>
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

IcpFilter.displayName = 'IcpFilter';
