import { useState, useCallback, useMemo } from "react";
import { COLUMN_TYPES } from "../constants";

export const useResponseMapping = ({ mappings = [], onChange }) => {
  const names = useMemo(
    () => mappings.map((row) => row.name.trim()),
    [mappings],
  );

  const handleUpdateRow = useCallback(
    (index, updatedRow) => {
      const newMappings = [...mappings];
      newMappings[index] = updatedRow;
      // setMappings(newMappings);
      onChange?.(newMappings);
    },
    [mappings, onChange],
  );

  const handleAddRow = useCallback(() => {
    const newRow = {
      name: "",
      columnType: COLUMN_TYPES.QUESTION,
      value: "",
    };
    const newMappings = [...mappings, newRow];
    // setMappings(newMappings);
    onChange?.(newMappings);
  }, [mappings, onChange]);

  const handleDeleteRow = useCallback(
    (index) => {
      const newMappings = mappings.filter((_, i) => i !== index);
      // Ensure at least one row remains
      if (newMappings.length === 0) {
        newMappings.push({
          name: "",
          columnType: COLUMN_TYPES.QUESTION,
          value: "",
        });
      }
      // setMappings(newMappings);
      onChange?.(newMappings);
    },
    [mappings, onChange],
  );

  return {
    names,
    handleUpdateRow,
    handleAddRow,
    handleDeleteRow,
  };
};
