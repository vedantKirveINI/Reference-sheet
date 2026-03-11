import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KeyValueGrid } from "@src/module/key-value-table/key-value-grid";
import { FormulaCellEditor, FormulaCellRenderer } from "@src/module/key-value-table/key-value-grid/formula-cell";
import { mapDbTypeToFormulaType, getTypeDisplayName, getTypeBadgeColor } from "./utils/dbTypeMapping";

function TypeBadge({ dbType }) {
  const formulaType = mapDbTypeToFormulaType(dbType);
  const displayName = getTypeDisplayName(dbType);
  const colorClass = getTypeBadgeColor(formulaType);

  return (
    <Badge variant="secondary" className={cn("text-xs font-medium px-2 py-0.5", colorClass)}>
      {displayName}
    </Badge>
  );
}

export function DBRecordGrid({
  fields = [],
  record = [],
  onChange,
  variables,
  showRequired = true,
  "data-testid": dataTestId = "db-record-grid",
}) {
  const rowData = useMemo(() => {
    return fields.map((field) => {
      const recordItem = record.find((r) => r.key === field.name);
      const blocks = recordItem?.value?.blocks || [];
      return {
        key: field.name,
        value: blocks,
        fieldType: field.type,
        required: field.field_indicator === "REQUIRED",
        field: field,
      };
    });
  }, [fields, record]);

  const handleRowChange = (rowIndex, newData) => {
    const field = fields[rowIndex];
    const updatedRecord = [...record];
    const existingIndex = updatedRecord.findIndex((r) => r.key === field.name);

    const hasContent = newData.value?.length > 0;
    const newItem = {
      key: field.name,
      type: field.type,
      required: field.field_indicator === "REQUIRED",
      value: { type: "fx", blocks: newData.value },
      checked: hasContent,
    };

    if (existingIndex >= 0) {
      updatedRecord[existingIndex] = { ...updatedRecord[existingIndex], ...newItem };
    } else {
      updatedRecord.push(newItem);
    }

    onChange?.(updatedRecord);
  };

  const columns = useMemo(() => [
    {
      field: "key",
      headerName: "Field",
      width: "30%",
      highlighted: true,
      cellRenderer: ({ data }) => (
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <span className="font-medium text-slate-800 text-sm truncate">
            {data.key}
          </span>
          {showRequired && data.required && (
            <span className="text-red-500 text-sm font-bold">*</span>
          )}
        </div>
      ),
    },
    {
      field: "fieldType",
      headerName: "Type",
      width: "15%",
      cellRenderer: ({ data }) => (
        <div className="px-2 py-1.5">
          <TypeBadge dbType={data.fieldType} />
        </div>
      ),
    },
    {
      field: "value",
      headerName: "Value",
      width: "55%",
      editable: true,
      cellType: "formula",
      cellEditor: ({ data, rowIndex, onValueChange, isEditing, onBlur, autoFocus, placeholder }) => {
        const formulaType = mapDbTypeToFormulaType(data.fieldType);
        const hasValue = data.value?.length > 0;

        return (
          <FormulaCellEditor
            value={data.value}
            rowIndex={rowIndex}
            fieldName={data.key}
            onInputContentChanged={(blocks) => onValueChange(blocks)}
            variables={variables}
            wrapContent
            onBlur={onBlur}
            autoFocus={autoFocus}
            type={formulaType}
            placeholder={placeholder || `Enter ${data.key}...`}
          />
        );
      },
      placeholder: "Enter value...",
    },
  ], [variables, showRequired]);

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
      className="rounded-lg"
      data-testid={dataTestId}
    />
  );
}

export default DBRecordGrid;
