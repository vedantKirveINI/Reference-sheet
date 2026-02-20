import { useRef, useEffect, useState } from 'react';
import { CellType, ICell, IColumn } from '@/types';

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
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-blue-500 rounded-none"
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
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-blue-500 rounded-none text-right"
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
    <div className="bg-white border-2 border-blue-500 rounded shadow-lg min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="p-1.5 border-b">
        <input ref={searchRef} type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-gray-400">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => onCommit(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              currentVal === option ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'
            }`}>
            <span className="inline-flex items-center gap-2">
              {currentVal === option && <span className="text-blue-500">✓</span>}
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
    <div className="bg-white border-2 border-blue-500 rounded shadow-lg min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="p-1.5 border-b">
        <input ref={searchRef} type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      {selected.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b">
          {selected.map(v => (
            <span key={v} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
              {v}
              <button onClick={() => toggle(v)} className="hover:text-blue-900">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-gray-400">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => toggle(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              selected.includes(option) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
            }`}>
            <span className="inline-flex items-center gap-2">
              <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${
                selected.includes(option) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
              }`}>{selected.includes(option) ? '✓' : ''}</span>
              {option}
            </span>
          </button>
        ))}
      </div>
      <div className="p-1.5 border-t flex justify-end">
        <button onClick={() => onCommit(selected)} className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium">Done</button>
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
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-blue-500 rounded-none"
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
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-blue-500 rounded-none"
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
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      type="number"
      step="0.01"
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-blue-500 rounded-none text-right"
      defaultValue={(cell.data as number) ?? ''}
      onBlur={(e) => onCommit(e.target.value ? Number(e.target.value) : null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : null);
        if (e.key === 'Escape') onCancel();
      }}
    />
  );
}

function RatingInput({ cell, onCommit, onCancel }: EditorProps) {
  const maxRating = ('options' in cell && cell.options && 'maxRating' in (cell.options as any))
    ? ((cell.options as any).maxRating ?? 5) : 5;
  const current = typeof cell.data === 'number' ? cell.data : 0;

  return (
    <div
      className="bg-white border-2 border-blue-500 flex items-center gap-1 px-2 py-1"
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
      className="bg-white border-2 border-blue-500 flex items-center gap-2 px-3 py-1"
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
        className="text-xs text-blue-600 hover:text-blue-700 px-2 py-0.5"
      >
        Done
      </button>
    </div>
  );
}

const COUNTRY_CODES = [
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', name: 'US' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', name: 'UK' },
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', name: 'IN' },
  { code: '+86', flag: '\u{1F1E8}\u{1F1F3}', name: 'CN' },
  { code: '+81', flag: '\u{1F1EF}\u{1F1F5}', name: 'JP' },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', name: 'DE' },
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', name: 'FR' },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', name: 'AU' },
  { code: '+55', flag: '\u{1F1E7}\u{1F1F7}', name: 'BR' },
  { code: '+82', flag: '\u{1F1F0}\u{1F1F7}', name: 'KR' },
];

function PhoneNumberInput({ cell, onCommit, onCancel }: EditorProps) {
  const currentVal = (cell.data as string) ?? '';
  const matchCode = COUNTRY_CODES.find(c => currentVal.startsWith(c.code));
  const [selectedCode, setSelectedCode] = useState(matchCode?.code || '+1');
  const [number, setNumber] = useState(matchCode ? currentVal.slice(matchCode.code.length).trim() : currentVal);
  const [showCodes, setShowCodes] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="bg-white border-2 border-blue-500 rounded shadow-lg flex items-center min-w-[250px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="relative">
        <button onClick={() => setShowCodes(!showCodes)} className="flex items-center gap-1 px-2 py-1.5 text-sm border-r hover:bg-gray-50">
          <span>{COUNTRY_CODES.find(c => c.code === selectedCode)?.flag}</span>
          <span className="text-xs text-gray-500">{selectedCode}</span>
        </button>
        {showCodes && (
          <div className="absolute top-full left-0 bg-white border rounded shadow-lg z-10 max-h-40 overflow-y-auto">
            {COUNTRY_CODES.map(c => (
              <button key={c.code} onClick={() => { setSelectedCode(c.code); setShowCodes(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100">
                <span>{c.flag}</span><span>{c.name}</span><span className="text-xs text-gray-400">{c.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <input ref={ref} type="tel" value={number} onChange={e => setNumber(e.target.value)} placeholder="Phone number"
        className="flex-1 px-2 py-1.5 text-sm outline-none"
        onBlur={() => onCommit(`${selectedCode} ${number}`.trim())}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onCommit(`${selectedCode} ${number}`.trim());
          if (e.key === 'Escape') onCancel();
        }}
      />
    </div>
  );
}

function AddressInput({ cell, onCommit, onCancel }: EditorProps) {
  const currentVal = typeof cell.data === 'object' && cell.data ? cell.data as Record<string, string> : {};
  const parsed = typeof cell.data === 'string' ? { street: cell.data as string } : currentVal;
  const [street, setStreet] = useState(parsed.street || '');
  const [city, setCity] = useState(parsed.city || '');
  const [state, setState] = useState(parsed.state || '');
  const [zip, setZip] = useState(parsed.zip || '');
  const [country, setCountry] = useState(parsed.country || '');

  const handleSave = () => {
    const full = [street, city, state, zip, country].filter(Boolean).join(', ');
    onCommit(full || null);
  };

  return (
    <div className="bg-white border-2 border-blue-500 rounded shadow-lg p-2 space-y-1.5 min-w-[280px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <input autoFocus placeholder="Street" value={street} onChange={e => setStreet(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
      <div className="flex gap-1.5">
        <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <input placeholder="State" value={state} onChange={e => setState(e.target.value)} className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <div className="flex gap-1.5">
        <input placeholder="Zip" value={zip} onChange={e => setZip(e.target.value)} className="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <div className="flex justify-end gap-1">
        <button onClick={onCancel} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
        <button onClick={handleSave} className="px-2 py-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Save</button>
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
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-blue-500 rounded-none"
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
    <div className="bg-white border-2 border-blue-500 rounded shadow-lg p-2" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="text-xs text-gray-500 mb-1">Draw your signature</div>
      <canvas ref={canvasRef} width={280} height={100} className="border rounded cursor-crosshair bg-white"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} />
      <div className="flex justify-between mt-1.5">
        <button onClick={handleClear} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
        <div className="flex gap-1">
          <button onClick={onCancel} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={handleSave} className="px-2 py-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

function FileUploadInput({ cell, onCommit, onCancel }: EditorProps) {
  const files: Array<{name: string, size?: number, type?: string}> = Array.isArray(cell.data) ? (cell.data as any[]).map((f: any) => typeof f === 'string' ? { name: f } : { name: f.name || String(f), size: f.size, type: f.type }) : [];
  const [fileList, setFileList] = useState(files);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFileList(prev => [...prev, ...newFiles]);
  };

  const handleRemove = (index: number) => {
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

  return (
    <div className="bg-white border-2 border-blue-500 rounded shadow-lg p-2 min-w-[280px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
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
        className="border-2 border-dashed border-gray-300 rounded p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
      >
        <div className="text-sm text-gray-500">Click to add files</div>
        <div className="text-xs text-gray-400 mt-0.5">or drag and drop</div>
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
      <div className="flex justify-end gap-1 mt-2">
        <button onClick={onCancel} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
        <button onClick={() => onCommit(fileList)} className="px-2 py-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Save</button>
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
        className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-2 border-blue-500 rounded-none"
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
    <div className="bg-white border-2 border-blue-500 rounded shadow-lg p-2 min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
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
              dragIndex === i ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
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
        <button onClick={() => onCommit(items)} className="px-2 py-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Save</button>
      </div>
    </div>
  );
}

function OpinionScaleInput({ cell, onCommit, onCancel }: EditorProps) {
  const max = ('options' in cell && cell.options && 'max' in (cell.options as any))
    ? ((cell.options as any).max ?? 10) : 10;
  const current = typeof cell.data === 'number' ? cell.data : 0;

  return (
    <div className="bg-white border-2 border-blue-500 flex items-center gap-0.5 px-2 py-1" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          onClick={() => onCommit(i + 1)}
          className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
            current === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
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
