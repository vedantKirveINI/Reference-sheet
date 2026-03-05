import React, { useState, useCallback, useEffect } from "react";
import { Database, Pencil, Filter, ArrowUpDown, Columns, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import DBFilter from "../../common-components/DBFilter";
import DBFilterPlaceholder from "../../common-components/DBFilterPlaceholder";

const ConfigureTab = ({ state, variables, onEditDataSource }) => {
  const {
    connection,
    table,
    schemaFields,
    record,
    filter,
    sortBy,
    sortOrder,
    onRecordFieldChanged,
    onFilterChange,
    onSortChange,
    validation,
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

  useEffect(() => {
    initializeRecordFromFields();
  }, [initializeRecordFromFields]);

  const handleFieldToggle = useCallback((fieldName) => {
    const updatedRecord = record.map((field) =>
      field.key === fieldName || field.name === fieldName
        ? { ...field, checked: !field.checked }
        : field
    );
    onRecordFieldChanged(updatedRecord);
  }, [record, onRecordFieldChanged]);

  const handleSelectAll = useCallback(() => {
    const allChecked = record.every((field) => field.checked);
    const updatedRecord = record.map((field) => ({ ...field, checked: !allChecked }));
    onRecordFieldChanged(updatedRecord);
  }, [record, onRecordFieldChanged]);

  const handleSortFieldChange = useCallback((e) => {
    onSortChange(e.target.value, sortOrder);
  }, [onSortChange, sortOrder]);

  const handleSortOrderChange = useCallback((e) => {
    onSortChange(sortBy, e.target.value);
  }, [onSortChange, sortBy]);

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
              isComplete ? "bg-[#8B5CF6] text-white" : "bg-gray-100 text-gray-600"
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
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Define conditions to find the record you&apos;re looking for.
      </p>
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
    </div>
  );

  const sortContent = (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        If multiple records match, sorting determines which one is returned.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Sort By Field</Label>
          <select
            value={sortBy || ""}
            onChange={handleSortFieldChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
          >
            <option value="">None</option>
            {schemaFields?.map((field) => (
              <option key={field.name} value={field.name}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Order</Label>
          <select
            value={sortOrder || "ASC"}
            onChange={handleSortOrderChange}
            disabled={!sortBy}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="ASC">Ascending (A → Z, 1 → 9)</option>
            <option value="DESC">Descending (Z → A, 9 → 1)</option>
          </select>
        </div>
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
          className="text-sm text-[#8B5CF6] hover:underline font-medium"
        >
          {record.every((field) => field.checked) ? "Deselect All" : "Select All"}
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
                className="w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{field.name || field.key}</span>
                {field.type && (
                  <span className="ml-2 text-xs text-gray-400">{field.type}</span>
                )}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );

  const hasFilter = filter && (filter.conditions?.length > 0 || filter.groups?.length > 0);
  const hasSelectedFields = record?.some((r) => r.checked);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#8B5CF6]" />
          <Label className="text-sm font-medium text-gray-900">Data Source</Label>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#8B5CF6]" />
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
            className="flex items-center gap-1.5 text-sm text-[#8B5CF6] hover:text-[#7c3aed] font-medium transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {renderSection(
          "filter",
          "WHERE Clause / Filter",
          Filter,
          filterContent,
          hasFilter
        )}
        {renderSection(
          "sort",
          "Sort By",
          ArrowUpDown,
          sortContent,
          !!sortBy
        )}
        {renderSection(
          "output",
          "Output Fields",
          Columns,
          outputFieldsContent,
          hasSelectedFields
        )}
      </div>

      {!validation.isValid && validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{validation.errors[0]}</p>
        </div>
      )}
    </div>
  );
};

export default ConfigureTab;
