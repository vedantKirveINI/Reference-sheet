import { useState } from "react";
import { icons } from "@/components/icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { cn } from "@/lib/utils";

const CheckIcon = icons.check;
const ChevronDownIcon = icons.chevronDown;
const XIcon = icons.x;
const CopyIcon = icons.copy;

const SELECTION_TYPE_OPTIONS = [
  { label: "Unlimited", value: "Unlimited" },
  { label: "Exact Number", value: "Exact Number" },
  { label: "Range", value: "Range" },
];

const OTHER_OPTION_VALUE = "Other";

const createArray = (length: number, type?: string, start?: number) => {
  if (type === "min") {
    return Array.from({ length: length - 1 }, (_, index) => index + 1);
  }
  if (type === "max" && start) {
    const array = Array.from({ length }, (_, index) => index + 1);
    for (let i = 0; i < start; i++) {
      array.shift();
    }
    return array;
  }
  return Array.from({ length }, (_, index) => index + 1);
};

interface MCQSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const MCQSettings = ({ question, onChange }: MCQSettingsProps) => {
  const settings = question?.settings || {};
  const selectionType = settings?.selection?.type || "Unlimited";
  const exactValue = settings?.selection?.exactNumber || 1;
  const maxValue = settings?.selection?.range?.end || 2;
  const minValue = settings?.selection?.range?.start || 1;
  const [defaultValueOpen, setDefaultValueOpen] = useState(false);
  const [defaultValueSearch, setDefaultValueSearch] = useState("");

  const updateSettings = (
    key: string,
    value: any,
    errors?: Record<string, string>
  ) => {
    onChange({
      settings: {
        ...settings,
        [key]: value,
        errors: { ...settings?.errors, ...errors },
      },
    });
  };

  const handleCopyKey = () => {
    if (settings?.accessKey) {
      navigator.clipboard.writeText(settings.accessKey);
    }
  };

  const sanitizedQuestionOptions = question?.options?.filter((opt: string) => opt?.trim()) || [];
  const questionOptions = settings?.other
    ? [...sanitizedQuestionOptions, OTHER_OPTION_VALUE]
    : sanitizedQuestionOptions;

  const onDefaultValueChange = (value: string[]) => {
    let updatedValue = value;
    if (selectionType === "Exact Number" && value.length > exactValue) {
      updatedValue = value.slice(1, exactValue).concat(value[value.length - 1]);
    }
    if (selectionType === "Range" && value.length > maxValue) {
      updatedValue = value.slice(1, maxValue).concat(value[value.length - 1]);
    }
    updateSettings("defaultValue", updatedValue, { defaultValueError: "" });
  };

  const onSelectionChange = (value: string) => {
    const updatedDefaultValue =
      value === "Exact Number"
        ? (settings?.defaultValue || []).slice(0, settings?.selection?.exactNumber || 1)
        : value === "Range"
          ? (settings?.defaultValue || []).slice(0, settings?.selection?.range?.end || 2)
          : settings?.defaultValue || [];

    onChange({
      settings: {
        ...settings,
        selection: {
          ...settings?.selection,
          type: value,
        },
        defaultValue: updatedDefaultValue,
      },
    });
  };

  const onExactNumberChange = (value: number) => {
    onChange({
      settings: {
        ...settings,
        defaultValue: (settings?.defaultValue || []).slice(0, value),
        selection: {
          ...settings?.selection,
          exactNumber: value,
        },
      },
    });
  };

