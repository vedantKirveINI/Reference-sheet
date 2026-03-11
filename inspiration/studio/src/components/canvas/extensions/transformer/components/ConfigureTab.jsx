import React, { useMemo } from "react";
import { Wand2, Variable, Eye, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { KeyValueGrid } from "@src/module/key-value-table/key-value-grid";
import { THEME } from "../constants";

const ConfigureTab = ({ state, variables }) => {
  const {
    content,
    setContent,
    testValues,
    updateTestValue,
    detectedVariables,
    evaluatedResult,
    evaluationError,
    validation
  } = state;

  const gridRowData = useMemo(() => {
    return detectedVariables.map((varName) => ({
      key: varName,
      value: testValues[varName] || "",
    }));
  }, [detectedVariables, testValues]);

  const gridColumns = useMemo(() => [
    {
      field: "key",
      headerName: "Variable",
      editable: false,
      cellType: "text",
      width: "40%",
      highlighted: true,
      cellRenderer: ({ data }) => (
        <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {`{{${data.key}}}`}
        </code>
      ),
    },
    {
      field: "value",
      headerName: "Test Value",
      editable: true,
      cellType: "text",
      width: "60%",
      placeholder: "Enter test value",
    },
  ], []);

  const handleRowChange = (rowIndex, newData) => {
    updateTestValue(newData.key, newData.value);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: THEME.iconBg }}
        >
          <Wand2 className="w-4 h-4" style={{ color: THEME.iconColor }} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 text-sm">Transform Data</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Use formulas to transform, combine, or reshape data from previous steps.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Variable className="w-4 h-4" style={{ color: THEME.iconColor }} />
          Transformation Expression<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder='Enter formula, e.g., concat({{firstName}}, " ", {{lastName}})'
          defaultInputContent={content?.blocks || []}
          onInputContentChanged={(blocks) => setContent({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[5rem] rounded-xl border bg-white px-3 py-2",
                !validation.isValid
                  ? "border-red-400 focus-within:ring-2 focus-within:ring-red-200"
                  : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400"
              ),
            },
          }}
        />
        {!validation.isValid && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            {validation.errors[0]}
          </p>
        )}
      </div>

      {detectedVariables.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            Test Values
          </Label>
          <p className="text-xs text-gray-500">
            Enter sample values for detected variables to preview the output.
          </p>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <KeyValueGrid
              rowData={gridRowData}
              columns={gridColumns}
              onRowChange={handleRowChange}
              showDeleteColumn={false}
              data-testid="transformer-test-values-grid"
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Eye className="w-4 h-4" style={{ color: THEME.iconColor }} />
          Live Preview
        </Label>
        <div className={cn(
          "rounded-xl border p-4 min-h-[3.75rem]",
          evaluationError
            ? "bg-red-50 border-red-200"
            : "bg-gray-50 border-gray-200"
        )}>
          {evaluationError ? (
            <div className="flex items-start gap-2 text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{evaluationError}</span>
            </div>
          ) : evaluatedResult ? (
            <code className="text-sm text-gray-800 font-mono whitespace-pre-wrap break-all">
              {evaluatedResult}
            </code>
          ) : (
            <span className="text-sm text-gray-400 italic">
              Enter an expression to see the preview
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {detectedVariables.length > 0
            ? "Fill in test values above to see how your expression evaluates"
            : "The preview shows how your expression will be evaluated at runtime"
          }
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Examples</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <code className="text-blue-600 bg-gray-100 px-2 py-1 rounded">
            concat({"{{a}}"}, {"{{b}}"})
          </code>
          <code className="text-blue-600 bg-gray-100 px-2 py-1 rounded">
            {"{{total}}"} * 1.1
          </code>
          <code className="text-blue-600 bg-gray-100 px-2 py-1 rounded">
            upper({"{{name}}"})
          </code>
        </div>
      </div>

      <div className="text-xs text-gray-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>
          Use {"{{variable}}"} syntax to reference data from previous workflow steps.
        </span>
      </div>
    </div>
  );
};

export default ConfigureTab;
