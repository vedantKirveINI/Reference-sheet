import React, { useMemo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WrapText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyValueGrid } from "@src/module/key-value-table/key-value-grid";
import { FormulaCellEditor } from "@src/module/key-value-table/key-value-grid/formula-cell";
import questionDataTypeMapping from "@src/module/input-grid-v2/constant/questionDataTypeMapping";
import {
  mapSheetTypeToFormulaType,
  getSheetTypeDisplayName,
  getSheetTypeIcon,
  getSheetTypeIconColor,
  convertApplicationTypeToSDKType,
} from "./sheetTypeMapping";
import {
  getComplexTypeSchema,
  serializeSubFieldsToValue,
  createComplexValueFromSubFields,
} from "./sheetRecordUtils";

function TypeIcon({ fieldType }) {
  const displayName = getSheetTypeDisplayName(fieldType);
  const IconComponent = getSheetTypeIcon(fieldType);
  const colorClass = getSheetTypeIconColor(fieldType);

  const iconContent = !IconComponent ? (
    <div className="w-4 h-4 flex items-center justify-center text-gray-400 text-xs">−</div>
  ) : (
    <IconComponent className={cn("w-4 h-4", colorClass)} />
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center cursor-default">
            {iconContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {displayName}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SheetUpdateGrid({
  fields = [],
  record = [],
  onChange,
  variables,
  "data-testid": dataTestId = "sheet-update-grid",
}) {
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(false);

  const rowData = useMemo(() => {
    const rows = [];

    fields.forEach((field) => {
      const recordItem = record.find((r) => r.fieldId === field.id);
      const hasValue = recordItem?.value?.blocks?.length > 0;
      const complexSchema = getComplexTypeSchema(field.type);

      if (complexSchema) {
        const subFieldValues = recordItem?.subFields || {};
        const anySubFieldHasValue = Object.values(subFieldValues).some(
          (v) => v?.blocks?.length > 0 || v?.blockStr
        );

        rows.push({
          key: field.name,
          fieldId: field.id,
          value: recordItem?.value?.blocks || [],
          fieldType: field.type || "text",
          isChecked: recordItem?.isChecked ?? recordItem?.checked ?? (hasValue || anySubFieldHasValue),
          field: field,
          isParent: true,
          subFieldSchema: complexSchema,
          subFieldValues: subFieldValues,
          isEditable: false,
        });

        complexSchema.forEach((subField, subIndex) => {
          const subFieldValue = subFieldValues[subField.key];
          const parentChecked = recordItem?.isChecked ?? recordItem?.checked ?? (hasValue || anySubFieldHasValue);
          rows.push({
            key: subField.displayKeyName || subField.key,
            fieldId: `${field.id}__${subField.key}`,
            parentFieldId: field.id,
            subFieldKey: subField.key,
            value: subFieldValue?.blocks || [],
            fieldType: subField.type || "String",
            isChecked: parentChecked,
            field: field,
            isChild: true,
            isLastChild: subIndex === complexSchema.length - 1,
            parentType: field.type,
            isEditable: true,
          });
        });
      } else {
        rows.push({
          key: field.name,
          fieldId: field.id,
          value: recordItem?.value?.blocks || [],
          fieldType: field.type || "text",
          isChecked: recordItem?.isChecked ?? recordItem?.checked ?? hasValue,
          field: field,
          isParent: false,
          isChild: false,
          isEditable: true,
        });
      }
    });

    return rows;
  }, [fields, record]);

  const handleCheckboxChange = useCallback((fieldId, checked, rowInfo) => {
    const existingRecord = [...record];

    if (rowInfo?.isParent && rowInfo?.subFieldSchema) {
      const existingIndex = existingRecord.findIndex((r) => r.fieldId === fieldId);
      const field = fields.find((f) => f.id === fieldId);

      if (checked) {
        if (existingIndex >= 0) {
          existingRecord[existingIndex] = {
            ...existingRecord[existingIndex],
            isChecked: true,
          };
        } else {
          const sdkType = convertApplicationTypeToSDKType(field?.type);
          const fieldTypeUpper = String(field?.type || "").toUpperCase();
          const typeMapping = questionDataTypeMapping[fieldTypeUpper] || {};
          const displayName = typeMapping.alias || getSheetTypeDisplayName(field?.type);
          const iconUrl = field?.icon || typeMapping.icon || "";
          existingRecord.push({
            isChecked: true,
            id: fieldId,
            key: field?.name,
            fieldId: fieldId,
            fieldFormat: field?.fieldFormat || "",
            type: sdkType,
            dbFieldType: field?.dbFieldType,
            dbFieldName: field?.dbFieldName,
            field: fieldId || field?.dbFieldName,
            isValueMode: true,
            value: { type: "fx", blocks: [], blockStr: "" },
            alias: displayName,
            icon: iconUrl,
            schema: typeMapping.schema || [],
            path: [field?.name],
            subFields: {},
          });
        }
      } else {
        if (existingIndex >= 0) {
          existingRecord[existingIndex] = {
            ...existingRecord[existingIndex],
            value: { type: "fx", blocks: [], blockStr: "" },
            isChecked: false,
            subFields: {},
          };
        }
      }
    } else if (rowInfo?.isChild) {
      return;
    } else {
      const existingIndex = existingRecord.findIndex((r) => r.fieldId === fieldId);

      if (checked) {
        if (existingIndex >= 0) {
          existingRecord[existingIndex] = {
            ...existingRecord[existingIndex],
            isChecked: true,
          };
        } else {
          const field = fields.find((f) => f.id === fieldId);
          const sdkType = convertApplicationTypeToSDKType(field?.type);
          const fieldTypeUpper = String(field?.type || "").toUpperCase();
          const typeMapping = questionDataTypeMapping[fieldTypeUpper] || {};
          const displayName = typeMapping.alias || getSheetTypeDisplayName(field?.type);
          const iconUrl = field?.icon || typeMapping.icon || "";
          existingRecord.push({
            isChecked: true,
            id: fieldId,
            key: field?.name,
            fieldId: fieldId,
            fieldFormat: field?.fieldFormat || "",
            type: sdkType,
            dbFieldType: field?.dbFieldType,
            dbFieldName: field?.dbFieldName,
            field: fieldId || field?.dbFieldName,
            isValueMode: true,
            value: { type: "fx", blocks: [], blockStr: "" },
            alias: displayName,
            icon: iconUrl,
            schema: [],
            path: [field?.name],
          });
        }
      } else {
        if (existingIndex >= 0) {
          existingRecord[existingIndex] = {
            ...existingRecord[existingIndex],
            value: { type: "fx", blocks: [], blockStr: "" },
            isChecked: false,
          };
        }
      }
    }

    onChange?.(existingRecord);
  }, [record, fields, onChange]);

  const handleSelectAll = useCallback((checked) => {
    const existingRecord = [...record];

    if (checked) {
      // Select all non-child rows
      rowData.forEach((row) => {
        if (row.isChild) return; // Skip child rows

        const existingIndex = existingRecord.findIndex((r) => r.fieldId === row.fieldId);
        const field = fields.find((f) => f.id === row.fieldId);

        if (existingIndex >= 0) {
          existingRecord[existingIndex] = {
            ...existingRecord[existingIndex],
            isChecked: true,
          };
        } else {
          const sdkType = convertApplicationTypeToSDKType(field?.type);
          const fieldTypeUpper = String(field?.type || "").toUpperCase();
          const typeMapping = questionDataTypeMapping[fieldTypeUpper] || {};
          const displayName = typeMapping.alias || getSheetTypeDisplayName(field?.type);
          const iconUrl = field?.icon || typeMapping.icon || "";

          if (row.isParent && row.subFieldSchema) {
            existingRecord.push({
              isChecked: true,
              id: row.fieldId,
              key: field?.name,
              fieldId: row.fieldId,
              fieldFormat: field?.fieldFormat || "",
              type: sdkType,
              dbFieldType: field?.dbFieldType,
              dbFieldName: field?.dbFieldName,
              field: row.fieldId || field?.dbFieldName,
              isValueMode: true,
              value: { type: "fx", blocks: [], blockStr: "" },
              alias: displayName,
              icon: iconUrl,
              schema: typeMapping.schema || [],
              path: [field?.name],
              subFields: {},
            });
          } else {
            existingRecord.push({
              isChecked: true,
              id: row.fieldId,
              key: field?.name,
              fieldId: row.fieldId,
              fieldFormat: field?.fieldFormat || "",
              type: sdkType,
              dbFieldType: field?.dbFieldType,
              dbFieldName: field?.dbFieldName,
              field: row.fieldId || field?.dbFieldName,
              isValueMode: true,
              value: { type: "fx", blocks: [], blockStr: "" },
              alias: displayName,
              icon: iconUrl,
              schema: [],
              path: [field?.name],
            });
          }
        }
      });
    } else {
      // Deselect all rows
      existingRecord.forEach((item) => {
        item.isChecked = false;
        item.value = { type: "fx", blocks: [], blockStr: "" };
        if (item.subFields) {
          item.subFields = {};
        }
      });
    }

    onChange?.(existingRecord);
  }, [rowData, record, fields, onChange]);

  const handleRowChange = useCallback((rowIndex, newData) => {
    const rowInfo = rowData[rowIndex];
    if (!rowInfo) return;

    if (rowInfo.isParent) {
      return;
    }

    const existingRecord = [...record];

    if (rowInfo.isChild) {
      const parentFieldId = rowInfo.parentFieldId;
      const subFieldKey = rowInfo.subFieldKey;
      const parentField = fields.find((f) => f.id === parentFieldId);
      if (!parentField) return;

      const existingIndex = existingRecord.findIndex((r) => r.fieldId === parentFieldId);
      const blocks = newData.value?.value || newData.value || [];
      const blockStr = newData.value?.blockStr || "";

      const newSubFieldValue = {
        type: "fx",
        blocks: blocks,
        blockStr: blockStr,
      };

      const complexSchema = getComplexTypeSchema(parentField.type);

      if (existingIndex >= 0) {
        const existingItem = existingRecord[existingIndex];
        const updatedSubFields = {
          ...existingItem.subFields,
          [subFieldKey]: newSubFieldValue,
        };

        const serializedValue = createComplexValueFromSubFields(updatedSubFields, complexSchema);
        const hasAnyValue = Object.values(updatedSubFields).some(
          (v) => v?.blocks?.length > 0 || v?.blockStr
        );

        existingRecord[existingIndex] = {
          ...existingItem,
          subFields: updatedSubFields,
          value: serializedValue,
          isChecked: hasAnyValue,
        };
      } else {
        const sdkType = convertApplicationTypeToSDKType(parentField.type);
        const fieldTypeUpper = String(parentField.type || "").toUpperCase();
        const typeMapping = questionDataTypeMapping[fieldTypeUpper] || {};
        const displayName = typeMapping.alias || getSheetTypeDisplayName(parentField.type);
        const iconUrl = parentField.icon || typeMapping.icon || "";

        const newSubFields = {
          [subFieldKey]: newSubFieldValue,
        };

        const serializedValue = createComplexValueFromSubFields(newSubFields, complexSchema);
        const hasAnyValue = blocks.length > 0 || blockStr;

        existingRecord.push({
          isChecked: hasAnyValue,
          id: parentField.id,
          key: parentField.name,
          fieldId: parentField.id,
          fieldFormat: parentField.fieldFormat || "",
          type: sdkType,
          dbFieldType: parentField.dbFieldType,
          dbFieldName: parentField.dbFieldName,
          field: parentField.id || parentField.dbFieldName,
          isValueMode: true,
          value: serializedValue,
          alias: displayName,
          icon: iconUrl,
          schema: typeMapping.schema || [],
          path: [parentField.name],
          subFields: newSubFields,
        });
      }
    } else {
      const field = rowInfo.field;
      const existingIndex = existingRecord.findIndex((r) => r.fieldId === field.id);

      const blocks = newData.value?.value || newData.value || [];
      const blockStr = newData.value?.blockStr || "";
      const hasValue = Array.isArray(blocks) && blocks.length > 0;
      const sdkType = convertApplicationTypeToSDKType(field.type);
      const fieldTypeUpper = String(field.type || "").toUpperCase();
      const typeMapping = questionDataTypeMapping[fieldTypeUpper] || {};
      const displayName = typeMapping.alias || getSheetTypeDisplayName(field.type);
      const iconUrl = field.icon || typeMapping.icon || "";

      const newItem = {
        isChecked: hasValue,
        id: field.id,
        key: field.name,
        fieldId: field.id,
        fieldFormat: field.fieldFormat || "",
        type: sdkType,
        dbFieldType: field.dbFieldType,
        dbFieldName: field.dbFieldName,
        field: field.id || field.dbFieldName,
        isValueMode: true,
        value: { type: "fx", blocks: blocks, blockStr: blockStr },
        alias: displayName,
        icon: iconUrl,
        schema: [],
        path: [field.name],
      };

      if (existingIndex >= 0) {
        existingRecord[existingIndex] = newItem;
      } else {
        existingRecord.push(newItem);
      }
    }

    onChange?.(existingRecord);
  }, [rowData, record, fields, onChange]);

  const columns = useMemo(() => [
    {
      field: "isChecked",
      headerName: "",
      width: "40px",
      showHeaderCheckbox: true,
      cellRenderer: ({ data }) => {
        if (data.isChild) {
          return <div className="w-10" />;
        }
        return (
          <div className={cn(
            "flex items-center justify-center py-1.5",
            data.isParent && "bg-gray-50 rounded-tl-lg border-t border-l border-gray-200"
          )}>
            <Checkbox
              checked={data.isChecked}
              onCheckedChange={(checked) => handleCheckboxChange(data.fieldId, checked, data)}
              className="data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]"
            />
          </div>
        );
      },
    },
    {
      field: "key",
      headerName: (
        <div className="flex items-center gap-1.5">
          <span>Field</span>
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWordWrapEnabled(!isWordWrapEnabled);
                  }}
                  className={cn(
                    "p-0.5 rounded hover:bg-gray-200 transition-colors",
                    isWordWrapEnabled ? "text-blue-600 bg-blue-50" : "text-gray-400"
                  )}
                >
                  <WrapText className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {isWordWrapEnabled ? "Disable word wrap" : "Enable word wrap"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      width: "28%",
      highlighted: true,
      cellRenderer: ({ data }) => (
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1.5",
          data.isParent && "bg-gray-50 border-t border-gray-200",
          data.isChild && "pl-8 border-l border-r border-gray-200",
          data.isLastChild && "border-b rounded-b-lg"
        )}>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span className={cn(
                  "font-medium text-sm",
                  isWordWrapEnabled ? "whitespace-normal break-words" : "truncate",
                  data.isChild ? "text-slate-600" : (data.isChecked ? "text-slate-800" : "text-slate-400")
                )}>
                  {data.key}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[300px]">
                {data.key}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    {
      field: "fieldType",
      headerName: "Type",
      width: "48px",
      cellRenderer: ({ data }) => (
        <div className={cn(
          "flex items-center justify-center py-1.5",
          !data.isChecked && !data.isChild && "opacity-40",
          data.isParent && "bg-gray-50 border-t border-gray-200",
          data.isChild && "border-l-0 border-r border-gray-200",
          data.isLastChild && "border-b rounded-b-lg border-gray-200"
        )}>
          <TypeIcon fieldType={data.fieldType} />
        </div>
      ),
    },
    {
      field: "value",
      headerName: "New Value",
      width: "auto",
      editable: (data) => data.isEditable !== false,
      cellType: "formula",
      cellEditor: ({ data, rowIndex, onValueChange, isEditing, onBlur, autoFocus, placeholder }) => {
        if (data.isParent) {
          const subFieldCount = data.subFieldSchema?.length || 0;
          const filledCount = Object.keys(data.subFieldValues || {}).filter(k => {
            const val = data.subFieldValues[k];
            return val?.blocks?.length > 0 || val?.blockStr;
          }).length;

          return (
            <div className="flex items-center px-2 py-1.5 text-sm text-gray-500 bg-gray-50 border-t border-r border-gray-200 rounded-tr-lg">
              <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
                {filledCount}/{subFieldCount} fields
              </span>
            </div>
          );
        }

        const formulaType = mapSheetTypeToFormulaType(data.fieldType);

        return (
          <div className={cn(
            !data.isChecked && !data.isChild && "opacity-50",
            data.isChild && "border-l border-r border-gray-200",
            data.isLastChild && "border-b rounded-b-lg"
          )}>
            <FormulaCellEditor
              value={data.value}
              rowIndex={rowIndex}
              fieldName={data.key}
              onInputContentChanged={(blocks, textContent) => onValueChange({ value: blocks, blockStr: textContent || "" })}
              variables={variables}
              wrapContent
              isEditing={isEditing}
              onBlur={onBlur}
              autoFocus={autoFocus}
              type={formulaType}
              placeholder={placeholder || `Enter new ${data.key}...`}
            />
          </div>
        );
      },
      placeholder: "Enter new value...",
    },
  ], [variables, handleCheckboxChange, isWordWrapEnabled]);

  if (!fields || fields.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
        No fields available
      </div>
    );
  }

  return (
    <KeyValueGrid
      rowData={rowData}
      columns={columns}
      onRowChange={handleRowChange}
      onSelectAll={handleSelectAll}
      className="rounded-lg"
      data-testid={dataTestId}
    />
  );
}

export default SheetUpdateGrid;
