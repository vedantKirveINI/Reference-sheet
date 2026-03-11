import React from "react";
import { Database, Table, Filter, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DBFilter from "../../common-components/DBFilter";
import DBFilterPlaceholder from "../../common-components/DBFilterPlaceholder";

const ConfigureTab = ({ state, variables, onEditDataSource }) => {
  const {
    connection,
    table,
    schemaFields,
    filter,
    onFilterChange,
  } = state;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EF4444] text-white flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Connection</p>
                <p className="text-sm font-medium text-gray-900">
                  {connection?.name || connection?.connection_name || "Not selected"}
                </p>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EF4444] text-white flex items-center justify-center">
                <Table className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Table</p>
                <p className="text-sm font-medium text-gray-900">
                  {table?.name || table?.table_name || "Not selected"}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditDataSource}
            className="flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            filter ? "bg-[#EF4444] text-white" : "bg-gray-100 text-gray-600"
          )}>
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900">WHERE Clause</h3>
            <p className="text-sm text-gray-500">Specify conditions to identify records to delete</p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4" style={{ minHeight: "200px" }}>
          {schemaFields?.length > 0 ? (
            <DBFilter
              schema={schemaFields}
              filter={filter}
              onChange={onFilterChange}
              variables={variables}
            />
          ) : (
            <DBFilterPlaceholder />
          )}
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-red-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Destructive Operation Warning
            </h4>
            <p className="text-sm text-red-700 mt-1">
              This action will permanently delete records matching the above conditions.
              This operation cannot be undone. Please ensure your WHERE clause is correct
              before proceeding.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-red-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Always test with a small dataset first
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Back up important data before bulk deletions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Use specific conditions to avoid accidental mass deletion
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
