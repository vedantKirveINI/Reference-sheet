import { useCallback, useEffect, useRef, useState } from "react";
import isEmpty from "lodash-es/isEmpty";
import { cn } from "@/lib/utils";
import { CANVAS_MODE, CANVAS_MODES } from "@oute/oute-ds.core.constants";
import SettingSwitch from "../components/SettingSwitch";
import { DropdownV2 } from "../components/DropdownV2";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { icons } from "@/components/icons";
import { Settings, Copy, Database, ListChecks, Sliders } from "lucide-react";
import {
  DropdownSourceTypeSelector,
  DropdownSourceType,
  TinyTableSourceConfig,
  DynamicSourceConfig,
  StaticOptionsEditor,
} from "./dropdown-source";
import { NODE_ERROR_MESSAGES } from "@/module/constants/node-error-messages";
import { QuestionType } from "@/module/constants/questionType";

const SELECTION_TYPE_OPTIONS = [
  { label: "Single", value: "Single" },
  { label: "Multiple", value: "Unlimited" },
  { label: "Exact Number", value: "Exact Number" },
  { label: "Range", value: "Range" },
];

const OTHER_OPTION_VALUE = "Other";

const getDefaultNotInOptionsError = (
  options: string[],
  defaultChoice: string | string[] | undefined,
  includeOtherOption: boolean
): string => {
  if (!defaultChoice || (Array.isArray(defaultChoice) && defaultChoice.length === 0)) {
    return "";
  }
  const validOptions = includeOtherOption
    ? [...options, OTHER_OPTION_VALUE]
    : options;
  const choices = Array.isArray(defaultChoice) ? defaultChoice : [defaultChoice];
  const hasInvalid = choices.some(
    (c) => c !== "" && c != null && !validOptions.includes(c)
  );
  if (!hasInvalid) return "";
  return NODE_ERROR_MESSAGES[QuestionType.DROP_DOWN_STATIC].defaultValueError;
};

const createArray = (length: number, type?: string, start?: number) => {
  if (type === "min") {
    return Array.from({ length: Math.max(length - 1, 1) }, (_, index) => index + 1);
  }
  if (type === "max" && start != null) {
    const array = Array.from({ length: Math.max(length, 1) }, (_, index) => index + 1);
    for (let i = 0; i < Math.min(start, array.length); i++) {
      array.shift();
    }
    return array;
  }
  return Array.from({ length: Math.max(length, 1) }, (_, index) => index + 1);
};

interface DropdownSettingsProps {
  question: any;
  onChange: (val: any) => void;
  variables?: any;
  highlightDataSource?: boolean;
}

const deriveSourceType = (settings: any, dynamicInputs: any): DropdownSourceType => {
  if (settings?.sourceType) {
    return settings.sourceType;
  }
  if (dynamicInputs?.sourceNode) {
    return "tinyTable";
  }
  if (dynamicInputs?.variable?.blocks?.length > 0) {
    return "dynamic";
  }
  return "static";
};

