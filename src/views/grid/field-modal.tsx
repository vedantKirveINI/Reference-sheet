import { useState, useEffect } from "react";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CellType } from "@/types";
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

export function FieldModalContent({
  data,
  onSave,
  onCancel,
  tables,
  currentTableId,
}: FieldModalProps) {
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
      setIsRequired(data.options?.isRequired ?? false);
      setIsUnique(data.options?.isUnique ?? false);
    }
  }, [data]);

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
    }

    if (!result.options) result.options = {};
    result.options.isRequired = isRequired;
    result.options.isUnique = isUnique;

    if (data.insertOrder != null) result.insertOrder = data.insertOrder;

    onSave(result);
  };

  return (
    <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
      <div className="p-3 border-b">
        <h4 className="text-sm font-medium">
          {mode === "create" ? "Add Field" : "Edit Field"}
        </h4>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <label
            htmlFor="field-modal-field-name"
            className="text-xs text-muted-foreground mb-1 block"
          >
            Field Name
          </label>
          <Input
            id="field-modal-field-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-8 text-sm"
            placeholder="Enter field name"
          />
        </div>
        <div>
          <label
            htmlFor="field-modal-description"
            className="text-xs text-muted-foreground mb-1 block"
          >
            Description
          </label>
          <Input
            id="field-modal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-8 text-sm"
            placeholder="Optional description"
          />
        </div>
        <div>
          <label
            htmlFor={
              mode === "edit"
                ? "field-modal-type-readonly"
                : "field-modal-type-search"
            }
            className="text-xs text-muted-foreground mb-1 block"
          >
            Field Type
          </label>
          {mode === "edit" ? (
            <div
              id="field-modal-type-readonly"
              className="h-8 flex items-center px-2 text-sm border rounded-md bg-muted/50 text-muted-foreground"
            >
              {getFieldTypeLabel(selectedType)}
            </div>
          ) : (
            <>
              <div className="relative mb-1.5">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="field-modal-type-search"
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  placeholder="Search field types..."
                  className="h-7 text-xs pl-7"
                />
              </div>
              <div className="max-h-72 overflow-y-auto border rounded-md p-1">
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
                                onClick={() => setSelectedType(ft.value)}
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
                              onClick={() => setSelectedType(ft.value)}
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
        <div className="border-t pt-3 mt-2 space-y-2">
          <span className="text-xs text-muted-foreground mb-1 block font-medium">
            Validation
          </span>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Required</span>
            <input
              id="field-modal-required"
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Unique values</span>
            <input
              id="field-modal-unique"
              type="checkbox"
              checked={isUnique}
              onChange={(e) => setIsUnique(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
          </label>
        </div>
      </div>
      <div className="p-3 border-t flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!name.trim() || (showLinkConfig && !linkForeignTableId)}
        >
          Save
        </Button>
      </div>
    </PopoverContent>
  );
}
