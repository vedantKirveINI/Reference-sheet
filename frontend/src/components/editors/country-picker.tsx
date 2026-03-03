import { useState, useRef, useEffect, useMemo } from 'react';
import { COUNTRIES, getFlagUrl, getCountry } from '@/lib/countries';
import type { Country } from '@/lib/countries';

interface CountryPickerProps {
  selectedCountryCode: string;
  onSelect: (country: Country) => void;
  showCurrencyInfo?: boolean;
  showPhoneCode?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function CountryPicker({
  selectedCountryCode,
  onSelect,
  showCurrencyInfo = false,
  showPhoneCode = false,
  disabled = false,
  compact = false,
}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const country = selectedCountryCode ? getCountry(selectedCountryCode) : null;

  useEffect(() => {
    if (open && searchRef.current) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
    if (!open) setSearch('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && selectedRef.current) {
      requestAnimationFrame(() => {
        selectedRef.current?.scrollIntoView({ block: 'nearest' });
      });
    }
  }, [open]);

  const filteredCountries = useMemo(() => {
    const all = Object.values(COUNTRIES);
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter(c =>
      c.countryName.toLowerCase().includes(q) ||
      c.countryCode.toLowerCase().includes(q) ||
      c.countryNumber.includes(q) ||
      (c.currencyCode || '').toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (c: Country) => {
    onSelect(c);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`flex items-center hover:bg-accent/50 rounded transition-colors min-w-0 shrink-0 ${compact ? 'gap-1 px-1.5 py-1' : 'gap-1.5 px-2 py-1.5'}`}
      >
        {country && (
          <img
            src={getFlagUrl(country.countryCode)}
            alt={country.countryName}
            className={`object-cover rounded-sm shrink-0 ${compact ? 'w-4 h-[12px]' : 'w-5 h-[15px]'}`}
            loading="lazy"
          />
        )}
        {showPhoneCode && country && (
          <span className={`text-foreground whitespace-nowrap ${compact ? 'text-xs font-medium' : 'text-sm'}`}>+{country.countryNumber}</span>
        )}
        {showCurrencyInfo && country && (
          <>
            <span className={`font-medium text-foreground whitespace-nowrap ${compact ? 'text-xs' : 'text-sm'}`}>{country.currencyCode || ''}</span>
            <span className={`text-muted-foreground whitespace-nowrap ${compact ? 'text-xs' : 'text-sm'}`}>{country.currencySymbol || ''}</span>
          </>
        )}
        <svg className={`text-muted-foreground shrink-0 transition-transform ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 w-72 min-w-[250px] max-w-[400px] overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-1.5 px-2 py-1 border border-border rounded bg-background">
              <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder={showCurrencyInfo ? "Search country or currency..." : showPhoneCode ? "Search country or code" : "Search country"}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground min-w-0"
                onKeyDown={e => e.stopPropagation()}
              />
              {search && (
                <button type="button" className="text-muted-foreground hover:text-foreground shrink-0" onClick={() => { setSearch(''); searchRef.current?.focus(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">No options found</div>
            ) : (
              filteredCountries.map(c => (
                <button
                  key={c.countryCode}
                  ref={c.countryCode === selectedCountryCode ? selectedRef : undefined}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    c.countryCode === selectedCountryCode
                      ? 'bg-accent text-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <img
                    src={getFlagUrl(c.countryCode)}
                    alt=""
                    className="w-5 h-[15px] object-cover rounded-sm shrink-0"
                    loading="lazy"
                  />
                  <span className="flex-1 truncate text-foreground">{c.countryName}</span>
                  {showPhoneCode && (
                    <span className="text-xs text-muted-foreground shrink-0">+{c.countryNumber}</span>
                  )}
                  {showCurrencyInfo && (
                    <>
                      <span className="text-xs text-muted-foreground shrink-0">{c.currencyCode || ''}</span>
                      <span className="text-xs text-muted-foreground/70 shrink-0">{c.currencySymbol || ''}</span>
                    </>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
