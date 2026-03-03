import { useState, useRef, useEffect, useCallback } from 'react';
import { CountryPicker } from './country-picker';
import { getCountry } from '@/lib/countries';
import { getZipCodePlaceholder } from '@/lib/zipCodePatterns';
import type { IZipCodeData } from '@/types';

interface ZipCodeEditorProps {
  value: IZipCodeData | null;
  onChange: (value: IZipCodeData | null) => void;
  onSave?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

function sanitizeZipCode(val: string): string {
  return val.replace(/[^A-Za-z0-9\s-]/g, '');
}

export function ZipCodeEditor({
  value,
  onChange,
  onSave,
  onCancel,
  autoFocus = false,
  disabled = false,
}: ZipCodeEditorProps) {
  const defaultCountry = getCountry('US')!;
  const [countryCode, setCountryCode] = useState(value?.countryCode || defaultCountry.countryCode);
  const [zipCode, setZipCode] = useState(value?.zipCode || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [autoFocus]);

  const buildValue = useCallback((): IZipCodeData | null => {
    const trimmed = zipCode.trim();
    if (!trimmed) return null;
    return { countryCode, zipCode: trimmed };
  }, [countryCode, zipCode]);

  const handleCountrySelect = (country: ReturnType<typeof getCountry> & {}) => {
    setCountryCode(country.countryCode);
    const newVal: IZipCodeData = {
      countryCode: country.countryCode,
      zipCode: zipCode.trim(),
    };
    onChange(zipCode.trim() ? newVal : null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = sanitizeZipCode(e.target.value);
    setZipCode(val);
    onChange(val.trim() ? { countryCode, zipCode: val.trim() } : null);
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

  const placeholder = getZipCodePlaceholder(countryCode) || 'Zip code';

  return (
    <div
      className="flex items-center border border-border rounded-md bg-background overflow-visible"
      onKeyDown={handleKeyDown}
      onMouseDown={e => e.stopPropagation()}
    >
      <div style={{ maxWidth: '30%' }} className="shrink-0 overflow-hidden">
        <CountryPicker
          selectedCountryCode={countryCode}
          onSelect={handleCountrySelect}
          disabled={disabled}
          compact
        />
      </div>
      <div className="w-px h-6 bg-border shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={zipCode}
        onChange={handleZipChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-1.5 text-sm bg-transparent text-foreground outline-none min-w-0"
      />
    </div>
  );
}
