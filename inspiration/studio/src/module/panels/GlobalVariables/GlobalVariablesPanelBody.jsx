import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { SimpleInputGrid } from "@/components/studio/SimpleInputGrid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GlobalVariablesPanelBody = ({
  variables = [],
  onChange,
  onSave,
  title = "Global Params",
}) => {
  const [localVariables, setLocalVariables] = useState(variables);

  useEffect(() => {
    setLocalVariables(variables);
  }, [variables]);

  const { duplicateKeys, rowErrors } = useMemo(() => {
    const keyCount = {};
    const errors = {};

    localVariables.forEach((v) => {
      if (v.key && v.key.trim()) {
        const key = v.key.trim().toLowerCase();
        keyCount[key] = (keyCount[key] || 0) + 1;
      }
    });

    const duplicates = new Set(
      Object.entries(keyCount)
        .filter(([, count]) => count > 1)
        .map(([key]) => key)
    );

    localVariables.forEach((v) => {
      if (v.key && duplicates.has(v.key.trim().toLowerCase())) {
        errors[v._id] = "Duplicate parameter name";
      }
    });

    return { duplicateKeys: duplicates, rowErrors: errors };
  }, [localVariables]);

  const hasDuplicates = duplicateKeys.size > 0;

  const validate = useCallback(() => {
    const nonEmptyRows = localVariables.filter((v) => v.key || v.value);

    const emptyKeyRows = nonEmptyRows.filter((v) => v.value && !v.key);
    if (emptyKeyRows.length > 0) {
      toast.error("Please provide a name for all parameters with values.");
      return false;
    }

    if (hasDuplicates) {
      toast.error("Duplicate parameter names found. Please use unique names.");
      return false;
    }

    return true;
  }, [localVariables, hasDuplicates]);

  const handleSave = () => {
    if (!validate()) {
      return;
    }
    onSave?.();
  };

  const handleGridChange = (updatedRows) => {
    const mappedVariables = updatedRows.map((row) => ({
      ...row,
      key: row.key || "",
      value: row.value || "",
      type: row.type || "text",
      enabled: row.enabled !== false,
    }));
    setLocalVariables(mappedVariables);
    onChange?.(mappedVariables);
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: "Archivo, sans-serif" }}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-6">
        <p className="text-sm text-muted-foreground shrink-0">
          Define default values that can be overridden via URL query parameters.
        </p>

        {hasDuplicates && (
          <div
            className={cn(
              "flex items-center gap-2 p-3 shrink-0",
              "bg-red-50 border border-red-200 rounded-xl",
              "text-sm"
            )}
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-red-700">
              Duplicate parameter names detected. Each parameter must have a unique name.
            </span>
          </div>
        )}

        <div className="flex-1 min-h-0 flex flex-col mt-4">
          <SimpleInputGrid
            value={localVariables}
            onChange={handleGridChange}
            showType={false}
            showToggle={false}
            showDescription={false}
            autoAddRow={true}
            fillHeight
            placeholder={{ key: "Parameter name", value: "Default value" }}
            rowErrors={rowErrors}
          />
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
        <Button
          onClick={handleSave}
          className="px-6"
          style={{
            backgroundColor: "#1C3693",
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default GlobalVariablesPanelBody;
