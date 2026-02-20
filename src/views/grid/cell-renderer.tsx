import { useRef, useEffect, useCallback } from "react";
import { CellType, ICell, IColumn } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Square, Lock, Star, Sparkles, Paperclip } from "lucide-react";
import { formatCurrency, formatPhoneNumber, formatAddress } from "@/lib/formatters";
import { getFlagUrl } from "@/lib/countries";

const CHIP_COLORS = [
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
];

function getChipColor(value: string, options: string[]) {
  const idx = options.indexOf(value);
  return CHIP_COLORS[idx >= 0 ? idx % CHIP_COLORS.length : 0];
}

interface CellRendererProps {
  cell: ICell;
  column: IColumn;
  isActive: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: (value: any) => void;
}

function StringEditor({ cell, onEndEdit }: { cell: ICell; onEndEdit: (v: any) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  return (
    <input
      ref={inputRef}
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-none"
      defaultValue={cell.data as string ?? ""}
      onBlur={(e) => onEndEdit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEndEdit((e.target as HTMLInputElement).value);
        if (e.key === "Escape") onEndEdit(cell.data);
      }}
    />
  );
}

function NumberEditor({ cell, onEndEdit }: { cell: ICell; onEndEdit: (v: any) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  return (
    <input
      ref={inputRef}
      type="number"
      className="w-full h-full bg-white text-sm px-3 py-1 outline-none border-none text-right"
      defaultValue={cell.data as number ?? ""}
      onBlur={(e) => onEndEdit(e.target.value ? Number(e.target.value) : null)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEndEdit((e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : null);
        if (e.key === "Escape") onEndEdit(cell.data);
      }}
    />
  );
}

function SelectEditor({ cell, options, onEndEdit }: { cell: ICell; options: string[]; onEndEdit: (v: any) => void }) {
  const selectRef = useRef<HTMLSelectElement>(null);
  useEffect(() => { selectRef.current?.focus(); }, []);
  return (
    <select
      ref={selectRef}
      className="w-full h-full bg-white text-sm px-2 py-1 outline-none border-none"
      defaultValue={(cell.data as string) ?? ""}
      onChange={(e) => onEndEdit(e.target.value)}
      onBlur={(e) => onEndEdit(e.target.value)}
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function MCQEditor({ cell, options, onEndEdit }: { cell: ICell; options: string[]; onEndEdit: (v: any) => void }) {
  const selected = new Set(Array.isArray(cell.data) ? cell.data as string[] : []);
  const toggle = useCallback((opt: string) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onEndEdit(Array.from(next));
  }, [selected, onEndEdit]);

  return (
    <div className="flex flex-wrap gap-1 px-2 py-1 bg-white">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={selected.has(opt)}
            onChange={() => toggle(opt)}
            className="h-3 w-3"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function Chip({ value, options }: { value: string; options: string[] }) {
  const color = getChipColor(value, options);
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", color.bg, color.text)}>
      {value}
    </span>
  );
}

export function CellRenderer({ cell, isEditing, onEndEdit }: CellRendererProps) {
  if (isEditing) {
    switch (cell.type) {
      case CellType.String:
        return <StringEditor cell={cell} onEndEdit={onEndEdit} />;
      case CellType.Number:
        return <NumberEditor cell={cell} onEndEdit={onEndEdit} />;
      case CellType.SCQ:
        return <SelectEditor cell={cell} options={cell.options.options} onEndEdit={(v) => onEndEdit(v)} />;
      case CellType.DropDown: {
        const opts = (cell.options.options as any[]).map((o: any) => typeof o === "string" ? o : o.label);
        return <SelectEditor cell={cell} options={opts} onEndEdit={(v) => onEndEdit(v)} />;
      }
      case CellType.MCQ:
        return <MCQEditor cell={cell} options={cell.options.options} onEndEdit={onEndEdit} />;
      case CellType.YesNo:
        onEndEdit(cell.data === "Yes" ? "No" : "Yes");
        return null;
      default:
        return <StringEditor cell={cell} onEndEdit={onEndEdit} />;
    }
  }

  switch (cell.type) {
    case CellType.String:
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center">
          {cell.displayData}
        </div>
      );

    case CellType.Number:
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center justify-end tabular-nums">
          {cell.displayData}
        </div>
      );

    case CellType.SCQ:
      return (
        <div className="px-3 py-1.5 h-full flex items-center overflow-hidden">
          {cell.data && <Chip value={cell.data} options={cell.options.options} />}
        </div>
      );

    case CellType.MCQ:
      return (
        <div className="px-2 py-1 h-full flex items-center gap-1 overflow-hidden">
          {(cell.data as string[]).map((v) => (
            <Chip key={v} value={v} options={cell.options.options} />
          ))}
        </div>
      );

    case CellType.DropDown: {
      const display = cell.displayData;
      const opts = (cell.options.options as any[]).map((o: any) => typeof o === "string" ? o : o.label);
      return (
        <div className="px-3 py-1.5 h-full flex items-center overflow-hidden">
          {display && <Chip value={display} options={opts} />}
        </div>
      );
    }

    case CellType.YesNo:
      return (
        <div className="px-3 py-1.5 h-full flex items-center justify-center">
          {cell.data === "Yes" ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Square className="h-4 w-4 text-gray-300" />
          )}
        </div>
      );

    case CellType.DateTime:
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center">
          {cell.displayData}
        </div>
      );

    case CellType.CreatedTime:
      return (
        <div className="truncate text-sm text-gray-500 px-3 py-1.5 h-full flex items-center gap-1">
          <Lock className="h-3 w-3 text-gray-400 shrink-0" />
          <span className="truncate">{cell.displayData}</span>
        </div>
      );

    case CellType.Currency: {
      const currData = cell.data as any;
      const formatted = currData ? formatCurrency(currData) : cell.displayData;
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center gap-1.5">
          {currData?.countryCode && (
            <img src={getFlagUrl(currData.countryCode)} alt="" className="w-5 h-[15px] object-cover shrink-0" loading="lazy" />
          )}
          <span className="truncate tabular-nums">{formatted}</span>
        </div>
      );
    }

    case CellType.PhoneNumber: {
      const phoneData = cell.data as any;
      const formatted = phoneData ? formatPhoneNumber(phoneData) : cell.displayData;
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center gap-1.5">
          {phoneData?.countryCode && (
            <img src={getFlagUrl(phoneData.countryCode)} alt="" className="w-5 h-[15px] object-cover shrink-0" loading="lazy" />
          )}
          <span className="truncate">{formatted}</span>
        </div>
      );
    }

    case CellType.Address: {
      const addrData = cell.data as any;
      const formatted = addrData ? formatAddress(addrData) : cell.displayData;
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center">
          {formatted}
        </div>
      );
    }

    case CellType.Signature:
      return (
        <div className="px-3 py-1.5 h-full flex items-center">
          {cell.data ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Signed
            </span>
          ) : (
            <span className="text-sm text-gray-400 italic">Not signed</span>
          )}
        </div>
      );

    case CellType.Slider: {
      const val = (cell.data as number) ?? 0;
      const max = (cell as any).options?.maxValue ?? 100;
      const pct = Math.min(100, Math.max(0, (val / max) * 100));
      return (
        <div className="px-3 py-1.5 h-full flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 tabular-nums shrink-0">{cell.displayData}</span>
        </div>
      );
    }

    case CellType.FileUpload: {
      const files = Array.isArray(cell.data) ? cell.data : [];
      const count = files.length;
      return (
        <div className="px-3 py-1.5 h-full flex items-center gap-1">
          {count > 0 ? (
            <>
              <Paperclip className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">{count} {count === 1 ? "file" : "files"}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">No files</span>
          )}
        </div>
      );
    }

    case CellType.Time:
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center">
          {cell.displayData}
        </div>
      );

    case CellType.Ranking: {
      const items = Array.isArray(cell.data) ? cell.data : [];
      return (
        <div className="px-2 py-1 h-full flex items-center gap-1 overflow-hidden">
          {(items as any[]).map((item: any, idx: number) => (
            <span
              key={item.id ?? idx}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 whitespace-nowrap"
            >
              {idx + 1}. {item.label}
            </span>
          ))}
        </div>
      );
    }

    case CellType.Rating: {
      const rating = (cell.data as number) ?? 0;
      const maxRating = (cell as any).options?.maxRating ?? 5;
      return (
        <div className="px-3 py-1.5 h-full flex items-center gap-0.5">
          {Array.from({ length: maxRating }, (_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
              )}
            />
          ))}
        </div>
      );
    }

    case CellType.OpinionScale: {
      const val = (cell.data as number) ?? 0;
      const max = (cell as any).options?.maxValue ?? 10;
      return (
        <div className="px-3 py-1.5 h-full flex items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-violet-100 text-violet-700 tabular-nums">
            {val}/{max}
          </span>
        </div>
      );
    }

    case CellType.Formula:
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center italic">
          {cell.displayData}
        </div>
      );

    case CellType.List: {
      const items = Array.isArray(cell.data) ? cell.data : [];
      return (
        <div className="px-2 py-1 h-full flex items-center gap-1 overflow-hidden">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    case CellType.Enrichment:
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{cell.displayData}</span>
        </div>
      );

    default:
      return (
        <div className="truncate text-sm text-gray-900 px-3 py-1.5 h-full flex items-center">
          {cell.displayData || ""}
        </div>
      );
  }
}
