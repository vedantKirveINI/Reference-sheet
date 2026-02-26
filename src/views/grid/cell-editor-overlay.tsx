import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellType, ICell, IColumn } from '@/types';
import { getFileUploadUrl, uploadFileToPresignedUrl, confirmFileUpload, updateLinkCell, searchForeignRecords, triggerButtonClick } from '@/services/api';
import type { ICurrencyData, IPhoneNumberData, IAddressData, IZipCodeData } from '@/types';
import { AddressEditor } from '@/components/editors/address-editor';
import { LinkEditor } from '@/components/editors/link-editor';
import { ButtonEditor } from '@/components/editors/button-editor';
import { ListFieldEditor } from '@/components/editors/list-field-editor';
import type { ILinkRecord, IButtonOptions } from '@/types/cell';
import { useGridViewStore } from '@/stores/grid-view-store';
import { COUNTRIES, getCountry, getAllCountryCodes, getFlagUrl } from '@/lib/countries';
import { getZipCodePlaceholder } from '@/lib/zipCodePatterns';

interface CellEditorOverlayProps {
  cell: ICell;
  column: IColumn;
  rect: { x: number; y: number; width: number; height: number };
  onCommit: (value: any) => void;
  onCancel: () => void;
  onCommitAndNavigate?: (value: any, direction: 'down' | 'up' | 'right' | 'left') => void;
  baseId?: string;
  tableId?: string;
  recordId?: string;
  zoomScale?: number;
  containerWidth?: number;
  containerHeight?: number;
  rowHeaderWidth?: number;
  headerHeight?: number;
  overlayRef?: React.RefObject<HTMLDivElement | null>;
  initialCharacter?: string;
}

type EditorProps = {
  cell: ICell;
  onCommit: (v: any) => void;
  onCancel: () => void;
  onCommitAndNavigate?: (value: any, direction: 'down' | 'up' | 'right' | 'left') => void;
  initialCharacter?: string;
};

