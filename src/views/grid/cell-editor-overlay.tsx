import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CellType, ICell, IColumn } from '@/types';
import { getFileUploadUrl, uploadFileToPresignedUrl, confirmFileUpload, updateLinkCell, searchForeignRecords, triggerButtonClick } from '@/services/api';
import type { ICurrencyData, IPhoneNumberData, IAddressData } from '@/types';
import { AddressEditor } from '@/components/editors/address-editor';
import { LinkEditor } from '@/components/editors/link-editor';
import { ButtonEditor } from '@/components/editors/button-editor';
import type { ILinkRecord, IButtonOptions } from '@/types/cell';
import { useGridViewStore } from '@/stores/grid-view-store';

interface CellEditorOverlayProps {
  cell: ICell;
  column: IColumn;
  rect: { x: number; y: number; width: number; height: number };
  onCommit: (value: any) => void;
  onCancel: () => void;
  baseId?: string;
  tableId?: string;
  recordId?: string;
  zoomScale?: number;
  containerWidth?: number;
  containerHeight?: number;
  overlayRef?: React.RefObject<HTMLDivElement | null>;
}

type EditorProps = { cell: ICell; onCommit: (v: any) => void; onCancel: () => void };

function StringInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      type="text"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
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
  useEffect(() => { ref.current?.focus({ preventScroll: true }); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      type="number"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none text-right"
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

function DateTimeInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);

  const currentValue = cell.data as string ?? '';
  const dateValue = currentValue ? new Date(currentValue).toISOString().slice(0, 16) : '';

  return (
    <input
      ref={ref}
      type="datetime-local"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
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
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return (
    <input
      ref={ref}
      type="time"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
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
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); ref.current?.select(); }, []);

  const currencyCode = existing?.currencyCode || 'USD';
  const currencySymbol = existing?.currencySymbol || '$';
  const countryCode = existing?.countryCode || 'US';

  const commit = (raw: string) => {
    const sanitized = raw.replace(/[^0-9.]/g, '');
    if (!sanitized) { onCommit(null); return; }
    onCommit({ countryCode, currencyCode, currencySymbol, currencyValue: sanitized });
  };

  return (
    <div className="w-full h-full flex items-center bg-background border-2 border-[#39A380] rounded-none">
      <span className="pl-3 text-sm text-muted-foreground select-none shrink-0">{currencySymbol}</span>
      <input
        ref={ref}
        type="text"
        className="flex-1 h-full bg-transparent text-foreground text-sm px-1 py-1 outline-none text-right pr-3"
        defaultValue={existing?.currencyValue ?? ''}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
          if (e.key === 'Escape') onCancel();
        }}
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

