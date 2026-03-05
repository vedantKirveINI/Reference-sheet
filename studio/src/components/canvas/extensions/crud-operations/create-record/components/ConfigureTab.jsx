import React, { useCallback, useEffect } from "react";
import { Database, Pencil, Table, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import DBRecordGrid from "../../common-components/DBRecordGrid";

const ConfigureTab = ({ state, variables, onEditDataSource }) => {
  const {
    connection,
    table,
    schemaFields,
    record,
    onRecordFieldChanged,
    validation,
  } = state;

  const initializeRecordFromFields = useCallback(() => {
    if (schemaFields?.length && (!record?.length || record.length === 0)) {
      const initialRecord = schemaFields.map((field) => ({
        ...field,
        key: field.name,
        type: field.type,
        required: field.field_indicator === "REQUIRED",
        value: { type: "fx", blocks: [] },
        checked: false,
      }));
      onRecordFieldChanged(initialRecord);
    }
  }, [schemaFields, record, onRecordFieldChanged]);

  useEffect(() => {
    initializeRecordFromFields();
  }, [initializeRecordFromFields]);

  const fieldErrors = validation?.errors?.filter(
    (e) => e.includes("field") || e.includes("selected") || e.includes("record")
  ) || [];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#22C55E]" />
          <Label className="text-sm font-medium text-gray-900">Data Source</Label>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {connection?.name || connection?.connection_name || 'Database'}
              </p>
              <p className="text-xs text-gray-500">{table?.name || table}</p>
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

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Map Fields<span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-gray-500 -mt-1">
          Check the fields you want to populate and set their values
        </p>

        {table && schemaFields?.length > 0 ? (
          <DBRecordGrid
            fields={schemaFields}
            record={record}
            onChange={onRecordFieldChanged}
            variables={variables}
            showRequired={true}
            data-testid="create-record-grid"
          />
        ) : table ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Table className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No table selected.</p>
            <p className="text-sm text-gray-400 mt-1">
              Go back to select a database and table first.
            </p>
          </div>
        )}

        {fieldErrors.length > 0 && (
          <p className="text-sm text-red-500">{fieldErrors[0]}</p>
        )}
      </div>
    </div>
  );
};

export default ConfigureTab;
