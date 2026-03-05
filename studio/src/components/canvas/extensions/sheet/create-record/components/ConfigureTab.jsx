import React from "react";
import { Database, Pencil, Table } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ODSIcon } from "@src/module/ods";
import SheetRecordGridEnhanced from "../../common-components/SheetRecordGridEnhanced";

const ConfigureTab = ({
  state,
  variables,
  sortedFields,
  loading,
  onEditDataSource,
}) => {
  const { sheet, table, record, onRecordChange } = state;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#22C55E]" />
          <Label className="text-sm font-medium text-gray-900">Data Source</Label>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <ODSIcon outeIconName="TINYSheetIcon" sx={{ width: 32, height: 32 }} />
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
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      {sheet && table && sortedFields.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            Set values for each field in your new record
          </Label>

          <SheetRecordGridEnhanced
            fields={sortedFields}
            record={record}
            onChange={onRecordChange}
            variables={variables}
            showRequired={true}
            data-testid="create-sheet-record-grid"
          />
        </div>
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
