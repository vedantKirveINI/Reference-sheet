import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { IAddressData } from '@/types';
import { MapPin, X } from 'lucide-react';

interface AddressEditorProps {
  value: IAddressData | null;
  onChange: (value: IAddressData | null) => void;
  onClose?: () => void;
  disabled?: boolean;
  triggerMode?: 'button' | 'auto';
  open?: boolean;
}

function formatAddress(addr: IAddressData | null): string {
  if (!addr) return '';
  const parts = [
    addr.fullName,
    addr.addressLineOne,
    addr.addressLineTwo,
    [addr.city, addr.state].filter(Boolean).join(', '),
    addr.zipCode,
    addr.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export function AddressEditor({
  value,
  onChange,
  onClose,
  disabled = false,
  triggerMode = 'button',
  open: controlledOpen,
}: AddressEditorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const [fullName, setFullName] = useState(value?.fullName || '');
  const [addressLineOne, setAddressLineOne] = useState(value?.addressLineOne || '');
  const [addressLineTwo, setAddressLineTwo] = useState(value?.addressLineTwo || '');
  const [city, setCity] = useState(value?.city || '');
  const [state, setState] = useState(value?.state || '');
  const [zipCode, setZipCode] = useState(value?.zipCode || '');
  const [country, setCountry] = useState(value?.country || '');

  const resetFields = useCallback((addr: IAddressData | null) => {
    setFullName(addr?.fullName || '');
    setAddressLineOne(addr?.addressLineOne || '');
    setAddressLineTwo(addr?.addressLineTwo || '');
    setCity(addr?.city || '');
    setState(addr?.state || '');
    setZipCode(addr?.zipCode || '');
    setCountry(addr?.country || '');
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    resetFields(value);
    setInternalOpen(true);
  };

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  const handleSave = () => {
    const result: IAddressData = {};
    if (fullName.trim()) result.fullName = fullName.trim();
    if (addressLineOne.trim()) result.addressLineOne = addressLineOne.trim();
    if (addressLineTwo.trim()) result.addressLineTwo = addressLineTwo.trim();
    if (city.trim()) result.city = city.trim();
    if (state.trim()) result.state = state.trim();
    if (zipCode.trim()) result.zipCode = zipCode.trim();
    if (country.trim()) result.country = country.trim();

    if (Object.keys(result).length === 0) {
      onChange(null);
    } else {
      onChange(result);
    }
    handleClose();
  };

  const handleClear = () => {
    setFullName('');
    setAddressLineOne('');
    setAddressLineTwo('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('');
  };

  const displayValue = formatAddress(value);

  const inputClass = "h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  return (
    <>
      {triggerMode === 'button' && (
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-left flex items-center gap-2 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        >
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <span className={displayValue ? 'text-gray-900 truncate' : 'text-gray-400 truncate'}>
            {displayValue || 'Click to add address'}
          </span>
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4 text-primary" />
              Edit Address
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
              <input
                autoFocus
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Address Line 1</label>
              <input
                value={addressLineOne}
                onChange={e => setAddressLineOne(e.target.value)}
                placeholder="123 Main St"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Address Line 2</label>
              <input
                value={addressLineTwo}
                onChange={e => setAddressLineTwo(e.target.value)}
                placeholder="Apt 4B"
                className={inputClass}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="New York"
                  className={inputClass}
                />
              </div>
              <div className="w-28">
                <label className="text-xs font-medium text-gray-500 mb-1 block">State</label>
                <input
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="NY"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-32">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Zip Code</label>
                <input
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  placeholder="10001"
                  className={inputClass}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Country</label>
                <input
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="United States"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { formatAddress };
