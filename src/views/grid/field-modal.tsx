import { useState, useEffect } from 'react';
import { PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CellType } from '@/types';
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FieldModalData {
  mode: 'create' | 'edit';
  fieldName: string;
  fieldType: CellType;
  fieldId?: string;
  options?: any;
}

interface FieldModalProps {
  data: FieldModalData | null;
  onSave: (data: FieldModalData) => void;
  onCancel: () => void;
}

interface FieldTypeOption {
  value: CellType;
  label: string;
  icon: LucideIcon;
}

const FIELD_TYPES: FieldTypeOption[] = [
  { value: CellType.String, label: 'Text', icon: Type },
  { value: CellType.Number, label: 'Number', icon: Hash },
  { value: CellType.SCQ, label: 'Single Select', icon: CircleDot },
  { value: CellType.MCQ, label: 'Multiple Select', icon: CheckSquare },
  { value: CellType.DropDown, label: 'Dropdown', icon: ChevronDownCircle },
  { value: CellType.YesNo, label: 'Yes/No', icon: ToggleLeft },
  { value: CellType.DateTime, label: 'Date', icon: Calendar },
  { value: CellType.CreatedTime, label: 'Created Time', icon: Clock },
  { value: CellType.Currency, label: 'Currency', icon: DollarSign },
  { value: CellType.PhoneNumber, label: 'Phone', icon: Phone },
  { value: CellType.Address, label: 'Address', icon: MapPin },
  { value: CellType.Signature, label: 'Signature', icon: PenTool },
  { value: CellType.Slider, label: 'Slider', icon: SlidersHorizontal },
  { value: CellType.FileUpload, label: 'File Upload', icon: Paperclip },
  { value: CellType.Time, label: 'Time', icon: Clock },
  { value: CellType.Ranking, label: 'Ranking', icon: ListOrdered },
  { value: CellType.Rating, label: 'Rating', icon: Star },
  { value: CellType.OpinionScale, label: 'Opinion Scale', icon: ThumbsUp },
  { value: CellType.Formula, label: 'Formula', icon: Code },
  { value: CellType.List, label: 'List', icon: List },
  { value: CellType.Enrichment, label: 'Enrichment', icon: Sparkles },
  { value: CellType.ZipCode, label: 'Zip Code', icon: Mail },
];

interface ChoiceOptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

function ChoiceOptionsEditor({ options, onChange }: ChoiceOptionsEditorProps) {
  const handleAdd = () => {
    onChange([...options, '']);
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
      <label className="text-xs text-muted-foreground mb-1 block">Options</label>
      <div className="space-y-1.5">
        {options.map((opt, index) => (
          <div key={index} className="flex items-center gap-1">
            <Input
              value={opt}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="h-7 text-sm flex-1"
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

const CURRENCY_SYMBOLS = ['$', '€', '£', '¥', '₹', '₩', '₽', 'CHF', 'A$', 'C$'];

export function FieldModalContent({ data, onSave, onCancel }: FieldModalProps) {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<CellType>(CellType.String);
  const [choiceOptions, setChoiceOptions] = useState<string[]>(['']);
  const [maxRating, setMaxRating] = useState(5);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(100);

  useEffect(() => {
    if (data) {
      setName(data.fieldName);
      setSelectedType(data.fieldType);
      if (data.options?.options) {
        setChoiceOptions(
          Array.isArray(data.options.options)
            ? data.options.options.map((o: any) => (typeof o === 'string' ? o : o.label || ''))
            : ['']
        );
      } else {
        setChoiceOptions(['']);
      }
      if (data.options?.maxRating) setMaxRating(data.options.maxRating);
      if (data.options?.currencySymbol) setCurrencySymbol(data.options.currencySymbol);
      if (data.options?.minValue !== undefined) setSliderMin(data.options.minValue);
      if (data.options?.maxValue !== undefined) setSliderMax(data.options.maxValue);
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

  const handleSave = () => {
    const result: FieldModalData = {
      mode,
      fieldName: name.trim(),
      fieldType: selectedType,
      fieldId: data.fieldId,
    };

    if (showChoiceConfig) {
      result.options = { options: choiceOptions.filter((o) => o.trim() !== '') };
    } else if (showRatingConfig) {
      result.options = { maxRating };
    } else if (showCurrencyConfig) {
      result.options = { currencySymbol };
    } else if (showSliderConfig) {
      result.options = { minValue: sliderMin, maxValue: sliderMax };
    }

    onSave(result);
  };

  return (
    <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
      <div className="p-3 border-b">
        <h4 className="text-sm font-medium">
          {mode === 'create' ? 'Add Field' : 'Edit Field'}
        </h4>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Field Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-8 text-sm"
            placeholder="Enter field name"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Field Type</label>
          <div className="max-h-48 overflow-y-auto space-y-0.5 border rounded-md p-1">
            {FIELD_TYPES.map((ft) => {
              const IconComp = ft.icon;
              const isSelected = selectedType === ft.value;
              return (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setSelectedType(ft.value)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent ${
                    isSelected ? 'bg-accent' : ''
                  }`}
                >
                  <IconComp className="h-4 w-4 text-muted-foreground" />
                  <span>{ft.label}</span>
                  {isSelected && <Check className="ml-auto h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {showChoiceConfig && (
          <ChoiceOptionsEditor options={choiceOptions} onChange={setChoiceOptions} />
        )}

        {showRatingConfig && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Max Rating</label>
            <select
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
            <label className="text-xs text-muted-foreground mb-1 block">Currency Symbol</label>
            <select
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
              <label className="text-xs text-muted-foreground mb-1 block">Min Value</label>
              <Input
                type="number"
                value={sliderMin}
                onChange={(e) => setSliderMin(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Value</label>
              <Input
                type="number"
                value={sliderMax}
                onChange={(e) => setSliderMax(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
          Save
        </Button>
      </div>
    </PopoverContent>
  );
}
