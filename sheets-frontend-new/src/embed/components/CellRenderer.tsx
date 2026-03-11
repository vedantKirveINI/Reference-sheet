/**
 * TinyTable Embed – Read-only cell renderer
 *
 * Renders cell values with type-appropriate formatting.
 * Lightweight alternative to the full grid canvas cell painters.
 */

import { CellType, type ICell } from "@/types/cell";
import {
  Star,
  Check,
  X,
  FileText,
  Paperclip,
  Link as LinkIcon,
  User,
} from "lucide-react";

interface CellRendererProps {
  cell: ICell;
}

// Chip colors for choice fields – cycles through a palette
const CHIP_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
];

function chipColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CHIP_COLORS[Math.abs(hash) % CHIP_COLORS.length];
}

export function CellRenderer({ cell }: CellRendererProps) {
  switch (cell.type) {
    // --- Text types ---
    case CellType.String:
    case CellType.LongText:
      return <span className="truncate">{cell.displayData}</span>;

    // --- Number ---
    case CellType.Number:
      return (
        <span className="truncate tabular-nums text-right w-full block">
          {cell.displayData}
        </span>
      );

    // --- Currency ---
    case CellType.Currency:
      return (
        <span className="truncate tabular-nums text-right w-full block">
          {cell.displayData}
        </span>
      );

    // --- Rating ---
    case CellType.Rating: {
      const count = cell.data != null ? Number(cell.data) : 0;
      const max = (cell as any).options?.maxRating ?? 5;
      return (
        <span className="flex items-center gap-px">
          {Array.from({ length: max }, (_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
            />
          ))}
        </span>
      );
    }

    // --- Checkbox ---
    case CellType.Checkbox:
      return cell.data ? (
        <Check className="w-4 h-4 text-brand-600" />
      ) : (
        <span className="w-4 h-4 rounded border border-gray-300 block" />
      );

    // --- Yes/No ---
    case CellType.YesNo:
      if (!cell.data) return <span className="text-muted-foreground">—</span>;
      return cell.data === "Yes" ? (
        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
          <Check className="w-3.5 h-3.5" /> Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
          <X className="w-3.5 h-3.5" /> No
        </span>
      );

    // --- Single choice (SCQ) ---
    case CellType.SCQ:
      if (!cell.data) return <span className="text-muted-foreground">—</span>;
      return (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${chipColor(String(cell.data))}`}
        >
          {cell.displayData}
        </span>
      );

    // --- Multiple choice (MCQ) ---
    case CellType.MCQ: {
      const items = Array.isArray(cell.data) ? cell.data : [];
      if (items.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="flex items-center gap-1 flex-wrap">
          {items.map((v, i) => (
            <span
              key={i}
              className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${chipColor(String(v))}`}
            >
              {String(v)}
            </span>
          ))}
        </span>
      );
    }

    // --- Dropdown ---
    case CellType.DropDown: {
      const items = Array.isArray(cell.data) ? cell.data : cell.data ? [cell.data] : [];
      if (items.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="flex items-center gap-1 flex-wrap">
          {items.map((v, i) => {
            const label = typeof v === "object" && v !== null ? (v as any).label : String(v);
            return (
              <span
                key={i}
                className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${chipColor(label)}`}
              >
                {label}
              </span>
            );
          })}
        </span>
      );
    }

    // --- Date / Time ---
    case CellType.DateTime:
    case CellType.CreatedTime:
    case CellType.LastModifiedTime:
      return (
        <span className="truncate text-muted-foreground tabular-nums">
          {cell.displayData}
        </span>
      );

    case CellType.Time:
      return (
        <span className="truncate tabular-nums">{cell.displayData}</span>
      );

    // --- Phone ---
    case CellType.PhoneNumber:
      return <span className="truncate tabular-nums">{cell.displayData}</span>;

    // --- File upload ---
    case CellType.FileUpload: {
      const files = Array.isArray(cell.data) ? cell.data : [];
      if (files.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Paperclip className="w-3 h-3" />
          <span className="text-xs">{files.length} file{files.length > 1 ? "s" : ""}</span>
        </span>
      );
    }

    // --- Link (related records) ---
    case CellType.Link: {
      const records = Array.isArray(cell.data) ? cell.data : [];
      if (records.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="flex items-center gap-1 text-brand-600">
          <LinkIcon className="w-3 h-3" />
          <span className="text-xs">{records.length} record{records.length > 1 ? "s" : ""}</span>
        </span>
      );
    }

    // --- User ---
    case CellType.User:
    case CellType.CreatedBy:
    case CellType.LastModifiedBy: {
      const users = Array.isArray(cell.data) ? cell.data : cell.data ? [cell.data] : [];
      if (users.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="flex items-center gap-1">
          <User className="w-3 h-3 text-muted-foreground" />
          <span className="truncate text-xs">
            {users.map((u: any) => u.name || u.email || "User").join(", ")}
          </span>
        </span>
      );
    }

    // --- Slider / Opinion Scale ---
    case CellType.Slider:
    case CellType.OpinionScale:
      return (
        <span className="truncate tabular-nums">{cell.displayData}</span>
      );

    // --- Formula / Enrichment / Rollup / Lookup / AutoNumber / ID ---
    case CellType.Formula:
    case CellType.Enrichment:
    case CellType.Rollup:
    case CellType.Lookup:
    case CellType.AutoNumber:
    case CellType.ID:
      return (
        <span className="truncate text-muted-foreground italic">
          {cell.displayData || "—"}
        </span>
      );

    // --- Fallback ---
    default:
      return <span className="truncate">{cell.displayData ?? ""}</span>;
  }
}
