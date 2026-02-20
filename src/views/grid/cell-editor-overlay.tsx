import { useRef, useEffect, useState } from 'react';
import { CellType, ICell, IColumn } from '@/types';
import { getFileUploadUrl, uploadFileToPresignedUrl, confirmFileUpload } from '@/services/api';
import { COUNTRIES, getFlagUrl, getCountry } from '@/lib/countries';
import type { ICurrencyData, IPhoneNumberData, IAddressData } from '@/types';

interface CellEditorOverlayProps {
  cell: ICell;
  column: IColumn;
  rect: { x: number; y: number; width: number; height: number };
  onCommit: (value: any) => void;
  onCancel: () => void;
}

type EditorProps = { cell: ICell; onCommit: (v: any) => void; onCancel: () => void };

function StringInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      type="text"
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
      defaultValue={(cell.data as string) ?? ''}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value);
        if (e.key === 'Escape') onCancel();
      }}
    />
  );
}

function NumberInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      type="number"
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none text-right"
      defaultValue={(cell.data as number) ?? ''}
      onBlur={(e) => onCommit(e.target.value ? Number(e.target.value) : null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : null);
        if (e.key === 'Escape') onCancel();
      }}
    />
  );
}

function SelectEditor({ cell, onCommit, onCancel }: EditorProps) {
  const [search, setSearch] = useState('');
  const options: string[] = (cell as any).options?.options ?? [];
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const currentVal = cell.data as string | null;
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus(); }, []);

  return (
    <div className="bg-white border-2 border-[#39A380] rounded shadow-lg min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="p-1.5 border-b">
        <input ref={searchRef} type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
      </div>
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-gray-400">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => onCommit(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              currentVal === option ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-gray-100'
            }`}>
            <span className="inline-flex items-center gap-2">
              {currentVal === option && <span className="text-emerald-500">✓</span>}
              {option}
            </span>
          </button>
        ))}
      </div>
      {currentVal && (
        <div className="p-1.5 border-t">
          <button onClick={() => onCommit(null)} className="w-full text-left px-2 py-1 text-xs text-gray-400 hover:text-gray-600">Clear selection</button>
        </div>
      )}
    </div>
  );
}

function MultiSelectEditor({ cell, onCommit, onCancel }: EditorProps) {
  const [search, setSearch] = useState('');
  const options: string[] = (cell as any).options?.options ?? [];
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const currentVals: string[] = Array.isArray(cell.data) ? (cell.data as any[]).map(String) : [];
  const [selected, setSelected] = useState<string[]>(currentVals);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus(); }, []);

  const toggle = (option: string) => {
    setSelected(prev => prev.includes(option) ? prev.filter(v => v !== option) : [...prev, option]);
  };

  return (
    <div className="bg-white border-2 border-[#39A380] rounded shadow-lg min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="p-1.5 border-b">
        <input ref={searchRef} type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
      </div>
      {selected.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b">
          {selected.map(v => (
            <span key={v} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs">
              {v}
              <button onClick={() => toggle(v)} className="hover:text-emerald-900">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-gray-400">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => toggle(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              selected.includes(option) ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100'
            }`}>
            <span className="inline-flex items-center gap-2">
              <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${
                selected.includes(option) ? 'bg-emerald-500 border-[#39A380] text-white' : 'border-gray-300'
              }`}>{selected.includes(option) ? '✓' : ''}</span>
              {option}
            </span>
          </button>
        ))}
      </div>
      <div className="p-1.5 border-t flex justify-end">
        <button onClick={() => onCommit(selected)} className="px-3 py-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">Done</button>
      </div>
    </div>
  );
}

function DateTimeInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const currentValue = cell.data as string ?? '';
  const dateValue = currentValue ? new Date(currentValue).toISOString().slice(0, 16) : '';

  return (
    <input
      ref={ref}
      type="datetime-local"
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
      defaultValue={dateValue}
      onBlur={(e) => onCommit(e.target.value || null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value || null);
        if (e.key === 'Escape') onCancel();
      }}
    />
  );
}

function TimeInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <input
      ref={ref}
      type="time"
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
      defaultValue={(cell.data as string) ?? ''}
      onBlur={(e) => onCommit(e.target.value || null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value || null);
        if (e.key === 'Escape') onCancel();
      }}
    />
  );
}

function CurrencyInput({ cell, onCommit, onCancel }: EditorProps) {
  const existing = (cell as any).data as ICurrencyData | null;
  const [countryCode, setCountryCode] = useState(existing?.countryCode || 'US');
  const [currencyCode, setCurrencyCode] = useState(existing?.currencyCode || getCountry('US')?.currencyCode || 'USD');
  const [currencySymbol, setCurrencySymbol] = useState(existing?.currencySymbol || getCountry('US')?.currencySymbol || '$');
  const [currencyValue, setCurrencyValue] = useState(existing?.currencyValue != null ? String(existing.currencyValue) : '');
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  useEffect(() => { if (showPicker) searchRef.current?.focus(); }, [showPicker]);

  const filteredCountries = Object.values(COUNTRIES).filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.countryName.toLowerCase().includes(s) || (c.currencyCode || '').toLowerCase().includes(s) || (c.currencySymbol || '').toLowerCase().includes(s);
  });

  const handleCommit = () => {
    const sanitized = currencyValue.replace(/[^0-9.]/g, '');
    if (!sanitized) { onCommit(null); return; }
    onCommit({ countryCode, currencyCode, currencySymbol, currencyValue: sanitized } as ICurrencyData);
  };

  return (
    <div className="bg-white border-2 border-[#39A380] rounded shadow-lg flex items-center min-w-[280px] relative" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="relative">
        <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-1 px-2 py-1.5 hover:bg-gray-50">
          <img src={getFlagUrl(countryCode)} alt="" width={20} height={15} loading="lazy" className="object-cover" />
          <span className="text-xs text-gray-700">{currencyCode}</span>
          <span className="text-xs text-gray-500">{currencySymbol}</span>
          <span className="text-xs text-gray-400">▾</span>
        </button>
        {showPicker && (
          <div className="absolute top-full left-0 bg-white border rounded shadow-lg z-10 w-72">
            <div className="p-1.5 border-b">
              <input ref={searchRef} type="text" placeholder="Search countries..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.map(c => (
                <button key={c.countryCode} onClick={() => { setCountryCode(c.countryCode); setCurrencyCode(c.currencyCode || ''); setCurrencySymbol(c.currencySymbol || ''); setShowPicker(false); setSearch(''); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100">
                  <img src={getFlagUrl(c.countryCode)} alt="" width={20} height={15} loading="lazy" className="object-cover" />
                  <span className="flex-1 text-left truncate">{c.countryName}</span>
                  <span className="text-xs text-gray-500">{c.currencyCode || ''}</span>
                  <span className="text-xs text-gray-400">{c.currencySymbol || ''}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="w-px h-6 bg-gray-200" />
      <input ref={ref} type="text" value={currencyValue} onChange={e => { const v = e.target.value; if (/^[0-9.,]*$/.test(v)) setCurrencyValue(v); }} placeholder="0.00"
        className="flex-1 px-2 py-1.5 text-sm outline-none text-right"
        onBlur={() => { setTimeout(() => { if (!showPicker) handleCommit(); }, 100); }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCommit(); if (e.key === 'Escape') onCancel(); }}
      />
    </div>
  );
}

function RatingInput({ cell, onCommit, onCancel }: EditorProps) {
  const maxRating = ('options' in cell && cell.options && 'maxRating' in (cell.options as any))
    ? ((cell.options as any).maxRating ?? 5) : 5;
  const current = typeof cell.data === 'number' ? cell.data : 0;

  return (
    <div
      className="bg-white border-2 border-[#39A380] flex items-center gap-1 px-2 py-1"
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

function SliderInput({ cell, onCommit, onCancel }: EditorProps) {
  const [value, setValue] = useState(typeof cell.data === 'number' ? cell.data : 0);
  return (
    <div
      className="bg-white border-2 border-[#39A380] flex items-center gap-2 px-3 py-1"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="flex-1"
      />
      <span className="text-sm text-gray-600 w-8 text-right">{value}%</span>
      <button
        onClick={() => onCommit(value)}
        className="text-xs text-emerald-600 hover:text-emerald-700 px-2 py-0.5"
      >
        Done
      </button>
    </div>
  );
}

function PhoneNumberInput({ cell, onCommit, onCancel }: EditorProps) {
  const existing = (cell as any).data as IPhoneNumberData | null;
  const [countryCode, setCountryCode] = useState(existing?.countryCode || 'US');
  const [countryNumber, setCountryNumber] = useState(existing?.countryNumber || getCountry('US')?.countryNumber || '1');
  const [phoneNumber, setPhoneNumber] = useState(existing?.phoneNumber || '');
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => { if (showPicker) searchRef.current?.focus(); }, [showPicker]);

  const filteredCountries = Object.values(COUNTRIES).filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.countryName.toLowerCase().includes(s) || c.countryCode.toLowerCase().includes(s) || c.countryNumber.includes(s);
  });

  const handleCommit = () => {
    if (!phoneNumber.trim()) { onCommit(null); return; }
    onCommit({ countryCode, countryNumber, phoneNumber: phoneNumber.trim() } as IPhoneNumberData);
  };

  return (
    <div className="bg-white border-2 border-[#39A380] rounded shadow-lg flex items-center min-w-[280px] relative" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="relative">
        <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-1 px-2 py-1.5 hover:bg-gray-50">
          <img src={getFlagUrl(countryCode)} alt="" width={20} height={15} loading="lazy" className="object-cover" />
          <span className="text-xs text-gray-700">+{countryNumber}</span>
          <span className="text-xs text-gray-400">▾</span>
        </button>
        {showPicker && (
          <div className="absolute top-full left-0 bg-white border rounded shadow-lg z-10 w-72">
            <div className="p-1.5 border-b">
              <input ref={searchRef} type="text" placeholder="Search countries..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.map(c => (
                <button key={c.countryCode} onClick={() => { setCountryCode(c.countryCode); setCountryNumber(c.countryNumber); setShowPicker(false); setSearch(''); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100">
                  <img src={getFlagUrl(c.countryCode)} alt="" width={20} height={15} loading="lazy" className="object-cover" />
                  <span className="flex-1 text-left truncate">{c.countryName}</span>
                  <span className="text-xs text-gray-500">+{c.countryNumber}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="w-px h-6 bg-gray-200" />
      <input ref={ref} type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone number"
        className="flex-1 px-2 py-1.5 text-sm outline-none"
        onBlur={() => { setTimeout(() => { if (!showPicker) handleCommit(); }, 100); }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCommit(); if (e.key === 'Escape') onCancel(); }}
      />
    </div>
  );
}

function AddressInput({ cell, onCommit, onCancel }: EditorProps) {
  const existing = (cell as any).data as IAddressData | null;
  const [fullName, setFullName] = useState(existing?.fullName || '');
  const [addressLineOne, setAddressLineOne] = useState(existing?.addressLineOne || '');
  const [addressLineTwo, setAddressLineTwo] = useState(existing?.addressLineTwo || '');
  const [zipCode, setZipCode] = useState(existing?.zipCode || '');
  const [city, setCity] = useState(existing?.city || '');
  const [state, setState] = useState(existing?.state || '');
  const [country, setCountry] = useState(existing?.country || '');

  const handleSave = () => {
    const result: IAddressData = {};
    if (fullName.trim()) result.fullName = fullName.trim();
    if (addressLineOne.trim()) result.addressLineOne = addressLineOne.trim();
    if (addressLineTwo.trim()) result.addressLineTwo = addressLineTwo.trim();
    if (zipCode.trim()) result.zipCode = zipCode.trim();
    if (city.trim()) result.city = city.trim();
    if (state.trim()) result.state = state.trim();
    if (country.trim()) result.country = country.trim();
    if (Object.keys(result).length === 0) { onCommit(null); return; }
    onCommit(result);
  };

  return (
    <div className="bg-white border-2 border-[#39A380] rounded shadow-lg p-2 space-y-1.5 min-w-[320px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div>
        <label className="text-xs text-gray-500">Full Name</label>
        <input autoFocus value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
      </div>
      <div>
        <label className="text-xs text-gray-500">Address Line 1</label>
        <input value={addressLineOne} onChange={e => setAddressLineOne(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
      </div>
      <div>
        <label className="text-xs text-gray-500">Address Line 2</label>
        <input value={addressLineTwo} onChange={e => setAddressLineTwo(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1">
          <label className="text-xs text-gray-500">City</label>
          <input value={city} onChange={e => setCity(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
        </div>
        <div className="w-24">
          <label className="text-xs text-gray-500">State</label>
          <input value={state} onChange={e => setState(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="w-32">
          <label className="text-xs text-gray-500">Zip Code</label>
          <input value={zipCode} onChange={e => setZipCode(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500">Country</label>
          <input value={country} onChange={e => setCountry(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#39A380]" />
        </div>
      </div>
      <div className="flex justify-end gap-1">
        <button onClick={onCancel} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
        <button onClick={handleSave} className="px-2 py-0.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">Save</button>
      </div>
    </div>
  );
}

function ZipCodeInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      type="text"
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
      defaultValue={(cell.data as string) ?? ''}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value);
        if (e.key === 'Escape') onCancel();
      }}
    />
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
    <div className="bg-white border-2 border-[#39A380] rounded shadow-lg p-2" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="text-xs text-gray-500 mb-1">Draw your signature</div>
      <canvas ref={canvasRef} width={280} height={100} className="border rounded cursor-crosshair bg-white"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} />
      <div className="flex justify-between mt-1.5">
        <button onClick={handleClear} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
        <div className="flex gap-1">
          <button onClick={onCancel} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
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
          console.error('Upload error:', err);
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
    <div className="bg-white border-2 border-[#39A380] rounded shadow-lg p-2 min-w-[280px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="text-xs font-medium text-gray-600 mb-1.5">Files</div>
      {fileList.length > 0 && (
        <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
          {fileList.map((file, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded text-sm">
              <span>{getFileIcon(file.name)}</span>
              <span className="flex-1 truncate">{file.name}</span>
              {file.size && <span className="text-xs text-gray-400">{formatSize(file.size)}</span>}
              <button onClick={() => handleRemove(i)} className="text-gray-400 hover:text-red-500 text-xs">×</button>
            </div>
          ))}
        </div>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded p-3 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
      >
        <div className="text-sm text-gray-500">Click to add files</div>
        <div className="text-xs text-gray-400 mt-0.5">or drag and drop</div>
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
      <div className="flex justify-end gap-1 mt-2">
        {isUploading && <span className="text-xs text-emerald-500 mr-auto py-0.5">Uploading...</span>}
        <button onClick={onCancel} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700" disabled={isUploading}>Cancel</button>
        <button onClick={handleSave} className="px-2 py-0.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function RankingInput({ cell, onCommit, onCancel }: EditorProps) {
  const options: string[] = (cell as any).options?.options ?? [];
  const currentRanking: string[] = Array.isArray(cell.data) ? cell.data.map(String) : [];
  const [items, setItems] = useState<string[]>(
    currentRanking.length > 0 ? currentRanking : options
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const moveItem = (from: number, to: number) => {
    const newItems = [...items];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(to, 0, moved);
    setItems(newItems);
  };

  if (items.length === 0) {
    return (
      <input
        type="number"
        min="1"
        autoFocus
        className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
        defaultValue={(cell.data as number) ?? ''}
        onBlur={(e) => onCommit(e.target.value ? Number(e.target.value) : null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : null);
          if (e.key === 'Escape') onCancel();
        }}
      />
    );
  }

  return (
    <div className="bg-white border-2 border-[#39A380] rounded shadow-lg p-2 min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="text-xs font-medium text-gray-600 mb-1.5">Drag to reorder</div>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {items.map((item, i) => (
          <div
            key={`${item}-${i}`}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={() => { if (dragIndex !== null && dragIndex !== i) moveItem(dragIndex, i); setDragIndex(null); }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-grab active:cursor-grabbing transition-colors ${
              dragIndex === i ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{i + 1}</span>
            <span className="flex-1">{item}</span>
            <span className="text-gray-300 text-xs">⋮⋮</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-1 mt-2">
        <button onClick={onCancel} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
        <button onClick={() => onCommit(items)} className="px-2 py-0.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">Save</button>
      </div>
    </div>
  );
}

function OpinionScaleInput({ cell, onCommit, onCancel }: EditorProps) {
  const max = ('options' in cell && cell.options && 'max' in (cell.options as any))
    ? ((cell.options as any).max ?? 10) : 10;
  const current = typeof cell.data === 'number' ? cell.data : 0;

  return (
    <div className="bg-white border-2 border-[#39A380] flex items-center gap-0.5 px-2 py-1" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          onClick={() => onCommit(i + 1)}
          className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
            current === i + 1 ? 'bg-emerald-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

export function CellEditorOverlay({ cell, rect, onCommit, onCancel }: CellEditorOverlayProps) {
  const minWidth = Math.max(rect.width, 120);
  const minHeight = Math.max(rect.height, 32);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: rect.x,
    top: rect.y,
    width: minWidth,
    minHeight: minHeight,
    zIndex: 50,
  };

  let editor: React.ReactNode;

  switch (cell.type) {
    case CellType.Number:
      editor = <NumberInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.SCQ:
      editor = <SelectEditor cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.DropDown:
      editor = <SelectEditor cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.MCQ:
      editor = <MultiSelectEditor cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.YesNo:
      onCommit((cell.data as string) === 'Yes' ? 'No' : 'Yes');
      return null;
    case CellType.DateTime:
      editor = <DateTimeInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.Time:
      editor = <TimeInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.Currency:
      editor = <CurrencyInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.Rating:
      editor = <RatingInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.Slider:
      editor = <SliderInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.PhoneNumber:
      editor = <PhoneNumberInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.Address:
      editor = <AddressInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.ZipCode:
      editor = <ZipCodeInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.OpinionScale:
      editor = <OpinionScaleInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
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
    default:
      editor = <StringInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
  }

  return <div style={style}>{editor}</div>;
}
