import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Database,
  Table,
  Filter,
  ChevronDown,
  ChevronUp,
  Columns,
  Hash,
  Pencil,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import DBRecord from "../../common-components/DBRecord";
import DBFilter from "../../common-components/DBFilter";
import DBFilterPlaceholder from "../../common-components/DBFilterPlaceholder";
import SheetOrderByV2 from "../../../sheet/common-components/SheetOrderByV2";
import DBLimitOffset from "../../common-components/DBLimitOffset";
import { FIND_ALL_V2_TYPE } from "../../../constants/types";

const ConfigureTab = ({ state, variables, onEditDataSource }) => {
  const {
    connection,
    table,
    schemaFields,
    record,
    filter,
    orderBy,
    limit,
    offset,
    limitOffsetClause,
    onRecordFieldChanged,
    onFilterChange,
    onOrderByChange,
    updateLimitOffsetData,
  } = state;

  const [expandedSection, setExpandedSection] = useState("filter");

  const initializeRecordFromFields = useCallback(() => {
    if (schemaFields?.length && (!record?.length || record.length === 0)) {
      const initialRecord = schemaFields.map((field) => ({
        ...field,
        key: field.name,
        type: field.type,
        checked: true,
        alias: "",
      }));
      onRecordFieldChanged(initialRecord);
    }
  }, [schemaFields, record, onRecordFieldChanged]);

  const handleFieldToggle = useCallback(
    (fieldName) => {
      const updatedRecord = record.map((field) =>
        field.key === fieldName || field.name === fieldName
          ? { ...field, checked: !field.checked }
          : field,
      );
      onRecordFieldChanged(updatedRecord);
    },
    [record, onRecordFieldChanged],
  );

  const handleSelectAll = useCallback(() => {
    const allChecked = record.every((field) => field.checked);
    const updatedRecord = record.map((field) => ({
      ...field,
      checked: !allChecked,
    }));
    onRecordFieldChanged(updatedRecord);
  }, [record, onRecordFieldChanged]);

  useEffect(() => {
    initializeRecordFromFields();
  }, [initializeRecordFromFields]);

  const renderSection = (
    id,
    title,
    icon,
    content,
    isComplete,
    isOptional = false,
  ) => {
    const isExpanded = expandedSection === id;
    const Icon = icon;

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className={cn(
            "w-full p-4 flex items-center justify-between text-left transition-colors",
            isExpanded ? "bg-gray-50" : "bg-white hover:bg-gray-50",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isComplete
                  ? "bg-[#8B5CF6] text-white"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{title}</span>
              {isOptional && (
                <span className="text-xs text-gray-400 font-normal">
                  (optional)
                </span>
              )}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 bg-white">{content}</div>
        )}
      </div>
    );
  };

  const dataSourceSummary = (
    <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-sm font-medium text-gray-900">
              {connection?.name || connection?.connection_name || "Connection"}
            </span>
          </div>
          <div className="text-gray-300">→</div>
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-sm font-medium text-gray-900">
              {table?.name || table?.table_name || "Table"}
            </span>
          </div>
        </div>
        <button
          onClick={onEditDataSource}
          className="flex items-center gap-1.5 text-sm text-[#8B5CF6] hover:text-[#7c3aed] font-medium transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </div>
  );

  const outputFieldsContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Select which fields to include in the output.
        </p>
        <button
          onClick={handleSelectAll}
          className="text-sm text-[#EC4899] hover:underline font-medium"
        >
          {record.every((field) => field.checked)
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      {schemaFields?.length > 0 ? (
        <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
          {record.map((field) => (
            <label
              key={field.key || field.name}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={field.checked || false}
                onChange={() => handleFieldToggle(field.key || field.name)}
                className="w-4 h-4 rounded border-gray-300 text-[#EC4899] focus:ring-[#EC4899]"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {field.name || field.key}
                </span>
                {field.type && (
                  <span className="ml-2 text-xs text-gray-400">
                    {field.type}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Loading fields...
        </p>
      )}
    </div>
  );

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

  const normalizedOrderBy = useMemo(() => {
    if (!orderBy || orderBy.length === 0) return [];
    return orderBy.map((row) => {
      if (row.order) return row;
      if (row.sort_by) {
        return { ...row, order: row.sort_by };
      }
      return row;
    });
  }, [orderBy]);

  const sortByContent = (
    <div style={{ minHeight: "200px" }}>
      {schemaFields?.length > 0 ? (
        <SheetOrderByV2
          schema={schemaFields}
          orderByRowData={normalizedOrderBy}
          onChange={onOrderByChange}
        />
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Loading fields...
        </p>
      )}
    </div>
  );

  const paginationContent = (
    <DBLimitOffset
      offset={offset}
      limit={limit}
      limitOffsetClause={limitOffsetClause}
      updateLimitOffsetData={updateLimitOffsetData}
    />
  );

  return (
    <div className="space-y-4">
      {dataSourceSummary}

      {renderSection(
        "filter",
        "WHERE Clause",
        Filter,
        filterContent,
        !!filter,
        true,
      )}

      {renderSection(
        "sortBy",
        "Sort by",
        ListOrdered,
        sortByContent,
        normalizedOrderBy?.length > 0,
        true,
      )}

      {renderSection(
        "pagination",
        "Pagination",
        Hash,
        paginationContent,
        !!limit,
        true,
      )}

      {renderSection(
        "outputFields",
        "Output Fields",
        Columns,
        outputFieldsContent,
        record?.some((r) => r.checked),
      )}
    </div>
  );
};

export default ConfigureTab;
