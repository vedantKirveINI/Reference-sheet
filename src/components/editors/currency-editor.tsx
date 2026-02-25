import { useState, useRef, useEffect, useCallback } from 'react';
import { CountryPicker } from './country-picker';
import { getCountry } from '@/lib/countries';
import type { ICurrencyData } from '@/types';

interface CurrencyEditorProps {
  value: ICurrencyData | null;
  onChange: (value: ICurrencyData | null) => void;
  onSave?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function CurrencyEditor({
  value,
  onChange,
  onSave,
  onCancel,
  autoFocus = false,
  disabled = false,
}: CurrencyEditorProps) {
  const defaultCountry = getCountry('US')!;
  const [countryCode, setCountryCode] = useState(value?.countryCode || defaultCountry.countryCode);
  const [currencyCode, setCurrencyCode] = useState(value?.currencyCode || defaultCountry.currencyCode || 'USD');
  const [currencySymbol, setCurrencySymbol] = useState(value?.currencySymbol || defaultCountry.currencySymbol || '$');
  const [currencyValue, setCurrencyValue] = useState(
    value?.currencyValue != null ? String(value.currencyValue) : ''
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [autoFocus]);

  const buildValue = useCallback((): ICurrencyData | null => {
    const sanitized = currencyValue.replace(/[^0-9.]/g, '');
    if (!sanitized) return null;
    return { countryCode, currencyCode, currencySymbol, currencyValue: sanitized };
  }, [countryCode, currencyCode, currencySymbol, currencyValue]);

  const handleCountrySelect = (country: ReturnType<typeof getCountry> & {}) => {
    setCountryCode(country.countryCode);
    setCurrencyCode(country.currencyCode || '');
    setCurrencySymbol(country.currencySymbol || '');
    const sanitized = currencyValue.replace(/[^0-9.]/g, '');
    if (sanitized) {
      onChange({
        countryCode: country.countryCode,
        currencyCode: country.currencyCode || '',
        currencySymbol: country.currencySymbol || '',
        currencyValue: sanitized,
      });
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[0-9.,]*$/.test(val)) {
      setCurrencyValue(val);
      const sanitized = val.replace(/[^0-9.]/g, '');
      if (sanitized) {
        onChange({ countryCode, currencyCode, currencySymbol, currencyValue: sanitized });
      } else {
        onChange(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onChange(buildValue());
      onSave?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel?.();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      onChange(buildValue());
      onSave?.();
    }
  };

  return (
    <div
      className="flex items-center border border-border rounded-md bg-background overflow-visible"
      onKeyDown={handleKeyDown}
      onMouseDown={e => e.stopPropagation()}
    >
      <CountryPicker
        selectedCountryCode={countryCode}
        onSelect={handleCountrySelect}
        showCurrencyInfo
        disabled={disabled}
      />
      <div className="w-px h-6 bg-border shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={currencyValue}
        onChange={handleValueChange}
        placeholder="0.00"
        disabled={disabled}
        className="flex-1 px-3 py-1.5 text-sm bg-transparent text-foreground outline-none text-right min-w-0"
      />
    </div>
  );
}
