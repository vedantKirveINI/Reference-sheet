import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Database, Pencil, Table, Columns, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ODSIcon } from "@src/module/ods";
import CollapsibleFilterSection from "../../common-components/CollapsibleFilterSection";
import SheetOrderByV2 from "../../common-components/SheetOrderByV2";
import { COLUMN_TO_SHOW } from "../../../constants/sheet-column-type";

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
    orderBy,
    limit,
    offset,
    onRecordChange,
    onFilterChange,
    onOrderByChange,
    onLimitChange,
    onOffsetChange,
  } = state;

  const [columnsExpanded, setColumnsExpanded] = useState(false);

  // Limit input: allow clearing with backspace (empty = 100), avoid leading zeros
  const [limitInput, setLimitInput] = useState(() => String(limit ?? 100));

  // Keep offset input as string so typing "2" doesn't show "02" (no leading zero)
  const [offsetInput, setOffsetInput] = useState(() => String(offset ?? 0));

  // Initialize localRecord from parent record prop (persisted across tab changes)
  const [localRecord, setLocalRecord] = useState(() => {
    console.log('[ConfigureTab:FindAll] Initial mount, record from parent:', record?.length, 'fields:', sortedFields?.length);
    if (record && record.length > 0) {
      return record;
    }
    return [];
  });

  // Track what we've synced to avoid re-init on remount
  const lastSyncedTableIdRef = useRef(table?.id);
  const lastSyncedFieldIdsRef = useRef('');
  const hasInitializedRef = useRef(record && record.length > 0);
  const localRecordRef = useRef(localRecord);
  const recordRef = useRef(record);

  // Keep refs in sync
  useEffect(() => {
    localRecordRef.current = localRecord;
  }, [localRecord]);

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  const fieldIds = useMemo(() =>
    sortedFields.map(f => f.id).sort().join(','),
    [sortedFields]
  );

  // Check if two record arrays are structurally equal (same ids and checked states)
  const areRecordsEqual = useCallback((a, b) => {
    if (!a || !b || a.length !== b.length) return false;
    return a.every((item, idx) =>
      item.id === b[idx]?.id && item.checked === b[idx]?.checked
    );
  }, []);

  // Initialize/update localRecord when table/fields change
  // Key insight: on remount, if record prop has data, we already restored it in useState
  // Uses refs to access current values without adding them as dependencies
  useEffect(() => {
    const tableChanged = table?.id !== lastSyncedTableIdRef.current;
    const fieldsChanged = fieldIds !== lastSyncedFieldIdsRef.current;

    console.log('[ConfigureTab:FindAll] Effect check:', {
      tableChanged,
      fieldsChanged,
      tableId: table?.id,
      lastTableId: lastSyncedTableIdRef.current,
      fieldIds: fieldIds?.substring(0, 50),
      lastFieldIds: lastSyncedFieldIdsRef.current?.substring(0, 50),
      hasInitialized: hasInitializedRef.current,
      localRecordLen: localRecordRef.current?.length,
      recordPropLen: recordRef.current?.length,
    });

    // If we already have data and nothing changed, skip
    if (hasInitializedRef.current && !tableChanged && !fieldsChanged) {
      console.log('[ConfigureTab:FindAll] Skipping - already initialized, no changes');
      return;
    }

    if (sortedFields.length === 0) {
      console.log('[ConfigureTab:FindAll] Skipping - no sortedFields');
      return;
    }

    // Update tracking refs
    lastSyncedTableIdRef.current = table?.id;
    lastSyncedFieldIdsRef.current = fieldIds;

    // On table change, reset. Otherwise, preserve existing checked states (using refs)
    const existingRecord = tableChanged ? [] : (recordRef.current || []);
    const existingLocal = tableChanged ? [] : (localRecordRef.current || []);

    const initialRecord = sortedFields.map((field) => {
      const existingFromLocal = existingLocal.find((r) => r.id === field.id);
      const existingFromRecord = existingRecord.find((r) => r.id === field.id);
      const existing = existingFromLocal || existingFromRecord;
      return {
        id: field.id,
        key: field.name,
        name: field.name,
        type: field.type,
        dbFieldType: field.dbFieldType,
        dbFieldName: field.dbFieldName,
        field: field.id || field.dbFieldName,
        checked: existing?.checked !== undefined ? existing.checked : true,
      };
    });

    // Only update if data actually changed
    if (!areRecordsEqual(initialRecord, localRecordRef.current)) {
      console.log('[ConfigureTab:FindAll] Updating localRecord:', initialRecord.length, 'items');
      setLocalRecord(initialRecord);
      onRecordChange(initialRecord);
      hasInitializedRef.current = true;
    } else {
      console.log('[ConfigureTab:FindAll] Records equal, skipping update');
      hasInitializedRef.current = true;
    }
  }, [fieldIds, table?.id, sortedFields, onRecordChange, areRecordsEqual]);

  const handleFieldToggle = useCallback((fieldId) => {
    setLocalRecord((prev) => {
      const updated = prev.map((r) =>
        r.id === fieldId ? { ...r, checked: !r.checked } : r
      );
      // Sync to parent immediately
      onRecordChange(updated);
      return updated;
    });
  }, [onRecordChange]);

  const handleSelectAll = useCallback((checked) => {
    setLocalRecord((prev) => {
      const updated = prev.map((r) => ({ ...r, checked }));
      // Sync to parent immediately
      onRecordChange(updated);
      return updated;
    });
  }, [onRecordChange]);

  const allSelected = localRecord.length > 0 && localRecord.every((r) => r.checked);
  const someSelected = localRecord.some((r) => r.checked) && !allSelected;
  const selectedCount = localRecord.filter((r) => r.checked).length;

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
              Filter records <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <CollapsibleFilterSection
              schema={sortedFields}
              filter={filter}
              onChange={onFilterChange}
              variables={variables}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Sort by <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <SheetOrderByV2
              schema={sortedFields}
              orderByRowData={orderBy}
              onChange={onOrderByChange}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Pagination
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Limit (max records)</Label>
                <Input
                  type="number"
                  value={limitInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setLimitInput("");
                      onLimitChange(100);
                    } else {
                      const num = parseInt(raw, 10);
                      if (!Number.isNaN(num) && num >= 1) {
                        onLimitChange(num);
                        setLimitInput(String(num));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (limitInput === "") {
                      setLimitInput("100");
                    }
                  }}
                  placeholder="100"
                  min={1}
                  className={cn(
                    "rounded-xl border-gray-200",
                    "focus:border-[#22C55E] focus:ring-[#22C55E]"
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Offset (skip records)</Label>
                <Input
                  type="number"
                  value={offsetInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const num = raw === "" ? 0 : parseInt(raw, 10);
                    console.log("num >>", num, raw)
                    if (!Number.isNaN(num) && num >= 0) {
                      onOffsetChange(num);
                      setOffsetInput(raw === "" ? "" : String(num));
                    } else {
                      setOffsetInput(raw);
                    }
                  }}
                  placeholder="0"
                  min={0}
                  className={cn(
                    "rounded-xl border-gray-200",
                    "focus:border-[#22C55E] focus:ring-[#22C55E]"
                  )}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Use offset for pagination. E.g., offset 100 with limit 100 returns records 101-200.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setColumnsExpanded(!columnsExpanded)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-[#22C55E]" />
                <Label className="text-sm font-medium text-gray-900 cursor-pointer">
                  Output Fields
                </Label>
                <span className="text-xs text-gray-500">
                  ({selectedCount} of {localRecord.length} fields will be returned)
                </span>
              </div>
              {columnsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Choose which fields to include in the results. Unselected fields won't appear in the output.
            </p>

            {columnsExpanded && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]"
                  />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {allSelected ? "Deselect All" : "Select All"}
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {localRecord.map((field) => (
                    <div
                      key={field.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-b-0",
                        "hover:bg-gray-50 cursor-pointer transition-colors",
                        field.checked && "bg-[#22C55E]/5"
                      )}
                      onClick={() => handleFieldToggle(field.id)}
                    >
                      <Checkbox
                        checked={field.checked}
                        className="data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {COLUMN_TO_SHOW[field.type]?._src && (
                          <img
                            src={COLUMN_TO_SHOW[field.type]._src}
                            alt={field.type}
                            className="w-4 h-4"
                          />
                        )}
                        <span className="text-sm text-gray-900">{field.key}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {COLUMN_TO_SHOW[field.type]?.name || field.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
