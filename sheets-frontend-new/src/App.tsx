import { analytics } from "@/utils/analytics";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { GetStartedModal } from "@/components/get-started-modal";
import { useCreateBlankSheet } from "@/hooks/useCreateBlankSheet";
import { GridView, type GridViewHandle } from "@/views/grid/grid-view";
import { FooterStatsBar } from "@/views/grid/footer-stats-bar";
import { AIChatPanel } from "@/views/grid/ai-chat-panel";
import { KanbanView } from "@/views/kanban/kanban-view";
import { CalendarView, getDateColumns } from "@/views/calendar/calendar-view";
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
import dayjs from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { flushSync } from "react-dom";
import { useTheme } from "@/hooks/useTheme";
import { useFieldsStore, useGridViewStore, useViewStore, useModalControlStore, useHistoryStore, useUIStore } from "@/stores";
import { ITableData, IRecord, ICell, CellType, IColumn, ViewType } from "@/types";
import { BackendOperatorKey, mapBackendOperatorToUi, mapUiOperatorToBackend } from "@/views/grid/filter-operator-mapping";
import type { FieldModalData } from "@/views/grid/field-modal";
import { useSheetData } from "@/hooks/useSheetData";
import useRequest from "@/hooks/useRequest";
import { useCreateField } from "@/hooks/useCreateField";
import { updateColumnMeta, createTable, createMultipleFields, renameTable, deleteTable, updateField, updateFieldsStatus, updateLinkCell, updateViewFilter, updateViewSort, updateViewGroupBy, getGroupPoints } from "@/services/api";
import { getSocket } from "@/services/socket";
import { CreateTableModal } from "@/components/create-table-modal";
import { Toaster, toast } from "sonner";
import { extractErrorMessage } from "@/utils/error-message";
import type { TableTemplate } from "@/config/table-templates";
import { mapCellTypeToBackendFieldType, parseColumnMeta, formatDateDisplay, formatCellDataForBackend, type ExtendedColumn } from "@/services/formatters";
import { calculateFieldOrder } from "@/utils/orderUtils";
import { isBlockedFieldType, isGroupableFieldType } from "@/utils/fieldTypeGuards";
import { encodeParams, decodeParams } from "@/services/url-params";

import { TableSkeleton } from "@/components/layout/table-skeleton";
import { Button } from "@/components/ui/button";
import { useCreateEnrichmentField } from "@/hooks/useCreateEnrichmentField";
import { useCreateAiColumnField } from "@/hooks/useCreateAiColumnField";
import { STUB_TABLE_DATA, STUB_TABLE_LIST } from "@/data/stubData";

