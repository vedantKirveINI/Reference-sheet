import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { GridView } from "@/views/grid/grid-view";
import { FooterStatsBar } from "@/views/grid/footer-stats-bar";
import { AIChatPanel } from "@/views/grid/ai-chat-panel";
import { KanbanView } from "@/views/kanban/kanban-view";
import { CalendarView } from "@/views/calendar/calendar-view";
import { GanttView } from "@/views/gantt/gantt-view";
import { GalleryView } from "@/views/gallery/gallery-view";
import { FormView } from "@/views/form/form-view";
import { ExpandedRecordModal } from "@/views/grid/expanded-record-modal";
import { CommentPanel } from "@/components/comments/comment-panel";
import { MessageSquare, X } from "lucide-react";
import { LinkedRecordExpandModal } from "@/components/linked-record-expand-modal";
import { type SortRule } from "@/views/grid/sort-modal";
import { type FilterRule } from "@/views/grid/filter-modal";
import { type GroupRule } from "@/views/grid/group-modal";
import { ExportModal } from "@/views/grid/export-modal";
import { ImportModal } from "@/views/grid/import-modal";
import { ShareModal } from "@/views/sharing/share-modal";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "@/hooks/useTheme";
import { useFieldsStore, useGridViewStore, useViewStore, useModalControlStore, useHistoryStore, useUIStore } from "@/stores";
import { ITableData, IRecord, ICell, CellType, IColumn, ViewType } from "@/types";
import type { FieldModalData } from "@/views/grid/field-modal";
import { useSheetData } from "@/hooks/useSheetData";
import { updateColumnMeta, createTable, createMultipleFields, renameTable, deleteTable, updateSheetName, createField, updateField, updateFieldsStatus, updateLinkCell, updateViewFilter, updateViewSort, updateViewGroupBy, getGroupPoints, createEnrichmentField } from "@/services/api";
import { getSocket } from "@/services/socket";
import { CreateTableModal } from "@/components/create-table-modal";
import { Toaster, toast } from "sonner";
import type { TableTemplate } from "@/config/table-templates";
import { mapCellTypeToBackendFieldType, parseColumnMeta, type ExtendedColumn } from "@/services/formatters";
import { calculateFieldOrder } from "@/utils/orderUtils";

import { TableSkeleton } from "@/components/layout/table-skeleton";

/** Persist last known grid data per table so we avoid flashing TableSkeleton after remount or when backendData is briefly null. */
const lastKnownProcessedDataByTableId = new Map<string, ITableData>();
let lastUsedTableIdForCache: string = '';

export interface GroupHeaderInfo {
  key: string;
  fieldName: string;
  value: string;
  startIndex: number;
  count: number;
  depth: number;
}

