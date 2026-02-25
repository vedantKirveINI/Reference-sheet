import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CellType } from "@/types";
import { useFieldsStore } from "@/stores";
import { getForeignTableFields } from "@/services/api";
import { ENRICHMENT_TYPES, getEnrichmentTypeByKey } from '@/config/enrichment-mapping';
import type { EnrichmentType } from '@/config/enrichment-mapping';
import {
  Check,
  Type,
  Hash,
  CircleDot,
  CheckSquare,
  ChevronDownCircle,
  ToggleLeft,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  MapPin,
  PenTool,
  SlidersHorizontal,
  Paperclip,
  Star,
  ListOrdered,
  ThumbsUp,
  Code,
  List,
  Sparkles,
  Mail,
  Plus,
  X,
  Search,
  Link2,
  Users,
  UserCheck,
  UserCog,
  Timer,
  Binary,
  MousePointerClick,
  CheckCircle,
  Sigma,
  Eye,
  Building2,
  User,
  AtSign,
  ChevronDown,
  ChevronRight,
  Pencil,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FieldModalData {
  mode: "create" | "edit";
  fieldName: string;
  fieldType: CellType;
  fieldId?: string;
  /** Numeric field id for update_field API. */
  fieldRawId?: number;
  options?: any;
  description?: string;
  /** When creating a field from "Insert before/after", the order to send to the API. */
  insertOrder?: number;
}

interface FieldModalProps {
  data: FieldModalData | null;
  onSave: (data: FieldModalData) => void;
  onCancel: () => void;
  tables?: Array<{ id: string; name: string }>;
  currentTableId?: string;
}

interface FieldTypeOption {
  value: CellType;
  label: string;
  icon: LucideIcon;
  description?: string;
}

interface FieldTypeCategory {
  label: string;
  highlight?: boolean;
  types: FieldTypeOption[];
}

const FIELD_TYPE_CATEGORIES: FieldTypeCategory[] = [
  {
    label: "AI & Enrichment",
    highlight: true,
    types: [
      {
        value: CellType.Enrichment,
        label: "Enrichment",
        icon: Sparkles,
        description: "Auto-enrich data with AI",
      },
      {
        value: CellType.Formula,
        label: "Formula",
        icon: Code,
        description: "Computed fields",
      },
    ],
  },
  {
    label: "Basic",
    types: [
      { value: CellType.String, label: "Text", icon: Type },
      { value: CellType.Number, label: "Number", icon: Hash },
      { value: CellType.YesNo, label: "Yes/No", icon: ToggleLeft },
    ],
  },
  {
    label: "Select",
    types: [
      { value: CellType.SCQ, label: "Single Select", icon: CircleDot },
      { value: CellType.MCQ, label: "Multiple Select", icon: CheckSquare },
      { value: CellType.DropDown, label: "Dropdown", icon: ChevronDownCircle },
    ],
  },
  {
    label: "Date & Time",
    types: [
      { value: CellType.DateTime, label: "Date", icon: Calendar },
      { value: CellType.CreatedTime, label: "Created Time", icon: Clock },
      { value: CellType.Time, label: "Time", icon: Clock },
    ],
  },
  {
    label: "Contact & Location",
    types: [
      { value: CellType.PhoneNumber, label: "Phone", icon: Phone },
      { value: CellType.Address, label: "Address", icon: MapPin },
      { value: CellType.ZipCode, label: "Zip Code", icon: Mail },
    ],
  },
  {
    label: "Media",
    types: [
      { value: CellType.FileUpload, label: "File Upload", icon: Paperclip },
      { value: CellType.Signature, label: "Signature", icon: PenTool },
    ],
  },
  {
    label: "Links & Lookups",
    types: [
      {
        value: CellType.Link,
        label: "Link to Table",
        icon: Link2,
        description: "Link records between tables",
      },
      {
        value: CellType.Lookup,
        label: "Lookup",
        icon: Eye,
        description: "Look up values from linked records",
      },
      {
        value: CellType.Rollup,
        label: "Rollup",
        icon: Sigma,
        description: "Aggregate linked record values",
      },
    ],
  },
  {
    label: "People & System",
    types: [
      {
        value: CellType.User,
        label: "User",
        icon: Users,
        description: "Assign users to records",
      },
      {
        value: CellType.CreatedBy,
        label: "Created By",
        icon: UserCheck,
        description: "Auto-set record creator",
      },
      {
        value: CellType.LastModifiedBy,
        label: "Last Modified By",
        icon: UserCog,
        description: "Auto-set last editor",
      },
      {
        value: CellType.LastModifiedTime,
        label: "Last Modified Time",
        icon: Timer,
        description: "Auto-set update time",
      },
      {
        value: CellType.AutoNumber,
        label: "Auto Number",
        icon: Binary,
        description: "Auto-incrementing number",
      },
    ],
  },
  {
    label: "Advanced",
    types: [
      { value: CellType.Checkbox, label: "Checkbox", icon: CheckCircle },
      {
        value: CellType.Button,
        label: "Button",
        icon: MousePointerClick,
        description: "Clickable action button",
      },
      { value: CellType.Currency, label: "Currency", icon: DollarSign },
      { value: CellType.Slider, label: "Slider", icon: SlidersHorizontal },
      { value: CellType.Rating, label: "Rating", icon: Star },
      { value: CellType.Ranking, label: "Ranking", icon: ListOrdered },
      { value: CellType.OpinionScale, label: "Opinion Scale", icon: ThumbsUp },
      { value: CellType.List, label: "List", icon: List },
    ],
  },
];

interface ChoiceOptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

function ChoiceOptionsEditor({ options, onChange }: ChoiceOptionsEditorProps) {
  const handleAdd = () => {
    onChange([...options, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div>
      <span className="text-xs text-muted-foreground mb-1 block">Options</span>
      <div className="space-y-1.5">
        {options.map((opt, index) => (
          <div key={index} className="flex items-center gap-1">
            <Input
              value={opt}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="h-7 text-sm flex-1"
              aria-label={`Option ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1 py-0.5"
        >
          <Plus className="h-3 w-3" />
          <span>Add option</span>
        </button>
      </div>
    </div>
  );
}

const CURRENCY_SYMBOLS = ["$", "€", "£", "¥", "₹", "₩", "₽", "CHF", "A$", "C$"];

function getFieldTypeLabel(cellType: CellType): string {
  for (const cat of FIELD_TYPE_CATEGORIES) {
    const found = cat.types.find((t) => t.value === cellType);
    if (found) return found.label;
  }
  return String(cellType);
}

const ENTITY_TYPE_ICONS: Record<string, LucideIcon> = {
  company: Building2,
  person: User,
  email: AtSign,
};

interface EnrichmentSidePanelProps {
  enrichmentEntityType: string;
  setEnrichmentEntityType: (v: string) => void;
  selectedEnrichmentType: EnrichmentType | undefined;
  enrichmentIdentifiers: Record<string, string>;
  setEnrichmentIdentifiers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  enrichmentOutputs: Record<string, boolean>;
  setEnrichmentOutputs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  enrichmentAutoUpdate: boolean;
  setEnrichmentAutoUpdate: (v: boolean) => void;
  allColumns: Array<any>;
  flipToLeft: boolean;
}

function EnrichmentSidePanel({
  enrichmentEntityType,
  setEnrichmentEntityType,
  selectedEnrichmentType,
  enrichmentIdentifiers,
  setEnrichmentIdentifiers,
  enrichmentOutputs,
  setEnrichmentOutputs,
  enrichmentAutoUpdate,
  setEnrichmentAutoUpdate,
  allColumns,
  flipToLeft,
}: EnrichmentSidePanelProps) {
  return (
    <div
      className="absolute top-0 z-50 w-72 rounded-xl border border-purple-200/60 dark:border-purple-800/40 bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-2xl shadow-purple-500/5 transition-all duration-300 ease-out animate-in fade-in-0 slide-in-from-left-2"
      style={flipToLeft ? { right: '100%', marginRight: 6 } : { left: '100%', marginLeft: 6 }}
    >
      <div className="p-4 border-b border-purple-100/60 dark:border-purple-900/40 bg-gradient-to-r from-purple-500/[0.07] via-blue-500/[0.04] to-purple-500/[0.07] relative overflow-hidden">
        <div className="absolute top-1 right-2 opacity-[0.07]">
          <Sparkles className="h-12 w-12 text-purple-400" />
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="relative">
            <Sparkles className="h-4 w-4 text-purple-500 animate-float" />
          </div>
          <h4 className="text-sm font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 dark:from-purple-400 dark:via-purple-300 dark:to-blue-400 bg-clip-text text-transparent">
            AI Data Enrichment
          </h4>
        </div>
        {selectedEnrichmentType && (
          <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed relative z-10">{selectedEnrichmentType.subtitle || selectedEnrichmentType.description}</p>
        )}
      </div>
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <div>
          <span className="text-xs text-muted-foreground mb-2 block font-semibold">What do you want to find?</span>
          <div className="space-y-1.5">
            {ENRICHMENT_TYPES.map(et => {
              const IconComp = ENTITY_TYPE_ICONS[et.key] || Sparkles;
              const isSelected = enrichmentEntityType === et.key;
              return (
                <button
                  key={et.key}
                  type="button"
                  onClick={() => setEnrichmentEntityType(et.key)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all duration-300 group ${
                    isSelected
                      ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50/40 dark:from-purple-950/60 dark:to-blue-950/30 dark:border-purple-500 shadow-md shadow-purple-500/10'
                      : 'border-border hover:border-purple-300/50 hover:bg-gradient-to-br hover:from-muted/60 hover:to-muted/20 dark:hover:border-purple-500/30'
                  }`}
                >
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800/70 dark:to-blue-800/50 shadow-sm shadow-purple-500/20'
                      : 'bg-muted/60 group-hover:bg-gradient-to-br group-hover:from-muted group-hover:to-muted/60'
                  }`}>
                    <IconComp className={`h-4 w-4 transition-colors duration-300 ${isSelected ? 'text-purple-600 dark:text-purple-300 animate-float' : 'text-muted-foreground group-hover:text-purple-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium block transition-colors duration-300 ${isSelected ? 'text-purple-700 dark:text-purple-200' : ''}`}>{et.label}</span>
                    <span className="text-[10px] text-muted-foreground/80 block truncate">{et.subtitle}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-purple-500 shrink-0 animate-pulse-smooth" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedEnrichmentType && (
          <>
            <div className="pt-1">
              <span className="text-xs text-muted-foreground mb-2 block font-semibold">Connect your data</span>
              <div className="space-y-3">
                {selectedEnrichmentType.inputFields.map(inp => (
                  <div key={inp.key}>
                    <span className="text-xs mb-1 block font-medium">
                      {inp.label} {inp.required && <span className="text-destructive/70 ml-0.5">*</span>}
                    </span>
                    <select
                      value={enrichmentIdentifiers[inp.key] || ""}
                      onChange={(e) => setEnrichmentIdentifiers(prev => ({ ...prev, [inp.key]: e.target.value }))}
                      className="w-full h-8 text-xs border rounded-lg px-3 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-sm hover:shadow-purple-500/5 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="">Pick a column...</option>
                      {allColumns.filter(c => c.type !== CellType.Enrichment).map(c => (
                        <option key={c.id} value={String((c as any).rawId || c.id)}>{c.name}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-muted-foreground/70 mt-0.5 block">{inp.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <span className="text-xs text-muted-foreground mb-1.5 block font-semibold">Columns to create</span>
              <div className="space-y-0.5 max-h-40 overflow-y-auto border rounded-lg p-1.5 bg-background/30 backdrop-blur-sm">
                {selectedEnrichmentType.outputFields.map(out => (
                  <label key={out.key} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-purple-50/50 dark:hover:bg-purple-950/20 cursor-pointer transition-all duration-300 group" title={out.description}>
                    <input
                      type="checkbox"
                      checked={enrichmentOutputs[out.key] ?? true}
                      onChange={(e) => setEnrichmentOutputs(prev => ({ ...prev, [out.key]: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-purple-500 cursor-pointer"
                    />
                    <span className="text-xs truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">{out.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/50 hover:border-purple-300/50 dark:hover:border-purple-500/30 hover:bg-purple-50/30 dark:hover:bg-purple-950/10 cursor-pointer transition-all duration-300 group">
              <div>
                <span className="text-xs font-medium block group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">Auto-update</span>
                <span className="text-[10px] text-muted-foreground block">Re-enrich when input data changes</span>
              </div>
              <input
                type="checkbox"
                checked={enrichmentAutoUpdate}
                onChange={(e) => setEnrichmentAutoUpdate(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-purple-500 cursor-pointer"
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

export function FieldModalContent({
  data,
  onSave,
  onCancel,
  tables,
  currentTableId,
}: FieldModalProps) {
  const { t } = useTranslation(['common']);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<CellType>(CellType.String);
  const [typeSearch, setTypeSearch] = useState("");
  const [choiceOptions, setChoiceOptions] = useState<string[]>([""]);
  const [maxRating, setMaxRating] = useState(5);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(100);
  const [isRequired, setIsRequired] = useState(false);
  const [isUnique, setIsUnique] = useState(false);
  const [linkForeignTableId, setLinkForeignTableId] = useState<string>("");
  const [linkRelationship, setLinkRelationship] = useState<string>("ManyMany");
  const [buttonLabel, setButtonLabel] = useState("Click");
  const [buttonStyle, setButtonStyle] = useState<string>("primary");
  const [buttonActionType, setButtonActionType] = useState<string>("none");
  const [buttonUrl, setButtonUrl] = useState("");
  const [buttonConfirmEnabled, setButtonConfirmEnabled] = useState(false);
  const [buttonConfirmTitle, setButtonConfirmTitle] = useState("");
  const [buttonConfirmDescription, setButtonConfirmDescription] = useState("");
  const [buttonMaxCount, setButtonMaxCount] = useState(0);
  const [lookupLinkFieldId, setLookupLinkFieldId] = useState<string>("");
  const [lookupFieldId, setLookupFieldId] = useState<string>("");
  const [lookupForeignTableId, setLookupForeignTableId] = useState<string>("");
  const [rollupExpression, setRollupExpression] = useState<string>("countall({values})");
  const [foreignTableFields, setForeignTableFields] = useState<Array<{id: string, name: string, type: string}>>([]);
  const [enrichmentEntityType, setEnrichmentEntityType] = useState<string>("");
  const [enrichmentIdentifiers, setEnrichmentIdentifiers] = useState<Record<string, string>>({});
  const [enrichmentOutputs, setEnrichmentOutputs] = useState<Record<string, boolean>>({});
  const [enrichmentAutoUpdate, setEnrichmentAutoUpdate] = useState(false);
  const [sidePanelFlipped, setSidePanelFlipped] = useState(false);
  const [typeListExpanded, setTypeListExpanded] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFormat, setDateFormat] = useState<string>('DDMMYYYY');
  const [includeTime, setIncludeTime] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedEnrichmentType = getEnrichmentTypeByKey(enrichmentEntityType);

  const allColumns = useFieldsStore((s) => s.allColumns);
  const linkFields = allColumns.filter((col) => col.type === CellType.Link);

  useEffect(() => {
    if (!lookupForeignTableId) {
      setForeignTableFields([]);
      return;
    }
    let cancelled = false;
    getForeignTableFields({ tableId: lookupForeignTableId })
      .then((res) => {
        if (cancelled) return;
        const fields = res.data?.fields || res.data || [];
        setForeignTableFields(
          fields.map((f: any) => ({
            id: String(f.id),
            name: f.name || f.dbFieldName || String(f.id),
            type: f.type || "",
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setForeignTableFields([]);
      });
    return () => { cancelled = true; };
  }, [lookupForeignTableId]);

  useEffect(() => {
    if (selectedEnrichmentType) {
      const defaults: Record<string, boolean> = {};
      selectedEnrichmentType.outputFields.forEach(f => { defaults[f.key] = true; });
      setEnrichmentOutputs(defaults);
      setEnrichmentIdentifiers({});
      if (!name && selectedEnrichmentType) {
        setName(selectedEnrichmentType.label);
      }
      if (!description && selectedEnrichmentType) {
        setDescription(selectedEnrichmentType.description);
      }
    }
  }, [enrichmentEntityType]);

  useEffect(() => {
    if (data) {
      setName(data.fieldName);
      setDescription(data.description ?? "");
      setSelectedType(data.fieldType);
      if (data.options?.options) {
        setChoiceOptions(
          Array.isArray(data.options.options)
            ? data.options.options.map((o: any) =>
                typeof o === "string" ? o : o.label || "",
              )
            : [""],
        );
      } else {
        setChoiceOptions([""]);
      }
      if (data.options?.maxRating) setMaxRating(data.options.maxRating);
      if (data.options?.currencySymbol)
        setCurrencySymbol(data.options.currencySymbol);
      if (data.options?.minValue !== undefined)
        setSliderMin(data.options.minValue);
      if (data.options?.maxValue !== undefined)
        setSliderMax(data.options.maxValue);
      if (data.options?.foreignTableId)
        setLinkForeignTableId(String(data.options.foreignTableId));
      if (data.options?.relationship)
        setLinkRelationship(data.options.relationship);
      if (data.options?.label !== undefined) setButtonLabel(data.options.label);
      if (data.options?.style) setButtonStyle(data.options.style);
      if (data.options?.actionType)
        setButtonActionType(data.options.actionType);
      if (data.options?.url) setButtonUrl(data.options.url);
      if (data.options?.maxCount !== undefined)
        setButtonMaxCount(data.options.maxCount);
      if (data.options?.confirm?.title || data.options?.confirm?.description) {
        setButtonConfirmEnabled(true);
        setButtonConfirmTitle(data.options.confirm?.title || "");
        setButtonConfirmDescription(data.options.confirm?.description || "");
      }
      if (data.options?.lookupOptions?.linkFieldId)
        setLookupLinkFieldId(String(data.options.lookupOptions.linkFieldId));
      if (data.options?.lookupOptions?.lookupFieldId)
        setLookupFieldId(String(data.options.lookupOptions.lookupFieldId));
      if (data.options?.lookupOptions?.foreignTableId)
        setLookupForeignTableId(String(data.options.lookupOptions.foreignTableId));
      if (data.options?.expression)
        setRollupExpression(data.options.expression);
      setIsRequired(data.options?.isRequired ?? false);
      setIsUnique(data.options?.isUnique ?? false);
      if (data.options?.dateFormat) setDateFormat(data.options.dateFormat);
      if (data.options?.includeTime !== undefined) setIncludeTime(data.options.includeTime);
    }
  }, [data]);

  useEffect(() => {
    const checkFlip = () => {
      if (selectedType === CellType.Enrichment && popoverRef.current) {
        const rect = popoverRef.current.getBoundingClientRect();
        const sidePanelWidth = 288 + 6;
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;
        const shouldFlip = spaceRight < sidePanelWidth && spaceLeft > sidePanelWidth;
        setSidePanelFlipped(shouldFlip);
      }
    };
    checkFlip();
    if (selectedType === CellType.Enrichment) {
      window.addEventListener('resize', checkFlip);
      return () => window.removeEventListener('resize', checkFlip);
    }
  }, [selectedType]);

  if (!data) return null;

  const mode = data.mode;
  const showChoiceConfig =
    selectedType === CellType.SCQ ||
    selectedType === CellType.MCQ ||
    selectedType === CellType.DropDown;
  const showRatingConfig = selectedType === CellType.Rating;
  const showCurrencyConfig = selectedType === CellType.Currency;
  const showSliderConfig = selectedType === CellType.Slider;
  const showLinkConfig = selectedType === CellType.Link;
  const showButtonConfig = selectedType === CellType.Button;
  const showLookupConfig = selectedType === CellType.Lookup;
  const showRollupConfig = selectedType === CellType.Rollup;
  const showEnrichmentConfig = selectedType === CellType.Enrichment && mode === 'create';
  const showDateConfig =
    selectedType === CellType.DateTime ||
    selectedType === CellType.CreatedTime ||
    selectedType === CellType.LastModifiedTime;

  const handleSave = () => {
    const result: FieldModalData = {
      mode,
      fieldName: name.trim(),
      fieldType: selectedType,
      fieldId: data.fieldId,
      description: description.trim() || undefined,
    };
    if (mode === "edit" && data.fieldRawId != null)
      result.fieldRawId = data.fieldRawId;

    if (showChoiceConfig) {
      result.options = {
        options: choiceOptions.filter((o) => o.trim() !== ""),
      };
    } else if (showRatingConfig) {
      result.options = { maxRating };
    } else if (showCurrencyConfig) {
      result.options = { currencySymbol };
    } else if (showSliderConfig) {
      result.options = { minValue: sliderMin, maxValue: sliderMax };
    } else if (showLinkConfig) {
      result.options = {
        foreignTableId: linkForeignTableId,
        relationship: linkRelationship,
      };
    } else if (showButtonConfig) {
      const btnOpts: any = {
        label: buttonLabel,
        style: buttonStyle,
        actionType: buttonActionType,
        maxCount: buttonMaxCount,
      };
      if (buttonActionType === "openUrl") {
        btnOpts.url = buttonUrl;
      }
      if (buttonConfirmEnabled) {
        btnOpts.confirm = {
          title: buttonConfirmTitle,
          description: buttonConfirmDescription,
        };
      }
      result.options = btnOpts;
    } else if (showLookupConfig) {
      result.options = {
        lookupOptions: {
          linkFieldId: lookupLinkFieldId,
          lookupFieldId: lookupFieldId,
          foreignTableId: lookupForeignTableId,
        },
      };
    } else if (showRollupConfig) {
      result.options = {
        lookupOptions: {
          linkFieldId: lookupLinkFieldId,
          lookupFieldId: lookupFieldId,
          foreignTableId: lookupForeignTableId,
        },
        expression: rollupExpression,
      };
    }

    if (!result.options) result.options = {};
    if (showDateConfig) {
      result.options.dateFormat = dateFormat;
      result.options.includeTime = includeTime;
    }
    result.options.isRequired = isRequired;
    result.options.isUnique = isUnique;

    if (showEnrichmentConfig && mode === 'create') {
      result.options = {
        ...result.options,
        __enrichmentCreate: true,
        entityType: enrichmentEntityType,
        identifier: selectedEnrichmentType?.inputFields.map(inp => {
          const selectedColId = enrichmentIdentifiers[inp.key];
          const matchedCol = selectedColId ? allColumns.find(c => String(c.rawId ?? c.id) === selectedColId) : undefined;
          return {
            key: inp.key,
            name: inp.name || inp.label || inp.key,
            type: matchedCol?.rawType || 'SHORT_TEXT',
            field_id: selectedColId ? parseInt(selectedColId) : undefined,
            dbFieldName: matchedCol?.dbFieldName || matchedCol?.id || selectedColId || '',
            required: inp.required,
          };
        }) || [],
        fieldsToEnrich: selectedEnrichmentType?.outputFields
          .filter(f => enrichmentOutputs[f.key])
          .map(f => ({
            key: f.key,
            name: f.name,
            type: f.type,
            description: f.description,
          })) || [],
        autoUpdate: enrichmentAutoUpdate,
      };
    }

    if (data.insertOrder != null) result.insertOrder = data.insertOrder;

    onSave(result);
  };

  return (
    <PopoverContent ref={popoverRef} className="w-80 p-0 relative" style={{ overflow: 'visible' }} align="start" sideOffset={4}>
      <div className="p-3 border-b">
        <h4 className="text-sm font-medium">
          {mode === "create" ? t('fieldModal.addField') : t('fieldModal.editField')}
        </h4>
      </div>
      <div className="p-3 space-y-3 max-h-[65vh] overflow-y-auto">
        <div>
          <label
            htmlFor="field-modal-field-name"
            className="text-xs text-muted-foreground mb-1 block"
          >
            {t('fieldModal.fieldName')}
          </label>
          <Input
            id="field-modal-field-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-8 text-sm"
            placeholder={t('fieldModal.enterFieldName')}
          />
        </div>
        <div>
          <label
            htmlFor="field-modal-description"
            className="text-xs text-muted-foreground mb-1 block"
          >
            {t('description')}
          </label>
          <Input
            id="field-modal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-8 text-sm"
            placeholder={t('fieldModal.optionalDescription')}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {t('fieldModal.fieldType')}
          </label>
          {mode === "edit" ? (
            <div className="h-8 flex items-center px-2 text-sm border rounded-md bg-muted/50 text-muted-foreground">
              {getFieldTypeLabel(selectedType)}
            </div>
          ) : !typeListExpanded ? (
            <button
              type="button"
              onClick={() => setTypeListExpanded(true)}
              className="w-full h-8 flex items-center gap-2 px-2 text-sm border rounded-md hover:bg-accent/50 transition-colors group"
            >
              {(() => {
                const ft = FIELD_TYPE_CATEGORIES.flatMap(c => c.types).find(t => t.value === selectedType);
                if (!ft) return <span className="text-muted-foreground">Select type...</span>;
                const IconComp = ft.icon;
                return (
                  <>
                    <IconComp className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{ft.label}</span>
                    <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                );
              })()}
            </button>
          ) : (
            <>
              <div className="relative mb-1.5">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="field-modal-type-search"
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  placeholder={t('fieldModal.searchFieldTypes')}
                  className="h-7 text-xs pl-7"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-md p-1">
                {FIELD_TYPE_CATEGORIES.map((category) => {
                  const searchLower = typeSearch.toLowerCase();
                  const filteredTypes = category.types.filter((ft) =>
                    ft.label.toLowerCase().includes(searchLower),
                  );
                  if (filteredTypes.length === 0) return null;

                  if (category.highlight) {
                    return (
                      <div
                        key={category.label}
                        className="rounded-md border border-brand-200/60 bg-gradient-to-r from-brand-50/50 to-emerald-50/50 p-1 mb-1"
                      >
                        <div className="flex items-center gap-1 px-2 pt-1 pb-0.5">
                          <Sparkles className="h-3 w-3 text-brand-500" />
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600">
                            {category.label}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {filteredTypes.map((ft) => {
                            const IconComp = ft.icon;
                            const isSelected = selectedType === ft.value;
                            return (
                              <button
                                key={ft.value}
                                type="button"
                                onClick={() => { setSelectedType(ft.value); setTimeout(() => setTypeListExpanded(false), 150); }}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-brand-100/60 ${
                                  isSelected ? "bg-brand-100/80" : ""
                                }`}
                              >
                                <IconComp className="h-4 w-4 text-brand-500" />
                                <span className="flex-1 text-left">
                                  {ft.label}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-brand-500 bg-brand-100 rounded px-1 py-0.5">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  AI
                                </span>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-brand-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={category.label}>
                      <div className="px-2 pt-2.5 pb-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {category.label}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {filteredTypes.map((ft) => {
                          const IconComp = ft.icon;
                          const isSelected = selectedType === ft.value;
                          return (
                            <button
                              key={ft.value}
                              type="button"
                              onClick={() => { setSelectedType(ft.value); setTimeout(() => setTypeListExpanded(false), 150); }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent ${
                                isSelected ? "bg-accent" : ""
                              }`}
                            >
                              <IconComp className="h-4 w-4 text-muted-foreground" />
                              <span>{ft.label}</span>
                              {isSelected && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {showChoiceConfig && (
          <ChoiceOptionsEditor
            options={choiceOptions}
            onChange={setChoiceOptions}
          />
        )}

        {showRatingConfig && (
          <div>
            <label
              htmlFor="field-modal-max-rating"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Max Rating
            </label>
            <select
              id="field-modal-max-rating"
              value={maxRating}
              onChange={(e) => setMaxRating(Number(e.target.value))}
              className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        {showCurrencyConfig && (
          <div>
            <label
              htmlFor="field-modal-currency-symbol"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Currency Symbol
            </label>
            <select
              id="field-modal-currency-symbol"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            >
              {CURRENCY_SYMBOLS.map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
          </div>
        )}

        {showSliderConfig && (
          <div className="space-y-2">
            <div>
              <label
                htmlFor="field-modal-slider-min"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Min Value
              </label>
              <Input
                id="field-modal-slider-min"
                type="number"
                value={sliderMin}
                onChange={(e) => setSliderMin(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="field-modal-slider-max"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Max Value
              </label>
              <Input
                id="field-modal-slider-max"
                type="number"
                value={sliderMax}
                onChange={(e) => setSliderMax(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}

        {showDateConfig && (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="field-modal-date-format"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Date Format
              </label>
              <select
                id="field-modal-date-format"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="DDMMYYYY">DD/MM/YYYY</option>
                <option value="MMDDYYYY">MM/DD/YYYY</option>
                <option value="YYYYMMDD">YYYY/MM/DD</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="field-modal-include-time"
                className="text-xs text-muted-foreground"
              >
                Include Time
              </label>
              <button
                id="field-modal-include-time"
                type="button"
                role="switch"
                aria-checked={includeTime}
                onClick={() => setIncludeTime(!includeTime)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${includeTime ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-background transition-transform ${includeTime ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </button>
            </div>
          </div>
        )}

        {showLinkConfig && tables && tables.length > 0 && (
          <div className="space-y-2">
            <div>
              <label
                htmlFor="field-modal-link-table"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Link to Table
              </label>
              <select
                id="field-modal-link-table"
                value={linkForeignTableId}
                onChange={(e) => setLinkForeignTableId(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="">Select a table...</option>
                {tables
                  .filter((t) => t.id !== currentTableId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="field-modal-link-relationship"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Relationship
              </label>
              <select
                id="field-modal-link-relationship"
                value={linkRelationship}
                onChange={(e) => setLinkRelationship(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="ManyMany">Many to Many</option>
                <option value="OneMany">One to Many</option>
                <option value="ManyOne">Many to One</option>
                <option value="OneOne">One to One</option>
              </select>
            </div>
          </div>
        )}

        {showButtonConfig && (
          <div className="space-y-2">
            <div>
              <label
                htmlFor="field-modal-button-label"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Label
              </label>
              <Input
                id="field-modal-button-label"
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                className="h-8 text-sm"
                placeholder="Click"
              />
            </div>
            <div>
              <label
                htmlFor="field-modal-button-style"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Style
              </label>
              <select
                id="field-modal-button-style"
                value={buttonStyle}
                onChange={(e) => setButtonStyle(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="primary">Primary</option>
                <option value="default">Default</option>
                <option value="danger">Danger</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="field-modal-button-action"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Action Type
              </label>
              <select
                id="field-modal-button-action"
                value={buttonActionType}
                onChange={(e) => setButtonActionType(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="none">None (count clicks)</option>
                <option value="openUrl">Open URL</option>
              </select>
            </div>
            {buttonActionType === "openUrl" && (
              <div>
                <label
                  htmlFor="field-modal-button-url"
                  className="text-xs text-muted-foreground mb-1 block"
                >
                  URL
                </label>
                <Input
                  id="field-modal-button-url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="https://example.com"
                />
              </div>
            )}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">Confirmation dialog</span>
              <input
                type="checkbox"
                checked={buttonConfirmEnabled}
                onChange={(e) => setButtonConfirmEnabled(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
            </label>
            {buttonConfirmEnabled && (
              <div className="space-y-2 pl-2 border-l-2 border-border">
                <div>
                  <label
                    htmlFor="field-modal-button-confirm-title"
                    className="text-xs text-muted-foreground mb-1 block"
                  >
                    Confirm Title
                  </label>
                  <Input
                    id="field-modal-button-confirm-title"
                    value={buttonConfirmTitle}
                    onChange={(e) => setButtonConfirmTitle(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Are you sure?"
                  />
                </div>
                <div>
                  <label
                    htmlFor="field-modal-button-confirm-desc"
                    className="text-xs text-muted-foreground mb-1 block"
                  >
                    Confirm Description
                  </label>
                  <Input
                    id="field-modal-button-confirm-desc"
                    value={buttonConfirmDescription}
                    onChange={(e) =>
                      setButtonConfirmDescription(e.target.value)
                    }
                    className="h-8 text-sm"
                    placeholder="This action cannot be undone."
                  />
                </div>
              </div>
            )}
            <div>
              <label
                htmlFor="field-modal-button-max-count"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Max Click Count (0 = unlimited)
              </label>
              <Input
                id="field-modal-button-max-count"
                type="number"
                value={buttonMaxCount}
                onChange={(e) => setButtonMaxCount(Number(e.target.value))}
                className="h-8 text-sm"
                min={0}
              />
            </div>
          </div>
        )}
        {(showLookupConfig || showRollupConfig) && (
          <div className="space-y-2">
            {linkFields.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Create a Link field first to use {showLookupConfig ? "Lookup" : "Rollup"}
              </p>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="field-modal-lookup-link-field"
                    className="text-xs text-muted-foreground mb-1 block"
                  >
                    Link Field
                  </label>
                  <select
                    id="field-modal-lookup-link-field"
                    value={lookupLinkFieldId}
                    onChange={(e) => {
                      const fieldId = e.target.value;
                      setLookupLinkFieldId(fieldId);
                      setLookupFieldId("");
                      const selected = linkFields.find((f) => String(f.id) === fieldId);
                      const foreignId = selected?.options?.foreignTableId;
                      setLookupForeignTableId(foreignId ? String(foreignId) : "");
                    }}
                    className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                  >
                    <option value="">Select a link field...</option>
                    {linkFields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                {lookupForeignTableId && (
                  <div>
                    <label
                      htmlFor="field-modal-lookup-field"
                      className="text-xs text-muted-foreground mb-1 block"
                    >
                      Lookup Field
                    </label>
                    <select
                      id="field-modal-lookup-field"
                      value={lookupFieldId}
                      onChange={(e) => setLookupFieldId(e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                    >
                      <option value="">Select a field...</option>
                      {foreignTableFields.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {showRollupConfig && (
                  <div>
                    <label
                      htmlFor="field-modal-rollup-expression"
                      className="text-xs text-muted-foreground mb-1 block"
                    >
                      Rollup Function
                    </label>
                    <select
                      id="field-modal-rollup-expression"
                      value={rollupExpression}
                      onChange={(e) => setRollupExpression(e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                    >
                      <option value="countall({values})">Count All</option>
                      <option value="counta({values})">Count Non-empty</option>
                      <option value="count({values})">Count Numbers</option>
                      <option value="sum({values})">Sum</option>
                      <option value="average({values})">Average</option>
                      <option value="max({values})">Max</option>
                      <option value="min({values})">Min</option>
                      <option value="and({values})">And</option>
                      <option value="or({values})">Or</option>
                      <option value="xor({values})">Xor</option>
                      <option value="array_join({values})">Join</option>
                      <option value="array_unique({values})">Unique</option>
                      <option value="array_compact({values})">Compact</option>
                      <option value="concatenate({values})">Concatenate</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {showEnrichmentConfig && (
          <div className="border-t pt-2 mt-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 via-purple-50/80 to-blue-50/60 dark:from-purple-950/40 dark:via-purple-950/30 dark:to-blue-950/20 border border-purple-200/50 dark:border-purple-800/30">
              <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 animate-pulse-smooth" />
              <span className="text-xs font-medium bg-gradient-to-r from-purple-700 to-blue-600 dark:from-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                {enrichmentEntityType && selectedEnrichmentType
                  ? selectedEnrichmentType.label
                  : 'Configure enrichment in the side panel'}
              </span>
              {!enrichmentEntityType && <span className="text-xs text-purple-400 ml-auto">→</span>}
            </div>
          </div>
        )}
        <div className="border-t pt-2 mt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {showAdvanced ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="font-medium">{t('fieldModal.validation')}</span>
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-2 pl-1">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">{t('fieldModal.required')}</span>
                <input
                  id="field-modal-required"
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">{t('fieldModal.uniqueValues')}</span>
                <input
                  id="field-modal-unique"
                  type="checkbox"
                  checked={isUnique}
                  onChange={(e) => setIsUnique(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 border-t flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={
            !name.trim() ||
            (showLinkConfig && !linkForeignTableId) ||
            ((showLookupConfig || showRollupConfig) && (!lookupLinkFieldId || !lookupFieldId)) ||
            (showEnrichmentConfig && (!enrichmentEntityType || !selectedEnrichmentType || selectedEnrichmentType.inputFields.filter(f => f.required !== false).some(f => !enrichmentIdentifiers[f.key]) || selectedEnrichmentType.outputFields.filter(f => enrichmentOutputs[f.key]).length === 0))
          }
        >
          {t('save')}
        </Button>
      </div>
      {showEnrichmentConfig && (
        <EnrichmentSidePanel
          enrichmentEntityType={enrichmentEntityType}
          setEnrichmentEntityType={setEnrichmentEntityType}
          selectedEnrichmentType={selectedEnrichmentType}
          enrichmentIdentifiers={enrichmentIdentifiers}
          setEnrichmentIdentifiers={setEnrichmentIdentifiers}
          enrichmentOutputs={enrichmentOutputs}
          setEnrichmentOutputs={setEnrichmentOutputs}
          enrichmentAutoUpdate={enrichmentAutoUpdate}
          setEnrichmentAutoUpdate={setEnrichmentAutoUpdate}
          allColumns={allColumns}
          flipToLeft={sidePanelFlipped}
        />
      )}
    </PopoverContent>
  );
}
