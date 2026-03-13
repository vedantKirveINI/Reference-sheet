/**
 * TinyTable Embed – Column header
 *
 * Displays field name + a small type icon/badge. Read-only.
 */

import { CellType } from "@/types/cell";
import type { IColumn } from "@/types/grid";
import {
  Type,
  Hash,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  CheckSquare,
  Star,
  FileText,
  List,
  CircleDot,
  ChevronDown,
  Link,
  ToggleLeft,
  SlidersHorizontal,
  Sigma,
  Eye,
  Users,
  Keyboard,
  Pen,
  Sparkles,
} from "lucide-react";
import { CurrencyFieldIcon, ZipCodeFieldIcon } from "@/components/icons/field-type-icons";

const TYPE_META: Record<
  string,
  { icon: React.ComponentType<any>; label: string }
> = {
  [CellType.String]: { icon: Type, label: "Text" },
  [CellType.LongText]: { icon: FileText, label: "Long Text" },
  [CellType.Number]: { icon: Hash, label: "Number" },
  [CellType.Currency]: { icon: CurrencyFieldIcon, label: "Currency" },
  [CellType.DateTime]: { icon: Calendar, label: "Date" },
  [CellType.CreatedTime]: { icon: Calendar, label: "Created" },
  [CellType.LastModifiedTime]: { icon: Calendar, label: "Modified" },
  [CellType.Time]: { icon: Clock, label: "Time" },
  [CellType.SCQ]: { icon: CircleDot, label: "Single Select" },
  [CellType.MCQ]: { icon: List, label: "Multi Select" },
  [CellType.DropDown]: { icon: ChevronDown, label: "Dropdown" },
  [CellType.YesNo]: { icon: ToggleLeft, label: "Yes/No" },
  [CellType.Checkbox]: { icon: CheckSquare, label: "Checkbox" },
  [CellType.Rating]: { icon: Star, label: "Rating" },
  [CellType.PhoneNumber]: { icon: Phone, label: "Phone" },
  [CellType.Address]: { icon: MapPin, label: "Address" },
  [CellType.FileUpload]: { icon: FileText, label: "File" },
  [CellType.Signature]: { icon: Pen, label: "Signature" },
  [CellType.Slider]: { icon: SlidersHorizontal, label: "Slider" },
  [CellType.OpinionScale]: { icon: SlidersHorizontal, label: "Scale" },
  [CellType.Link]: { icon: Link, label: "Link" },
  [CellType.User]: { icon: Users, label: "User" },
  [CellType.CreatedBy]: { icon: Users, label: "Created By" },
  [CellType.LastModifiedBy]: { icon: Users, label: "Modified By" },
  [CellType.Formula]: { icon: Sigma, label: "Formula" },
  [CellType.Enrichment]: { icon: Eye, label: "Enrichment" },
  [CellType.AiColumn]: { icon: Sparkles, label: "AI Column" },
  [CellType.Rollup]: { icon: Sigma, label: "Rollup" },
  [CellType.Lookup]: { icon: Eye, label: "Lookup" },
  [CellType.AutoNumber]: { icon: Hash, label: "Auto #" },
  [CellType.ID]: { icon: Hash, label: "ID" },
  [CellType.Button]: { icon: Keyboard, label: "Button" },
  [CellType.Ranking]: { icon: List, label: "Ranking" },
  [CellType.ZipCode]: { icon: ZipCodeFieldIcon, label: "Zip Code" },
  [CellType.List]: { icon: List, label: "List" },
};

const DEFAULT_META = { icon: Type, label: "Field" };

interface ColumnHeaderProps {
  column: IColumn;
}

export function ColumnHeader({ column }: ColumnHeaderProps) {
  const meta = TYPE_META[column.type] ?? DEFAULT_META;
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 select-none overflow-hidden">
      <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate text-xs font-medium text-foreground">
        {column.name}
      </span>
    </div>
  );
}
