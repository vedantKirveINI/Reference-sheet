import { useState, useRef, useEffect, useCallback } from 'react';
import { CountryPicker } from './country-picker';
import { getCountry } from '@/lib/countries';
import type { IPhoneNumberData } from '@/types';

interface PhoneNumberEditorProps {
  value: IPhoneNumberData | null;
  onChange: (value: IPhoneNumberData | null) => void;
  onSave?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function PhoneNumberEditor({
  value,
  onChange,
  onSave,
  onCancel,
  autoFocus = false,
  disabled = false,
}: PhoneNumberEditorProps) {
  const defaultCountry = getCountry('US')!;
  const [countryCode, setCountryCode] = useState(value?.countryCode || defaultCountry.countryCode);
  const [countryNumber, setCountryNumber] = useState(value?.countryNumber || defaultCountry.countryNumber);
  const [phoneNumber, setPhoneNumber] = useState(value?.phoneNumber || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [autoFocus]);

  const buildValue = useCallback((): IPhoneNumberData | null => {
    if (!phoneNumber.trim()) return null;
    return { countryCode, countryNumber, phoneNumber: phoneNumber.trim() };
  }, [countryCode, countryNumber, phoneNumber]);

  const handleCountrySelect = (country: ReturnType<typeof getCountry> & {}) => {
    setCountryCode(country.countryCode);
    setCountryNumber(country.countryNumber);
    const newVal: IPhoneNumberData = {
      countryCode: country.countryCode,
      countryNumber: country.countryNumber,
      phoneNumber: phoneNumber.trim(),
    };
    onChange(phoneNumber.trim() ? newVal : null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9\s\-()]/g, '');
    setPhoneNumber(val);
    onChange(val.trim() ? { countryCode, countryNumber, phoneNumber: val.trim() } : null);
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
      <div style={{ maxWidth: '30%' }} className="shrink-0 overflow-hidden">
        <CountryPicker
          selectedCountryCode={countryCode}
          onSelect={handleCountrySelect}
          showPhoneCode
          disabled={disabled}
          compact
        />
      </div>
      <div className="w-px h-6 bg-border shrink-0" />
      <input
        ref={inputRef}
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder="Phone number"
        disabled={disabled}
        className="flex-1 px-3 py-1.5 text-sm bg-transparent text-foreground outline-none min-w-0"
      />
    </div>
  );
}
