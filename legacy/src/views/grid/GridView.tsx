// Inspired by Teable's main grid component
import React, {
        useRef,
        useEffect,
        useState,
        useCallback,
        useMemo,
} from "react";
import {
        ITableData,
        IColumn,
        IRecord,
        ICell,
        IGridTheme,
        IGridConfig,
        RegionType,
        IMouseState,
        IRowHeader,
        RowHeightLevel,
        ILinearRow,
        LinearRowType,
        SelectableType,
        ICellItem,
        CellType,
} from "@/types";
import { getCellRenderer } from "@/cell-level/renderers";
import { getEditor } from "@/cell-level/editors";
import { validateAndParseAddress } from "@/cell-level/renderers/address/utils/validateAndParseAddress";
import { getAddress } from "@/cell-level/renderers/address/utils/getAddress";
import {
        useVirtualScrolling,
        IVirtualScrollingConfig,
} from "@/hooks/useVirtualScrolling";
import { useColumnResize } from "@/hooks/useColumnResize";
import { useColumnFreeze } from "@/hooks/useColumnFreeze";
import { useColumnDrag } from "@/hooks/useColumnDrag";
import { useRowHeight } from "@/hooks/useRowHeight";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useAutoFreezeColumnAdjustment } from "@/hooks/useAutoFreezeColumnAdjustment";
import { FreezeColumnWarningModal } from "@/components/grid/FreezeColumnWarningModal";
import { useSelection } from "@/hooks/useSelection";
import { useClipboard } from "@/hooks/useClipboard";
import { useContextMenu } from "@/hooks/useContextMenu";
import { detectRegion } from "@/utils/regionDetection";
import { RecordMenu } from "@/components/context-menu/RecordMenu";
import { HeaderMenu } from "@/components/context-menu/HeaderMenu";
import { checkIfRowOrCellSelected } from "@/utils/selectionUtils";
import { drawRect, drawCheckbox } from "@/utils/baseRenderer";
import {
        APPEND_COLUMN_WIDTH,
        APPEND_ROW_HEIGHT,
        FOOTER_HEIGHT,
        SCROLLBAR_HEIGHT,
        SCROLLBAR_WIDTH,
        SCROLL_BUFFER,
        COLUMN_FREEZE_HANDLER_WIDTH,
        COLUMN_FREEZE_HANDLER_HEIGHT,
} from "@/config/grid";
import { drawFooterRegion } from "@/utils/footerRenderer";
import { InfiniteScroller } from "@/components/grid/InfiniteScroller";
import {
        calculateColumnStatistics,
        getSelectedRowIndicesByColumn,
} from "@/utils/columnStatistics";
import { useStatisticsStore } from "@/stores/statisticsStore";
import { StatisticsMenu } from "@/components/statistics-menu/StatisticsMenu";
import type { IScrollState, IScrollerRef } from "@/types";
import type { CombinedSelection } from "@/managers/selection-manager";
import { SelectionRegionType } from "@/types/selection";
import type { IRange } from "@/types/selection";
// Phase 1: Grouping imports
import {
        groupPointsToLinearRows,
        buildGroupCollection,
} from "@/utils/grouping";
import { extractGroupByFieldValues } from "@/utils/grouping/extractGroupByValues";
import { drawGroupRow } from "@/views/grid/renderers/drawGroupRow";
import { drawGroupRowHeader } from "@/views/grid/renderers/drawGroupRowHeader";
import { drawAppendRow } from "@/views/grid/renderers/drawAppendRow";
import { drawAppendColumn } from "@/views/grid/renderers/drawAppendColumn";
import { useGridCollapsedGroup } from "@/hooks/useGridCollapsedGroup";
import type { IGroupLinearRow, IGroupConfig } from "@/types/grouping";
import {
        GROUP_HEADER_HEIGHT,
        GROUP_HEADER_PADDING,
        GROUP_TEXT_COLOR,
        GROUP_COLUMN_BG,
        drawChevronIcon,
} from "@/theme/grouping";
import type { IRatingCell, IEnrichmentCell } from "@/types";
import useProcessEnrichment from "@/cell-level/renderers/enrichment/hooks/useProcessEnrichment";
import { showAlert } from "@/lib/toast";
import { isPrintableKey, shouldAllowKeyboardEdit } from "@/utils/keyboard";
// Phase 2C: Add Column Popover
// AddColumnPopover removed - now using FieldModal in MainPage
// Column Header Icons
import {
        getColumnHeaderIconUrl,
        getColumnHeaderIcon,
        setColumnHeaderIconLoadCallback,
        preloadColumnHeaderIcons,
        preloadAllColumnHeaderIcons,
        getChevronDownIcon,
        preloadChevronDownIcon,
        getWarningIcon,
} from "@/utils/columnHeaderIcons";
import { setErrorIconLoadCallback } from "@/cell-level/renderers/error/utils/loadErrorIcon";
import { setImageLoadCallback } from "@/cell-level/renderers/fileUpload/utils/drawFileIcon";
import {
        getSortedFieldIds,
        getFilteredFieldIds,
} from "@/utils/sortFilterFieldUtils";

const getDevicePixelRatio = () => {
        if (typeof window === "undefined") {
                return 1;
        }
        return window.devicePixelRatio || 1;
};

interface IGridProps {
        data: ITableData;
        groupPoints?: Array<{
                type: 0 | 1;
                id?: string;
                depth?: number;
                value?: unknown;
                isCollapsed?: boolean;
                count?: number;
        }>;
        group?: {
                groupObjs?: Array<{
                        fieldId: number;
                        order: "asc" | "desc";
                        dbFieldName?: string;
                        type?: string;
                }>;
        };
        sort?: any;
        filter?: any;
        fields?: Array<{
                id: number | string;
                name: string;
                dbFieldName?: string;
                type?: string;
        }>;
        config: IGridConfig;
        onCellChange?: (
                rowIndex: number,
                columnIndex: number,
                newValue: ICell,
        ) => void;
        onCellsChange?: (
                updates: Array<{
                        rowIndex: number;
                        columnIndex: number;
                        cell: ICell;
                }>,
        ) => void;
        onCellClick?: (rowIndex: number, columnIndex: number) => void;
        onCellDoubleClick?: (rowIndex: number, columnIndex: number) => void;
        onColumnResize?: (columnIndex: number, newWidth: number) => void;
        onColumnFreeze?: (freezeColumnCount: number) => void;
        isColumnFreezable?: boolean; // Can columns be frozen? (default: true)
        // Phase 2A: Delete Records functionality
        onDeleteRecords?: (recordIds: string[]) => void;
        // Phase 2B: Insert and Duplicate Records functionality
        onInsertRecord?: (
                anchorId: string,
                position: "before" | "after",
                num: number,
        ) => void;
        onDuplicateRecord?: (recordId: string) => void;
        // Phase 2B: Column operations functionality
        onEditColumn?: (
                columnId: string,
                anchorPosition?: { x: number; y: number },
        ) => void;
        onDuplicateColumn?: (columnId: string) => void;
        onInsertColumn?: (
                columnId: string,
                position: "left" | "right",
                anchorPosition?: { x: number; y: number },
        ) => void;
        onDeleteColumns?: (columnIds: number[]) => void;
        onColumnReorder?: (newOrder: IColumn[]) => void;
        // Phase 2C: onColumnAppend callback - opens FieldModal for column creation
        // Passes position coordinates for proper popover positioning
        onColumnAppend?: (position: { x: number; y: number }) => void;
        onRowAppend?: (
                targetIndex?: number,
                groupByFieldValues?: { [fieldId: string]: unknown },
        ) => void;
        // Phase 2: Expanded Record functionality
        onRowExpand?: (recordId: string) => void;
        defaultRowHeightLevel?: RowHeightLevel;
        // Callback to register clearCellLoading function (used for enrichment completion)
        // Parent calls this with a function that GridView will use to clear loading state
        onClearCellLoading?: (
                clearFn: (rowId: string, fieldId: string) => void,
        ) => void;
        // Callback to register setCellLoading function (used for formula field loading)
        // Parent calls this with a function that GridView will use to set loading state for all records
        onSetCellLoading?: (
                setFn: (fieldId: string, isLoading: boolean) => void,
        ) => void;
        // Zoom level - defaults to 100 (100%)
        zoomLevel?: number;
}

