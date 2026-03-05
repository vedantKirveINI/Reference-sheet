import React, { useMemo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { icons } from "@/components/icons";
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


export function SheetRecordGrid({
  fields = [],
  record = [],
  onChange,
  variables,
  showRequired = true,
  "data-testid": dataTestId = "sheet-record-grid",
}) {
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(false);
  const [expandedFields, setExpandedFields] = useState(new Set());

  const toggleFieldExpansion = useCallback((fieldId) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  }, []);

  const flatRowData = useMemo(() => {
    const rows = [];
    
    fields.forEach((field) => {
      const recordItem = record.find((r) => r.fieldId === field.id);
      const complexSchema = getComplexTypeSchema(field.type);
      const isExpanded = expandedFields.has(field.id);
      
      if (complexSchema) {
        const subFieldCount = complexSchema.length;
        const filledCount = Object.keys(recordItem?.subFields || {}).filter(k => {
          const val = recordItem?.subFields[k];
          return val?.blocks?.length > 0 || val?.blockStr;
        }).length;
        
        rows.push({
          key: field.name,
          fieldId: field.id,
          value: recordItem?.value?.blocks || [],
          fieldType: field.type || "text",
          required: field.required === true,
          field: field,
          isParent: true,
          subFieldSchema: complexSchema,
          subFieldValues: recordItem?.subFields || {},
          isEditable: false,
          isExpanded: isExpanded,
          filledCount: filledCount,
          totalCount: subFieldCount,
        });
        
        // Only show child rows if expanded
        if (isExpanded) {
          complexSchema.forEach((subField, subIndex) => {
            const subFieldValue = recordItem?.subFields?.[subField.key];
            rows.push({
              key: subField.displayKeyName || subField.key,
              fieldId: `${field.id}__${subField.key}`,
              parentFieldId: field.id,
              subFieldKey: subField.key,
              value: subFieldValue?.blocks || [],
              fieldType: subField.type || "String",
              required: false,
              field: field,
              isChild: true,
              isLastChild: subIndex === complexSchema.length - 1,
              parentType: field.type,
              isEditable: true,
            });
          });
        }
      } else {
        rows.push({
          key: field.name,
          fieldId: field.id,
          value: recordItem?.value?.blocks || [],
          fieldType: field.type || "text",
          required: field.required === true,
          field: field,
          isParent: false,
          isChild: false,
          isEditable: true,
        });
      }
    });
    
    return rows;
  }, [fields, record, expandedFields]);

  const handleRowChange = useCallback((rowIndex, newData) => {
    const rowInfo = flatRowData[rowIndex];
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
        
        existingRecord[existingIndex] = {
          ...existingItem,
          subFields: updatedSubFields,
          value: serializedValue,
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
        
        existingRecord.push({
          isChecked: true,
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
      
      const sdkType = convertApplicationTypeToSDKType(field.type);
      const fieldTypeUpper = String(field.type || "").toUpperCase();
      const typeMapping = questionDataTypeMapping[fieldTypeUpper] || {};
      const displayName = typeMapping.alias || getSheetTypeDisplayName(field.type);
      const iconUrl = field.icon || typeMapping.icon || "";
      
      const blocks = newData.value?.value || newData.value || [];
      const blockStr = newData.value?.blockStr || "";
      
      const existingSubFields = existingIndex >= 0 ? existingRecord[existingIndex].subFields : undefined;
      
      const newItem = {
        isChecked: true,
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
        schema: typeMapping.schema || [],
        path: [field.name],
        subFields: existingSubFields,
      };
      
      if (existingIndex >= 0) {
        existingRecord[existingIndex] = { ...existingRecord[existingIndex], ...newItem };
      } else {
        existingRecord.push(newItem);
      }
    }
    
    onChange?.(existingRecord);
  }, [flatRowData, record, fields, onChange]);

  const columns = useMemo(() => [
    {
      field: "fieldType",
      headerName: "Type",
      width: "60px",
      cellRenderer: ({ data }) => (
        <div className={cn(
          "flex items-center justify-center",
          data.isParent && "py-2.5",
          !data.isParent && "h-full",
          data.isChild && "bg-slate-50/50",
          !data.isParent && !data.isChild && "bg-slate-50/30"
        )}>
          <TypeIcon fieldType={data.fieldType} />
        </div>
      ),
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
                  <icons.wrapText className="w-3.5 h-3.5" />
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
      cellRenderer: ({ data }) => {
        if (data.isParent) {
          const isComplete = data.filledCount === data.totalCount;
          const isPartiallyFilled = data.filledCount > 0 && data.filledCount < data.totalCount;
          
          return (
            <div 
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 cursor-pointer",
                "hover:from-blue-100 hover:to-indigo-100 transition-colors",
                "-mx-[1px]"
              )}
              onClick={() => toggleFieldExpansion(data.fieldId)}
            >
              <div className="flex-shrink-0">
                {data.isExpanded ? (
                  <icons.chevronDown className="w-4 h-4 text-blue-600" />
                ) : (
                  <icons.chevronRight className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold text-sm",
                    isWordWrapEnabled ? "whitespace-normal break-words" : "truncate",
                    "text-slate-800"
                  )}>
                    {data.key}
                  </span>
                  {showRequired && data.required && (
                    <span className="text-red-500 text-sm font-bold flex-shrink-0">*</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  isComplete && "bg-green-100 text-green-700",
                  isPartiallyFilled && "bg-amber-100 text-amber-700",
                  !isPartiallyFilled && !isComplete && "bg-gray-100 text-gray-600"
                )}>
                  {data.filledCount}/{data.totalCount}
                </span>
              </div>
            </div>
          );
        }
        
        return (
          <div className={cn(
            "flex items-center gap-1.5 px-3 h-full",
            data.isChild && "pl-10 bg-slate-50/50",
            !data.isChild && "bg-slate-50/30"
          )}>
            {data.isChild && (
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <div className="w-0.5 h-full bg-blue-300"></div>
              </div>
            )}
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "font-medium text-sm flex-1",
                    isWordWrapEnabled ? "whitespace-normal break-words" : "truncate",
                    data.isChild ? "text-slate-600" : "text-slate-800"
                  )}>
                    {data.key}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[300px]">
                  {data.key}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {showRequired && data.required && (
              <span className="text-red-500 text-sm font-bold flex-shrink-0">*</span>
            )}
          </div>
        );
      },
    },
    {
      field: "value",
      headerName: "Value",
      width: "auto",
      editable: (data) => data.isEditable !== false,
      cellType: "formula",
      cellEditor: ({ data, rowIndex, onValueChange, isEditing, onBlur, autoFocus, placeholder }) => {
        if (data.isParent) {
          return (
            <div 
              className={cn(
                "flex items-center px-4 py-2.5 cursor-pointer",
                "hover:from-blue-100 hover:to-indigo-100 transition-colors",
                "-ml-[1px] rounded-r-lg"
              )}
              onClick={() => toggleFieldExpansion(data.fieldId)}
            >
              <span className="text-xs text-slate-500 italic">
                {data.isExpanded ? "Click to collapse" : "Click to expand and fill fields"}
              </span>
            </div>
          );
        }
        
        const formulaType = mapSheetTypeToFormulaType(data.fieldType);
        const hasValue = data.value?.length > 0;
        
        return (
          <div className={cn(
            "px-3 h-full flex items-center",
            data.required && !hasValue && "border-l-2 border-amber-400",
            data.isChild && "bg-slate-50/50",
            !data.isChild && "bg-slate-50/30"
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
              placeholder={placeholder || `Enter ${data.key}...`}
            />
          </div>
        );
      },
      placeholder: "Enter value...",
    },
  ], [variables, showRequired, isWordWrapEnabled, toggleFieldExpansion]);

  if (!fields || fields.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
        No fields available
      </div>
    );
  }

  return (
    <KeyValueGrid
      rowData={flatRowData}
      columns={columns}
      onRowChange={handleRowChange}
      className="rounded-lg"
      data-testid={dataTestId}
    />
  );
}

export default SheetRecordGrid;
