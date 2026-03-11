import React, { Fragment, useMemo, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { isEmpty, lowerCase, toUpper } from "lodash";
import { icons } from "@/components/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import NESTED_FIELD_MAPPING from "@src/module/condition-composer/constant/nestedFieldMapping";
import QUESTION_TYPE_ICON from "@src/module/condition-composer/constant/questionTypeIcon";


const PILL_ACCENT_SELECTED =
  "bg-muted/90 dark:bg-muted/50 text-foreground border border-border"

const getLabelValue = (label) => {
  if (!label) return "";
  if (label.length < 50) return label;
  return `${label.slice(0, 50)}...`;
};

const FieldPill = ({ field, isSelected, onClick, onExpandToggle, isExpanded, hasNested }) => {
  const displayName = field.nodeNumber
    ? `${field.nodeNumber}. ${getLabelValue(field.description || field.name)}`
    : getLabelValue(field.description || field.name);

  return (
    <div
      className="flex w-full items-center gap-1.5 cursor-pointer group/pill rounded-lg outline-none focus-visible:outline-none focus-visible:ring-0 transition-shadow"
      onClick={(e) => {
        if (e.target.closest('[data-action="expand"]')) {
          onExpandToggle?.();
          return;
        }
        onClick();
      }}
    >
      <div
        className={cn(
          "flex w-full min-w-0 items-center gap-2 pl-2 pr-2.5 py-2 text-sm font-medium transition-all",
          "hover:shadow-md hover:brightness-[0.98] dark:hover:brightness-110 rounded-md",
          isSelected
            ? PILL_ACCENT_SELECTED
            : "",
        )}
      >
        {QUESTION_TYPE_ICON[field.type] && (
          <img
            src={QUESTION_TYPE_ICON[field.type]}
            alt=""
            className={cn("w-4 h-4 flex-shrink-0")}
          />
        )}
        <span className="truncate min-w-0 flex-1" title={field.description || field.name}>
          {displayName}
        </span>
      </div>
      {hasNested && (
        <div
          data-action="expand"
          className="p-1 rounded-md hover:bg-muted cursor-pointer transition-colors shrink-0"
        >
          {isExpanded ? (
            <icons.chevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <icons.chevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
};

const NestedFieldPill = ({ field, nestedField, isSelected, onClick }) => {
  return (
    <div
      className={cn(
        "w-full ml-5 pl-2 border-l-2 cursor-pointer rounded-r-lg outline-none focus-visible:outline-none focus-visible:ring-0 transition-shadow",
        isSelected ? "border-l-primary" : ""
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex w-full min-w-0 items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg text-sm font-medium transition-all",
          "hover:shadow-md hover:brightness-[0.98] dark:hover:brightness-110",
          isSelected
            ? `${PILL_ACCENT_SELECTED} opacity-95`
            : `opacity-90`,
        )}
      >
        <span className="truncate min-w-0 flex-1" title={nestedField.label || nestedField.key}>
          {nestedField.label || nestedField.key}
        </span>
      </div>
    </div>
  );
};

const VariableSelector = ({
  schema = [],
  selectedField,
  selectedNestedField,
  onFieldSelect,
  placeholder = "Select a field",
  className = "",
  error = false,
}) => {
  const [open, setOpen] = useState(false);
  const [expandedFields, setExpandedFields] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const displayValue = useMemo(() => {
    if (isEmpty(selectedField)) return placeholder;
    const fieldInfo = schema.find((f) => f.name === selectedField);
    const fieldLabel = fieldInfo
      ? (fieldInfo.nodeNumber
        ? `${fieldInfo.nodeNumber}. ${fieldInfo.description || fieldInfo.label}`
        : fieldInfo.description || fieldInfo.label || fieldInfo.name)
      : selectedField;

    if (selectedNestedField) {
      const nestedList = fieldInfo ? NESTED_FIELD_MAPPING[toUpper(fieldInfo?.type)] : null;
      const nestedEntry = nestedList?.find((n) => n.key === selectedNestedField);
      const nestedLabel = nestedEntry?.label ?? selectedNestedField;
      return `${fieldLabel} (${nestedLabel})`;
    }

    return fieldLabel;
  }, [selectedField, selectedNestedField, schema, placeholder]);

  const hasSelection = !isEmpty(selectedField);

  useEffect(() => {
    if (open && selectedNestedField && selectedField) {
      setExpandedFields((prev) => ({ ...prev, [selectedField]: true }));
    }
  }, [open, selectedNestedField, selectedField]);

  const filteredSchema = useMemo(() => {
    if (!searchQuery.trim()) return schema;
    const q = lowerCase(searchQuery);
    return schema.filter((field) => {
      const fieldName = lowerCase(field?.name || "");
      const fieldLabel = lowerCase(field?.label || "");
      const fieldDesc = lowerCase(field?.description || "");
      return fieldName.includes(q) || fieldLabel.includes(q) || fieldDesc.includes(q);
    });
  }, [schema, searchQuery]);

  const handleExpandToggle = useCallback((fieldName) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  }, []);

  const handleFieldSelect = useCallback(({ field, nestedField }) => {
    setOpen(false);
    setExpandedFields({});
    setSearchQuery("");
    onFieldSelect({ field, nestedField });
  }, [onFieldSelect]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onFieldSelect({ field: null, nestedField: undefined });
  }, [onFieldSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "border border-input flex items-center justify-between px-3 py-2 rounded-md h-9 bg-background box-border cursor-pointer hover:border-gray-400 transition-colors outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 text-sm",
            !hasSelection && "text-muted-foreground",
            hasSelection && "text-foreground",
            error && !hasSelection && "border-red-300 bg-red-50/30",
            className
          )}
          data-testid="condition-variable-select"
        >
          <span className="truncate font-normal leading-6 tracking-[0.03125rem] font-['Inter']">
            {displayValue}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {hasSelection && (
              <div
                role="button"
                onClick={handleClear}
                className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              >
                <span className="text-xs font-bold">✕</span>
              </div>
            )}
            <icons.chevronRight
              className={cn(
                "w-4 h-4 transition-transform duration-100 ease-in text-muted-foreground",
                open ? "-rotate-90" : "rotate-90"
              )}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[260px] max-w-[min(320px,90vw)]"
        align="start"
        sideOffset={4}
      >
        <div className="p-3 rounded-md bg-white" data-testid="condition-variable-popover">
          <div className="relative mb-3">
            <icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Find fields"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm border-gray-200"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto overflow-x-hidden max-h-[min(15rem,70vh)]">
            <div className="flex flex-col gap-1">
              {filteredSchema.length === 0 && (
                <div className="py-4 text-center text-sm text-gray-500">
                  No fields found
                </div>
              )}

              {filteredSchema.map((field, index) => {
                const hasNestedField = !!NESTED_FIELD_MAPPING[toUpper(field?.type)];
                const isFieldSelected = selectedField === field?.name && !selectedNestedField;
                const isExpanded = expandedFields[field?.name];

                return (
                  <Fragment key={field?.id || field?.name || index}>
                    <FieldPill
                      field={field}
                      isSelected={isFieldSelected}
                      onClick={() => handleFieldSelect({ field, nestedField: undefined })}
                      onExpandToggle={() => handleExpandToggle(field?.name)}
                      isExpanded={isExpanded}
                      hasNested={hasNestedField}
                    />

                    {hasNestedField && isExpanded && (
                      <div className="flex flex-col gap-2 overflow-hidden transition-all duration-100 ease-linear">
                        {NESTED_FIELD_MAPPING[toUpper(field?.type)].map((nestedField) => {
                          const isNestedSelected =
                            selectedField === field?.name &&
                            selectedNestedField === nestedField?.key;
                          return (
                            <NestedFieldPill
                              key={nestedField?.key}
                              field={field}
                              nestedField={nestedField}
                              isSelected={isNestedSelected}
                              onClick={() =>
                                handleFieldSelect({
                                  field,
                                  nestedField: nestedField?.key,
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    )}


                    <div className="h-1 flex items-center my-1">
                      <div className="flex-grow border-t opacity-30" style={{ borderColor: "#d7d7d7" }}></div>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VariableSelector;
