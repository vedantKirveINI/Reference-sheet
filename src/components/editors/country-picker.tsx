import { useState, useRef, useEffect, useMemo } from 'react';
import { COUNTRIES, getFlagUrl, getCountry } from '@/lib/countries';
import type { Country } from '@/lib/countries';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface CountryPickerProps {
  selectedCountryCode: string;
  onSelect: (country: Country) => void;
  showCurrencyInfo?: boolean;
  showPhoneCode?: boolean;
  disabled?: boolean;
}

export function CountryPicker({
  selectedCountryCode,
  onSelect,
  showCurrencyInfo = false,
  showPhoneCode = false,
  disabled = false,
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
        className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-50 rounded transition-colors min-w-0 shrink-0"
      >
        {country && (
          <img
            src={getFlagUrl(country.countryCode)}
            alt={country.countryName}
            className="w-5 h-[15px] object-cover rounded-sm shrink-0"
            loading="lazy"
          />
        )}
        {showPhoneCode && country && (
          <span className="text-sm text-gray-700 whitespace-nowrap">+{country.countryNumber}</span>
        )}
        {showCurrencyInfo && country && (
          <>
            <span className="text-sm text-gray-700">{country.currencyCode || ''}</span>
            <span className="text-sm text-gray-500">{country.currencySymbol || ''}</span>
          </>
        )}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder={showCurrencyInfo ? "Search country or currency..." : "Search country..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                onKeyDown={e => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filteredCountries.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-400">No countries found</div>
            )}
            {filteredCountries.map(c => (
              <button
                key={c.countryCode}
                ref={c.countryCode === selectedCountryCode ? selectedRef : undefined}
                onClick={() => handleSelect(c)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  c.countryCode === selectedCountryCode
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={getFlagUrl(c.countryCode)}
                  alt=""
                  className="w-5 h-[15px] object-cover rounded-sm shrink-0"
                  loading="lazy"
                />
                <span className="flex-1 text-left truncate">{c.countryName}</span>
                {showPhoneCode && (
                  <span className="text-xs text-gray-500 shrink-0">+{c.countryNumber}</span>
                )}
                {showCurrencyInfo && (
                  <>
                    <span className="text-xs text-gray-500 shrink-0">{c.currencyCode || ''}</span>
                    <span className="text-xs text-gray-400 shrink-0">{c.currencySymbol || ''}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