  const onRangeChange = (type: "start" | "end", value: number) => {
    if (type === "start") {
      onChange({
        settings: {
          ...settings,
          selection: {
            ...settings?.selection,
            range: {
              start: value,
              end: maxValue > value ? maxValue : value + 1,
            },
          },
        },
      });
    } else {
      onChange({
        settings: {
          ...settings,
          defaultValue: (settings?.defaultValue || []).slice(0, value),
          selection: {
            ...settings?.selection,
            range: {
              ...settings?.selection?.range,
              end: value,
            },
          },
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <SettingsCard
        questionType={question?.type}
        title="Basic Settings"
        icon={icons.settings}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Required"
            description="Users must select at least one option before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-mcq-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Selected Options</Label>
          <Popover open={defaultValueOpen} onOpenChange={setDefaultValueOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={defaultValueOpen}
                className={cn(
                  "w-full justify-between h-9 rounded-md font-normal",
                  (!settings?.defaultValue?.length) && "text-muted-foreground"
                )}
                data-testid="v2-mcq-default-value"
              >
                <span className="flex-1 text-left truncate">
                  {Array.isArray(settings?.defaultValue) && settings.defaultValue.length > 0 ? (
                    <span className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs max-w-[8rem] truncate">
                        {settings.defaultValue[0]}
                      </Badge>
                      {settings.defaultValue.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          +{settings.defaultValue.length - 1}
                        </span>
                      )}
                    </span>
                  ) : (
                    "Select default options..."
                  )}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  {Array.isArray(settings?.defaultValue) && settings.defaultValue.length > 0 && (
                    <span
                      role="button"
                      tabIndex={-1}
                      className="inline-flex cursor-pointer rounded-sm opacity-50 hover:opacity-100 p-0.5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDefaultValueChange([]);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      aria-label="Clear selection"
                    >
                      <XIcon className="h-4 w-4" />
                    </span>
                  )}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0 rounded-md overflow-hidden"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder="Search..."
                  value={defaultValueSearch}
                  onValueChange={setDefaultValueSearch}
                />
                <CommandList>
                  <CommandEmpty className="py-6 text-center text-sm">
                    No option found.
                  </CommandEmpty>
                  <CommandGroup>
                    {(() => {
                      const searchLower = defaultValueSearch.toLowerCase();
                      const filtered = defaultValueSearch
                        ? questionOptions.filter((opt) =>
                            String(opt).toLowerCase().includes(searchLower)
                          )
                        : questionOptions;
                      return filtered.map((option) => {
                        const selected = (settings?.defaultValue || []).includes(option);
                        return (
                          <CommandItem
                            key={option}
                            value={String(option)}
                            onSelect={() => {
                              const current = settings?.defaultValue || [];
                              const next = selected
                                ? current.filter((v) => v !== option)
                                : [...current, option];
                              onDefaultValueChange(next);
                            }}
                            className="cursor-pointer"
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                selected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="truncate">{option}</span>
                          </CommandItem>
                        );
                      });
                    })()}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {settings?.errors?.defaultValueError ? (
            <HelperText error>
              {settings.errors.defaultValueError}
            </HelperText>
          ) : (
            <HelperText>
              Options pre-selected when the form loads
            </HelperText>
          )}
        </div>

        <div className="space-y-2">
          <Label>Button Label</Label>
          <CTAEditor style={{}} hideLabel />
          <HelperText>
            Text shown on the button to proceed to the next question
          </HelperText>
        </div>
      </SettingsCard>

      <SettingsCard
        questionType={question?.type}
        title="Choice Options"
        icon={icons.list}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Shuffle options"
            description="Randomize the order of options each time"
            checked={settings?.randomize || false}
            onChange={(checked) => updateSettings("randomize", checked)}
            dataTestId="v2-mcq-randomize"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Stack vertically"
            description="Display options in a vertical list"
            checked={settings?.isAlignmentVertical || false}
            onChange={(checked) => updateSettings("isAlignmentVertical", checked)}
            dataTestId="v2-mcq-vertical"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Include 'Other' option"
            description="Add an 'Other' option for custom answers"
            checked={settings?.other || false}
            onChange={(checked) => updateSettings("other", checked)}
            dataTestId="v2-mcq-other"
          />
        </div>

        {settings?.other && (
          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
            <SettingSwitch
              label="Allow custom text input"
              description="Let users type their answer when selecting 'Other'"
              checked={settings?.allowOtherInput || false}
              onChange={(checked) => updateSettings("allowOtherInput", checked)}
              dataTestId="v2-mcq-allow-other-input"
            />
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        questionType={question?.type}
        title="Selection Limits"
        icon={icons.list}
      >
        <div className="space-y-2">
          <Label>Selection Type</Label>
          <Select
            value={selectionType}
            onValueChange={(v) => onSelectionChange(v)}
            data-testid="v2-mcq-selection-type"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select limit type" />
            </SelectTrigger>
            <SelectContent>
              {SELECTION_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <HelperText>
            How many options users can select
          </HelperText>
        </div>

        {selectionType === "Exact Number" && (
          <div className="space-y-2">
            <Label>Exact Count</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Must select exactly
              </span>
              <Select
                value={String(exactValue)}
                onValueChange={(v) => onExactNumberChange(Number(v))}
                data-testid="v2-mcq-exact-number"
              >
                <SelectTrigger className="w-[5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {createArray(questionOptions.length || 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                option(s)
              </span>
            </div>
          </div>
        )}

        {selectionType === "Range" && (
          <div className="space-y-2">
            <Label>Selection Range</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Between
              </span>
              <Select
                value={String(minValue)}
                onValueChange={(v) => onRangeChange("start", Number(v))}
                data-testid="v2-mcq-range-min"
              >
                <SelectTrigger className="w-[5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {createArray(questionOptions.length || 1, "min").map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                and
              </span>
              <Select
                value={String(maxValue)}
                onValueChange={(v) => onRangeChange("end", Number(v))}
                data-testid="v2-mcq-range-max"
              >
                <SelectTrigger className="w-[5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {createArray(
                    questionOptions.length || 1,
                    "max",
                    minValue
                  ).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                options
              </span>
            </div>
          </div>
        )}
      </SettingsCard>

      <CollapsibleSettingsCard
        questionType={question?.type}
        title="Advanced"
        icon={icons.settings}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <Label>Tooltip Text</Label>
          <Textarea
            value={settings?.toolTipText || ""}
            placeholder="e.g., Select all that apply"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-mcq-tooltip"
          />
          <HelperText>
            Help text that appears when users hover over the question
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Internal Key</Label>
          <div className="flex items-center gap-2">
            <Input
              value={settings?.accessKey || ""}
              placeholder="Enter a key"
              onChange={(e) => updateSettings("accessKey", e.target.value)}
              data-testid="v2-mcq-access-key"
              className="flex-1"
            />
            {settings?.accessKey && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyKey}
                type="button"
                title="Copy to clipboard"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <HelperText>
            Unique identifier for this field in API responses and data exports
          </HelperText>
        </div>
      </CollapsibleSettingsCard>
    </div>
  );
};

export default MCQSettings;
