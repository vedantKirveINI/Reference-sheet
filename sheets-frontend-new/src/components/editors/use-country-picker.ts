import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES, getCountry } from '@/lib/countries';
import type { Country } from '@/lib/countries';

interface UseCountryPickerParams {
  selectedCountryCode: string;
  onSelect: (country: Country) => void;
}

export function useCountryPicker({ selectedCountryCode, onSelect }: UseCountryPickerParams) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const country = selectedCountryCode ? getCountry(selectedCountryCode) : null;

  useEffect(() => {
    if (open && searchRef.current) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
    if (!open) setSearch('');
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
    return all.filter((c) =>
      c.countryName.toLowerCase().includes(q) ||
      c.countryCode.toLowerCase().includes(q) ||
      c.countryNumber.includes(q) ||
      (c.currencyCode || '').toLowerCase().includes(q),
    );
  }, [search]);

  const handleSelect = (c: Country) => {
    onSelect(c);
    setOpen(false);
  };

  return {
    open,
    setOpen,
    search,
    setSearch,
    searchRef,
    selectedRef,
    country,
    filteredCountries,
    handleSelect,
  };
}

