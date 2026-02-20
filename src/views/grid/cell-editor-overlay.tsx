import { useRef, useEffect, useCallback, useState } from 'react';
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

function SelectInput({ cell, options, onCommit, onCancel }: { cell: ICell; options: string[]; onCommit: (v: any) => void; onCancel: () => void }) {
  const ref = useRef<HTMLSelectElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <select
      ref={ref}
      className="w-full h-full bg-white text-sm px-2 py-1 outline-none border-2 border-blue-500 rounded-none"
      defaultValue={(cell.data as string) ?? ''}
      onChange={(e) => onCommit(e.target.value)}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function MCQInput({ cell, options, onCommit, onCancel }: { cell: ICell; options: string[]; onCommit: (v: any) => void; onCancel: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(Array.isArray(cell.data) ? cell.data as string[] : []));

  const toggle = useCallback((opt: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt); else next.add(opt);
      return next;
    });
  }, []);

  return (
    <div
      className="bg-white border-2 border-blue-500 p-2 flex flex-wrap gap-1 overflow-auto"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={selected.has(opt)}
            onChange={() => toggle(opt)}
            className="h-3 w-3"
          />
          {opt}
        </label>
      ))}
      <button
        className="ml-auto text-xs text-blue-600 hover:text-blue-700 px-2 py-0.5"
        onClick={() => onCommit(Array.from(selected))}
      >
        Done
      </button>
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

function PhoneNumberInput({ cell, onCommit, onCancel }: EditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      type="tel"
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

function AddressInput({ cell, onCommit, onCancel }: EditorProps) {
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
      editor = <SelectInput cell={cell} options={(cell as any).options?.options ?? []} onCommit={onCommit} onCancel={onCancel} />;
      break;
    case CellType.DropDown: {
      const opts = ((cell as any).options?.options as any[] ?? []).map((o: any) => typeof o === 'string' ? o : o.label);
      editor = <SelectInput cell={cell} options={opts} onCommit={onCommit} onCancel={onCancel} />;
      break;
    }
    case CellType.MCQ:
      editor = <MCQInput cell={cell} options={(cell as any).options?.options ?? []} onCommit={onCommit} onCancel={onCancel} />;
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