function StringInput({ cell, onCommit, onCancel, onCommitAndNavigate, initialCharacter }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (initialCharacter) {
      ref.current.value = initialCharacter;
      ref.current.focus({ preventScroll: true });
    } else {
      ref.current.focus({ preventScroll: true });
      ref.current.select();
    }
  }, []);
  return (
    <input
      ref={ref}
      type="text"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-none rounded-none box-border"
      defaultValue={initialCharacter ?? ((cell.data as string) ?? '')}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = (e.target as HTMLInputElement).value;
          if (onCommitAndNavigate) {
            onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
          } else {
            onCommit(val);
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const val = (e.target as HTMLInputElement).value;
          if (onCommitAndNavigate) {
            onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
          } else {
            onCommit(val);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
    />
  );
}

function NumberInput({ cell, onCommit, onCancel, onCommitAndNavigate, initialCharacter }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (initialCharacter) {
      ref.current.value = initialCharacter;
      ref.current.focus({ preventScroll: true });
    } else {
      ref.current.focus({ preventScroll: true });
      ref.current.select();
    }
  }, []);
  const parseVal = (raw: string) => raw ? Number(raw) : null;
  return (
    <input
      ref={ref}
      type="number"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-none rounded-none text-right box-border"
      defaultValue={initialCharacter ?? ((cell.data as number) ?? '')}
      onBlur={(e) => onCommit(parseVal(e.target.value))}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = parseVal((e.target as HTMLInputElement).value);
          if (onCommitAndNavigate) {
            onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
          } else {
            onCommit(val);
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const val = parseVal((e.target as HTMLInputElement).value);
          if (onCommitAndNavigate) {
            onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
          } else {
            onCommit(val);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
    />
  );
}

function SelectEditor({ cell, onCommit, onCancel }: EditorProps) {
  const { t } = useTranslation(['common']);
  const [search, setSearch] = useState('');
  const options: string[] = (cell as any).options?.options ?? [];
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const currentVal = cell.data as string | null;
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus({ preventScroll: true }); }, []);

  return (
    <div className="bg-popover text-popover-foreground border-2 border-[#39A380] rounded shadow-lg min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="p-1.5 border-b border-border">
        <input ref={searchRef} type="text" placeholder={t('fieldModal.searchOptions')} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
      </div>
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => onCommit(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              currentVal === option ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-accent'
            }`}>
            <span className="inline-flex items-center gap-2">
              {currentVal === option && <span className="text-emerald-500">✓</span>}
              {option}
            </span>
          </button>
        ))}
      </div>
      {currentVal && (
        <div className="p-1.5 border-t border-border">
          <button onClick={() => onCommit(null)} className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Clear selection</button>
        </div>
      )}
    </div>
  );
}

function MultiSelectEditor({ cell, onCommit, onCancel }: EditorProps) {
  const { t } = useTranslation(['common']);
  const [search, setSearch] = useState('');
  const options: string[] = (cell as any).options?.options ?? [];
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const currentVals: string[] = Array.isArray(cell.data) ? (cell.data as any[]).map(String) : [];
  const [selected, setSelected] = useState<string[]>(currentVals);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<string[]>(currentVals);
  useEffect(() => { searchRef.current?.focus({ preventScroll: true }); }, []);

  const toggle = (option: string) => {
    setSelected(prev => {
      const next = prev.includes(option) ? prev.filter(v => v !== option) : [...prev, option];
      selectedRef.current = next;
      return next;
    });
  };

  const addNewTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    setSelected(prev => {
      const next = [...prev, trimmed];
      selectedRef.current = next;
      return next;
    });
    setSearch('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      e.preventDefault();
      const exactMatch = options.find(o => o.toLowerCase() === search.trim().toLowerCase());
      if (exactMatch) {
        toggle(exactMatch);
      } else {
        addNewTag(search);
      }
      setSearch('');
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      onCommit(selectedRef.current);
    }, 200);
  };

  const showCreateOption = search.trim() && !options.some(o => o.toLowerCase() === search.trim().toLowerCase());

  return (
    <div ref={containerRef} className="bg-popover text-popover-foreground border-2 border-[#39A380] rounded shadow-lg min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }} onBlur={handleBlur}>
      <div className="p-1.5 border-b border-border">
        <input ref={searchRef} type="text" placeholder={t('fieldModal.searchOrCreateTag')} value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
      </div>
      {selected.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b border-border">
          {selected.map(v => (
            <span key={v} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs">
              {v}
              <button onClick={() => toggle(v)} className="hover:text-emerald-900">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {showCreateOption && (
          <button onClick={() => addNewTag(search)} className="w-full text-left px-2 py-1.5 text-sm rounded transition-colors hover:bg-accent text-emerald-600 font-medium">
            + Create "{search.trim()}"
          </button>
        )}
        {filtered.length === 0 && !showCreateOption && <div className="px-2 py-1.5 text-xs text-muted-foreground">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => toggle(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              selected.includes(option) ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-accent'
            }`}>
            <span className="inline-flex items-center gap-2">
              <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${
                selected.includes(option) ? 'bg-emerald-500 border-[#39A380] text-white' : 'border-muted-foreground/30'
              }`}>{selected.includes(option) ? '✓' : ''}</span>
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

type DropDownOption = string | { id: string | number; label: string };

const DD_CHIP_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300',
];

function ddGetLabel(opt: DropDownOption): string {
  return typeof opt === 'string' ? opt : (opt.label || '');
}

function ddIsSelected(opt: DropDownOption, selected: DropDownOption[]): boolean {
  const label = ddGetLabel(opt);
  return selected.some(s => ddGetLabel(s) === label);
}

function ddRemoveOption(opt: DropDownOption, selected: DropDownOption[]): DropDownOption[] {
  const label = ddGetLabel(opt);
  return selected.filter(s => ddGetLabel(s) !== label);
}

function DropDownEditor({ cell, onCommit, onCancel }: EditorProps) {
  const rawOptions: any[] = (cell as any).options?.options ?? [];
  const options: DropDownOption[] = rawOptions.map((o: any, i: number) => {
    if (typeof o === 'string') return o;
    if (typeof o === 'object' && o !== null) return { id: o.id ?? o.label ?? String(i), label: o.label || o.name || '' };
    return String(o);
  });

  const rawData: any[] = Array.isArray((cell as any).data) ? (cell as any).data : [];
  const validatedInitial = useMemo(() => {
    const parsed = rawData.map((item: any) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null && 'label' in item) return item as DropDownOption;
      return String(item);
    });
    if (options.length > 0) {
      const optLabels = new Set(options.map(ddGetLabel));
      const valid = parsed.filter(p => optLabels.has(ddGetLabel(p)));
      return valid.map(v => {
        const display = ddGetLabel(v);
        return options.find(o => ddGetLabel(o) === display) ?? v;
      });
    }
    return parsed;
  }, []);

  const [currentOptions, setCurrentOptions] = useState<DropDownOption[]>(validatedInitial);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [showOptionList, setShowOptionList] = useState(true);
  const [showExpanded, setShowExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus({ preventScroll: true }); }, [showOptionList]);

  const handleSelectOption = useCallback((updated: DropDownOption[]) => {
    setHasUserEdited(true);
    setCurrentOptions(updated);
  }, []);

  const toggleOption = useCallback((opt: DropDownOption) => {
    setCurrentOptions(prev => {
      const next = ddIsSelected(opt, prev) ? ddRemoveOption(opt, prev) : [...prev, opt];
      setHasUserEdited(true);
      return next;
    });
  }, []);

  const commitValue = useCallback(() => {
    if (hasUserEdited) {
      onCommit(currentOptions.map(o => typeof o === 'string' ? { id: o, label: o } : { id: String(o.id), label: o.label }));
    } else {
      onCancel();
    }
  }, [hasUserEdited, currentOptions, onCommit, onCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showOptionList && !showExpanded) {
      e.preventDefault();
      e.stopPropagation();
      commitValue();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      commitValue();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  }, [showOptionList, showExpanded, commitValue, onCancel]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      if (document.querySelector('[data-dropdown-option-list]')?.contains(active)) return;
      commitValue();
    }, 100);
  }, [commitValue]);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(o => ddGetLabel(o).toLowerCase().includes(q));
  }, [options, search]);

  const optionListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = optionListRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight) { e.preventDefault(); return; }
      if ((scrollTop === 0 && e.deltaY < 0) || (scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0)) e.preventDefault();
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [showOptionList]);

  return (
    <div
      ref={containerRef}
      className="bg-popover text-popover-foreground rounded-md shadow-lg overflow-visible"
      style={{ border: '2px solid #39A380' }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      <div className="flex items-center gap-1 px-2 py-1.5 min-h-[32px] flex-wrap">
        {currentOptions.length === 0 ? (
          <span className="text-xs text-muted-foreground">Select options...</span>
        ) : (
          currentOptions.map((opt, idx) => {
            const label = ddGetLabel(opt);
            const colorClass = DD_CHIP_COLORS[idx % DD_CHIP_COLORS.length];
            return (
              <span key={`${label}_${idx}`} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                {label}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleSelectOption(ddRemoveOption(opt, currentOptions)); }}
                  className="ml-0.5 hover:opacity-70 leading-none"
                >×</button>
              </span>
            );
          })
        )}

        {(currentOptions.length > 0 || showExpanded) && (
          <button
            type="button"
            className="ml-auto shrink-0 p-0.5 text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (showExpanded) { setShowExpanded(false); setShowOptionList(true); }
              else { setShowExpanded(true); setShowOptionList(false); }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        )}
      </div>

      {showOptionList && (
        <div data-dropdown-option-list className="border-t border-border">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border">
            <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              className="flex-1 text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Find your option"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            {search && (
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setSearch(''); searchRef.current?.focus(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
          <div ref={optionListRef} className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-2 py-2 text-xs text-muted-foreground text-center">No options found</div>
            ) : filtered.map((opt, idx) => {
              const label = ddGetLabel(opt);
              const isSelected = ddIsSelected(opt, currentOptions);
              return (
                <div
                  key={`${label}_${idx}`}
                  className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${isSelected ? 'bg-accent/60' : 'hover:bg-accent/40'}`}
                  onClick={(e) => { e.stopPropagation(); toggleOption(opt); }}
                >
                  <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs shrink-0 ${isSelected ? 'bg-[#39A380] border-[#39A380] text-white' : 'border-muted-foreground/40'}`}>
                    {isSelected ? '✓' : ''}
                  </span>
                  <span className="truncate">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showExpanded && (
        <div className="border-t border-border" data-dropdown-option-list>
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-sm font-medium text-foreground">Dropdown Options</span>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => { setShowExpanded(false); setShowOptionList(true); }}
            >×</button>
          </div>
          <div className="px-3 py-2 flex flex-wrap gap-1.5 min-h-[40px]">
            {currentOptions.length === 0 ? (
              <span className="text-xs text-muted-foreground">Please select an option</span>
            ) : currentOptions.map((opt, idx) => {
              const label = ddGetLabel(opt);
              const colorClass = DD_CHIP_COLORS[idx % DD_CHIP_COLORS.length];
              return (
                <span key={`${label}_${idx}`} className={`inline-flex items-center gap-0.5 px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                  {label}
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleSelectOption(ddRemoveOption(opt, currentOptions)); }} className="ml-0.5 hover:opacity-70">×</button>
                </span>
              );
            })}
          </div>
          <div className="px-3 py-2 border-t border-border">
            <button
              type="button"
              className="w-full py-1.5 text-xs font-medium text-[#39A380] hover:bg-accent/40 rounded transition-colors uppercase tracking-wide"
              onClick={() => { setShowExpanded(false); setShowOptionList(true); }}
            >Select an option</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DateTimeInput({ cell, onCommit, onCancel, onCommitAndNavigate }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);

  const currentValue = cell.data as string ?? '';
  const dateValue = currentValue ? new Date(currentValue).toISOString().slice(0, 16) : '';

  return (
    <input
      ref={ref}
      type="datetime-local"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-none rounded-none box-border"
      defaultValue={dateValue}
      onBlur={(e) => onCommit(e.target.value || null)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = (e.target as HTMLInputElement).value || null;
          if (onCommitAndNavigate) {
            onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
          } else {
            onCommit(val);
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const val = (e.target as HTMLInputElement).value || null;
          if (onCommitAndNavigate) {
            onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
          } else {
            onCommit(val);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
    />
  );
}

function TimeInput({ cell, onCommit, onCancel, onCommitAndNavigate }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return (
    <input
      ref={ref}
      type="time"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-none rounded-none box-border"
      defaultValue={(cell.data as string) ?? ''}
      onBlur={(e) => onCommit(e.target.value || null)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = (e.target as HTMLInputElement).value || null;
          if (onCommitAndNavigate) {
            onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
          } else {
            onCommit(val);
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const val = (e.target as HTMLInputElement).value || null;
          if (onCommitAndNavigate) {
            onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
          } else {
            onCommit(val);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
    />
  );
}

function CurrencyInput({ cell, onCommit, onCancel, onCommitAndNavigate }: EditorProps) {
  const existing = (cell as any).data as ICurrencyData | null;
  const containerRef = useRef<HTMLDivElement>(null);
  const currencyInputRef = useRef<HTMLInputElement>(null);
  const countryInputRef = useRef<HTMLDivElement>(null);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const selectedCountryRef = useRef<HTMLDivElement>(null);

  const [currentValue, setCurrentValue] = useState({
    countryCode: existing?.countryCode || 'US',
    currencyCode: existing?.currencyCode || 'USD',
    currencySymbol: existing?.currencySymbol || '$',
    currencyValue: existing?.currencyValue ?? '',
  });
  const [popover, setPopover] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allCodes = getAllCountryCodes();
    if (!query) return allCodes;
    return allCodes.filter(code => {
      const country = COUNTRIES[code];
      if (!country) return false;
      return (
        country.countryName.toLowerCase().includes(query) ||
        country.countryCode.toLowerCase().includes(query) ||
        (country.currencyCode?.toLowerCase() ?? '').includes(query) ||
        (country.currencySymbol?.toLowerCase() ?? '').includes(query)
      );
    });
  }, [search]);

  const country = currentValue.countryCode ? getCountry(currentValue.countryCode) : undefined;

  useEffect(() => {
    if (popover) {
      searchFieldRef.current?.focus();
      selectedCountryRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else {
      currencyInputRef.current?.focus();
      currencyInputRef.current?.select();
    }
  }, [popover]);

  useEffect(() => {
    currencyInputRef.current?.focus();
    currencyInputRef.current?.select();
  }, []);

  const buildCommitValue = useCallback(() => {
    if (currentValue.currencyValue || currentValue.currencyCode || currentValue.currencySymbol) {
      return currentValue;
    }
    return null;
  }, [currentValue]);

  const commitValue = useCallback(() => {
    onCommit(buildCommitValue());
  }, [buildCommitValue, onCommit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !popover) {
      e.preventDefault();
      e.stopPropagation();
      const val = buildCommitValue();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
      } else {
        onCommit(val);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      const val = buildCommitValue();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
      } else {
        onCommit(val);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (popover) {
        setPopover(false);
      } else {
        onCancel();
      }
    }
  }, [popover, buildCommitValue, onCommit, onCommitAndNavigate, onCancel]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      commitValue();
    }, 100);
  }, [commitValue]);

  const handleCountryClick = useCallback((countryCode: string) => {
    const c = getCountry(countryCode);
    if (!c) return;
    setCurrentValue(prev => ({
      ...prev,
      countryCode: c.countryCode,
      currencyCode: c.currencyCode || prev.currencyCode,
      currencySymbol: c.currencySymbol || prev.currencySymbol,
    }));
    setPopover(false);
    setSearch('');
  }, []);

  const handleCurrencyValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^\d.]/g, '');
    setCurrentValue(prev => ({ ...prev, currencyValue: sanitized }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-center bg-background box-border overflow-visible"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      <div className="flex items-center flex-1 min-h-0 overflow-hidden w-full">
        <div
          ref={countryInputRef}
          className="flex items-center gap-1 cursor-pointer px-1.5 py-1 rounded transition-colors hover:bg-accent/50 overflow-hidden"
          style={{ maxWidth: '30%' }}
          onClick={() => setPopover(prev => !prev)}
        >
          {country && (
            <img
              className="w-4 h-[12px] object-cover rounded-sm shrink-0"
              src={getFlagUrl(country.countryCode)}
              alt={country.countryName}
              loading="lazy"
            />
          )}
          {currentValue.currencyCode && (
            <span className="text-xs font-medium text-foreground whitespace-nowrap">{currentValue.currencyCode}</span>
          )}
          {currentValue.currencySymbol && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">{currentValue.currencySymbol}</span>
          )}
          <svg className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${popover ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div className="w-px h-5 bg-border shrink-0" />

        <input
          ref={currencyInputRef}
          className="flex-1 bg-transparent text-foreground text-sm outline-none min-w-0 px-2"
          type="text"
          placeholder="0"
          value={currentValue.currencyValue}
          onChange={handleCurrencyValueChange}
          onFocus={() => { if (popover) setPopover(false); }}
        />
      </div>

      {popover && (
        <div
          className="absolute left-0 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-[1001]"
          style={{ top: '100%', marginTop: 4, width: '100%', minWidth: 250, maxWidth: 400 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-1.5 px-2 py-1 border border-border rounded bg-background">
              <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchFieldRef}
                type="text"
                className="flex-1 text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search by country or currency"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => { setSearch(''); searchFieldRef.current?.focus(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">No options found</div>
            ) : filteredCountries.map(code => {
              const c = getCountry(code);
              if (!c) return null;
              const isSelected = code === currentValue.countryCode;
              return (
                <div
                  key={code}
                  ref={isSelected ? selectedCountryRef : null}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  onClick={() => handleCountryClick(code)}
                >
                  <img className="w-5 h-[15px] object-cover rounded-sm shrink-0" src={getFlagUrl(c.countryCode)} alt={c.countryName} loading="lazy" />
                  {c.currencyCode && <span className="text-xs text-muted-foreground">({c.currencyCode})</span>}
                  <span className="text-sm text-foreground truncate">{c.countryName}</span>
                  {c.currencySymbol && <span className="text-xs text-muted-foreground ml-auto shrink-0">{c.currencySymbol}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RatingInput({ cell, onCommit, onCancel }: EditorProps) {
  const maxRating = ('options' in cell && cell.options && 'maxRating' in (cell.options as any))
    ? ((cell.options as any).maxRating ?? 5) : 5;
  const current = typeof cell.data === 'number' ? cell.data : 0;

  return (
    <div
      className="bg-popover text-popover-foreground border-2 border-[#39A380] flex items-center gap-1 px-2 py-1"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          onClick={() => onCommit(current === i + 1 ? 0 : i + 1)}
          className="text-lg hover:scale-110 transition-transform"
        >
          {i < current ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

function SliderInput({ cell, onCommit, onCancel, onCommitAndNavigate }: EditorProps) {
  const sliderCell = cell as any;
  const minValue = sliderCell.options?.minValue ?? 0;
  const maxValue = sliderCell.options?.maxValue ?? 10;
  const initialVal = typeof cell.data === 'number' ? cell.data : minValue;
  const [value, setValue] = useState(initialVal);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleSave = useCallback(() => {
    onCommit(value);
  }, [value, onCommit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(value, e.shiftKey ? 'up' : 'down');
      } else {
        handleSave();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(value, e.shiftKey ? 'left' : 'right');
      } else {
        handleSave();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  }, [handleSave, onCancel, onCommitAndNavigate, value]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      handleSave();
    }, 0);
  }, [handleSave]);

  return (
    <div
      ref={containerRef}
      className="bg-background border-2 border-[#39A380] flex items-center gap-2 px-2 h-full w-full"
      style={{ boxSizing: 'border-box' }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      <input
        type="range"
        min={minValue}
        max={maxValue}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="flex-1 h-1.5 accent-emerald-500"
        style={{ minWidth: 0 }}
      />
      <span className="text-xs text-muted-foreground tabular-nums shrink-0 select-none">{value}/{maxValue}</span>
    </div>
  );
}

function PhoneNumberInput({ cell, onCommit, onCancel, onCommitAndNavigate }: EditorProps) {
  const existing = (cell as any).data as IPhoneNumberData | null;
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const selectedCountryRef = useRef<HTMLDivElement>(null);

  const [currentValue, setCurrentValue] = useState({
    countryCode: existing?.countryCode || 'US',
    countryNumber: existing?.countryNumber || '1',
    phoneNumber: existing?.phoneNumber || '',
  });
  const [popover, setPopover] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allCodes = getAllCountryCodes();
    if (!query) return allCodes;
    return allCodes.filter(code => {
      const c = COUNTRIES[code];
      if (!c) return false;
      return (
        c.countryName.toLowerCase().includes(query) ||
        c.countryCode.toLowerCase().includes(query) ||
        c.countryNumber.includes(query)
      );
    });
  }, [search]);

  const country = currentValue.countryCode ? getCountry(currentValue.countryCode) : undefined;

  useEffect(() => {
    if (popover) {
      searchFieldRef.current?.focus();
      selectedCountryRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else {
      phoneInputRef.current?.focus();
    }
  }, [popover]);

  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  const buildCommitValue = useCallback(() => {
    const val = currentValue.phoneNumber.trim();
    if (!val) return null;
    return { countryCode: currentValue.countryCode, countryNumber: currentValue.countryNumber, phoneNumber: val };
  }, [currentValue]);

  const commitValue = useCallback(() => {
    onCommit(buildCommitValue());
  }, [buildCommitValue, onCommit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !popover) {
      e.preventDefault();
      e.stopPropagation();
      const val = buildCommitValue();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
      } else {
        onCommit(val);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      const val = buildCommitValue();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
      } else {
        onCommit(val);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (popover) {
        setPopover(false);
      } else {
        onCancel();
      }
    }
  }, [popover, buildCommitValue, onCommit, onCommitAndNavigate, onCancel]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      commitValue();
    }, 100);
  }, [commitValue]);

  const handleCountryClick = useCallback((code: string) => {
    const c = getCountry(code);
    if (!c) return;
    setCurrentValue(prev => ({
      ...prev,
      countryCode: c.countryCode,
      countryNumber: c.countryNumber,
    }));
    setPopover(false);
    setSearch('');
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-center bg-background box-border overflow-visible"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      <div className="flex items-center flex-1 min-h-0 overflow-hidden w-full">
        <div
          className="flex items-center gap-1 cursor-pointer px-1.5 py-1 rounded transition-colors hover:bg-accent/50 overflow-hidden"
          style={{ maxWidth: '30%' }}
          onClick={() => setPopover(prev => !prev)}
        >
          {country && (
            <img
              className="w-4 h-[12px] object-cover rounded-sm shrink-0"
              src={getFlagUrl(country.countryCode)}
              alt={country.countryName}
              loading="lazy"
            />
          )}
          <span className="text-xs font-medium text-foreground whitespace-nowrap">+{currentValue.countryNumber}</span>
          <svg className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${popover ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div className="w-px h-5 bg-border shrink-0" />

        <input
          ref={phoneInputRef}
          className="flex-1 bg-transparent text-foreground text-sm outline-none min-w-0 px-2"
          type="tel"
          placeholder="Phone number"
          value={currentValue.phoneNumber}
          onChange={e => setCurrentValue(prev => ({ ...prev, phoneNumber: e.target.value.replace(/[^0-9\s\-()]/g, '') }))}
          onFocus={() => { if (popover) setPopover(false); }}
        />
      </div>

      {popover && (
        <div
          className="absolute left-0 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-[1001]"
          style={{ top: '100%', marginTop: 4, width: '100%', minWidth: 250, maxWidth: 400 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-1.5 px-2 py-1 border border-border rounded bg-background">
              <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchFieldRef}
                type="text"
                className="flex-1 text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search country or code"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => { setSearch(''); searchFieldRef.current?.focus(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">No countries found</div>
            ) : filteredCountries.map(code => {
              const c = getCountry(code);
              if (!c) return null;
              const isSelected = code === currentValue.countryCode;
              return (
                <div
                  key={code}
                  ref={isSelected ? selectedCountryRef : null}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  onClick={() => handleCountryClick(code)}
                >
                  <img className="w-5 h-[15px] object-cover rounded-sm shrink-0" src={getFlagUrl(c.countryCode)} alt={c.countryName} loading="lazy" />
                  <span className="text-sm text-foreground truncate">{c.countryName}</span>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">+{c.countryNumber}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AddressInput({ cell, onCommit, onCancel }: EditorProps) {
  const existing = (cell as any).data as IAddressData | null;
  const [dialogOpen, setDialogOpen] = useState(true);

  const handleChange = (val: IAddressData | null) => {
    onCommit(val);
  };

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
  };

  return (
    <AddressEditor
      value={existing}
      onChange={handleChange}
      onClose={handleClose}
      triggerMode="auto"
      open={dialogOpen}
    />
  );
}

function sanitizeZipCode(val: string): string {
  return val.replace(/[^A-Za-z0-9\s-]/g, '');
}

function ZipCodeInput({ cell, onCommit, onCancel, onCommitAndNavigate }: EditorProps) {
  const existing = (cell as any).data as IZipCodeData | null;
  const containerRef = useRef<HTMLDivElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const selectedCountryRef = useRef<HTMLDivElement>(null);

  const [currentValue, setCurrentValue] = useState({
    countryCode: existing?.countryCode || 'US',
    zipCode: existing?.zipCode || '',
  });
  const [popover, setPopover] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allCodes = getAllCountryCodes();
    if (!query) return allCodes;
    return allCodes.filter(code => {
      const c = COUNTRIES[code];
      if (!c) return false;
      return (
        c.countryName.toLowerCase().includes(query) ||
        c.countryCode.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const country = currentValue.countryCode ? getCountry(currentValue.countryCode) : undefined;

  useEffect(() => {
    if (popover) {
      searchFieldRef.current?.focus();
      selectedCountryRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else {
      zipInputRef.current?.focus();
    }
  }, [popover]);

  useEffect(() => {
    zipInputRef.current?.focus();
  }, []);

  const buildCommitValue = useCallback(() => {
    const val = currentValue.zipCode.trim();
    if (!val) return null;
    return { countryCode: currentValue.countryCode, zipCode: val };
  }, [currentValue]);

  const commitValue = useCallback(() => {
    onCommit(buildCommitValue());
  }, [buildCommitValue, onCommit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !popover) {
      e.preventDefault();
      e.stopPropagation();
      const val = buildCommitValue();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
      } else {
        onCommit(val);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      const val = buildCommitValue();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
      } else {
        onCommit(val);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (popover) {
        setPopover(false);
      } else {
        onCancel();
      }
    }
  }, [popover, buildCommitValue, onCommit, onCommitAndNavigate, onCancel]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      commitValue();
    }, 100);
  }, [commitValue]);

  const handleCountryClick = useCallback((code: string) => {
    const c = getCountry(code);
    if (!c) return;
    setCurrentValue(prev => ({ ...prev, countryCode: c.countryCode }));
    setPopover(false);
    setSearch('');
  }, []);

  const placeholder = getZipCodePlaceholder(currentValue.countryCode) || 'Zip code';

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-center bg-background box-border overflow-visible"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      <div className="flex items-center flex-1 min-h-0 overflow-hidden w-full">
        <div
          className="flex items-center gap-1 cursor-pointer px-1.5 py-1 rounded transition-colors hover:bg-accent/50 overflow-hidden"
          style={{ maxWidth: '30%' }}
          onClick={() => setPopover(prev => !prev)}
        >
          {country && (
            <img
              className="w-4 h-[12px] object-cover rounded-sm shrink-0"
              src={getFlagUrl(country.countryCode)}
              alt={country.countryName}
              loading="lazy"
            />
          )}
          <svg className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${popover ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div className="w-px h-5 bg-border shrink-0" />

        <input
          ref={zipInputRef}
          className="flex-1 bg-transparent text-foreground text-sm outline-none min-w-0 px-2"
          type="text"
          placeholder={placeholder}
          value={currentValue.zipCode}
          onChange={e => setCurrentValue(prev => ({ ...prev, zipCode: sanitizeZipCode(e.target.value) }))}
          onFocus={() => { if (popover) setPopover(false); }}
        />
      </div>

      {popover && (
        <div
          className="absolute left-0 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-[1001]"
          style={{ top: '100%', marginTop: 4, width: '100%', minWidth: 250, maxWidth: 400 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-1.5 px-2 py-1 border border-border rounded bg-background">
              <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchFieldRef}
                type="text"
                className="flex-1 text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search country"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => { setSearch(''); searchFieldRef.current?.focus(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">No options found</div>
            ) : filteredCountries.map(code => {
              const c = getCountry(code);
              if (!c) return null;
              const isSelected = code === currentValue.countryCode;
              return (
                <div
                  key={code}
                  ref={isSelected ? selectedCountryRef : null}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  onClick={() => handleCountryClick(code)}
                >
                  <img className="w-5 h-[15px] object-cover rounded-sm shrink-0" src={getFlagUrl(c.countryCode)} alt={c.countryName} loading="lazy" />
                  <span className="text-sm text-foreground truncate">{c.countryName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SignatureInput({ cell: _cell, onCommit, onCancel }: EditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent) => { isDrawingRef.current = true; lastPointRef.current = getPos(e); };
  const draw = (e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastPointRef.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPointRef.current = pos;
  };
  const endDraw = () => { isDrawingRef.current = false; lastPointRef.current = null; };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onCommit(dataUrl);
  };

  return (
    <div className="bg-popover text-popover-foreground border-2 border-[#39A380] rounded shadow-lg p-2" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="text-xs text-muted-foreground mb-1">Draw your signature</div>
      <canvas ref={canvasRef} width={280} height={100} className="border border-border rounded cursor-crosshair bg-background"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} />
      <div className="flex justify-between mt-1.5">
        <button onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
        <div className="flex gap-1">
          <button onClick={onCancel} className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSave} className="px-2 py-0.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

function FileUploadInput({ cell, onCommit, onCancel }: EditorProps) {
  const existingFiles: Array<{name: string, size?: number, type?: string, url?: string, previewUrl?: string}> = Array.isArray(cell.data) ? (cell.data as any[]).map((f: any) => typeof f === 'string' ? { name: f } : { name: f.name || String(f), size: f.size, type: f.type, url: f.url }) : [];
  const [fileList, setFileList] = useState(existingFiles);
  const actualFilesRef = useRef<Map<number, File>>(new Map());
  const nextIndexRef = useRef(existingFiles.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const addedFiles = Array.from(e.target.files || []);
    const newEntries = addedFiles.map(f => {
      const idx = nextIndexRef.current++;
      actualFilesRef.current.set(idx, f);
      return {
        name: f.name,
        size: f.size,
        type: f.type,
        previewUrl: URL.createObjectURL(f),
        _idx: idx,
      };
    });
    setFileList(prev => [...prev, ...newEntries]);
  };

  const handleRemove = (index: number) => {
    const item = fileList[index] as any;
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item?._idx !== undefined) actualFilesRef.current.delete(item._idx);
    setFileList(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    if (['mp4', 'mov', 'avi'].includes(ext)) return '🎬';
    if (['mp3', 'wav'].includes(ext)) return '🎵';
    if (['zip', 'rar', '7z'].includes(ext)) return '📦';
    return '📎';
  };

  const handleSave = async () => {
    const pendingFiles = fileList.filter((f: any) => f._idx !== undefined && actualFilesRef.current.has(f._idx));
    if (pendingFiles.length === 0) {
      onCommit(fileList.map(({ name, size, type, url }: any) => ({ name, size, type, url })));
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFiles: Array<{ url: string; size: number; mimeType: string; name: string }> = [];
      for (const entry of pendingFiles) {
        const file = actualFilesRef.current.get((entry as any)._idx);
        if (!file) continue;
        try {
          const res = await getFileUploadUrl({
            baseId: '',
            tableId: '',
            fieldId: '',
            recordId: '',
            fileName: file.name,
            mimeType: file.type,
          });
          const presignedUrl = res.data?.url || res.data?.uploadUrl;
          if (presignedUrl) {
            await uploadFileToPresignedUrl(presignedUrl, file);
            const fileUrl = presignedUrl.split('?')[0];
            uploadedFiles.push({ url: fileUrl, size: file.size, mimeType: file.type, name: file.name });
            (entry as any).url = fileUrl;
          }
        } catch (err: any) {
          if (err?.response?.status === 404) {
            break;
          }
        }
      }

      if (uploadedFiles.length > 0) {
        try {
          await confirmFileUpload({
            baseId: '',
            tableId: '',
            fieldId: '',
            recordId: '',
            files: uploadedFiles,
          });
        } catch (_err) {
        }
      }

      onCommit(fileList.map(({ name, size, type, url }: any) => ({ name, size, type, url })));
    } catch (_err) {
      onCommit(fileList.map(({ name, size, type, url }: any) => ({ name, size, type, url })));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-popover text-popover-foreground border-2 border-[#39A380] rounded shadow-lg p-2 min-w-[280px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="text-xs font-medium text-muted-foreground mb-1.5">Files</div>
      {fileList.length > 0 && (
        <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
          {fileList.map((file, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm">
              <span>{getFileIcon(file.name)}</span>
              <span className="flex-1 truncate">{file.name}</span>
              {file.size && <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>}
              <button onClick={() => handleRemove(i)} className="text-muted-foreground hover:text-red-500 text-xs">×</button>
            </div>
          ))}
        </div>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded p-3 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
      >
        <div className="text-sm text-muted-foreground">Click to add files</div>
        <div className="text-xs text-muted-foreground/70 mt-0.5">or drag and drop</div>
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
      <div className="flex justify-end gap-1 mt-2">
        {isUploading && <span className="text-xs text-emerald-500 mr-auto py-0.5">Uploading...</span>}
        <button onClick={onCancel} className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground" disabled={isUploading}>Cancel</button>
        <button onClick={handleSave} className="px-2 py-0.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

interface RankingItem {
  id: string | number;
  rank: number;
  label: string;
}

function RankingInput({ cell, onCommit, onCancel }: EditorProps) {
  const rawOptions: any[] = (cell as any).options?.options ?? [];
  const existingData: RankingItem[] | null = Array.isArray(cell.data) ? cell.data as RankingItem[] : null;

  const buildItemsFromOptions = (): RankingItem[] => {
    return rawOptions.map((opt: any, i: number) => ({
      id: typeof opt === 'object' ? (opt.id || opt.label || String(i)) : String(i),
      rank: i + 1,
      label: typeof opt === 'object' ? (opt.label || '') : String(opt),
    }));
  };

  const [items, setItems] = useState<RankingItem[]>(() => {
    if (existingData && existingData.length > 0) {
      return existingData.map((item, i) => ({
        id: item.id ?? String(i),
        rank: item.rank ?? i + 1,
        label: item.label ?? '',
      }));
    }
    return buildItemsFromOptions();
  });

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const moveItem = (from: number, to: number) => {
    const newItems = [...items];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(to, 0, moved);
    setItems(newItems.map((item, i) => ({ ...item, rank: i + 1 })));
  };

  const handleSave = useCallback(() => {
    if (items.length === 0) {
      onCommit(null);
    } else {
      onCommit(items.map((item, i) => ({ id: item.id, rank: i + 1, label: item.label })));
    }
  }, [items, onCommit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
  }, [onCancel, handleSave]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      handleSave();
    }, 0);
  }, [handleSave]);

  if (items.length === 0) {
    return (
      <div
        ref={containerRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="bg-popover text-popover-foreground border-2 border-[#39A380] rounded shadow-lg p-3 min-w-[200px]"
      >
        <div className="text-sm text-muted-foreground text-center py-2">
          No ranking options configured. Edit the field to add options.
        </div>
        <div className="flex justify-end mt-2">
          <button onClick={onCancel} className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-popover text-popover-foreground border-2 border-[#39A380] rounded shadow-lg p-2 min-w-[220px]"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      <div className="text-xs font-medium text-muted-foreground mb-1.5">Drag to reorder ranking</div>
      <div className="space-y-0.5 max-h-56 overflow-y-auto">
        {items.map((item, i) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
            onDrop={() => { if (dragIndex !== null && dragIndex !== i) moveItem(dragIndex, i); setDragIndex(null); setDragOverIndex(null); }}
            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-grab active:cursor-grabbing transition-colors ${
              dragIndex === i ? 'opacity-50 bg-emerald-50 border border-emerald-200' : dragOverIndex === i && dragIndex !== i ? 'border-t-2 border-emerald-400' : 'hover:bg-accent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
            <span className="flex-1 truncate">{item.label}</span>
            <span className="text-muted-foreground/40 text-xs shrink-0 select-none">⋮⋮</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-1.5 mt-2 pt-1.5 border-t">
        <button onClick={onCancel} className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-muted">Cancel</button>
        <button onClick={handleSave} className="px-2.5 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-medium rounded">Save</button>
      </div>
    </div>
  );
}

function OpinionScaleInput({ cell, onCommit, onCancel, onCommitAndNavigate }: EditorProps) {
  const maxValue = (cell as any).options?.maxValue ?? 10;
  const current = typeof cell.data === 'number' ? cell.data : null;
  const [selected, setSelected] = useState<number | null>(current);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const val = selected !== current ? selected : current;
      if (onCommitAndNavigate && val !== current) {
        onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
      } else if (val !== current) {
        onCommit(val);
      } else {
        onCancel();
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      const val = selected !== current ? selected : current;
      if (onCommitAndNavigate && val !== current) {
        onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
      } else if (val !== current) {
        onCommit(val);
      } else {
        onCancel();
      }
      return;
    }
    const num = parseInt(e.key, 10);
    if (!isNaN(num) && num >= 1 && num <= maxValue) {
      e.preventDefault();
      setSelected(num);
      onCommit(num);
    }
  }, [onCancel, onCommit, onCommitAndNavigate, maxValue, selected, current]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      if (selected !== current) {
        onCommit(selected);
      } else {
        onCancel();
      }
    }, 0);
  }, [onCommit, onCancel, selected, current]);

  return (
    <div
      ref={containerRef}
      className="bg-background border-2 border-[#39A380] flex items-center gap-0.5 px-1 h-full w-full overflow-x-auto overflow-y-hidden"
      style={{ boxSizing: 'border-box' }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      {Array.from({ length: maxValue }, (_, i) => {
        const val = i + 1;
        const isActive = selected === val;
        return (
          <button
            key={val}
            onClick={() => {
              setSelected(val);
              onCommit(val);
            }}
            className={`shrink-0 rounded font-medium transition-colors ${
              isActive ? 'bg-violet-500 text-white' : 'bg-muted hover:bg-accent'
            }`}
            style={{ width: 22, height: 22, fontSize: 11, lineHeight: 1, padding: 0 }}
          >
            {val}
          </button>
        );
      })}
    </div>
  );
}

export function CellEditorOverlay({ cell, column, rect, onCommit, onCancel, onCommitAndNavigate, baseId, tableId, recordId, zoomScale = 1, containerWidth, containerHeight, rowHeaderWidth = 0, headerHeight = 0, overlayRef, initialCharacter }: CellEditorOverlayProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const setRefs = useCallback((el: HTMLDivElement | null) => {
    (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (overlayRef) {
      (overlayRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  }, [overlayRef]);

  const isPopupEditor = [
    CellType.SingleSelect, CellType.MultiSelect, CellType.Rating,
    CellType.Signature, CellType.Attachment,
    CellType.OrderedList, CellType.Link,
    CellType.User, CellType.Button, CellType.Address,
    CellType.SCQ, CellType.MCQ, CellType.DropDown, CellType.List,
    CellType.Ranking,
  ].includes(cell.type);

  const isInlineOverlayEditor = [
    CellType.Slider, CellType.OpinionScale,
  ].includes(cell.type);

  const editorWidth = isPopupEditor ? Math.max(rect.width, 200) : rect.width + 4;
  const editorHeight = isPopupEditor ? undefined : rect.height + 4;

  let clampedX = isPopupEditor ? rect.x : rect.x - 2;
  let clampedY = isPopupEditor ? rect.y + rect.height : rect.y - 2;

  if (isPopupEditor) {
    clampedX = Math.max(rowHeaderWidth, clampedX);
    if (containerWidth != null) {
      const maxX = containerWidth / zoomScale - editorWidth;
      clampedX = Math.min(clampedX, maxX);
    }
  } else {
    const minX = rowHeaderWidth - 2;
    const minY = headerHeight - 2;
    clampedX = Math.max(minX, clampedX);
    clampedY = Math.max(minY, clampedY);
    if (containerWidth != null) {
      const maxX = containerWidth / zoomScale - editorWidth;
      clampedX = Math.min(clampedX, maxX);
    }
    if (containerHeight != null) {
      const maxY = containerHeight / zoomScale - (editorHeight ?? rect.height);
      clampedY = Math.min(clampedY, maxY);
    }
  }

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: clampedX * zoomScale,
    top: clampedY * zoomScale,
    transformOrigin: 'top left',
    transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
    zIndex: 50,
    pointerEvents: 'auto',
  };

  const style: React.CSSProperties = isPopupEditor ? {
    minWidth: editorWidth,
  } : isInlineOverlayEditor ? {
    width: editorWidth,
    height: editorHeight,
    boxSizing: 'border-box' as const,
  } : {
    width: editorWidth,
    height: editorHeight,
    border: '2px solid #39A380',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
  };

  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  let editor: React.ReactNode;

  switch (cell.type) {
    case CellType.Number:
      editor = <NumberInput cell={cell} onCommit={onCommit} onCancel={onCancel} onCommitAndNavigate={onCommitAndNavigate} initialCharacter={initialCharacter} />;
      break;
    case CellType.SCQ:
      editor = <SelectEditor cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.DropDown:
      editor = <DropDownEditor cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.MCQ:
      editor = <MultiSelectEditor cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.List: {
      const listValue = Array.isArray(cell.data) ? (cell.data as unknown[]).map(String) : [];
      editor = (
        <ListFieldEditor
          value={listValue}
          onChange={(v) => onCommit(v)}
          onCancel={onCancel}
          popoverStyle={true}
        />
      );
      break;
    }
    case CellType.YesNo:
      onCommit((cell.data as string) === 'Yes' ? 'No' : 'Yes');
      return null;
    case CellType.DateTime:
      editor = <DateTimeInput cell={cell} onCommit={onCommit} onCancel={onCancel} onCommitAndNavigate={onCommitAndNavigate} />;
      break;
    case CellType.Time:
      editor = <TimeInput cell={cell} onCommit={onCommit} onCancel={onCancel} onCommitAndNavigate={onCommitAndNavigate} />;
      break;
    case CellType.Currency:
      editor = <CurrencyInput cell={cell} onCommit={onCommit} onCancel={onCancel} onCommitAndNavigate={onCommitAndNavigate} />;
      break;
    case CellType.Rating:
      editor = <RatingInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.Slider:
      editor = <SliderInput cell={cell} onCommit={onCommit} onCancel={onCancel} onCommitAndNavigate={onCommitAndNavigate} />;
      break;
    case CellType.PhoneNumber:
      editor = <PhoneNumberInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.Address:
      editor = <AddressInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.ZipCode:
      editor = <ZipCodeInput cell={cell} onCommit={onCommit} onCancel={onCancel} onCommitAndNavigate={onCommitAndNavigate} />;
      break;
    case CellType.OpinionScale:
      editor = <OpinionScaleInput cell={cell} onCommit={onCommit} onCancel={onCancel} onCommitAndNavigate={onCommitAndNavigate} />;
      break;
    case CellType.Signature:
      editor = <SignatureInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.FileUpload:
      editor = <FileUploadInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.Ranking:
      editor = <RankingInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.CreatedTime:
      return null;
    case CellType.Formula:
      return null;
    case CellType.Enrichment:
      return null;
    case CellType.Checkbox:
      onCommit(!(cell.data as boolean));
      return null;
    case CellType.CreatedBy:
    case CellType.LastModifiedBy:
    case CellType.LastModifiedTime:
    case CellType.AutoNumber:
      return null;
    case CellType.Rollup: {
      const rollupDisplayData = (cell as any).displayData || String((cell as any).data ?? '');
      editor = (
        <div className="bg-popover border-2 border-[#39A380] rounded shadow-lg p-3 min-w-[200px] max-w-[400px]">
          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <span>Σ</span>
            <span>Rollup</span>
          </div>
          <div className="text-lg font-semibold px-1">{rollupDisplayData || '—'}</div>
          <div className="text-xs text-muted-foreground mt-2">Expand record row to see source linked records</div>
        </div>
      );
      break;
    }
    case CellType.Lookup: {
      const lookupData = (cell as any).data;
      const lookupDisplay = (cell as any).displayData;
      editor = (
        <div className="bg-popover border-2 border-[#39A380] rounded shadow-lg p-3 min-w-[200px] max-w-[400px]">
          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <span>👁</span>
            <span>Lookup</span>
          </div>
          {Array.isArray(lookupData) && lookupData.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {lookupData.map((val: any, i: number) => (
                <span key={i} className="inline-block bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-2 py-0.5 text-sm">
                  {String(val)}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{lookupDisplay || '—'}</div>
          )}
          <div className="text-xs text-muted-foreground mt-2">Expand record row to see source linked records</div>
        </div>
      );
      break;
    }
    case CellType.Link: {
      const linkOptions = cell && 'options' in cell ? (cell as any).options : undefined;
      const foreignTblId = linkOptions?.foreignTableId || (column.options as any)?.foreignTableId;
      const fieldId = Number((column as any).rawId || column.id);
      const linkRecords: ILinkRecord[] = Array.isArray(cell.data) ? cell.data : [];

      const handleLinkChange = async (records: ILinkRecord[]) => {
        onCommit(records);
        if (baseId && tableId && recordId) {
          try {
            await updateLinkCell({
              tableId,
              baseId,
              fieldId,
              recordId: Number(recordId),
              linkedRecordIds: records.map(r => r.id),
            });
          } catch {
            // link cell update failed
          }
        }
      };

      const handleSearch = async (query: string): Promise<ILinkRecord[]> => {
        if (!baseId || !foreignTblId) return [];
        try {
          const res = await searchForeignRecords({ baseId, tableId: String(foreignTblId), query });
          const records = res?.data?.records || res?.data || [];
          return records.map((r: any) => ({
            id: Number(r.__id?.value || r.__id || r.id),
            title: r.__title?.value || r.__title || r.title || String(r.__id?.value || r.__id || r.id),
          })).filter((r: ILinkRecord) => r.id > 0);
        } catch {
          return [];
        }
      };

      const handleExpandLinkRecord = (record: ILinkRecord) => {
        if (foreignTblId) {
          useGridViewStore.getState().openLinkedRecord({
            foreignTableId: String(foreignTblId),
            recordId: record.id,
            title: record.title,
          });
        }
      };

      editor = (
        <div className="bg-popover border-2 border-[#39A380] rounded shadow-lg p-2 min-w-[240px]">
          <LinkEditor
            value={linkRecords}
            onChange={handleLinkChange}
            foreignTableId={foreignTblId}
            onSearch={handleSearch}
            onExpandRecord={handleExpandLinkRecord}
          />
        </div>
      );
      break;
    }
    case CellType.User: {
      const users = Array.isArray(cell.data) ? cell.data : [];
      editor = (
        <div className="bg-popover border-2 border-[#39A380] rounded shadow-lg p-2 min-w-[200px]">
          <div className="text-sm text-muted-foreground">
            {users.length > 0
              ? users.map((u: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <span>{u.name || u.email || 'Unknown'}</span>
                  </div>
                ))
              : <span className="text-muted-foreground">No users assigned</span>}
          </div>
        </div>
      );
      break;
    }
    case CellType.Button: {
      const btnOptions: IButtonOptions = ('options' in cell && cell.options) ? cell.options as IButtonOptions : { label: 'Click' };
      const cellData = (cell as any).data;
      const clickCount = typeof cellData === 'object' && cellData !== null ? (cellData.clickCount || 0) : (typeof cellData === 'number' ? cellData : 0);

      const handleButtonClick = async () => {
        if (baseId && tableId && recordId) {
          try {
            const numericFieldId = String((column as any).rawId || column.id);
            await triggerButtonClick({
              tableId,
              fieldId: numericFieldId,
              recordId,
              baseId,
            });
            if (btnOptions.actionType === 'openUrl' && btnOptions.url) {
              window.open(btnOptions.url, '_blank');
            }
            onCommit(clickCount + 1);
          } catch {
            // button click failed
          }
        }
        onCancel();
      };

      editor = (
        <div className="bg-popover border-2 border-[#39A380] rounded shadow-lg p-2">
          <ButtonEditor
            options={btnOptions}
            onClick={handleButtonClick}
            clickCount={clickCount}
          />
        </div>
      );
      break;
    }
    default:
      editor = <StringInput cell={cell} onCommit={onCommit} onCancel={onCancel} onCommitAndNavigate={onCommitAndNavigate} initialCharacter={initialCharacter} />;
      break;
  }

  return (
    <div ref={setRefs} style={wrapperStyle} data-editor-container onMouseDown={(e) => e.stopPropagation()}>
      <div style={style}>{editor}</div>
    </div>
  );
}
