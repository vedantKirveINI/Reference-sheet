import { useState, useCallback, useRef } from "react";
import { DEFAULT_ROW, ROW_TYPES } from "./constants";
import { generateId, detectType, formatForExport } from "./utils";

export function useSimpleInputGridState({ value = [], onChange, autoAddRow = true }) {
  const [rows, setRows] = useState(() => {
    const initial = value.length > 0 
      ? value.map((row, index) => ({
          ...DEFAULT_ROW,
          ...row,
          _id: row._id || `row-${index}-${Date.now()}`,
        }))
      : [];
    
    if (autoAddRow && (initial.length === 0 || (initial[initial.length - 1]?.key || initial[initial.length - 1]?.value))) {
      initial.push({ ...DEFAULT_ROW, _id: generateId() });
    }
    
    return initial;
  });

  const lastExternalValueRef = useRef(value);

  const emitChange = useCallback(
    (newRows) => {
      const exported = formatForExport(newRows);
      onChange?.(exported);
    },
    [onChange]
  );

  const updateRow = useCallback(
    (id, updates) => {
      setRows((prev) => {
        const newRows = prev.map((row) => {
          if (row._id !== id) return row;
          const updated = { ...row, ...updates };
          if ("value" in updates && updates.type === undefined) {
            updated.type = detectType(updates.value);
          }
          return updated;
        });

        if (autoAddRow) {
          const lastRow = newRows[newRows.length - 1];
          if (lastRow && (lastRow.key || lastRow.value)) {
            newRows.push({ ...DEFAULT_ROW, _id: generateId() });
          }
        }

        emitChange(newRows);
        return newRows;
      });
    },
    [autoAddRow, emitChange]
  );

  const deleteRow = useCallback(
    (id) => {
      setRows((prev) => {
        const newRows = prev.filter((row) => row._id !== id);
        if (newRows.length === 0) {
          newRows.push({ ...DEFAULT_ROW, _id: generateId() });
        }
        emitChange(newRows);
        return newRows;
      });
    },
    [emitChange]
  );

  const addRow = useCallback(() => {
    setRows((prev) => {
      const newRows = [...prev, { ...DEFAULT_ROW, _id: generateId() }];
      emitChange(newRows);
      return newRows;
    });
  }, [emitChange]);

  const addRowAndFocus = useCallback((onRowAdded) => {
    setRows((prev) => {
      const lastRow = prev[prev.length - 1];
      if (lastRow && !lastRow.key && !lastRow.value) {
        onRowAdded?.();
        return prev;
      }
      const newRows = [...prev, { ...DEFAULT_ROW, _id: generateId() }];
      emitChange(newRows);
      setTimeout(() => onRowAdded?.(), 0);
      return newRows;
    });
  }, [emitChange]);

  const toggleRow = useCallback(
    (id) => {
      setRows((prev) => {
        const newRows = prev.map((row) =>
          row._id === id ? { ...row, enabled: !row.enabled } : row
        );
        emitChange(newRows);
        return newRows;
      });
    },
    [emitChange]
  );

  const setRowType = useCallback(
    (id, type) => {
      setRows((prev) => {
        const newRows = prev.map((row) =>
          row._id === id ? { ...row, type } : row
        );
        emitChange(newRows);
        return newRows;
      });
    },
    [emitChange]
  );

  const importRows = useCallback(
    (importedRows) => {
      setRows(() => {
        const newRows = importedRows.map((row, index) => ({
          ...DEFAULT_ROW,
          ...row,
          _id: row._id || `imported-${index}-${Date.now()}`,
        }));
        if (autoAddRow) {
          newRows.push({ ...DEFAULT_ROW, _id: generateId() });
        }
        emitChange(newRows);
        return newRows;
      });
    },
    [autoAddRow, emitChange]
  );

  const clearAll = useCallback(() => {
    const newRows = [{ ...DEFAULT_ROW, _id: generateId() }];
    setRows(newRows);
    emitChange(newRows);
  }, [emitChange]);

  const resetFromValue = useCallback((newValue) => {
    const newRows = newValue.length > 0
      ? newValue.map((row, index) => ({
          ...DEFAULT_ROW,
          ...row,
          _id: row._id || `reset-${index}-${Date.now()}`,
        }))
      : [];
    
    if (autoAddRow && (newRows.length === 0 || (newRows[newRows.length - 1]?.key || newRows[newRows.length - 1]?.value))) {
      newRows.push({ ...DEFAULT_ROW, _id: generateId() });
    }
    
    setRows(newRows);
    lastExternalValueRef.current = newValue;
  }, [autoAddRow]);

  return {
    rows,
    updateRow,
    deleteRow,
    addRow,
    addRowAndFocus,
    toggleRow,
    setRowType,
    importRows,
    clearAll,
    resetFromValue,
  };
}
