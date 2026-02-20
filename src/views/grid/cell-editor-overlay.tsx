import { useRef, useEffect, useCallback, useState } from 'react';
import { CellType, ICell, IColumn } from '@/types';

interface CellEditorOverlayProps {
  cell: ICell;
  column: IColumn;
  rect: { x: number; y: number; width: number; height: number };
  onCommit: (value: any) => void;
  onCancel: () => void;
}

function StringInput({ cell, onCommit, onCancel }: { cell: ICell; onCommit: (v: any) => void; onCancel: () => void }) {
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

function NumberInput({ cell, onCommit, onCancel }: { cell: ICell; onCommit: (v: any) => void; onCancel: () => void }) {
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
    default:
      editor = <StringInput cell={cell} onCommit={onCommit} onCancel={onCancel} />;
      break;
  }

  return <div style={style}>{editor}</div>;
}
