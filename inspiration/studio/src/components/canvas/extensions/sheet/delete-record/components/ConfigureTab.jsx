import React from "react";
import { AlertTriangle, Database, Pencil, Table, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ODSIcon } from "@src/module/ods";
import CollapsibleFilterSection from "../../common-components/CollapsibleFilterSection";
// import CollapsibleSortSection from "../../common-components/CollapsibleSortSection"; // Sort by commented out

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
    filter,
    // orderBy,
    deleteMultiple,
    setDeleteMultiple,
    deleteAll,
    setDeleteAll,
    hasFilterConditions,
    onFilterChange,
    // onOrderByChange,
    validation,
  } = state;

  const filterErrors = validation.errors.filter(
    (e) => e.includes("filter") || e.includes("Delete all")
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
          {deleteAll ? (
            <>
              <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-red-600">Delete All Records</Label>
                    <p className="text-xs text-gray-500">Remove every record from this table</p>
                  </div>
                  <Switch
                    checked={deleteAll}
                    onCheckedChange={(checked) => {
                      setDeleteAll(checked);
                      // if (checked) {
                      setDeleteMultiple(true);
                      // }
                    }}
                  />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Warning: All Records Will Be Deleted</p>
                  <p className="text-xs text-red-700 mt-1">
                    This will permanently delete every record in the table "{table?.name}". This action cannot be undone.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">
                  Filter records <span className="text-red-500">*</span>
                </Label>
                <CollapsibleFilterSection
                  schema={sortedFields}
                  filter={filter}
                  onChange={onFilterChange}
                  variables={variables}
                  hasError={filterErrors.length > 0}
                  errorMessage={filterErrors[0]}
                />
                {!hasFilterConditions && (
                  <p className="text-xs text-gray-500">
                    Add filter conditions to identify which records to delete, or enable "Delete all records" below.
                  </p>
                )}
              </div>

              {/* Sort by functionality commented out
              {!deleteMultiple && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Sort by <span className="text-gray-400 font-normal">(determines which record if multiple match)</span>
                  </Label>
                  <CollapsibleSortSection
                    schema={sortedFields}
                    orderBy={orderBy}
                    onChange={onOrderByChange}
                  />
                </div>
              )}
              */}

              <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 text-sm">Options</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Delete Multiple Rows</Label>
                    <p className="text-xs text-gray-500">Delete all rows matching the filter conditions</p>
                  </div>
                  <Switch
                    checked={deleteMultiple}
                    onCheckedChange={setDeleteMultiple}
                  />
                </div>

                {!hasFilterConditions && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-red-600">Delete All Records</Label>
                      <p className="text-xs text-gray-500">Remove every record from this table</p>
                    </div>
                    <Switch
                      checked={deleteAll}
                      onCheckedChange={(checked) => {
                        setDeleteAll(checked);
                        // if (checked) {
                        setDeleteMultiple(true);
                        // }
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
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