const IS_STUB_MODE = import.meta.env.REACT_APP_STUB_MODE === 'true';

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
    hasSheetLoadError,
    hasSheetNotFound,

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
    emitRowUpdates,
  } = useSheetData();

  const effectiveTableList   = IS_STUB_MODE ? STUB_TABLE_LIST : tableList;
  const effectiveSheetName   = IS_STUB_MODE ? 'Sales Data'    : sheetName;
  const effectiveCurrentTableId = IS_STUB_MODE ? 'stub_table_1' : currentTableId;
  const effectiveIsSyncing   = IS_STUB_MODE ? false           : isSyncing;

  const { createEnrichmentField, loading: createEnrichmentFieldLoading } = useCreateEnrichmentField();
  const { createAiColumnField, loading: createAiColumnFieldLoading } = useCreateAiColumnField();
  const { createField, loading: createFieldRequestLoading } = useCreateField();

  const [, triggerUpdateSheetName] = useRequest(
    { method: 'put', url: '/base/update_base_sheet_name' },
    { manual: true }
  );

  useTheme();

  const [isCreateFieldLoading, setIsCreateFieldLoading] = useState(false);
  const fieldModalLoading = createEnrichmentFieldLoading || createAiColumnFieldLoading || isCreateFieldLoading || createFieldRequestLoading;

  const [tableData, setTableData] = useState<ITableData | null>(IS_STUB_MODE ? STUB_TABLE_DATA : null);
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
  const gridViewRef = useRef<GridViewHandle>(null);
  /** Keep last non-null processedData to avoid flashing TableSkeleton when backendData is briefly null (e.g. after updated_field). */
  const lastKnownProcessedDataRef = useRef<ITableData | null>(null);
  const [sortConfig, setSortConfigLocal] = useState<SortRule[]>([]);
  const [filterConfig, setFilterConfigLocal] = useState<FilterRule[]>([]);
  const [groupConfig, setGroupConfigLocal] = useState<GroupRule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchMatch, setCurrentSearchMatch] = useState(0);

  // Kanban state (lifted so toolbar + view share same state)
  const [kanbanStackFieldId, setKanbanStackFieldId] = useState<string | null>(null);
  const [kanbanVisibleCardFields, setKanbanVisibleCardFields] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [serverGroupPoints, setServerGroupPoints] = useState<any[]>([]);

  // Calendar state (lifted so toolbar + view share same state)
  const [calendarDateFieldId, setCalendarDateFieldId] = useState<string | null>(null);
  const [calendarCurrentDate, setCalendarCurrentDate] = useState<dayjs.Dayjs>(dayjs());

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [focusCommentOnOpen, setFocusCommentOnOpen] = useState(false);
  const [commentCountsVersion, setCommentCountsVersion] = useState(0);
  const [createModeRecord, setCreateModeRecord] = useState<IRecord | null>(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const { createBlankSheet, creating: createBlankLoading } = useCreateBlankSheet();

  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (createBlankLoading) {
        return;
      }
      const q = searchParams.get('q') || '';
      const decoded = decodeParams<Record<string, string>>(q);

      if (optionId === 'find-customer-company') {
        const encoded = encodeParams({ ...decoded, ai: 'companies' });
        setGetStartedOpen(false);
        navigate(`/ai-enrichment?q=${encoded}`);
      } else if (optionId === 'find-customer-people') {
        const encoded = encodeParams({ ...decoded, ai: 'people' });
        setGetStartedOpen(false);
        navigate(`/ai-enrichment?q=${encoded}`);
      } else if (optionId === 'find-competitors-company') {
        const encoded = encodeParams({ ...decoded, ai: 'competitors' });
        setGetStartedOpen(false);
        navigate(`/ai-enrichment?q=${encoded}`);
      } else if (optionId === 'enrich-email') {
        setGetStartedOpen(false);
        try {
          await createBlankSheet(undefined, 'email');
        } catch (e) {
          const message = extractErrorMessage(e, 'Failed to create enrichment table');
          toast.error(message);
        }
      } else if (optionId === 'enrich-company') {
        setGetStartedOpen(false);
        try {
          await createBlankSheet(undefined, 'company');
        } catch (e) {
          const message = extractErrorMessage(e, 'Failed to create enrichment table');
          toast.error(message);
        }
      } else if (optionId === 'enrich-person') {
        setGetStartedOpen(false);
        try {
          await createBlankSheet(undefined, 'person');
        } catch (e) {
          const message = extractErrorMessage(e, 'Failed to create enrichment table');
          toast.error(message);
        }
      }
    },
    [searchParams, navigate, createBlankSheet, createBlankLoading]
  );

  const handleCreateBlank = useCallback(
    async (name: string) => {
      setGetStartedOpen(false);
      try {
        await createBlankSheet(name);
        // URL is updated by useCreateBlankSheet; useSheetData will react and load the new sheet (no reload).
      } catch (e) {
        const message = extractErrorMessage(e, 'Failed to create table');
        toast.error(message);
      }
    },
    [createBlankSheet]
  );

  // App is only mounted when URL has an asset ID (SheetOrGetStartedGate handles the no-asset case).

  const activeData = useMemo(() => {
    return tableData ?? backendData ?? null;
  }, [tableData, backendData]);

  useEffect(() => {
    if (IS_STUB_MODE) return;
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
    if (!effectiveTableList.length || !effectiveCurrentTableId) return;
    const currentTable = effectiveTableList.find((t: any) => t.id === effectiveCurrentTableId);
    if (currentTable?.views?.length) {
      const mappedViews = currentTable.views.map((v: any) => ({
        id: v.id,
        name: v.name || 'Untitled View',
        type: v.type || 'default_grid',
        user_id: v.user_id || '',
        tableId: effectiveCurrentTableId,
        filter: v.filter ?? null,
        sort: v.sort ?? null,
        group: v.group ?? null,
        options: v.options ?? null,
      }));
      setViews(mappedViews);
      if (!currentViewId || !currentTable.views.find((v: any) => v.id === currentViewId)) {
        setCurrentViewId(currentTable.views[0]?.id || null);
      }
    } else {
      setViews([]);
      setCurrentViewId(null);
    }
  }, [effectiveTableList, effectiveCurrentTableId]);

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
    const unsupportedTypes = new Set<string>([
      'FILE_PICKER',
      'TIME',
      'CURRENCY',
      'LIST',
      'RANKING',
      'SIGNATURE',
      'PICTURE',
      'OPINION_SCALE',
    ]);
    return {
      id: `filter_root`,
      condition: conjunction,
      childs: rules
        .map((r, i) => {
          const col = columns.find((c: any) =>
            c.id === r.columnId ||
            String(c.rawId ?? '') === String(r.columnId) ||
            (typeof c.dbFieldName === 'string' && c.dbFieldName === r.columnId)
          ) as any;
          if (!col) {
            return null;
          }
          const backendType: string = (col.rawType || col.type || 'SHORT_TEXT') as any;
          if (unsupportedTypes.has(backendType)) {
            return null;
          }
          const rawId =
            col?.rawId != null
              ? Number(col.rawId)
              : Number(r.columnId);
          const field = Number.isFinite(rawId) ? rawId : 0;
          const leafKey =
            (typeof (col as any).name === 'string' && (col as any).name)
              ? (col as any).name
              : (typeof (col as any).dbFieldName === 'string' && (col as any).dbFieldName)
                ? (col as any).dbFieldName
                : String((col as any).id ?? '');
          let cellTypeForMapping: CellType | string = (col.type as CellType) ?? backendType;
          const uiOp = r.operator || 'contains';

          // For array-of-strings types (MCQ, LIST, DROP_DOWN_STATIC) we want to
          // use the MCQ/List operator set, even if the rendered cell type differs.
          if (backendType === 'DROP_DOWN_STATIC') {
            cellTypeForMapping = CellType.MCQ;
          } else if (backendType === 'LIST') {
            cellTypeForMapping = CellType.List;
          }

          const opKey = mapUiOperatorToBackend(cellTypeForMapping, uiOp);

          // For DATE fields, convert UI value (usually YYYY-MM-DD) to legacy backend format DD/MM/YYYY
          let valueToSend: any = r.value ?? '';
          const isDateBackendType =
            backendType === 'DATE' ||
            backendType === 'CREATED_TIME' ||
            backendType === 'LAST_MODIFIED_TIME';
          if (isDateBackendType && typeof valueToSend === 'string' && valueToSend.trim()) {
            const v = valueToSend.trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
              // YYYY-MM-DD -> DD/MM/YYYY
              const [year, month, day] = v.split('-');
              valueToSend = `${day}/${month}/${year}`;
            } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(v)) {
              // Already YYYY/MM/DD -> DD/MM/YYYY
              const [year, month, day] = v.split('/');
              valueToSend = `${day}/${month}/${year}`;
            } else {
              // Fallback: leave as-is; backend DateTimeUtils can handle multiple formats
              valueToSend = v;
            }
          }

          // For MCQ and Dropdown-like fields, allow FilterRule.value to be a JSON-encoded string array
          // so we can send an actual array of strings to the backend (matching legacy behavior).
          const isMcqOrDropdownBackendType =
            backendType === 'MCQ' ||
            backendType === 'DROP_DOWN' ||
            backendType === 'DROP_DOWN_STATIC';
          if (isMcqOrDropdownBackendType && typeof valueToSend === 'string') {
            const trimmed = valueToSend.trim();
            if (trimmed.startsWith('[')) {
              try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                  valueToSend = parsed
                    .filter((v: unknown) => typeof v === 'string')
                    .map((v: string) => v.trim())
                    .filter(Boolean);
                }
              } catch {
                // ignore JSON parse errors and fall back to raw string
              }
            }
          }

          // Operator "value" is only used by the backend to refine
          // semantics for some operators (e.g. MCQ/array-of-strings).
          // UI labels are always resolved via the frontend registry.
          let operatorValueLabel = '';

          const isArrayOfStringsType =
            backendType === 'MCQ' ||
            backendType === 'DROP_DOWN_STATIC' ||
            backendType === 'LIST';

          if (isArrayOfStringsType) {
            if (opKey === '?|') {
              operatorValueLabel = uiOp === 'has_none_of' ? 'has none of' : 'has any of';
            } else if (opKey === '@>') {
              operatorValueLabel = 'has all of';
            } else if (opKey === '=') {
              operatorValueLabel = uiOp === 'is_empty' ? 'is empty' : 'is exactly';
            } else if (opKey === '>') {
              operatorValueLabel = 'is not empty';
            }
          }

          return {
            key: leafKey,
            field,
            type: backendType as any,
            operator: { key: opKey, value: operatorValueLabel },
            value: valueToSend,
          };
        })
        .filter(Boolean),
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
      const next = typeof configOrUpdater === 'function' ? configOrUpdater(prev) : configOrUpdater;
      const columns = activeData?.columns ?? [];
      const groupableIds = new Set(
        columns.filter((c) => isGroupableFieldType(c.type as CellType)).map((c) => c.id),
      );
      const newConfig = next.filter((r) => groupableIds.has(r.columnId));

      const ids = getIds();
      if (ids.assetId && ids.tableId && ids.viewId) {
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

    const normalizeDateValueForUi = (rawValue: any): string => {
      if (typeof rawValue !== 'string' || !rawValue.trim()) {
        return '';
      }
      const v = rawValue.trim();

      // Exact date already in native input format
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        return v;
      }

      // ISO datetime like 2026-03-13T00:00:00Z → take the date part
      if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
        return v.slice(0, 10);
      }

      // ISO-like with slashes and time: 2026/03/13T... → take the first 10 chars and normalize
      if (/^\d{4}\/\d{2}\/\d{2}T/.test(v)) {
        const base = v.slice(0, 10); // YYYY/MM/DD
        const [year, month, day] = base.split('/');
        if (year && month && day) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Handle DD/MM/YYYY or YYYY/MM/DD (and dash-separated variants)
      const dateLike = v.replace(/-/g, '/');
      const parts = dateLike.split('/');
      if (parts.length === 3) {
        const [a, b, c] = parts;
        if (a.length === 4) {
          // YYYY/MM/DD
          const year = a;
          const month = b.padStart(2, '0');
          const day = c.padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        if (c.length === 4) {
          // DD/MM/YYYY
          const year = c;
          const month = b.padStart(2, '0');
          const day = a.padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }

      // Fallback: try Date.parse on whatever we got
      const d = new Date(v);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      // If we can't interpret it, return as-is (input will likely show empty)
      return v;
    };

    if (viewFilter?.childs?.length) {
      const mapped: FilterRule[] = viewFilter.childs
        .filter((child: any) => child.field !== undefined)
        .map((f: any) => {
          const fieldNum = typeof f.field === 'number' ? f.field : Number(f.field);
          const col = columns.find(c => Number(c.rawId) === fieldNum);
          const opKey = typeof f.operator === 'object' ? f.operator.key : (f.operator || 'contains');
          const cellType = (col?.type ?? col?.rawType ?? f.type ?? 'SHORT_TEXT') as CellType | string;
          const uiOperator = mapBackendOperatorToUi(cellType, opKey);
          const isDateType =
            cellType === CellType.DateTime ||
            cellType === CellType.CreatedTime ||
            cellType === CellType.LastModifiedTime ||
            cellType === 'DATE' ||
            cellType === 'CREATED_TIME' ||
            cellType === 'LAST_MODIFIED_TIME';
          const rawValue = f.value ?? '';
          const value = isDateType ? normalizeDateValueForUi(rawValue) : rawValue;

          return {
            columnId: col?.id || String(fieldNum),
            operator: uiOperator,
            value,
            conjunction: viewFilter.condition || 'and',
          };
        });
      setFilterConfigLocal(mapped);
    } else if (viewFilter?.filterSet?.length) {
      const mapped: FilterRule[] = viewFilter.filterSet.map((f: any) => {
        const fieldId = typeof f.fieldId === 'string' ? f.fieldId : String(f.fieldId);
        const col = columns.find(c => String(c.rawId) === fieldId || c.dbFieldName === f.dbFieldName);
        const cellType = (col?.type ?? col?.rawType ?? f.type ?? 'SHORT_TEXT') as CellType | string;
        const isDateType =
          cellType === CellType.DateTime ||
          cellType === CellType.CreatedTime ||
          cellType === CellType.LastModifiedTime ||
          cellType === 'DATE' ||
          cellType === 'CREATED_TIME' ||
          cellType === 'LAST_MODIFIED_TIME';
        const rawValue = f.value ?? '';
        const value = isDateType ? normalizeDateValueForUi(rawValue) : rawValue;
        return {
          columnId: col?.id || f.dbFieldName || fieldId,
          operator: mapBackendOperatorToUi(cellType, f.operator || 'contains'),
          value,
          conjunction: viewFilter.conjunction || 'and',
        };
      });
      setFilterConfigLocal(mapped);
    } else {
      setFilterConfigLocal([]);
    }

    const viewGroup = _currentView.group;
    if (viewGroup?.groupObjs?.length) {
      const mapped: GroupRule[] = viewGroup.groupObjs
        .map((g: any) => {
          const fieldId = typeof g.fieldId === 'string' ? g.fieldId : String(g.fieldId);
          const col = columns.find(c => String(c.rawId) === fieldId || c.dbFieldName === g.dbFieldName);
          if (!col || !isGroupableFieldType(col.type as CellType)) return null;
          return {
            columnId: col.id,
            direction: g.order === 'desc' ? 'desc' as const : 'asc' as const,
          };
        })
        .filter((g): g is GroupRule => Boolean(g));
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
          const mapped: GroupRule[] = viewGroup.groupObjs
            .map((g: any) => {
              const fieldId = typeof g.fieldId === 'string' ? g.fieldId : String(g.fieldId);
              const col = columns.find(c => String(c.rawId) === fieldId || c.dbFieldName === g.dbFieldName);
              if (!col || !isGroupableFieldType(col.type as CellType)) return null;
              return {
                columnId: col.id,
                direction: g.order === 'desc' ? 'desc' as const : 'asc' as const,
              };
            })
            .filter((g): g is GroupRule => Boolean(g));
          setGroupConfigLocal(mapped);
        }
      }
    }
  }, [activeData?.columns]);

  const handleSheetNameChange = useCallback(async (name: string) => {
    if (name === sheetName) return;
    setBackendSheetName(name);
    const ids = getIds();
    if (!ids.assetId) return;
    try {
      await triggerUpdateSheetName({ data: { id: ids.assetId, name } });
      document.title = name;
      toast.success('Sheet name updated');
    } catch (err: unknown) {
      setBackendSheetName(sheetName);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Failed to update sheet name');
      toast.error(msg);
    }
  }, [getIds, sheetName, setBackendSheetName, triggerUpdateSheetName]);

  const handleToggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    let reorderedColumns: IColumn[] | null = null;
    setTableData(prev => {
      if (!prev) return prev;
      const newColumns = [...prev.columns];
      const [moved] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, moved);
      reorderedColumns = newColumns;
      return { ...prev, columns: newColumns };
    });

    // Persist the new column order to the backend
    const sock = getSocket();
    const ids = getIds();
    if (sock && ids.assetId && ids.tableId && ids.viewId && reorderedColumns) {
      const fields = (reorderedColumns as Array<IColumn & { rawId?: number }>).map((col, i) => ({
        field_id: Number((col as any).rawId ?? col.id),
        order: i + 1,
      })).filter(f => Number.isFinite(f.field_id) && f.field_id > 0);

      if (fields.length > 0) {
        sock.emit('update_field_order', {
          baseId: ids.assetId,
          viewId: ids.viewId,
          tableId: ids.tableId,
          fields,
        });
      }
    }
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

  const handleAddCardCreate = useCallback(() => {
    const cols = currentData?.columns ?? [];
    if (cols.length === 0) return;
    const stubCells: Record<string, ICell> = {};
    for (const col of cols) {
      stubCells[col.id] = { type: col.type, data: null, displayData: '', options: col.options } as ICell;
    }
    const stubRecord: IRecord = { id: '__new__', cells: stubCells };
    setCreateModeRecord(stubRecord);
    setExpandedRecordId('__new__');
  }, [currentData, setExpandedRecordId]);

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
    if (!currentData) return;
    const sourceRecord = currentData.records[rowIndex];
    if (!sourceRecord) return;

    const cols = currentData.columns ?? [];
    if (!cols.length) return;

    // Optimistic local duplicate so the user sees the new row immediately
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

    // Backend-backed duplicate so the record is persisted
    const fieldsInfo: Array<{ field_id: number; data: any }> = [];

    for (const col of cols) {
      const fieldId = Number((col as any).rawId || col.id);
      if (!fieldId || Number.isNaN(fieldId)) continue;

      const cell = sourceRecord.cells[col.id];
      if (!cell) continue;

      const backendData = formatCellDataForBackend(cell);
      fieldsInfo.push({
        field_id: fieldId,
        data: backendData,
      });
    }

    if (!fieldsInfo.length) return;

    emitRowInsert(sourceRecord.id, 'after', fieldsInfo);
  }, [currentData, emitRowInsert, setTableData]);

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
        analytics.tableCreated({ from_template: !!(extraFields && extraFields.length > 0) });
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

  const handleAddCommentRecord = useCallback((recordId: string) => {
    setExpandedRecordId(recordId);
    setFocusCommentOnOpen(true);
  }, [setExpandedRecordId]);

  const waitForUpdatedRow = useCallback((recordId: string, timeoutMs = 8000): Promise<void> => {
    const sock = getSocket();
    if (!sock) {
      return Promise.reject(new Error("Socket not connected"));
    }

    const target = String(recordId);

    return new Promise((resolve, reject) => {
      let settled = false;
      let handler: ((payload: any) => void) | null = null;
      let changedHandler: ((payload: any) => void) | null = null;

      const cleanup = () => {
        if (handler) sock.off('updated_row', handler);
        if (changedHandler) sock.off('records_changed', changedHandler);
      };

      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Save timed out. Please try again."));
      }, timeoutMs);

      const finishOk = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        cleanup();
        resolve();
      };

      handler = (payload: any) => {
        const events = Array.isArray(payload) ? payload : [payload];
        for (const evt of events) {
          const rowId = evt?.row_id != null ? String(evt.row_id) : evt?.id != null ? String(evt.id) : null;
          if (rowId && rowId === target) {
            finishOk();
            return;
          }
        }
      };

      // Backend emits updated_row to default view room only, but records_changed
      // goes to the table room. Use it as fallback for non-grid views.
      changedHandler = () => {
        finishOk();
      };

      sock.on('updated_row', handler);
      sock.on('records_changed', changedHandler);
    });
  }, []);

  const buildOptimisticDisplayData = useCallback((cell: ICell, value: any): string => {
    let optimisticDisplay = value != null ? String(value) : '';
    if (cell.type === CellType.DateTime && typeof value === 'string' && value) {
      const opts = (cell as any).options ?? {};
      optimisticDisplay = formatDateDisplay(
        value,
        opts.dateFormat || 'DDMMYYYY',
        opts.separator || '/',
        Boolean(opts.includeTime),
        Boolean(opts.isTwentyFourHourFormat),
      );
    } else if (cell.type === CellType.Time && value && typeof value === 'object') {
      const td = value as { time?: string; meridiem?: string };
      optimisticDisplay = td.meridiem ? `${td.time} ${td.meridiem}`.trim() : (td.time || '');
    } else if (cell.type === CellType.Ranking && Array.isArray(value)) {
      optimisticDisplay = value.map((item: any, i: number) => {
        if (typeof item === 'object' && item !== null) return `${item.rank || i + 1}. ${item.label || ''}`;
        return String(item);
      }).join(', ');
    }
    return optimisticDisplay;
  }, []);

  const handleExpandedRecordSave = useCallback(async (recordId: string, updatedCells: Record<string, any>) => {
    // Create mode: build fields_info and emit row_create
    if (recordId === '__new__') {
      const cols = currentData?.columns ?? [];
      const fieldsInfo = Object.entries(updatedCells)
        .filter(([, value]) => value != null && value !== '')
        .map(([columnId, value]) => {
          const col = cols.find(c => c.id === columnId);
          const rawId = (col as any)?.rawId ?? col?.id;
          return { field_id: Number(rawId), data: value };
        })
        .filter(f => Number.isFinite(f.field_id) && f.field_id > 0);
      const sock = getSocket();
      const ids = getIds();
      if (sock?.connected && ids.tableId && ids.assetId && ids.viewId) {
        sock.emit('row_create', {
          tableId: ids.tableId,
          baseId: ids.assetId,
          viewId: ids.viewId,
          fields_info: fieldsInfo,
        });
      }
      setCreateModeRecord(null);
      // Refetch to show the new record in non-grid views
      setTimeout(() => refetchRecords(), 500);
      return;
    }

    if (!currentData) return;
    const recordIndex = currentData.records.findIndex(r => r.id === recordId);
    if (recordIndex === -1) return;

    const cols = currentData.columns ?? [];
    const backendUpdates: Array<{ rowIndex: number; columnId: string; cell: ICell }> = [];

    // Set up confirmation listener before emitting so we don't miss the event.
    const confirmationPromise = waitForUpdatedRow(recordId, 8000);

    setTableData(prev => {
      if (!prev) return prev;
      const newRecords = prev.records.map(record => {
        if (record.id !== recordId) return record;
        const newCellsMap = { ...record.cells };

        for (const [columnId, value] of Object.entries(updatedCells)) {
          const existingCell = newCellsMap[columnId];
          if (!existingCell) continue;

          const col = cols.find(c => c.id === columnId);
          if (col?.type === CellType.Link || existingCell.type === CellType.Link) {
            // Link editor persists via updateLinkCell already; avoid double-write.
            newCellsMap[columnId] = {
              ...existingCell,
              data: value,
              displayData: Array.isArray(value) ? `${value.length} linked record(s)` : buildOptimisticDisplayData(existingCell, value),
            } as ICell;
            continue;
          }

          const displayData = buildOptimisticDisplayData(existingCell, value);
          const updatedCell = { ...existingCell, data: value, displayData } as ICell;
          newCellsMap[columnId] = updatedCell;
          backendUpdates.push({ rowIndex: recordIndex, columnId, cell: updatedCell });
        }

        return { ...record, cells: newCellsMap };
      });
      return { ...prev, records: newRecords };
    });

    if (backendUpdates.length === 0) {
      return;
    }

    emitRowUpdates(backendUpdates, []);
    localStorage.setItem('tinytable_last_modify', String(Date.now()));

    await confirmationPromise;
  }, [currentData, emitRowUpdates, waitForUpdatedRow, buildOptimisticDisplayData]);

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

        let optimisticDisplay = value != null ? String(value) : '';
        if (cell.type === CellType.DateTime && typeof value === 'string' && value) {
          const opts = (cell as any).options ?? {};
          optimisticDisplay = formatDateDisplay(value, opts.dateFormat || 'DDMMYYYY', opts.separator || '/', Boolean(opts.includeTime), Boolean(opts.isTwentyFourHourFormat));
        } else if (cell.type === CellType.Time && value && typeof value === 'object') {
          const td = value as { time?: string; meridiem?: string };
          optimisticDisplay = td.meridiem ? `${td.time} ${td.meridiem}`.trim() : (td.time || '');
        } else if (cell.type === CellType.Ranking && Array.isArray(value)) {
          optimisticDisplay = value.map((item: any, i: number) => {
            if (typeof item === 'object' && item !== null) return `${item.rank || i + 1}. ${item.label || ''}`;
            return String(item);
          }).join(', ');
        }
        const updatedCell = { ...cell, data: value, displayData: optimisticDisplay } as ICell;

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

  const handleCellsChange = useCallback((updates: Array<{ recordId?: string; pasteRow: number; columnId: string; value: any }>) => {
    const backendUpdates: Array<{ rowIndex: number; columnId: string; cell: ICell }> = [];
    const newRowFieldUpdates: Map<number, Array<{ columnId: string; value: any }>> = new Map();

    setTableData(prev => {
      if (!prev) return prev;

      const records = prev.records;
      if (!records.length) return prev;

      const cols = currentData?.columns ?? [];
      if (!cols.length) return prev;

      const updatesByRecord = new Map<string, Array<{ columnId: string; value: any }>>();
      for (const u of updates) {
        if (u.recordId) {
          if (!updatesByRecord.has(u.recordId)) {
            updatesByRecord.set(u.recordId, []);
          }
          updatesByRecord.get(u.recordId)!.push({ columnId: u.columnId, value: u.value });
        } else {
          const key = u.pasteRow;
          if (!newRowFieldUpdates.has(key)) {
            newRowFieldUpdates.set(key, []);
          }
          newRowFieldUpdates.get(key)!.push({ columnId: u.columnId, value: u.value });
        }
      }

      const newRecords = records.map((record, recordIndex) => {
        const recordUpdates = updatesByRecord.get(record.id);
        if (!recordUpdates || !recordUpdates.length) return record;

        let changed = false;
        const newCells: Record<string, ICell> = { ...record.cells };

        for (const { columnId, value } of recordUpdates) {
          const cell = newCells[columnId];
          if (!cell) continue;

          const column = cols.find(c => c.id === columnId);
          if (!column) continue;

          let optimisticDisplay = value != null ? String(value) : '';
          if (cell.type === CellType.DateTime && typeof value === 'string' && value) {
            const opts = (cell as any).options ?? {};
            optimisticDisplay = formatDateDisplay(
              value,
              opts.dateFormat || 'DDMMYYYY',
              opts.separator || '/',
              Boolean(opts.includeTime),
              Boolean(opts.isTwentyFourHourFormat),
            );
          } else if (cell.type === CellType.Time && value && typeof value === 'object') {
            const td = value as { time?: string; meridiem?: string };
            optimisticDisplay = td.meridiem ? `${td.time} ${td.meridiem}`.trim() : (td.time || '');
          }

          const updatedCell = { ...cell, data: value, displayData: optimisticDisplay } as ICell;
          newCells[columnId] = updatedCell;
          backendUpdates.push({ rowIndex: recordIndex, columnId, cell: updatedCell });
          changed = true;
        }

        if (!changed) return record;
        return { ...record, cells: newCells };
      });

      return { ...prev, records: newRecords };
    });

    const cols = currentData?.columns ?? [];
    const newRowColumnValues: Array<{ fields_info: Array<{ field_id: number; data: any }> }> = [];

    if (newRowFieldUpdates.size && cols.length) {
      newRowFieldUpdates.forEach((fields, _pasteRow) => {
        const fields_info: Array<{ field_id: number; data: any }> = [];
        fields.forEach(({ columnId, value }) => {
          const col = cols.find(c => c.id === columnId) as any;
          if (!col) return;
          const fieldId = Number(col.rawId || col.id);
          if (!fieldId || Number.isNaN(fieldId)) return;
          fields_info.push({
            field_id: fieldId,
            data: value,
          });
        });
        if (fields_info.length) {
          newRowColumnValues.push({ fields_info });
        }
      });
    }

    if (backendUpdates.length || newRowColumnValues.length) {
      emitRowUpdates(backendUpdates, newRowColumnValues);
      localStorage.setItem('tinytable_last_modify', String(Date.now()));
    }
  }, [currentData, emitRowUpdates, setTableData]);

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
    if (isBlockedFieldType(fieldData.fieldType)) {
      toast.error("Link, Lookup, and Rollup fields are disabled in this version.");
      return;
    }
    const backendType = mapCellTypeToBackendFieldType(fieldData.fieldType);

    if (fieldData.mode === 'create') {
      if (!ids.tableId || !ids.assetId) return;

      if (fieldData.options?.__aiColumnCreate) {
        console.log('[AI_COLUMN][App.tsx] __aiColumnCreate detected. fieldData:', JSON.stringify(fieldData, null, 2));
        try {
          const { __aiColumnCreate, isRequired, isUnique, ...aiColumnOptions } = fieldData.options;
          const payload = {
            baseId: ids.assetId,
            tableId: ids.tableId,
            viewId: ids.viewId,
            name: fieldData.fieldName,
            description: fieldData.description,
            type: 'AI_COLUMN' as const,
            aiPrompt: aiColumnOptions.aiPrompt || '',
            aiModel: aiColumnOptions.aiModel || 'mini',
            sourceFields: aiColumnOptions.sourceFields || [],
            autoUpdate: aiColumnOptions.autoUpdate ?? true,
          };
          console.log('[AI_COLUMN][App.tsx] Calling createAiColumnField with payload:', JSON.stringify(payload, null, 2));
          const result = await createAiColumnField(payload);
          console.log('[AI_COLUMN][App.tsx] createAiColumnField SUCCESS. Result:', result);
          setFieldModalOpen(false);
          setFieldModal(null);
          setFieldModalAnchorPosition(null);
          setTimeout(() => refetchRecords(), 500);
        } catch (err: any) {
          console.error('[AI_COLUMN][App.tsx] createAiColumnField FAILED:', err);
          console.error('[AI_COLUMN][App.tsx] Error response data:', err?.response?.data);
          console.error('[AI_COLUMN][App.tsx] Error status:', err?.response?.status);
          const msg = err?.response?.data?.message || err?.message || 'Failed to create AI column field';
          alert(msg);
        }
        return;
      }

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
        ...(fieldData.expression ? { expression: fieldData.expression } : {}),
      };
      try {
        setIsCreateFieldLoading(true);
        await createField(createPayload);
        setFieldModalOpen(false);
        setFieldModal(null);
        setFieldModalAnchorPosition(null);
      } catch (err) {
        console.error('Failed to create field:', err);
      } finally {
        setIsCreateFieldLoading(false);
      }
      return;
    }

    if (fieldData.mode === 'edit' && fieldData.fieldId) {
      if (ids.tableId && ids.assetId) {
        const col = currentData?.columns.find(c => c.id === fieldData.fieldId);
        const numericId = fieldData.fieldRawId ?? (fieldData.fieldId != null ? Number(fieldData.fieldId) : NaN);
        if (numericId != null && !Number.isNaN(numericId)) {
          try {
            // Only send formula expression when it actually changed; then show "Calculating" until backend sends updated values.
            const isFormulaField = backendType === 'FORMULA';
            const currentExpression = (col as ExtendedColumn)?.computedFieldMeta?.expression;
            const newExpression = fieldData.expression;
            const formulaChanged =
              isFormulaField &&
              newExpression != null &&
              JSON.stringify(currentExpression) !== JSON.stringify(newExpression);

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
              ...(formulaChanged
                ? { computedFieldMeta: { expression: newExpression, hasError: false } }
                : {}),
            });
            setTableData(prev => {
              if (!prev) return prev;
              const colId = fieldData.fieldId;
              if (!colId) return prev;
              const isChoiceType =
                fieldData.fieldType === CellType.SCQ ||
                fieldData.fieldType === CellType.MCQ ||
                fieldData.fieldType === CellType.DropDown ||
                fieldData.fieldType === CellType.YesNo ||
                fieldData.fieldType === CellType.Ranking;
              const newOptionsShape =
                fieldData.options && typeof fieldData.options === 'object' && 'options' in fieldData.options
                  ? { options: (fieldData.options as { options: unknown }).options ?? [] }
                  : null;

              const newColumns = prev.columns.map(c => {
                if (c.id !== colId) return c;
                const next = { ...c, name: fieldData.fieldName, type: fieldData.fieldType, options: fieldData.options };
                if (fieldData.description !== undefined) (next as ExtendedColumn).description = fieldData.description;
                if (isChoiceType && fieldData.options != null) {
                  (next as ExtendedColumn).rawOptions = fieldData.options;
                }
                return next;
              });

              const newRecords =
                isChoiceType && newOptionsShape
                  ? prev.records.map(record => {
                      const cell = record.cells[colId];
                      if (!cell) return record;
                      return {
                        ...record,
                        cells: {
                          ...record.cells,
                          [colId]: { ...cell, options: newOptionsShape },
                        },
                      };
                    })
                  : prev.records;

              return { ...prev, columns: newColumns, records: newRecords };
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
  }, [getIds, currentData, refetchRecords, createEnrichmentField, createAiColumnField]);

  const executeDeleteColumn = useCallback(async (columnId: string) => {
    const column = currentData?.columns.find(c => c.id === columnId) as ExtendedColumn | undefined;
    const numericFieldId = column?.rawId != null
      ? (typeof column.rawId === 'number' ? column.rawId : Number(column.rawId))
      : Number(columnId);
    if (Number.isNaN(numericFieldId)) {
      console.error('Failed to delete field: no numeric field id for column', columnId);
      return;
    }
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
          await updateFieldsStatus({
            baseId: ids.assetId,
            tableId: ids.tableId,
            viewId: ids.viewId,
            fields: [{ id: numericFieldId, status: 'inactive' }],
          });
          setConfirmDialog(null);
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
      expression: ext.computedFieldMeta?.expression,
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
  }, [setSortConfig]);

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
    if (!isGroupableFieldType(column.type as CellType)) return;
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

    // Search does NOT filter rows — it only highlights matching cells.
    // The searchMatches memo (below) computes highlights; the grid renders them.

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
    if (!expandedRecordId) return null;
    if (expandedRecordId === '__new__' && createModeRecord) return createModeRecord;
    if (!currentData) return null;
    return currentData.records.find(r => r.id === expandedRecordId) ?? null;
  }, [expandedRecordId, currentData, createModeRecord]);

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

  const cacheKey = effectiveCurrentTableId ?? '';
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

  // Initialize kanban state when entering kanban view or when columns change
  const kanbanColumns = displayProcessedData?.columns ?? [];
  const stackableColumns = useMemo(
    () => kanbanColumns.filter(c => c.type === CellType.SCQ || c.type === CellType.DropDown),
    [kanbanColumns]
  );

  useEffect(() => {
    if (!isKanbanView || stackableColumns.length === 0) return;
    const savedId = currentViewObj?.options?.stackFieldId != null ? String(currentViewObj.options.stackFieldId) : null;
    const validSaved = savedId && stackableColumns.find(c => c.id === savedId) ? savedId : null;
    setKanbanStackFieldId(prev => prev && stackableColumns.find(c => c.id === prev) ? prev : (validSaved ?? stackableColumns[0]?.id ?? null));
  }, [isKanbanView, stackableColumns, currentViewObj?.options?.stackFieldId]);

  useEffect(() => {
    if (!isKanbanView || kanbanColumns.length === 0) return;
    setKanbanVisibleCardFields(prev => prev.size > 0 ? prev : new Set(kanbanColumns.map(c => c.id)));
  }, [isKanbanView, kanbanColumns]);

  const calendarDateColumns = useMemo(
    () => (isCalendarView && displayProcessedData ? getDateColumns(displayProcessedData.columns) : []),
    [isCalendarView, displayProcessedData?.columns]
  );

  useEffect(() => {
    if (!isCalendarView || calendarDateColumns.length === 0) return;
    setCalendarDateFieldId(prev => {
      if (prev && calendarDateColumns.find(c => c.id === prev)) return prev;
      return calendarDateColumns[0]?.id ?? null;
    });
  }, [isCalendarView, calendarDateColumns]);

  const handleCalendarDateFieldChange = useCallback((id: string) => {
    setCalendarDateFieldId(id);
  }, []);

  const handleStackFieldChange = useCallback((fieldId: string) => {
    setKanbanStackFieldId(fieldId);
  }, []);

  const handleToggleCardField = useCallback((fieldId: string) => {
    setKanbanVisibleCardFields(prev => {
      const next = new Set(prev);
      next.has(fieldId) ? next.delete(fieldId) : next.add(fieldId);
      return next;
    });
  }, []);

  const handleGoToGetStarted = useCallback(() => {
    const q = searchParams.get('q') || '';
    const decoded = decodeParams<Record<string, string>>(q);
    const nextEncoded = encodeParams({
      w: decoded.w || '',
      pj: decoded.pj || '',
      pr: decoded.pr || '',
    });
    setSearchParams({ q: nextEncoded }, { replace: true });
  }, [searchParams, setSearchParams]);

  if (hasSheetLoadError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            {hasSheetNotFound ? 'No sheet exists' : 'Unable to load sheet'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The sheet you&apos;re trying to access does not exist. Please create a new one.
          </p>
          {/* <div className="mt-4 flex justify-center">
            <Button type="button" variant="outline" onClick={handleGoToGetStarted}>
              Go to Get Started
            </Button>
          </div> */}
        </div>
        <Toaster />
      </div>
    );
  }

  if (!displayProcessedData) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <MainLayout
      tables={effectiveTableList.map((t: any) => ({ id: t.id, name: t.name }))}
      activeTableId={effectiveCurrentTableId}
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
      tableId={effectiveCurrentTableId}
      sheetName={effectiveSheetName}
      onSheetNameChange={handleSheetNameChange}
      onAddRow={isKanbanView ? handleAddCardCreate : handleAddRow}
      currentView={currentViewType}
      isDefaultView={currentViewType === 'default_grid'}
      showSyncButton={isFormView || isGalleryView || isKanbanView || isCalendarView || isGanttView}
      onFetchRecords={refetchRecords}
      isSyncing={effectiveIsSyncing}
      hasNewRecords={hasNewRecords ?? false}
      hiddenColumnIds={hiddenColumnIds}
      onToggleColumn={toggleColumnVisibility}
      onHideFieldsPersist={handleHideFieldsPersist}
      onSetSelectionColor={!isKanbanView && !isCalendarView && !isGanttView && !isGalleryView && !isFormView ? (color) => gridViewRef.current?.applyColorToSelection(color) : undefined}
      stackFieldId={kanbanStackFieldId ?? undefined}
      onStackFieldChange={handleStackFieldChange}
      visibleCardFields={kanbanVisibleCardFields}
      onToggleCardField={handleToggleCardField}
      calendarDateColumns={calendarDateColumns}
      calendarDateFieldId={calendarDateFieldId}
      onCalendarDateFieldChange={handleCalendarDateFieldChange}
    >
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden flex">
          <div className="flex-1 min-w-0 overflow-hidden">
          {isKanbanView ? (
            <KanbanView
              data={displayProcessedData}
              onAddRow={handleAddCardCreate}
              onExpandRecord={handleExpandRecord}
              stackFieldId={kanbanStackFieldId}
              visibleCardFields={kanbanVisibleCardFields}
            />
          ) : isCalendarView ? (
            <CalendarView
              data={displayProcessedData}
              onExpandRecord={handleExpandRecord}
              dateFieldId={calendarDateFieldId}
              currentDate={calendarCurrentDate}
              onCurrentDateChange={setCalendarCurrentDate}
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
              onAddRow={handleAddRow}
              onExpandRecord={handleExpandRecord}
              hiddenColumnIds={hiddenColumnIds}
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
              ref={gridViewRef}
              data={displayProcessedData}
              hiddenColumnIds={hiddenColumnIds}
              onColumnReorder={handleColumnReorder}
              onCellChange={handleCellChange}
              onCellsChange={handleCellsChange}
              onAddRow={handleAddRow}
              onDeleteRows={handleDeleteRows}
              onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
              onAddCommentRecord={handleAddCommentRecord}
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
              fieldModalLoading={fieldModalLoading}
              baseId={getIds().assetId}
              tableId={effectiveCurrentTableId}
              commentCountsVersion={commentCountsVersion}
              tables={effectiveTableList.map((t: any) => ({ id: t.id, name: t.name }))}
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
              {commentSidebarRecordId && effectiveCurrentTableId ? (
                <CommentPanel
                  tableId={effectiveCurrentTableId}
                  recordId={commentSidebarRecordId}
                  onCommentsChange={() => setCommentCountsVersion((v) => v + 1)}
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
              tableId={effectiveCurrentTableId}
              viewId={currentViewId || ''}
              tableName={effectiveTableList.find((t: any) => t.id === effectiveCurrentTableId)?.name}
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
        tableId={effectiveCurrentTableId || undefined}
        baseId={getIds().assetId || undefined}
        isCreateMode={expandedRecordId === '__new__'}
        onClose={() => {
          setExpandedRecordId(null);
          setCreateModeRecord(null);
          setFocusCommentOnOpen(false);
        }}
        onSave={handleExpandedRecordSave}
        onDelete={expandedRecordId === '__new__' ? undefined : handleDeleteExpandedRecord}
        onDuplicate={expandedRecordId === '__new__' ? undefined : handleDuplicateExpandedRecord}
        onPrev={expandedRecordId === '__new__' ? undefined : handleExpandPrev}
        onNext={expandedRecordId === '__new__' ? undefined : handleExpandNext}
        hasPrev={expandedRecordId !== '__new__' && expandedRecordIndex > 0}
        hasNext={expandedRecordId !== '__new__' && (displayCurrentData ? expandedRecordIndex < displayCurrentData.records.length - 1 : false)}
        currentIndex={expandedRecordId === '__new__' ? undefined : expandedRecordIndex}
        totalRecords={expandedRecordId === '__new__' ? undefined : displayCurrentData?.records.length}
        onExpandLinkedRecord={(foreignTableId, recordId, title) => {
          useGridViewStore.getState().openLinkedRecord({ foreignTableId, recordId, title });
        }}
        initialFocusComment={focusCommentOnOpen}
        onCommentsChange={() => setCommentCountsVersion((v) => v + 1)}
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
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      <GetStartedModal
        open={getStartedOpen}
        onOpenChange={setGetStartedOpen}
        onCreateBlank={handleCreateBlank}
        onSelectOption={handleSelectOption}
        creating={createBlankLoading}
      />
      <Toaster />
    </MainLayout>
  );
}

export default App;
