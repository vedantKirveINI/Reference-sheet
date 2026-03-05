import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { isEqual } from "lodash";
import { ArrowUp, ArrowDown, Trash2, Plus, FileText, ArrowUpDown } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "ASCENDING", label: "Ascending", icon: ArrowUp },
  { value: "DESCENDING", label: "Descending", icon: ArrowDown },
];

const Summary = ({ rows, schema }) => {
  const getSummaryText = () => {
    const validRows = rows.filter((row) => row.column);
    if (validRows.length === 0) {
      return "No sort criteria applied";
    }

    const parts = validRows.map((row) => {
      const direction = row.order === "ASCENDING" ? "ascending" : "descending";
      return `${row.column} ${direction}`;
    });

    return `Sort by ${parts.join(", ")}`;
  };

  return (
    <div className="mt-2 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
      <div className="w-full flex items-center px-3 py-2 text-sm font-medium text-foreground">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Sort Summary</span>
        </div>
      </div>
      <div className="px-3 py-2 bg-muted/30 border-t border-border">
        <p className="text-sm text-muted-foreground font-mono break-words leading-relaxed">
          {getSummaryText()}
        </p>
      </div>
    </div>
  );
};

const SortRow = ({
  row,
  index,
  filteredOptions,
  onUpdateColumn,
  onUpdateOrder,
  onRemove,
}) => {
  const comboboxOptions = filteredOptions.map((name) => ({
    value: name,
    label: name,
  }));

  const selectedOrderOption = SORT_OPTIONS.find((opt) => opt.value === row.order);
  const OrderIcon = selectedOrderOption?.icon || ArrowUp;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2",
        "border-b border-gray-100 last:border-b-0"
      )}
      data-testid={`sort-row-${index}`}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-xs font-medium text-primary">{index + 1}</span>
      </div>

      <div className="flex-1 min-w-0">
        <Combobox
          options={comboboxOptions}
          value={row.column || undefined}
          onValueChange={(value) => onUpdateColumn(index, value)}
          placeholder="Select a field"
          searchable={true}
          className="w-full"
          data-testid={`sort-field-${index}`}
        />
      </div>

      <div className="w-[160px] flex-shrink-0">
        <Select
          value={row.order}
          onValueChange={(value) => onUpdateOrder(index, value)}
        >
          <SelectTrigger
            className="w-full"
            data-testid={`sort-order-${index}`}
          >
            <div className="flex items-center gap-2">
              <SelectValue placeholder="Select order" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
        data-testid={`delete-sort-${index}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const SheetOrderByV2 = ({
  schema = [],
  orderByRowData = [],
  onChange = () => {},
}) => {
  const [rows, setRows] = useState([]);
  const hasInitialized = useRef(false);
  const prevOrderByRowDataRef = useRef(orderByRowData);

  const createEmptyRow = useCallback(() => ({
    column: "",
    order: SORT_OPTIONS[0].value,
    checked: true,
    fieldId: "",
    dbFieldName: "",
    type: "",
  }), []);

  const generateOrderByClause = useCallback((rowData) => {
    let clause = "ORDER BY";

    rowData?.forEach((row, index) => {
      if (row?.column && row?.order) {
        if (index !== 0) {
          clause += ",";
        }
        clause += ` ${row.column} ${row.order}`;
      }
    });

    return rowData.length > 0 ? clause : "";
  }, []);

  const notifyParent = useCallback((newRows) => {
    const validRows = newRows.filter((row) => row.column);
    const orderByClause = generateOrderByClause(validRows);
    onChange(validRows, orderByClause);
  }, [generateOrderByClause, onChange]);

  const updateColumn = useCallback((index, value) => {
    setRows((prevRows) => {
      const updated = [...prevRows];
      const selectedField = schema.find((field) => field.name === value);

      if (selectedField) {
        updated[index] = {
          ...updated[index],
          column: value,
          fieldId: selectedField.id,
          dbFieldName: selectedField.dbFieldName,
          type: selectedField.type,
        };
      } else {
        updated[index] = {
          ...updated[index],
          column: value,
        };
      }

      notifyParent(updated);
      return updated;
    });
  }, [schema, notifyParent]);

  const updateSortOrder = useCallback((index, value) => {
    setRows((prevRows) => {
      const updated = [...prevRows];
      updated[index] = { ...updated[index], order: value };
      notifyParent(updated);
      return updated;
    });
  }, [notifyParent]);

  const getFilteredColumnOptions = useCallback((currentIndex) => {
    const selectedColumns = rows
      .map((row, idx) => (idx !== currentIndex ? row.column : null))
      .filter(Boolean);

    return schema
      .map((field) => field.name)
      .filter((name) => !selectedColumns.includes(name));
  }, [rows, schema]);

  const addNewRow = useCallback(() => {
    setRows((prevRows) => {
      const updated = [...prevRows, createEmptyRow()];
      notifyParent(updated);
      return updated;
    });
  }, [createEmptyRow, notifyParent]);

  const removeRow = useCallback((index) => {
    setRows((prevRows) => {
      const updated = [...prevRows];
      updated.splice(index, 1);
      notifyParent(updated);
      return updated;
    });
  }, [notifyParent]);

  useEffect(() => {
    if (!hasInitialized.current && schema.length) {
      setRows(orderByRowData.length > 0 ? orderByRowData : []);
      hasInitialized.current = true;
    }
  }, [schema, orderByRowData]);

  useEffect(() => {
    if (hasInitialized.current && !isEqual(prevOrderByRowDataRef.current, orderByRowData)) {
      prevOrderByRowDataRef.current = orderByRowData;
      setRows(orderByRowData.length > 0 ? orderByRowData : []);
    }
  }, [orderByRowData]);

  const isEmpty = rows.length === 0;

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      data-testid="sort-by-section"
    >
      {isEmpty ? (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-3">
            <ArrowUpDown className="w-5 h-5 text-[#22C55E]" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Define sort order for your results
          </p>
          <Button
            size="sm"
            onClick={addNewRow}
            className="h-8 bg-gray-900 hover:bg-gray-800 text-white"
            data-testid="add-sort-button"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Sort
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {rows.map((row, index) => (
              <SortRow
                key={index}
                row={row}
                index={index}
                filteredOptions={getFilteredColumnOptions(index)}
                onUpdateColumn={updateColumn}
                onUpdateOrder={updateSortOrder}
                onRemove={removeRow}
              />
            ))}
          </div>

          <div className="px-3 py-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={addNewRow}
              className="text-primary hover:text-primary/80 hover:bg-primary/5 h-8"
              data-testid="add-sort-button"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Sort
            </Button>
          </div>

          <Summary rows={rows} schema={schema} />
        </>
      )}
    </div>
  );
};

export default SheetOrderByV2;