const Grid: React.FC<IGridProps> = ({
        data,
        groupPoints: groupPointsProp, // Keep for backward compatibility, but will use hook instead
        group,
        sort,
        filter,
        fields,
        config,
        onCellChange,
        onCellsChange,
        onCellClick,
        onCellDoubleClick,
        onColumnResize,
        onColumnFreeze,
        isColumnFreezable = true, // Default to true (like Teable)
        onDeleteRecords,
        onInsertRecord,
        onDuplicateRecord,
        onEditColumn,
        onDuplicateColumn,
        onInsertColumn,
        onDeleteColumns,
        onColumnReorder,
        onColumnAppend,
        onRowAppend,
        defaultRowHeightLevel,
        onClearCellLoading,
        onSetCellLoading,
        zoomLevel = 100, // Default to 100% zoom
}) => {
        // Use groupPoints from prop (fetched via useGroupPoints hook in useSheetLifecycle)
        const groupPoints = groupPointsProp || null;

        // Extract sorted and filtered field IDs for column highlighting
        const { sortedFieldIds, filteredFieldIds } = useMemo(() => {
                return {
                        sortedFieldIds: getSortedFieldIds(sort),
                        filteredFieldIds: getFilteredFieldIds(filter),
                };
        }, [sort, filter]);

        const canvasRef = useRef<HTMLCanvasElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const [containerSize, setContainerSize] = useState({
                width: 800,
                height: 600,
        });
        const [activeCell, setActiveCell] = useState<{
                row: number;
                col: number;
        } | null>(null);
        const [editingCell, setEditingCell] = useState<{
                row: number;
                col: number;
        } | null>(null);
        const [devicePixelRatio, setDevicePixelRatio] =
                useState<number>(getDevicePixelRatio);
        const [forceUpdate, setForceUpdate] = useState(0);

        // OPTION B: Store fixed editor position (viewport coordinates) when editor opens
        // Editor stays at this fixed position even when canvas scrolls
        const [fixedEditorPosition, setFixedEditorPosition] = useState<{
                x: number;
                y: number;
                width: number;
                height: number;
                cellKey: string; // Store which cell this position belongs to
        } | null>(null);
        const [cellLoading, setCellLoading] = useState<
                Record<string, Record<string, boolean>>
        >({});
        // Phase 2C: AddColumnPopover state removed - now using FieldModal in MainPage

        // Expose clearCellLoading function to parent via callback prop
        useEffect(() => {
                if (onClearCellLoading) {
                        // Create a function that clears loading for a specific cell
                        const clearLoading = (rowId: string, fieldId: string) => {
                                setCellLoading((prev) => {
                                        const updated = { ...prev };
                                        if (updated[rowId]) {
                                                delete updated[rowId][fieldId];
                                                // Clean up empty row objects
                                                if (Object.keys(updated[rowId]).length === 0) {
                                                        delete updated[rowId];
                                                }
                                        }
                                        return updated;
                                });
                        };
                        // Register this function with parent
                        onClearCellLoading(clearLoading);
                }
        }, [onClearCellLoading]);

        // Expose setCellLoading function to parent via callback prop (for formula fields)
        useEffect(() => {
                if (onSetCellLoading) {
                        // Create a function that sets loading for all records for a given field
                        const setLoading = (fieldId: string, isLoading: boolean) => {
                                setCellLoading((prev) => {
                                        const updated = { ...prev };
                                        // Iterate through all records and set loading state
                                        data.records.forEach((record) => {
                                                const rowId = record.id;
                                                if (!updated[rowId]) {
                                                        updated[rowId] = {};
                                                }
                                                if (isLoading) {
                                                        updated[rowId][fieldId] = true;
                                                } else {
                                                        delete updated[rowId][fieldId];
                                                        // Clean up empty row objects
                                                        if (Object.keys(updated[rowId]).length === 0) {
                                                                delete updated[rowId];
                                                        }
                                                }
                                        });
                                        return updated;
                                });
                        };
                        // Register this function with parent
                        onSetCellLoading(setLoading);
                }
        }, [onSetCellLoading, data.records]);

        // Enrichment processing hook
        const { processEnrichment } = useProcessEnrichment();

        // Add mouse state for column resizing
        const [mouseState, setMouseState] = useState<IMouseState>({
                x: 0,
                y: 0,
                columnIndex: -1,
                rowIndex: -1,
                type: RegionType.None,
                isOutOfBounds: false,
        });

        // Footer: which number-column statistic cell is hovered (for hover bg + pointer cursor)
        const [hoveredFooterColumnIndex, setHoveredFooterColumnIndex] = useState<
                number | null
        >(null);

        // Monitor devicePixelRatio so the canvas stays sharp on high-DPI screens
        useEffect(() => {
                if (typeof window === "undefined") return;

                const handlePixelRatioChange = () => {
                        const ratio = window.devicePixelRatio || 1;
                        setDevicePixelRatio((prev) =>
                                Math.abs(prev - ratio) > 0.01 ? ratio : prev,
                        );
                };

                handlePixelRatioChange();

                window.addEventListener("resize", handlePixelRatioChange);
                window.addEventListener("orientationchange", handlePixelRatioChange);

                const resolutionSteps = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
                const mediaQueries: MediaQueryList[] = [];

                if (typeof window.matchMedia === "function") {
                        resolutionSteps.forEach((ratio) => {
                                mediaQueries.push(
                                        window.matchMedia(`(min-resolution: ${ratio}dppx)`),
                                );
                        });
                }

                mediaQueries.forEach((mediaQuery) => {
                        if (typeof mediaQuery.addEventListener === "function") {
                                mediaQuery.addEventListener("change", handlePixelRatioChange);
                        } else if (typeof mediaQuery.addListener === "function") {
                                mediaQuery.addListener(handlePixelRatioChange);
                        }
                });

                return () => {
                        window.removeEventListener("resize", handlePixelRatioChange);
                        window.removeEventListener(
                                "orientationchange",
                                handlePixelRatioChange,
                        );
                        mediaQueries.forEach((mediaQuery) => {
                                if (typeof mediaQuery.removeEventListener === "function") {
                                        mediaQuery.removeEventListener(
                                                "change",
                                                handlePixelRatioChange,
                                        );
                                } else if (typeof mediaQuery.removeListener === "function") {
                                        mediaQuery.removeListener(handlePixelRatioChange);
                                }
                        });
                };
        }, []);

        // Column Header Icons: Set callback once so grid re-renders when MCQ/SCQ/etc. icons load
        useEffect(() => {
                setColumnHeaderIconLoadCallback(() => {
                        setForceUpdate((prev) => prev + 1);
                });
                return () => {
                        setColumnHeaderIconLoadCallback(null);
                };
        }, []);

        // Column Header Icons: Preload all icons (MCQ, SCQ, Rating, etc.) when grid mounts or columns change
        useEffect(() => {
                preloadAllColumnHeaderIcons().catch(() => {
                        // Ignore errors, continue even if some icons fail to load
                });
                preloadChevronDownIcon().catch(() => {});
                if (data.columns.length > 0) {
                        const cellTypes = data.columns.map((col) => col.type);
                        preloadColumnHeaderIcons(cellTypes);
                }
        }, [data.columns]);

        // Error Icon: Set callback to trigger re-render when error icon loads
        useEffect(() => {
                // Set callback to trigger re-render when error icon finishes loading
                setErrorIconLoadCallback(() => {
                        setForceUpdate((prev) => prev + 1);
                });

                // Cleanup: remove callback on unmount
                return () => {
                        setErrorIconLoadCallback(null);
                };
        }, []);

        // File Upload icons: Set callback to trigger re-render when file-type icons (PDF, CSV, etc.) load
        useEffect(() => {
                setImageLoadCallback(() => {
                        setForceUpdate((prev) => prev + 1);
                });
                return () => {
                        setImageLoadCallback(null);
                };
        }, []);

        // Phase 1: Track last render props to prevent unnecessary re-renders (like Teable)
        // Reference: teable/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts (computeShouldRerender)
        const lastRenderPropsRef = useRef<{
                theme: IGridTheme;
                columns: IColumn[];
                records: IRecord[];
                visibleIndices: { rows: number[]; columns: number[] };
                scrollState: IScrollState;
                activeCell: { row: number; col: number } | null;
                selection: CombinedSelection;
                groupPoints?: any;
                groupPointsLength: number;
                groupTransformationResult: any;
                groupCollection: any;
                linearRows: ILinearRow[] | undefined;
                containerSize: { width: number; height: number };
                columnResizeWidth: number;
                mouseState?: IMouseState;
                cellLoading: Record<string, Record<string, boolean>>;
                zoomLevel: number;
        } | null>(null);

        // Phase 1: Track last mouse state to prevent unnecessary updates (like Teable)
        // Reference: teable/packages/sdk/src/components/grid/InteractionLayer.tsx (line 639: isEqual check)
        const lastMouseStateRef = useRef<IMouseState | null>(null);

        // ========================================
        // PHASE 2 ADDITION: Scroll state
        // ========================================
        const [scrollState, setScrollState] = useState<IScrollState>({
                scrollTop: 0,
                scrollLeft: 0,
                isScrolling: false,
        });

        // Ref for InfiniteScroller
        const scrollerRef = useRef<IScrollerRef>(null);

        // Ref to track if we just finished a resize (prevent column re-selection after resize)
        const justFinishedResizeRef = useRef(false);

        // Handle visible region changes from InfiniteScroller
        const handleVisibleRegionChanged = useCallback(
                (rect: {
                        x: number; // startColumnIndex
                        y: number; // realStartRowIndex
                        width: number; // column count (stopColumnIndex - startColumnIndex)
                        height: number; // row count (realStopRowIndex - realStartRowIndex)
                }) => {
                        // Optional: Use for data lazy loading, performance monitoring, etc.
                        // This receives the visible region bounds from InfiniteScroller
                        // console.log("Visible region changed:", rect);
                        // You can use this information to:
                        // - Load data for visible cells only
                        // - Monitor rendering performance
                        // - Optimize rendering based on visible area
                },
                [],
        );

        const { columns, records, rowHeaders } = data;
        const { rowHeight, headerHeight, theme, rowHeaderWidth, showRowNumbers } =
                config;
        const canAppendRow = Boolean(onRowAppend);
        const appendRowHeight = Math.max(rowHeight, APPEND_ROW_HEIGHT);
        const canAppendColumn = Boolean(onColumnAppend);
        const appendColumnWidth = canAppendColumn ? APPEND_COLUMN_WIDTH : 0;

        // Add column resize hook
        const {
                columnResizeState,
                hoveredColumnResizeIndex,
                onColumnResizeStart,
                onColumnResizeChange,
                onColumnResizeEnd,
        } = useColumnResize(columns, onColumnResize);

        // Add row height hook - Using preset heights (Teable style)
        const { getRowHeight, getRowOffset } = useRowHeight(
                rowHeaders,
                defaultRowHeightLevel ?? RowHeightLevel.Medium,
        );

        // ========================================
        // TEABLE-STYLE VISIBLE RECORDS (Linear Rows)
        // ========================================
        // Use hook pattern for collapsed groups (like Teable)
        // Generate cache key using tableId and viewId
        const cacheKey = useMemo(() => {
                if (config.tableId && config.viewId) {
                        return `${config.tableId}_${config.viewId}`;
                }
                return "default_view";
        }, [config.tableId, config.viewId]);

        // Get collapsed groups and callback from hook (like Teable)
        const { collapsedGroupIds, onCollapsedGroupChanged } =
                useGridCollapsedGroup(cacheKey);

        // Ensure collapsedGroupIds is always a Set (hook returns null if empty)
        const collapsedGroupIdsSet = useMemo(() => {
                return collapsedGroupIds || new Set<string>();
        }, [collapsedGroupIds]);

        // Create key for dependency tracking (like before)
        const collapsedGroupIdsKey = useMemo(() => {
                if (collapsedGroupIds instanceof Set) {
                        return Array.from(collapsedGroupIds).sort().join(",");
                }
                return "";
        }, [collapsedGroupIds]);

        // Determine if grouping is active (dynamic based on groupPoints or group config)
        const hasGrouping = useMemo(() => {
                // Check if we have groupPoints from backend
                if (groupPoints && groupPoints.length > 0) {
                        // console.log("✅ [GROUPING] Detected grouping via groupPoints:", {
                        //      groupPointsCount: groupPoints.length,
                        // });
                        return true;
                }
                // Check if we have group config from view
                if (group?.groupObjs && group.groupObjs.length > 0) {
                        // console.log("✅ [GROUPING] Detected grouping via group config:", {
                        //      groupObjsCount: group.groupObjs.length,
                        // });
                        return true;
                }
                // console.log("❌ [GROUPING] No grouping detected:", {
                //      hasGroupPoints: !!groupPoints,
                //      groupPointsLength: groupPoints?.length || 0,
                //      hasGroup: !!group,
                //      groupObjsCount: group?.groupObjs?.length || 0,
                // });
                return false;
        }, [groupPoints, group]);

        // Create a content-based key that detects ANY changes in groupObjs
        // This ensures we detect changes even if the group prop reference is the same
        const groupConfigKey = useMemo(() => {
                if (!group || typeof group !== "object") return "";

                let parsedGroup = group;
                if (typeof group === "string") {
                        try {
                                parsedGroup = JSON.parse(group);
                        } catch (e) {
                                return "";
                        }
                }

                if (parsedGroup?.groupObjs && Array.isArray(parsedGroup.groupObjs)) {
                        // Use JSON.stringify to create a content-based key
                        // This detects changes in fieldId, order, dbFieldName, type, or order of items
                        return JSON.stringify(
                                parsedGroup.groupObjs.map((obj: any) => {
                                        const fieldId =
                                                typeof obj.fieldId === "string"
                                                        ? Number(obj.fieldId)
                                                        : obj.fieldId;
                                        return {
                                                fieldId,
                                                order: obj.order || "asc",
                                                dbFieldName: obj.dbFieldName,
                                                type: obj.type,
                                        };
                                }),
                        );
                }
                return "";
        }, [group]);

        // Get the active group config (from props, view, or playground store)
        // Backend may send group as JSON string, so we need to parse it
        const activeGroupConfig = useMemo(() => {
                // console.log("🔄 [activeGroupConfig] Recalculating:", {
                //      hasGroup: !!group,
                //      groupType: typeof group,
                //      groupConfigKey,
                //      groupPointsLength: groupPoints?.length,
                // });

                // Priority 1: Use group prop from view (real backend data)
                if (group) {
                        let parsedGroup = group;

                        // Handle case where backend sends group as JSON string
                        if (typeof group === "string") {
                                try {
                                        parsedGroup = JSON.parse(group);
                                } catch {
                                        parsedGroup = null;
                                }
                        }

                        // Ensure it has the correct structure
                        if (
                                parsedGroup &&
                                parsedGroup.groupObjs &&
                                Array.isArray(parsedGroup.groupObjs) &&
                                parsedGroup.groupObjs.length > 0
                        ) {
                                // Normalize groupObjs to ensure fieldId is number
                                // IMPORTANT: Preserve the order of groupObjs as it determines grouping depth
                                const normalizedGroupObjs = parsedGroup.groupObjs.map(
                                        (obj: any) => ({
                                                fieldId:
                                                        typeof obj.fieldId === "string"
                                                                ? Number(obj.fieldId)
                                                                : obj.fieldId,
                                                order: obj.order || "asc",
                                                dbFieldName: obj.dbFieldName,
                                                type: obj.type,
                                        }),
                                );

                                return {
                                        groupObjs: normalizedGroupObjs,
                                } as IGroupConfig;
                        }
                }

                // console.log("❌ [activeGroupConfig] Returning null");
                return null;
        }, [group, groupConfigKey, groupPoints?.length]);

        // console.log("activeGroupConfig-->>", activeGroupConfig);

        // Build group collection (for rendering group headers) - now uses real fields
        const groupCollection = useMemo(() => {
                if (!hasGrouping || !activeGroupConfig) {
                        return null;
                }

                // Use real fields from data.columns
                // Note: columns have id = dbFieldName, but we need to match by fieldId (rawId)
                // IMPORTANT: Map fields in the SAME ORDER as groupObjs to ensure correct depth mapping
                const fields = activeGroupConfig.groupObjs
                        .map((groupObj, index) => {
                                // Normalize fieldId to number for comparison
                                const targetFieldId =
                                        typeof groupObj.fieldId === "string"
                                                ? Number(groupObj.fieldId)
                                                : groupObj.fieldId;

                                // First try to find by rawId (field.id) - this is the actual field ID
                                let column = data.columns.find((col) => {
                                        const colRawId = (col as any).rawId;
                                        const colId =
                                                typeof col.id === "string" ? Number(col.id) : col.id;
                                        return (
                                                colRawId === targetFieldId || colId === targetFieldId
                                        );
                                });

                                // Fallback: try to find by dbFieldName (columns.id = dbFieldName)
                                if (!column && groupObj.dbFieldName) {
                                        column = data.columns.find(
                                                (col) => col.id === groupObj.dbFieldName,
                                        );
                                }

                                // Last fallback: try to find by column.id as string (in case it's stored as string)
                                if (!column) {
                                        column = data.columns.find((col) => {
                                                const colId =
                                                        typeof col.id === "string"
                                                                ? Number(col.id)
                                                                : col.id;
                                                return colId === targetFieldId;
                                        });
                                }

                                return column;
                        })
                        .map((col, index) => {
                                const groupObj = activeGroupConfig.groupObjs[index];

                                // IMPORTANT: Don't filter out undefined columns - maintain depth mapping
                                if (!col) {
                                        return {
                                                id: groupObj?.fieldId || 0,
                                                name: groupObj?.dbFieldName || `Field ${index}`,
                                                type: "SHORT_TEXT",
                                                dbFieldName: groupObj?.dbFieldName || "",
                                        };
                                }

                                return {
                                        id: (col as any).rawId || Number(col.id) || 0,
                                        name: col.name, // Use column.name - this is the actual field name
                                        type: (col as any).rawType || col.type || "SHORT_TEXT",
                                        dbFieldName: (col as any).dbFieldName || col.id,
                                };
                        });

                if (fields.length === 0) return null;

                const collection = buildGroupCollection(activeGroupConfig, fields);

                // Log groupCollection order to debug canvas header issues
                // if (collection && collection.groupColumns.length > 0) {
                //      console.log("✅ [GROUPING] groupCollection built with order:", {
                //              groupColumns: collection.groupColumns.map((c, idx) => ({
                //                      index: idx,
                //                      depth: idx,
                //                      name: c.name,
                //                      id: c.id,
                //              })),
                //              activeGroupConfigOrder: activeGroupConfig.groupObjs.map(
                //                      (g, idx) => ({
                //                              index: idx,
                //                              depth: idx,
                //                              fieldId: g.fieldId,
                //                              dbFieldName: g.dbFieldName,
                //                      }),
                //              ),
                //              allDepthsAvailable: activeGroupConfig.groupObjs.every(
                //                      (_, idx) => collection.groupColumns[idx] !== undefined,
                //              ),
                //      });
                // }

                // // Detailed logging to debug field name display issue
                // console.log("✅ [GROUPING] Built groupCollection:", {
                //      groupColumnsCount: collection.groupColumns.length,
                //      groupColumnNames: collection.groupColumns.map((c, idx) => ({
                //              index: idx,
                //              name: c.name,
                //              id: c.id,
                //      })),
                //      groupObjsOrder: activeGroupConfig.groupObjs.map((g, idx) => ({
                //              index: idx,
                //              fieldId: g.fieldId,
                //              dbFieldName: g.dbFieldName,
                //              type: g.type,
                //      })),
                //      fieldsOrder: fields.map((f, idx) => ({
                //              index: idx,
                //              id: f.id,
                //              name: f.name,
                //              type: f.type,
                //              dbFieldName: f.dbFieldName,
                //      })),
                // });

                return collection;
        }, [
                hasGrouping,
                activeGroupConfig,
                data.columns,
                groupPoints,
                groupPoints?.length,
                // Add groupConfigKey to ensure recalculation when order changes
                groupConfigKey,
        ]);

        // Grouping transformation (uses backend groupPoints to create group headers)
        // Backend sends sorted records and groupPoints - we transform groupPoints to linearRows with group headers
        const groupTransformationResult = useMemo(() => {
                // Use groupPoints from backend only
                let pointsToUse = groupPoints || [];

                // Normalize groupPoints format to ensure it matches expected structure
                if (pointsToUse && pointsToUse.length > 0) {
                        pointsToUse = pointsToUse.map((point: any) => {
                                // Ensure type is number (0 or 1)
                                const normalizedType =
                                        typeof point.type === "string"
                                                ? Number(point.type)
                                                : point.type;

                                if (normalizedType === 0) {
                                        // Header point - ensure all required fields
                                        // Ensure id is always a string (required by IGroupPoint)
                                        const headerId =
                                                point.id || `group_${point.depth}_${point.value}`;
                                        return {
                                                type: 0,
                                                id: headerId,
                                                depth: point.depth ?? 0,
                                                value: point.value,
                                                isCollapsed: point.isCollapsed ?? false,
                                        };
                                } else if (normalizedType === 1) {
                                        // Row count point
                                        return {
                                                type: 1,
                                                count: point.count ?? 0,
                                        };
                                }
                                return point;
                        });
                }

                // Check if we should process grouping
                if (!hasGrouping || !pointsToUse.length) {
                        return null;
                }

                // Update groupPoints with collapsed state
                const updatedGroupPoints: any[] = pointsToUse.map((point) => {
                        if (point.type === 0) {
                                // Header point
                                const headerPoint = point as {
                                        type: 0;
                                        id?: string;
                                        depth?: number;
                                        value?: unknown;
                                        isCollapsed?: boolean;
                                };
                                // Ensure id is always a string (required by IGroupPoint)
                                const headerId =
                                        headerPoint.id ||
                                        `group_${headerPoint.depth ?? 0}_${headerPoint.value ?? "unknown"}`;
                                // Default to false if backend didn't send isCollapsed
                                const backendIsCollapsed = headerPoint.isCollapsed ?? false;
                                // Override with frontend store state (localStorage)
                                const isCollapsed = collapsedGroupIdsSet.has(headerId);
                                // LOG: Update isCollapsed for each header
                                return {
                                        type: 0 as const,
                                        id: headerId, // Ensure id is always defined
                                        depth: headerPoint.depth ?? 0,
                                        value: headerPoint.value,
                                        isCollapsed,
                                };
                        }
                        return point;
                });

                // Transform groupPoints to linearRows
                const result = groupPointsToLinearRows(
                        updatedGroupPoints,
                        canAppendRow,
                        GROUP_HEADER_HEIGHT,
                        appendRowHeight,
                );

                // LOG: Transformation complete
                // console.log("✅ [HOOK] Group transformation complete:", {
                //      linearRowsCount: result.linearRows.length,
                //      pureRowCount: result.pureRowCount,
                //      rowCount: result.rowCount,
                //      rowHeightMapKeys: Object.keys(result.rowHeightMap || {}).length,
                // });

                return result;
        }, [
                hasGrouping,
                groupPoints,
                activeGroupConfig,
                groupConfigKey, // Add to detect order changes in groupBy
                collapsedGroupIdsSet,
                collapsedGroupIdsKey,
                canAppendRow,
                appendRowHeight,
        ]);

        // Create linear rows mapping (like Teable)
        // Use transformation when groupBy is active to show group headers
        // Backend sends records already sorted by groupBy fields + sort fields
        const linearRows = useMemo(() => {
                if (hasGrouping && groupTransformationResult) {
                        // Use grouped linearRows (includes group headers)
                        return groupTransformationResult.linearRows as ILinearRow[];
                }

                // Default: simple mapping (records are already sorted by backend)
                const baseRows = records.map(
                        (_, index): ILinearRow => ({
                                type: LinearRowType.Row,
                                displayIndex: index + 1,
                                realIndex: index,
                        }),
                );

                if (canAppendRow) {
                        baseRows.push({
                                type: LinearRowType.Append,
                                displayIndex: records.length + 1,
                                realIndex: -1, // Append rows don't have a real record index (they're for creating new records)
                        });
                }

                return baseRows;
        }, [records, hasGrouping, groupTransformationResult, canAppendRow]);

        // Get linear row by index (like Teable)
        const getLinearRow = useCallback(
                (index: number): ILinearRow => {
                        return (
                                linearRows[index] || {
                                        type: LinearRowType.Row,
                                        realIndex: -1,
                                        displayIndex: -1,
                                }
                        );
                },
                [linearRows],
        );

        // Convert real row index to linear row index (like Teable)
        // Use real2LinearRowMap when grouping is active
        const real2RowIndex = useCallback(
                (realIndex: number) => {
                        if (hasGrouping && groupTransformationResult?.real2LinearRowMap) {
                                return (
                                        groupTransformationResult.real2LinearRowMap[realIndex] ??
                                        realIndex
                                );
                        }
                        // Default: realIndex === linearIndex (records are already sorted by backend)
                        return realIndex;
                },
                [hasGrouping, groupTransformationResult],
        );

        const isRealRowVisible = useCallback(
                (realIndex: number) => {
                        if (hasGrouping && groupTransformationResult?.real2LinearRowMap) {
                                return (
                                        groupTransformationResult.real2LinearRowMap[realIndex] !==
                                        undefined
                                );
                        }
                        return realIndex >= 0 && realIndex < records.length;
                },
                [hasGrouping, groupTransformationResult, records.length],
        );

        const visibleRealRows = useMemo(() => {
                if (!linearRows?.length) {
                        return records.map((_, index) => index);
                }
                const rows: number[] = [];
                linearRows.forEach((linearRow) => {
                        if (
                                linearRow?.type === LinearRowType.Row &&
                                typeof linearRow.realIndex === "number" &&
                                linearRow.realIndex >= 0
                        ) {
                                rows.push(linearRow.realIndex);
                        }
                });
                return rows;
        }, [linearRows, records]);

        const visibleRowIndexMap = useMemo(() => {
                const map = new Map<number, number>();
                visibleRealRows.forEach((realIndex, idx) => {
                        map.set(realIndex, idx);
                });
                return map;
        }, [visibleRealRows]);

        const getAdjacentVisibleRealRow = useCallback(
                (realRowIndex: number, direction: 1 | -1) => {
                        if (!visibleRealRows.length) {
                                return Math.max(0, Math.min(records.length - 1, realRowIndex));
                        }
                        const currentIdx = visibleRowIndexMap.get(realRowIndex);
                        if (currentIdx == null) {
                                return direction > 0
                                        ? visibleRealRows[visibleRealRows.length - 1]
                                        : visibleRealRows[0];
                        }
                        const nextIdx = currentIdx + direction;
                        if (nextIdx < 0 || nextIdx >= visibleRealRows.length) {
                                return visibleRealRows[currentIdx];
                        }
                        return visibleRealRows[nextIdx];
                },
                [records.length, visibleRealRows, visibleRowIndexMap],
        );

        const getVisibleBoundaryRealRow = useCallback(
                (direction: 1 | -1, fallbackRow: number) => {
                        if (!visibleRealRows.length) {
                                return fallbackRow;
                        }
                        return direction > 0
                                ? visibleRealRows[visibleRealRows.length - 1]
                                : visibleRealRows[0];
                },
                [visibleRealRows],
        );

        const findVisibleRealRow = useCallback(
                (startRow: number, direction: 1 | -1) => {
                        return getAdjacentVisibleRealRow(startRow, direction);
                },
                [getAdjacentVisibleRealRow],
        );

        // Helper function to get column width - Updated to handle resizing
        const getColumnWidth = (columnIndex: number): number => {
                // If we're resizing this column, use the resize width
                if (
                        columnResizeState.isResizing &&
                        columnResizeState.columnIndex === columnIndex
                ) {
                        return columnResizeState.width;
                }
                // Otherwise use the column's actual width
                return columns[columnIndex]?.width || 120;
        };

        // Calculate content width (without SCROLL_BUFFER) and scrollable content width
        // CRITICAL: scrollableContentWidth should only include SCROLLABLE columns (not frozen ones)
        // This ensures the scrollbar length correctly reflects only the scrollable content
        // When columns are resized, this updates dynamically, making the scrollbar longer/shorter
        // Row header is NOT included because it's fixed and doesn't scroll
        // NOTE: We must include columnResizeState in dependencies to update during resize
        // NOTE: Use config.freezeColumns instead of coordinateManager.freezeColumnCount (available earlier)
        const { contentWidth, scrollableContentWidth } = useMemo(() => {
                const freezeColumnCount = config.freezeColumns;
                const allColumnsWidth = columns.reduce(
                        (sum, _, index) => sum + getColumnWidth(index),
                        0,
                );
                const contentW = rowHeaderWidth + allColumnsWidth;

                // CRITICAL: Calculate scrollable columns width (exclude frozen columns)
                // This ensures scrollbar only represents scrollable content, not frozen columns
                // When scrolling reaches the end, frozen columns remain visible and don't get clipped
                const frozenColumnsWidth = columns
                        .slice(0, freezeColumnCount)
                        .reduce((sum, _, index) => sum + getColumnWidth(index), 0);
                const scrollableColumnsWidth = allColumnsWidth - frozenColumnsWidth;

                // scrollableContentWidth: width of scrollable columns only (for scrollbar sizing)
                // This ensures scrollbar length correctly reflects only scrollable content
                // and scrolling stops when the last scrollable column (add column button) is visible
                const scrollableW =
                        scrollableColumnsWidth + appendColumnWidth + SCROLL_BUFFER;
                return { contentWidth: contentW, scrollableContentWidth: scrollableW };
        }, [
                columns,
                getColumnWidth,
                rowHeaderWidth,
                canAppendColumn,
                appendColumnWidth,
                mouseState,
                columnResizeState.isResizing,
                columnResizeState.width,
                config.freezeColumns,
                SCROLL_BUFFER,
        ]);

        // Create row height map for variable row heights
        // Row height map - Only include rows with non-default heights
        // Since all rows use fixed height (RowHeightLevel.Short), this should be empty
        const rowHeightMap = useMemo(() => {
                const map: Record<number, number> = {};
                rowHeaders.forEach((_, index) => {
                        const actualHeight = getRowHeight(index);
                        // Only add to map if height differs from default
                        if (actualHeight !== rowHeight) {
                                map[index] = actualHeight;
                        }
                });

                if (canAppendRow && !hasGrouping) {
                        map[records.length] = appendRowHeight;
                }

                // Merge group header heights (always 56px) into rowHeightMap
                // This ensures group headers maintain fixed height regardless of row height level
                if (hasGrouping && groupTransformationResult?.rowHeightMap) {
                        Object.assign(map, groupTransformationResult.rowHeightMap);
                }

                // Debug: Log if we have variable heights (should be empty for fixed heights)
                if (Object.keys(map).length > 0) {
                        // console.log(
                        //      "⚠️ Variable row heights detected:",
                        //      Object.keys(map).length,
                        //      "rows",
                        // );
                }

                return map;
        }, [
                rowHeaders,
                rowHeight,
                getRowHeight,
                canAppendRow,
                hasGrouping,
                groupTransformationResult,
                records.length,
                appendRowHeight,
        ]);

        // Create column width map for variable column widths
        // IMPORTANT: Include resizing column width during resize (like Teable)
        const columnWidthMap = useMemo(() => {
                const map: Record<number, number> = {};
                columns.forEach((_, index) => {
                        // During resize, use the resize width instead of column.width
                        const width = getColumnWidth(index);
                        if (width !== 120) {
                                // 120 is the default column width
                                map[index] = width;
                        }
                });
                return map;
        }, [columns, getColumnWidth]); // Include getColumnWidth so it updates during resize

        // ========================================
        // PHASE 1 ADDITION: Scrollbar calculations
        // ========================================

        // Check if horizontal scrollbar is needed
        // Compare content width (without buffer) to container width
        // Like Teable: scrollbar shows when content doesn't fit, regardless of buffer
        const needsHorizontalScrollbar = contentWidth > containerSize.width;

        // Effective scrollbar height (0 if not needed)
        const effectiveScrollbarHeight = needsHorizontalScrollbar
                ? SCROLLBAR_HEIGHT
                : 0;

        // Virtual scrolling configuration - Updated to use dynamic row heights
        // Phase 1: Use grouped row count when grouping is enabled
        const totalRowsForScrolling = useMemo(() => {
                if (hasGrouping && groupTransformationResult?.rowCount !== undefined) {
                        return groupTransformationResult.rowCount;
                }
                return canAppendRow ? records.length + 1 : records.length;
        }, [
                records.length,
                hasGrouping,
                groupTransformationResult?.rowCount,
                canAppendRow,
        ]);

        const pureRowCountForScrolling = useMemo(() => {
                if (
                        hasGrouping &&
                        groupTransformationResult?.pureRowCount !== undefined
                ) {
                        return groupTransformationResult.pureRowCount;
                }
                return records.length;
        }, [records.length, hasGrouping, groupTransformationResult?.pureRowCount]);

        // Phase 1: Group header heights are merged into rowHeightMap in the rowHeightMap useMemo above

        // CRITICAL: Adjust container dimensions for zoom
        // When zoomed to 50%, content is smaller, so more rows/columns fit in the same container
        // Logical container size = actual container size / zoom scale
        // Example: 600px container at 50% zoom = 1200px logical container (can fit 2x more content)
        const zoomScale = zoomLevel / 100;
        const logicalContainerHeight =
                (containerSize.height -
                        headerHeight -
                        FOOTER_HEIGHT -
                        effectiveScrollbarHeight) /
                zoomScale;
        const logicalContainerWidth = containerSize.width / zoomScale;

        const virtualScrollingConfig: IVirtualScrollingConfig = {
                containerHeight: logicalContainerHeight, // Zoom-adjusted logical height
                containerWidth: logicalContainerWidth, // Zoom-adjusted logical width
                rowHeight, // This will be used as default, but individual rows can override
                columnWidth: 120, // Default width for virtual scrolling
                totalRows: totalRowsForScrolling, // Phase 1: Use grouped row count
                pureRows: pureRowCountForScrolling,
                totalColumns: columns.length,
                overscan: 5,
                rowHeightMap, // Phase 1: Already includes group header heights
                columnWidthMap, // Pass the map for variable column widths
                rowInitSize: headerHeight, // Header height offset (for frozen header region)
                columnInitSize: rowHeaderWidth, // Row header width offset (for frozen row header region)
                freezeColumnCount: config.freezeColumns, // Number of frozen columns
        };

        const {
                scrollState: virtualScrollState,
                setScrollPosition,
                handleScroll,
                contentDimensions,
                visibleIndices: rawVisibleIndices,
                coordinateManager,
        } = useVirtualScrolling(virtualScrollingConfig);

        // CRITICAL: Force visible range recalculation when zoom changes
        // When zoom changes, the logical container dimensions change, which should trigger
        // coordinateManager recreation, but we also need to ensure visible range is recalculated
        // with the current scroll position to show more/fewer rows/columns immediately
        useEffect(() => {
                // Recalculate visible range with current scroll position when zoom changes
                setScrollPosition(
                        virtualScrollState.scrollTop,
                        virtualScrollState.scrollLeft,
                );
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [zoomLevel]); // Only depend on zoomLevel - setScrollPosition is stable

        // Column freeze hook (like Teable) - Must be after useVirtualScrolling to access coordinateManager
        const {
                columnFreezeState,
                onColumnFreezeStart,
                onColumnFreezeMove,
                onColumnFreezeEnd,
        } = useColumnFreeze(coordinateManager, virtualScrollState);

        // Auto-adjust frozen columns when window is too narrow (like Airtable)
        const autoFreezeAdjustment = useAutoFreezeColumnAdjustment({
                coordinateManager,
                containerWidth: containerSize.width,
                rowHeaderWidth: config.rowHeaderWidth,
                zoomLevel,
                currentFreezeColumnCount: config.freezeColumns,
                onFreezeColumnChange: (newCount) => {
                        // Call onColumnFreeze to update the view
                        onColumnFreeze?.(newCount);
                },
        });
        const { warningState, handleResetToActual, handleCancel } =
                autoFreezeAdjustment;

        // Ensure frozen columns are always included in visible indices (like Teable)
        const visibleIndices = useMemo(() => {
                const freezeColumnCount = coordinateManager.freezeColumnCount;
                const frozenColumnIndices: number[] = [];
                for (let i = 0; i < freezeColumnCount; i++) {
                        frozenColumnIndices.push(i);
                }
                // Combine frozen columns with scrollable visible columns (remove duplicates)
                const allColumns = [
                        ...frozenColumnIndices,
                        ...rawVisibleIndices.columns.filter(
                                (colIndex) => colIndex >= freezeColumnCount,
                        ),
                ];
                return {
                        ...rawVisibleIndices,
                        columns: allColumns,
                };
        }, [rawVisibleIndices, coordinateManager]);

        // OPTIMIZATION: Memoize freeze properties to avoid repeated coordinateManager access
        const freezeProps = useMemo(
                () => ({
                        freezeColumnCount: coordinateManager.freezeColumnCount,
                        freezeRegionWidth: coordinateManager.freezeRegionWidth,
                }),
                [
                        coordinateManager.freezeColumnCount,
                        coordinateManager.freezeRegionWidth,
                ],
        );

        // Task 1: Calculate column statistics for number columns
        // Note: selectedRowIndicesByColumn will be calculated after selection is available

        // Task 2: Retrieve statistics store state
        const {
                columnStatisticConfig,
                statisticsMenu,
                openStatisticsMenu,
                closeStatisticsMenu,
                getColumnStatistic,
        } = useStatisticsStore();

        // OPTIMIZATION: Memoize frozen/scrollable column split to eliminate duplicate filtering
        // This split is reused in drawVisibleCells and drawGridLines
        const regionSplit = useMemo(() => {
                const { freezeColumnCount } = freezeProps;
                return {
                        frozenColumns: visibleIndices.columns.filter(
                                (colIndex) => colIndex < freezeColumnCount,
                        ),
                        scrollableColumns: visibleIndices.columns.filter(
                                (colIndex) => colIndex >= freezeColumnCount,
                        ),
                };
        }, [visibleIndices.columns, freezeProps.freezeColumnCount]);

        // Debug: Log virtual scrolling stats (only when visible range changes)
        const prevVisibleRange = useRef<string>("");
        useEffect(() => {
                const currentRange =
                        visibleIndices.rows.length > 0
                                ? `${visibleIndices.rows[0]}-${visibleIndices.rows[visibleIndices.rows.length - 1]}`
                                : "empty";

                // Only log when visible range actually changes
                if (prevVisibleRange.current !== currentRange) {
                        prevVisibleRange.current = currentRange;
                        // console.log("🔍 Virtual Scrolling Stats:", {
                        //      totalRows: records.length,
                        //      visibleRows: visibleIndices.rows.length,
                        //      visibleRowRange:
                        //              visibleIndices.rows.length > 0
                        //                      ? `[${visibleIndices.rows[0]}..${visibleIndices.rows[visibleIndices.rows.length - 1]}]`
                        //                      : "[]",
                        //      totalColumns: columns.length,
                        //      visibleColumns: visibleIndices.columns.length,
                        //      contentHeight: contentDimensions.totalHeight.toFixed(1),
                        // });
                }
        }, [visibleIndices, records.length, columns.length, contentDimensions]);

        // Update CoordinateManager when columnWidthMap changes (during column resize)
        // Like Teable: refreshColumnDimensions ensures CoordinateManager knows about new widths
        // Use useMemo (like Teable line 477-480) to update existing instance during column resize
        useMemo(() => {
                coordinateManager.refreshColumnDimensions({
                        columnCount: columns.length,
                        columnInitSize: rowHeaderWidth,
                        columnWidthMap,
                });
        }, [coordinateManager, columns.length, columnWidthMap, rowHeaderWidth]);

        // NOTE: No need to update coordinateManager when rowHeight changes
        // With useMemo in useVirtualScrolling, coordinateManager is recreated when rowHeight changes
        // The new reference automatically triggers all dependent hooks to recalculate

        // ========================================
        // PHASE 2: Selection Manager Integration
        // ========================================
        const {
                selection,
                isSelecting,
                setSelection,
                onSelectionStart,
                onSelectionChange,
                onSelectionEnd,
                onSelectionClick,
                onSelectionContextMenu,
        } = useSelection({
                coordInstance: coordinateManager,
                selectable: SelectableType.All, // Allow all selection types
                isMultiSelectionEnable: true, // Allow multi-selection
                getLinearRow,
                setActiveCell: useCallback<
                        React.Dispatch<React.SetStateAction<ICellItem | null>>
                >(
                        (
                                cell:
                                        | ICellItem
                                        | null
                                        | ((prev: ICellItem | null) => ICellItem | null),
                        ) => {
                                if (cell === null) {
                                        setActiveCell(null);
                                } else if (typeof cell === "function") {
                                        // Handle updater function form
                                        const prev: ICellItem | null = activeCell
                                                ? [activeCell.col, activeCell.row]
                                                : null;
                                        const newCell = cell(prev);
                                        if (newCell === null) {
                                                setActiveCell(null);
                                        } else {
                                                setActiveCell({ row: newCell[1], col: newCell[0] });
                                        }
                                } else {
                                        // ICellItem is [colIndex, rowIndex]
                                        setActiveCell({ row: cell[1], col: cell[0] });
                                }
                        },
                        [activeCell, setActiveCell],
                ),
                onSelectionChanged: (_selection) => {
                        // Optional: Handle selection change events
                        // console.log('Selection changed:', selection);
                },
        });

        // Calculate selected row indices per column for statistics (like Airtable/Google Sheets)
        // If there's a cell selection, calculate stats for selected records per column
        // CRITICAL: Only process actual selections (not single active cells)
        // getSelectedRowIndicesByColumn already filters out single cells, but we add an extra check here
        const selectedRowIndicesByColumn = useMemo(() => {
                if (!selection.isCellSelection || selection.ranges.length < 2) {
                        return undefined;
                }

                // Check if it's an actual selection range (not just a single active cell)
                const [startRange, endRange] = selection.ranges;
                const [startCol, startRow] = startRange;
                const [endCol, endRow] = endRange;
                const isActualSelection = startCol !== endCol || startRow !== endRow;

                if (!isActualSelection) {
                        // Single cell = active cell, not a selection - don't filter statistics
                        return undefined;
                }

                return getSelectedRowIndicesByColumn(selection, columns);
        }, [selection, columns]);

        // Create a hash of record cell values for number columns to detect cell value changes
        // This ensures statistics update even if records array reference doesn't change (defensive approach)
        // CRITICAL: This hash changes whenever any number cell value changes, triggering recalculation
        const recordsHash = useMemo(() => {
                return records
                        .map((record) =>
                                columns
                                        .filter((col) => col.type === CellType.Number)
                                        .map((col) => {
                                                const cell = record.cells[col.id];
                                                return cell?.type === CellType.Number
                                                        ? String((cell as any).data ?? "")
                                                        : "";
                                        })
                                        .join("|"),
                        )
                        .join("||");
        }, [records, columns]);

        // Calculate column statistics - uses selected records if there's a cell selection
        // CRITICAL: Recalculate whenever records change (including cell value updates)
        // The records dependency ensures recalculation when parent updates data.records
        // The recordsHash ensures recalculation even if array reference doesn't change (mutation case)
        const columnStatistics = useMemo(() => {
                return calculateColumnStatistics(
                        columns,
                        records,
                        visibleIndices.columns,
                        selectedRowIndicesByColumn,
                );
        }, [
                columns,
                records,
                recordsHash, // Hash of cell values - changes when any number cell value changes
                visibleIndices.columns,
                selectedRowIndicesByColumn,
        ]);

        // Calculate selected record count for footer display
        // Only count as selection if it's an actual range (not just a single active cell)
        const selectedRecordCount = useMemo(() => {
                if (selection.isRowSelection) {
                        // For row selection, get all row indices
                        const selectedRows = new Set<number>();
                        selection.ranges.forEach((range) => {
                                const [start, end] = range;
                                for (let i = start; i <= end; i++) {
                                        selectedRows.add(i);
                                }
                        });
                        // Only return count if more than 1 row is selected
                        return selectedRows.size > 1 ? selectedRows.size : undefined;
                } else if (selection.isCellSelection && selection.ranges.length >= 2) {
                        // For cell selection, check if it's an actual range (not just a single cell)
                        const [startRange, endRange] = selection.ranges;
                        const [startCol, startRow] = startRange;
                        const [endCol, endRow] = endRange;

                        // Check if start and end are different (actual selection range)
                        // If they're the same, it's just an active cell, not a selection
                        const isActualSelection =
                                startCol !== endCol || startRow !== endRow;

                        if (!isActualSelection) {
                                // Single cell = active cell, not a selection
                                return undefined;
                        }

                        // Get unique row indices from the selection range
                        const selectedRows = new Set<number>();
                        const minRow = Math.min(startRow, endRow);
                        const maxRow = Math.max(startRow, endRow);
                        for (let i = minRow; i <= maxRow; i++) {
                                selectedRows.add(i);
                        }
                        return selectedRows.size > 0 ? selectedRows.size : undefined;
                }
                return undefined;
        }, [selection]);

        const {
                columnDragState,
                onColumnDragStart,
                onColumnDragChange,
                onColumnDragEnd,
        } = useColumnDrag({
                coordinateManager,
                scrollState,
                selection,
                rowHeaderWidth,
                columnCount: columns.length,
        });

        const autoScrollForColumnDrag = useCallback(
                (mouseState: IMouseState) => {
                        if (!columnDragState.isActive) {
                                return;
                        }

                        const scroller = scrollerRef.current;
                        if (!scroller) {
                                return;
                        }

                        const AUTOSCROLL_MARGIN = 48;
                        const AUTOSCROLL_STEP = 24;
                        const x = mouseState.x;
                        let scrolled = false;

                        if (x > containerSize.width - AUTOSCROLL_MARGIN) {
                                scroller.scrollBy(AUTOSCROLL_STEP, 0);
                                scrolled = true;
                        } else if (x < rowHeaderWidth + AUTOSCROLL_MARGIN) {
                                scroller.scrollBy(-AUTOSCROLL_STEP, 0);
                                scrolled = true;
                        }

                        if (scrolled) {
                                requestAnimationFrame(() => {
                                        onColumnDragChange(mouseState);
                                });
                        }
                },
                [
                        columnDragState.isActive,
                        containerSize.width,
                        rowHeaderWidth,
                        onColumnDragChange,
                ],
        );

        // Total content height including footer
        const totalContentHeight = contentDimensions.totalHeight + FOOTER_HEIGHT;

        // Footer Y position (like Teable: drawn at bottom of visible canvas)
        const footerY = containerSize.height - FOOTER_HEIGHT;

        const columnDragVisuals = useMemo(() => {
                if (
                        !columnDragState.isDragging ||
                        columnDragState.columnIndices.length === 0 ||
                        columnDragState.width <= 0
                ) {
                        return null;
                }

                const usableStageHeight =
                        containerSize.height - FOOTER_HEIGHT - effectiveScrollbarHeight;
                const stageHeight = Math.max(headerHeight, usableStageHeight);
                const needsVerticalScrollbar =
                        totalContentHeight > containerSize.height;
                const verticalScrollbarWidth = needsVerticalScrollbar
                        ? SCROLLBAR_WIDTH
                        : 0;
                // CRITICAL: Calculate logical container width for zoom-aware clamping
                // columnDragState.visualLeft and width are in logical coordinates
                // So clamping should use logical container dimensions
                const zoomScale = zoomLevel / 100;
                const logicalContainerWidth = containerSize.width / zoomScale;
                const usableWidth =
                        logicalContainerWidth - verticalScrollbarWidth - rowHeaderWidth;
                const effectiveUsableWidth = Math.max(0, usableWidth);
                const maxLeft =
                        rowHeaderWidth +
                        Math.max(0, effectiveUsableWidth - columnDragState.width);
                const clampedLeft = Math.max(
                        rowHeaderWidth,
                        Math.min(columnDragState.visualLeft, maxLeft),
                );

                let indicatorLeft: number | null = null;
                const dropIndex = columnDragState.dropIndex;

                if (dropIndex <= 0) {
                        indicatorLeft = rowHeaderWidth;
                } else if (dropIndex >= columns.length) {
                        const lastIndex = columns.length - 1;
                        if (lastIndex >= 0) {
                                const lastOffset = coordinateManager.getColumnRelativeOffset(
                                        lastIndex,
                                        scrollState.scrollLeft,
                                );
                                const lastWidth = coordinateManager.getColumnWidth(lastIndex);
                                indicatorLeft = lastOffset + lastWidth;
                        }
                } else {
                        indicatorLeft = coordinateManager.getColumnRelativeOffset(
                                dropIndex,
                                scrollState.scrollLeft,
                        );
                }

                if (indicatorLeft != null) {
                        // CRITICAL: indicatorLeft is in logical coordinates, clamp using logical dimensions
                        const minIndicator = rowHeaderWidth;
                        const maxIndicator = rowHeaderWidth + effectiveUsableWidth; // Already calculated using logical width above
                        indicatorLeft = Math.max(
                                minIndicator,
                                Math.min(indicatorLeft, maxIndicator),
                        );
                }

                return {
                        left: clampedLeft,
                        width: columnDragState.width,
                        height: stageHeight,
                        indicatorLeft,
                        indicatorHeight: Math.max(0, stageHeight - headerHeight),
                };
        }, [
                columnDragState.isDragging,
                columnDragState.columnIndices,
                columnDragState.width,
                columnDragState.visualLeft,
                columnDragState.dropIndex,
                containerSize.height,
                containerSize.width,
                rowHeaderWidth,
                headerHeight,
                columns.length,
                coordinateManager,
                scrollState.scrollLeft,
                totalContentHeight,
                effectiveScrollbarHeight,
                zoomLevel, // CRITICAL: Add zoomLevel dependency for logical width calculation
        ]);

        // ========================================
        // PHASE 2 ADDITION: Wire scroll events
        // ========================================

        // REMOVED: useEffect that was calling handleScroll on scrollState changes
        // This was causing infinite loops because handleScroll might be recreated on every render
        // InfiniteScroller handles scroll events directly via onScrollChanged callback
        // The visible range is recalculated automatically when scrollState changes via:
        // 1. InfiniteScroller's onScrollChanged callback (line 2551-2558) which calls setScrollState
        // 2. renderGrid dependencies include scrollState.scrollTop and scrollState.scrollLeft
        // 3. No need for manual handleScroll call - it's handled by InfiniteScroller

        // Clear isScrolling flag after scroll ends
        useEffect(() => {
                if (!scrollState.isScrolling) return;

                const timer = setTimeout(() => {
                        setScrollState((prev) => ({ ...prev, isScrolling: false }));
                }, 150);

                return () => clearTimeout(timer);
        }, [scrollState.isScrolling]);

        // Close editor and clear selection when column resize starts
        useEffect(() => {
                const canvas = canvasRef.current;

                if (columnResizeState.isResizing) {
                        // Close editor
                        if (editingCell) {
                                setEditingCell(null);
                                setFixedEditorPosition(null);
                        }
                        // Clear column selection (fix: column stays selected after resize)
                        if (selection.isColumnSelection) {
                                setSelection(selection.reset());
                        }
                        // Clear the flag when resize starts (fresh state for resize end)
                        justFinishedResizeRef.current = false;
                } else {
                        // FIX: Reset cursor to default when resize ends (prevent col-resize cursor from staying visible)
                        // This handles cases where mouse hasn't moved after resize ends
                        if (canvas) {
                                canvas.style.cursor = "default";
                        }
                }
        }, [columnResizeState.isResizing, editingCell, selection, setSelection]);

        // Scroll to cell helper - EXACTLY like Teable's scrollToItem (lines 550-591)
        // Phase 1: Accepts realIndex and converts to linearIndex internally (like Teable line 562)
        // Only scrolls if the cell is outside the viewport (prevents unnecessary scrolling)
        const scrollToCell = useCallback(
                (row: number, col: number) => {
                        try {
                                if (!scrollerRef.current) return;

                                const {
                                        containerHeight,
                                        containerWidth,
                                        rowInitSize, // headerHeight
                                        columnInitSize, // rowHeaderWidth
                                } = coordinateManager;
                                const { scrollTop, scrollLeft } = scrollState;

                                // Phase 1: Convert realIndex → linearIndex (like Teable line 562)
                                const linearRowIndex = real2RowIndex(row);

                                // Get cell position in grid coordinate system (like Teable lines 578-579)
                                // Use linearIndex for positioning (like Teable line 579)
                                const rowHeight =
                                        coordinateManager.getRowHeight(linearRowIndex);
                                const offsetY = coordinateManager.getRowOffset(linearRowIndex);
                                const colOffset = coordinateManager.getColumnOffset(col);
                                const colWidth = getColumnWidth(col);

                                // Vertical scrolling (EXACTLY like Teable lines 580-585)
                                // Calculate if cell is outside viewport
                                // deltaTop: negative if cell is above viewport, 0 otherwise
                                const deltaTop = Math.min(offsetY - scrollTop - rowInitSize, 0);
                                // deltaBottom: positive if cell is below viewport, 0 otherwise
                                const deltaBottom = Math.max(
                                        offsetY + rowHeight - scrollTop - containerHeight,
                                        0,
                                );
                                // Calculate new scrollTop (only changes if cell is outside viewport)
                                const st = scrollTop + deltaTop + deltaBottom;
                                // Only scroll vertically if cell is outside viewport
                                if (st !== scrollTop) {
                                        scrollerRef.current.scrollTo(undefined, st);
                                }

                                // Horizontal scrolling (EXACTLY like Teable lines 565-575)
                                // Calculate if cell is outside viewport
                                const deltaLeft = Math.min(
                                        colOffset - scrollLeft - columnInitSize,
                                        0,
                                );
                                const deltaRight = Math.max(
                                        colOffset + colWidth - scrollLeft - containerWidth,
                                        0,
                                );
                                // Calculate new scrollLeft (only changes if cell is outside viewport)
                                const sl = scrollLeft + deltaLeft + deltaRight;
                                // Only scroll horizontally if cell is outside viewport
                                if (sl !== scrollLeft) {
                                        // Add scroll buffer like Teable (16px buffer for smoother scrolling)
                                        const cellScrollBuffer = 16;
                                        const scrollBuffer =
                                                deltaLeft < 0
                                                        ? -cellScrollBuffer
                                                        : deltaRight > 0
                                                                ? cellScrollBuffer
                                                                : 0;
                                        scrollerRef.current.scrollTo(sl + scrollBuffer, undefined);
                                }
                        } catch {}
                },
                [
                        coordinateManager,
                        getRowHeight,
                        getColumnWidth,
                        scrollState,
                        scrollerRef,
                        real2RowIndex, // Phase 1: Add real2RowIndex dependency
                ],
        );

        // Keyboard navigation - Phase 2: Uses CombinedSelection from useSelection hook
        useKeyboardNavigation({
                columns,
                records,
                activeCell,
                editingCell,
                setActiveCell,
                setEditingCell,
                onCellChange,
                scrollToCell,
                real2RowIndex,
                isRowVisible: isRealRowVisible,
                getAdjacentVisibleRow: getAdjacentVisibleRealRow,
                getVisibleBoundaryRow: getVisibleBoundaryRealRow,
                selection, // CombinedSelection instance from useSelection hook
                setSelection, // Function from useSelection hook
                rowHeaders,
                getRowHeight,
                getColumnWidth: (index: number) => getColumnWidth(index),
                canEditRecords: Boolean(onCellChange), // Disable shortcuts if editing is not allowed
        });

        // ========================================
        // PHASE 1: Copy functionality (Ctrl+C)
        // PHASE 2: Paste functionality (Ctrl+V)
        // ========================================
        const { handleCopy, handlePaste } = useClipboard();

        // ========================================
        // PHASE 1: Context Menu functionality
        // Phase 2A: Delete Records functionality
        // ========================================
        const { handleCellContextMenu, handleHeaderContextMenu, confirmDialog } =
                useContextMenu({
                        selection,
                        tableData: data,
                        currentSort: sort,
                        currentFilter: filter,
                        currentGroupBy: group,
                        fields: fields || [],
                        onDeleteRecords: onDeleteRecords || (() => {}),
                        onInsertRecord: onInsertRecord || (() => {}),
                        onDuplicateRecord: onDuplicateRecord || (() => {}),
                        onEditColumn: onEditColumn || (() => {}),
                        onDuplicateColumn: onDuplicateColumn || (() => {}),
                        onInsertColumn: onInsertColumn || (() => {}),
                        onDeleteColumns: onDeleteColumns || (() => {}),
                        onClearSelection: () => {
                                // Clear selection after delete (like Teable line 439, 479)
                                setSelection(selection.reset());
                        },
                        canEditRecords: Boolean(onCellChange), // Prevent context menu if editing is disabled
                        canEditFields: Boolean(onEditColumn || onInsertColumn || onDeleteColumns || onColumnAppend), // Prevent context menu if field operations are disabled
                });

        // Handle Ctrl+C keyboard shortcut for copy
        useEffect(() => {
                const handleKeyDown = (e: KeyboardEvent) => {
                        // Only handle if Ctrl+C (or Cmd+C on Mac) is pressed
                        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
                                // Only copy if grid has focus and has selection
                                // Check if container is focused or if there's an active selection
                                const hasSelection =
                                        selection.type !== SelectionRegionType.None &&
                                        selection.ranges.length > 0;
                                const hasActiveCell = activeCell !== null;

                                if (hasSelection || hasActiveCell) {
                                        // Prevent default browser copy
                                        e.preventDefault();
                                        e.stopPropagation();

                                        // Handle copy
                                        handleCopy(
                                                selection,
                                                data,
                                                () => {},
                                                () => {},
                                        ).catch(() => {});
                                }
                        }
                };

                // Add event listener to window (global keyboard shortcut)
                window.addEventListener("keydown", handleKeyDown);

                return () => {
                        window.removeEventListener("keydown", handleKeyDown);
                };
        }, [selection, activeCell, data, handleCopy]);

        // Handle Ctrl+V keyboard shortcut for paste
        // CRITICAL FIX: Check if editor is active before handling paste (like Teable)
        // When editor is active, let it handle paste natively (textarea/input handle paste automatically)
        // When editor is NOT active, handle paste in the grid
        useEffect(() => {
                const handlePasteEvent = (e: ClipboardEvent) => {
                        // Method 1: Check editingCell state (like Teable's isEditing check)
                        if (editingCell) {
                                // Editor is active - let it handle paste natively
                                // Don't prevent default or stop propagation - let the editor handle it
                                return;
                        }

                        // Method 2: Check if focus is in an editor element (textarea/input)
                        // This catches cases where editor might be active but editingCell state is stale
                        // or when user clicks inside editor but state hasn't updated yet
                        const activeElement = document.activeElement;
                        if (activeElement) {
                                const isEditorElement =
                                        activeElement.tagName === "TEXTAREA" ||
                                        activeElement.tagName === "INPUT" ||
                                        activeElement.closest("[data-editor-container]") !== null; // Check for editor container marker

                                if (isEditorElement) {
                                        // Focus is in editor - let it handle paste natively
                                        return;
                                }
                        }

                        // Only paste if grid has focus and has selection (editor is NOT active)
                        const hasSelection =
                                selection.type !== SelectionRegionType.None &&
                                selection.ranges.length > 0;
                        const hasActiveCell = activeCell !== null;

                        if (hasSelection || hasActiveCell) {
                                // Use handlePaste from useClipboard hook
                                handlePaste(
                                        e as any, // ClipboardEvent
                                        selection,
                                        data,
                                        (updates) => {
                                                // Call onCellsChange for batch updates (preferred)
                                                if (onCellsChange) {
                                                        onCellsChange(updates);
                                                } else if (onCellChange) {
                                                        // Fallback to individual updates if onCellsChange not provided
                                                        // Convert linear rowIndex to real rowIndex when grouping is active
                                                        updates.forEach(
                                                                ({ rowIndex, columnIndex, cell }) => {
                                                                        // Convert linear index to real index for grouped views
                                                                        let realRowIndex = rowIndex;
                                                                        if (
                                                                                hasGrouping &&
                                                                                linearRows &&
                                                                                rowIndex >= 0 &&
                                                                                rowIndex < linearRows.length
                                                                        ) {
                                                                                const linearRow = linearRows[rowIndex];
                                                                                // Skip group headers and append rows
                                                                                if (
                                                                                        linearRow?.type ===
                                                                                                LinearRowType.Group ||
                                                                                        linearRow?.type ===
                                                                                                LinearRowType.Append
                                                                                ) {
                                                                                        return; // Skip non-record rows
                                                                                }
                                                                                realRowIndex =
                                                                                        linearRow?.realIndex ?? rowIndex;
                                                                        }
                                                                        onCellChange(
                                                                                realRowIndex,
                                                                                columnIndex,
                                                                                cell,
                                                                        );
                                                                },
                                                        );
                                                }
                                        },
                                        () => {},
                                );
                        }
                };

                // Add event listener to container (paste event)
                const container = containerRef.current;
                if (container) {
                        container.addEventListener("paste", handlePasteEvent);
                }

                return () => {
                        if (container) {
                                container.removeEventListener("paste", handlePasteEvent);
                        }
                };
        }, [
                selection,
                activeCell,
                editingCell,
                data,
                handlePaste,
                onCellChange,
                onCellsChange,
        ]); // Add editingCell to dependencies

        // Handle keyboard-triggered editor opening (Phase 3: Keyboard Editor Mode)
        // This allows any printable key to open the editor when a cell is selected
        const handleKeyboardEditorOpen = useCallback(
                (event: React.KeyboardEvent<HTMLDivElement>) => {
                        // Don't handle if already editing
                        if (editingCell) return;

                        // Don't handle if no active cell
                        if (!activeCell) return;

                        // Check if key is printable (excludes navigation, modifiers, special keys)
                        if (!isPrintableKey(event.nativeEvent)) return;

                        // Get the cell and column to check if editing is allowed
                        // Convert linear index to real index if grouping is active
                        let realRowIndex = activeCell.row;
                        if (
                                hasGrouping &&
                                linearRows &&
                                activeCell.row >= 0 &&
                                activeCell.row < linearRows.length
                        ) {
                                const linearRow = linearRows[activeCell.row];
                                // Skip if it's a group header or append row
                                if (
                                        linearRow?.type === LinearRowType.Group ||
                                        linearRow?.type === LinearRowType.Append
                                ) {
                                        return; // Can't edit group headers or append rows
                                }
                                realRowIndex = linearRow?.realIndex ?? activeCell.row;
                        }

                        // Validate realRowIndex before accessing records
                        if (realRowIndex < 0 || realRowIndex >= records.length) {
                                return;
                        }

                        const record = records[realRowIndex];
                        const column = columns[activeCell.col];

                        if (!record || !column) return;

                        const cell = record.cells[column.id];
                        if (!cell) return;

                        // Check if cell allows keyboard editing (not read-only, not excluded type)
                        if (!shouldAllowKeyboardEdit(cell, cell.type)) return;

                        // Check if focus is in an input/textarea/select (let those handle the key)
                        const activeElement = document.activeElement;
                        if (activeElement) {
                                const isFormElement =
                                        activeElement.tagName === "TEXTAREA" ||
                                        activeElement.tagName === "INPUT" ||
                                        activeElement.tagName === "SELECT" ||
                                        activeElement.closest("[data-editor-container]") !== null;

                                if (isFormElement) {
                                        // Focus is in a form element - let it handle the key
                                        return;
                                }
                        }

                        // All conditions met - open editor
                        // Convert real index to linear index for editingCell
                        const editingRowIndex =
                                hasGrouping && linearRows
                                        ? (() => {
                                                        // Find the linear row index that corresponds to this real index
                                                        const linearRow = linearRows.find(
                                                                (row) => row.realIndex === realRowIndex,
                                                        );
                                                        return linearRow
                                                                ? linearRows.indexOf(linearRow)
                                                                : realRowIndex;
                                                })()
                                        : realRowIndex;

                        setEditingCell({ row: editingRowIndex, col: activeCell.col });

                        // Prevent default to avoid typing the character in the container
                        event.preventDefault();
                        event.stopPropagation();
                },
                [editingCell, activeCell, records, columns, hasGrouping, linearRows],
        );

        // Update container size on resize
        useEffect(() => {
                const updateSize = () => {
                        if (containerRef.current) {
                                const rect = containerRef.current.getBoundingClientRect();

                                // TEMPORARY FIX: Ensure minimum height for scrolling
                                const minHeight = 400; // Minimum 400px height
                                const actualHeight = Math.max(rect.height, minHeight);

                                setContainerSize({ width: rect.width, height: actualHeight });
                        }
                };

                updateSize();

                // Use ResizeObserver to catch layout changes that don't trigger window resize
                let resizeObserver: ResizeObserver | undefined;
                if (typeof ResizeObserver !== "undefined" && containerRef.current) {
                        resizeObserver = new ResizeObserver(() => updateSize());
                        resizeObserver.observe(containerRef.current);
                }

                window.addEventListener("resize", updateSize);

                return () => {
                        window.removeEventListener("resize", updateSize);
                        if (resizeObserver && containerRef.current) {
                                resizeObserver.unobserve(containerRef.current);
                        }
                };
        }, []);

        // Phase 1: Compute if we should re-render (like Teable's computeShouldRerender)
        // Reference: teable/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts (lines 1940-1953)
        const computeShouldRerender = useCallback(
                (
                        current: {
                                theme: IGridTheme;
                                columns: IColumn[];
                                records: IRecord[];
                                visibleIndices: { rows: number[]; columns: number[] };
                                scrollState: IScrollState;
                                activeCell: { row: number; col: number } | null;
                                selection: CombinedSelection;
                                groupTransformationResult: any;
                                groupCollection: any;
                                linearRows: ILinearRow[] | undefined;
                                containerSize: { width: number; height: number };
                                columnResizeWidth: number;
                                mouseState?: IMouseState;
                                cellLoading: Record<string, Record<string, boolean>>;
                                zoomLevel: number;
                        },
                        last?: typeof current | null,
                ): boolean => {
                        if (last == null) return true;

                        // Only re-render if these critical props changed
                        // Note: We check mouseState.rowIndex and mouseState.type for row header hover (checkbox visibility)
                        // This allows checkboxes to appear/disappear on hover without re-rendering on every mouse move
                        const mouseStateRowChanged =
                                current.mouseState?.rowIndex !== last.mouseState?.rowIndex;
                        const mouseStateTypeChanged =
                                current.mouseState?.type !== last.mouseState?.type;
                        // Check if mouseState changed in a way that affects row header rendering
                        const mouseStateAffectsRowHeaders =
                                mouseStateRowChanged ||
                                (mouseStateTypeChanged &&
                                        (current.mouseState?.type === RegionType.RowHeader ||
                                                current.mouseState?.type ===
                                                        RegionType.RowHeaderCheckbox ||
                                                last.mouseState?.type === RegionType.RowHeader ||
                                                last.mouseState?.type ===
                                                        RegionType.RowHeaderCheckbox));

                        // Check if groupPoints changed (by comparing array length and reference)
                        // This ensures we redraw when groupBy changes even if transformation result reference is same
                        const groupPointsChanged =
                                !last ||
                                // current.groupPoints !== last.groupPoints ||
                                // current.groupPointsLength !== (last.groupPointsLength ?? 0) ||
                                // current.groupPoints?.length !== last.groupPoints?.length ||
                                current.groupTransformationResult?.linearRows?.length !==
                                        last.groupTransformationResult?.linearRows?.length ||
                                current.groupCollection?.groupColumns?.length !==
                                        last.groupCollection?.groupColumns?.length;

                        return !(
                                current.theme === last.theme &&
                                current.columns === last.columns &&
                                current.records === last.records &&
                                current.visibleIndices === last.visibleIndices &&
                                current.scrollState.scrollTop === last.scrollState.scrollTop &&
                                current.scrollState.scrollLeft ===
                                        last.scrollState.scrollLeft &&
                                current.scrollState.isScrolling ===
                                        last.scrollState.isScrolling &&
                                current.activeCell?.row === last.activeCell?.row &&
                                current.activeCell?.col === last.activeCell?.col &&
                                current.selection === last.selection &&
                                // current.groupPoints === last.groupPoints && // Compare groupPoints directly
                                // current.groupPointsLength === last.groupPointsLength && // Compare length separately
                                current.groupTransformationResult ===
                                        last.groupTransformationResult &&
                                current.groupCollection === last.groupCollection &&
                                current.linearRows === last.linearRows &&
                                current.containerSize.width === last.containerSize.width &&
                                current.containerSize.height === last.containerSize.height &&
                                current.columnResizeWidth === last.columnResizeWidth &&
                                !mouseStateAffectsRowHeaders && // Re-render if mouseState affects row headers
                                current.cellLoading === last.cellLoading &&
                                !groupPointsChanged && // Force re-render if groupPoints changed &&
                                current.zoomLevel === last.zoomLevel // Re-render if zoom level changes
                        );
                },
                [],
        );

        // Canvas rendering - Optimized to reduce re-renders (like Teable)
        // Reference: teable/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts (drawGrid, lines 1993-2076)
        // Note: columnStatistics, columnStatisticConfig, statisticsMenu, closeStatisticsMenu, and getColumnStatistic
        // are already defined above (lines 1602, 1478-1484) - no need to duplicate

        // Count groups from groupTransformationResult
        const groupCount = useMemo(() => {
                if (!hasGrouping || !groupTransformationResult) return 0;
                return (
                        groupTransformationResult.linearRows?.filter(
                                (row) => row.type === LinearRowType.Group,
                        ).length || 0
                );
        }, [hasGrouping, groupTransformationResult]);

        const renderGrid = useCallback(() => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                // Phase 1: Check if we should actually re-render (like Teable)
                const currentProps = {
                        theme,
                        columns,
                        records,
                        visibleIndices,
                        scrollState,
                        activeCell,
                        selection,
                        groupPoints: hasGrouping ? groupPoints : undefined, // Track groupPoints directly to detect changes
                        groupPointsLength: groupPoints?.length ?? 0, // Track length separately to detect changes even if reference is same
                        groupTransformationResult: hasGrouping
                                ? groupTransformationResult
                                : null,
                        groupCollection: hasGrouping ? groupCollection : null,
                        linearRows: hasGrouping ? linearRows : undefined,
                        containerSize,
                        columnResizeWidth: columnResizeState.width,
                        mouseState, // Add mouseState to track hover changes for dropdown icon
                        cellLoading,
                        zoomLevel, // Add zoomLevel to trigger re-render when zoom changes
                };

                const lastProps = lastRenderPropsRef.current;
                const shouldRerender =
                        scrollState.isScrolling ||
                        computeShouldRerender(currentProps, lastProps);

                // LOG: Only log when we actually re-render (not on every call)
                if (shouldRerender) {
                        // console.log("🎨 [RENDER] Re-rendering grid:", {
                        //      isScrolling: scrollState.isScrolling,
                        //      scrollTop: scrollState.scrollTop,
                        //      scrollLeft: scrollState.scrollLeft,
                        //      visibleRows: visibleIndices.rows.length,
                        //      visibleCols: visibleIndices.columns.length,
                        // });
                } else {
                        // Skip rendering if nothing changed
                        return;
                }

                // Update last props
                lastRenderPropsRef.current = currentProps;

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                // Set canvas size to match visible container (like Teable) with HiDPI support
                const ratio = devicePixelRatio || 1;
                const displayWidth = containerSize.width;
                const displayHeight = containerSize.height;
                const scaledWidth = Math.round(displayWidth * ratio);
                const scaledHeight = Math.round(displayHeight * ratio);

                // CRITICAL: Reset transform to identity before clearing to ensure complete clear
                ctx.setTransform(1, 0, 0, 1, 0, 0);

                // Resize canvas if needed (this automatically clears the canvas)
                if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
                        canvas.width = scaledWidth;
                        canvas.height = scaledHeight;
                }
                // Set canvas display size (no CSS transform - that causes white space and scales everything)
                canvas.style.width = `${displayWidth}px`;
                canvas.style.height = `${displayHeight}px`;

                // CRITICAL: Clear the entire canvas at full resolution (before applying any transforms)
                // This prevents ghosting/overlapping renders when zoom level changes
                // Must clear after setting canvas size to ensure we clear the full area
                ctx.clearRect(0, 0, scaledWidth, scaledHeight);

                // Fill canvas background at 1:1 scale (devicePixelRatio only) to cover entire canvas
                // This ensures the background covers the full area including footer region
                // Use devicePixelRatio transform so background fills correctly on HiDPI displays
                // Use grayish background color to match the table/container background
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
                ctx.fillStyle = "#f5f5f5"; // Match the container background color (grayish)
                ctx.fillRect(0, 0, displayWidth, displayHeight);

                // Apply zoom scale to canvas context transform (only affects drawing operations)
                // This way only the grid content is zoomed, not the canvas element itself
                const zoomScale = zoomLevel / 100;
                ctx.setTransform(ratio * zoomScale, 0, 0, ratio * zoomScale, 0, 0);
                ctx.imageSmoothingEnabled = false;

                // CRITICAL: Calculate logical maxY for clipping regions
                // At 50% zoom, logical container is 2x larger, so maxY should be 2x larger in logical space
                // This allows more rows to be rendered when zoomed out
                // CRITICAL: maxY should match footer position in logical space
                // Footer is at containerSize.height - FOOTER_HEIGHT in physical space
                // So in logical space: (containerSize.height - FOOTER_HEIGHT) / zoomScale
                // We subtract effectiveScrollbarHeight from the container height, not from the footer position
                const logicalMaxY = (containerSize.height - FOOTER_HEIGHT) / zoomScale;

                // Draw the fixed corner where row headers meet column headers
                ctx.fillStyle = theme.cellBackgroundColor;
                ctx.fillRect(0, 0, rowHeaderWidth, headerHeight);

                // Draw frozen column background EARLY (before cells) to ensure it's behind frozen cells
                // This covers the gray background and ensures frozen columns stay visible when scrolling
                if (
                        freezeProps.freezeColumnCount > 0 &&
                        freezeProps.freezeRegionWidth > 0
                ) {
                        ctx.fillStyle = theme.cellBackgroundColor;
                        ctx.fillRect(
                                rowHeaderWidth, // Start after row header
                                0, // Start from top (covers header area too)
                                freezeProps.freezeRegionWidth - rowHeaderWidth, // Width of frozen columns
                                containerSize.height, // Full height
                        );
                }
                ctx.strokeStyle = theme.cellBorderColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                // Vertical divider between row headers and columns
                ctx.moveTo(rowHeaderWidth + 0.5, 0);
                ctx.lineTo(rowHeaderWidth + 0.5, headerHeight);
                // Horizontal divider between column headers and rows
                ctx.moveTo(0, headerHeight + 0.5);
                ctx.lineTo(rowHeaderWidth, headerHeight + 0.5);
                ctx.stroke();

                // Calculate if all rows are selected (like Teable)
                const pureRowCount = coordinateManager.pureRowCount;
                // Only show "Select All" checkbox if there are rows to select
                const hasRows = pureRowCount > 0;
                const allRowsRange: IRange[] = [[0, pureRowCount - 1]];
                const isAllRowsSelected =
                        hasRows &&
                        selection.isRowSelection &&
                        selection.equals(allRowsRange);

                // Draw "Select All" checkbox in top-left corner (only if rows exist)
                if (hasRows) {
                        drawGridHeader(
                                ctx,
                                theme,
                                headerHeight,
                                isAllRowsSelected,
                                true, // isMultiSelectionEnable
                        );
                }

                // Draw column headers FIRST (so they stay on top)
                // OPTIMIZATION: Pass cached freeze properties
                drawColumnHeaders(
                        ctx,
                        columns,
                        theme,
                        headerHeight,
                        freezeProps,
                        hasGrouping ? groupCollection : null,
                );

                // Full-row hover: when pointer is over a cell, highlight entire row (like Bootstrap table hover)
                const hoveredLinearRowIndex =
                        mouseState &&
                        !mouseState.isOutOfBounds &&
                        !isSelecting &&
                        mouseState.type === RegionType.Cell
                                ? mouseState.rowIndex
                                : null;

                // Draw row headers SECOND (so they stay on top of cells but below column headers)
                if (visibleIndices.rows.length > 0) {
                        drawRowHeaders(
                                ctx,
                                rowHeaders,
                                visibleIndices,
                                theme,
                                // Pass grouping-related props (dynamic based on hasGrouping)
                                hasGrouping ? linearRows : undefined,
                                hasGrouping ? groupTransformationResult : undefined,
                                hasGrouping ? groupCollection : undefined, // Pass groupCollection
                                // Checkbox rendering props
                                selection,
                                mouseState,
                                true, // isMultiSelectionEnable
                                isSelecting, // Pass selection drag state (like Teable)
                                logicalMaxY, // CRITICAL: Pass logical maxY for zoom-aware clipping
                                hoveredLinearRowIndex, // Full-row hover: highlight row header when hovering any cell in row
                        );
                }

                // Draw visible cells THIRD (clipped to not overlap headers)
                // Group rows are now drawn per column inside drawVisibleCells (like Teable)
                // Phase 2: Pass selection and activeCell
                // Phase 1: Pass groupTransformationResult for record access
                drawVisibleCells(
                        ctx,
                        records,
                        columns,
                        visibleIndices,
                        headerHeight,
                        theme,
                        selection, // CombinedSelection instance
                        activeCell, // Active cell state
                        hasGrouping ? groupTransformationResult : null, // Group transformation
                        hasGrouping ? groupCollection : null, // Group collection
                        regionSplit.frozenColumns, // OPTIMIZATION: Pre-split frozen columns
                        regionSplit.scrollableColumns, // OPTIMIZATION: Pre-split scrollable columns
                        freezeProps, // OPTIMIZATION: Cached freeze properties
                        cellLoading, // Cell loading state
                        logicalMaxY, // CRITICAL: Pass logical maxY for zoom-aware clipping
                        contentWidth, // CRITICAL: Pass logical contentWidth for append row width calculation
                        hoveredLinearRowIndex, // Full-row hover: highlight all cells in row when hovering any cell
                );

                // Draw grid lines
                // OPTIMIZATION: Pass pre-filtered scrollable columns and cached freeze properties
                drawGridLines(
                        ctx,
                        visibleIndices,
                        headerHeight,
                        theme,
                        regionSplit.scrollableColumns,
                        freezeProps,
                        logicalMaxY, // CRITICAL: Pass logical maxY for zoom-aware clipping
                );

                // OPTIMIZATION: Early exit - skip freeze-related rendering when no frozen columns
                if (freezeProps.freezeColumnCount > 0) {
                        // Draw freeze region divider (like Teable)
                        // CRITICAL: Convert containerHeight to logical space for zoom-aware rendering
                        const zoomScale = zoomLevel / 100;
                        const logicalContainerHeight = containerSize.height / zoomScale;
                        drawFreezeRegionDivider(ctx, theme, logicalContainerHeight);

                        // Draw freeze handler (like Teable)
                        drawColumnFreezeHandler(ctx, theme, logicalContainerHeight);

                        // Airtable-style shadow at frozen boundary when scrolled horizontally
                        if (
                                scrollState.scrollLeft > 0 &&
                                freezeProps.freezeRegionWidth > 0
                        ) {
                                const shadowWidth = 8;
                                const shadowX = freezeProps.freezeRegionWidth;
                                const shadowHeight = logicalMaxY;
                                const gradient = ctx.createLinearGradient(
                                        shadowX,
                                        0,
                                        shadowX + shadowWidth,
                                        0,
                                );
                                gradient.addColorStop(0, "rgba(0,0,0,0.15)");
                                gradient.addColorStop(1, "rgba(0,0,0,0)");
                                ctx.fillStyle = gradient;
                                ctx.fillRect(shadowX, 0, shadowWidth, shadowHeight);
                        }
                }

                if (canAppendColumn) {
                        drawAppendColumn({
                                ctx,
                                theme,
                                coordInstance: coordinateManager,
                                scrollState,
                                mouseState,
                                appendColumnWidth,
                                containerHeight: containerSize.height,
                                headerHeight,
                                contentWidth,
                        });
                }

                // ========================================
                // PHASE 1 ADDITION: Draw footer region (like Teable)
                // Footer should NOT be zoomed - draw at 1:1 scale
                // ========================================
                // Save current transform (with zoom)
                ctx.save();
                // Reset transform to 1:1 scale (devicePixelRatio only) for footer
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
                // Draw footer at normal scale
                drawFooterRegion(ctx, {
                        containerWidth: containerSize.width,
                        footerY: footerY,
                        theme,
                        recordCount: records.length,
                        selectedRecordCount: selectedRecordCount,
                        rowHeaderWidth: rowHeaderWidth,
                        columnStatistics,
                        columns,
                        visibleColumnIndices: visibleIndices.columns,
                        coordinateManager,
                        scrollState,
                        columnStatisticConfig,
                        groupCount: groupCount,
                        hasGrouping: hasGrouping,
                        freezeColumnCount: freezeProps.freezeColumnCount,
                        freezeRegionWidth: freezeProps.freezeRegionWidth,
                        hoveredFooterColumnIndex,
                });
                // Restore zoomed transform
                ctx.restore();

                // Draw resize handles AFTER everything else
                drawResizeHandles(ctx);

                // Draw active cell LAST - Inspired by Teable's approach
                // This ensures the active cell border is always on top
                drawActiveCell(ctx, logicalMaxY);
        }, [
                containerSize,
                columns,
                records,
                visibleIndices,
                scrollState.scrollTop, // Add scrollTop dependency so canvas re-renders on scroll
                scrollState.scrollLeft, // Add scrollLeft dependency so canvas re-renders on horizontal scroll
                coordinateManager,
                rowHeight,
                headerHeight,
                theme,
                columnResizeState,
                hoveredColumnResizeIndex,
                footerY,
                getColumnWidth, // Add getColumnWidth dependency so cells update during resize
                columnWidthMap, // Add columnWidthMap so CoordinateManager updates during resize
                devicePixelRatio,
                activeCell,
                getRowHeight,
                getColumnWidth,
                getRowOffset,
                rowHeaderWidth,
                // Grouping dependencies - Add groupPoints directly to force redraw when it changes
                groupPoints, // Force redraw when groupPoints changes (even if transformation result reference is same)
                hasGrouping,
                groupTransformationResult,
                groupCollection,
                linearRows,
                rowHeaders,
                showRowNumbers,
                // Remove forceUpdate from dependencies to prevent re-render on editor change
                // The editor uses local state and only triggers re-render on save
                computeShouldRerender, // Add computeShouldRerender to dependencies
                selection, // Add selection to dependencies (used in renderGrid)
                mouseState, // Add mouseState to dependencies so dropdown icon appears on hover
                cellLoading, // Add cellLoading to dependencies so grid re-renders when loading state changes
                zoomLevel, // Add zoomLevel to dependencies so canvas re-renders when zoom changes
                columnStatistics, // Add columnStatistics to dependencies so footer updates when data changes
                columnStatisticConfig, // Add columnStatisticConfig to dependencies so footer updates when statistic selection changes
                groupCount, // Add groupCount to dependencies so footer updates when grouping changes
                // Task 3: Add footer dependencies
                columnStatistics,
                columnStatisticConfig,
                freezeProps.freezeColumnCount,
                freezeProps.freezeRegionWidth,
                selectedRecordCount, // Add selectedRecordCount dependency
                hoveredFooterColumnIndex, // Footer hover for statistic cell highlight + cursor
        ]);

        // Draw "Select All" checkbox in top-left corner - Inspired by Teable's drawGridHeader
        const drawGridHeader = (
                ctx: CanvasRenderingContext2D,
                theme: IGridTheme,
                headerHeight: number,
                isAllRowsSelected: boolean,
                isMultiSelectionEnable: boolean,
        ) => {
                if (!isMultiSelectionEnable) return;

                const iconSizeXS = theme.iconSizeXS || 16;
                const halfSize = iconSizeXS / 2;

                // Draw checkbox centered in top-left corner (rowHeaderWidth x headerHeight)
                drawCheckbox(ctx, {
                        x: rowHeaderWidth / 2 - halfSize + 0.5,
                        y: headerHeight / 2 - halfSize + 0.5,
                        size: iconSizeXS,
                        stroke: isAllRowsSelected
                                ? theme.staticWhite || "#ffffff"
                                : theme.rowHeaderTextColor || theme.cellTextColor,
                        fill: isAllRowsSelected
                                ? theme.iconBgSelected || "#1976d2"
                                : undefined,
                        isChecked: isAllRowsSelected,
                });
        };

        // Draw column headers
        // Column headers scroll horizontally (like cells, unlike row headers which are fixed)
        // Like Teable: Split into frozen and scrollable regions
        const drawColumnHeaders = (
                ctx: CanvasRenderingContext2D,
                columns: IColumn[],
                theme: IGridTheme,
                headerHeight: number,
                freezeProps?: { freezeColumnCount: number; freezeRegionWidth: number }, // OPTIMIZATION: Cached freeze properties
                groupCollection?: any, // Phase 1: Group collection to identify grouped columns
        ) => {
                // OPTIMIZATION: Use cached freeze properties if provided, otherwise fallback to coordinateManager
                let freezeColumnCount =
                        freezeProps?.freezeColumnCount ??
                        coordinateManager.freezeColumnCount;
                // Safety: Ensure freezeColumnCount doesn't exceed available columns
                freezeColumnCount = Math.min(freezeColumnCount, columns.length);
                const freezeRegionWidth =
                        freezeProps?.freezeRegionWidth ??
                        coordinateManager.freezeRegionWidth;
                const { isColumnSelection } = selection;

                // Render frozen column headers (like Teable's drawColumnHeaders with RenderRegion.Freeze)
                if (freezeColumnCount > 0 && freezeRegionWidth > 0) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(
                                0, // Start at x=0 (includes row header)
                                0,
                                freezeRegionWidth + 1, // Width including freeze region
                                headerHeight + 1, // Height including 1px buffer
                        );
                        ctx.clip();

                        // Draw background for frozen header area
                        ctx.fillStyle = theme.cellBackgroundColor;
                        ctx.fillRect(0, 0, freezeRegionWidth, headerHeight);

                        // Draw frozen column headers
                        for (let index = 0; index < freezeColumnCount; index++) {
                                const column = columns[index];

                                // Safety check: Skip if column doesn't exist
                                if (!column) {
                                        continue;
                                }

                                const columnWidth = getColumnWidth(index);
                                const x = coordinateManager.getColumnRelativeOffset(
                                        index,
                                        scrollState.scrollLeft,
                                );

                                // Skip if column header is outside visible area
                                if (x < 0 || x > freezeRegionWidth) {
                                        continue;
                                }

                                const isColumnActive =
                                        isColumnSelection && selection.includes([index, index]);
                                const isHovered =
                                        (mouseState.type === RegionType.ColumnHeader ||
                                                mouseState.type === RegionType.ColumnHeaderDropdown) &&
                                        mouseState.columnIndex === index;

                                // Check if this column is a grouped column (Airtable-style subtle background)
                                const isGroupedColumn =
                                        groupCollection?.groupColumns?.some((groupCol: any) => {
                                                // Match by multiple methods to handle different ID formats
                                                const colId = column.id;
                                                const colRawId = (column as any).rawId;
                                                const colDbFieldName =
                                                        (column as any).dbFieldName || colId;

                                                const groupColId =
                                                        typeof groupCol.id === "string"
                                                                ? Number(groupCol.id)
                                                                : groupCol.id;
                                                const groupColDbFieldName = groupCol.dbFieldName;

                                                // Match by rawId (most reliable - actual field ID)
                                                if (colRawId && groupColId === colRawId) return true;

                                                // Match by column.id (if it's a number matching groupCol.id)
                                                const colIdNum =
                                                        typeof colId === "string" ? Number(colId) : colId;
                                                if (colIdNum && groupColId === colIdNum) return true;

                                                // Match by dbFieldName (if column.id is dbFieldName string)
                                                if (
                                                        groupColDbFieldName &&
                                                        (colDbFieldName === groupColDbFieldName ||
                                                                colId === groupColDbFieldName)
                                                )
                                                        return true;

                                                return false;
                                        }) ?? false;

                                // Check if this column is sorted or filtered
                                const colRawIdStr = String((column as any).rawId ?? column.id);
                                const isSortedColumn = sortedFieldIds.includes(colRawIdStr);
                                const isFilteredColumn = filteredFieldIds.includes(colRawIdStr);

                                // Determine header background color (Priority: Selected > Hovered > Sorted > Filtered > Grouped > Default)
                                let headerFill = theme.cellBackgroundColor;
                                if (isColumnActive) {
                                        headerFill = theme.cellSelectedColor;
                                } else if (isHovered) {
                                        headerFill =
                                                theme.columnHeaderBgHovered ||
                                                theme.cellHoverColor ||
                                                "#f5f5f5";
                                } else if (isSortedColumn) {
                                        // Sorted column background
                                        headerFill = theme.sortColumnBg ?? "#fefce8";
                                } else if (isFilteredColumn) {
                                        // Filtered column background
                                        headerFill = theme.filterColumnBg ?? "#eff6ff";
                                } else if (isGroupedColumn) {
                                        // Airtable-style subtle background for grouped columns
                                        headerFill = GROUP_COLUMN_BG;
                                }

                                drawRect(ctx, {
                                        x,
                                        y: 0,
                                        width: columnWidth,
                                        height: headerHeight,
                                        fill: headerFill,
                                        stroke: theme.cellBorderColor,
                                });

                                // Draw column header icon
                                const iconSize = theme.iconSizeSM ?? 20;
                                const iconPadding = theme.cellHorizontalPadding ?? 8;
                                const iconSpacing = 8;
                                const iconX = x + iconPadding;
                                const iconY = (headerHeight - iconSize) / 2;
                                const iconUrl = getColumnHeaderIconUrl(column.type);
                                const iconImage = getColumnHeaderIcon(iconUrl);

                                if (iconImage && iconImage.complete) {
                                        ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);
                                } else {
                                        ctx.save();
                                        ctx.fillStyle = theme.cellBorderColor || "#e0e0e0";
                                        ctx.globalAlpha = 0.3;
                                        ctx.fillRect(iconX, iconY, iconSize, iconSize);
                                        ctx.strokeStyle = theme.cellBorderColor || "#e0e0e0";
                                        ctx.lineWidth = 1;
                                        ctx.globalAlpha = 0.5;
                                        ctx.strokeRect(iconX, iconY, iconSize, iconSize);
                                        ctx.restore();
                                }

                                // Draw header text
                                ctx.fillStyle = theme.cellTextColor;
                                ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
                                ctx.textAlign = "left";
                                ctx.textBaseline = "middle";
                                const textX = iconX + iconSize + iconSpacing;
                                const textY = headerHeight / 2;
                                ctx.fillText(column.name, textX, textY);

                                // Draw error icon for formula fields with errors (like sheets repo)
                                const extendedColumn = column as any;
                                if (
                                        extendedColumn.computedFieldMeta?.hasError &&
                                        extendedColumn.rawType === "FORMULA"
                                ) {
                                        const warningIconSize = 16;
                                        const warningIconX =
                                                textX + ctx.measureText(column.name).width + 8; // 8px gap after text
                                        const warningIconY = (headerHeight - warningIconSize) / 2;

                                        // Get warning icon (cached/preloaded)
                                        const warningIconImg = getWarningIcon();
                                        if (warningIconImg && warningIconImg.complete) {
                                                ctx.drawImage(
                                                        warningIconImg,
                                                        warningIconX,
                                                        warningIconY,
                                                        warningIconSize,
                                                        warningIconSize,
                                                );
                                        }
                                }

                                // Draw dropdown chevron
                                const dropdownIconSize = 16;
                                const dropdownPadding = theme.cellHorizontalPadding ?? 8;
                                const dropdownX =
                                        x + columnWidth - dropdownPadding - dropdownIconSize;
                                const dropdownY = (headerHeight - dropdownIconSize) / 2;
                                const chevronIcon = getChevronDownIcon();

                                if (chevronIcon && chevronIcon.complete) {
                                        ctx.save();
                                        ctx.globalAlpha = isHovered ? 1.0 : 0.6;
                                        ctx.drawImage(
                                                chevronIcon,
                                                dropdownX,
                                                dropdownY,
                                                dropdownIconSize,
                                                dropdownIconSize,
                                        );
                                        ctx.restore();
                                } else {
                                        ctx.save();
                                        ctx.strokeStyle = theme.cellTextColor;
                                        ctx.globalAlpha = isHovered ? 1.0 : 0.6;
                                        ctx.lineWidth = 1.5;
                                        ctx.lineCap = "round";
                                        ctx.lineJoin = "round";
                                        const centerX = dropdownX + dropdownIconSize / 2;
                                        const centerY = dropdownY + dropdownIconSize / 2;
                                        const size = dropdownIconSize * 0.4;
                                        ctx.beginPath();
                                        ctx.moveTo(centerX - size / 2, centerY - size / 3);
                                        ctx.lineTo(centerX, centerY + size / 3);
                                        ctx.lineTo(centerX + size / 2, centerY - size / 3);
                                        ctx.stroke();
                                        ctx.restore();
                                }
                        }

                        ctx.restore();
                }

                // Render scrollable column headers (like Teable's drawColumnHeaders with RenderRegion.Other)
                // CRITICAL: Calculate logical container width for zoom-aware clipping
                // At 50% zoom, logical width is 2x larger, allowing more column headers to be rendered
                const zoomScale = zoomLevel / 100;
                const logicalContainerWidth = containerSize.width / zoomScale;
                ctx.save();
                ctx.beginPath();
                ctx.rect(
                        freezeRegionWidth + 1, // Start after freeze region
                        0,
                        logicalContainerWidth - freezeRegionWidth, // CRITICAL: Use logical width for zoom-aware clipping
                        headerHeight + 1, // Height including 1px buffer
                );
                ctx.clip();

                // Draw background for scrollable header area
                // CRITICAL: Use logical width for background fill to cover all visible headers
                ctx.fillStyle = theme.cellBackgroundColor;
                ctx.fillRect(
                        freezeRegionWidth,
                        0,
                        logicalContainerWidth - freezeRegionWidth, // CRITICAL: Use logical width
                        headerHeight,
                );

                // Like Teable: Use getColumnRelativeOffset to position headers during horizontal scroll
                columns.forEach((column, index) => {
                        // Safety check: Skip if column doesn't exist
                        if (!column) {
                                return;
                        }

                        // Skip frozen columns
                        if (index < freezeColumnCount) {
                                return;
                        }
                        const columnWidth = getColumnWidth(index);
                        const x = coordinateManager.getColumnRelativeOffset(
                                index,
                                scrollState.scrollLeft,
                        );

                        // Skip if column header is outside visible area
                        // CRITICAL: x is in logical coordinates (from coordinateManager)
                        // So visibility check must use logical container width
                        if (x < rowHeaderWidth - columnWidth || x > logicalContainerWidth) {
                                return;
                        }

                        // Phase 2: Column Selection Support - Check if column is selected (like Teable)
                        const isColumnActive =
                                isColumnSelection && selection.includes([index, index]);
                        const isHovered =
                                (mouseState.type === RegionType.ColumnHeader ||
                                        mouseState.type === RegionType.ColumnHeaderDropdown) &&
                                mouseState.columnIndex === index;

                        // Check if this column is a grouped column (Airtable-style subtle background)
                        const isGroupedColumn =
                                groupCollection?.groupColumns?.some((groupCol: any) => {
                                        // Match by multiple methods to handle different ID formats
                                        const colId = column.id;
                                        const colRawId = (column as any).rawId;
                                        const colDbFieldName = (column as any).dbFieldName || colId;

                                        const groupColId =
                                                typeof groupCol.id === "string"
                                                        ? Number(groupCol.id)
                                                        : groupCol.id;
                                        const groupColDbFieldName = groupCol.dbFieldName;

                                        // Match by rawId (most reliable - actual field ID)
                                        if (colRawId && groupColId === colRawId) return true;

                                        // Match by column.id (if it's a number matching groupCol.id)
                                        const colIdNum =
                                                typeof colId === "string" ? Number(colId) : colId;
                                        if (colIdNum && groupColId === colIdNum) return true;

                                        // Match by dbFieldName (if column.id is dbFieldName string)
                                        if (
                                                groupColDbFieldName &&
                                                (colDbFieldName === groupColDbFieldName ||
                                                        colId === groupColDbFieldName)
                                        )
                                                return true;

                                        return false;
                                }) ?? false;

                        // Check if this column is sorted or filtered
                        const colRawIdStr = String((column as any).rawId ?? column.id);
                        const isSortedColumn = sortedFieldIds.includes(colRawIdStr);
                        const isFilteredColumn = filteredFieldIds.includes(colRawIdStr);

                        // Determine header background color (Priority: Selected > Hovered > Sorted > Filtered > Grouped > Default)
                        let headerFill = theme.cellBackgroundColor;
                        if (isColumnActive) {
                                headerFill = theme.cellSelectedColor; // Blue background for selected column header
                        } else if (isHovered) {
                                // Use hover color for better visual feedback
                                headerFill =
                                        theme.columnHeaderBgHovered ||
                                        theme.cellHoverColor ||
                                        "#f5f5f5";
                        } else if (isSortedColumn) {
                                // Sorted column background
                                headerFill = theme.sortColumnBg ?? "#fefce8";
                        } else if (isFilteredColumn) {
                                // Filtered column background
                                headerFill = theme.filterColumnBg ?? "#eff6ff";
                        } else if (isGroupedColumn) {
                                // Airtable-style subtle background for grouped columns
                                headerFill = GROUP_COLUMN_BG;
                        }

                        // Draw header background
                        drawRect(ctx, {
                                x,
                                y: 0,
                                width: columnWidth,
                                height: headerHeight,
                                fill: headerFill,
                                stroke: theme.cellBorderColor,
                        });

                        // Draw column header icon (leftmost side) - always visible
                        const iconSize = theme.iconSizeSM ?? 20;
                        const iconPadding = theme.cellHorizontalPadding ?? 8;
                        const iconSpacing = 8; // Spacing between icon and text
                        const iconX = x + iconPadding;
                        const iconY = (headerHeight - iconSize) / 2;

                        // Get icon URL and load icon
                        const iconUrl = getColumnHeaderIconUrl(column.type);
                        const iconImage = getColumnHeaderIcon(iconUrl);

                        // Draw icon if loaded, otherwise draw placeholder
                        if (iconImage && iconImage.complete) {
                                ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);
                        } else {
                                // Draw placeholder rectangle while icon loads - ensures icon area is always visible
                                ctx.save();
                                ctx.fillStyle = theme.cellBorderColor || "#e0e0e0";
                                ctx.globalAlpha = 0.3;
                                ctx.fillRect(iconX, iconY, iconSize, iconSize);
                                ctx.strokeStyle = theme.cellBorderColor || "#e0e0e0";
                                ctx.lineWidth = 1;
                                ctx.globalAlpha = 0.5;
                                ctx.strokeRect(iconX, iconY, iconSize, iconSize);
                                ctx.restore();
                        }

                        // Draw header text (positioned after icon)
                        ctx.fillStyle = theme.cellTextColor;
                        ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
                        ctx.textAlign = "left";
                        ctx.textBaseline = "middle";
                        const textX = iconX + iconSize + iconSpacing;
                        const textY = headerHeight / 2;
                        ctx.fillText(column.name, textX, textY);

                        // Draw error icon for formula fields with errors (like sheets repo)
                        const extendedColumn = column as any;
                        if (
                                extendedColumn.computedFieldMeta?.hasError &&
                                extendedColumn.rawType === "FORMULA"
                        ) {
                                const warningIconSize = 16;
                                const warningIconX =
                                        textX + ctx.measureText(column.name).width + 8; // 8px gap after text
                                const warningIconY = (headerHeight - warningIconSize) / 2;

                                // Get warning icon (cached/preloaded)
                                const warningIconImg = getWarningIcon();
                                if (warningIconImg && warningIconImg.complete) {
                                        ctx.drawImage(
                                                warningIconImg,
                                                warningIconX,
                                                warningIconY,
                                                warningIconSize,
                                                warningIconSize,
                                        );
                                }
                        }

                        // Draw dropdown chevron icon (always visible, but changes opacity/color on hover)
                        const dropdownIconSize = 16; // Slightly smaller than field type icon
                        const dropdownPadding = theme.cellHorizontalPadding ?? 8;
                        const dropdownX =
                                x + columnWidth - dropdownPadding - dropdownIconSize;
                        const dropdownY = (headerHeight - dropdownIconSize) / 2;

                        // Get chevron icon (will start loading if not cached)
                        const chevronIcon = getChevronDownIcon();

                        // Draw chevron icon if loaded
                        if (chevronIcon && chevronIcon.complete) {
                                // Apply opacity/color change on hover for better visual feedback
                                ctx.save();
                                if (isHovered) {
                                        ctx.globalAlpha = 1.0; // Fully opaque on hover
                                } else {
                                        ctx.globalAlpha = 0.6; // Slightly transparent when not hovered
                                }
                                ctx.drawImage(
                                        chevronIcon,
                                        dropdownX,
                                        dropdownY,
                                        dropdownIconSize,
                                        dropdownIconSize,
                                );
                                ctx.restore();
                        } else {
                                // Draw a simple chevron placeholder while icon loads
                                // Always visible but changes opacity on hover
                                ctx.save();
                                if (isHovered) {
                                        ctx.strokeStyle = theme.cellTextColor;
                                        ctx.globalAlpha = 1.0;
                                } else {
                                        ctx.strokeStyle = theme.cellTextColor;
                                        ctx.globalAlpha = 0.6;
                                }
                                ctx.lineWidth = 1.5;
                                ctx.lineCap = "round";
                                ctx.lineJoin = "round";
                                const centerX = dropdownX + dropdownIconSize / 2;
                                const centerY = dropdownY + dropdownIconSize / 2;
                                const size = dropdownIconSize * 0.4;
                                ctx.beginPath();
                                ctx.moveTo(centerX - size / 2, centerY - size / 3);
                                ctx.lineTo(centerX, centerY + size / 3);
                                ctx.lineTo(centerX + size / 2, centerY - size / 3);
                                ctx.stroke();
                                ctx.restore();
                        }
                });

                // Restore clipping region (like Teable)
                ctx.restore();
        };

        // Draw freeze region divider (like Teable's drawFreezeRegionDivider)
        // Reference: teable/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts (lines 1692-1729)
        const drawFreezeRegionDivider = (
                ctx: CanvasRenderingContext2D,
                theme: IGridTheme,
                containerHeight: number,
        ) => {
                const freezeColumnCount = coordinateManager.freezeColumnCount;
                if (freezeColumnCount === 0) return; // No divider if no frozen columns

                const freezeRegionWidth = coordinateManager.freezeRegionWidth;
                const interactionLineColorCommon =
                        theme.interactionLineColorCommon || "rgba(0, 0, 0, 0.2)";
                const scrollLeft = scrollState.scrollLeft;

                if (scrollLeft === 0) {
                        // Simple line when not scrolled
                        drawRect(ctx, {
                                x: freezeRegionWidth,
                                y: 0.5,
                                width: 1,
                                height: containerHeight,
                                fill: interactionLineColorCommon,
                        });
                } else {
                        // Shadow effect when scrolled (like Teable)
                        ctx.save();
                        ctx.beginPath();
                        ctx.shadowColor = interactionLineColorCommon;
                        ctx.shadowBlur = 5;
                        ctx.shadowOffsetX = 3;
                        ctx.strokeStyle = interactionLineColorCommon;
                        ctx.moveTo(freezeRegionWidth + 0.5, 0);
                        ctx.lineTo(freezeRegionWidth + 0.5, containerHeight);
                        ctx.stroke();
                        ctx.restore();
                }
        };

        // Draw column freeze handler (like Teable's drawColumnFreezeHandler)
        // Reference: teable/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts (lines 1632-1673)
        const drawColumnFreezeHandler = (
                ctx: CanvasRenderingContext2D,
                theme: IGridTheme,
                containerHeight: number,
        ) => {
                const { isFreezing, targetIndex } = columnFreezeState;
                const { type, x, y } = mouseState;
                const freezeColumnCount = coordinateManager.freezeColumnCount;

                if (type !== RegionType.ColumnFreezeHandler && !isFreezing) return;
                if (freezeColumnCount === 0 && !isFreezing) return; // Don't show handler if no frozen columns

                const { scrollLeft } = scrollState;
                const interactionLineColorHighlight =
                        theme.interactionLineColorHighlight || "#1890ff";
                const freezeRegionWidth = coordinateManager.freezeRegionWidth;
                const hoverX = isFreezing ? x : freezeRegionWidth;

                // Draw preview line at target column when dragging
                if (isFreezing) {
                        const targetX = coordinateManager.getColumnRelativeOffset(
                                targetIndex + 1,
                                scrollLeft,
                        );
                        drawRect(ctx, {
                                x: targetX - 1,
                                y: 0,
                                width: 2,
                                height: containerHeight,
                                fill: interactionLineColorHighlight,
                        });
                }

                // Draw handler rectangle at mouse Y position (when hovering) or at freeze line
                drawRect(ctx, {
                        x: hoverX - COLUMN_FREEZE_HANDLER_WIDTH / 2,
                        y: y - COLUMN_FREEZE_HANDLER_HEIGHT / 2,
                        width: COLUMN_FREEZE_HANDLER_WIDTH,
                        height: COLUMN_FREEZE_HANDLER_HEIGHT,
                        fill: interactionLineColorHighlight,
                        radius: 4,
                });

                // Draw vertical line at freeze boundary
                drawRect(ctx, {
                        x: hoverX - 1,
                        y: 0,
                        width: 2,
                        height: containerHeight,
                        fill: interactionLineColorHighlight,
                });
        };

        // Draw row headers - Inspired by Teable's drawRowHeader
        // Row headers are FIXED at x=0 and do NOT move with horizontal scroll (like Teable's frozen columns)
        const drawRowHeaders = (
                ctx: CanvasRenderingContext2D,
                rowHeaders: IRowHeader[],
                visibleIndices: { rows: number[] },
                theme: IGridTheme,
                // Phase 1: Optional grouping props
                linearRowsForHeaders?: ILinearRow[],
                groupTransformationForHeaders?: any,
                groupCollectionForHeaders?: any, // Phase 1: Group collection
                // Checkbox rendering props
                selection?: CombinedSelection,
                mouseState?: IMouseState,
                isMultiSelectionEnable?: boolean,
                isSelecting?: boolean, // ADD: Track selection drag state (like Teable)
                logicalMaxY?: number, // CRITICAL: Logical maxY for zoom-aware clipping (in logical coordinate space)
                hoveredLinearRowIndex?: number | null, // Full-row hover: highlight row header when hovering any cell in row
        ) => {
                // Debug: Log visible row indices for row headers (only first time)
                // Removed frequent logging to reduce console spam during scrolling
                // Like Teable: Clip row headers to fixed region (x: 0 to rowHeaderWidth)
                // This ensures they stay fixed during horizontal scroll
                // Clip to prevent drawing over column headers
                ctx.save();
                ctx.beginPath();
                // Add 1px buffer below header like Teable to prevent overlap
                // CRITICAL: Use logicalMaxY if provided (for zoom), otherwise fallback to physical container size
                const maxY = logicalMaxY ?? containerSize.height - FOOTER_HEIGHT;
                ctx.rect(
                        0,
                        headerHeight + 1, // Start 1px below column header
                        rowHeaderWidth,
                        maxY - headerHeight - 1, // CRITICAL: Use logical maxY for zoom-aware clipping
                );
                ctx.clip();

                visibleIndices.rows.forEach((linearIndex) => {
                        // Phase 1: Check if this is a group row - draw collapse/expand icon instead of row number
                        if (
                                linearRowsForHeaders &&
                                linearIndex >= 0 &&
                                linearIndex < linearRowsForHeaders.length
                        ) {
                                const linearRow = linearRowsForHeaders[linearIndex];
                                if (linearRow?.type === LinearRowType.Group) {
                                        // Draw group row header with collapse/expand icon
                                        const rowHeightForThisRow =
                                                groupTransformationForHeaders?.rowHeightMap?.[
                                                        linearIndex
                                                ] || GROUP_HEADER_HEIGHT;
                                        const y =
                                                coordinateManager.getRowOffset(linearIndex) -
                                                scrollState.scrollTop;
                                        // CRITICAL: Use logicalMaxY if provided (for zoom), otherwise fallback to physical container size
                                        const maxYForRow =
                                                logicalMaxY ?? containerSize.height - FOOTER_HEIGHT;
                                        const rowBottom = y + rowHeightForThisRow;

                                        if (rowBottom <= headerHeight || y >= maxYForRow) {
                                                return;
                                        }

                                        // Draw group row header using drawGroupRowHeader (like Teable)
                                        // NOTE: drawGroupRowHeader draws its own background, so we don't draw a separate one
                                        if (groupCollectionForHeaders) {
                                                const isCollapsedValue = linearRow.isCollapsed ?? false;
                                                drawGroupRowHeader({
                                                        ctx,
                                                        x: 0.5, // Like Teable: x: 0.5
                                                        y,
                                                        width: rowHeaderWidth,
                                                        height: rowHeightForThisRow,
                                                        linearRow: linearRow as IGroupLinearRow,
                                                        theme,
                                                        groupCollection: groupCollectionForHeaders,
                                                        depth: linearRow.depth ?? 0,
                                                        isCollapsed: isCollapsedValue,
                                                });
                                        } else {
                                                // Fallback: simple icon rendering with background
                                                const {
                                                        groupHeaderBgPrimary = "#f8fafc",
                                                        groupHeaderBgSecondary = "#f1f5f9",
                                                        groupHeaderBgTertiary = "#e2e8f0",
                                                        cellLineColor = theme.cellBorderColor,
                                                } = theme;
                                                const bgList = [
                                                        groupHeaderBgTertiary,
                                                        groupHeaderBgSecondary,
                                                        groupHeaderBgPrimary,
                                                ].slice(
                                                        -(
                                                                groupCollectionForHeaders?.groupColumns
                                                                        .length || 1
                                                        ),
                                                );
                                                const bgColor =
                                                        bgList[linearRow.depth ?? 0] ||
                                                        groupHeaderBgPrimary;

                                                drawRect(ctx, {
                                                        x: 0.5,
                                                        y,
                                                        width: rowHeaderWidth,
                                                        height: rowHeightForThisRow,
                                                        fill: bgColor,
                                                });
                                                drawRect(ctx, {
                                                        x: 0.5,
                                                        y,
                                                        width: rowHeaderWidth,
                                                        height: 1,
                                                        fill: cellLineColor,
                                                });

                                                // Airtable-style icon rendering (fallback when groupCollection not available)
                                                const iconSize = 16; // Airtable-style compact size
                                                const iconX =
                                                        GROUP_HEADER_PADDING.horizontal +
                                                        ((linearRow.depth ?? 0) - 1) * 20;
                                                const iconY =
                                                        y + rowHeightForThisRow / 2 - iconSize / 2;
                                                const iconColor = theme.rowHeaderTextColor || "#6b7280"; // Airtable-style medium gray
                                                drawChevronIcon(
                                                        ctx,
                                                        iconX,
                                                        iconY,
                                                        iconSize,
                                                        linearRow.isCollapsed ?? false,
                                                        iconColor,
                                                );
                                                ctx.restore();
                                        }
                                        return; // Skip normal row header rendering for group rows
                                }
                        }

                        // Normal row header rendering (for data rows only)
                        // CRITICAL FIX: Use realIndex to access rowHeaders, not linearIndex
                        // rowHeaders array is indexed by actual record index, not linearRows index
                        const realRowIndex =
                                linearRowsForHeaders &&
                                linearIndex < linearRowsForHeaders.length &&
                                linearRowsForHeaders[linearIndex]?.realIndex !== undefined
                                        ? (linearRowsForHeaders[linearIndex].realIndex ??
                                                linearIndex)
                                        : linearIndex;

                        const rowHeader = rowHeaders[realRowIndex];
                        if (!rowHeader) return;

                        const rowHeightForThisRow =
                                coordinateManager.getRowHeight(linearIndex);
                        const y =
                                coordinateManager.getRowOffset(linearIndex) -
                                scrollState.scrollTop;

                        // Skip if row header is outside visible area
                        // Since getRowOffset includes rowInitSize (headerHeight), y should be >= headerHeight for visible rows
                        // CRITICAL: Use logicalMaxY if provided (for zoom), otherwise fallback to physical container size
                        const maxYForRow =
                                logicalMaxY ?? containerSize.height - FOOTER_HEIGHT;
                        const rowBottom = y + rowHeightForThisRow;

                        // Debug logging removed - check console on first render to verify positioning

                        // Row is visible if any part overlaps with viewport (between headerHeight and maxY)
                        // Check: row starts above maxY AND row ends below headerHeight
                        if (rowBottom <= headerHeight || y >= maxYForRow) {
                                return;
                        }

                        // Check if row is selected
                        const isRowSelected =
                                selection &&
                                selection.isRowSelection &&
                                selection.includes([realRowIndex, realRowIndex]);

                        // Check if row is hovered (like Teable)
                        // Show checkbox when hovering over row header, row header checkbox, or any cell in this row (full-row hover)
                        // CRITICAL: Don't show hover effects during selection drag (!isSelecting) and when out of bounds
                        // Reference: teable/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts (line 257-261)
                        const isRowHovered =
                                mouseState &&
                                !mouseState.isOutOfBounds &&
                                !isSelecting &&
                                (((mouseState.type === RegionType.RowHeader ||
                                        mouseState.type === RegionType.RowHeaderCheckbox) &&
                                        mouseState.rowIndex === linearIndex) ||
                                        (hoveredLinearRowIndex !== null &&
                                                hoveredLinearRowIndex !== undefined &&
                                                hoveredLinearRowIndex === linearIndex));

                        // Determine if checkbox should be visible (like Teable)
                        // Show checkbox when: row is checked, row is hovered, or row number is not visible
                        const shouldShowCheckbox =
                                isMultiSelectionEnable &&
                                (isRowSelected || isRowHovered || !showRowNumbers);

                        // Draw row header background - ALWAYS at x=0 (fixed, no scrollLeft adjustment)
                        // Use selected color if row is selected (like Teable)
                        const headerFill = isRowSelected
                                ? theme.cellSelectedColor || theme.cellBackgroundColor
                                : isRowHovered
                                        ? theme.cellHoverColor || theme.cellBackgroundColor
                                        : theme.cellBackgroundColor;

                        drawRect(ctx, {
                                x: 0,
                                y: y,
                                width: rowHeaderWidth,
                                height: rowHeightForThisRow,
                                fill: headerFill,
                                stroke: theme.cellBorderColor,
                        });

                        // Draw checkbox if should be visible (like Teable)
                        if (shouldShowCheckbox) {
                                const iconSizeXS = theme.iconSizeXS || 16;
                                const rowHeadIconPaddingTop = theme.rowHeadIconPaddingTop || 8;
                                const halfSize = iconSizeXS / 2;
                                const checkboxX = rowHeaderWidth / 2 - halfSize;
                                const checkboxY = y + rowHeadIconPaddingTop;

                                drawCheckbox(ctx, {
                                        x: checkboxX,
                                        y: checkboxY,
                                        size: iconSizeXS,
                                        stroke: isRowSelected
                                                ? theme.staticWhite || "#ffffff"
                                                : theme.rowHeaderTextColor || theme.cellTextColor,
                                        fill: isRowSelected
                                                ? theme.iconBgSelected || "#1976d2"
                                                : undefined,
                                        isChecked: isRowSelected,
                                });
                        } else if (showRowNumbers) {
                                // Draw row number if enabled and checkbox is not visible
                                // Phase 1: Use realIndex for display if grouping is enabled
                                // For group headers (realIndex: -1), don't show row numbers
                                const linearRowForHeader = linearRowsForHeaders?.[linearIndex];
                                const isGroupRow =
                                        linearRowForHeader?.type === LinearRowType.Group;

                                let displayIndex: string;
                                if (isGroupRow) {
                                        // Don't show row number for group headers
                                        displayIndex = "";
                                } else if (
                                        linearRowsForHeaders &&
                                        linearIndex < linearRowsForHeaders.length &&
                                        linearRowForHeader?.realIndex !== undefined &&
                                        linearRowForHeader.realIndex >= 0
                                ) {
                                        // Use realIndex for actual records (realIndex >= 0)
                                        displayIndex = (
                                                linearRowForHeader.realIndex + 1
                                        ).toString();
                                } else {
                                        // Fallback to displayIndex or linearIndex
                                        displayIndex =
                                                rowHeader.displayIndex?.toString() ||
                                                (linearIndex + 1).toString();
                                }

                                ctx.fillStyle = theme.cellTextColor;
                                ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
                                ctx.textAlign = "center";
                                ctx.textBaseline = "middle";
                                ctx.fillText(
                                        displayIndex.toString(),
                                        rowHeaderWidth / 2,
                                        y + rowHeightForThisRow / 2,
                                );
                        }
                });

                ctx.restore(); // Restore clipping region
        };

        // Draw visible cells
        // Like Teable: Clip cells to scrollable region (excluding row header area)
        // Phase 2: Added selection parameter
        const drawVisibleCells = (
                ctx: CanvasRenderingContext2D,
                records: IRecord[],
                columns: IColumn[],
                visibleIndices: { rows: number[]; columns: number[] },
                headerHeight: number,
                theme: IGridTheme,
                selection: CombinedSelection, // Phase 2: Selection state
                activeCell: { row: number; col: number } | null, // Phase 2: Active cell state
                groupTransformationResult?: any, // Phase 1: Group transformation result
                groupCollection?: any, // Phase 1: Group collection
                frozenColumns?: number[], // OPTIMIZATION: Pre-split frozen columns
                scrollableColumns?: number[], // OPTIMIZATION: Pre-split scrollable columns
                freezeProps?: { freezeColumnCount: number; freezeRegionWidth: number }, // OPTIMIZATION: Cached freeze properties
                cellLoading?: Record<string, Record<string, boolean>>, // Loading state for cells
                logicalMaxY?: number, // CRITICAL: Logical maxY for zoom-aware clipping (in logical coordinate space)
                contentWidth?: number, // CRITICAL: Logical content width for append row (rowHeaderWidth + allColumnsWidth)
                hoveredLinearRowIndex?: number | null, // Full-row hover: highlight all cells in row when hovering any cell
        ) => {
                // Phase 2: Column Selection Support - Extract selection type for efficient column checking (like Teable)
                const { isColumnSelection } = selection;
                // Like Teable: Clip cells to scrollable region (rowHeaderWidth to containerWidth)
                // This ensures cells don't overlap with fixed row headers or column headers
                // CRITICAL: Use logicalMaxY if provided (for zoom), otherwise fallback to physical container size
                const maxY = logicalMaxY ?? containerSize.height - FOOTER_HEIGHT;
                const appendRowsToRender = new Set<number>();

                // OPTIMIZATION: Use cached freeze properties if provided, otherwise fallback to coordinateManager
                const freezeColumnCount =
                        freezeProps?.freezeColumnCount ??
                        coordinateManager.freezeColumnCount;
                const freezeRegionWidth =
                        freezeProps?.freezeRegionWidth ??
                        coordinateManager.freezeRegionWidth;

                // OPTIMIZATION: Use pre-split columns if provided, otherwise calculate (backward compatibility)
                const frozenCols =
                        frozenColumns ??
                        visibleIndices.columns.filter(
                                (colIndex) => colIndex < freezeColumnCount,
                        );
                const scrollableCols =
                        scrollableColumns ??
                        visibleIndices.columns.filter(
                                (colIndex) => colIndex >= freezeColumnCount,
                        );

                // Render frozen region (like Teable's drawCells with RenderRegion.Freeze)
                if (frozenCols.length > 0 && freezeRegionWidth > 0) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(
                                0, // Start at x=0 (includes row header)
                                headerHeight + 1, // Start 1px below header
                                freezeRegionWidth + 1, // Width including freeze region
                                maxY - headerHeight - 1, // Height excluding header and footer
                        );
                        ctx.clip();

                        // Note: Frozen column background is drawn earlier (before clipping) to ensure it covers gray background
                        // Render cells in frozen region
                        frozenCols.forEach((columnIndex) => {
                                const column = columns[columnIndex];
                                const columnWidth = getColumnWidth(columnIndex);
                                const x = coordinateManager.getColumnRelativeOffset(
                                        columnIndex,
                                        scrollState.scrollLeft,
                                );

                                visibleIndices.rows.forEach((linearIndex) => {
                                        // Phase 1: Check if this is a group row
                                        if (
                                                hasGrouping &&
                                                linearRows &&
                                                linearIndex >= 0 &&
                                                linearIndex < linearRows.length
                                        ) {
                                                const linearRow = linearRows[linearIndex];
                                                if (linearRow?.type === LinearRowType.Group) {
                                                        // Draw group row per column (like Teable line 201-235)
                                                        const rowOffset =
                                                                coordinateManager.getRowOffset(linearIndex);
                                                        const y = rowOffset - scrollState.scrollTop;
                                                        const rowHeightForThisRow =
                                                                groupTransformationResult?.rowHeightMap?.[
                                                                        linearIndex
                                                                ] || GROUP_HEADER_HEIGHT;

                                                        // Only draw if visible
                                                        if (
                                                                y + rowHeightForThisRow < headerHeight ||
                                                                y > maxY
                                                        ) {
                                                                return;
                                                        }

                                                        // Draw group row for this column (like Teable line 219-234)
                                                        if (groupCollection && groupTransformationResult) {
                                                                drawGroupRow({
                                                                        ctx,
                                                                        x: x + 0.5, // Like Teable: x + 0.5
                                                                        y,
                                                                        width: columnWidth,
                                                                        height: rowHeightForThisRow,
                                                                        linearRow: linearRow as IGroupLinearRow,
                                                                        groupCollection,
                                                                        theme,
                                                                        columnIndex,
                                                                        rowIndex: linearIndex, // Use linear index for group row rendering (not realIndex)
                                                                });
                                                        }
                                                        return; // Skip cell rendering for group rows
                                                }
                                        }

                                        // Phase 1: Get real record index from linearRow
                                        const linearRowForCell = linearRows?.[linearIndex];
                                        if (linearRowForCell?.type === LinearRowType.Append) {
                                                appendRowsToRender.add(linearIndex);
                                                return;
                                        }

                                        const realRowIndex =
                                                hasGrouping && linearRowForCell?.realIndex !== undefined
                                                        ? linearRowForCell.realIndex
                                                        : linearIndex;

                                        // CRITICAL: Validate realRowIndex before accessing records
                                        // realIndex must be >= 0 for actual records (group headers have -1, append rows might have -1)
                                        if (realRowIndex < 0 || realRowIndex >= records.length) {
                                                // Skip rendering for invalid indices (group headers, append rows, etc.)
                                                return;
                                        }

                                        const rowHeightForThisRow =
                                                coordinateManager.getRowHeight(linearIndex);
                                        const rowOffset =
                                                coordinateManager.getRowOffset(linearIndex);
                                        const y = rowOffset - scrollState.scrollTop;

                                        const record = records[realRowIndex];
                                        const cell = record?.cells[column.id];

                                        if (!cell) {
                                                return;
                                        }

                                        // Skip if cell is outside visible area
                                        // CRITICAL: maxY is already in logical space (from logicalMaxY parameter)
                                        // All coordinates (x, y) are in logical space due to canvas transform
                                        // CRITICAL: Allow cells to extend all the way to footer (maxY)
                                        // Skip only if cell is completely above header or completely below footer
                                        const cellBottom = y + rowHeightForThisRow;
                                        if (
                                                x < 0 ||
                                                x > freezeRegionWidth ||
                                                cellBottom <= headerHeight ||
                                                y > maxY // CRITICAL: Use > instead of >= to allow cells that touch maxY
                                        ) {
                                                return;
                                        }

                                        // Draw cell background
                                        const isActive =
                                                activeCell?.row === realRowIndex &&
                                                activeCell?.col === columnIndex;

                                        const isColumnActive =
                                                isColumnSelection &&
                                                selection.includes([columnIndex, columnIndex]);

                                        // FIX: Use realRowIndex for selection check (selection uses realIndex, not linearIndex)
                                        // This fixes the issue where selection appears at wrong cell after group header height changes
                                        const { isCellSelected, isRowSelected } =
                                                checkIfRowOrCellSelected(
                                                        selection,
                                                        realRowIndex, // Use realRowIndex instead of linearIndex
                                                        columnIndex,
                                                );

                                        // Check if this column is a grouped column (Airtable-style subtle background)
                                        const isGroupedColumn =
                                                groupCollection?.groupColumns?.some((groupCol: any) => {
                                                        // Match by multiple methods to handle different ID formats
                                                        const colId = column.id;
                                                        const colRawId = (column as any).rawId;
                                                        const colDbFieldName =
                                                                (column as any).dbFieldName || colId;

                                                        const groupColId =
                                                                typeof groupCol.id === "string"
                                                                        ? Number(groupCol.id)
                                                                        : groupCol.id;
                                                        const groupColDbFieldName = groupCol.dbFieldName;

                                                        // Match by rawId (most reliable - actual field ID)
                                                        if (colRawId && groupColId === colRawId)
                                                                return true;

                                                        // Match by column.id (if it's a number matching groupCol.id)
                                                        const colIdNum =
                                                                typeof colId === "string"
                                                                        ? Number(colId)
                                                                        : colId;
                                                        if (colIdNum && groupColId === colIdNum)
                                                                return true;

                                                        // Match by dbFieldName (if column.id is dbFieldName string)
                                                        if (
                                                                groupColDbFieldName &&
                                                                (colDbFieldName === groupColDbFieldName ||
                                                                        colId === groupColDbFieldName)
                                                        )
                                                                return true;

                                                        return false;
                                                }) ?? false;

                                        // Check if this column is sorted or filtered
                                        const colRawIdStr = String(
                                                (column as any).rawId ?? column.id,
                                        );
                                        const isSortedColumn = sortedFieldIds.includes(colRawIdStr);
                                        const isFilteredColumn =
                                                filteredFieldIds.includes(colRawIdStr);

                                        // Full-row hover: highlight entire row when hovering any cell (like Bootstrap table hover)
                                        const isRowHovered =
                                                hoveredLinearRowIndex !== null &&
                                                hoveredLinearRowIndex !== undefined &&
                                                linearIndex === hoveredLinearRowIndex;

                                        // Determine cell background color (Priority: Selected > Active > Sorted > Filtered > Grouped > Row hover > Default)
                                        let cellFill = theme.cellBackgroundColor;
                                        if (isCellSelected || isRowSelected || isColumnActive) {
                                                cellFill = theme.cellSelectedColor;
                                        } else if (isSortedColumn) {
                                                // Sorted column background
                                                cellFill = theme.sortColumnBg ?? "#fefce8";
                                        } else if (isFilteredColumn) {
                                                // Filtered column background
                                                cellFill = theme.filterColumnBg ?? "#eff6ff";
                                        } else if (isGroupedColumn) {
                                                // Airtable-style subtle background for cells in grouped columns
                                                cellFill = GROUP_COLUMN_BG;
                                        } else if (isRowHovered) {
                                                cellFill = theme.cellHoverColor;
                                        }

                                        drawRect(ctx, {
                                                x,
                                                y,
                                                width: columnWidth,
                                                height: rowHeightForThisRow,
                                                fill: cellFill,
                                                stroke: theme.cellBorderColor,
                                        });

                                        // Draw cell content
                                        const renderer = getCellRenderer(cell.type);
                                        const isSelected =
                                                isCellSelected || isRowSelected || isColumnActive;
                                        renderer.draw(cell as any, {
                                                cell: cell as any,
                                                rect: {
                                                        x: x + 0.5,
                                                        y: y + 0.5,
                                                        width: columnWidth,
                                                        height: rowHeightForThisRow,
                                                },
                                                theme,
                                                isActive: !!isActive,
                                                isHovered: isRowHovered,
                                                cellLoading,
                                                rowId: record.id,
                                                // Use rawId (actual field ID) instead of id (dbFieldName) for loading state matching
                                                fieldId: (column as any).rawId || column.id,
                                                isSelected,
                                                ctx,
                                                column: column as any,
                                        });
                                });
                        });

                        ctx.restore(); // Restore clipping region
                }

                // Render scrollable region (like Teable's drawCells with RenderRegion.Other)
                // Task 1: Fix clipping to start at freezeRegionWidth + 1 to prevent grid lines bleeding through
                if (scrollableCols.length > 0) {
                        ctx.save();
                        ctx.beginPath();
                        // CRITICAL: Calculate logical container width for zoom-aware clipping
                        // At 50% zoom, logical width is 2x larger, allowing more columns to be rendered
                        const zoomScale = zoomLevel / 100;
                        const logicalContainerWidth = containerSize.width / zoomScale;
                        ctx.rect(
                                freezeRegionWidth + 1, // Start after freeze region
                                headerHeight + 1, // Start 1px below header
                                logicalContainerWidth - freezeRegionWidth, // CRITICAL: Use logical width for zoom-aware clipping
                                maxY - headerHeight, // CRITICAL: Allow cells to extend all the way to footer (remove -1 to prevent gap)
                        );
                        ctx.clip();

                        // Debug logging removed from render loop to reduce console spam
                        // Check useEffect above for virtual scrolling stats when visible range changes

                        // Phase 1: Draw group rows per column (like Teable's calcCells)
                        // Iterate through columns first, then rows (like Teable line 182-313)
                        scrollableCols.forEach((columnIndex) => {
                                const column = columns[columnIndex];
                                const columnWidth = getColumnWidth(columnIndex);
                                const x = coordinateManager.getColumnRelativeOffset(
                                        columnIndex,
                                        scrollState.scrollLeft,
                                );

                                visibleIndices.rows.forEach((linearIndex) => {
                                        // Phase 1: Check if this is a group row
                                        if (
                                                hasGrouping &&
                                                linearRows &&
                                                linearIndex >= 0 &&
                                                linearIndex < linearRows.length
                                        ) {
                                                const linearRow = linearRows[linearIndex];
                                                if (linearRow?.type === LinearRowType.Group) {
                                                        // Draw group row per column (like Teable line 201-235)
                                                        const rowOffset =
                                                                coordinateManager.getRowOffset(linearIndex);
                                                        const y = rowOffset - scrollState.scrollTop;
                                                        const rowHeightForThisRow =
                                                                groupTransformationResult?.rowHeightMap?.[
                                                                        linearIndex
                                                                ] || GROUP_HEADER_HEIGHT;

                                                        // Only draw if visible
                                                        if (
                                                                y + rowHeightForThisRow < headerHeight ||
                                                                y > maxY
                                                        ) {
                                                                return;
                                                        }

                                                        // Draw group row for this column (like Teable line 219-234)
                                                        if (groupCollection && groupTransformationResult) {
                                                                drawGroupRow({
                                                                        ctx,
                                                                        x: x + 0.5, // Like Teable: x + 0.5
                                                                        y,
                                                                        width: columnWidth,
                                                                        height: rowHeightForThisRow,
                                                                        linearRow: linearRow as IGroupLinearRow,
                                                                        groupCollection,
                                                                        theme,
                                                                        columnIndex,
                                                                        rowIndex: linearIndex, // Use linear index for group row rendering (not realIndex)
                                                                });
                                                        }
                                                        return; // Skip cell rendering for group rows
                                                }
                                        }

                                        // Phase 1: Get real record index from linearRow
                                        // Note: linearRow was already checked above for group rows
                                        const linearRowForCell = linearRows?.[linearIndex];
                                        if (linearRowForCell?.type === LinearRowType.Append) {
                                                appendRowsToRender.add(linearIndex);
                                                return;
                                        }

                                        const realRowIndex =
                                                hasGrouping && linearRowForCell?.realIndex !== undefined
                                                        ? linearRowForCell.realIndex
                                                        : linearIndex;

                                        // CRITICAL: Validate realRowIndex before accessing records
                                        if (realRowIndex < 0 || realRowIndex >= records.length) {
                                                return; // Skip invalid indices (group headers, append rows, etc.)
                                        }

                                        const rowHeightForThisRow =
                                                coordinateManager.getRowHeight(linearIndex); // Use coordinateManager for merged rowHeightMap
                                        // Like Teable: Use coordinateManager.getRowOffset() - scrollTop
                                        const rowOffset =
                                                coordinateManager.getRowOffset(linearIndex);
                                        const y = rowOffset - scrollState.scrollTop;

                                        const record = records[realRowIndex]; // Phase 1: Use realRowIndex
                                        const cell = record?.cells[column?.id];

                                        if (!cell) {
                                                return;
                                        }

                                        // Skip if cell is outside visible area
                                        // CRITICAL: x and y are in logical coordinates (from coordinateManager)
                                        // maxY is in logical space (from logicalMaxY parameter)
                                        // So visibility checks must use logical container dimensions
                                        // CRITICAL: Allow cells to extend all the way to footer (maxY)
                                        // Skip only if cell is completely above header or completely below footer
                                        const cellBottom = y + rowHeightForThisRow;
                                        const zoomScale = zoomLevel / 100;
                                        const logicalContainerWidth =
                                                containerSize.width / zoomScale;
                                        if (
                                                x < rowHeaderWidth - columnWidth ||
                                                x > logicalContainerWidth || // CRITICAL: Use logical width for zoom-aware visibility check
                                                cellBottom <= headerHeight ||
                                                y > maxY // CRITICAL: Use > instead of >= to allow cells that touch maxY
                                        ) {
                                                return;
                                        }

                                        // Draw cell background
                                        // Phase 1: Fix activeCell comparison - activeCell.row is realIndex, not linearIndex
                                        // Compare realIndex with realIndex (like Teable)
                                        const isActive =
                                                activeCell?.row === realRowIndex &&
                                                activeCell?.col === columnIndex;

                                        // Phase 2: Column Selection Support - Check if column is selected (like Teable)
                                        // This is more efficient than checking in checkIfRowOrCellSelected for each cell
                                        const isColumnActive =
                                                isColumnSelection &&
                                                selection.includes([columnIndex, columnIndex]);

                                        // Phase 2: Check if cell is selected (row or cell selection)
                                        // FIX: Use realRowIndex for selection check (selection uses realIndex, not linearIndex)
                                        // This fixes the issue where selection appears at wrong cell after group header height changes
                                        const { isCellSelected, isRowSelected } =
                                                checkIfRowOrCellSelected(
                                                        selection,
                                                        realRowIndex, // Use realRowIndex instead of linearIndex
                                                        columnIndex,
                                                );

                                        // Check if this column is a grouped column (Airtable-style subtle background)
                                        const isGroupedColumn =
                                                groupCollection?.groupColumns?.some((groupCol: any) => {
                                                        // Match by multiple methods to handle different ID formats
                                                        const colId = column.id;
                                                        const colRawId = (column as any).rawId;
                                                        const colDbFieldName =
                                                                (column as any).dbFieldName || colId;

                                                        const groupColId =
                                                                typeof groupCol.id === "string"
                                                                        ? Number(groupCol.id)
                                                                        : groupCol.id;
                                                        const groupColDbFieldName = groupCol.dbFieldName;

                                                        // Match by rawId (most reliable - actual field ID)
                                                        if (colRawId && groupColId === colRawId)
                                                                return true;

                                                        // Match by column.id (if it's a number matching groupCol.id)
                                                        const colIdNum =
                                                                typeof colId === "string"
                                                                        ? Number(colId)
                                                                        : colId;
                                                        if (colIdNum && groupColId === colIdNum)
                                                                return true;

                                                        // Match by dbFieldName (if column.id is dbFieldName string)
                                                        if (
                                                                groupColDbFieldName &&
                                                                (colDbFieldName === groupColDbFieldName ||
                                                                        colId === groupColDbFieldName)
                                                        )
                                                                return true;

                                                        return false;
                                                }) ?? false;

                                        // Check if this column is sorted or filtered
                                        const colRawIdStr = String(
                                                (column as any).rawId ?? column.id,
                                        );
                                        const isSortedColumn = sortedFieldIds.includes(colRawIdStr);
                                        const isFilteredColumn =
                                                filteredFieldIds.includes(colRawIdStr);

                                        // Full-row hover: highlight entire row when hovering any cell (like Bootstrap table hover)
                                        const isRowHovered =
                                                hoveredLinearRowIndex !== null &&
                                                hoveredLinearRowIndex !== undefined &&
                                                linearIndex === hoveredLinearRowIndex;

                                        // Determine cell background color (Priority: Selected > Active > Sorted > Filtered > Grouped > Row hover > Default)
                                        // Like Teable: Check isCellSelected || isRowSelected || isColumnActive
                                        let cellFill = theme.cellBackgroundColor;
                                        if (isCellSelected || isRowSelected || isColumnActive) {
                                                cellFill = theme.cellSelectedColor; // Blue background for selected cells
                                        } else if (isSortedColumn) {
                                                // Sorted column background
                                                cellFill = theme.sortColumnBg ?? "#fefce8";
                                        } else if (isFilteredColumn) {
                                                // Filtered column background
                                                cellFill = theme.filterColumnBg ?? "#eff6ff";
                                        } else if (isGroupedColumn) {
                                                // Airtable-style subtle background for cells in grouped columns
                                                cellFill = GROUP_COLUMN_BG;
                                        } else if (isRowHovered) {
                                                cellFill = theme.cellHoverColor;
                                        }

                                        // Draw background for all cells (active cell will be redrawn on top)
                                        drawRect(ctx, {
                                                x,
                                                y,
                                                width: columnWidth,
                                                height: rowHeightForThisRow,
                                                fill: cellFill,
                                                stroke: theme.cellBorderColor,
                                        });

                                        // Draw cell content
                                        const renderer = getCellRenderer(cell.type);
                                        // Pass isSelected flag to renderer (includes column selection)
                                        const isSelected =
                                                isCellSelected || isRowSelected || isColumnActive;

                                        // Calculate hover position relative to cell (for Rating cells)
                                        let hoverCellPosition: [number, number] | undefined;
                                        if (
                                                cell.type === CellType.Rating &&
                                                mouseState.type === RegionType.Cell &&
                                                mouseState.rowIndex === linearIndex &&
                                                mouseState.columnIndex === columnIndex
                                        ) {
                                                // Calculate cell position on canvas (same as click handler)
                                                // Use getColumnRelativeOffset to match click handler calculation
                                                // getColumnRelativeOffset returns position relative to content area (excluding row header)
                                                // So we need to add rowHeaderWidth to get canvas-relative position
                                                // Apply same -60 offset as click handler for alignment
                                                const cellXOnCanvas =
                                                        coordinateManager.getColumnRelativeOffset(
                                                                columnIndex,
                                                                scrollState.scrollLeft,
                                                        ) +
                                                        rowHeaderWidth -
                                                        60;
                                                const cellYOnCanvas = rowOffset - scrollState.scrollTop;

                                                // Calculate relative position within cell
                                                // mouseState.x and mouseState.y are canvas-relative
                                                const relativeX = mouseState.x - cellXOnCanvas;
                                                const relativeY = mouseState.y - cellYOnCanvas;
                                                hoverCellPosition = [relativeX, relativeY];
                                        }

                                        renderer.draw(cell as any, {
                                                cell: cell as any,
                                                rect: {
                                                        x: x + 0.5, // Like Teable: x + 0.5
                                                        y: y + 0.5, // Like Teable: y + 0.5
                                                        width: columnWidth,
                                                        height: rowHeightForThisRow,
                                                },
                                                theme,
                                                isActive: !!isActive,
                                                isHovered: isRowHovered,
                                                cellLoading,
                                                rowId: record.id,
                                                // Use rawId (actual field ID) instead of id (dbFieldName) for loading state matching
                                                fieldId: (column as any).rawId || column.id,
                                                isSelected,
                                                ctx,
                                                hoverCellPosition,
                                                column: column as any,
                                        });
                                });
                        });

                        ctx.restore(); // Restore clipping region
                }

                appendRowsToRender.forEach((linearIndex) => {
                        const rowOffset = coordinateManager.getRowOffset(linearIndex);
                        const y = rowOffset - scrollState.scrollTop;
                        const rowHeightForAppend =
                                coordinateManager.getRowHeight(linearIndex) ?? appendRowHeight;

                        if (y + rowHeightForAppend <= headerHeight || y >= maxY) {
                                return;
                        }

                        // CRITICAL: Use logical contentWidth instead of physical containerSize.width
                        // At lower zoom levels, logical content width is larger, so append row should fill entire logical width
                        // Since canvas transform already applies zoom, using contentWidth (logical) will correctly fill the visible area
                        const appendRowWidth = contentWidth ?? containerSize.width;

                        drawAppendRow({
                                ctx,
                                x: 0,
                                y,
                                width: appendRowWidth,
                                height: rowHeightForAppend,
                                rowHeaderWidth,
                                theme,
                        });
                });
        };

        // Draw active cell separately on top - Inspired by Teable's approach
        // Phase 1: Fixed to match Teable's pattern (lines 584-691)
        const drawActiveCell = (
                ctx: CanvasRenderingContext2D,
                logicalMaxY?: number, // CRITICAL: Logical maxY for zoom-aware clipping (in logical coordinate space)
        ) => {
                if (!activeCell) return;

                // CRITICAL FIX: activeCell.row is realIndex (from useSelection.ts), NOT linearIndex
                // Like Teable line 602: activeRowIndex is realIndex
                const { row: realRowIndex, col: columnIndex } = activeCell;

                // Convert realIndex → linearIndex (like Teable line 613)
                const activeLinearRowIndex = real2RowIndex(realRowIndex);
                const linearRow = getLinearRow(activeLinearRowIndex);

                // Check if it's a group row (like Teable line 616)
                if (
                        columnIndex >= columns.length ||
                        linearRow?.type !== LinearRowType.Row
                ) {
                        return; // Don't draw active cell for group headers
                }

                // Check if active cell is visible
                if (
                        activeLinearRowIndex < 0 ||
                        columnIndex < 0 ||
                        columnIndex >= columns.length
                ) {
                        return;
                }

                // Check if real row index is valid
                if (realRowIndex < 0 || realRowIndex >= records.length) {
                        return;
                }

                // Check if active cell is in visible region (use converted linearIndex)
                const isInVisibleRegion =
                        visibleIndices.rows.includes(activeLinearRowIndex) &&
                        visibleIndices.columns.includes(columnIndex);

                if (!isInVisibleRegion) return;

                // Task 2: Check if active cell is in freeze region (like Teable line 618)
                const freezeColumnCount = coordinateManager.freezeColumnCount;
                const freezeRegionWidth = coordinateManager.freezeRegionWidth;
                const isFreezeRegion = columnIndex < freezeColumnCount;

                // Calculate cell position using CoordinateManager (like Teable)
                // Place active cell highlight exactly where cell is rendered
                const x = coordinateManager.getColumnRelativeOffset(
                        columnIndex,
                        scrollState.scrollLeft,
                );
                // Like Teable line 620: Use converted linearIndex for positioning
                const y =
                        coordinateManager.getRowOffset(activeLinearRowIndex) -
                        scrollState.scrollTop;
                // CRITICAL FIX: Use coordinateManager methods directly (like Teable)
                // This ensures active cell height/width updates immediately when rowHeight/columnWidth changes
                // coordinateManager is recreated via useMemo when rowHeight changes, so these are always current
                const columnWidth = coordinateManager.getColumnWidth(columnIndex);
                const rowHeightForThisRow =
                        coordinateManager.getRowHeight(activeLinearRowIndex);

                // Calculate active cell height using measure function (like Teable)
                // Teable uses measureResult.height (clamped display height) for active cell highlight
                // NOT totalHeight (full content height) - totalHeight is only for scrolling
                let activeCellHeight = rowHeightForThisRow;
                // Use realRowIndex for record access (already have it from activeCell.row)
                const record = records[realRowIndex];
                const column = columns[columnIndex];
                const cell = record?.cells[column.id];

                if (cell) {
                        const renderer = getCellRenderer(cell.type);
                        if (renderer && renderer.measure) {
                                // Create a temporary canvas context for measurement
                                const measureCanvas = document.createElement("canvas");
                                const measureCtx = measureCanvas.getContext("2d");
                                if (measureCtx) {
                                        measureCtx.font = `${theme.fontSize}px ${theme.fontFamily}`;
                                        const measureResult = renderer.measure(cell as any, {
                                                cell: cell as any,
                                                ctx: measureCtx,
                                                theme,
                                                width: columnWidth,
                                                height: rowHeightForThisRow,
                                                column: column as any,
                                        }) as {
                                                width: number;
                                                height: number;
                                                totalHeight?: number;
                                        };
                                        // FIX: Use measureResult.height (clamped display height) like Teable
                                        // height is the display height (clamped to maxRowCount), totalHeight is full content
                                        // For active cell highlight, we want the display height, not full content height
                                        // totalHeight is only used for scrolling logic (scrollEnable: totalHeight > height)
                                        activeCellHeight = measureResult.height;
                                }
                        }
                }

                // Task 2: Clip active cell to appropriate region (like Teable lines 625-631)
                // CRITICAL FIX: Prevent active cell from rendering outside its designated region
                // CRITICAL: Use logicalMaxY if provided (for zoom), otherwise fallback to physical container size
                const maxY = logicalMaxY ?? containerSize.height - FOOTER_HEIGHT;
                // CRITICAL: Calculate logical container width for zoom-aware horizontal clipping
                const zoomScale = zoomLevel / 100;
                const logicalContainerWidth = containerSize.width / zoomScale;
                ctx.save();
                ctx.beginPath();
                ctx.rect(
                        isFreezeRegion ? 0 : freezeRegionWidth, // Start at 0 for freeze, freezeRegionWidth for scrollable
                        headerHeight,
                        isFreezeRegion
                                ? freezeRegionWidth + 1
                                : logicalContainerWidth - freezeRegionWidth, // CRITICAL: Use logical width for zoom-aware clipping
                        maxY - headerHeight,
                );
                ctx.clip();

                // Draw active cell with special border and rounded corners (Teable style)
                // Use clamped height to stay within viewport (FIX ISSUE 1)
                drawRect(ctx, {
                        x: x,
                        y: y,
                        width: columnWidth,
                        height: activeCellHeight,
                        fill: theme.cellActiveColor || theme.cellBackgroundColor,
                        stroke: theme.cellActiveBorderColor,
                        radius: 2,
                });

                // Clip to active cell rect so content (MCQ/DropDown chips) cannot overflow into next column
                ctx.beginPath();
                ctx.rect(x, y, columnWidth, activeCellHeight);
                ctx.clip();

                // Draw cell content again for active cell (so it's on top of border)
                // Use clamped height to ensure content stays within bounds (FIX ISSUE 1)
                if (cell) {
                        const renderer = getCellRenderer(cell.type);
                        renderer.draw(cell as any, {
                                cell: cell as any,
                                rect: {
                                        x: x,
                                        y: y,
                                        width: columnWidth,
                                        height: activeCellHeight, // Use clamped height
                                },
                                theme,
                                isActive: true,
                                isHovered: false,
                                isSelected: false,
                                ctx,
                                cellLoading,
                                rowId: record.id,
                                // Use rawId (actual field ID) instead of id (dbFieldName) for loading state matching
                                fieldId: (column as any).rawId || column.id,
                                column: column as any,
                        });
                }

                ctx.restore();
        };

        // Draw grid lines
        const drawGridLines = (
                ctx: CanvasRenderingContext2D,
                visibleIndices: { rows: number[]; columns: number[] },
                headerHeight: number,
                theme: IGridTheme,
                scrollableColumns?: number[], // OPTIMIZATION: Pre-filtered scrollable columns
                freezeProps?: { freezeColumnCount: number; freezeRegionWidth: number }, // OPTIMIZATION: Cached freeze properties
                logicalMaxY?: number, // CRITICAL: Logical maxY for zoom-aware clipping (in logical coordinate space)
        ) => {
                ctx.strokeStyle = theme.cellBorderColor;
                ctx.lineWidth = 1;
                // CRITICAL: Use logicalMaxY if provided (for zoom), otherwise fallback to physical container size
                const maxY = logicalMaxY ?? containerSize.height - FOOTER_HEIGHT;
                // CRITICAL: Calculate logical container width for zoom-aware horizontal clipping
                const zoomScale = zoomLevel / 100;
                const logicalContainerWidth = containerSize.width / zoomScale;
                const dataEndX = Math.max(
                        rowHeaderWidth,
                        Math.min(
                                contentWidth - scrollState.scrollLeft,
                                logicalContainerWidth, // CRITICAL: Use logical width for zoom-aware clipping
                        ),
                );
                // const visibleDataWidth = Math.max(0, dataEndX - rowHeaderWidth);
                const contentEndY = Math.max(
                        headerHeight,
                        Math.min(
                                maxY,
                                coordinateManager.totalHeight - scrollState.scrollTop,
                        ),
                );
                const fillerHeaderColor = theme.columnHeaderBg ?? "#f1f3f5";
                const fillerBodyColor = "#f5f5f5";

                // Draw vertical lines for columns (in scrollable region only)
                // CRITICAL FIX: Only draw grid lines for scrollable columns, and clip to scrollable region
                // This prevents grid lines from frozen columns from bleeding through
                // OPTIMIZATION: Use cached freeze properties if provided
                const freezeColumnCount =
                        freezeProps?.freezeColumnCount ??
                        coordinateManager.freezeColumnCount;
                const freezeRegionWidth =
                        freezeProps?.freezeRegionWidth ??
                        coordinateManager.freezeRegionWidth;

                // OPTIMIZATION: Use pre-filtered scrollable columns if provided, otherwise filter (backward compatibility)
                const scrollableColumnIndices =
                        scrollableColumns ??
                        visibleIndices.columns.filter(
                                (colIndex) => colIndex >= freezeColumnCount,
                        );

                if (scrollableColumnIndices.length > 0) {
                        ctx.save();
                        ctx.beginPath();
                        // CRITICAL FIX: Clip to scrollable region starting at freezeRegionWidth + 1
                        // This prevents grid lines from appearing behind frozen columns
                        // CRITICAL: Use logical container width for zoom-aware clipping
                        ctx.rect(
                                freezeRegionWidth + 1, // Start 1px after freeze region (like Teable)
                                headerHeight + 1, // Start 1px below header to prevent overlap
                                logicalContainerWidth - freezeRegionWidth, // CRITICAL: Use logical width for zoom-aware clipping
                                maxY - headerHeight - 1, // Height excluding header and footer (already in logical space)
                        );
                        ctx.clip();

                        scrollableColumnIndices.forEach((colIndex) => {
                                const x = coordinateManager.getColumnRelativeOffset(
                                        colIndex,
                                        scrollState.scrollLeft,
                                );
                                ctx.beginPath();
                                // Start 1px below header to prevent overlap (like Teable)
                                ctx.moveTo(x, headerHeight + 1);
                                ctx.lineTo(x, maxY - 1); // Stop 1px before footer
                                ctx.stroke();
                        });

                        ctx.restore(); // Restore clipping region
                }

                ctx.restore(); // Restore clipping region

                // Draw vertical line for row header separator (FIXED at rowHeaderWidth, doesn't move with scroll)
                // Start 1px below header to prevent overlap with column header border
                ctx.beginPath();
                ctx.moveTo(rowHeaderWidth, headerHeight + 1);
                ctx.lineTo(rowHeaderWidth, containerSize.height - FOOTER_HEIGHT - 1);
                ctx.stroke();

                // Draw horizontal lines - CRITICAL FIX: Use coordinateManager.getRowOffset()
                // This ensures grid lines use the SAME source of truth as cell content
                // coordinateManager has the merged rowHeightMap with group headers at fixed 56px
                // Prevents misalignment when rowHeight changes (like Teable)
                // Like Teable: Horizontal lines span from row header (x=0) to container width
                // This creates clean separation between fixed row headers and scrollable content
                visibleIndices.rows.forEach((rowIndex) => {
                        // FIX: Use coordinateManager.getRowOffset() to ensure grid lines align with cells
                        // coordinateManager uses merged rowHeightMap which includes group headers at 56px
                        const rowOffset = coordinateManager.getRowOffset(rowIndex);
                        const y = rowOffset - scrollState.scrollTop;

                        // Skip lines that would overlap with column header (prevent overlap)
                        // Only draw lines that are below the header and above the footer
                        if (y <= headerHeight || y >= maxY) {
                                return;
                        }

                        ctx.beginPath();
                        ctx.moveTo(0, y); // Start at row header edge (x=0)
                        ctx.lineTo(dataEndX, y); // End at last column boundary
                        ctx.stroke();
                });

                // Fill background for area beyond last column to distinguish empty region
                // CRITICAL: Use logical container width for zoom-aware filler calculation
                if (dataEndX < logicalContainerWidth) {
                        const fillerWidth = logicalContainerWidth - dataEndX;
                        ctx.save();
                        ctx.fillStyle = fillerHeaderColor;
                        ctx.fillRect(dataEndX, 0, fillerWidth, headerHeight);
                        ctx.fillStyle = fillerBodyColor;
                        ctx.fillRect(
                                dataEndX,
                                headerHeight,
                                fillerWidth,
                                containerSize.height - headerHeight,
                        );
                        ctx.restore();
                }

                // Fill area below the last visible row when there are fewer records than viewport height
                // CRITICAL: Use logical container width for zoom-aware filler calculation
                if (contentEndY < maxY) {
                        ctx.save();
                        ctx.fillStyle = fillerBodyColor;
                        ctx.fillRect(
                                0,
                                contentEndY,
                                logicalContainerWidth, // CRITICAL: Use logical width for zoom-aware filling
                                maxY - contentEndY,
                        );
                        ctx.restore();
                }
        };

        // Draw resize handles - Inspired by Teable's drawColumnResizeHandler
        const drawResizeHandles = (ctx: CanvasRenderingContext2D) => {
                // Only draw if hovering over a resize handle or currently resizing
                if (!columnResizeState.isResizing && hoveredColumnResizeIndex === -1)
                        return;

                const isResizing = columnResizeState.isResizing;
                const columnIndex = isResizing
                        ? columnResizeState.columnIndex
                        : hoveredColumnResizeIndex;

                if (columnIndex < 0) return;

                // Calculate position of resize handle using coordinateManager (like Teable)
                // This ensures it aligns correctly with scrolling and uses updated column widths
                const columnWidth = getColumnWidth(columnIndex);
                const relativeX = coordinateManager.getColumnRelativeOffset(
                        columnIndex,
                        scrollState.scrollLeft,
                );
                const x = relativeX + columnWidth; // Position at right edge of column

                // Like Teable: Only draw resize handle if it's within or near viewport
                // This prevents drawing handles for columns that are completely off-screen
                // CRITICAL: All coordinates are in logical space (due to canvas transform)
                // So visibility check should use logical container width
                const handleWidth = 5; // RESIZE_HANDLE_WIDTH
                const handleHalfWidth = handleWidth / 2;
                const handleX = x - handleHalfWidth;

                // CRITICAL: Calculate logical container width for zoom-aware visibility check
                const zoomScale = zoomLevel / 100;
                const logicalContainerWidth = containerSize.width / zoomScale;

                // Check if handle is visible or within reasonable distance from viewport
                // All coordinates are in logical space, so compare with logical container width
                const isVisible =
                        handleX + handleWidth >= rowHeaderWidth - 10 && // 10px buffer from left edge (logical)
                        handleX <= logicalContainerWidth + 10; // 10px buffer from right edge (logical)

                if (!isVisible) return; // Skip drawing if handle is too far outside viewport

                // Draw the resize handle with better styling (like Teable)
                ctx.fillStyle = isResizing ? "#0056b3" : "#007acc"; // Darker when resizing
                ctx.fillRect(
                        handleX, // Center the handle
                        4, // Add some padding from top (like Teable's columnResizeHandlerPaddingTop)
                        handleWidth, // 5px wide
                        headerHeight - 8, // Add padding from bottom
                );

                // Add a subtle border for better visibility
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1;
                ctx.strokeRect(handleX, 4, handleWidth, headerHeight - 8);
        };

        // Helper function to convert mouse screen coordinates to canvas logical coordinates
        // Canvas is at full size, but drawing operations are scaled by zoom
        // Mouse coordinates are in screen space (1:1 with canvas element)
        // We need to convert to logical space (accounting for zoomed drawing operations)
        const convertMouseToCanvasCoords = useCallback(
                (screenX: number, screenY: number, zoomLevel: number) => {
                        const zoomScale = zoomLevel / 100;
                        // getBoundingClientRect() returns actual canvas size (no CSS transform)
                        // Mouse coordinates are in screen space, but drawing is zoomed
                        // Convert to logical canvas space (divide by zoom scale)
                        return {
                                x: screenX / zoomScale,
                                y: screenY / zoomScale,
                        };
                },
                [],
        );

        // Handle mouse events - Phase 2: Integrated with selection manager
        const handleMouseClick = useCallback(
                (event: React.MouseEvent<HTMLCanvasElement>) => {
                        // CRITICAL FIX: Prevent selection changes on right-click (like Teable)
                        // Right-click should only trigger context menu, not selection changes
                        // event.button: 0 = left, 1 = middle, 2 = right
                        if (event.button === 2) {
                                return;
                        }

                        const canvas = canvasRef.current;
                        if (!canvas) return;

                        const rect = canvas.getBoundingClientRect();
                        const screenX = event.clientX - rect.left;
                        const screenY = event.clientY - rect.top;
                        // Convert screen coordinates to canvas logical coordinates accounting for zoom
                        const { x, y } = convertMouseToCanvasCoords(
                                screenX,
                                screenY,
                                zoomLevel,
                        );

                        // Check if click is in footer area (statistics region)
                        // Use footerY from outer scope (line 1692)
                        if (y >= footerY && y <= containerSize.height) {
                                // Footer click - check which column was clicked
                                const contentX = x - rowHeaderWidth;
                                if (contentX >= 0) {
                                        const absoluteX = scrollState.scrollLeft + contentX;
                                        const colIndex =
                                                coordinateManager.getColumnStartIndex(absoluteX);

                                        if (colIndex >= 0 && colIndex < columns.length) {
                                                const column = columns[colIndex];

                                                // Only show menu for number columns
                                                if (column && column.type === CellType.Number) {
                                                        const columnX =
                                                                coordinateManager.getColumnRelativeOffset(
                                                                        colIndex,
                                                                        scrollState.scrollLeft,
                                                                );
                                                        const columnWidth =
                                                                coordinateManager.getColumnWidth(colIndex);

                                                        // Position menu at center of footer cell
                                                        const menuX = rect.left + columnX + columnWidth / 2;
                                                        const menuY =
                                                                rect.top + footerY + FOOTER_HEIGHT / 2;

                                                        // Open statistics menu
                                                        const { openStatisticsMenu } =
                                                                useStatisticsStore.getState();
                                                        openStatisticsMenu(column.id, {
                                                                x: menuX,
                                                                y: menuY,
                                                        });
                                                }
                                        }
                                }
                                return; // Don't process as cell click
                        }

                        // Check if click is in header area
                        if (y < headerHeight) {
                                // FIX: Skip selection click if we just finished a resize
                                // This prevents column from being re-selected after resize ends
                                if (justFinishedResizeRef.current) {
                                        // Reset the flag immediately
                                        justFinishedResizeRef.current = false;
                                        // Don't call onSelectionClick - this prevents column re-selection
                                        return;
                                }

                                // Header click - use detectRegion for header detection
                                // Phase 1: Pass getLinearRow for group row detection (like Teable)
                                const currentMouseState = detectRegion(
                                        x,
                                        y,
                                        columns,
                                        headerHeight,
                                        getColumnWidth,
                                        rowHeaderWidth,
                                        scrollState.scrollLeft,
                                        (coIndex: number, sLeft: number) =>
                                                coordinateManager.getColumnRelativeOffset(
                                                        coIndex,
                                                        sLeft,
                                                ),
                                        coordinateManager, // ADD: For accurate row detection with variable row heights
                                        scrollState.scrollTop, // ADD: For accurate row detection with variable row heights
                                        getLinearRow, // Phase 1: For group row detection
                                        appendColumnWidth,
                                        contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                                        true, // isMultiSelectionEnable
                                        coordinateManager.pureRowCount, // pureRowCount
                                        theme, // theme
                                        isColumnFreezable, // isColumnFreezable
                                );

                                // Phase 2C: Check for AppendColumn FIRST in header area
                                if (currentMouseState.type === RegionType.AppendColumn) {
                                        setActiveCell(null);
                                        setEditingCell(null);
                                        setFixedEditorPosition(null);
                                        setSelection(selection.reset());

                                        // Calculate popover position based on append column strip location
                                        // Same logic as AddColumnPopover used before
                                        const canvas = canvasRef.current;
                                        if (canvas && onColumnAppend) {
                                                const rect = canvas.getBoundingClientRect();
                                                // Calculate where the append column strip is positioned
                                                const appendX = contentWidth - scrollState.scrollLeft;

                                                // Position popover at the center of the append column strip (header area)
                                                const popoverX =
                                                        rect.left + appendX + appendColumnWidth / 2;
                                                const popoverY = rect.top + headerHeight / 2;

                                                // Call onColumnAppend callback with calculated position
                                                onColumnAppend({ x: popoverX, y: popoverY });
                                        }
                                        return; // Early return for AppendColumn
                                }

                                // Handle dropdown click - open context menu
                                if (
                                        currentMouseState.type === RegionType.ColumnHeaderDropdown
                                ) {
                                        // Open the same context menu as right-click
                                        handleHeaderContextMenu(
                                                event,
                                                { x: event.clientX, y: event.clientY },
                                                currentMouseState.columnIndex,
                                        );
                                        return; // Early return for dropdown click
                                }

                                // Phase 2: Delegate to selection manager for other header clicks
                                onSelectionClick(event, currentMouseState);
                                const contentX = x - rowHeaderWidth;
                                if (contentX >= 0) {
                                        const absoluteX = scrollState.scrollLeft + contentX;
                                        const colIndex =
                                                coordinateManager.getColumnStartIndex(absoluteX);
                                        if (colIndex >= 0 && colIndex < columns.length) {
                                                onCellClick?.(-1, colIndex);
                                        }
                                }
                                return;
                        }

                        // Task 4: Check if click is in footer area
                        // Use footerY from outer scope (line 1692)
                        if (y >= footerY && y <= footerY + FOOTER_HEIGHT) {
                                // Detect which column is hovered in footer area
                                let hoveredColumnIndex: number | null = null;

                                // Check if mouse is within horizontal bounds (after row header)
                                if (x >= rowHeaderWidth) {
                                        // Calculate which column is hovered using coordinate manager
                                        const contentX = x - rowHeaderWidth;
                                        const absoluteX = scrollState.scrollLeft + contentX;
                                        const columnIndex =
                                                coordinateManager.getColumnStartIndex(absoluteX);

                                        // Verify the column is valid and is a number type
                                        if (
                                                columnIndex >= 0 &&
                                                columnIndex < columns.length &&
                                                columns[columnIndex]?.type === CellType.Number
                                        ) {
                                                // Verify mouse is actually within the column's horizontal bounds
                                                const columnX =
                                                        coordinateManager.getColumnRelativeOffset(
                                                                columnIndex,
                                                                scrollState.scrollLeft,
                                                        );
                                                const columnWidth =
                                                        coordinateManager.getColumnWidth(columnIndex);

                                                if (
                                                        contentX >= columnX &&
                                                        contentX <= columnX + columnWidth
                                                ) {
                                                        hoveredColumnIndex = columnIndex;
                                                }
                                        }
                                }

                                // If a number column is clicked, open StatisticsMenu
                                if (hoveredColumnIndex !== null && hoveredColumnIndex >= 0) {
                                        const column = columns[hoveredColumnIndex];
                                        if (column && column.type === CellType.Number) {
                                                // Get canvas bounding rect
                                                const canvasRect = canvas.getBoundingClientRect();

                                                // Calculate column position
                                                const columnX =
                                                        coordinateManager.getColumnRelativeOffset(
                                                                hoveredColumnIndex,
                                                                scrollState.scrollLeft,
                                                        );
                                                const columnWidth =
                                                        coordinateManager.getColumnWidth(
                                                                hoveredColumnIndex,
                                                        );

                                                // Calculate menu position above the footer cell
                                                // X: Center of the column
                                                // Y: footerY - small offset (4px above footer)
                                                const menuX =
                                                        canvasRect.left + columnX + columnWidth / 2;
                                                const menuY = canvasRect.top + footerY - 4;

                                                // Open StatisticsMenu
                                                openStatisticsMenu(column.id, { x: menuX, y: menuY });
                                        }
                                }
                                return; // Early return for footer clicks
                        }

                        // Phase 1: Use region detection (like Teable's InteractionLayer)
                        // Reference: teable/packages/sdk/src/components/grid/InteractionLayer.tsx (lines 486-502)
                        const detectedMouseState = detectRegion(
                                x,
                                y,
                                columns,
                                headerHeight,
                                getColumnWidth,
                                rowHeaderWidth,
                                scrollState.scrollLeft,
                                (coIndex: number, sLeft: number) =>
                                        coordinateManager.getColumnRelativeOffset(coIndex, sLeft),
                                coordinateManager,
                                scrollState.scrollTop,
                                getLinearRow, // Phase 1: For group row detection
                                appendColumnWidth,
                                contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                                true, // isMultiSelectionEnable
                                coordinateManager.pureRowCount, // pureRowCount
                                theme, // theme
                        );

                        if (detectedMouseState.type === RegionType.AppendRow) {
                                setActiveCell(null);
                                setEditingCell(null);
                                setFixedEditorPosition(null);
                                setSelection(selection.reset());

                                // Extract groupBy field values if grouping is active
                                let groupByFieldValues:
                                        | { [fieldId: string]: unknown }
                                        | undefined;
                                if (
                                        hasGrouping &&
                                        activeGroupConfig &&
                                        linearRows &&
                                        linearRows.length > 0
                                ) {
                                        const appendRowIndex = detectedMouseState.rowIndex;
                                        const clickedRow = linearRows[appendRowIndex];

                                        // Traverse backwards to find the nearest group header
                                        for (let i = appendRowIndex - 1; i >= 0; i--) {
                                                const row = linearRows[i];
                                                if (row.type === LinearRowType.Group) {
                                                        const groupRow = row as IGroupLinearRow;
                                                        groupByFieldValues = extractGroupByFieldValues(
                                                                groupRow,
                                                                activeGroupConfig,
                                                                linearRows,
                                                                i,
                                                        );
                                                        break;
                                                }
                                        }
                                }

                                onRowAppend?.(records.length, groupByFieldValues);
                                return;
                        }

                        // Phase 1: Handle RowGroupControl clicks (like Teable's InteractionLayer)
                        // Reference: teable/packages/sdk/src/components/grid/InteractionLayer.tsx (lines 486-502)
                        // TOGGLE LOGIC HERE (like Teable) - handles in onClick, not mousedown
                        if (detectedMouseState.type === RegionType.RowGroupControl) {
                                const { rowIndex } = detectedMouseState;
                                const linearRow = getLinearRow(rowIndex);

                                if (linearRow?.type === LinearRowType.Group) {
                                        const { id } = linearRow;
                                        if (!id) return;

                                        let newCollapsedGroupIds: Set<string>;
                                        if (collapsedGroupIds == null) {
                                                newCollapsedGroupIds = new Set<string>([id]);
                                        } else if (collapsedGroupIds.has(id)) {
                                                newCollapsedGroupIds = new Set<string>(
                                                        collapsedGroupIds,
                                                );
                                                newCollapsedGroupIds.delete(id);
                                        } else {
                                                newCollapsedGroupIds = new Set<string>([
                                                        ...collapsedGroupIds,
                                                        id,
                                                ]);
                                        }

                                        onCollapsedGroupChanged?.(newCollapsedGroupIds);
                                        return;
                                }
                        }

                        // Phase 1: Handle RowGroupHeader clicks (prevent editor)
                        if (detectedMouseState.type === RegionType.RowGroupHeader) {
                                return;
                        }

                        const { rowIndex, columnIndex: colIndex } = detectedMouseState;

                        // Phase 2: Delegate to selection manager with correct indices
                        // NOTE: This is called AFTER RowGroupControl is handled (which returns early)
                        // Skip selection if click is out of bounds (e.g., empty space beside table)
                        if (!detectedMouseState.isOutOfBounds) {
                                onSelectionClick(event, detectedMouseState);
                        }

                        // Phase 1: Check if this is a group row - prevent editor from opening
                        if (
                                hasGrouping &&
                                linearRows &&
                                rowIndex >= 0 &&
                                rowIndex < linearRows.length
                        ) {
                                const linearRow = linearRows[rowIndex];
                                if (linearRow?.type === LinearRowType.Group) {
                                        return;
                                }
                        }

                        // Keep external callback for backward compatibility
                        // Convert linear index to real index for record access
                        const realRowIndex =
                                hasGrouping &&
                                linearRows &&
                                rowIndex >= 0 &&
                                rowIndex < linearRows.length
                                        ? (linearRows[rowIndex]?.realIndex ?? rowIndex)
                                        : rowIndex;

                        if (
                                realRowIndex >= 0 &&
                                realRowIndex < records.length &&
                                colIndex >= 0 &&
                                colIndex < columns.length
                        ) {
                                // Handle Rating cell clicks (interactive renderer - no editor)
                                const column = columns[colIndex];
                                const record = records[realRowIndex];
                                const cell = record?.cells[column.id];

                                if (cell?.type === CellType.Rating && onCellChange) {
                                        const ratingCell = cell as IRatingCell;
                                        const maxRating = ratingCell.options?.maxRating ?? 10;
                                        const iconSize =
                                                config.theme.iconSizeSM || config.theme.fontSize || 20;
                                        const gapSize = 3;
                                        const cellHorizontalPadding = 8;

                                        // Get cell position
                                        // x and y are mouse positions relative to canvas (from event.clientX - rect.left)
                                        // Calculate cell X position on canvas using the same method as in drawVisibleCells
                                        // This matches how the renderer calculates the cell position
                                        // getColumnRelativeOffset returns position relative to content area (excluding row header)
                                        // So we need to add rowHeaderWidth to get canvas-relative position
                                        const cellX =
                                                coordinateManager.getColumnRelativeOffset(
                                                        colIndex,
                                                        scrollState.scrollLeft,
                                                ) +
                                                rowHeaderWidth -
                                                67;

                                        // Calculate relative X position within cell
                                        // This should match how hoverCellPosition is calculated
                                        const relativeX = x - cellX;

                                        // Check if click is within rating area
                                        const minX = cellHorizontalPadding;
                                        const maxX = minX + maxRating * (iconSize + gapSize);

                                        if (relativeX >= minX && relativeX <= maxX) {
                                                // Calculate which icon was clicked
                                                // Formula: Math.ceil((relativeX - cellHorizontalPadding) / (iconSize + gapSize))
                                                // Using Math.ceil to match hover calculation and Teable's implementation
                                                const rating = Math.ceil(
                                                        (relativeX - cellHorizontalPadding) /
                                                                (iconSize + gapSize),
                                                );
                                                // Clamp to valid range (1 to maxRating)
                                                const clampedRating = Math.max(
                                                        1,
                                                        Math.min(rating, maxRating),
                                                );

                                                // Set rating to clicked value (like Teable - no toggle, just set)
                                                const newRating = clampedRating;

                                                // Create updated cell
                                                const updatedCell: IRatingCell = {
                                                        ...ratingCell,
                                                        data: newRating,
                                                        displayData: newRating
                                                                ? `${newRating}/${maxRating}`
                                                                : "",
                                                };

                                                // Update cell
                                                onCellChange(realRowIndex, colIndex, updatedCell);
                                                return; // Don't call onCellClick for Rating cells
                                        }
                                }

                                // Handle Enrichment cell clicks - perform enrichment on any click
                                if (cell?.type === CellType.Enrichment && onCellChange) {
                                        const enrichmentCell = cell as IEnrichmentCell;

                                        // Get rowId and fieldId
                                        // Use rawId (actual field ID) for loading state - matches what renderer receives
                                        const rowId = record.id;
                                        const fieldId = (column as any).rawId || column.id;

                                        // Validate required identifier fields
                                        const identifier =
                                                enrichmentCell.options?.config?.identifier || [];
                                        const missingRequiredCols: number[] = [];

                                        identifier.forEach((identity) => {
                                                columns.forEach((col, idx) => {
                                                        // Match by rawId (field ID) or id (dbFieldName) for compatibility
                                                        const columnFieldId = (col as any).rawId || col.id;
                                                        const matchesFieldId =
                                                                columnFieldId === identity.field_id;
                                                        const matchesDbFieldName =
                                                                col.id === identity.dbFieldName;

                                                        if (matchesFieldId || matchesDbFieldName) {
                                                                // Use col.id (dbFieldName) to get the cell value
                                                                const identifierCell = record.cells[col.id];
                                                                const identifierValue =
                                                                        identifierCell?.data ||
                                                                        identifierCell?.displayData ||
                                                                        "";

                                                                if (identity.required && !identifierValue) {
                                                                        missingRequiredCols.push(idx);
                                                                }
                                                        }
                                                });
                                        });

                                        if (missingRequiredCols.length > 0) {
                                                // Select first missing required column and highlight it
                                                const missingColIndex = missingRequiredCols[0];
                                                if (
                                                        missingColIndex >= 0 &&
                                                        missingColIndex < columns.length
                                                ) {
                                                        // Set active cell to highlight the missing field
                                                        setActiveCell({
                                                                row: realRowIndex,
                                                                col: missingColIndex,
                                                        });

                                                        // Scroll to the missing cell to ensure it's visible
                                                        // Use setTimeout to ensure activeCell state is updated first
                                                        setTimeout(() => {
                                                                scrollToCell?.(realRowIndex, missingColIndex);
                                                        }, 0);
                                                }

                                                setTimeout(() => {
                                                        showAlert({
                                                                type: "error",
                                                                message: "Missing inputs",
                                                        });
                                                }, 100);
                                                return;
                                        }

                                        // Set loading state
                                        setCellLoading((prev) => {
                                                const updated = { ...prev };
                                                if (!updated[rowId]) {
                                                        updated[rowId] = {};
                                                }
                                                updated[rowId][fieldId] = true;
                                                return updated;
                                        });

                                        // Call enrichment API after a short delay (like sheets)
                                        // Note: Loading state will be cleared when socket 'updated_row' event is received
                                        // On error, clear loading state immediately (socket event won't come)
                                        setTimeout(() => {
                                                if (rowId && fieldId) {
                                                        processEnrichment({ rowId, fieldId }, () => {
                                                                // Clear loading state on error (socket event won't come)
                                                                setCellLoading((prev) => {
                                                                        const updated = { ...prev };
                                                                        if (updated[rowId]) {
                                                                                delete updated[rowId][fieldId];
                                                                                // Clean up empty row objects
                                                                                if (
                                                                                        Object.keys(updated[rowId])
                                                                                                .length === 0
                                                                                ) {
                                                                                        delete updated[rowId];
                                                                                }
                                                                        }
                                                                        return updated;
                                                                });
                                                        });
                                                }
                                        }, 2000);

                                        return; // Don't call onCellClick for enrichment cell clicks
                                }

                                onCellClick?.(realRowIndex, colIndex);
                                // Clear editing cell on single click
                                if (
                                        editingCell &&
                                        (editingCell.row !== rowIndex ||
                                                editingCell.col !== colIndex)
                                ) {
                                        setEditingCell(null);
                                        setFixedEditorPosition(null); // OPTION B: Clear fixed position when editor closes
                                }
                        }
                },
                [
                        columns,
                        records,
                        headerHeight,
                        onCellClick,
                        onCellChange,
                        coordinateManager,
                        scrollState.scrollTop,
                        scrollState.scrollLeft,
                        rowHeaderWidth,
                        editingCell,
                        setEditingCell,
                        getColumnWidth,
                        getRowHeight,
                        config.theme,
                        onSelectionClick,
                        hasGrouping,
                        linearRows,
                        onCollapsedGroupChanged,
                        getLinearRow,
                        collapsedGroupIds,
                        setSelection,
                        selection,
                        setActiveCell,
                        onRowAppend,
                        setFixedEditorPosition,
                        setCellLoading, // Added for enrichment loading state
                        processEnrichment, // Added for enrichment API call
                        showAlert, // Added for error alerts
                        zoomLevel, // Added for zoom coordinate conversion
                        convertMouseToCanvasCoords, // Added for zoom coordinate conversion
                ],
        );

        // Add mouse event handlers for column resizing and selection - Phase 2
        const handleMouseMove = useCallback(
                (event: React.MouseEvent<HTMLCanvasElement>) => {
                        const canvas = canvasRef.current;
                        if (!canvas) return;

                        const rect = canvas.getBoundingClientRect();
                        const screenX = event.clientX - rect.left;
                        const screenY = event.clientY - rect.top;
                        // Convert screen coordinates to canvas logical coordinates accounting for zoom
                        const { x, y } = convertMouseToCanvasCoords(
                                screenX,
                                screenY,
                                zoomLevel,
                        );

                        // Footer hover: detect which number-column statistic cell is hovered
                        const footerY = containerSize.height - FOOTER_HEIGHT;
                        let footerColumnHovered: number | null = null;
                        if (y >= footerY && y < footerY + FOOTER_HEIGHT) {
                                const contentX = x - rowHeaderWidth;
                                if (contentX >= 0) {
                                        const absoluteX = scrollState.scrollLeft + contentX;
                                        const colIndex =
                                                coordinateManager.getColumnStartIndex(absoluteX);
                                        if (
                                                colIndex >= 0 &&
                                                colIndex < columns.length &&
                                                columns[colIndex]?.type === CellType.Number
                                        ) {
                                                const columnX =
                                                        coordinateManager.getColumnRelativeOffset(
                                                                colIndex,
                                                                scrollState.scrollLeft,
                                                        );
                                                const columnWidth =
                                                        coordinateManager.getColumnWidth(colIndex);
                                                if (
                                                        contentX >= columnX &&
                                                        contentX <= columnX + columnWidth
                                                ) {
                                                        footerColumnHovered = colIndex;
                                                }
                                        }
                                }
                        }
                        setHoveredFooterColumnIndex(footerColumnHovered);

                        // Phase 2 Fix: Use accurate detection for cells, detectRegion for headers
                        let mouseState: IMouseState;

                        if (y < headerHeight) {
                                // Header area - use detectRegion
                                // Phase 1: Pass getLinearRow for group row detection (like Teable)
                                mouseState = detectRegion(
                                        x,
                                        y,
                                        columns,
                                        headerHeight,
                                        getColumnWidth,
                                        rowHeaderWidth,
                                        scrollState.scrollLeft,
                                        (coIndex: number, sLeft: number) =>
                                                coordinateManager.getColumnRelativeOffset(
                                                        coIndex,
                                                        sLeft,
                                                ),
                                        coordinateManager, // ADD: For accurate row detection with variable row heights
                                        scrollState.scrollTop, // ADD: For accurate row detection with variable row heights
                                        getLinearRow, // Phase 1: For group row detection
                                        appendColumnWidth,
                                        contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                                        true, // isMultiSelectionEnable
                                        coordinateManager.pureRowCount, // pureRowCount
                                        theme, // theme
                                        isColumnFreezable, // isColumnFreezable
                                );
                        } else {
                                // Cell area - use detectRegion for accurate detection (including group rows)
                                // Phase 1: Use detectRegion with getLinearRow for group row detection (like Teable)
                                mouseState = detectRegion(
                                        x,
                                        y,
                                        columns,
                                        headerHeight,
                                        getColumnWidth,
                                        rowHeaderWidth,
                                        scrollState.scrollLeft,
                                        (coIndex: number, sLeft: number) =>
                                                coordinateManager.getColumnRelativeOffset(
                                                        coIndex,
                                                        sLeft,
                                                ),
                                        coordinateManager,
                                        scrollState.scrollTop,
                                        getLinearRow, // Phase 1: For group row detection
                                        appendColumnWidth,
                                        contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                                        true, // isMultiSelectionEnable
                                        coordinateManager.pureRowCount, // pureRowCount
                                        theme, // theme
                                        isColumnFreezable, // isColumnFreezable
                                );
                        }

                        // Phase 1: Only update mouseState if it actually changed (like Teable)
                        // Reference: teable/packages/sdk/src/components/grid/InteractionLayer.tsx (line 639: isEqual check)
                        // This prevents unnecessary state updates and re-renders on every mouse move
                        const lastMouseState = lastMouseStateRef.current;
                        const mouseStateChanged =
                                !lastMouseState ||
                                lastMouseState.type !== mouseState.type ||
                                lastMouseState.rowIndex !== mouseState.rowIndex ||
                                lastMouseState.columnIndex !== mouseState.columnIndex ||
                                lastMouseState.isOutOfBounds !== mouseState.isOutOfBounds;

                        if (mouseStateChanged) {
                                // LOG: Only log when region actually changes (not on every mouse move)
                                // This matches Teable's pattern - they check isEqual before calling onItemHovered
                                if (
                                        mouseState.type === RegionType.RowGroupControl ||
                                        mouseState.type === RegionType.RowGroupHeader
                                ) {
                                        // console.log(`🔍 [REGION] Detected ${mouseState.type}:`, {
                                        //      x: mouseState.x,
                                        //      y: mouseState.y,
                                        //      rowIndex: mouseState.rowIndex,
                                        //      columnIndex: mouseState.columnIndex,
                                        //      type: mouseState.type,
                                        // });
                                }

                                lastMouseStateRef.current = mouseState;
                                setMouseState(mouseState);
                        }

                        // Priority: Column freeze > Column resize > Column drag > Selection drag
                        // Note: Freeze dragging is primarily handled in global mouse move handler for better tracking
                        // But we also call it here for canvas-based tracking
                        if (columnFreezeState.isFreezing) {
                                onColumnFreezeMove(mouseState);
                                requestAnimationFrame(() => {
                                        setForceUpdate((prev) => prev + 1);
                                });
                        } else if (columnResizeState.isResizing) {
                                // Handle column resizing with requestAnimationFrame for smooth updates
                                onColumnResizeChange(mouseState, () => {
                                        requestAnimationFrame(() => {
                                                setForceUpdate((prev) => prev + 1);
                                        });
                                });
                        } else {
                                onColumnDragChange(mouseState);
                                if (columnDragState.isActive) {
                                        autoScrollForColumnDrag(mouseState);
                                }

                                if (isSelecting) {
                                        // Phase 2: Handle selection drag with accurate mouseState
                                        onSelectionChange(mouseState);
                                }
                        }

                        // Update cursor based on what we're hovering over
                        // FIX: Only set col-resize cursor when not actively resizing (hover state)
                        // When actively resizing, cursor is managed by browser during drag
                        // Phase 1: Add cursor for group control (like Teable)
                        if (columnFreezeState.isFreezing) {
                                canvas.style.cursor = "grab";
                        } else if (columnDragState.isDragging) {
                                canvas.style.cursor = "grabbing";
                        } else if (
                                mouseState.type === RegionType.ColumnFreezeHandler &&
                                !columnFreezeState.isFreezing
                        ) {
                                canvas.style.cursor = "grab";
                        } else if (
                                mouseState.type === RegionType.ColumnResizeHandler &&
                                !columnResizeState.isResizing
                        ) {
                                canvas.style.cursor = "col-resize";
                        } else if (
                                mouseState.type === RegionType.ColumnHeader &&
                                !columnResizeState.isResizing
                        ) {
                                canvas.style.cursor = "pointer";
                        } else if (
                                mouseState.type === RegionType.RowGroupControl &&
                                !columnResizeState.isResizing
                        ) {
                                // Phase 1: Pointer cursor for group header toggle (like Teable)
                                canvas.style.cursor = "pointer";
                        } else if (
                                mouseState.type === RegionType.AppendColumn &&
                                !columnResizeState.isResizing
                        ) {
                                canvas.style.cursor = "pointer";
                        } else if (
                                mouseState.type === RegionType.AppendRow &&
                                !columnResizeState.isResizing
                        ) {
                                canvas.style.cursor = "pointer";
                        } else if (footerColumnHovered !== null) {
                                // Footer number-column statistic cell: clickable to change aggregation
                                canvas.style.cursor = "pointer";
                        } else if (
                                mouseState.type === RegionType.Cell &&
                                mouseState.rowIndex >= 0 &&
                                mouseState.columnIndex >= 0 &&
                                !mouseState.isOutOfBounds
                        ) {
                                // Check if hovering over a Rating cell
                                const linearRow = linearRows
                                        ? linearRows[mouseState.rowIndex]
                                        : null;
                                const realRowIndex =
                                        linearRow?.realIndex !== undefined
                                                ? linearRow.realIndex
                                                : mouseState.rowIndex;

                                if (
                                        realRowIndex >= 0 &&
                                        realRowIndex < records.length &&
                                        mouseState.columnIndex >= 0 &&
                                        mouseState.columnIndex < columns.length
                                ) {
                                        const column = columns[mouseState.columnIndex];
                                        const record = records[realRowIndex];
                                        const cell = record?.cells[column.id];

                                        if (cell?.type === CellType.Rating) {
                                                // Check if mouse is within rating area
                                                const ratingCell = cell as IRatingCell;
                                                const maxRating = ratingCell.options?.maxRating ?? 10;
                                                const iconSize =
                                                        config.theme.iconSizeSM ||
                                                        config.theme.fontSize ||
                                                        20;
                                                const gapSize = 3;
                                                const cellHorizontalPadding = 8;

                                                // Calculate cell position using same method as click handler
                                                const cellX =
                                                        coordinateManager.getColumnRelativeOffset(
                                                                mouseState.columnIndex,
                                                                scrollState.scrollLeft,
                                                        ) +
                                                        rowHeaderWidth -
                                                        60;

                                                // Calculate relative X position within cell
                                                const relativeX = mouseState.x - cellX;
                                                const minX = cellHorizontalPadding;
                                                const maxX = minX + maxRating * (iconSize + gapSize);

                                                // Set pointer cursor if hovering over rating icons
                                                if (relativeX >= minX && relativeX <= maxX) {
                                                        canvas.style.cursor = "pointer";
                                                } else {
                                                        canvas.style.cursor = "default";
                                                }
                                        } else {
                                                canvas.style.cursor = "default";
                                        }
                                } else {
                                        canvas.style.cursor = "default";
                                }
                        } else if (!columnResizeState.isResizing) {
                                // Only set default cursor when not resizing (to avoid overriding browser drag cursor)
                                canvas.style.cursor = "default";
                        }
                },
                [
                        columns,
                        records,
                        headerHeight,
                        getColumnWidth,
                        coordinateManager,
                        scrollState.scrollLeft,
                        rowHeaderWidth,
                        config.theme,
                        linearRows,
                        onColumnResizeChange,
                        rowHeaderWidth,
                        scrollState.scrollLeft,
                        scrollState.scrollTop,
                        coordinateManager,
                        getRowHeight,
                        records.length,
                        columnResizeState.isResizing,
                        columnDragState.isDragging,
                        columnDragState.isActive,
                        isSelecting,
                        onSelectionChange,
                        onColumnDragChange,
                        autoScrollForColumnDrag,
                        zoomLevel, // Added for zoom coordinate conversion
                        convertMouseToCanvasCoords, // Added for zoom coordinate conversion
                        containerSize, // Footer hover: footerY = containerSize.height - FOOTER_HEIGHT
                        setHoveredFooterColumnIndex,
                ],
        );

        const handleMouseDown = useCallback(
                (event: React.MouseEvent<HTMLCanvasElement>) => {
                        // CRITICAL FIX: Prevent selection changes on right-click (like Teable)
                        // Right-click should only trigger context menu, not selection changes
                        // event.button: 0 = left, 1 = middle, 2 = right
                        // This matches Teable's InteractionLayer.tsx line 549: if (event.button === MouseButtonType.Right) return;
                        if (event.button === 2) {
                                return;
                        }

                        const canvas = canvasRef.current;
                        if (!canvas) return;

                        const rect = canvas.getBoundingClientRect();
                        const screenX = event.clientX - rect.left;
                        const screenY = event.clientY - rect.top;
                        // Convert screen coordinates to canvas logical coordinates accounting for zoom
                        const { x, y } = convertMouseToCanvasCoords(
                                screenX,
                                screenY,
                                zoomLevel,
                        );

                        // Phase 2 Fix: Calculate accurate mouseState for cell clicks
                        // Priority: Column resize > Selection
                        if (y < headerHeight) {
                                // Header area - use detectRegion
                                // Phase 1: Pass getLinearRow for group row detection (like Teable)
                                const headerMouseState = detectRegion(
                                        x,
                                        y,
                                        columns,
                                        headerHeight,
                                        getColumnWidth,
                                        rowHeaderWidth,
                                        scrollState.scrollLeft,
                                        (coIndex: number, sLeft: number) =>
                                                coordinateManager.getColumnRelativeOffset(
                                                        coIndex,
                                                        sLeft,
                                                ),
                                        coordinateManager, // ADD: For accurate row detection with variable row heights
                                        scrollState.scrollTop, // ADD: For accurate row detection with variable row heights
                                        getLinearRow, // Phase 1: For group row detection
                                        appendColumnWidth,
                                        contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                                        true, // isMultiSelectionEnable
                                        coordinateManager.pureRowCount, // pureRowCount
                                        theme, // theme
                                        isColumnFreezable, // isColumnFreezable
                                );
                                if (headerMouseState.type === RegionType.ColumnResizeHandler) {
                                        // Close editor when column resize starts
                                        if (editingCell) {
                                                setEditingCell(null);
                                                setFixedEditorPosition(null);
                                        }
                                        // Clear column selection when resize starts (fix: column stays selected)
                                        if (selection.isColumnSelection) {
                                                setSelection(selection.reset());
                                        }
                                        // Clear the flag when resize starts (fresh state for resize end)
                                        justFinishedResizeRef.current = false;
                                        onColumnResizeStart(headerMouseState);
                                        return;
                                }
                                if (headerMouseState.type === RegionType.ColumnFreezeHandler) {
                                        onColumnFreezeStart(headerMouseState);
                                        return;
                                }
                                if (headerMouseState.type === RegionType.ColumnHeader) {
                                        onColumnDragStart(headerMouseState);
                                        onSelectionStart(event, headerMouseState);
                                        return;
                                }
                                onSelectionStart(event, headerMouseState);
                                return;
                        }

                        // Phase 1: Use region detection (like Teable's InteractionLayer)
                        // Reference: teable/packages/sdk/src/components/grid/InteractionLayer.tsx
                        const mouseState = detectRegion(
                                x,
                                y,
                                columns,
                                headerHeight,
                                getColumnWidth,
                                rowHeaderWidth,
                                scrollState.scrollLeft,
                                (coIndex: number, sLeft: number) =>
                                        coordinateManager.getColumnRelativeOffset(coIndex, sLeft),
                                coordinateManager,
                                scrollState.scrollTop,
                                getLinearRow, // Phase 1: For group row detection
                                appendColumnWidth,
                                contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                                true, // isMultiSelectionEnable
                                coordinateManager.pureRowCount, // pureRowCount
                                theme, // theme
                                isColumnFreezable, // isColumnFreezable
                        );

                        // Phase 1: Handle RowGroupControl in mousedown (prevent default behavior only)
                        if (mouseState.type === RegionType.RowGroupControl) {
                                event.preventDefault();
                                event.stopPropagation();
                                return;
                        }

                        if (mouseState.type === RegionType.ColumnFreezeHandler) {
                                onColumnFreezeStart(mouseState);
                                return;
                        }

                        if (mouseState.type === RegionType.RowGroupHeader) {
                                return;
                        }

                        onSelectionStart(event, mouseState);
                },
                [
                        headerHeight,
                        columns,
                        getColumnWidth,
                        rowHeaderWidth,
                        scrollState.scrollTop,
                        scrollState.scrollLeft,
                        coordinateManager,
                        getRowHeight,
                        records.length,
                        onColumnResizeStart,
                        onColumnFreezeStart,
                        onColumnDragStart,
                        onSelectionStart,
                        // Grouping dependencies
                        hasGrouping,
                        groupTransformationResult,
                        linearRows,
                        onCollapsedGroupChanged,
                        getLinearRow,
                        collapsedGroupIds,
                        zoomLevel, // Added for zoom coordinate conversion
                        convertMouseToCanvasCoords, // Added for zoom coordinate conversion
                ],
        );

        const handleMouseUp = useCallback(() => {
                // Priority: Column resize > Selection
                if (columnResizeState.isResizing) {
                        const resizeColumnIndex = columnResizeState.columnIndex;

                        // Auto-scroll to keep resized column visible (like Teable's scrollToItem logic)
                        // Inspired by Teable Grid.tsx scrollToItem method
                        if (resizeColumnIndex >= 0 && scrollerRef.current) {
                                const absoluteColumnOffset =
                                        coordinateManager.getColumnOffset(resizeColumnIndex);
                                const columnWidth = getColumnWidth(resizeColumnIndex);

                                // Calculate viewport boundaries in content coordinates
                                // scrollLeft is the content scroll position (0 = start of content)
                                const scrollableWidth = containerSize.width - rowHeaderWidth;
                                const viewportStartX = scrollState.scrollLeft;
                                const viewportEndX = scrollState.scrollLeft + scrollableWidth;

                                // Check if column is out of viewport bounds
                                const columnEndX = absoluteColumnOffset + columnWidth;
                                const deltaLeft = Math.min(
                                        absoluteColumnOffset - viewportStartX,
                                        0,
                                ); // Negative if column before viewport
                                const deltaRight = Math.max(columnEndX - viewportEndX, 0); // Positive if column extends beyond viewport

                                // Calculate new scroll position if needed
                                if (deltaLeft < 0 || deltaRight > 0) {
                                        const newScrollLeft =
                                                scrollState.scrollLeft + deltaLeft + deltaRight;
                                        // Add small padding like Teable's cellScrollBuffer (16px default)
                                        const scrollPadding =
                                                deltaLeft < 0 ? -16 : deltaRight > 0 ? 16 : 0;
                                        scrollerRef.current.scrollTo(
                                                Math.max(0, newScrollLeft + scrollPadding),
                                                undefined,
                                        );
                                }
                        }

                        onColumnResizeEnd();

                        // Clear column selection after resize ends (fix: column stays selected)
                        // Always clear column selection after resize, regardless of which column was resized
                        if (selection.isColumnSelection) {
                                setSelection(selection.reset());
                        }

                        // FIX: Reset cursor to default after resize ends (prevent col-resize cursor from staying visible)
                        const canvas = canvasRef.current;
                        if (canvas) {
                                canvas.style.cursor = "default";
                        }

                        // Mark that we just finished a resize (prevent column re-selection on click)
                        justFinishedResizeRef.current = true;
                        // Clear the flag after a short delay to allow click handler to check it
                        setTimeout(() => {
                                justFinishedResizeRef.current = false;
                        }, 100);
                } else {
                        let dragHandled = false;
                        let reorderedColumns: IColumn[] | null = null;
                        onColumnDragEnd(mouseState, ({ columnIndices, dropIndex }) => {
                                if (columnIndices.length > 0) {
                                        dragHandled = true;
                                        const sortedIndices = [...columnIndices].sort(
                                                (a, b) => a - b,
                                        );
                                        const uniqueIndices = Array.from(new Set(sortedIndices));
                                        const movingColumns = uniqueIndices.map(
                                                (index) => columns[index],
                                        );
                                        const remainingColumns = columns.filter(
                                                (_, index) => !uniqueIndices.includes(index),
                                        );
                                        let adjustedDropIndex = dropIndex;
                                        uniqueIndices.forEach((index) => {
                                                if (index < dropIndex) {
                                                        adjustedDropIndex -= 1;
                                                }
                                        });
                                        adjustedDropIndex = Math.max(
                                                0,
                                                Math.min(remainingColumns.length, adjustedDropIndex),
                                        );
                                        reorderedColumns = [
                                                ...remainingColumns.slice(0, adjustedDropIndex),
                                                ...movingColumns,
                                                ...remainingColumns.slice(adjustedDropIndex),
                                        ];
                                }
                        });

                        if (dragHandled) {
                                const canvas = canvasRef.current;
                                if (canvas) {
                                        canvas.style.cursor = "default";
                                }
                                if (reorderedColumns) {
                                        onColumnReorder?.(reorderedColumns);
                                }
                                setSelection(selection.reset());
                                setActiveCell(null);
                                return;
                        }

                        // Phase 2: End selection drag - pass mouseState to detect if user dragged
                        // Get current mouse position from state
                        onSelectionEnd(mouseState);
                }
        }, [
                columnResizeState.isResizing,
                columnResizeState.columnIndex,
                onColumnResizeEnd,
                coordinateManager,
                scrollState.scrollLeft,
                containerSize.width,
                rowHeaderWidth,
                getColumnWidth,
                mouseState,
                onSelectionEnd,
                selection,
                setSelection,
                onColumnDragEnd,
                onColumnReorder,
                columns,
        ]);

        // Phase 1: Double-click handler (like Teable's onDblClick - lines 509-533)
        // Reference: teable/packages/sdk/src/components/grid/InteractionLayer.tsx
        const handleMouseDoubleClick = useCallback(
                (event: React.MouseEvent<HTMLCanvasElement>) => {
                        const canvas = canvasRef.current;
                        if (!canvas) return;

                        const rect = canvas.getBoundingClientRect();
                        const screenX = event.clientX - rect.left;
                        const screenY = event.clientY - rect.top;
                        // Convert screen coordinates to canvas logical coordinates accounting for zoom
                        const { x, y } = convertMouseToCanvasCoords(
                                screenX,
                                screenY,
                                zoomLevel,
                        );

                        // Phase 1: Use region detection (like Teable line 510-512)
                        const mouseState = detectRegion(
                                x,
                                y,
                                columns,
                                headerHeight,
                                getColumnWidth,
                                rowHeaderWidth,
                                scrollState.scrollLeft,
                                (coIndex: number, sLeft: number) =>
                                        coordinateManager.getColumnRelativeOffset(coIndex, sLeft),
                                coordinateManager,
                                scrollState.scrollTop,
                                getLinearRow, // Phase 1: For group row detection
                                appendColumnWidth,
                                contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                        );

                        const { type, rowIndex, columnIndex } = mouseState;
                        const linearRow = getLinearRow(rowIndex);
                        const realIndex = linearRow.realIndex; // Get realIndex (like Teable line 512)

                        // CRITICAL: Validate realIndex before accessing records
                        // Skip group headers (realIndex: -1) and append rows
                        if (realIndex < 0 || realIndex >= records.length) {
                                return; // Can't edit group headers or invalid rows
                        }

                        // CRITICAL: Only open editor for Cell/ActiveCell regions (like Teable line 513-521)
                        if (
                                [RegionType.Cell, RegionType.ActiveCell].includes(type) &&
                                selection.ranges[0]?.[0] === columnIndex &&
                                selection.ranges[0]?.[1] === realIndex
                        ) {
                                const record = records[realIndex];
                                const column = columns[columnIndex];

                                if (!record || !column) return;

                                const cell = record.cells[column.id];
                                // Phase 1: Check if cell is read-only (like Teable line 517)
                                // Check both readOnly (camelCase) and readonly (lowercase) for compatibility
                                if (
                                        cell &&
                                        (("readOnly" in cell && (cell as any).readOnly) ||
                                                ("readonly" in cell && (cell as any).readonly))
                                ) {
                                        onCellDoubleClick?.(realIndex, columnIndex);
                                        return;
                                }

                                // Open editor (like Teable line 519-520)
                                // CRITICAL: Use realIndex for activeCell (like Teable - activeCell stores realIndex)
                                setActiveCell({ row: realIndex, col: columnIndex });
                                // Phase 1: editingCell.row should be linearIndex (so editor can map back to realIndex via linearRows)
                                setEditingCell({ row: rowIndex, col: columnIndex });
                                onCellDoubleClick?.(realIndex, columnIndex);
                        }

                        // If region is NOT Cell/ActiveCell (e.g., RowGroupControl, RowGroupHeader),
                        // editor does NOT open (like Teable)
                },
                [
                        columns,
                        records,
                        headerHeight,
                        getColumnWidth,
                        rowHeaderWidth,
                        scrollState.scrollLeft,
                        scrollState.scrollTop,
                        coordinateManager,
                        getLinearRow,
                        selection,
                        onCellDoubleClick,
                        zoomLevel, // Added for zoom coordinate conversion
                        convertMouseToCanvasCoords, // Added for zoom coordinate conversion
                ],
        );

        // Handle scroll events
        useEffect(() => {
                const container = containerRef.current;
                if (!container) return;

                container.addEventListener("scroll", handleScroll);
                return () => container.removeEventListener("scroll", handleScroll);
        }, [handleScroll]);

        // Add global mouse event listeners for better mouse tracking
        useEffect(() => {
                const handleGlobalMouseUp = () => {
                        // End column freeze if currently freezing
                        if (columnFreezeState.isFreezing) {
                                onColumnFreezeEnd((count) => {
                                        onColumnFreeze?.(count);
                                        // Update coordinateManager freeze count
                                        coordinateManager.freezeColumnCount = count;
                                        setForceUpdate((prev) => prev + 1);
                                });
                        }
                        // End column resize if currently resizing column
                        if (columnResizeState.isResizing) {
                                onColumnResizeEnd();
                        }
                };

                const handleGlobalMouseMove = (event: MouseEvent) => {
                        const canvas = canvasRef.current;
                        if (!canvas) return;

                        const rect = canvas.getBoundingClientRect();
                        const screenX = event.clientX - rect.left;
                        const screenY = event.clientY - rect.top;
                        // Convert screen coordinates to canvas logical coordinates accounting for zoom
                        const { x, y } = convertMouseToCanvasCoords(
                                screenX,
                                screenY,
                                zoomLevel,
                        );

                        // Handle column freezing (like Teable)
                        if (columnFreezeState.isFreezing) {
                                // Only process if mouse is over the canvas
                                if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                                        const newMouseState = detectRegion(
                                                x,
                                                y,
                                                columns,
                                                headerHeight,
                                                getColumnWidth,
                                                rowHeaderWidth,
                                                scrollState.scrollLeft,
                                                (coIndex: number, sLeft: number) =>
                                                        coordinateManager.getColumnRelativeOffset(
                                                                coIndex,
                                                                sLeft,
                                                        ),
                                                coordinateManager,
                                                scrollState.scrollTop,
                                                getLinearRow,
                                                appendColumnWidth,
                                                contentWidth,
                                                true, // isMultiSelectionEnable
                                                coordinateManager.pureRowCount,
                                                theme,
                                                isColumnFreezable,
                                        );
                                        // Update mouseState so handler follows mouse
                                        setMouseState(newMouseState);
                                        onColumnFreezeMove(newMouseState);
                                        requestAnimationFrame(() => {
                                                setForceUpdate((prev) => prev + 1);
                                        });
                                }
                                return;
                        }

                        // Handle column resizing
                        if (columnResizeState.isResizing) {
                                // Only process if mouse is over the canvas
                                if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                                        const newMouseState = detectRegion(
                                                x,
                                                y,
                                                columns,
                                                headerHeight,
                                                getColumnWidth,
                                                rowHeaderWidth,
                                                scrollState.scrollLeft,
                                                (coIndex: number, sLeft: number) =>
                                                        coordinateManager.getColumnRelativeOffset(
                                                                coIndex,
                                                                sLeft,
                                                        ),
                                                coordinateManager, // ADD: For accurate row detection with variable row heights
                                                scrollState.scrollTop, // ADD: For accurate row detection with variable row heights
                                                getLinearRow, // Phase 1: For group row detection
                                                appendColumnWidth,
                                                contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                                                true, // isMultiSelectionEnable
                                                coordinateManager.pureRowCount, // pureRowCount
                                                theme, // theme
                                                isColumnFreezable, // isColumnFreezable
                                        );
                                        onColumnResizeChange(newMouseState, () => {
                                                requestAnimationFrame(() => {
                                                        setForceUpdate((prev) => prev + 1);
                                                });
                                        });
                                }
                        }

                        // Row resize disabled for now (future toggle feature)
                        // No per-row height changes allowed currently
                };

                if (columnFreezeState.isFreezing || columnResizeState.isResizing) {
                        document.addEventListener("mousemove", handleGlobalMouseMove);
                        document.addEventListener("mouseup", handleGlobalMouseUp);
                }

                return () => {
                        document.removeEventListener("mousemove", handleGlobalMouseMove);
                        document.removeEventListener("mouseup", handleGlobalMouseUp);
                };
        }, [
                columnFreezeState.isFreezing,
                columnResizeState.isResizing,
                columns,
                headerHeight,
                getColumnWidth,
                rowHeaderWidth,
                scrollState.scrollLeft,
                scrollState.scrollTop,
                coordinateManager,
                getLinearRow,
                appendColumnWidth,
                contentWidth,
                theme,
                isColumnFreezable,
                onColumnFreezeMove,
                onColumnFreezeEnd,
                onColumnResizeChange,
                onColumnResizeEnd,
                onColumnFreeze,
                setMouseState,
                setForceUpdate,
                rowHeaders,
                rowHeaderWidth,
                zoomLevel, // Added for zoom coordinate conversion
                convertMouseToCanvasCoords, // Added for zoom coordinate conversion
        ]);

        // Render when data or visible range changes
        // Teable-style: React dependency system handles re-rendering automatically
        // When renderGrid dependencies change → renderGrid callback changes → useEffect runs
        useEffect(() => {
                renderGrid();
        }, [renderGrid]);

        // Force canvas redraw when groupPoints or groupCollection changes
        // This ensures canvas updates when groupBy order changes or groupPoints are updated
        // This ensures UI updates even if other dependencies haven't changed
        useEffect(() => {
                if (hasGrouping) {
                        // Force re-render when groupPoints, groupCollection, or groupConfigKey changes
                        // This ensures canvas updates even if array references are similar
                        renderGrid();
                }
        }, [
                groupPoints,
                groupPoints?.length,
                groupCollection,
                groupConfigKey,
                hasGrouping,
                renderGrid,
        ]);

        // Get editor component for editing cell
        const EditorComponent = useMemo(() => {
                if (!editingCell) return null;

                // Check if editing cell is a group row - don't render editor
                if (
                        hasGrouping &&
                        linearRows &&
                        editingCell.row >= 0 &&
                        editingCell.row < linearRows.length
                ) {
                        const linearRow = linearRows[editingCell.row];
                        if (linearRow?.type === LinearRowType.Group) {
                                return null; // Don't render editor for group rows
                        }
                }

                // Convert linear index to real index for record access
                const realRowIndex =
                        hasGrouping &&
                        linearRows &&
                        editingCell.row >= 0 &&
                        editingCell.row < linearRows.length
                                ? (linearRows[editingCell.row]?.realIndex ?? editingCell.row)
                                : editingCell.row;

                // CRITICAL: Validate realRowIndex before accessing records
                if (realRowIndex < 0 || realRowIndex >= records.length) {
                        return null; // Invalid index (group header, append row, etc.)
                }

                const record = records[realRowIndex];
                const column = columns[editingCell.col];
                const cell = record?.cells[column.id];

                if (!cell) return null;

                const Editor = getEditor(cell.type);
                return Editor;
        }, [editingCell, records, columns, hasGrouping, linearRows]);

        return (
                <div
                        ref={containerRef}
                        style={{
                                width: "100%",
                                height: "100%",
                                overflow: "hidden",
                                position: "relative",
                                outline: "none",
                        }}
                        tabIndex={0}
                        onKeyDown={handleKeyboardEditorOpen}
                >
                        {/* Editor container - positioned absolutely relative to this div */}
                        <div
                                style={{
                                        width: containerSize.width, // Like Teable: containerWidth for editor positioning
                                        height: containerSize.height, // Like Teable: containerHeight for editor positioning
                                        position: "relative",
                                        overflow: "hidden", // Prevent editor from showing outside viewport
                                }}
                        >
                                <canvas
                                        ref={canvasRef}
                                        style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                // Width and height are set in renderGrid to account for zoom
                                                cursor:
                                                        mouseState.type === RegionType.ColumnResizeHandler
                                                                ? "col-resize"
                                                                : mouseState.type === RegionType.ColumnHeader ||
                                                                          mouseState.type ===
                                                                                        RegionType.ColumnHeaderDropdown
                                                                        ? "pointer"
                                                                        : "default", // Use pointer cursor on column headers for better UX
                                        }}
                                        onClick={handleMouseClick}
                                        onDoubleClick={handleMouseDoubleClick}
                                        onMouseMove={handleMouseMove}
                                        onMouseDown={handleMouseDown}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={() => {
                                                // Reset mouse state when leaving canvas to hide hover effects
                                                setMouseState({
                                                        x: 0,
                                                        y: 0,
                                                        columnIndex: -1,
                                                        rowIndex: -1,
                                                        type: RegionType.None,
                                                        isOutOfBounds: false,
                                                });
                                                setHoveredFooterColumnIndex(null);
                                        }}
                                        onContextMenu={(e) => {
                                                // Prevent default browser context menu
                                                e.preventDefault();
                                                e.stopPropagation();

                                                const canvas = canvasRef.current;
                                                if (!canvas) return;

                                                const rect = canvas.getBoundingClientRect();
                                                const screenX = e.clientX - rect.left;
                                                const screenY = e.clientY - rect.top;
                                                // Convert screen coordinates to canvas logical coordinates accounting for zoom
                                                const { x, y } = convertMouseToCanvasCoords(
                                                        screenX,
                                                        screenY,
                                                        zoomLevel,
                                                );

                                                // Detect region for context menu
                                                const mouseState = detectRegion(
                                                        x,
                                                        y,
                                                        columns,
                                                        headerHeight,
                                                        getColumnWidth,
                                                        rowHeaderWidth,
                                                        scrollState.scrollLeft,
                                                        (coIndex: number, sLeft: number) =>
                                                                coordinateManager.getColumnRelativeOffset(
                                                                        coIndex,
                                                                        sLeft,
                                                                ),
                                                        coordinateManager, // ADD: For accurate row detection with variable row heights (CRITICAL FIX)
                                                        scrollState.scrollTop, // ADD: For accurate row detection with variable row heights (CRITICAL FIX)
                                                        getLinearRow,
                                                        appendColumnWidth,
                                                        contentWidth, // Phase 2C: Pass contentWidth for accurate append column positioning
                                                        true, // isMultiSelectionEnable
                                                        coordinateManager.pureRowCount, // pureRowCount
                                                        theme, // theme
                                                );

                                                // Handle context menu based on region type
                                                if (
                                                        mouseState.type === RegionType.Cell ||
                                                        mouseState.type === RegionType.RowHeader
                                                ) {
                                                        // Cell/Row context menu
                                                        // Use viewport coordinates (clientX, clientY) for proper menu positioning
                                                        // Pass the selection from callback to ensure we use the latest selection state
                                                        onSelectionContextMenu(mouseState, (sel, _pos) => {
                                                                handleCellContextMenu(
                                                                        e,
                                                                        {
                                                                                x: e.clientX,
                                                                                y: e.clientY,
                                                                        },
                                                                        sel, // Pass the selection from callback (preserves multi-selection)
                                                                );
                                                        });
                                                } else if (
                                                        mouseState.type === RegionType.ColumnHeader
                                                ) {
                                                        // Column header context menu
                                                        handleHeaderContextMenu(
                                                                e,
                                                                { x: e.clientX, y: e.clientY },
                                                                mouseState.columnIndex,
                                                        );
                                                }
                                        }}
                                />
                                {columnDragVisuals && (
                                        <>
                                                {/* CRITICAL: Scale drag visuals by zoom to match canvas rendering */}
                                                {/* columnDragVisuals.left and width are in logical coordinates, need to scale for DOM positioning */}
                                                <div
                                                        style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left:
                                                                        columnDragVisuals.left * (zoomLevel / 100), // Scale logical left to display pixels
                                                                width:
                                                                        columnDragVisuals.width * (zoomLevel / 100), // Scale logical width to display pixels
                                                                height: columnDragVisuals.height, // CRITICAL: height is already in display pixels (from containerSize), don't scale
                                                                backgroundColor: "rgba(33, 150, 243, 0.12)",
                                                                border: "1px solid rgba(33, 150, 243, 0.45)",
                                                                borderRadius: 4,
                                                                pointerEvents: "none",
                                                                boxShadow: "0 0 12px rgba(33, 150, 243, 0.25)",
                                                                zIndex: 6,
                                                        }}
                                                >
                                                        <div
                                                                style={{
                                                                        height: headerHeight, // CRITICAL: headerHeight is already in display pixels, don't scale
                                                                        backgroundColor: "rgba(33, 150, 243, 0.3)",
                                                                        borderBottom:
                                                                                "1px solid rgba(33, 150, 243, 0.45)",
                                                                }}
                                                        />
                                                </div>
                                                {columnDragVisuals.indicatorLeft != null && (
                                                        <div
                                                                style={{
                                                                        position: "absolute",
                                                                        top: headerHeight, // CRITICAL: headerHeight is already in display pixels, don't scale
                                                                        left:
                                                                                (columnDragVisuals.indicatorLeft - 1) *
                                                                                (zoomLevel / 100), // Scale logical left to display pixels
                                                                        width: 2 * (zoomLevel / 100), // Scale indicator width to display pixels
                                                                        height: columnDragVisuals.indicatorHeight, // CRITICAL: indicatorHeight is already in display pixels, don't scale
                                                                        backgroundColor: "rgba(33, 150, 243, 0.85)",
                                                                        borderRadius: 1,
                                                                        pointerEvents: "none",
                                                                        zIndex: 7,
                                                                }}
                                                        />
                                                )}
                                        </>
                                )}

                                {/* Editor overlay - Only shows when editingCell is set (via double-click) */}
                                {editingCell &&
                                        EditorComponent &&
                                        (() => {
                                                // OPTION B: Reset fixed position if editing cell changes
                                                // This ensures new editor opens at new cell position
                                                const currentEditingCellKey = `${editingCell.row}-${editingCell.col}`;

                                                // If editing cell changed, reset fixed position
                                                if (
                                                        fixedEditorPosition &&
                                                        fixedEditorPosition.cellKey !==
                                                                currentEditingCellKey
                                                ) {
                                                        setFixedEditorPosition(null);
                                                }

                                                // Convert linear index to real index for record access
                                                const realRowIndex =
                                                        hasGrouping &&
                                                        linearRows &&
                                                        editingCell.row >= 0 &&
                                                        editingCell.row < linearRows.length
                                                                ? (linearRows[editingCell.row]?.realIndex ??
                                                                        editingCell.row)
                                                                : editingCell.row;

                                                // CRITICAL: Validate realRowIndex before accessing records
                                                if (
                                                        realRowIndex < 0 ||
                                                        realRowIndex >= records.length
                                                ) {
                                                        return null; // Invalid index (group header, append row, etc.)
                                                }

                                                const record = records[realRowIndex];
                                                const column = columns[editingCell.col];
                                                const cell = record?.cells[column.id];

                                                if (!cell) {
                                                        return null;
                                                }

                                                // OPTION B: Fixed editor position (viewport coordinates)
                                                // Editor stays at fixed position even when canvas scrolls
                                                // For multi-line text: expand to available space from fixed position
                                                // CRITICAL FIX: Use coordinateManager methods directly (like active cell fix)
                                                // This ensures editor dimensions update immediately when rowHeight/columnWidth changes
                                                // coordinateManager is recreated via useMemo when rowHeight changes, so these are always current
                                                const columnWidth = coordinateManager.getColumnWidth(
                                                        editingCell.col,
                                                );
                                                const rowHeightForThisRow =
                                                        coordinateManager.getRowHeight(editingCell.row);

                                                // Calculate cell position when editor opens (for initial positioning)
                                                // CRITICAL: These are in logical space, need to scale by zoom for DOM positioning
                                                const zoomScale = zoomLevel / 100;
                                                const relativeX =
                                                        coordinateManager.getColumnRelativeOffset(
                                                                editingCell.col,
                                                                scrollState.scrollLeft,
                                                        );
                                                const rowOffset = coordinateManager.getRowOffset(
                                                        editingCell.row,
                                                );
                                                const relativeY = rowOffset - scrollState.scrollTop;

                                                // Calculate initial cell position in DISPLAY pixels (scaled by zoom)
                                                // Canvas renders at zoomed coordinates, so editor must match
                                                const initialCellX = relativeX * zoomScale;
                                                const initialCellY = relativeY * zoomScale;

                                                // Measure totalHeight for multi-line text (if applicable)
                                                // CRITICAL: Measure in logical space, then scale by zoom for display
                                                let cellTotalHeight = rowHeightForThisRow;
                                                if (cell && getCellRenderer) {
                                                        const renderer = getCellRenderer(cell.type);
                                                        if (renderer && renderer.measure) {
                                                                const measureCanvas =
                                                                        document.createElement("canvas");
                                                                const measureCtx =
                                                                        measureCanvas.getContext("2d");
                                                                if (measureCtx) {
                                                                        measureCtx.font = `${theme.fontSize}px ${theme.fontFamily}`;
                                                                        const measureResult = renderer.measure(
                                                                                cell as any,
                                                                                {
                                                                                        cell: cell as any,
                                                                                        ctx: measureCtx,
                                                                                        theme,
                                                                                        width: columnWidth, // Logical width
                                                                                        height: rowHeightForThisRow, // Logical height
                                                                                        column: column as any,
                                                                                },
                                                                        ) as {
                                                                                width: number;
                                                                                height: number;
                                                                                totalHeight?: number;
                                                                        };
                                                                        if (measureResult.totalHeight) {
                                                                                cellTotalHeight =
                                                                                        measureResult.totalHeight; // Logical height
                                                                        }
                                                                }
                                                        }
                                                }
                                                // Scale totalHeight to display pixels for editor sizing
                                                const scaledCellTotalHeight =
                                                        cellTotalHeight * zoomScale;

                                                // Store fixed position when editor opens (or use existing if already set)
                                                // CRITICAL: Calculate scaled boundary values once for use in all calculations
                                                const scaledRowHeaderWidth = rowHeaderWidth * zoomScale; // Scale to display pixels
                                                const scaledHeaderHeight = headerHeight * zoomScale; // Scale to display pixels

                                                let editorX: number;
                                                let editorY: number;
                                                let editorWidth: number;
                                                let editorHeight: number;

                                                if (fixedEditorPosition) {
                                                        // Use stored fixed position (editor stays fixed)
                                                        // CRITICAL: Fixed position is already in display pixels (scaled), use as-is
                                                        editorX = fixedEditorPosition.x;
                                                        editorY = fixedEditorPosition.y;
                                                        editorWidth = fixedEditorPosition.width;
                                                        editorHeight = fixedEditorPosition.height;
                                                } else {
                                                        // First time opening: use cell position and clamp to viewport
                                                        // CRITICAL: Scale dimensions by zoom to match canvas rendering
                                                        editorWidth = columnWidth * zoomScale;
                                                        editorHeight = rowHeightForThisRow * zoomScale; // Start with cell height (scaled)

                                                        // Task 3: Clamp initial position to viewport bounds and respect freeze boundaries
                                                        // CRITICAL: All boundary values must be in display pixels (scaled by zoom)
                                                        const freezeColumnCount =
                                                                coordinateManager.freezeColumnCount;
                                                        const freezeRegionWidth =
                                                                coordinateManager.freezeRegionWidth * zoomScale; // Scale to display pixels
                                                        const isFreezeRegion =
                                                                editingCell.col < freezeColumnCount;

                                                        if (isFreezeRegion) {
                                                                // If in freeze region, clamp to freeze region boundaries
                                                                editorX = Math.max(
                                                                        scaledRowHeaderWidth, // Don't overlap row headers (scaled)
                                                                        Math.min(
                                                                                initialCellX,
                                                                                freezeRegionWidth - editorWidth, // Don't overflow beyond freeze region (scaled)
                                                                        ),
                                                                );
                                                        } else {
                                                                // If in scrollable region, ensure editor doesn't start before freezeRegionWidth
                                                                editorX = Math.max(
                                                                        Math.max(
                                                                                scaledRowHeaderWidth,
                                                                                freezeRegionWidth,
                                                                        ), // Don't overlap row headers or freeze region (scaled)
                                                                        Math.min(
                                                                                initialCellX,
                                                                                containerSize.width - editorWidth, // Don't overflow right (already in display pixels)
                                                                        ),
                                                                );
                                                        }

                                                        editorY = Math.max(
                                                                scaledHeaderHeight, // Don't overlap header (scaled)
                                                                Math.min(
                                                                        initialCellY,
                                                                        containerSize.height -
                                                                                FOOTER_HEIGHT -
                                                                                editorHeight, // Don't overflow bottom (already in display pixels)
                                                                ),
                                                        );

                                                        // Store fixed position for future renders
                                                        setFixedEditorPosition({
                                                                x: editorX,
                                                                y: editorY,
                                                                width: editorWidth,
                                                                height: editorHeight,
                                                                cellKey: `${editingCell.row}-${editingCell.col}`, // Store cell key
                                                        });
                                                }

                                                // OPTION B: For multi-line text, expand to available space from fixed position
                                                // Calculate available space downward from fixed position
                                                // All values are already in display pixels (scaled)
                                                const maxAvailableHeight =
                                                        containerSize.height - FOOTER_HEIGHT - editorY;

                                                // Expand height to available space (for multi-line text)
                                                // Use min(scaledTotalHeight, availableSpace) so editor expands but doesn't overflow
                                                const expandedHeight = Math.min(
                                                        scaledCellTotalHeight, // Full content height (scaled to display pixels)
                                                        maxAvailableHeight, // Available space downward (already in display pixels)
                                                );

                                                // Use expanded height if it's larger than cell height (multi-line)
                                                // Otherwise use cell height (single-line)
                                                // Compare logical heights, but use scaled heights for display
                                                const finalEditorHeight =
                                                        cellTotalHeight > rowHeightForThisRow
                                                                ? expandedHeight // Multi-line: use expanded height (scaled)
                                                                : editorHeight; // Single-line: use cell height (already scaled)

                                                // Task 3: Always clamp to viewport bounds and respect freeze boundaries
                                                // CRITICAL: All boundary values must be in display pixels (scaled)
                                                const freezeColumnCount =
                                                        coordinateManager.freezeColumnCount;
                                                const scaledFreezeRegionWidth =
                                                        coordinateManager.freezeRegionWidth * zoomScale; // Scale to display pixels
                                                const isFreezeRegion =
                                                        editingCell.col < freezeColumnCount;

                                                let clampedX: number;
                                                if (isFreezeRegion) {
                                                        // If in freeze region, clamp to freeze region boundaries
                                                        clampedX = Math.max(
                                                                scaledRowHeaderWidth, // Scaled to display pixels
                                                                Math.min(
                                                                        editorX,
                                                                        scaledFreezeRegionWidth - editorWidth, // Don't overflow beyond freeze region (scaled)
                                                                ),
                                                        );
                                                } else {
                                                        // If in scrollable region, ensure editor doesn't start before freezeRegionWidth
                                                        clampedX = Math.max(
                                                                Math.max(
                                                                        scaledRowHeaderWidth,
                                                                        scaledFreezeRegionWidth,
                                                                ), // Scaled to display pixels
                                                                Math.min(
                                                                        editorX,
                                                                        containerSize.width - editorWidth, // Don't overflow right (already in display pixels)
                                                                ),
                                                        );
                                                }
                                                const clampedY = Math.max(
                                                        scaledHeaderHeight, // Scaled to display pixels
                                                        Math.min(
                                                                editorY,
                                                                containerSize.height -
                                                                        FOOTER_HEIGHT -
                                                                        finalEditorHeight, // Already in display pixels
                                                        ),
                                                );

                                                // OPTION B: Editor uses fixed viewport position
                                                // No need for detailed logging - editor stays fixed

                                                // CRITICAL: Scale editor content to match canvas rendering
                                                // The rect passed to editor is in display pixels (already scaled)
                                                // But editor content (text, icons, buttons) uses fixed sizes from theme
                                                // We need to apply CSS transform scale to match the zoom level
                                                // Since rect is already scaled, we pass logical rect and scale the wrapper
                                                const contentZoomScale = zoomLevel / 100;

                                                // Convert scaled dimensions back to logical for editor
                                                // Editor will render at logical size, then transform scales it to match canvas
                                                const logicalEditorWidth =
                                                        editorWidth / contentZoomScale;
                                                const logicalEditorHeight =
                                                        finalEditorHeight / contentZoomScale;

                                                return (
                                                        <div
                                                                style={{
                                                                        position: "absolute",
                                                                        left: 0,
                                                                        top: 0,
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        pointerEvents: "none", // Like Teable: outer div has pointerEvents: none
                                                                        zIndex: 10,
                                                                }}
                                                                onWheel={(e) => {
                                                                        // FIX: Prevent wheel events from reaching canvas when mouse is over editor area
                                                                        // Check if the event target is within the editor container
                                                                        const target = e.target as HTMLElement;
                                                                        const editorContainer = target.closest(
                                                                                "[data-editor-container]",
                                                                        );
                                                                        if (editorContainer) {
                                                                                // Mouse is over editor, prevent canvas scroll
                                                                                e.stopPropagation();
                                                                        }
                                                                }}
                                                        >
                                                                {/* CRITICAL: Transform wrapper scales editor content to match zoom */}
                                                                {/* Position at scaled coordinates, but scale content to match canvas rendering */}
                                                                <div
                                                                        style={{
                                                                                position: "absolute",
                                                                                left: clampedX,
                                                                                top: clampedY,
                                                                                width: logicalEditorWidth,
                                                                                height: logicalEditorHeight,
                                                                                transform: `scale(${contentZoomScale})`,
                                                                                transformOrigin: "top left",
                                                                                pointerEvents: "auto", // Enable interaction with scaled content
                                                                        }}
                                                                >
                                                                        <EditorComponent
                                                                                cell={cell as any}
                                                                                column={column}
                                                                                rect={{
                                                                                        // Pass logical coordinates - transform will scale them
                                                                                        x: 0, // Relative to transform container
                                                                                        y: 0, // Relative to transform container
                                                                                        width: logicalEditorWidth, // Logical width
                                                                                        height: logicalEditorHeight, // Logical height
                                                                                }}
                                                                                theme={theme}
                                                                                isEditing={true}
                                                                                totalHeight={cellTotalHeight} // Logical height (not scaled)
                                                                                onEnterKey={(shiftKey) => {
                                                                                        // FIX ISSUE 1: Handle Enter key navigation after editor closes
                                                                                        if (!activeCell) return;

                                                                                        const direction = shiftKey ? -1 : 1;
                                                                                        const targetRow =
                                                                                                findVisibleRealRow(
                                                                                                        activeCell.row,
                                                                                                        direction,
                                                                                                );

                                                                                        // Create new single-cell selection (like Teable)
                                                                                        const newRange: [number, number] = [
                                                                                                activeCell.col,
                                                                                                targetRow,
                                                                                        ];
                                                                                        const newSelection =
                                                                                                selection?.set(
                                                                                                        "Cells" as any,
                                                                                                        [newRange, newRange], // Single cell selection
                                                                                                ) || null;

                                                                                        // FIX ISSUE 3: Ensure editor is fully closed before navigation
                                                                                        // Use requestAnimationFrame to ensure DOM updates complete
                                                                                        requestAnimationFrame(() => {
                                                                                                if (newSelection)
                                                                                                        setSelection?.(
                                                                                                                newSelection,
                                                                                                        );
                                                                                                setActiveCell({
                                                                                                        row: targetRow,
                                                                                                        col: activeCell.col,
                                                                                                });
                                                                                                scrollToCell?.(
                                                                                                        targetRow,
                                                                                                        activeCell.col,
                                                                                                );
                                                                                        });
                                                                                }}
                                                                                onChange={(value) => {
                                                                                        // Handle cell value change - this is the SAVE operation
                                                                                        // Format displayData based on cell type
                                                                                        let displayDataValue: string;

                                                                                        // Check if this is an Address cell
                                                                                        if (
                                                                                                cell?.type === CellType.Address
                                                                                        ) {
                                                                                                // Address cells: value is a JSON string, parse and format as comma-separated string
                                                                                                const { parsedValue } =
                                                                                                        validateAndParseAddress(
                                                                                                                value,
                                                                                                        );
                                                                                                displayDataValue =
                                                                                                        getAddress(parsedValue);
                                                                                        } else if (Array.isArray(value)) {
                                                                                                // For MCQ: array of strings -> JSON string for display
                                                                                                displayDataValue =
                                                                                                        JSON.stringify(value);
                                                                                        } else if (
                                                                                                value &&
                                                                                                typeof value === "object" &&
                                                                                                !Array.isArray(value) &&
                                                                                                value.countryCode !== undefined
                                                                                        ) {
                                                                                                // For PhoneNumber: object with countryCode, countryNumber, phoneNumber -> JSON string for display
                                                                                                displayDataValue =
                                                                                                        JSON.stringify(value);
                                                                                        } else {
                                                                                                // For other cell types: convert to string
                                                                                                displayDataValue = String(
                                                                                                        value || "",
                                                                                                );
                                                                                        }

                                                                                        const newCell = {
                                                                                                ...cell,
                                                                                                data: value,
                                                                                                displayData: displayDataValue,
                                                                                        } as any;

                                                                                        // CRITICAL: Convert linear row index to real row index when grouping is active
                                                                                        // editingCell.row is the linear index (includes group headers)
                                                                                        // We need the real index (position in records array) for onCellChange
                                                                                        let realRowIndexForChange =
                                                                                                editingCell.row;
                                                                                        if (
                                                                                                hasGrouping &&
                                                                                                linearRows &&
                                                                                                editingCell.row >= 0 &&
                                                                                                editingCell.row <
                                                                                                        linearRows.length
                                                                                        ) {
                                                                                                const linearRow =
                                                                                                        linearRows[editingCell.row];
                                                                                                // Skip if it's a group header or append row (shouldn't happen, but safety check)
                                                                                                if (
                                                                                                        linearRow?.type ===
                                                                                                                LinearRowType.Group ||
                                                                                                        linearRow?.type ===
                                                                                                                LinearRowType.Append
                                                                                                ) {
                                                                                                        return;
                                                                                                }
                                                                                                realRowIndexForChange =
                                                                                                        linearRow?.realIndex ??
                                                                                                        editingCell.row;
                                                                                        }

                                                                                        onCellChange?.(
                                                                                                realRowIndexForChange,
                                                                                                editingCell.col,
                                                                                                newCell,
                                                                                        );
                                                                                        // Force re-render to update UI immediately
                                                                                        setForceUpdate((prev) => prev + 1);
                                                                                }}
                                                                                onSave={async () => {
                                                                                        // COMMENTED OUT: Backend save logic for now
                                                                                        // const result = await saveCell(
                                                                                        //   editingCell.row,
                                                                                        //   editingCell.col,
                                                                                        //   cell.data,
                                                                                        //   cell.type
                                                                                        // );

                                                                                        // if (result.success) {
                                                                                        //   setEditingCell(null);
                                                                                        // }
                                                                                        // If save fails, keep editor open to show error

                                                                                        // Just close the editor for now
                                                                                        setEditingCell(null);
                                                                                        setFixedEditorPosition(null); // OPTION B: Clear fixed position when editor closes
                                                                                }}
                                                                                onCancel={() => {
                                                                                        setEditingCell(null);
                                                                                        setFixedEditorPosition(null); // OPTION B: Clear fixed position when editor closes
                                                                                }}
                                                                        />
                                                                </div>
                                                        </div>
                                                );
                                        })()}
                        </div>

                        {/* ========================================
                                PHASE 1 ADDITION: Context Menus
                                ======================================== */}
                        <RecordMenu />
                        <HeaderMenu />

                        {/* ========================================
                                PHASE 2A ADDITION: Confirmation Dialog
                                ======================================== */}
                        {confirmDialog}

                        {/* ========================================
                                PHASE 2 ADDITION: InfiniteScroller
                                ======================================== */}
                        <InfiniteScroller
                                ref={scrollerRef}
                                coordInstance={coordinateManager}
                                containerWidth={containerSize.width}
                                containerHeight={containerSize.height - FOOTER_HEIGHT} // Full container minus footer (for scrollbar positioning, like Teable)
                                scrollWidth={(() => {
                                        // CRITICAL: scrollWidth should represent only scrollable columns (excluding frozen columns)
                                        // This ensures the scrollbar length correctly reflects only scrollable content
                                        // When scrolling reaches maxScrollLeft, the last scrollable column (add column button) is visible
                                        // and frozen columns remain visible without getting clipped
                                        const zoomScale = zoomLevel / 100;
                                        // scrollableContentWidth is already in logical space (only scrollable columns)
                                        // Scale by zoom to get display pixels
                                        return scrollableContentWidth * zoomScale;
                                })()}
                                scrollHeight={
                                        (contentDimensions.totalHeight + SCROLL_BUFFER) *
                                        (zoomLevel / 100)
                                } // Scale scroll height by zoom level (content is zoomed, so scrollable area must match)
                                containerRef={containerRef}
                                scrollState={scrollState}
                                setScrollState={setScrollState}
                                smoothScrollX={true} // Enable smooth horizontal scrolling
                                smoothScrollY={true} // Enable smooth vertical scrolling
                                scrollEnable={true} // Enable scrolling
                                getLinearRow={getLinearRow} // Pass getLinearRow function
                                zoomLevel={zoomLevel} // Pass zoom level for scroll position conversion
                                onScrollChanged={(scrollLeft, scrollTop) => {
                                        // Scroll positions are already converted to logical space in InfiniteScroller
                                        // CRITICAL: Update virtual scrolling's visible range via setScrollPosition
                                        // This ensures visibleIndices is recalculated correctly
                                        setScrollPosition(scrollTop, scrollLeft);

                                        // Also update GridView's scrollState for canvas rendering
                                        setScrollState((prev) => ({
                                                ...prev,
                                                scrollLeft,
                                                scrollTop,
                                                isScrolling: true,
                                        }));
                                }}
                                onVisibleRegionChanged={handleVisibleRegionChanged} // Handle visible region changes
                                scrollBarVisible={needsHorizontalScrollbar} // Like Teable: Show only when needed
                                top={headerHeight} // Position scrollbars below header (like Teable)
                                left={(() => {
                                        // CRITICAL: Scrollbar should start after frozen columns
                                        // When there are frozen columns, row header is part of the freeze region
                                        // but the scrollable viewport starts after the freeze region
                                        // When there are NO frozen columns, scrollbar starts after row header
                                        const freezeColumnCount =
                                                coordinateManager.freezeColumnCount;
                                        if (freezeColumnCount > 0) {
                                                // With frozen columns: scrollbar starts after freeze region (includes row header + frozen columns)
                                                return coordinateManager.freezeRegionWidth;
                                        } else {
                                                // No frozen columns: scrollbar starts after row header only
                                                return rowHeaderWidth;
                                        }
                                })()}
                        />

                        {/* ========================================
                                PHASE 2C: Add Column Popover removed - now using FieldModal
                                FieldModal is handled in MainPage component
                                ======================================== */}

                        {/* Freeze Column Warning Modal - Shows when window is too narrow (like Airtable) */}
                        <FreezeColumnWarningModal
                                open={warningState.show}
                                requestedCount={warningState.requestedCount}
                                actualCount={warningState.actualCount}
                                onReset={handleResetToActual}
                                onCancel={handleCancel}
                        />

                        {/* Statistics Menu - Dropdown for selecting column statistics */}
                        {statisticsMenu.columnId && (
                                <StatisticsMenu
                                        open={statisticsMenu.open}
                                        anchorPosition={
                                                statisticsMenu.position
                                                        ? {
                                                                        top: statisticsMenu.position.y,
                                                                        left: statisticsMenu.position.x,
                                                                }
                                                        : undefined
                                        }
                                        onClose={closeStatisticsMenu}
                                        columnId={statisticsMenu.columnId}
                                        currentStatistic={getColumnStatistic(
                                                statisticsMenu.columnId,
                                        )}
                                />
                        )}
                </div>
        );
};

export default Grid;