function SliderInput({ cell, onCommit, onCancel }: EditorProps) {
  const [value, setValue] = useState(typeof cell.data === 'number' ? cell.data : 0);
  return (
    <div
      className="bg-popover text-popover-foreground border-2 border-[#39A380] flex items-center gap-2 px-3 py-1"
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
      <span className="text-sm text-muted-foreground w-8 text-right">{value}%</span>
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
  const [countryNumber, setCountryNumber] = useState(existing?.countryNumber || '1');
  const [phoneNumber, setPhoneNumber] = useState(existing?.phoneNumber || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }, []);

  const commonCodes = [
    { code: 'US', number: '1', label: 'US +1' },
    { code: 'GB', number: '44', label: 'UK +44' },
    { code: 'CA', number: '1', label: 'CA +1' },
    { code: 'AU', number: '61', label: 'AU +61' },
    { code: 'DE', number: '49', label: 'DE +49' },
    { code: 'FR', number: '33', label: 'FR +33' },
    { code: 'IN', number: '91', label: 'IN +91' },
    { code: 'JP', number: '81', label: 'JP +81' },
    { code: 'CN', number: '86', label: 'CN +86' },
    { code: 'BR', number: '55', label: 'BR +55' },
  ];

  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) return;
      const val = phoneNumber.trim();
      onCommit(val ? { countryCode, countryNumber, phoneNumber: val } : null);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const val = phoneNumber.trim();
      onCommit(val ? { countryCode, countryNumber, phoneNumber: val } : null);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div ref={containerRef} className="flex items-center bg-background border-2 border-[#39A380] rounded-sm overflow-visible" onBlur={handleBlur}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowCodes(!showCodes)}
          className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-accent transition-colors h-full whitespace-nowrap"
        >
          <span className="text-muted-foreground">+{countryNumber}</span>
          <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 12 12" fill="currentColor"><path d="M3 5l3 3 3-3z"/></svg>
        </button>
        {showCodes && (
          <div className="absolute top-full left-0 mt-0.5 bg-popover border border-border rounded shadow-lg z-50 w-32 max-h-48 overflow-y-auto">
            {commonCodes.map(c => (
              <button
                key={c.code + c.number}
                onClick={() => { setCountryCode(c.code); setCountryNumber(c.number); setShowCodes(false); requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true })); }}
                className={`w-full text-left px-2 py-1.5 text-sm hover:bg-accent transition-colors ${countryCode === c.code ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="w-px h-5 bg-border shrink-0" />
      <input
        ref={inputRef}
        type="tel"
        value={phoneNumber}
        onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9\s\-()]/g, ''))}
        onKeyDown={handleKeyDown}
        placeholder="Phone number"
        className="flex-1 px-2 py-1 text-sm bg-transparent outline-none min-w-[120px] text-foreground"
      />
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

function ZipCodeInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); ref.current?.select(); }, []);
  const raw = cell.data;
  const cellData = raw && typeof raw === 'object' ? raw as { countryCode?: string; zipCode?: string } : typeof raw === 'string' ? { countryCode: '', zipCode: raw } : null;
  const initialValue = cellData?.zipCode ?? '';
  const countryCode = cellData?.countryCode ?? '';
  const commitZip = (val: string) => {
    const trimmed = val.trim();
    onCommit(trimmed ? { countryCode, zipCode: trimmed } : null);
  };
  return (
    <input
      ref={ref}
      type="text"
      className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
      defaultValue={initialValue}
      onBlur={(e) => commitZip(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commitZip((e.target as HTMLInputElement).value);
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
        className="w-full h-full bg-background text-foreground text-sm px-3 py-1 outline-none border-2 border-[#39A380] rounded-none"
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
    <div className="bg-popover text-popover-foreground border-2 border-[#39A380] rounded shadow-lg p-2 min-w-[200px]" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div className="text-xs font-medium text-muted-foreground mb-1.5">Drag to reorder</div>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {items.map((item, i) => (
          <div
            key={`${item}-${i}`}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={() => { if (dragIndex !== null && dragIndex !== i) moveItem(dragIndex, i); setDragIndex(null); }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-grab active:cursor-grabbing transition-colors ${
              dragIndex === i ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-accent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">{i + 1}</span>
            <span className="flex-1">{item}</span>
            <span className="text-muted-foreground/50 text-xs">⋮⋮</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-1 mt-2">
        <button onClick={onCancel} className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
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
    <div className="bg-popover text-popover-foreground border-2 border-[#39A380] flex items-center gap-0.5 px-2 py-1" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          onClick={() => onCommit(i + 1)}
          className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
            current === i + 1 ? 'bg-emerald-500 text-white' : 'bg-muted hover:bg-accent'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

export function CellEditorOverlay({ cell, column, rect, onCommit, onCancel, baseId, tableId, recordId, zoomScale = 1, containerWidth, containerHeight, overlayRef }: CellEditorOverlayProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const setRefs = useCallback((el: HTMLDivElement | null) => {
    (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (overlayRef) {
      (overlayRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  }, [overlayRef]);
  const minWidth = Math.max(rect.width, 120);
  const minHeight = Math.max(rect.height, 32);

  let clampedX = rect.x;
  let clampedY = rect.y;
  if (containerWidth != null) {
    const maxX = containerWidth / zoomScale - minWidth;
    clampedX = Math.max(0, Math.min(clampedX, maxX));
  }
  if (containerHeight != null) {
    const maxY = containerHeight / zoomScale - minHeight;
    clampedY = Math.max(0, Math.min(clampedY, maxY));
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

  const style: React.CSSProperties = {
    width: minWidth,
    minHeight: minHeight,
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
          } catch (err) {
            console.error('Failed to update link cell:', err);
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
          } catch (err) {
            console.error('Button click failed:', err);
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
      editor = <StringInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
  }

  return (
    <div ref={setRefs} style={wrapperStyle}>
      <div style={style}>{editor}</div>
    </div>
  );
}