function createEmptyCell(column: { type: CellType; options?: Record<string, unknown> }): ICell {
  switch (column.type) {
    case CellType.String:
      return { type: CellType.String, data: '', displayData: '' };
    case CellType.Number:
      return { type: CellType.Number, data: null, displayData: '' };
    case CellType.SCQ:
      return { type: CellType.SCQ, data: null, displayData: '', options: { options: (column.options?.options as string[]) ?? [] } };
    case CellType.MCQ:
      return { type: CellType.MCQ, data: [], displayData: '', options: { options: (column.options?.options as string[]) ?? [] } };
    case CellType.YesNo:
      return { type: CellType.YesNo, data: null, displayData: '', options: { options: ['Yes', 'No'] } };
    case CellType.Rating:
      return { type: CellType.Rating, data: null, displayData: '' };
    case CellType.DateTime:
      return { type: CellType.DateTime, data: null, displayData: '', options: { dateFormat: 'MM/DD/YYYY', separator: '/', includeTime: false, isTwentyFourHourFormat: false } };
    case CellType.Currency:
      return { type: CellType.Currency, data: null, displayData: '' };
    case CellType.DropDown:
      return { type: CellType.DropDown, data: null, displayData: '', options: { options: (column.options?.options as string[]) ?? [] } };
    default:
      return { type: CellType.String, data: '', displayData: '' };
  }
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function LinkedRecordModalWrapper({ baseId }: { baseId: string }) {
  const linkedRecordModalOpen = useGridViewStore((s) => s.linkedRecordModalOpen);
  const linkedRecordStack = useGridViewStore((s) => s.linkedRecordStack);
  const closeLinkedRecordModal = useGridViewStore((s) => s.closeLinkedRecordModal);
  const pushLinkedRecord = useGridViewStore((s) => s.pushLinkedRecord);
  const popLinkedRecord = useGridViewStore((s) => s.popLinkedRecord);

  return (
    <LinkedRecordExpandModal
      open={linkedRecordModalOpen}
      baseId={baseId}
      stack={linkedRecordStack}
      onClose={closeLinkedRecordModal}
      onPushRecord={pushLinkedRecord}
      onPopRecord={popLinkedRecord}
    />
  );
}

function App() {
  const {
    data: backendData,
    isLoading: isSyncing,
    error: _error,

    emitRowCreate,
    emitRowUpdate,
    emitRowInsert,
    deleteRecords,
    refetchRecords,
    tableList,
    sheetName,
    switchTable,
    switchView,
    currentTableId,
    getIds,
    setTableList,
    setSheetName: setBackendSheetName,
    currentView: _currentView,
    hasNewRecords,
  } = useSheetData();

  useTheme();

  const [tableData, setTableData] = useState<ITableData | null>(null);
  const [fieldModal, setFieldModal] = useState<FieldModalData | null>(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  /** When opening from "Insert before/after", anchor the popover at this position (client coords). */
  const [fieldModalAnchorPosition, setFieldModalAnchorPosition] = useState<{ x: number; y: number } | null>(null);
  const hiddenColumnIds = useFieldsStore((s) => s.hiddenColumnIds);
  const toggleColumnVisibility = useFieldsStore((s) => s.toggleColumnVisibility);
  const expandedRecordId = useGridViewStore((s) => s.expandedRecordId);
  const setExpandedRecordId = useGridViewStore((s) => s.setExpandedRecordId);
  const commentSidebarRecordId = useGridViewStore((s) => s.commentSidebarRecordId);
  const commentSidebarOpen = useGridViewStore((s) => s.commentSidebarOpen);
  const setCommentSidebarOpen = useGridViewStore((s) => s.setCommentSidebarOpen);
  const views = useViewStore((s) => s.views);
  const currentViewId = useViewStore((s) => s.currentViewId);
  const setViews = useViewStore((s) => s.setViews);
  const setCurrentViewId = useViewStore((s) => s.setCurrentView);

  const currentViewObj = views.find(v => v.id === currentViewId);
  const currentViewType = currentViewObj?.type ? String(currentViewObj.type) : 'default_grid';
  const isKanbanView = currentViewType === ViewType.Kanban || currentViewType === 'kanban';
  const isCalendarView = currentViewType === ViewType.Calendar || currentViewType === 'calendar';
  const isGanttView = currentViewType === ViewType.Gantt || currentViewType === 'gantt';
  const isGalleryView = currentViewType === ViewType.Gallery || currentViewType === 'gallery';
  const isFormView = currentViewType === ViewType.Form || currentViewType === 'form';

  const [isAddingTable, setIsAddingTable] = useState(false);
  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const addingTableRef = useRef(false);
  const prevViewIdRef = useRef<string | null>(null);
  /** Keep last non-null processedData to avoid flashing TableSkeleton when backendData is briefly null (e.g. after updated_field). */
  const lastKnownProcessedDataRef = useRef<ITableData | null>(null);
  const [sortConfig, setSortConfigLocal] = useState<SortRule[]>([]);
  const [filterConfig, setFilterConfigLocal] = useState<FilterRule[]>([]);
  const [groupConfig, setGroupConfigLocal] = useState<GroupRule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchMatch, setCurrentSearchMatch] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [serverGroupPoints, setServerGroupPoints] = useState<any[]>([]);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const activeData = useMemo(() => {
    return tableData ?? backendData ?? null;
  }, [tableData, backendData]);

  useEffect(() => {
    if (!backendData) return;
    try {
      const { columns, records, rowHeaders } = backendData;
      if (!Array.isArray(columns) || !Array.isArray(records)) {
        return;
      }
      if (rowHeaders != null && !Array.isArray(rowHeaders)) {
        return;
      }
      if (rowHeaders != null && rowHeaders.length !== records.length) {
        return;
      }
      setTableData(backendData);
    } catch (e) {
      console.error('[App] Error syncing backendData to tableData:', e);
    }
  }, [backendData]);

  useEffect(() => {
    if (!tableList.length || !currentTableId) return;
    const currentTable = tableList.find((t: any) => t.id === currentTableId);
    if (currentTable?.views?.length) {
      const mappedViews = currentTable.views.map((v: any) => ({
        id: v.id,
        name: v.name || 'Untitled View',
        type: v.type || 'default_grid',
        user_id: v.user_id || '',
        tableId: currentTableId,
      }));
      setViews(mappedViews);
      if (!currentViewId || !currentTable.views.find((v: any) => v.id === currentViewId)) {
        setCurrentViewId(currentTable.views[0]?.id || null);
      }
    } else {
      setViews([]);
      setCurrentViewId(null);
    }
  }, [tableList, currentTableId]);

  useEffect(() => {
    if (!currentViewId || currentViewId === prevViewIdRef.current) return;
    if (currentViewId.startsWith('default-')) return;
    if (!prevViewIdRef.current) {
      prevViewIdRef.current = currentViewId;
      return;
    }
    prevViewIdRef.current = currentViewId;

    const currentTable = tableList.find((t: any) => t.id === currentTableId);
    const viewObj = currentTable?.views?.find((v: any) => v.id === currentViewId);
    switchView(currentViewId, viewObj || undefined);
  }, [currentViewId, tableList, currentTableId, switchView]);

  const fetchGroupPointsFromServer = useCallback(async (groupRules: GroupRule[]) => {
    if (groupRules.length === 0) {
      setServerGroupPoints([]);
      return;
    }
    const ids = getIds();
    if (!ids.assetId || !ids.tableId || !ids.viewId) return;
    try {
      const res = await getGroupPoints({
        baseId: ids.assetId,
        tableId: ids.tableId,
        viewId: ids.viewId,
      });
      setServerGroupPoints(res.data?.groupPoints || []);
    } catch (err) {
      console.error('Failed to fetch group points:', err);
      setServerGroupPoints([]);
    }
  }, [getIds]);

  const currentData = activeData;

  const buildBackendFilterPayload = useCallback((rules: FilterRule[], columns: IColumn[]) => {
    if (rules.length === 0) return {};
    const conjunction = rules[0]?.conjunction || 'and';
    return {
      id: `filter_root`,
      condition: conjunction,
      childs: rules.map((r, i) => {
        const col = columns.find(c => c.id === r.columnId);
        const rawId = col?.rawId ? Number(col.rawId) : 0;
        const opKey = r.operator || 'contains';
        return {
          key: `filter_${i}`,
          field: rawId,
          type: (col?.rawType || 'SHORT_TEXT') as any,
          operator: { key: opKey, value: opKey },
          value: r.value ?? '',
        };
      }),
    };
  }, []);

  const setSortConfig = useCallback((configOrUpdater: SortRule[] | ((prev: SortRule[]) => SortRule[])) => {
    setSortConfigLocal((prev) => {
      const newConfig = typeof configOrUpdater === 'function' ? configOrUpdater(prev) : configOrUpdater;
      const ids = getIds();
      if (ids.assetId && ids.tableId && ids.viewId) {
        const columns = activeData?.columns ?? [];
        updateViewSort({
          baseId: ids.assetId,
          tableId: ids.tableId,
          id: ids.viewId,
          sort: {
            sortObjs: newConfig.map(r => {
              const col = columns.find(c => c.id === r.columnId);
              return {
                fieldId: Number(col?.rawId || 0),
                order: r.direction,
                dbFieldName: col?.dbFieldName || r.columnId,
                type: col?.rawType || 'SHORT_TEXT',
              };
            }),
            manualSort: false,
          },
        }).then(() => {
          refetchRecords();
        }).catch(err => console.error('Failed to persist sort:', err));
      }
      return newConfig;
    });
  }, [getIds, activeData]);

  const setFilterConfig = useCallback((configOrUpdater: FilterRule[] | ((prev: FilterRule[]) => FilterRule[])) => {
    setFilterConfigLocal((prev) => {
      const newConfig = typeof configOrUpdater === 'function' ? configOrUpdater(prev) : configOrUpdater;
      const ids = getIds();
      if (ids.assetId && ids.tableId && ids.viewId) {
        const columns = activeData?.columns ?? [];
        const filterPayload = buildBackendFilterPayload(newConfig, columns);
        updateViewFilter({
          baseId: ids.assetId,
          tableId: ids.tableId,
          id: ids.viewId,
          filter: filterPayload,
        }).then(() => {
          refetchRecords();
        }).catch(err => console.error('Failed to persist filter:', err));
      }
      return newConfig;
    });
  }, [getIds, activeData, buildBackendFilterPayload]);

  const setGroupConfig = useCallback((configOrUpdater: GroupRule[] | ((prev: GroupRule[]) => GroupRule[])) => {
    setGroupConfigLocal((prev) => {
      const newConfig = typeof configOrUpdater === 'function' ? configOrUpdater(prev) : configOrUpdater;
      const ids = getIds();
      if (ids.assetId && ids.tableId && ids.viewId) {
        const columns = activeData?.columns ?? [];
        updateViewGroupBy({
          baseId: ids.assetId,
          tableId: ids.tableId,
          id: ids.viewId,
          groupBy: {
            groupObjs: newConfig.map(r => {
              const col = columns.find(c => c.id === r.columnId);
              return {
                fieldId: Number(col?.rawId || 0),
                order: r.direction,
                dbFieldName: col?.dbFieldName || r.columnId,
                type: col?.rawType || 'SHORT_TEXT',
              };
            }),
          },
        }).then(() => {
          fetchGroupPointsFromServer(newConfig);
          refetchRecords();
        }).catch(err => console.error('Failed to persist group:', err));
      }
      if (newConfig.length === 0) {
        setServerGroupPoints([]);
      }
      return newConfig;
    });
  }, [getIds, activeData, fetchGroupPointsFromServer]);

  useEffect(() => {
    if (!_currentView) {
      setSortConfigLocal([]);
      setFilterConfigLocal([]);
      setGroupConfigLocal([]);
      setServerGroupPoints([]);
      setSearchQuery("");
      setCollapsedGroups(new Set());
      useUIStore.getState().setColumnColors({});
      return;
    }
    setSearchQuery("");
    setCollapsedGroups(new Set());
  }, [_currentView?.id, currentTableId]);

  useEffect(() => {
    if (!_currentView) return;
    const cm = parseColumnMeta(_currentView.columnMeta);
    const columns = activeData?.columns ?? [];
    if (columns.length === 0) return;
    const newColors: Record<string, string | null> = {};
    for (const [fieldId, meta] of Object.entries(cm)) {
      if (meta?.color) {
        const col = columns.find(c => String(c.rawId) === fieldId || c.id === fieldId);
        if (col) {
          newColors[col.id] = meta.color;
        }
      }
    }
    useUIStore.getState().setColumnColors(newColors);
  }, [_currentView?.id, _currentView?.columnMeta, currentTableId, activeData?.columns?.length]);

  const viewSortKey = JSON.stringify(_currentView?.sort);
  const viewFilterKey = JSON.stringify(_currentView?.filter);
  const viewGroupKey = JSON.stringify(_currentView?.group);

  useEffect(() => {
    if (!_currentView) return;
    const columns = activeData?.columns ?? [];
    const viewSort = _currentView.sort;
    if (viewSort?.sortObjs?.length) {
      const mapped: SortRule[] = viewSort.sortObjs.map((s: any) => {
        const fieldId = typeof s.fieldId === 'string' ? s.fieldId : String(s.fieldId);
        const col = columns.find(c => String(c.rawId) === fieldId || c.dbFieldName === s.dbFieldName);
        return {
          columnId: col?.id || s.dbFieldName || fieldId,
          direction: s.order === 'desc' ? 'desc' as const : 'asc' as const,
        };
      });
      setSortConfigLocal(mapped);
    } else {
      setSortConfigLocal([]);
    }

    const viewFilter = _currentView.filter;
    if (viewFilter?.childs?.length) {
      const mapped: FilterRule[] = viewFilter.childs
        .filter((child: any) => child.field !== undefined)
        .map((f: any) => {
          const fieldNum = typeof f.field === 'number' ? f.field : Number(f.field);
          const col = columns.find(c => Number(c.rawId) === fieldNum);
          const opKey = typeof f.operator === 'object' ? f.operator.key : (f.operator || 'contains');
          return {
            columnId: col?.id || String(fieldNum),
            operator: opKey,
            value: f.value ?? '',
            conjunction: viewFilter.condition || 'and',
          };
        });
      setFilterConfigLocal(mapped);
    } else if (viewFilter?.filterSet?.length) {
      const mapped: FilterRule[] = viewFilter.filterSet.map((f: any) => {
        const fieldId = typeof f.fieldId === 'string' ? f.fieldId : String(f.fieldId);
        const col = columns.find(c => String(c.rawId) === fieldId || c.dbFieldName === f.dbFieldName);
        return {
          columnId: col?.id || f.dbFieldName || fieldId,
          operator: f.operator || 'contains',
          value: f.value ?? '',
          conjunction: viewFilter.conjunction || 'and',
        };
      });
      setFilterConfigLocal(mapped);
    } else {
      setFilterConfigLocal([]);
    }

    const viewGroup = _currentView.group;
    if (viewGroup?.groupObjs?.length) {
      const mapped: GroupRule[] = viewGroup.groupObjs.map((g: any) => {
        const fieldId = typeof g.fieldId === 'string' ? g.fieldId : String(g.fieldId);
        const col = columns.find(c => String(c.rawId) === fieldId || c.dbFieldName === g.dbFieldName);
        return {
          columnId: col?.id || g.dbFieldName || fieldId,
          direction: g.order === 'desc' ? 'desc' as const : 'asc' as const,
        };
      });
      setGroupConfigLocal(mapped);
      fetchGroupPointsFromServer(mapped);
    } else {
      setGroupConfigLocal([]);
      setServerGroupPoints([]);
    }
  }, [_currentView?.id, currentTableId, viewSortKey, viewFilterKey, viewGroupKey]);

  useEffect(() => {
    if (_currentView && groupConfig.length > 0 && activeData?.columns?.length) {
      const columns = activeData.columns;
      const viewGroup = _currentView.group;
      if (viewGroup?.groupObjs?.length) {
        const needsRemap = groupConfig.some(g => {
          const col = columns.find(c => c.id === g.columnId);
          return !col;
        });
        if (needsRemap) {
          const mapped: GroupRule[] = viewGroup.groupObjs.map((g: any) => {
            const fieldId = typeof g.fieldId === 'string' ? g.fieldId : String(g.fieldId);
            const col = columns.find(c => String(c.rawId) === fieldId || c.dbFieldName === g.dbFieldName);
            return {
              columnId: col?.id || g.dbFieldName || fieldId,
              direction: g.order === 'desc' ? 'desc' as const : 'asc' as const,
            };
          });
          setGroupConfigLocal(mapped);
        }
      }
    }
  }, [activeData?.columns]);

  const handleSheetNameChange = useCallback(async (name: string) => {
    setBackendSheetName(name);
    const ids = getIds();
    if (!ids.assetId) return;
    try {
      await updateSheetName({ baseId: ids.assetId, name });
    } catch (err) {
      console.error('Failed to update sheet name:', err);
    }
  }, [getIds, setBackendSheetName]);

  const handleToggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    setTableData(prev => {
      if (!prev) return prev;
      const newColumns = [...prev.columns];
      const [moved] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, moved);
      return { ...prev, columns: newColumns };
    });
  }, []);

  const handleColumnResizeEnd = useCallback((fieldId: number, newWidth: number) => {
    const sock = getSocket();
    const ids = getIds();
    if (sock && ids.assetId && ids.tableId && ids.viewId) {
      sock.emit('update_column_meta', {
        tableId: ids.tableId,
        baseId: ids.assetId,
        viewId: ids.viewId,
        columnMeta: [{ id: fieldId, width: newWidth }],
      });
    }
  }, []);

  const handleAddRow = useCallback(() => {
    emitRowCreate();
  }, [emitRowCreate]);

  const executeDeleteRows = useCallback(async (rowIndices: number[]) => {
    if (!currentData) return;
    const recordIds = rowIndices
      .map(idx => currentData.records[idx]?.id)
      .filter(Boolean) as string[];
    if (recordIds.length > 0) {
      await deleteRecords(recordIds);
    }
  }, [deleteRecords, currentData]);

  const handleDeleteRows = useCallback((rowIndices: number[]) => {
    const count = rowIndices.length;
    setConfirmDialog({
      open: true,
      title: count > 1 ? `Delete ${count} rows` : 'Delete row',
      description: count > 1
        ? `Are you sure you want to delete ${count} rows? This action cannot be undone.`
        : 'Are you sure you want to delete this row? This action cannot be undone.',
      onConfirm: () => {
        setConfirmDialog(null);
        (async () => {
          try {
            await executeDeleteRows(rowIndices);
            useGridViewStore.getState().clearSelectedRows();
          } catch {
            toast.error('Failed to delete. Please try again.');
          }
        })();
      },
    });
  }, [executeDeleteRows]);

  const handleDuplicateRow = useCallback((rowIndex: number) => {
    setTableData(prev => {
      if (!prev) return prev;
      const original = prev.records[rowIndex];
      if (!original) return prev;
      const newId = `rec_${generateId()}`;
      const newCells: Record<string, ICell> = {};
      for (const [key, cell] of Object.entries(original.cells)) {
        newCells[key] = { ...cell } as ICell;
      }
      const newRecord: IRecord = { id: newId, cells: newCells };
      const newRecords = [...prev.records];
      newRecords.splice(rowIndex + 1, 0, newRecord);
      const newRowHeaders = [...prev.rowHeaders];
      newRowHeaders.splice(rowIndex + 1, 0, {
        id: newId,
        rowIndex: rowIndex + 1,
        heightLevel: prev.rowHeaders[rowIndex]?.heightLevel ?? 'Short' as any,
      });
      return { ...prev, records: newRecords, rowHeaders: newRowHeaders };
    });
  }, []);

  const handleAddTable = useCallback(() => {
    setShowCreateTableModal(true);
  }, []);

  const createTableAndAddToSidebar = useCallback(async (tableName: string, extraFields?: Array<{ name: string; type: string; options?: Record<string, any> }>) => {
    if (addingTableRef.current) return;
    addingTableRef.current = true;
    setIsAddingTable(true);
    const baseId = getIds().assetId;
    try {
      const res = await createTable({ baseId, name: tableName });
      const responseData = res.data?.data || res.data;
      const newTable = responseData?.table || responseData;
      const newView = responseData?.view;
      if (newTable?.id) {
        if (extraFields && extraFields.length > 0) {
          try {
            await createMultipleFields({
              baseId,
              tableId: newTable.id,
              viewId: newView?.id,
              fields_payload: extraFields,
            });
          } catch (fieldErr) {
            console.error('Failed to create template fields:', fieldErr);
          }
        }
        const views = newView ? [{ id: newView.id, name: newView.name || 'Default View', type: newView.type || 'default_grid' }] : newTable.views || [];
        setTableList((prev: any[]) => {
          if (prev.some((t: any) => t.id === newTable.id)) return prev;
          return [...prev, { id: newTable.id, name: newTable.name || tableName, views }];
        });
        switchTable(newTable.id);
      }
    } catch (err) {
      console.error('Failed to create table:', err);
      throw err;
    } finally {
      addingTableRef.current = false;
      setIsAddingTable(false);
    }
  }, [getIds, setTableList, switchTable]);

  const handleCreateFromTemplate = useCallback(async (template: TableTemplate, customName?: string) => {
    await createTableAndAddToSidebar(customName || template.name, template.fields);
  }, [createTableAndAddToSidebar]);

  const handleCreateBlankTable = useCallback(async (name: string) => {
    await createTableAndAddToSidebar(name);
  }, [createTableAndAddToSidebar]);

  const handleNewTableCreatedFromImport = useCallback(
    (table: { id: string; name?: string }, view: { id: string; name?: string; type?: string } | null) => {
      setTableList((prev: any[]) => {
        if (prev.some((t: any) => t.id === table.id)) return prev;
        const views = view
          ? [{ id: view.id, name: view.name || 'Default View', type: view.type || 'default_grid' }]
          : [];
        return [...prev, { id: table.id, name: table.name || 'Imported', views }];
      });
      // Defer so tableListRef in useSheetData is updated before switchTable reads it
      setTimeout(() => switchTable(table.id), 0);
    },
    [setTableList, switchTable]
  );

  const handleRenameTable = useCallback((tableId: string, newName: string) => {
    const baseId = getIds().assetId;
    setTableList((prev: any[]) => prev.map((t: any) => t.id === tableId ? { ...t, name: newName } : t));
    renameTable({ baseId, tableId, name: newName }).catch(err => {
      console.error('Failed to rename table:', err);
    });
  }, [getIds, setTableList]);

  const handleDeleteTable = useCallback((tableId: string) => {
    const baseId = getIds().assetId;
    setTableList((prev: any[]) => {
      const remaining = prev.filter((t: any) => t.id !== tableId);
      if (remaining.length > 0 && currentTableId === tableId) {
        const deletedIdx = prev.findIndex((t: any) => t.id === tableId);
        const nextTable = deletedIdx > 0 ? remaining[deletedIdx - 1] : remaining[0];
        switchTable(nextTable.id);
      }
      return remaining;
    });
    deleteTable({ baseId, tableId }).catch(err => {
      console.error('Failed to delete table:', err);
    });
  }, [getIds, setTableList, switchTable, currentTableId]);

  const handleExpandRecord = useCallback((recordId: string) => {
    setExpandedRecordId(recordId);
  }, [setExpandedRecordId]);

  const handleRecordUpdate = useCallback((recordId: string, updatedCells: Record<string, any>) => {
    setTableData(prev => {
      if (!prev) return prev;
      const newRecords = prev.records.map(record => {
        if (record.id !== recordId) return record;
        const newCellsMap = { ...record.cells };
        for (const [colId, value] of Object.entries(updatedCells)) {
          if (newCellsMap[colId]) {
            const existingCell = newCellsMap[colId];
            newCellsMap[colId] = {
              ...existingCell,
              data: value,
              displayData: value != null ? String(value) : '',
            } as ICell;
          }
        }
        return { ...record, cells: newCellsMap };
      });
      return { ...prev, records: newRecords };
    });
  }, []);

  const { pushAction, undo: undoAction, redo: redoAction, canUndo, canRedo } = useHistoryStore();

  const pendingEmitRef = useRef<{ recordIndex: number; columnId: string; updatedCell: ICell } | null>(null);

  const applyCellChange = useCallback((recordId: string, columnId: string, value: any) => {
    pendingEmitRef.current = null;
    flushSync(() => {
      setTableData(prev => {
        if (!prev) return prev;
        const recordIndex = prev.records.findIndex(r => r.id === recordId);
        if (recordIndex === -1) return prev;
        const record = prev.records[recordIndex];
        const cell = record.cells[columnId];
        if (!cell) return prev;

        const updatedCell = { ...cell, data: value, displayData: value != null ? String(value) : '' } as ICell;

        pendingEmitRef.current = { recordIndex, columnId, updatedCell };

        const newRecords = prev.records.map(r => {
          if (r.id !== recordId) return r;
          return {
            ...r,
            cells: {
              ...r.cells,
              [columnId]: updatedCell,
            },
          };
        });
        return { ...prev, records: newRecords };
      });
    });
    const pending = pendingEmitRef.current as { recordIndex: number; columnId: string; updatedCell: ICell } | null;
    pendingEmitRef.current = null;
    if (pending) {
      emitRowUpdate(pending.recordIndex, pending.columnId, pending.updatedCell);
    }
    localStorage.setItem('tinytable_last_modify', String(Date.now()));
  }, [emitRowUpdate]);

  const handleCellChange = useCallback((recordId: string, columnId: string, value: any) => {
    const currentRecord = tableData?.records.find(r => r.id === recordId);
    const previousValue = currentRecord?.cells[columnId]?.data;
    const column = currentData?.columns.find(c => c.id === columnId);

    pushAction({
      type: 'cell_change',
      timestamp: Date.now(),
      data: { recordId, columnId, value },
      undo: { recordId, columnId, value: previousValue },
    });

    if (column?.type === CellType.Link && Array.isArray(value)) {
      const ids = getIds();
      const fieldId = Number((column as any).rawId || column.id);
      if (ids.tableId && ids.assetId && fieldId) {
        setTableData(prev => {
          if (!prev) return prev;
          const ri = prev.records.findIndex(r => r.id === recordId);
          if (ri === -1) return prev;
          const record = prev.records[ri];
          const cell = record.cells[columnId];
          if (!cell) return prev;
          const updatedCell = { ...cell, data: value, displayData: `${value.length} linked record(s)` } as ICell;
          const newRecords = prev.records.map(r => r.id !== recordId ? r : { ...r, cells: { ...r.cells, [columnId]: updatedCell } });
          return { ...prev, records: newRecords };
        });
        updateLinkCell({
          tableId: ids.tableId,
          baseId: ids.assetId,
          fieldId,
          recordId: Number(recordId),
          linkedRecordIds: value.map((r: any) => r.id),
        }).catch(err => console.error('Failed to update link cell:', err));
        return;
      }
    }

    applyCellChange(recordId, columnId, value);
  }, [tableData, currentData, pushAction, applyCellChange, getIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (!canUndo) return;
        const action = undoAction();
        if (!action) return;

        if (action.type === 'cell_change') {
          const { recordId, columnId, value } = action.undo;
          applyCellChange(recordId, columnId, value);
        }
      }

      if (modifier && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (!canRedo) return;
        const action = redoAction();
        if (!action) return;

        if (action.type === 'cell_change') {
          const { recordId, columnId, value } = action.data;
          applyCellChange(recordId, columnId, value);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undoAction, redoAction, applyCellChange]);

  const handleInsertRowAbove = useCallback((rowIndex: number) => {
    if (!currentData) return;
    const targetRecord = currentData.records[rowIndex];
    if (!targetRecord) return;

    emitRowInsert(targetRecord.id, 'before');
  }, [currentData, emitRowInsert]);

  const handleInsertRowBelow = useCallback((rowIndex: number) => {
    if (!currentData) return;
    const targetRecord = currentData.records[rowIndex];
    if (!targetRecord) return;

    emitRowInsert(targetRecord.id, 'after');
  }, [currentData, emitRowInsert]);

  const handleFieldSave = useCallback(async (fieldData: FieldModalData) => {
    const ids = getIds();
    const backendType = mapCellTypeToBackendFieldType(fieldData.fieldType);

    if (fieldData.mode === 'create') {
      if (!ids.tableId || !ids.assetId) return;

      if (fieldData.options?.__enrichmentCreate) {
        try {
          const { __enrichmentCreate, isRequired, isUnique, ...enrichmentOptions } = fieldData.options;

          const existingNames = new Set(
            (currentData?.columns || []).map((c: any) => c.name?.toLowerCase())
          );
          existingNames.add(fieldData.fieldName.toLowerCase());

          const entityLabel = enrichmentOptions.entityType === 'company' ? 'Company'
            : enrichmentOptions.entityType === 'person' ? 'Contact'
            : enrichmentOptions.entityType === 'email' ? 'Email' : '';

          const deduplicatedFields = (enrichmentOptions.fieldsToEnrich || []).map((f: any) => {
            let name = f.name;
            if (existingNames.has(name.toLowerCase())) {
              name = entityLabel ? `${entityLabel} ${name}` : `${name} (Enriched)`;
            }
            let finalName = name;
            let suffix = 2;
            while (existingNames.has(finalName.toLowerCase())) {
              finalName = `${name} ${suffix}`;
              suffix++;
            }
            existingNames.add(finalName.toLowerCase());
            return { ...f, name: finalName };
          });

          let parentName = fieldData.fieldName;
          if (existingNames.has(parentName.toLowerCase())) {
            parentName = `${parentName} (Enrichment)`;
            let suffix = 2;
            while (existingNames.has(parentName.toLowerCase())) {
              parentName = `${fieldData.fieldName} (Enrichment ${suffix})`;
              suffix++;
            }
          }

          await createEnrichmentField({
            baseId: ids.assetId,
            tableId: ids.tableId,
            viewId: ids.viewId,
            name: parentName,
            description: fieldData.description,
            type: 'ENRICHMENT',
            entityType: enrichmentOptions.entityType,
            identifier: enrichmentOptions.identifier,
            fieldsToEnrich: deduplicatedFields,
            options: { autoUpdate: enrichmentOptions.autoUpdate },
          });
          setFieldModalOpen(false);
          setFieldModal(null);
          setFieldModalAnchorPosition(null);
          setTimeout(() => refetchRecords(), 500);
        } catch (err: any) {
          console.error('Failed to create enrichment field:', err);
          const msg = err?.response?.data?.message || err?.message || 'Failed to create enrichment field';
          alert(msg);
        }
        return;
      }

      // Align with legacy: use insertOrder when set (Insert Left/Right), else append; ensure numeric order
      const lastCol = currentData?.columns[currentData.columns.length - 1];
      const newOrder =
        fieldData.insertOrder != null
          ? Number(fieldData.insertOrder)
          : lastCol != null
            ? Number(lastCol.order ?? currentData!.columns.length) + 1
            : 1;
      // Payload shape mirrors legacy useAddField: order first, then baseId/viewId/tableId, then name/type/description/options
      const createPayload = {
        order: newOrder,
        baseId: ids.assetId,
        viewId: ids.viewId,
        tableId: ids.tableId,
        name: fieldData.fieldName,
        type: backendType,
        description: fieldData.description ?? '',
        options: fieldData.options,
      };
      try {
        await createField(createPayload);
        setFieldModalOpen(false);
        setFieldModal(null);
        setFieldModalAnchorPosition(null);
      } catch (err) {
        console.error('Failed to create field:', err);
      }
      return;
    }

    if (fieldData.mode === 'edit' && fieldData.fieldId) {
      if (ids.tableId && ids.assetId) {
        const col = currentData?.columns.find(c => c.id === fieldData.fieldId);
        const numericId = fieldData.fieldRawId ?? (fieldData.fieldId != null ? Number(fieldData.fieldId) : NaN);
        if (numericId != null && !Number.isNaN(numericId)) {
          try {
            await updateField({
              baseId: ids.assetId,
              tableId: ids.tableId,
              viewId: ids.viewId,
              id: numericId,
              name: fieldData.fieldName,
              type: backendType,
              order: col?.order,
              options: fieldData.options,
              description: fieldData.description,
            });
            // Legacy-style: update UI from API success; socket will also send updated_field and we sync that to tableData (deferred for column-only to avoid white screen).
            setTableData(prev => {
              if (!prev) return prev;
              const newColumns = prev.columns.map(c => {
                if (c.id !== fieldData.fieldId) return c;
                const next = { ...c, name: fieldData.fieldName, type: fieldData.fieldType, options: fieldData.options };
                if (fieldData.description !== undefined) (next as ExtendedColumn).description = fieldData.description;
                return next;
              });
              return { ...prev, columns: newColumns };
            });
          } catch (err) {
            console.error('Failed to update field:', err);
          }
        }
      }
      setFieldModalOpen(false);
      setFieldModal(null);
      setFieldModalAnchorPosition(null);
    }
  }, [getIds, currentData, refetchRecords]);

  const executeDeleteColumn = useCallback(async (columnId: string) => {
    const snapshot = currentData;
    setTableData(prev => {
      if (!prev) return prev;
      const newColumns = prev.columns.filter(c => c.id !== columnId);
      const newRecords = prev.records.map(record => {
        const newCells = { ...record.cells };
        delete newCells[columnId];
        return { ...record, cells: newCells };
      });
      return { ...prev, columns: newColumns, records: newRecords };
    });
    const ids = getIds();
    if (ids.tableId && ids.assetId) {
        try {
          const numId = Number(columnId);
          const fieldIdForApi = Number.isNaN(numId) ? columnId : numId;
          await updateFieldsStatus({
            baseId: ids.assetId,
            tableId: ids.tableId,
            viewId: ids.viewId,
            fields: [{ id: fieldIdForApi as number, status: 'inactive' }],
          });
        } catch (err) {
          console.error('Failed to delete field:', err);
          if (snapshot) {
            setTableData(snapshot);
          }
        }
    }
  }, [getIds, currentData]);

  const handleDeleteColumn = useCallback((columnId: string) => {
    const column = currentData?.columns.find(c => c.id === columnId);
    const columnName = column?.name ?? 'this field';
    setConfirmDialog({
      open: true,
      title: 'Delete field',
      description: `Are you sure you want to delete "${columnName}"? All data in this field will be permanently lost.`,
      onConfirm: () => executeDeleteColumn(columnId),
    });
  }, [executeDeleteColumn, currentData]);

  const handleDuplicateColumn = useCallback((columnId: string) => {
    setTableData(prev => {
      if (!prev) return prev;
      const colIndex = prev.columns.findIndex(c => c.id === columnId);
      if (colIndex === -1) return prev;
      const original = prev.columns[colIndex];
      const newColId = `col_${generateId()}`;
      const newColumn: IColumn = {
        ...original,
        id: newColId,
        name: `${original.name} (copy)`,
      };
      const newColumns = [...prev.columns];
      newColumns.splice(colIndex + 1, 0, newColumn);
      const newRecords = prev.records.map(record => {
        const originalCell = record.cells[columnId];
        const newCells = { ...record.cells };
        if (originalCell) {
          newCells[newColId] = { ...originalCell } as ICell;
        } else {
          newCells[newColId] = createEmptyCell(newColumn);
        }
        return { ...record, cells: newCells };
      });
      return { ...prev, columns: newColumns, records: newRecords };
    });
  }, []);

  const handleAddColumn = useCallback(() => {
    setFieldModalAnchorPosition(null);
    setFieldModal({
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    });
    setFieldModalOpen(true);
  }, []);

  const handleEditField = useCallback((column: IColumn, anchorPosition?: { x: number; y: number } | null) => {
    console.log('[EditField] handleEditField called', { columnId: column.id, columnName: column.name, hasAnchor: !!anchorPosition });
    const ext = column as ExtendedColumn;
    const rawId = ext.rawId != null ? (typeof ext.rawId === 'number' ? ext.rawId : Number(ext.rawId)) : undefined;
    const fieldOptions = ext.rawOptions || column.options;
    const modalData: FieldModalData = {
      mode: 'edit',
      fieldName: column.name,
      fieldType: column.type,
      fieldId: column.id,
      fieldRawId: rawId != null && !Number.isNaN(rawId) ? rawId : undefined,
      options: typeof fieldOptions === 'object' && !Array.isArray(fieldOptions) ? fieldOptions : { options: fieldOptions },
      description: ext.description,
    };
    setFieldModalAnchorPosition(anchorPosition ?? null);
    setFieldModal(modalData);
    setFieldModalOpen(true);
  }, []);

  const handleEditFieldDeferred = useCallback((column: IColumn, anchorPosition?: { x: number; y: number } | null) => {
    setTimeout(() => {
      handleEditField(column, anchorPosition);
    }, 0);
  }, [handleEditField]);

  const handleInsertColumnBefore = useCallback((columnId: string, position?: { x: number; y: number }) => {
    if (!currentData) return;
    const colIndex = currentData.columns.findIndex(c => c.id === columnId);
    if (colIndex === -1) return;
    const newOrder = calculateFieldOrder({
      columns: currentData.columns,
      targetIndex: colIndex,
      position: 'left',
    });
    const modalData: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
      insertOrder: newOrder,
    };
    setTimeout(() => {
      setFieldModalAnchorPosition(position ?? null);
      setFieldModal(modalData);
      setFieldModalOpen(true);
    }, 0);
  }, [currentData]);

  const handleInsertColumnAfter = useCallback((columnId: string, position?: { x: number; y: number }) => {
    if (!currentData) return;
    const colIndex = currentData.columns.findIndex(c => c.id === columnId);
    if (colIndex === -1) return;
    const newOrder = calculateFieldOrder({
      columns: currentData.columns,
      targetIndex: colIndex,
      position: 'right',
    });
    const modalData: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
      insertOrder: newOrder,
    };
    setTimeout(() => {
      setFieldModalAnchorPosition(position ?? null);
      setFieldModal(modalData);
      setFieldModalOpen(true);
    }, 0);
  }, [currentData]);

  const handleHideColumn = useCallback((columnId: string) => {
    toggleColumnVisibility(columnId);
  }, [toggleColumnVisibility]);

  const handleHideFieldsPersist = useCallback(async (hiddenIds: Set<string>) => {
    if (!currentData) return;
    const ids = getIds();
    if (!ids.assetId || !ids.tableId || !ids.viewId) return;
    try {
      const columnMetaArr: Array<{ id: number; is_hidden?: boolean; width?: number }> = [];
      currentData.columns.forEach(col => {
        const numericId = Number((col as any).rawId);
        if (!isNaN(numericId)) {
          columnMetaArr.push({
            id: numericId,
            is_hidden: hiddenIds.has(col.id),
            width: col.width || 150,
          });
        }
      });
      await updateColumnMeta({
        baseId: ids.assetId,
        tableId: ids.tableId,
        viewId: ids.viewId,
        columnMeta: columnMetaArr,
      });
    } catch (err) {
      console.error('Failed to persist column visibility:', err);
    }
  }, [currentData, getIds]);

  const handleSortColumn = useCallback((columnId: string, direction: 'asc' | 'desc') => {
    setSortConfig([{ columnId, direction }]);
  }, []);

  const handleImport = useCallback((records: IRecord[], mode: "append" | "replace") => {
    setTableData(prev => {
      if (!prev) return prev;
      const newRecords = mode === "replace" ? records : [...prev.records, ...records];
      const newRowHeaders = newRecords.map((r, i) => ({
        id: r.id,
        rowIndex: i,
        heightLevel: prev.rowHeaders[0]?.heightLevel ?? 'Short' as any,
      }));
      return { ...prev, records: newRecords, rowHeaders: newRowHeaders };
    });
  }, []);

  const handleFilterByColumn = useCallback((columnId: string) => {
    const column = currentData?.columns.find(c => c.id === columnId);
    if (!column) return;
    const newRule: FilterRule = {
      columnId,
      operator: 'contains',
      value: '',
      conjunction: 'and',
    };
    setFilterConfig(prev => {
      const existing = prev.find(r => r.columnId === columnId);
      if (existing) return prev;
      return [...prev, newRule];
    });
    useModalControlStore.getState().openFilter();
  }, [currentData]);

  const handleGroupByColumn = useCallback((columnId: string) => {
    const column = currentData?.columns.find(c => c.id === columnId);
    if (!column) return;
    const newRule: GroupRule = {
      columnId,
      direction: 'asc',
    };
    setGroupConfig(prev => {
      const existing = prev.find(r => r.columnId === columnId);
      if (existing) return prev;
      return [...prev, newRule];
    });
    useModalControlStore.getState().openGroupBy();
  }, [currentData]);

  const handleFreezeColumn = useCallback((_columnId: string) => {
  }, []);

  const handleUnfreezeColumns = useCallback(() => {
  }, []);

  const sortedColumnIds = useMemo(() => new Set(sortConfig.map(r => r.columnId)), [sortConfig]);
  const filteredColumnIds = useMemo(() => new Set(filterConfig.map(r => r.columnId)), [filterConfig]);
  const groupedColumnIds = useMemo(() => new Set(groupConfig.map(r => r.columnId)), [groupConfig]);

  const processedData = useMemo(() => {
    if (!currentData) return null;
    let records = [...currentData.records];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      records = records.filter((record) =>
        Object.values(record.cells).some((cell) => {
          const display = cell.displayData ?? "";
          return String(display).toLowerCase().includes(query);
        })
      );
    }

    if (groupConfig.length > 0 && serverGroupPoints.length > 0) {
      const columns = currentData.columns;
      const recordsWithHeaders: IRecord[] = [];
      let recordIdx = 0;
      const activeGroupKeys: Record<number, string> = {};

      for (let i = 0; i < serverGroupPoints.length; i++) {
        const point = serverGroupPoints[i];
        if (point.type === 0) {
          const depth = point.depth ?? 0;
          const groupId = point.id || `group_${i}`;
          const groupValue = point.value != null ? String(point.value) : '(Empty)';

          let fieldName = '';
          if (groupConfig[depth]) {
            const col = columns.find(c => c.id === groupConfig[depth].columnId);
            fieldName = col?.name || '';
          }

          const groupKey = `${depth}:${groupId}`;
          activeGroupKeys[depth] = groupKey;
          for (let d = depth + 1; d < groupConfig.length; d++) {
            delete activeGroupKeys[d];
          }

          let isHiddenByAncestor = false;
          for (let d = 0; d < depth; d++) {
            if (activeGroupKeys[d] && collapsedGroups.has(activeGroupKeys[d])) {
              isHiddenByAncestor = true;
              break;
            }
          }

          if (isHiddenByAncestor) continue;

          const isCollapsed = collapsedGroups.has(groupKey);

          let groupCount = 0;
          if (i + 1 < serverGroupPoints.length && serverGroupPoints[i + 1].type === 1) {
            groupCount = serverGroupPoints[i + 1].count || 0;
          }

          const markerRecord: IRecord = {
            id: `__group__${groupKey}`,
            cells: {
              '__group_meta__': {
                type: CellType.String,
                data: {
                  fieldName,
                  value: groupValue,
                  count: groupCount,
                  isCollapsed,
                  key: groupKey,
                  depth,
                } as any,
                displayData: groupValue,
              } as any,
            },
          };
          recordsWithHeaders.push(markerRecord);
        } else if (point.type === 1) {
          const count = point.count || 0;

          let isAnyAncestorCollapsed = false;
          for (const d of Object.keys(activeGroupKeys)) {
            const key = activeGroupKeys[Number(d)];
            if (key && collapsedGroups.has(key)) {
              isAnyAncestorCollapsed = true;
              break;
            }
          }

          if (!isAnyAncestorCollapsed) {
            for (let j = 0; j < count && recordIdx < records.length; j++) {
              recordsWithHeaders.push(records[recordIdx]);
              recordIdx++;
            }
          } else {
            recordIdx += count;
          }
        }
      }

      records = recordsWithHeaders;
    }

    const newRowHeaders = records.map((r, i) => ({
      id: r.id,
      rowIndex: i,
      heightLevel: currentData.rowHeaders[0]?.heightLevel ?? ("Short" as any),
    }));

    return { ...currentData, records, rowHeaders: newRowHeaders };
  }, [currentData, groupConfig, searchQuery, collapsedGroups, serverGroupPoints]);

  const footerVisibleColumns = useMemo(
    () => (processedData ? processedData.columns.filter((c: IColumn) => !hiddenColumnIds?.has(c.id)) : []),
    [processedData?.columns, hiddenColumnIds]
  );

  const searchMatches = useMemo(() => {
    if (!processedData || !searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    const matches: { row: number; col: number }[] = [];
    const visibleColumns = processedData.columns;
    for (let r = 0; r < processedData.records.length; r++) {
      const record = processedData.records[r];
      if (record.id?.startsWith('__group__')) continue;
      for (let c = 0; c < visibleColumns.length; c++) {
        const cell = record.cells[visibleColumns[c].id];
        if (cell) {
          const displayText = String(cell.displayData ?? '');
          if (displayText && displayText.toLowerCase().includes(query)) {
            matches.push({ row: r, col: c });
          }
        }
      }
    }
    return matches;
  }, [processedData, searchQuery]);

  const searchMatchCount = searchMatches.length;

  useEffect(() => {
    setCurrentSearchMatch(0);
  }, [searchQuery]);

  const currentSearchMatchCell = useMemo(() => {
    if (searchMatches.length === 0) return null;
    const idx = Math.max(0, Math.min(currentSearchMatch, searchMatches.length - 1));
    return searchMatches[idx] ?? null;
  }, [searchMatches, currentSearchMatch]);

  const handleNextMatch = useCallback(() => {
    if (searchMatchCount === 0) return;
    setCurrentSearchMatch(prev => (prev + 1) % searchMatchCount);
  }, [searchMatchCount]);

  const handlePrevMatch = useCallback(() => {
    if (searchMatchCount === 0) return;
    setCurrentSearchMatch(prev => (prev - 1 + searchMatchCount) % searchMatchCount);
  }, [searchMatchCount]);

  const handleReplace = useCallback((searchText: string, replaceText: string) => {
    if (!processedData || searchMatches.length === 0 || !searchText.trim()) return;
    const idx = Math.max(0, Math.min(currentSearchMatch, searchMatches.length - 1));
    const match = searchMatches[idx];
    if (!match) return;
    const record = processedData.records[match.row];
    const column = processedData.columns[match.col];
    if (!record || !column) return;
    const cell = record.cells[column.id];
    if (!cell) return;
    const displayText = String(cell.displayData ?? '');
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const newValue = displayText.replace(regex, replaceText);
    handleCellChange(record.id, column.id, newValue);
    if (searchMatches.length <= 1) {
      setCurrentSearchMatch(0);
    } else {
      setCurrentSearchMatch(prev => prev >= searchMatches.length - 1 ? 0 : prev);
    }
  }, [processedData, searchMatches, currentSearchMatch, handleCellChange]);

  const handleReplaceAll = useCallback((searchText: string, replaceText: string) => {
    if (!processedData || searchMatches.length === 0 || !searchText.trim()) return;
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    for (const match of searchMatches) {
      const record = processedData.records[match.row];
      const column = processedData.columns[match.col];
      if (!record || !column) continue;
      const cell = record.cells[column.id];
      if (!cell) continue;
      const displayText = String(cell.displayData ?? '');
      const newValue = displayText.replace(regex, replaceText);
      handleCellChange(record.id, column.id, newValue);
    }
    setCurrentSearchMatch(0);
  }, [processedData, searchMatches, handleCellChange]);

  const expandedRecord = useMemo(() => {
    if (!expandedRecordId || !currentData) return null;
    return currentData.records.find(r => r.id === expandedRecordId) ?? null;
  }, [expandedRecordId, currentData]);

  const expandedRecordIndex = useMemo(() => {
    if (!expandedRecordId || !currentData) return -1;
    return currentData.records.findIndex(r => r.id === expandedRecordId);
  }, [expandedRecordId, currentData]);

  const handleExpandPrev = useCallback(() => {
    if (!currentData || expandedRecordIndex <= 0) return;
    setExpandedRecordId(currentData.records[expandedRecordIndex - 1].id);
  }, [currentData, expandedRecordIndex, setExpandedRecordId]);

  const handleExpandNext = useCallback(() => {
    if (!currentData || expandedRecordIndex >= currentData.records.length - 1) return;
    setExpandedRecordId(currentData.records[expandedRecordIndex + 1].id);
  }, [currentData, expandedRecordIndex, setExpandedRecordId]);

  const handleDeleteExpandedRecord = useCallback((recordId: string) => {
    if (!currentData) return;
    const idx = currentData.records.findIndex(r => r.id === recordId);
    if (idx === -1) return;
    setConfirmDialog({
      open: true,
      title: 'Delete record',
      description: 'Are you sure you want to delete this record? This action cannot be undone.',
      onConfirm: () => {
        executeDeleteRows([idx]);
        setExpandedRecordId(null);
      },
    });
  }, [currentData, executeDeleteRows, setExpandedRecordId]);

  const handleDuplicateExpandedRecord = useCallback((recordId: string) => {
    if (!currentData) return;
    const idx = currentData.records.findIndex(r => r.id === recordId);
    if (idx !== -1) {
      handleDuplicateRow(idx);
    }
    setExpandedRecordId(null);
  }, [currentData, handleDuplicateRow, setExpandedRecordId]);

  const cacheKey = currentTableId ?? '';
  const fromCache = lastKnownProcessedDataByTableId.get(cacheKey) ?? (lastUsedTableIdForCache ? lastKnownProcessedDataByTableId.get(lastUsedTableIdForCache) ?? null : null);
  const displayProcessedData = processedData ?? lastKnownProcessedDataRef.current ?? fromCache ?? null;
  if (processedData) {
    lastKnownProcessedDataRef.current = processedData;
    if (cacheKey) {
      lastKnownProcessedDataByTableId.set(cacheKey, processedData);
      lastUsedTableIdForCache = cacheKey;
    }
  }
  const displayCurrentData = currentData ?? (displayProcessedData ? { columns: displayProcessedData.columns, records: displayProcessedData.records, rowHeaders: displayProcessedData.rowHeaders ?? [] } : null);

  if (!displayProcessedData) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <MainLayout
      tables={tableList.map((t: any) => ({ id: t.id, name: t.name }))}
      activeTableId={currentTableId}
      onTableSelect={switchTable}
      onAddTable={handleAddTable}
      isAddingTable={isAddingTable}
      onRenameTable={handleRenameTable}
      onDeleteTable={handleDeleteTable}
      onDeleteRows={handleDeleteRows}
      onDuplicateRow={handleDuplicateRow}
      sortCount={sortConfig.length}
      onSearchChange={setSearchQuery}
      searchMatchCount={searchMatchCount}
      currentSearchMatch={searchMatchCount > 0 ? currentSearchMatch + 1 : 0}
      onNextMatch={handleNextMatch}
      onPrevMatch={handlePrevMatch}
      onReplace={handleReplace}
      onReplaceAll={handleReplaceAll}
      columns={displayCurrentData?.columns ?? []}
      sortConfig={sortConfig}
      onSortApply={setSortConfig}
      filterConfig={filterConfig}
      onFilterApply={setFilterConfig}
      groupConfig={groupConfig}
      onGroupApply={setGroupConfig}
      baseId={getIds().assetId}
      tableId={currentTableId}
      sheetName={sheetName}
      onSheetNameChange={handleSheetNameChange}
      onAddRow={handleAddRow}
      currentView={currentViewType}
      isDefaultView={currentViewType === 'default_grid'}
      showSyncButton={isFormView || isGalleryView || isKanbanView || isCalendarView || isGanttView}
      onFetchRecords={refetchRecords}
      isSyncing={isSyncing}
      hasNewRecords={hasNewRecords ?? false}
      hiddenColumnIds={hiddenColumnIds}
      onToggleColumn={toggleColumnVisibility}
      onHideFieldsPersist={handleHideFieldsPersist}
    >
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden flex">
          <div className="flex-1 min-w-0 overflow-hidden">
          {isKanbanView ? (
            <KanbanView
              data={displayProcessedData}
              // onCellChange={handleCellChange}
              // onAddRow={handleAddRow}
              // onDeleteRows={handleDeleteRows}
              // onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
            />
          ) : isCalendarView ? (
            <CalendarView
              data={displayProcessedData}
              // onCellChange={handleCellChange}
              // onAddRow={handleAddRow}
              // onDeleteRows={handleDeleteRows}
              // onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
            />
          ) : isGanttView ? (
            <GanttView
              data={displayProcessedData}
              // onCellChange={handleCellChange}
              // onAddRow={handleAddRow}
              // onDeleteRows={handleDeleteRows}
              // onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
            />
          ) : isGalleryView ? (
            <GalleryView
              data={displayProcessedData}
              // onCellChange={handleCellChange}
              // onAddRow={handleAddRow}
              // onDeleteRows={handleDeleteRows}
              // onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
            />
          ) : isFormView ? (
            <FormView
              data={displayProcessedData}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onRecordUpdate={handleRecordUpdate}
            />
          ) : (
            <GridView
              data={displayProcessedData}
              hiddenColumnIds={hiddenColumnIds}
              onColumnReorder={handleColumnReorder}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onDeleteRows={handleDeleteRows}
              onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
              onInsertRowAbove={handleInsertRowAbove}
              onInsertRowBelow={handleInsertRowBelow}
              onDeleteColumn={handleDeleteColumn}
              onDuplicateColumn={handleDuplicateColumn}
              onInsertColumnBefore={handleInsertColumnBefore}
              onInsertColumnAfter={handleInsertColumnAfter}
              onSortColumn={handleSortColumn}
              onHideColumn={handleHideColumn}
              onFilterByColumn={handleFilterByColumn}
              onGroupByColumn={handleGroupByColumn}
              onFreezeColumn={handleFreezeColumn}
              onUnfreezeColumns={handleUnfreezeColumns}
              onToggleGroup={handleToggleGroup}
              fieldModal={fieldModal}
              fieldModalOpen={fieldModalOpen}
              fieldModalAnchorPosition={fieldModalAnchorPosition}
              setFieldModal={setFieldModal}
              setFieldModalOpen={setFieldModalOpen}
              setFieldModalAnchorPosition={setFieldModalAnchorPosition}
              onFieldSave={handleFieldSave}
              onAddColumn={handleAddColumn}
              onEditField={handleEditFieldDeferred}
              sortedColumnIds={sortedColumnIds}
              filteredColumnIds={filteredColumnIds}
              groupedColumnIds={groupedColumnIds}
              searchQuery={searchQuery}
              currentSearchMatchCell={currentSearchMatchCell}
              baseId={getIds().assetId}
              tableId={currentTableId}
              tables={tableList.map((t: any) => ({ id: t.id, name: t.name }))}
              onSetColumnColor={(columnId, color) => {
                const ids = getIds();
                if (ids.assetId && ids.tableId && ids.viewId) {
                  const col = displayCurrentData?.columns.find(c => c.id === columnId);
                  const numericId = col ? Number((col as any).rawId) : NaN;
                  if (!isNaN(numericId)) {
                    updateColumnMeta({
                      baseId: ids.assetId,
                      tableId: ids.tableId,
                      viewId: ids.viewId,
                      columnMeta: [{ id: numericId, color: color ?? null }],
                    }).catch(console.error);
                  }
                }
              }}
              onColumnResizeEnd={handleColumnResizeEnd}
            />
          )}
          </div>
          {commentSidebarOpen && (
            <div className="w-[320px] shrink-0 border-l border-border bg-background flex flex-col h-full">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>Comments</span>
                </div>
                <button
                  onClick={() => setCommentSidebarOpen(false)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {commentSidebarRecordId && currentTableId ? (
                <CommentPanel
                  tableId={currentTableId}
                  recordId={commentSidebarRecordId}
                />
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground px-6">
                  <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-xs text-center">Click a row or comment icon to view comments for that record</p>
                </div>
              )}
            </div>
          )}
        </div>
        {displayProcessedData && (
          <>
            <div className="shrink-0">
              <FooterStatsBar
                data={displayProcessedData}
                visibleColumns={footerVisibleColumns}
                totalRecordCount={displayCurrentData?.records.filter(r => !r.id?.startsWith('__group__')).length ?? 0}
                visibleRecordCount={displayProcessedData.records.filter(r => !r.id?.startsWith('__group__')).length}
                sortCount={sortConfig.length}
                filterCount={filterConfig.length}
                groupCount={groupConfig.length}
              />
            </div>
            <AIChatPanel
              baseId={getIds().assetId}
              tableId={currentTableId}
              viewId={currentViewId || ''}
              tableName={tableList.find((t: any) => t.id === currentTableId)?.name}
              viewName={currentViewObj?.name}
              onFilterApply={setFilterConfig}
              onSortApply={setSortConfig}
              onGroupApply={setGroupConfig}
              columns={displayCurrentData?.columns ?? []}
              currentFilters={filterConfig}
              currentSorts={sortConfig}
              currentGroups={groupConfig}
            />
          </>
        )}
      </div>
      <ExpandedRecordModal
        open={!!expandedRecordId}
        record={expandedRecord}
        columns={displayCurrentData?.columns ?? []}
        tableId={currentTableId || undefined}
        baseId={getIds().assetId || undefined}
        onClose={() => setExpandedRecordId(null)}
        onSave={handleRecordUpdate}
        onDelete={handleDeleteExpandedRecord}
        onDuplicate={handleDuplicateExpandedRecord}
        onPrev={handleExpandPrev}
        onNext={handleExpandNext}
        hasPrev={expandedRecordIndex > 0}
        hasNext={displayCurrentData ? expandedRecordIndex < displayCurrentData.records.length - 1 : false}
        currentIndex={expandedRecordIndex}
        totalRecords={displayCurrentData?.records.length}
        onExpandLinkedRecord={(foreignTableId, recordId, title) => {
          useGridViewStore.getState().openLinkedRecord({ foreignTableId, recordId, title });
        }}
      />
      <LinkedRecordModalWrapper baseId={getIds().assetId || ''} />
      <ExportModal
        data={displayProcessedData}
        hiddenColumnIds={hiddenColumnIds}
        baseId={getIds().assetId}
        tableId={getIds().tableId}
        viewId={getIds().viewId}
        tableName={tableList.find((t: any) => t.id === currentTableId)?.name}
      />
      <ImportModal
        data={displayCurrentData ?? { columns: [], records: [], rowHeaders: [] }}
        onImport={handleImport}
        baseId={getIds().assetId}
        tableId={getIds().tableId}
        viewId={getIds().viewId}
        onNewTableCreated={handleNewTableCreatedFromImport}
      />
      <ShareModal baseId={getIds().assetId} tableId={getIds().tableId} workspaceId={getIds().workspaceId} />
      <CreateTableModal
        open={showCreateTableModal}
        onOpenChange={setShowCreateTableModal}
        onCreateFromTemplate={handleCreateFromTemplate}
        onCreateBlank={handleCreateBlankTable}
      />
      {confirmDialog && (
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => {
            confirmDialog.onConfirm();
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      <Toaster />
    </MainLayout>
  );
}

export default App;
