import React from "react";
import { Database, Pencil, Table } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ODSIcon } from "@src/module/ods";
import CollapsibleFilterSection from "../../common-components/CollapsibleFilterSection";
import SheetUpdateGrid from "../../common-components/SheetUpdateGrid";

const ConfigureTab = ({
  state,
  variables,
  sortedFields,
  loading,
  onEditDataSource,
}) => {
  const {
    sheet,
    table,
    record,
    filter,
    onRecordChange,
    onFilterChange,
    validation
  } = state;

  const filterErrors = validation.errors.filter(
    (e) => e.includes("condition") || e.includes("filter")
  );

  const fieldErrors = validation.errors.filter(
    (e) => e.includes("field") || e.includes("selected")
  );

  return (
    <div className="space-y-5 overflow-y-auto h-full">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#22C55E]" />
          <Label className="text-sm font-medium text-gray-900">Data Source</Label>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden">
              <ODSIcon outeIconName="TINYSheetIcon" sx={{ width: 28, height: 28 }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{sheet?.name || 'Sheet'}</p>
              <p className="text-xs text-gray-500">{table?.name || 'Table'}</p>
            </div>
          </div>
          <button
            onClick={onEditDataSource}
            className="flex items-center gap-1.5 text-sm text-[#22C55E] hover:underline font-medium"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>
      </div>

      {sheet && table && sortedFields.length > 0 && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Find all records where...<span className="text-red-500">*</span>
            </Label>
            <CollapsibleFilterSection
              schema={sortedFields}
              filter={filter}
              onChange={onFilterChange}
              variables={variables}
              hasError={filterErrors.length > 0}
              errorMessage={filterErrors[0]}
            />
            <p className="text-xs text-gray-500">
              All matching records will be updated
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Set new values<span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 -mt-1">
              Check the fields you want to update on all matching records
            </p>

            <SheetUpdateGrid
              fields={sortedFields}
              record={record}
              onChange={onRecordChange}
              variables={variables}
              data-testid="update-sheet-records-grid"
            />
            {fieldErrors.length > 0 && (
              <p className="text-sm text-red-500">{fieldErrors[0]}</p>
            )}
          </div>
        </>
      )}

      {sheet && table && sortedFields.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <Table className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No fields found in this table.</p>
          <p className="text-sm text-gray-400 mt-1">Select a different table or add fields to your sheet.</p>
        </div>
      )}

      {loading && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigureTab;
