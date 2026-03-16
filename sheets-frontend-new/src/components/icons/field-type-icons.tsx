import * as React from "react";
import { CellType } from "@/types";
import {
  Calendar,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Clock,
  Eye,
  FileText,
  Gauge,
  Hash,
  Keyboard,
  Link,
  List,
  ListOrdered,
  Mail,
  MapPin,
  PenTool,
  Phone,
  Paperclip,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  Star,
  ToggleLeft,
  Type,
  Users,
} from "lucide-react";
import { FIELD_TYPE_ICON_IDS, type FieldIconId } from "@/constants/field-type-icon-ids";
import { CELL_TYPE_CDN_ICONS } from "@/constants/question-type-cdn-icons";

type ImgIconProps = React.ComponentProps<"img">;

const ICON_COMPONENTS: Record<FieldIconId, React.ComponentType<any>> = {
  text: Type,
  longText: FileText,
  number: Hash,
  currency: Type,
  dateTime: Calendar,
  createdTime: CalendarClock,
  lastModifiedTime: Calendar,
  time: Clock,
  singleChoice: CircleDot,
  multiChoice: List,
  dropdown: ChevronDown,
  yesNo: ToggleLeft,
  checkbox: CheckSquare,
  email: Mail,
  rating: Star,
  ranking: ListOrdered,
  phone: Phone,
  address: MapPin,
  file: Paperclip,
  signature: PenTool,
  slider: SlidersHorizontal,
  opinionScale: Gauge,
  link: Link,
  user: Users,
  createdBy: Users,
  lastModifiedBy: Users,
  formula: Sigma,
  enrichment: Eye,
  ai: Sparkles,
  rollup: Sigma,
  lookup: Eye,
  autoNumber: Hash,
  id: Hash,
  button: Keyboard,
  list: List,
  zipCode: Hash,
};

function createCdnIcon(src: string): React.ComponentType<ImgIconProps> {
  return function CdnIcon({ alt, className, ...rest }: ImgIconProps) {
    return (
      <img
        src={src}
        alt={alt ?? "Field icon"}
        className={className}
        {...rest}
      />
    );
  };
}

// Named export kept for legacy callers (e.g. FormulaEditorPopup)
export const CurrencyFieldIcon =
  CELL_TYPE_CDN_ICONS[CellType.Currency]
    ? createCdnIcon(CELL_TYPE_CDN_ICONS[CellType.Currency]!)
    : (Type as React.ComponentType<any>);

export const ZipCodeFieldIcon =
  CELL_TYPE_CDN_ICONS[CellType.ZipCode]
    ? createCdnIcon(CELL_TYPE_CDN_ICONS[CellType.ZipCode]!)
    : (Type as React.ComponentType<any>);

export function getFieldIcon(type: CellType | undefined): React.ComponentType<any> {
  if (!type) {
    return Type;
  }

  const cdnSrc = CELL_TYPE_CDN_ICONS[type];
  if (cdnSrc) {
    return createCdnIcon(cdnSrc);
  }

  const iconId = FIELD_TYPE_ICON_IDS[type];
  if (!iconId) {
    return Type;
  }
  return ICON_COMPONENTS[iconId] ?? Type;
}

