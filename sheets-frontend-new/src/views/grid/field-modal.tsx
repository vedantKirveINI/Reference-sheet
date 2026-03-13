import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { FormulaEditorPopup } from '@/components/formula-editor/FormulaEditorPopup';
import {
  expressionBlocksToString,
  expressionStringToBlocks,
} from '@/utils/formula-utils';
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CellType } from "@/types";
import { useFieldsStore } from "@/stores";
import { getForeignTableFields } from "@/services/api";
import { isBlockedFieldType } from "@/utils/fieldTypeGuards";
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
  UserCheck,
  UserCog,
  Timer,
  CheckCircle,
  Sigma,
  Eye,
  Building2,
  User,
  ChevronRight,
  Pencil,
  GripVertical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AI_TIERS, DEFAULT_TIER } from '@/config/ai-tier-config';
import { CurrencyFieldIcon, ZipCodeFieldIcon } from "@/components/icons/field-type-icons";

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
  /** Formula expression in blocks format (from computedFieldMeta on edit). */
  expression?: any;
}

interface FieldModalProps {
  data: FieldModalData | null;
  onSave: (data: FieldModalData) => void;
  onCancel: () => void;
  tables?: Array<{ id: string; name: string }>;
  currentTableId?: string;
  loading?: boolean;
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
      { value: CellType.Enrichment, label: "Enrichment", icon: Sparkles },
      { value: CellType.AiColumn, label: "AI Column", icon: Sparkles, description: "AI-generated values per row" },
      { value: CellType.Formula, label: "Formula", icon: Code },
    ],
  },
  {
    label: "Basic",
    types: [
      { value: CellType.String, label: "Short Text", icon: Type },
      { value: CellType.LongText, label: "Long Text", icon: Type },
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
      { value: CellType.Time, label: "Time", icon: Clock },
    ],
  },
  {
    label: "Contact & Location",
    types: [
      { value: CellType.PhoneNumber, label: "Phone", icon: Phone },
      { value: CellType.Address, label: "Address", icon: MapPin },
      { value: CellType.Email, label: "Email", icon: Mail },
      { value: CellType.ZipCode, label: "Zip Code", icon: ZipCodeFieldIcon as unknown as LucideIcon },
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
      { value: CellType.Link, label: "Link to Table", icon: Link2 },
      { value: CellType.Lookup, label: "Lookup", icon: Eye },
      { value: CellType.Rollup, label: "Rollup", icon: Sigma },
    ],
  },
  {
    label: "People & System",
    types: [
      { value: CellType.CreatedTime, label: "Created Time", icon: Clock },
      { value: CellType.CreatedBy, label: "Created By", icon: UserCheck },
      { value: CellType.LastModifiedBy, label: "Last Modified By", icon: UserCog },
      { value: CellType.LastModifiedTime, label: "Last Modified Time", icon: Timer },
      { value: CellType.ID, label: "ID", icon: Hash },
    ],
  },
  {
    label: "Advanced",
    types: [
      { value: CellType.Checkbox, label: "Checkbox", icon: CheckCircle },
      { value: CellType.Currency, label: "Currency", icon: CurrencyFieldIcon as unknown as LucideIcon },
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
  showDragHandles?: boolean;
}

function ChoiceOptionsEditor({ options, onChange, showDragHandles = false }: ChoiceOptionsEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [indexToFocus, setIndexToFocus] = useState<number | null>(null);

  const handleAdd = () => {
    onChange([...options, ""]);
    setIndexToFocus(options.length);
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    onChange(updated);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if ((e.key !== 'Enter' && e.key !== 'Tab') || e.shiftKey) {
      return;
    }

    const isLast = index === options.length - 1;
    const currentValue = (options[index] ?? '').trim();

    if (!isLast || !currentValue) {
      return;
    }

    e.preventDefault();
    onChange([...options, ""]);
    setIndexToFocus(options.length);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      const newOptions = [...options];
      const [moved] = newOptions.splice(dragIndex, 1);
      newOptions.splice(index, 0, moved);
      onChange(newOptions);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <span className="text-xs text-muted-foreground mb-1 block">Options</span>
      <div className="space-y-1.5">
        {options.map((opt, index) => (
          <div
            key={index}
            className={`flex items-center gap-1 ${dragOverIndex === index && dragIndex !== index ? 'border-t-2 border-emerald-400' : ''} ${dragIndex === index ? 'opacity-50' : ''}`}
            onDragOver={showDragHandles ? (e) => handleDragOver(e, index) : undefined}
            onDrop={showDragHandles ? () => handleDrop(index) : undefined}
          >
            <Input
              value={opt}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              autoFocus={indexToFocus === index}
              placeholder={showDragHandles ? "Enter option to rank" : `Option ${index + 1}`}
              className="h-8 text-sm flex-1"
              aria-label={`Option ${index + 1}`}
            />
            {showDragHandles && (
              <button
                type="button"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            )}
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
          <span>{showDragHandles ? "Add Choice" : "Add option"}</span>
        </button>
      </div>
    </div>
  );
}

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
  email: Mail,
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
      className="absolute top-0 z-50 w-72 rounded-xl border border-brand-200/60 dark:border-brand-800/40 bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-2xl shadow-brand-500/5 transition-all duration-300 ease-out animate-in fade-in-0 slide-in-from-left-2"
      style={flipToLeft ? { right: '100%', marginRight: 6 } : { left: '100%', marginLeft: 6 }}
    >
      <div className="p-4 border-b border-brand-100/60 dark:border-brand-900/40 bg-gradient-to-r from-brand-500/[0.08] via-emerald-500/[0.04] to-brand-500/[0.08] relative overflow-hidden">
        <div className="absolute top-1 right-2 opacity-[0.07]">
          <Sparkles className="h-12 w-12 text-brand-400" />
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="relative">
            <Sparkles className="h-4 w-4 text-brand-500 animate-float" />
          </div>
          <h4 className="text-sm font-semibold bg-gradient-to-r from-brand-600 via-emerald-500 to-brand-700 dark:from-brand-300 dark:via-emerald-300 dark:to-brand-400 bg-clip-text text-transparent">
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
                      ? 'border-brand-400 bg-background/80 dark:bg-background/30 shadow-sm shadow-brand-500/5 ring-1 ring-brand-200/60 dark:ring-brand-800/40'
                      : 'border-border/70 bg-background/40 dark:bg-background/10 hover:bg-background/60 dark:hover:bg-background/20 hover:border-brand-300/40 dark:hover:border-brand-500/30'
                  }`}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300 bg-muted/60 group-hover:bg-muted/70 dark:bg-muted/30 dark:group-hover:bg-muted/40">
                    <IconComp className="h-4 w-4 transition-colors duration-300 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium block transition-colors duration-300 ${isSelected ? 'text-foreground' : ''}`}>{et.label}</span>
                    <span className="text-[10px] text-muted-foreground/80 block truncate">{et.subtitle}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-brand-500 shrink-0 animate-pulse-smooth" />}
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
                      className="w-full h-8 text-xs border rounded-lg px-3 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-brand-300 dark:hover:border-brand-500/50 hover:shadow-sm hover:shadow-brand-500/5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
                  <label key={out.key} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-brand-50/50 dark:hover:bg-brand-950/20 cursor-pointer transition-all duration-300 group" title={out.description}>
                    <input
                      type="checkbox"
                      checked={enrichmentOutputs[out.key] ?? true}
                      onChange={(e) => setEnrichmentOutputs(prev => ({ ...prev, [out.key]: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-brand-500 cursor-pointer"
                    />
                    <span className="text-xs truncate group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors duration-300">{out.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/50 hover:border-brand-300/50 dark:hover:border-brand-500/30 hover:bg-brand-50/30 dark:hover:bg-brand-950/10 cursor-pointer transition-all duration-300 group">
              <div>
                <span className="text-xs font-medium block group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-300">Auto-update</span>
                <span className="text-[10px] text-muted-foreground block">Re-enrich when input data changes</span>
              </div>
              <input
                type="checkbox"
                checked={enrichmentAutoUpdate}
                onChange={(e) => setEnrichmentAutoUpdate(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-brand-500 cursor-pointer"
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

interface AiColumnSidePanelProps {
  aiColumnPrompt: string;
  setAiColumnPrompt: (v: string) => void;
  aiColumnModel: string;
  setAiColumnModel: (v: string) => void;
  aiColumnSourceFields: string[];
  setAiColumnSourceFields: React.Dispatch<React.SetStateAction<string[]>>;
  aiColumnAutoUpdate: boolean;
  setAiColumnAutoUpdate: (v: boolean) => void;
  allColumns: Array<any>;
  flipToLeft: boolean;
}

function AiColumnSidePanel({
  aiColumnPrompt,
  setAiColumnPrompt,
  aiColumnModel,
  setAiColumnModel,
  aiColumnSourceFields,
  setAiColumnSourceFields,
  aiColumnAutoUpdate,
  setAiColumnAutoUpdate,
  allColumns,
  flipToLeft,
}: AiColumnSidePanelProps) {
  return (
    <div
      className="absolute top-0 z-50 w-80 rounded-xl border border-purple-200/60 dark:border-purple-800/40 bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-2xl shadow-purple-500/5 transition-all duration-300 ease-out animate-in fade-in-0 slide-in-from-left-2"
      style={flipToLeft ? { right: '100%', marginRight: 6 } : { left: '100%', marginLeft: 6 }}
    >
      <div className="p-4 border-b border-purple-100/60 dark:border-purple-900/40 bg-gradient-to-r from-purple-500/[0.08] via-violet-500/[0.04] to-purple-500/[0.08] relative overflow-hidden">
        <div className="absolute top-1 right-2 opacity-[0.07]">
          <Sparkles className="h-12 w-12 text-purple-400" />
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <Sparkles className="h-4 w-4 text-purple-500 animate-float" />
          <h4 className="text-sm font-semibold bg-gradient-to-r from-purple-600 via-violet-500 to-purple-700 dark:from-purple-300 dark:via-violet-300 dark:to-purple-400 bg-clip-text text-transparent">
            AI Column
          </h4>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed relative z-10">
          AI generates a value for each row based on your prompt and selected source columns.
        </p>
      </div>
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <div>
          <span className="text-xs text-muted-foreground mb-2 block font-semibold">Prompt</span>
          <textarea
            value={aiColumnPrompt}
            onChange={(e) => setAiColumnPrompt(e.target.value)}
            placeholder='e.g. "Categorize this lead as Hot, Warm, or Cold based on their company size and last activity"'
            rows={3}
            className="w-full text-xs border rounded-lg px-3 py-2 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
          />
          <span className="text-[10px] text-muted-foreground/70 mt-0.5 block">Tell the AI what to generate for each row.</span>
        </div>

        <div>
          <span className="text-xs text-muted-foreground mb-2 block font-semibold">Model</span>
          <div className="space-y-1">
            {AI_TIERS.map((tier) => (
              <label
                key={tier.key}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                  aiColumnModel === tier.key
                    ? 'border-purple-400 bg-purple-50/60 dark:border-purple-500/60 dark:bg-purple-950/30 shadow-sm'
                    : 'border-border/50 hover:border-purple-300/50 dark:hover:border-purple-500/30 hover:bg-purple-50/20 dark:hover:bg-purple-950/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="aiModel"
                    value={tier.key}
                    checked={aiColumnModel === tier.key}
                    onChange={() => setAiColumnModel(tier.key)}
                    className="h-3 w-3 accent-purple-500"
                  />
                  <div>
                    <span className="text-xs font-medium block">{tier.displayName}</span>
                    <span className="text-[10px] text-muted-foreground block">{tier.description}</span>
                  </div>
                </div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium whitespace-nowrap">
                  {tier.creditsPerCell} credits/cell
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground mb-2 block font-semibold">Source columns</span>
          <div className="space-y-0.5 max-h-40 overflow-y-auto border rounded-lg p-1.5 bg-background/30 backdrop-blur-sm">
            {allColumns
              .filter(c => c.type !== CellType.AiColumn && c.type !== CellType.Enrichment)
              .map(col => {
                const colId = String(col.rawId ?? col.id);
                const isSelected = aiColumnSourceFields.includes(colId);
                return (
                  <label
                    key={colId}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-purple-50/50 dark:hover:bg-purple-950/20 cursor-pointer transition-all duration-300 group"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setAiColumnSourceFields(prev =>
                          isSelected ? prev.filter(id => id !== colId) : [...prev, colId]
                        );
                      }}
                      className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-purple-500 cursor-pointer"
                    />
                    <span className="text-xs truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">{col.name}</span>
                  </label>
                );
              })}
          </div>
          <span className="text-[10px] text-muted-foreground/70 mt-0.5 block">Select columns the AI will read as context for each row.</span>
        </div>

        <label className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/50 hover:border-purple-300/50 dark:hover:border-purple-500/30 hover:bg-purple-50/30 dark:hover:bg-purple-950/10 cursor-pointer transition-all duration-300 group">
          <div>
            <span className="text-xs font-medium block group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">Auto-update</span>
            <span className="text-[10px] text-muted-foreground block">Re-generate when source columns change</span>
          </div>
          <input
            type="checkbox"
            checked={aiColumnAutoUpdate}
            onChange={(e) => setAiColumnAutoUpdate(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-purple-500 cursor-pointer"
          />
        </label>
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
  loading = false,
}: FieldModalProps) {
  const { t } = useTranslation(['common']);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<CellType>(CellType.String);
  const [typeSearch, setTypeSearch] = useState("");
  const [choiceOptions, setChoiceOptions] = useState<string[]>([""]);
  const [maxRating, setMaxRating] = useState(5);
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
  const [aiColumnPrompt, setAiColumnPrompt] = useState("");
  const [aiColumnModel, setAiColumnModel] = useState(DEFAULT_TIER);
  const [aiColumnSourceFields, setAiColumnSourceFields] = useState<string[]>([]);
  const [aiColumnAutoUpdate, setAiColumnAutoUpdate] = useState(true);
  const [sidePanelFlipped, setSidePanelFlipped] = useState(false);
  const [typeListExpanded, setTypeListExpanded] = useState(true);
  const [dateFormat, setDateFormat] = useState<string>('DDMMYYYY');
  const [includeTime, setIncludeTime] = useState(false);
  const [formulaExpression, setFormulaExpression] = useState("");
  const [formulaPopupOpen, setFormulaPopupOpen] = useState(false);
  const [formulaPopupFlipped, setFormulaPopupFlipped] = useState(false);
  const [choiceOptionsError, setChoiceOptionsError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedEnrichmentType = getEnrichmentTypeByKey(enrichmentEntityType);

  const allColumns = useFieldsStore((s) => s.allColumns);
  const linkFields = allColumns.filter((col) => col.type === CellType.Link);

  const formulaExpressionDisplay = useMemo(() => {
    if (!formulaExpression) return '';
    return formulaExpression.replace(/\{([^}]+)\}/g, (_match, inner) => {
      const col = allColumns.find(
        c => c.dbFieldName?.toLowerCase() === inner.toLowerCase() ||
             c.name?.toLowerCase() === inner.toLowerCase()
      );
      return col ? `{${col.name}}` : `{${inner}}`;
    });
  }, [formulaExpression, allColumns]);

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
      const rawChoices = data.options?.options ?? data.options?.choices ?? (Array.isArray(data.options) ? data.options : null);
      if (rawChoices && Array.isArray(rawChoices) && rawChoices.length > 0) {
        setChoiceOptions(
          rawChoices.map((o: any) =>
            typeof o === "string" ? o : o.label || o.name || "",
          ),
        );
      } else {
        setChoiceOptions([""]);
      }
      if (data.options?.maxRating) setMaxRating(data.options.maxRating);
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
      if (data.options?.expression && data.fieldType !== CellType.Formula)
        setRollupExpression(data.options.expression);
      if (data.fieldType === CellType.Formula) {
        if (data.expression?.blocks) {
          setFormulaExpression(expressionBlocksToString(data.expression.blocks));
        } else if (typeof data.options?.expression === 'string') {
          setFormulaExpression(data.options.expression);
        } else {
          setFormulaExpression('');
        }
      } else {
        setFormulaExpression('');
      }
      setIsRequired(data.options?.isRequired ?? false);
      setIsUnique(data.options?.isUnique ?? false);
      if (data.options?.dateFormat) setDateFormat(data.options.dateFormat);
      if (data.options?.includeTime !== undefined) setIncludeTime(data.options.includeTime);
      if (data.fieldType === CellType.AiColumn && data.options) {
        if (data.options.aiPrompt) setAiColumnPrompt(data.options.aiPrompt);
        if (data.options.aiModel) setAiColumnModel(data.options.aiModel);
        if (data.options.autoUpdate !== undefined) setAiColumnAutoUpdate(data.options.autoUpdate);
        if (data.options.sourceFields && Array.isArray(data.options.sourceFields)) {
          setAiColumnSourceFields(data.options.sourceFields.map((sf: any) => String(sf.field_id)));
        }
      }
      if (data.fieldType === CellType.Enrichment && data.options) {
        const enrichOpts = data.options;
        if (enrichOpts.entityType) setEnrichmentEntityType(enrichOpts.entityType);
        if (enrichOpts.autoUpdate !== undefined) setEnrichmentAutoUpdate(enrichOpts.autoUpdate);
        if (enrichOpts.config?.identifier) {
          const ids: Record<string, string> = {};
          for (const inp of enrichOpts.config.identifier) {
            if (inp.key && inp.field_id) ids[inp.key] = String(inp.field_id);
          }
          setEnrichmentIdentifiers(ids);
        }
        if (enrichOpts.config?.fieldsToEnrich) {
          const outs: Record<string, boolean> = {};
          for (const f of enrichOpts.config.fieldsToEnrich) {
            if (f.key) outs[f.key] = true;
          }
          setEnrichmentOutputs(outs);
        }
      }
    }
  }, [data]);

  useEffect(() => {
    if (data?.mode === "create" && isBlockedFieldType(selectedType)) {
      setSelectedType(CellType.String);
    }
  }, [data?.mode, selectedType]);

  useEffect(() => {
    const checkFlip = () => {
      if ((selectedType === CellType.Enrichment || selectedType === CellType.AiColumn) && popoverRef.current) {
        const rect = popoverRef.current.getBoundingClientRect();
        const sidePanelWidth = 288 + 6;
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;
        const shouldFlip = spaceRight < sidePanelWidth && spaceLeft > sidePanelWidth;
        setSidePanelFlipped(shouldFlip);
      }
      if (formulaPopupOpen && popoverRef.current) {
        const rect = popoverRef.current.getBoundingClientRect();
        const popupWidth = 648;
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;
        setFormulaPopupFlipped(spaceRight < popupWidth && spaceLeft > popupWidth);
      }
    };
    checkFlip();
    window.addEventListener('resize', checkFlip);
    return () => window.removeEventListener('resize', checkFlip);
  }, [selectedType, formulaPopupOpen]);

  useEffect(() => {
    if (selectedType === CellType.Formula) {
      setFormulaPopupOpen(true);
    } else {
      setFormulaPopupOpen(false);
    }
  }, [selectedType]);

  if (!data) return null;

  const mode = data.mode;
  const fieldTypeCategoriesForPicker =
    mode === "create"
      ? FIELD_TYPE_CATEGORIES
          .map((cat) => ({
            ...cat,
            types: cat.types.filter((ft) => !isBlockedFieldType(ft.value)),
          }))
          .filter((cat) => cat.types.length > 0)
      : FIELD_TYPE_CATEGORIES;
  const showChoiceConfig =
    selectedType === CellType.SCQ ||
    selectedType === CellType.MCQ ||
    selectedType === CellType.DropDown;
  const showRankingConfig = selectedType === CellType.Ranking;
  const showRatingConfig = selectedType === CellType.Rating;
  const showSliderConfig = selectedType === CellType.Slider;
  const showLinkConfig = selectedType === CellType.Link;
  const showButtonConfig = selectedType === CellType.Button;
  const showLookupConfig = selectedType === CellType.Lookup;
  const showRollupConfig = selectedType === CellType.Rollup;
  const showEnrichmentConfig = selectedType === CellType.Enrichment;
  const showAiColumnConfig = selectedType === CellType.AiColumn;
  const showFormulaConfig = selectedType === CellType.Formula;
  const showDateConfig =
    selectedType === CellType.DateTime ||
    selectedType === CellType.CreatedTime ||
    selectedType === CellType.LastModifiedTime;
  const isBlockedReadOnly = mode === "edit" && isBlockedFieldType(selectedType);

  const handleSave = () => {
    if (isBlockedReadOnly) return;
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
      const cleanedOptions = choiceOptions.filter((o) => o.trim() !== "");
      if (cleanedOptions.length === 0) {
        setChoiceOptionsError("At least one option is required.");
        return;
      }
      result.options = {
        options: cleanedOptions,
      };
    } else if (showRankingConfig) {
      const existingOptions = data.options?.options;
      const existingMap = new Map<string, string>();
      if (Array.isArray(existingOptions)) {
        existingOptions.forEach((o: any) => {
          if (typeof o === 'object' && o.label && o.id) {
            existingMap.set(o.label, String(o.id));
          }
        });
      }
      result.options = {
        options: choiceOptions
          .filter((o) => o.trim() !== "")
          .map((label) => ({
            id: existingMap.get(label) || crypto.randomUUID(),
            label,
          })),
      };
    } else if (showRatingConfig) {
      result.options = { maxRating };
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
    } else if (showFormulaConfig) {
      result.options = {};
      result.expression = expressionStringToBlocks(formulaExpression, allColumns);
    }

    if (!result.options) result.options = {};
    if (showDateConfig) {
      result.options.dateFormat = dateFormat;
      result.options.includeTime = includeTime;
    }
    result.options.isRequired = isRequired;
    result.options.isUnique = isUnique;

    if (showAiColumnConfig) {
      const mappedSourceFields = aiColumnSourceFields.map(colId => {
        const matchedCol = allColumns.find(c => String(c.rawId ?? c.id) === colId);
        console.log('[AI_COLUMN][field-modal] mapping sourceField colId:', colId, 'matchedCol:', matchedCol ? { id: matchedCol.id, rawId: matchedCol.rawId, dbFieldName: matchedCol.dbFieldName, name: matchedCol.name } : 'NOT FOUND');
        return {
          field_id: parseInt(colId),
          dbFieldName: matchedCol?.dbFieldName || matchedCol?.id || colId,
          name: matchedCol?.name || colId,
        };
      });
      result.options = {
        ...result.options,
        __aiColumnCreate: mode === 'create',
        aiPrompt: aiColumnPrompt,
        aiModel: aiColumnModel,
        sourceFields: mappedSourceFields,
        autoUpdate: aiColumnAutoUpdate,
      };
      console.log('[AI_COLUMN][field-modal] handleSave result:', JSON.stringify(result, null, 2));
    }

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
        {isBlockedReadOnly && (
          <div className="rounded-md border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 px-2.5 py-2 text-xs text-amber-800 dark:text-amber-200">
            This field type is read-only in this version.
          </div>
        )}
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
            disabled={loading || isBlockedReadOnly}
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
            disabled={loading || isBlockedReadOnly}
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
                {fieldTypeCategoriesForPicker.map((category) => {
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
          <>
            <ChoiceOptionsEditor
              options={choiceOptions}
              onChange={(opts) => {
                setChoiceOptions(opts);
                if (choiceOptionsError && opts.some((o) => o.trim() !== "")) {
                  setChoiceOptionsError(null);
                }
              }}
            />
            {choiceOptionsError && (
              <p className="text-xs text-destructive mt-1">{choiceOptionsError}</p>
            )}
          </>
        )}

        {showRankingConfig && (
          <ChoiceOptionsEditor
            options={choiceOptions}
            onChange={setChoiceOptions}
            showDragHandles
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
                disabled={loading || isBlockedReadOnly}
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
                disabled={loading || isBlockedReadOnly}
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
                    disabled={loading || isBlockedReadOnly}
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
                      disabled={loading || isBlockedReadOnly}
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
                      disabled={loading || isBlockedReadOnly}
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
        {showFormulaConfig && (
          <div className="border-t pt-2 mt-1">
            {formulaExpression ? (
              <div className="rounded-lg border border-border/80 dark:border-border/60 bg-muted/40 dark:bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-background/60 dark:bg-background/40">
                  <Code className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground flex-1">
                    Formula defined
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormulaPopupOpen(true)}
                    className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-200 font-medium transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </div>
                <div className="px-3 py-2">
                  <code className="text-xs font-mono text-muted-foreground break-all line-clamp-2">
                    {formulaExpressionDisplay}
                  </code>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setFormulaPopupOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-dashed border-violet-300/60 dark:border-violet-700/40 hover:border-violet-400/80 dark:hover:border-violet-600/60 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-100 to-sky-100 dark:from-violet-900/50 dark:to-sky-900/30 border border-violet-200/60 dark:border-violet-700/40 flex items-center justify-center shrink-0 group-hover:shadow-sm group-hover:shadow-violet-500/10 transition-shadow">
                  <Code className="h-4 w-4 text-violet-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300 group-hover:text-violet-800 dark:group-hover:text-violet-200 transition-colors">
                    Build Formula
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No formula defined — click to open the formula builder
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-violet-400 group-hover:text-violet-600 transition-colors" />
              </button>
            )}
          </div>
        )}
        {showEnrichmentConfig && (
          <div className="border-t pt-2 mt-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-brand-50 via-brand-50/80 to-emerald-50/60 dark:from-brand-950/40 dark:via-brand-950/30 dark:to-emerald-950/20 border border-brand-200/60 dark:border-brand-800/30">
              <Sparkles className="h-3.5 w-3.5 text-brand-600 shrink-0 animate-pulse-smooth" />
              <span className="text-xs font-medium text-foreground">
                {enrichmentEntityType && selectedEnrichmentType
                  ? selectedEnrichmentType.label
                  : 'Configure enrichment in the side panel'}
              </span>
              {!enrichmentEntityType && <span className="text-xs text-brand-500 ml-auto">→</span>}
            </div>
          </div>
        )}
        {/* Validation section (required/unique) temporarily disabled */}
        {/*
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
        */}
      </div>
      <div className="p-3 border-t flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={
            isBlockedReadOnly ||
            !name.trim() ||
            (showLinkConfig && !linkForeignTableId) ||
            ((showLookupConfig || showRollupConfig) && (!lookupLinkFieldId || !lookupFieldId)) ||
            (showChoiceConfig && choiceOptions.filter((o) => o.trim() !== "").length === 0) ||
            (showEnrichmentConfig && (!enrichmentEntityType || !selectedEnrichmentType || selectedEnrichmentType.inputFields.filter(f => f.required !== false).some(f => !enrichmentIdentifiers[f.key]) || selectedEnrichmentType.outputFields.filter(f => enrichmentOutputs[f.key]).length === 0)) ||
            (showFormulaConfig && !formulaExpression.trim()) ||
            loading
          }
          loading={loading}
        >
          {t('save')}
        </Button>
      </div>
      {showAiColumnConfig && (
        <AiColumnSidePanel
          aiColumnPrompt={aiColumnPrompt}
          setAiColumnPrompt={setAiColumnPrompt}
          aiColumnModel={aiColumnModel}
          setAiColumnModel={setAiColumnModel}
          aiColumnSourceFields={aiColumnSourceFields}
          setAiColumnSourceFields={setAiColumnSourceFields}
          aiColumnAutoUpdate={aiColumnAutoUpdate}
          setAiColumnAutoUpdate={setAiColumnAutoUpdate}
          allColumns={allColumns}
          flipToLeft={sidePanelFlipped}
        />
      )}
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
      {showFormulaConfig && (
        <FormulaEditorPopup
          open={formulaPopupOpen}
          columns={allColumns.filter(c => !data?.fieldId || c.id !== data.fieldId)}
          initialExpression={formulaExpression}
          onApply={(expr) => { setFormulaExpression(expr); setFormulaPopupOpen(false); }}
          onClose={() => setFormulaPopupOpen(false)}
          flipToLeft={formulaPopupFlipped}
        />
      )}
    </PopoverContent>
  );
}
