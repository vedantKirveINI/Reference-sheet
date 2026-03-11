import React, { useMemo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WrapText } from "lucide-react";
import { KeyValueGrid } from "@src/module/key-value-table/key-value-grid";
import { FormulaCellEditor } from "@src/module/key-value-table/key-value-grid/formula-cell";
import { mapSheetTypeToFormulaType } from "../sheetTypeMapping";
import { isComplexType } from "@/constants/field-type-registry";
import { TypeIcon } from "./components/TypeIcon";
import { ParentRowValueCell } from "./components/ParentRowValueCell";
import { transformFieldsToRows } from "./utils/rowDataTransformers";
import { handleChildFieldChange, handleSimpleFieldChange } from "./utils/changeHandlers";
import styles from "./SheetRecordGridV2.module.css";

export function SheetRecordGridV2({
  fields = [],
  record = [],
  onChange,
  variables,
  showRequired = true,
  "data-testid": dataTestId = "sheet-record-grid-v2",
}) {
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(false);
  const [collapsedFields, setCollapsedFields] = useState(new Set());

  const toggleFieldCollapse = useCallback((fieldId) => {
    setCollapsedFields(prev => {
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
    return transformFieldsToRows({ fields, record, collapsedFields });
  }, [fields, record, collapsedFields]);

  const handleRowChange = useCallback((rowIndex, newData) => {
    const rowInfo = flatRowData[rowIndex];
    if (!rowInfo) return;

    // Parent rows are not editable
    if (rowInfo.isParent) {
      return;
    }

    let updatedRecord;
    if (rowInfo.isChild) {
      updatedRecord = handleChildFieldChange({ rowInfo, newData, fields, record });
    } else {
      updatedRecord = handleSimpleFieldChange({ rowInfo, newData, fields, record });
    }

    onChange?.(updatedRecord);
  }, [flatRowData, record, fields, onChange]);


  const columns = useMemo(() => [
    {
      field: "fieldType",
      headerName: "",
      width: "52px",
      cellRenderer: ({ data }) => {
        const isComplex = isComplexType(data.fieldType);

        return (
          <div className={styles.typeCell}>
            <TypeIcon
              fieldType={data.isChild ? data.parentType : data.fieldType}
              subType={data?.subType}
              isParent={data.isParent && isComplex}
              isExpanded={!data.isCollapsed}
              onToggle={() => toggleFieldCollapse(data.field?.id)}
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
      width: "35%",
      highlighted: true,
      cellRenderer: ({ data }) => {
        return (
          <div className={cn(
            styles.fieldCell,
            data.isChild && styles.childFieldCell
          )}>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "font-medium text-sm",
                    isWordWrapEnabled ? "whitespace-normal break-words" : "truncate",
                    data.isChild ? "text-slate-600" : "text-slate-800"
                  )}>
                    {data.key}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[300px]">
                  {data.key}
                  {data.subFieldDescription && (
                    <div className="text-gray-400 mt-1">{data.subFieldDescription}</div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {showRequired && data.required && (
              <span className="text-red-500 text-sm font-bold flex-shrink-0 ml-1">*</span>
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
        const isComplex = isComplexType(data.fieldType);

        if (data.isParent && isComplex) {
          return (
            <div className={styles.valueCellParent}>
              <ParentRowValueCell
                data={data}
                onToggle={() => toggleFieldCollapse(data.field?.id)}
              />
            </div>
          );
        }

        const formulaType = mapSheetTypeToFormulaType(data.fieldType);
        const hasValue = data.value?.length > 0;

        return (
          <div className={cn(
            styles.valueCell,
            data.required && !hasValue && styles.requiredEmpty
          )}>
            <FormulaCellEditor
              value={data.value}
              rowIndex={rowIndex}
              fieldName={data.key}
              onInputContentChanged={(blocks, textContent) => {
                onValueChange({ value: blocks, blockStr: textContent || "" })
              }}
              variables={variables}
              wrapContent
              onBlur={onBlur}
              autoFocus={autoFocus}
              type={formulaType}
              placeholder={data.subFieldExample ? `e.g., ${data.subFieldExample}` : (placeholder || `Enter ${data.key}...`)}
            />
          </div>
        );
      },
      placeholder: "Enter value...",
    },
  ], [variables, showRequired, isWordWrapEnabled, toggleFieldCollapse]);

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

export default SheetRecordGridV2;

