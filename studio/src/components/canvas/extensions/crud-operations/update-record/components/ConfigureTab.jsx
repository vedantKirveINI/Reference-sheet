import React, { useState, useCallback, useEffect } from "react";
import { Database, Filter, ArrowUpDown, Pencil, Edit3, Table, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import DBFilter from "../../common-components/DBFilter";
import DBFilterPlaceholder from "../../common-components/DBFilterPlaceholder";
import DBOrderBy from "../../common-components/DBOrderBy";
import DBRecordGrid from "../../common-components/DBRecordGrid";

const ConfigureTab = ({ state, variables, onEditDataSource }) => {
  const {
    connection,
    table,
    schemaFields,
    record,
    filter,
    // orderBy,
    onRecordFieldChanged,
    onFilterChange,
    // onOrderByChange,
    validation,
  } = state;

  const [expandedSection, setExpandedSection] = useState("filter");

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

  const renderSection = (id, title, icon, content, isComplete) => {
    const isExpanded = expandedSection === id;
    const Icon = icon;

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className={cn(
            "w-full p-4 flex items-center justify-between text-left transition-colors",
            isExpanded ? "bg-gray-50" : "bg-white hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isComplete ? "bg-[#3B82F6] text-white" : "bg-gray-100 text-gray-600"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 bg-white">
            {content}
          </div>
        )}
      </div>
    );
  };

  const filterContent = (
    <div style={{ minHeight: "200px" }}>
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
  );

  // const sortByContent = (
  //   <div style={{ height: "250px" }}>
  //     <DBOrderBy
  //       schema={schemaFields}
  //       orderByRowData={orderBy}
  //       onChange={onOrderByChange}
  //       rowSelection="multiple"
  //       suppressRowClickSelection={true}
  //     />
  //   </div>
  // );

  const fieldsContent = (
    <div className="space-y-4">
      {table && schemaFields?.length > 0 ? (
        <>
          <p className="text-sm text-gray-500">
            Select the fields you want to update and set their new values.
          </p>
          <DBRecordGrid
            fields={schemaFields}
            record={record}
            onChange={onRecordFieldChanged}
            variables={variables}
            showRequired={false}
            data-testid="update-record-grid"
          />
        </>
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
    </div>
  );

  const fieldErrors = validation?.errors?.filter(
    (e) => e.includes("field") || e.includes("selected") || e.includes("record")
  ) || [];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#3B82F6]" />
          <Label className="text-sm font-medium text-gray-900">Data Source</Label>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#3B82F6]" />
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
            className="flex items-center gap-1.5 text-sm text-[#3B82F6] hover:underline font-medium"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {renderSection(
          "filter",
          "WHERE Clause (Filter)",
          Filter,
          filterContent,
          !!filter
        )}
        {/* {renderSection(
          "sortBy",
          "Sort By",
          ArrowUpDown,
          sortByContent,
          orderBy?.some(r => r.checked)
        )} */}
        {renderSection(
          "fields",
          "Fields to Update",
          Edit3,
          fieldsContent,
          record?.some(r => r.checked && r.value?.blocks?.length > 0)
        )}
      </div>

      {fieldErrors.length > 0 && (
        <p className="text-sm text-red-500">{fieldErrors[0]}</p>
      )}

      {!validation.isValid && validation.errors.length > 0 && !fieldErrors.includes(validation.errors[0]) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{validation.errors[0]}</p>
        </div>
      )}
    </div>
  );
};

export default ConfigureTab;