const DropdownSettings = ({
  question,
  onChange,
  variables = {},
  highlightDataSource = false,
}: DropdownSettingsProps) => {
  const dataSourceRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);

  const settings = question?.settings || {};
  const dynamicInputs = settings?.dynamicInputs || {};

  const sourceType: DropdownSourceType = deriveSourceType(settings, dynamicInputs);

  const options: string[] = question?.options || [];

  const selectionType = settings?.selectionType || "Single";
  const exactNumber = settings?.exactNumber ?? 1;
  const minNumber = settings?.minNumber ?? 1;
  const maxNumber = settings?.maxNumber ?? 2;
  const maxOptionsLength =
    sourceType === "static" ? Math.max(options.length, 1) : 21;

  useEffect(() => {
    if (!highlightDataSource) return;
    setHighlight(true);
    const t = setTimeout(() => setHighlight(false), 2500);
    return () => clearTimeout(t);
  }, [highlightDataSource]);

  useEffect(() => {
    if (!highlightDataSource) return;
    const scrollDataSourceIntoView = () => {
      dataSourceRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    };
    scrollDataSourceIntoView();
    const t1 = setTimeout(scrollDataSourceIntoView, 100);
    const t2 = setTimeout(scrollDataSourceIntoView, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [highlightDataSource]);

  // Single source of truth for defaultChoiceError (invalid options + count) and optionsError (static, no options)
  useEffect(() => {
    let invalidOptionsError = "";
    let optionsError = "";
    if (sourceType === "static") {
      if (!options || options.length <= 0) {
        optionsError =
          NODE_ERROR_MESSAGES[QuestionType.DROP_DOWN_STATIC].optionsError;
      }
      invalidOptionsError = getDefaultNotInOptionsError(
        options,
        settings?.defaultChoice,
        !!settings?.includeOtherOption
      );
    }
    let countError = "";
    const defaultChoice = settings?.defaultChoice;
    if (selectionType === "Exact Number") {
      if (
        Array.isArray(defaultChoice) &&
        defaultChoice.length > exactNumber
      ) {
        countError = `Default Value should be less than or equal to ${exactNumber}`;
      }
    } else if (selectionType === "Range") {
      if (
        Array.isArray(defaultChoice) &&
        defaultChoice.length > maxNumber
      ) {
        countError = `Default Value should be less than or equal to ${maxNumber}`;
      }
    }
    const defaultChoiceError = invalidOptionsError || countError;
    const errorsChanged =
      defaultChoiceError !== (settings?.errors?.defaultChoiceError ?? "") ||
      optionsError !== (settings?.errors?.optionsError ?? "");
    if (errorsChanged) {
      onChange({
        settings: {
          ...settings,
          errors: {
            ...settings?.errors,
            defaultChoiceError,
            ...(optionsError ? { optionsError } : { optionsError: "" }),
          },
        },
      });
    }
  }, [
    sourceType,
    options,
    settings?.defaultChoice,
    settings?.includeOtherOption,
    selectionType,
    exactNumber,
    maxNumber,
    settings?.errors?.defaultChoiceError,
    settings?.errors?.optionsError,
    onChange,
    settings,
  ]);

  const updateSettings = useCallback(
    (key: string, value: any, errors?: Record<string, string>) => {
      onChange({
        settings: {
          ...settings,
          [key]: value,
          errors: { ...settings?.errors, ...errors },
        },
      });
    },
    [onChange, settings]
  );

  const updateDynamicInputs = useCallback(
    (key: string, value: any) => {
      onChange({
        settings: {
          ...settings,
          dynamicInputs: {
            ...dynamicInputs,
            [key]: value,
          },
        },
      });
    },
    [onChange, settings, dynamicInputs]
  );

  const handleSourceTypeChange = useCallback(
    (newType: DropdownSourceType) => {
      onChange({
        settings: {
          ...settings,
          sourceType: newType,
          dynamicInputs: {
            ...dynamicInputs,
            variable: { type: "fx", blocks: [] }, // Clear source data
          },
        },
      });
    },
    [onChange, settings, dynamicInputs]
  );

  const handleTinyTableVariableChange = useCallback(
    (blocks: any[], nodeId?: string) => {
      onChange({
        settings: {
          ...settings,
          dynamicInputs: {
            ...dynamicInputs,
            variable: { type: "fx", blocks },
            sourceNode: nodeId || dynamicInputs?.sourceNode,
          },
        },
      });
    },
    [onChange, settings, dynamicInputs]
  );

  const handleOptionsChange = useCallback(
    (newOptions: string[]) => {
      onChange({
        options: newOptions,
        settings: { ...settings },
      });
    },
    [onChange, settings]
  );

  const handleIdAccessorChange = useCallback(
    (accessor: string) => {
      updateDynamicInputs("idAccessor", accessor);
    },
    [updateDynamicInputs]
  );

  const handleLabelAccessorChange = useCallback(
    (accessor: string) => {
      updateDynamicInputs("labelAccessor", accessor);
    },
    [updateDynamicInputs]
  );

  const handleVariableChange = useCallback(
    (blocks: any[]) => {
      updateDynamicInputs("variable", { type: "fx", blocks });
    },
    [updateDynamicInputs]
  );

  const handleSelectionTypeChange = useCallback(
    (value: string) => {
      let defaultChoice = settings?.defaultChoice;
      if (value === "Single") {
        defaultChoice = Array.isArray(defaultChoice)
          ? defaultChoice?.[0]
          : defaultChoice;
      }
      if (
        (value === "Unlimited" || value === "Exact Number" || value === "Range") &&
        !Array.isArray(defaultChoice)
      ) {
        defaultChoice = isEmpty(defaultChoice) ? [] : [defaultChoice];
      }
      onChange({
        settings: {
          ...settings,
          selectionType: value,
          defaultChoice,
        },
      });
    },
    [onChange, settings]
  );

  const handleExactNumberChange = useCallback(
    (value: number) => {
      onChange({
        settings: {
          ...settings,
          exactNumber: value,
        },
      });
    },
    [onChange, settings]
  );

  const handleRangeChange = useCallback(
    (key: "minNumber" | "maxNumber", value: number) => {
      if (key === "minNumber") {
        const nextMax = maxNumber > value ? maxNumber : value + 1;
        onChange({
          settings: {
            ...settings,
            minNumber: value,
            maxNumber: nextMax,
          },
        });
      } else {
        onChange({
          settings: {
            ...settings,
            maxNumber: value,
          },
        });
      }
    },
    [onChange, settings, maxNumber]
  );

  const getStaticDefaultValue = (): string | string[] => {
    const dc = settings?.defaultChoice;
    if (selectionType === "Single") {
      return Array.isArray(dc) ? (dc[0] ?? "") : (dc ?? "");
    }
    return Array.isArray(dc) ? dc : dc != null && dc !== "" ? [dc] : [];
  };

  const handleStaticDefaultChoiceChange = useCallback(
    (value: string | string[]) => {
      const valueArr = Array.isArray(value) ? value : [value];
      const newDefaultChoice = selectionType === "Single" ? valueArr[0] : valueArr;
      onChange({
        settings: {
          ...settings,
          defaultChoice: newDefaultChoice,
        },
      });
    },
    [onChange, settings, selectionType]
  );

  const handleCopyKey = () => {
    if (settings?.accessKey) {
      navigator.clipboard.writeText(settings.accessKey);
    }
  };

  const renderSourceConfig = () => {
    switch (sourceType) {
      case "tinyTable":
        return (
          <TinyTableSourceConfig
            variableBlocks={dynamicInputs?.variable?.blocks || []}
            idAccessor={dynamicInputs?.idAccessor || ""}
            labelAccessor={dynamicInputs?.labelAccessor || ""}
            variables={variables}
            onVariableChange={handleTinyTableVariableChange}
            onIdAccessorChange={handleIdAccessorChange}
            onLabelAccessorChange={handleLabelAccessorChange}
          />
        );

      case "dynamic":
        return (
          <DynamicSourceConfig
            variableBlocks={dynamicInputs?.variable?.blocks || []}
            idAccessor={dynamicInputs?.idAccessor || ""}
            labelAccessor={dynamicInputs?.labelAccessor || ""}
            variables={variables}
            onVariableChange={handleVariableChange}
            onIdAccessorChange={handleIdAccessorChange}
            onLabelAccessorChange={handleLabelAccessorChange}
          />
        );

      case "static":
      default:
        return (
          <StaticOptionsEditor
            options={options}
            onChange={handleOptionsChange}
          />
        );
    }
  };

  const defaultChoiceError = settings?.errors?.defaultChoiceError;
  const staticOptionsWithOther = settings?.includeOtherOption
    ? [...options, OTHER_OPTION_VALUE]
    : options;
  const defaultForSingle = getStaticDefaultValue() as string;
  const isDefaultNotInOptions =
    !!defaultForSingle && !staticOptionsWithOther.includes(defaultForSingle);
  const maxSelectable =
    selectionType === "Exact Number"
      ? exactNumber
      : selectionType === "Range"
        ? maxNumber
        : null;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div
          ref={dataSourceRef}
          className={cn(
            "rounded-lg transition-colors duration-300",
            highlight && "bg-primary/10"
          )}
          data-testid="dropdown-settings-data-source-card"
        >
          <SettingsCard questionType={question?.type} title="Data Source" icon={Database}>
            <DropdownSourceTypeSelector
              value={sourceType}
              onChange={handleSourceTypeChange}
            />

            <div className="mt-4 pt-4 border-t border-gray-100">
              {renderSourceConfig()}
              {sourceType === "static" && settings?.errors?.optionsError && (
                <HelperText error className="mt-2">
                  {settings.errors.optionsError}
                </HelperText>
              )}
            </div>
          </SettingsCard>
        </div>

        <SettingsCard
          questionType={question?.type}
          title="Basic Settings"
          icon={Settings}
        >
          <div className="space-y-2">
            <SettingSwitch
              label="Required"
              description="Users must select an option before submitting"
              checked={settings?.required || false}
              onChange={(checked) => updateSettings("required", checked)}
              dataTestId="v2-dropdown-required"
            />
          </div>

          {sourceType === "static" && (
            <div className="space-y-2">
              <Label>Default Value</Label>
              {selectionType === "Single" ? (
                <Select
                  value={(getStaticDefaultValue() as string) || ""}
                  onValueChange={(value) =>
                    handleStaticDefaultChoiceChange(value)
                  }
                  data-testid="v2-dropdown-default-choice"
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      defaultChoiceError &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={!!defaultChoiceError}
                  >
                    {isDefaultNotInOptions ? (
                      <span className="flex-1 min-w-0 text-left truncate">
                        {defaultForSingle}
                      </span>
                    ) : (
                      <div className="flex-1 min-w-0 text-left">
                        <SelectValue placeholder="Select default..." />
                      </div>
                    )}
                    {defaultForSingle && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 opacity-60 hover:opacity-100 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleStaticDefaultChoiceChange("");
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        aria-label="Clear selection"
                      >
                        <icons.x className="h-4 w-4" />
                      </Button>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {staticOptionsWithOther.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div
                  className={cn(
                    defaultChoiceError &&
                      "rounded-md ring-1 ring-destructive ring-offset-0"
                  )}
                  aria-invalid={!!defaultChoiceError}
                >
                  <DropdownV2
                    multiple
                    searchable
                    disableCloseOnSelect
                    options={staticOptionsWithOther}
                    value={getStaticDefaultValue() as string[]}
                    onChange={(value: unknown) =>
                      handleStaticDefaultChoiceChange(value as string | string[])
                    }
                    isOptionEqualToValue={(opt: string, val: string) => opt === val}
                    placeholder="Select default..."
                    dataTestId="v2-dropdown-default-choice"
                    getOptionDisabled={
                      maxSelectable != null
                        ? (option: string) => {
                            const current =
                              (getStaticDefaultValue() as string[]) || [];
                            return (
                              current.length >= maxSelectable &&
                              !current.includes(option)
                            );
                          }
                        : undefined
                    }
                  />
                </div>
              )}
              {defaultChoiceError ? (
                <HelperText error>{defaultChoiceError}</HelperText>
              ) : (
                <HelperText>Pre-selected option when the form loads</HelperText>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Button Label</Label>
            <CTAEditor
              question={question}
              onQuestionChange={(partial) => onChange(partial)}
              style={{}}
              hideLabel
            />
            <HelperText>Text shown on the button to proceed</HelperText>
          </div>
        </SettingsCard>

        <SettingsCard
          questionType={question?.type}
          title="Dropdown Options"
          icon={ListChecks}
        >
          <div className="space-y-2">
            <SettingSwitch
              label="Searchable"
              description="Allow users to type to filter options"
              checked={settings?.searchable !== false}
              onChange={(checked) => updateSettings("searchable", checked)}
              dataTestId="v2-dropdown-searchable"
            />
          </div>

          <div className="space-y-2">
            <Label>Placeholder Text</Label>
            <Input
              value={settings?.placeholder || ""}
              placeholder="Select an option..."
              onChange={(e) => updateSettings("placeholder", e.target.value)}
              data-testid="v2-dropdown-placeholder"
            />
            <HelperText>Text shown before a selection is made</HelperText>
          </div>

          <div className="space-y-2">
            <Label>Selection Type</Label>
            <Select
              value={selectionType}
              onValueChange={handleSelectionTypeChange}
              data-testid="v2-dropdown-selection-type"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {SELECTION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <HelperText>How many options users can select</HelperText>
          </div>

          {selectionType === "Exact Number" && (
            <div className="space-y-2">
              <Label>Exact Selection Count</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Must select exactly</span>
                <Select
                  value={String(exactNumber)}
                  onValueChange={(v) => handleExactNumberChange(Number(v))}
                  data-testid="v2-dropdown-exact-number"
                >
                  <SelectTrigger className="w-auto min-w-[4rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {createArray(maxOptionsLength).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">option(s)</span>
              </div>
            </div>
          )}

          {selectionType === "Range" && (
            <div className="space-y-2">
              <Label>Selection Range</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Between</span>
                <Select
                  value={String(minNumber)}
                  onValueChange={(v) => handleRangeChange("minNumber", Number(v))}
                  data-testid="v2-dropdown-range-min"
                >
                  <SelectTrigger className="w-auto min-w-[4rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {createArray(maxOptionsLength, "min").map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">and</span>
                <Select
                  value={String(maxNumber)}
                  onValueChange={(v) => handleRangeChange("maxNumber", Number(v))}
                  data-testid="v2-dropdown-range-max"
                >
                  <SelectTrigger className="w-auto min-w-[4rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {createArray(maxOptionsLength, "max", minNumber).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">options</span>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <TooltipProvider>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SettingSwitch
                        label="Shuffle"
                        description="Randomize order each time"
                        checked={settings?.randomize || false}
                        onChange={(checked) => {
                          onChange({
                            settings: {
                              ...settings,
                              randomize: checked,
                              isAlphabeticallyArranged: checked
                                ? false
                                : settings?.isAlphabeticallyArranged,
                            },
                          });
                        }}
                        dataTestId="v2-dropdown-randomize"
                      />
                    </div>
                  </TooltipTrigger>
                  {!settings?.randomize && settings?.isAlphabeticallyArranged && (
                    <TooltipContent>Turn off Sort A-Z to enable</TooltipContent>
                  )}
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SettingSwitch
                        label="Sort A-Z"
                        description="Alphabetical order"
                        checked={settings?.isAlphabeticallyArranged || false}
                        onChange={(checked) => {
                          onChange({
                            settings: {
                              ...settings,
                              isAlphabeticallyArranged: checked,
                              randomize: checked ? false : settings?.randomize,
                            },
                          });
                        }}
                        dataTestId="v2-dropdown-arrange-alphabetically"
                      />
                    </div>
                  </TooltipTrigger>
                  {!settings?.isAlphabeticallyArranged && settings?.randomize && (
                    <TooltipContent>Turn off Shuffle to enable</TooltipContent>
                  )}
                </Tooltip>
                {sourceType === "static" && (
                  <SettingSwitch
                    label="Add 'Other'"
                    description="Let users type a custom answer"
                    checked={settings?.includeOtherOption || false}
                    onChange={(checked) => {
                      if (
                        !checked &&
                        (Array.isArray(settings?.defaultChoice)
                          ? settings?.defaultChoice?.includes(OTHER_OPTION_VALUE)
                          : settings?.defaultChoice === OTHER_OPTION_VALUE)
                      ) {
                        onChange({
                          settings: {
                            ...settings,
                            defaultChoice: selectionType === "Single" ? "" : [],
                            includeOtherOption: checked,
                          },
                        });
                      } else {
                        updateSettings("includeOtherOption", checked);
                      }
                    }}
                    dataTestId="v2-dropdown-include-other"
                  />
                )}
              </div>
            </TooltipProvider>
          </div>
        </SettingsCard>

        <CollapsibleSettingsCard
          questionType={question?.type}
          title="Advanced"
          icon={Sliders}
          defaultOpen={false}
        >
          <div className="space-y-2">
            <Label>Tooltip Text</Label>
            <Textarea
              value={settings?.toolTipText || ""}
              placeholder="Help text shown on hover"
              onChange={(e) => updateSettings("toolTipText", e.target.value)}
              data-testid="v2-dropdown-tooltip"
            />
            <HelperText>Additional guidance shown when hovering over the field</HelperText>
          </div>

          <div className="space-y-2">
            <Label>Internal Key</Label>
            <div className="flex items-center gap-2">
              <Input
                value={settings?.accessKey || ""}
                placeholder="e.g., country_code"
                onChange={(e) => updateSettings("accessKey", e.target.value)}
                data-testid="v2-dropdown-access-key"
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
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <HelperText>Unique identifier for API responses and exports</HelperText>
          </div>

          {(sourceType === "tinyTable" || sourceType === "dynamic") && (
            <div className="space-y-2">
              <SettingSwitch
                label="Return full record"
                description="Include all fields from the data source, not just the selected value"
                checked={dynamicInputs?.mapObjectItems || false}
                onChange={(checked) =>
                  updateDynamicInputs("mapObjectItems", checked)
                }
                dataTestId="v2-dropdown-map-object"
              />
            </div>
          )}

          {CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS && (
            <>
              <div className="space-y-2">
                <SettingSwitch
                  label="Enable Map"
                  description="Show this field as a map in the CMS"
                  checked={settings?.enableMap || false}
                  onChange={(checked) => updateSettings("enableMap", checked)}
                  dataTestId="v2-dropdown-enable-map"
                />
              </div>
              <div className="space-y-2">
                <SettingSwitch
                  label="Advanced only"
                  description="Only show in advanced settings mode"
                  checked={settings?.isAdvancedField || false}
                  onChange={(checked) =>
                    updateSettings("isAdvancedField", checked)
                  }
                  dataTestId="v2-dropdown-advanced-field"
                />
              </div>
            </>
          )}
        </CollapsibleSettingsCard>
      </div>
    </TooltipProvider>
  );
};

export default DropdownSettings;
