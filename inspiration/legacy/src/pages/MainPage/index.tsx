// Inspired by Teable's main application component
import { showAlert } from "oute-ds-alert";
import GridView from "@/views/grid/GridView";
import { KanbanView } from "@/views/kanban";
import {
	CellType,
	ICell,
	IColumn,
	IGridConfig,
	IGridTheme,
	ITableData,
	ROW_HEIGHT_DEFINITIONS,
} from "@/types";
import getSocketInstance from "@/common/websocket/client";
import {
	useCallback,
	useMemo,
	useState,
	useRef,
	useEffect,
	useContext,
} from "react";
// @ts-ignore - TabBar is authored in JSX
import TabBar from "./components/TabBar/index.jsx";

// Layout components
import Sidebar from "./components/Sidebar";
// @ts-ignore - HeaderCopy is authored in JSX
import Header from "./components/HeaderCopy";
import SubHeader from "./components/SubHeader";
import { isDefaultView } from "@/types/view";
// import TableSkeleton from "@/components/TableSkeleton";
// @ts-ignore - TableSkeleton is authored in JSX
import TableSkeleton from "../../components/TableSkeleton/index.jsx";
// @ts-ignore - FieldModal is authored in JSX
import FieldModal from "@/components/FieldModal";
// Expanded Record Component
import { ExpandedRecord } from "@/components/expanded-record";

// Hooks
import useSheetLifecycle, { formatCell } from "./hooks/useSheetLifecycle";
import useUpdateKanbanViewOptions from "./hooks/useUpdateKanbanViewOptions";
import useDeleteField from "@/hooks/useDeleteField";

// Utilities
import {
	deleteRecords,
	insertRecords,
	duplicateRecord,
} from "@/utils/recordOperations";
import { duplicateColumn } from "@/utils/columnOperations";
import { calculateFieldOrder } from "@/utils/orderUtils";
import {
	preloadAllColumnHeaderIcons,
	preloadChevronDownIcon,
	preloadWarningIcon,
} from "@/utils/columnHeaderIcons";
import { extractGroupByValuesFromRecord } from "@/utils/grouping/extractGroupByValuesFromRecord";
import { groupPointsToLinearRows } from "@/utils/grouping/groupPointsToLinearRows";
import { LinearRowType } from "@/types";
import type { IGroupConfig } from "@/types/grouping";

// Zustand store
import { useUIStore } from "@/stores/uiStore";
import { useFieldsStore } from "@/stores/fieldsStore";
import { useViewStore } from "@/stores/viewStore";
// Context
import { SheetsContext } from "@/context/SheetsContext";
import getAssetAccessDetails from "./utils/getAssetAccessDetails";
// Hooks
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import { encodeParams } from "@/utils/encodeDecodeUrl";

const defaultTheme: IGridTheme = {
	cellTextColor: "#333333",
	cellBackgroundColor: "#ffffff",
	cellBorderColor: "#e0e0e0",
	cellHoverColor: "#f5f5f5",
	cellSelectedColor: "#e3f2fd",
	cellActiveColor: "#ffffff",
	// Header colors (like Teable)
	columnHeaderBg: "#fafafa",
	columnHeaderBgHovered: "#f1f5f9",
	rowHeaderTextColor: "#666666",
	cellLineColor: "#e0e0e0",
	// Group header colors (like Teable - matches slate colors)
	groupHeaderBgPrimary: "#f8fafc", // slate[50]
	groupHeaderBgSecondary: "#f1f5f9", // slate[100]
	groupHeaderBgTertiary: "#e2e8f0", // slate[200]
	// Font settings
	cellActiveBorderColor: "#212121", // black border for active cell
	fontFamily:
		'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
	fontSize: 13,
	fontSizeXS: 11, // For footer/statistics
	fontSizeSM: 13, // Small font size (like Teable)
	lineHeight: 20,
	// Icon sizes (like Teable)
	iconSizeSM: 20, // Small icon size (like Teable)
	iconSizeXS: 16, // Extra small icon size (like Teable) - for checkboxes
	// Cell padding (like Teable)
	cellHorizontalPadding: 8, // Horizontal padding (like Teable)
	cellVerticalPaddingSM: 6, // Small vertical padding (like Teable)
	// Row header icon padding (like Teable)
	rowHeadIconPaddingTop: 8, // Vertical padding for icons in row headers (like Teable)
	// Checkbox colors (like Teable)
	iconBgSelected: "#1976d2", // Background color for selected checkbox (like Teable)
	staticWhite: "#ffffff", // White color for checkmark stroke (like Teable)
	// Interaction line colors (like Teable)
	interactionLineColorHighlight: "#1890ff", // Color for freeze handler line (like Teable)
	interactionLineColorCommon: "rgba(0, 0, 0, 0.2)", // Color for divider line (like Teable)
	// Sort and Filter column colors
	sortColumnBg: "#fefce8", // Light yellow for sorted columns
	filterColumnBg: "#eff6ff", // Light blue for filtered columns
	// Footer (summary bar) - polished, UI-friendly
	footerBg: "#f1f5f9",
	footerBorderColor: "#cbd5e1",
	footerTextPrimary: "#0f172a",
	footerTextSecondary: "#475569",
	footerHoverBg: "#e2e8f0",
	footerShadowColor: "rgba(0, 0, 0, 0.06)",
	footerRecordCountBg: "#e2e8f0",
	footerDividerColor: "#cbd5e1",
};

type CreationModalState = {
	open: boolean;
	colIndex: number;
	editField: any;
	newFieldOrder: number | null;
	columnId: string | null;
	position: "left" | "right" | "append" | null;
	anchorPosition: { x: number; y: number } | null;
};

type ExtendedUIColumn = IColumn & {
	rawType?: string;
	rawOptions?: any;
	rawId?: string | number;
	dbFieldName?: string;
	description?: string | null;
	computedFieldMeta?: any;
	fieldFormat?: string;
	entityType?: string;
	identifier?: any;
	fieldsToEnrich?: any;
	status?: string; // Optional status property
	order?: number;
};

const INITIAL_CREATION_MODAL_STATE: CreationModalState = {
	open: false,
	colIndex: -1,
	editField: null,
	newFieldOrder: null,
	columnId: null,
	position: null,
	anchorPosition: null,
};

function MainPage() {
	// Preload ALL column header icons as early as possible
	// This ensures icons are ready before the grid renders
	useEffect(() => {
		// Start preloading all icons immediately when MainPage mounts
		preloadAllColumnHeaderIcons().catch(() => {
			// Ignore errors, continue even if some icons fail
		});
		preloadChevronDownIcon().catch(() => {
			// Ignore errors
		});
		preloadWarningIcon().catch(() => {
			// Ignore errors
		});
	}, []); // Run once on mount

	// View Store Integration
	const {
		setCurrentView,
		currentViewId,
		views: viewStoreViews,
	} = useViewStore();
	const {
		tableId: urlTableId,
		assetId: urlBaseId,
		viewId: urlViewId,
		setSearchParams,
		decodedParams,
	} = useDecodedUrlParams();

	// Ref to track if we're updating URL to prevent loops
	const isUpdatingUrlRef = useRef(false);
	const lastSyncedViewIdRef = useRef<string | null>(null);

	/**
	 * Normalize view type - default to "grid" if type is unknown
	 * @param viewType - The view type from the view object
	 * @returns "grid" | "kanban" - normalized view type
	 */
	const normalizeViewType = useCallback(
		(viewType: string): "grid" | "kanban" => {
			if (viewType === "kanban") return "kanban";
			// default_grid and grid both show grid UI
			if (viewType === "default_grid" || viewType === "grid") return "grid";
			return "grid";
		},
		[],
	);

	// Sync viewId from URL when views are loaded
	// This ensures we have views available before trying to match
	useEffect(() => {
		if (
			viewStoreViews.length > 0 &&
			urlViewId &&
			urlViewId !== currentViewId &&
			!isUpdatingUrlRef.current
		) {
			// Find view by ID in the loaded views
			const foundView = viewStoreViews.find((v) => v.id === urlViewId);
			if (foundView) {
				lastSyncedViewIdRef.current = urlViewId;
				setCurrentView(urlViewId);
				// Update UI store with view type (default to "grid" if unknown)
				const normalizedType = normalizeViewType(foundView.type);
				const { setCurrentView: setUIView } = useUIStore.getState();
				setUIView(normalizedType);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [urlViewId, viewStoreViews, normalizeViewType]); // Include viewStoreViews to re-run when views are loaded

	// Update URL and UI store when currentViewId changes (but not if we just synced from URL)
	useEffect(() => {
		if (
			currentViewId &&
			currentViewId !== urlViewId &&
			// currentViewId !== lastSyncedViewIdRef.current &&
			decodedParams &&
			!isUpdatingUrlRef.current
		) {
			isUpdatingUrlRef.current = true;
			const newParams = {
				...decodedParams,
				v: currentViewId,
			};
			const encoded = encodeParams(newParams);
			const newSearchParams = new URLSearchParams();
			newSearchParams.set("q", encoded);
			setSearchParams(newSearchParams);

			// Update UI store based on view type (default to "grid" if unknown)
			const foundView = viewStoreViews.find(
				(v) => v.id === currentViewId,
			);

			if (foundView) {
				const normalizedType = normalizeViewType(foundView.type);
				const { setCurrentView: setUIView } = useUIStore.getState();
				setUIView(normalizedType);
			}

			// Reset flag after a short delay
			setTimeout(() => {
				isUpdatingUrlRef.current = false;
			}, 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentViewId, viewStoreViews]); // Include viewStoreViews to ensure we have views

	const socket = getSocketInstance();

	// Ref to store clearCellLoading function from GridView
	const clearCellLoadingRef = useRef<
		((rowId: string, fieldId: string) => void) | null
	>(null);
	// Ref to store setCellLoading function from GridView
	const setCellLoadingRef = useRef<
		((fieldId: string, isLoading: boolean) => void) | null
	>(null);

	const {
		sheet,
		setSheet,
		view,
		setView,
		tableList,
		setTableList,
		handleTabClick,
		leaveRoom,
		allColumns, // All fields including hidden
		visibleColumns: visibleColumnsForGrid, // Explicit filtered columns
		records,
		setRecords,
		rowHeaders,
		setRowHeaders,
		groupPoints,
		isTableLoading,
		emitRowCreate,
		emitRowUpdate,
		emitRowUpdates,
		deleteRecordsRequest,
		fetchRecords,
		hasNewRecords,
		clearHasNewRecords,
		assetId,
		tableId: activeTableId,
		viewId: activeViewId,
		applyFieldUpdate,
	} = useSheetLifecycle({
		socket,
		onClearCellLoading: (rowId: string, fieldId: string) => {
			// Call the function stored in ref (if available)
			// This will be set when GridView mounts
			clearCellLoadingRef.current?.(rowId, fieldId);
		},
		onSetCellLoading: (fieldId: string, isLoading: boolean) => {
			// Call the function stored in ref (if available)
			// This will be set when GridView mounts
			setCellLoadingRef.current?.(fieldId, isLoading);
		},
	});

	const { zoomLevel, setZoomLevel, rowHeightLevel, currentView } =
		useUIStore();
	const { setAllColumns, updateColumn } = useFieldsStore();

	// Use visibleColumns for grid/kanban views, allColumns for field selection
	const columns = visibleColumnsForGrid; // For grid/kanban display

	// Hook for updating Kanban view options
	const { updateKanbanViewOptions, loading: updateKanbanViewLoading } =
		useUpdateKanbanViewOptions();

	// Get permissions from context
	const context = useContext(SheetsContext);
	const { isViewOnly } = useMemo(
		() => getAssetAccessDetails(context?.assetAccessDetails),
		[context?.assetAccessDetails],
	);

	// Always use the actual view data from the backend (matches by view ID)
	// This ensures we use all view data: sort, filter, fields, group, options, etc.
	const activeView = useMemo(() => {
		return view;
	}, [view]);

	const canEditRecords = isDefaultView(activeView);
	const canEditFields = isDefaultView(activeView);

	// Note: groupBy is now managed by the backend view data
	// When switching views, the backend provides the correct groupBy configuration

	// Resolve Kanban view from store by activeViewId when on Kanban.
	// Use this so we always have the correct view (and options) when switching back to Kanban,
	// even before lifecycle `view` state has synced — avoids "no stackfield data" on view switch.
	const kanbanViewForOptions = useMemo(() => {
		if (currentView !== "kanban" || !activeViewId) return null;
		return viewStoreViews.find((v) => v.id === activeViewId) ?? null;
	}, [currentView, activeViewId, viewStoreViews]);

	// Extract Kanban options from view (use store-derived view first, then lifecycle view)
	const kanbanOptions = useMemo(() => {
		if (currentView !== "kanban") return undefined;

		const viewToUse = kanbanViewForOptions ?? activeView;
		// Use options from the actual view data (always an object from backend)
		if (viewToUse?.options && typeof viewToUse.options === "object") {
			return viewToUse.options;
		}

		// Fallback: find first SCQ field for stacking (only if view doesn't have options)
		// IMPORTANT: Use rawId (actual field ID) instead of id (dbFieldName)
		const scqField = columns?.find(
			(col) =>
				col.type === CellType.SCQ || col.type === CellType.DropDown,
		);

		if (!scqField) {
			return undefined;
		}

		// Use rawId (actual field ID) for stackFieldId, fallback to id for compatibility
		const stackFieldId = (scqField as any).rawId ?? scqField.id;

		return {
			stackFieldId,
			coverFieldId: null,
			isCoverFit: false,
			isFieldNameHidden: false,
			isEmptyStackHidden: false,
		};
	}, [columns, currentView, kanbanViewForOptions, activeView?.options]);

	// Define these functions early to avoid hoisting issues
	const replaceTableState = useCallback(
		(next: ITableData) => {
			setAllColumns(
				next.columns as Array<
					IColumn & { rawType?: string; rawOptions?: any }
				>,
			);
			setRecords(next.records);
			setRowHeaders(next.rowHeaders);
		},
		[setAllColumns, setRecords, setRowHeaders],
	);

	const getTableSnapshot = useCallback(
		(): ITableData => ({
			columns,
			records,
			rowHeaders,
		}),
		[columns, records, rowHeaders],
	);

	const [creationModal, setCreationModal] = useState<CreationModalState>(
		INITIAL_CREATION_MODAL_STATE,
	);

	// Phase 2: Expanded Record state management
	const [expandedRecordId, setExpandedRecordId] = useState<string | null>(
		null,
	);

	const columnHeaderRefs = useRef<(HTMLDivElement | null)[]>([]);

	const viewFields = useMemo(() => {
		if (Array.isArray(activeView?.fields) && activeView.fields.length) {
			return activeView.fields;
		}
		return [];
	}, [activeView]);

	// Convert columns to fields format for FieldModal
	const fieldsForModal = useMemo(() => {
		if (viewFields.length) {
			return viewFields;
		}

		return columns.map((col, index) => {
			const extendedCol = col as ExtendedUIColumn;

			return {
				id: extendedCol.rawId ?? extendedCol.id,
				name: extendedCol.name,
				// Always use rawType for field type, never the cell type (extendedCol.type)
				type: extendedCol.rawType || "SHORT_TEXT",
				order: extendedCol.order ?? index + 1,
				dbFieldName: extendedCol.dbFieldName ?? extendedCol.id,
				description: extendedCol.description ?? "",
				options: extendedCol.rawOptions,
				computedFieldMeta: extendedCol.computedFieldMeta,
				fieldFormat: extendedCol.fieldFormat,
				entityType: extendedCol.entityType,
				identifier: extendedCol.identifier,
				fieldsToEnrich: extendedCol.fieldsToEnrich,
				status: (extendedCol as any).status, // Include status if present
			};
		});
	}, [columns, viewFields]);

	useEffect(() => {
		if (!creationModal.open || !creationModal.editField) {
			return;
		}

		const targetDbName = creationModal.editField.dbFieldName;
		const targetId = creationModal.editField.id;

		const latestField = fieldsForModal.find((field: any) => {
			if (targetDbName) {
				return field.dbFieldName === targetDbName;
			}
			return String(field.id) === String(targetId);
		});

		if (!latestField) {
			return;
		}

		const prevField = creationModal.editField;
		const compareKeys: Array<string> = [
			"name",
			"description",
			"type",
			"order",
			"fieldFormat",
			"entityType",
		];

		let hasDiff = compareKeys.some((key) => {
			return latestField[key] !== prevField[key];
		});

		if (
			!hasDiff &&
			(latestField.options !== undefined ||
				prevField.options !== undefined)
		) {
			hasDiff =
				JSON.stringify(latestField.options ?? null) !==
				JSON.stringify(prevField.options ?? null);
		}

		if (
			!hasDiff &&
			(latestField.computedFieldMeta !== undefined ||
				prevField.computedFieldMeta !== undefined)
		) {
			hasDiff =
				JSON.stringify(latestField.computedFieldMeta ?? null) !==
				JSON.stringify(prevField.computedFieldMeta ?? null);
		}

		if (
			!hasDiff &&
			(latestField.fieldsToEnrich !== undefined ||
				prevField.fieldsToEnrich !== undefined)
		) {
			hasDiff =
				JSON.stringify(latestField.fieldsToEnrich ?? null) !==
				JSON.stringify(prevField.fieldsToEnrich ?? null);
		}

		if (!hasDiff) {
			return;
		}

		setCreationModal((prev) => {
			if (!prev.open || !prev.editField) {
				return prev;
			}
			return {
				...prev,
				editField: {
					...prev.editField,
					...latestField,
					// Ensure type is always set - preserve existing type if latestField doesn't have one
					type:
						latestField.type || prev.editField.type || "SHORT_TEXT",
				},
			};
		});
	}, [
		creationModal.open,
		creationModal.editField,
		fieldsForModal,
		setCreationModal,
	]);

	const config = useMemo<IGridConfig & { tableId?: string; viewId?: string }>(
		() => ({
			rowHeight: ROW_HEIGHT_DEFINITIONS[rowHeightLevel],
			columnWidth: 120,
			headerHeight: 40,
			freezeColumns:
				view?.options?.freezeColumns ??
				view?.columnMeta?.freezeColumns ??
				1,
			virtualScrolling: true,
			theme: defaultTheme,
			rowHeaderWidth: 70,
			showRowNumbers: true,
			tableId: activeTableId,
			viewId: activeViewId,
		}),
		[
			rowHeightLevel,
			view?.options?.freezeColumns,
			view?.columnMeta?.freezeColumns,
			activeTableId,
			activeViewId,
		],
	);

	const statsColumns = columns ?? [];
	const statsRecords = records ?? [];
	const isLoading = isTableLoading || !columns.length;

	const handleFilterChange = useCallback(
		(nextFilter: Record<string, unknown>) => {
			setView((prev: Record<string, unknown> | undefined) => ({
				...(prev || {}),
				filter: nextFilter,
			}));
		},
		[setView],
	);

	// CRITICAL: Memoize group prop to ensure new reference when view.group changes
	// This ensures activeGroupConfig memo in GridView recalculates correctly
	// Create a content-based key to detect ANY changes in groupObjs (including order, fieldId, etc.)
	const groupKey = useMemo(() => {
		if (!activeView?.group || !(activeView.group as any)?.groupObjs) {
			// console.log(
			// 	"🔄 [groupKey] No group or groupObjs, returning empty string",
			// );
			return "";
		}
		// Use JSON.stringify to create a content-based key that changes when ANY property changes
		// This ensures we detect changes even if the object reference is the same
		const key = JSON.stringify(
			(activeView.group as any).groupObjs.map((obj: any) => ({
				fieldId:
					typeof obj.fieldId === "string"
						? Number(obj.fieldId)
						: obj.fieldId,
				order: obj.order || "asc",
				dbFieldName: obj.dbFieldName,
				type: obj.type,
			})),
		);
		return key;
	}, [activeView?.group]);

	const groupProp = useMemo(() => {
		if (!activeView?.group) {
			// console.log("🔄 [groupProp] No group, returning undefined");
			return undefined;
		}

		// Always create a new object reference for group prop
		// This ensures React detects changes and memo dependencies recalculate
		// Use groupKey (content-based) as dependency to ensure recalculation when content changes
		const groupData = activeView.group as Record<string, unknown>;
		const newGroupProp = {
			...groupData,
			// CRITICAL: Create new array reference to ensure React detects change
			groupObjs: Array.isArray(groupData?.groupObjs)
				? groupData.groupObjs.map((obj: any) => ({
						// Create new object reference for each groupObj
						...obj,
						fieldId:
							typeof obj.fieldId === "string"
								? Number(obj.fieldId)
								: obj.fieldId,
					}))
				: groupData?.groupObjs || [],
		};

		return newGroupProp;
	}, [activeView?.group, groupKey]);

	const filterFields = useMemo(() => {
		if (Array.isArray(activeView?.fields) && activeView.fields.length > 0) {
			return activeView.fields;
		}

		return columns.map((column, index) => ({
			id: column.rawId ?? column.id ?? index,
			name: column.name,
			type: column.rawType || "SHORT_TEXT",
			dbFieldName: column.dbFieldName ?? column.id,
			options: column.rawOptions ?? column.options,
		}));
	}, [view, columns]);

	const stringCount = statsColumns.filter(
		(column) => column.type === CellType.String,
	).length;
	const numberCount = statsColumns.filter(
		(column) => column.type === CellType.Number,
	).length;
	const mcqCount = statsColumns.filter(
		(column) => column.type === CellType.MCQ,
	).length;
	const phoneCount = statsColumns.filter(
		(column) => column.type === CellType.PhoneNumber,
	).length;

	const handleCellChange = (
		rowIndex: number,
		columnIndex: number,
		newValue: ICell,
	) => {
		const column = columns[columnIndex];
		if (!column) return;

		// Convert linear row index to real row index when grouping is active
		// rowIndex from GridView is a linear index (includes group headers and append rows)
		// We need the real index (position in records array) to update the correct record
		let realRowIndex = rowIndex;
		let isValidRow = true;
		const hasGrouping =
			groupPoints &&
			groupPoints.length > 0 &&
			view?.group?.groupObjs?.length > 0;

		if (hasGrouping) {
			// Use same hasAppendRow logic as GridView (typically true for grouped views)
			const hasAppendRow = true;
			const transformationResult = groupPointsToLinearRows(
				groupPoints,
				hasAppendRow,
				40,
				40,
			);
			const linearRows = transformationResult?.linearRows;

			if (linearRows && rowIndex >= 0 && rowIndex < linearRows.length) {
				const linearRow = linearRows[rowIndex];

				// Skip group headers - they are not editable records
				if (linearRow?.type === LinearRowType.Group) {
					return;
				}

				// Skip append rows - they are for creating new records, not updating existing ones
				if (linearRow?.type === LinearRowType.Append) {
					return;
				}

				// Get real index from linear row (realIndex is the position in records array)
				// CRITICAL: realIndex must be >= 0 for actual records (group headers have realIndex: -1)
				realRowIndex = linearRow?.realIndex ?? rowIndex;

				// Validate realIndex is within bounds and is a valid record (not group header)
				if (realRowIndex < 0 || realRowIndex >= records.length) {
					isValidRow = false;
				}
			} else {
				// Linear row not found - might be out of bounds
				isValidRow = false;
			}
		} else {
			// No grouping - validate rowIndex is within bounds
			if (rowIndex < 0 || rowIndex >= records.length) {
				isValidRow = false;
			}
		}

		if (!isValidRow) {
			return;
		}

		const recordToUpdate = records[realRowIndex];

		setRecords((prevRecords) =>
			prevRecords.map((record, idx) =>
				idx === realRowIndex
					? {
							...record,
							cells: {
								...record.cells,
								[column.id]: newValue,
							},
						}
					: record,
			),
		);

		if (emitRowUpdate) {
			emitRowUpdate(realRowIndex, columnIndex, newValue);
		}
	};

	const handleCellsChange = (
		updates: Array<{
			rowIndex: number;
			columnIndex: number;
			cell: ICell;
		}>,
	) => {
		if (!updates.length) return;

		// Convert linear row indices to real row indices when grouping is active
		const hasGrouping =
			groupPoints &&
			groupPoints.length > 0 &&
			view?.group?.groupObjs?.length > 0;

		let linearRows: any[] | null = null;
		if (hasGrouping) {
			// Use same hasAppendRow logic as GridView
			const hasAppendRow = true;
			const transformationResult = groupPointsToLinearRows(
				groupPoints,
				hasAppendRow,
				40,
				40,
			);
			linearRows = transformationResult?.linearRows || null;
		}

		// Map updates: convert linear rowIndex to real rowIndex
		const updatesWithRealIndices = updates
			.map((update) => {
				let realRowIndex = update.rowIndex;

				if (
					hasGrouping &&
					linearRows &&
					update.rowIndex >= 0 &&
					update.rowIndex < linearRows.length
				) {
					const linearRow = linearRows[update.rowIndex];
					// Skip group headers - they are not editable records
					if (linearRow?.type === LinearRowType.Group) {
						return null; // Filter out group header updates
					}
					// Skip append rows - they are for creating new records, not updating existing ones
					if (linearRow?.type === LinearRowType.Append) {
						return null; // Filter out append row updates
					}
					realRowIndex = linearRow?.realIndex ?? update.rowIndex;

					// Validate realIndex is within bounds
					if (realRowIndex < 0 || realRowIndex >= records.length) {
						return null;
					}
				} else if (!hasGrouping) {
					// No grouping - validate rowIndex is within bounds
					if (
						update.rowIndex < 0 ||
						update.rowIndex >= records.length
					) {
						return null;
					}
				} else {
					// Linear row not found
					return null;
				}

				return {
					...update,
					realRowIndex,
				};
			})
			.filter(
				(update): update is NonNullable<typeof update> =>
					update !== null,
			);

		if (!updatesWithRealIndices.length) return;

		setRecords((prevRecords) => {
			let hasAnyChanges = false;
			const newRecords = prevRecords.map((record, idx) => {
				const relevantUpdates = updatesWithRealIndices.filter(
					(update) => update.realRowIndex === idx,
				);
				if (!relevantUpdates.length) return record;

				const updatedCells = { ...record.cells };
				let recordChanged = false;
				relevantUpdates.forEach(({ columnIndex, cell }) => {
					const columnId = columns[columnIndex]?.id;
					if (!columnId) return;
					updatedCells[columnId] = cell;
					recordChanged = true;
				});

				if (recordChanged) {
					hasAnyChanges = true;
					return { ...record, cells: updatedCells };
				}
				return record;
			});

			return hasAnyChanges ? newRecords : prevRecords;
		});
	};

	// Shared save handler for expanded record (used by both grid and kanban views)
	const handleExpandedRecordSave = useCallback(
		async (recordId: string, editedFields: Record<string, unknown>) => {
			// Find the real record index
			const realRecordIndex = records.findIndex((r) => r.id === recordId);

			if (realRecordIndex < 0) {
				return;
			}

			// Determine the row index to use for handleCellsChange
			// If grouping exists, we need to find the linear row index
			// If no grouping, we can use the real row index directly
			const hasGrouping =
				groupPoints &&
				groupPoints.length > 0 &&
				view?.group?.groupObjs?.length > 0;

			let rowIndexForUpdate = realRecordIndex;
			if (hasGrouping) {
				// Find linear row index from real row index
				const hasAppendRow = true;
				const transformationResult = groupPointsToLinearRows(
					groupPoints,
					hasAppendRow,
					40,
					40,
				);
				const real2LinearRowMap =
					transformationResult?.real2LinearRowMap;
				if (real2LinearRowMap) {
					rowIndexForUpdate =
						real2LinearRowMap[realRecordIndex] ?? realRecordIndex;
				}
			}

			// Prepare updates array for handleCellsChange
			const updates: Array<{
				rowIndex: number;
				columnIndex: number;
				cell: ICell;
			}> = [];

			// Process all edited fields
			for (const [fieldId, newValue] of Object.entries(editedFields)) {
				// Find the column
				const column = columns.find((col) => col.id === fieldId);
				if (!column) {
					continue;
				}

				// Find the column index
				const columnIndex = columns.findIndex(
					(col) => col.id === fieldId,
				);
				if (columnIndex < 0) {
					continue;
				}

				// Format the cell value properly based on column type
				const cell = formatCell(newValue, column);

				// Add to updates array
				updates.push({
					rowIndex: rowIndexForUpdate,
					columnIndex,
					cell,
				});
			}

			if (updates.length === 0) {
				return;
			}

			// Use handleCellsChange to update records (handles grouping, state updates)
			handleCellsChange(updates);

			// Emit socket events for all updates in a single call
			// Convert updates to use real row index for emitRowUpdates
			const updatesForSocket = updates.map((update) => ({
				rowIndex: realRecordIndex, // Use real row index
				columnIndex: update.columnIndex,
				cell: update.cell,
			}));

			if (emitRowUpdates) {
				await emitRowUpdates(updatesForSocket);
			}
		},
		[
			records,
			columns,
			groupPoints,
			view,
			handleCellsChange,
			emitRowUpdates,
		],
	);

	const handleCellClick = (rowIndex: number, columnIndex: number) => {
		if (rowIndex === -1) return;
	};

	const handleCellDoubleClick = (rowIndex: number, columnIndex: number) => {
		// Phase 2: Temporary - Double-click to open expanded record for testing
		// TODO: Replace with proper expand icon click handler
		// if (rowIndex >= 0 && rowIndex < records.length) {
		// 	const record = records[rowIndex];
		// 	if (record) {
		// 		setExpandedRecordId(record.id);
		// 	}
		// }
	};

	const handleColumnResize = (columnIndex: number, newWidth: number) => {
		// Get the column to find its fieldId (rawId)
		const column = columns[columnIndex];
		if (!column) {
			return;
		}

		// Get fieldId from column (rawId is the actual field ID)
		const fieldId = (column as any).rawId;
		if (!fieldId) {
			return;
		}

		// Update column width in fieldsStore (optimistic update)
		updateColumn(column.id, { width: newWidth });

		// Call API to persist change (using useUpdateColumnMeta hook)
		// Note: This should use the hook, but for now we'll keep the socket emit
		// TODO: Replace with useUpdateColumnMeta hook call
		if (socket && activeTableId && assetId && activeViewId) {
			socket.emit("update_column_meta", {
				tableId: activeTableId,
				baseId: assetId,
				viewId: activeViewId,
				columnMeta: [
					{
						id: fieldId,
						width: newWidth,
					},
				],
			});
		}
	};

	const handleColumnReorder = (newOrder: IColumn[]) => {
		setAllColumns(
			newOrder as Array<IColumn & { rawType?: string; rawOptions?: any }>,
		);
	};

	const handleColumnFreeze = useCallback(
		(freezeColumnCount: number) => {
			// Task 2: Update local view state immediately (optimistic update)
			setView((prev: any) => ({
				...(prev || {}),
				options: {
					...(prev?.options || {}),
					freezeColumns: freezeColumnCount,
				},
			}));

			// Task 3: Emit socket event with freezeColumns
			if (socket && activeTableId && assetId && activeViewId) {
				socket.emit("update_column_meta", {
					tableId: activeTableId,
					baseId: assetId,
					viewId: activeViewId,
					columnMeta: [], // Empty array - we're only updating freezeColumns
					freezeColumns: freezeColumnCount,
				});
			}
		},
		[socket, activeTableId, assetId, activeViewId],
	);

	const handleRowReorder = (rowIndices: number[], dropIndex: number) => {
		const sortedRowIndicesAsc = [...rowIndices].sort((a, b) => a - b);
		const newRecords = [...records];
		const newRowHeadersData = [...rowHeaders];

		const draggedRecords = sortedRowIndicesAsc
			.map((index) => newRecords[index])
			.filter(Boolean);
		const draggedRowHeaders = sortedRowIndicesAsc
			.map((index) => newRowHeadersData[index])
			.filter(Boolean);

		[...sortedRowIndicesAsc]
			.sort((a, b) => b - a)
			.forEach((index) => {
				newRecords.splice(index, 1);
				newRowHeadersData.splice(index, 1);
			});

		let actualDropIndex = dropIndex;
		sortedRowIndicesAsc.forEach((draggedIndex) => {
			if (draggedIndex < dropIndex) {
				actualDropIndex--;
			}
		});
		actualDropIndex = Math.max(0, actualDropIndex);
		actualDropIndex = Math.min(actualDropIndex, newRecords.length);

		newRecords.splice(actualDropIndex, 0, ...draggedRecords);
		newRowHeadersData.splice(actualDropIndex, 0, ...draggedRowHeaders);

		const updatedRowHeaders = newRowHeadersData.map((header, index) => ({
			...header,
			rowIndex: index,
			displayIndex: index + 1,
		}));

		setRecords(newRecords);
		setRowHeaders(updatedRowHeaders);
	};

	const handleDeleteRecords = async (recordIds: string[]) => {
		if (!recordIds.length) return;

		const snapshot = getTableSnapshot();
		const next = deleteRecords(snapshot, recordIds);
		replaceTableState(next);

		try {
			await deleteRecordsRequest(recordIds);
		} catch (error: any) {
			replaceTableState(snapshot);
			showAlert({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to delete records",
			});
		}
	};

	const handleInsertRecord = (
		anchorId: string,
		position: "before" | "after",
		num: number,
	) => {
		// Optimistic update: Insert locally first for immediate UI feedback
		const anchorIndex = records.findIndex((r) => r.id === anchorId);
		if (anchorIndex === -1) {
			return;
		}

		const targetIndex =
			position === "before" ? anchorIndex : anchorIndex + 1;
		const next = insertRecords(
			getTableSnapshot(),
			Math.max(targetIndex, 0),
			num,
			undefined,
		);
		replaceTableState(next);

		// Extract groupBy values if grouping is active
		let groupByFieldValues: { [fieldId: string]: unknown } | undefined;
		if (
			view?.group &&
			(view.group as any)?.groupObjs?.length > 0 &&
			groupPoints?.length > 0
		) {
			try {
				groupByFieldValues = extractGroupByValuesFromRecord(
					anchorId,
					records,
					groupPoints,
					view.group as IGroupConfig,
				);
			} catch {
				// Continue without groupBy values
			}
		}

		// Emit socket event (only for first record, backend handles positioning)
		// Map "before"/"after" to "above"/"below" for backend
		// Pass groupBy field values if extracted
		if (num > 0 && emitRowCreate) {
			emitRowCreate(
				anchorId,
				position === "before" ? "above" : "below",
				groupByFieldValues,
			);
		}
	};

	const handleDuplicateRecord = (recordId: string) => {
		const next = duplicateRecord(getTableSnapshot(), recordId);
		replaceTableState(next);
	};

	const handleAppendRecord = (
		targetIndex?: number,
		groupByFieldValues?: { [fieldId: string]: unknown },
	) => {
		// Optimistic update: Insert locally first
		const next = insertRecords(getTableSnapshot(), records.length, 1);
		replaceTableState(next);

		// Emit socket event (append = below last record)
		// Pass groupBy field values if provided
		if (records.length > 0 && emitRowCreate) {
			const lastRecordId = records[records.length - 1].id;
			emitRowCreate(lastRecordId, "below", groupByFieldValues);
		} else if (emitRowCreate) {
			// No records yet, create at beginning (no anchor)
			emitRowCreate(null, "below", groupByFieldValues);
		}
	};

	const handleEditColumn = useCallback(
		(columnId: string, anchorPosition?: { x: number; y: number }) => {
			const columnIndex = columns.findIndex((c) => c.id === columnId);
			if (columnIndex === -1) return;

			const targetField =
				viewFields.find(
					(field: any) =>
						field?.dbFieldName === columnId ||
						String(field?.id) === columnId,
				) || null;

			const extendedColumn = columns[columnIndex] as ExtendedUIColumn;

			// Always use rawType for field type, never the cell type (extendedColumn.type)
			const fieldType =
				extendedColumn.rawType || targetField?.type || "SHORT_TEXT";

			const fallbackField = {
				id: extendedColumn.rawId ?? extendedColumn.id,
				dbFieldName: extendedColumn.dbFieldName ?? extendedColumn.id,
				name: extendedColumn.name,
				type: fieldType,
				order: extendedColumn.order ?? columnIndex + 1,
				description: extendedColumn.description ?? "",
				options: extendedColumn.rawOptions,
				computedFieldMeta: extendedColumn.computedFieldMeta,
				fieldFormat: extendedColumn.fieldFormat,
				entityType: extendedColumn.entityType,
				identifier: extendedColumn.identifier,
				fieldsToEnrich: extendedColumn.fieldsToEnrich,
			};

			const editField = targetField
				? {
						...targetField,
						// Ensure type is always set - prefer targetField.type, then rawType, then default
						type:
							targetField.type ||
							extendedColumn.rawType ||
							"SHORT_TEXT",
						order: targetField.order ?? fallbackField.order,
						dbFieldName:
							targetField.dbFieldName ??
							fallbackField.dbFieldName,
					}
				: fallbackField;

			setCreationModal({
				open: true,
				colIndex: columnIndex,
				editField,
				newFieldOrder: null,
				columnId,
				position: null,
				anchorPosition: anchorPosition ?? null,
			});
		},
		[columns, viewFields],
	);

	const handleDuplicateColumn = (columnId: string) => {
		const next = duplicateColumn(getTableSnapshot(), columnId);
		replaceTableState(next);
	};

	const handleInsertColumn = useCallback(
		(
			columnId: string,
			position: "left" | "right",
			anchorPosition?: { x: number; y: number },
		) => {
			const columnIndex = columns.findIndex((c) => c.id === columnId);
			if (columnIndex === -1) return;

			const newFieldOrder = calculateFieldOrder({
				columns,
				targetIndex: columnIndex,
				position,
			});

			setCreationModal({
				open: true,
				colIndex: columnIndex,
				editField: null,
				newFieldOrder,
				columnId,
				position,
				anchorPosition: anchorPosition ?? null,
			});
		},
		[columns],
	);

	// Hook for deleting fields
	const { deleteField } = useDeleteField();

	const handleDeleteColumns = useCallback(
		(columnIds: number[]) => {
			if (!columnIds.length) return;

			// columnIds are already rawIds (field IDs) as numbers from the context menu
			// No need to look up columns - just call the API directly
			deleteField(columnIds).catch(() => {});
		},
		[deleteField],
	);

	// Phase 2C: Handle append column - open FieldModal instead of directly creating
	const handleAppendColumn = useCallback(
		(position: { x: number; y: number }) => {
			const newFieldOrder = calculateFieldOrder({
				columns,
				position: "append",
			});

			setCreationModal({
				open: true,
				colIndex: columns.length,
				editField: null,
				newFieldOrder,
				columnId: null,
				position: "append",
				anchorPosition: position,
			});
		},
		[columns],
	);

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				overflow: "hidden",
			}}
		>
			{/* LEFT: Sidebar - Now fully self-contained using Zustand */}
			<Sidebar columns={columns} />

			{/* RIGHT: Main Content Area */}
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}
			>
				{/* Top: Header */}
				<Header sheet={sheet || {}} setSheet={setSheet} />

				{/* TabBar: Table tabs below header */}
				{(tableList ?? []).length > 0 && (
					<TabBar
						tableList={tableList ?? []}
						handleTabClick={handleTabClick}
						setView={setView}
						leaveRoom={leaveRoom}
						setTableList={setTableList}
					/>
				)}

				{/* Middle: SubHeader */}
				<SubHeader
					zoomLevel={zoomLevel}
					onZoomChange={setZoomLevel}
					fields={filterFields}
					filter={
						(activeView?.filter as Record<string, unknown>) || {}
					}
					sort={(activeView?.sort as Record<string, unknown>) || {}}
					group={groupProp}
					onFilterChange={handleFilterChange}
					setView={setView}
					currentView={currentView}
					stackFieldName={
						currentView === "kanban" && kanbanOptions?.stackFieldId
							? columns?.find(
									(col) =>
										(col as any).rawId ===
											kanbanOptions.stackFieldId ||
										col.id === kanbanOptions.stackFieldId,
								)?.name
							: undefined
					}
					columns={allColumns}
					viewOptions={kanbanOptions}
					viewId={activeViewId || view?.id || ""}
					columnMeta={activeView?.columnMeta}
					onStackFieldSuccess={(updatedView: any) => {
						if (updatedView) {
							// Update local view state
							setView(updatedView);
						}
					}}
					stackFieldLoading={updateKanbanViewLoading}
					sortColumnBg={defaultTheme.sortColumnBg}
					filterColumnBg={defaultTheme.filterColumnBg}
					isDefaultView={isDefaultView(activeView)}
					fetchRecords={fetchRecords}
					hasNewRecords={hasNewRecords}
					clearHasNewRecords={clearHasNewRecords}
					isTableLoading={isTableLoading}
				/>

				{/* Bottom: Grid Container */}
				<div
					style={{
						flex: 1,
						overflow: "hidden",
						backgroundColor: "#f5f5f5",
					}}
				>
					<div
						style={{
							width: "100%",
							height: "100%",

							backgroundColor: "#fff",
						}}
					>
						{isLoading ? (
							<TableSkeleton />
						) : currentView === "kanban" ? (
							<KanbanView
								columns={columns}
								records={records}
								rowHeaders={rowHeaders}
								// groupPoints prop removed - now fetched via useGroupPoints hook in KanbanProvider
								options={kanbanOptions}
								tableId={activeTableId}
								baseId={assetId}
								viewId={activeViewId}
								// Save handler for expanded record (no-op when view is not default)
								onSaveRecord={
									canEditRecords
										? handleExpandedRecordSave
										: async () => {}
								}
								// Phase 4: Action handlers (only on default view)
								onDeleteRecord={
									canEditRecords
										? async (recordId) => {
												await handleDeleteRecords([recordId]);
											}
										: undefined
								}
								onDuplicateRecord={
									canEditRecords ? handleDuplicateRecord : undefined
								}
								// Drag and drop support
								socket={socket}
								// Record creation handler (only on default view)
								emitRowCreate={canEditRecords ? emitRowCreate : undefined}
								canEditRecords={canEditRecords}
							/>
						) : (
							<GridView
								data={{
									columns,
									records,
									rowHeaders,
									tableId: activeTableId,
									viewId: activeViewId,
									baseId: assetId,
								}}
								groupPoints={groupPoints}
								group={
									(activeView?.group as Record<
										string,
										unknown
									>) || undefined
								}
								sort={
									(activeView?.sort as Record<
										string,
										unknown
									>) || undefined
								}
								filter={
									(activeView?.filter as Record<
										string,
										unknown
									>) || undefined
								}
								fields={filterFields}
								config={config}
								onCellChange={canEditRecords ? handleCellChange : undefined}
								onCellsChange={canEditRecords ? handleCellsChange : undefined}
								onCellClick={handleCellClick}
								onCellDoubleClick={handleCellDoubleClick}
								onColumnResize={handleColumnResize}
								onDeleteRecords={canEditRecords ? handleDeleteRecords : undefined}
								onInsertRecord={canEditRecords ? handleInsertRecord : undefined}
								onDuplicateRecord={canEditRecords ? handleDuplicateRecord : undefined}
								onRowAppend={canEditRecords ? handleAppendRecord : undefined}
								onEditColumn={canEditFields ? handleEditColumn : undefined}
								onDuplicateColumn={canEditFields ? handleDuplicateColumn : undefined}
								onInsertColumn={canEditFields ? handleInsertColumn : undefined}
								onDeleteColumns={canEditFields ? handleDeleteColumns : undefined}
								onColumnReorder={handleColumnReorder}
								onClearCellLoading={(clearFn) => {
									// Store the clear function in ref
									clearCellLoadingRef.current = clearFn;
								}}
								onSetCellLoading={(setFn) => {
									// Store the set function in ref
									setCellLoadingRef.current = setFn;
								}}
								onColumnFreeze={handleColumnFreeze}
								onColumnAppend={canEditFields ? handleAppendColumn : undefined}
								// @ts-ignore - GridView supports custom row reorder handler in this project
								onRowReorder={canEditRecords ? handleRowReorder : undefined}
								defaultRowHeightLevel={rowHeightLevel}
								zoomLevel={zoomLevel}
							/>
						)}
					</div>
				</div>

				{/* Phase 2: Expanded Record Modal for Grid View */}
				{expandedRecordId && currentView === "grid" && (
					<ExpandedRecord
						record={
							records.find((r) => r.id === expandedRecordId) ||
							null
						}
						columns={columns}
						recordIds={records.map((r) => r.id)}
						visible={!!expandedRecordId}
						onClose={() => setExpandedRecordId(null)}
						onFieldChange={(_fieldId, _newValue) => {
							// Only track changes locally - no socket emission here
							// Changes will be saved when user clicks Save button
						}}
						onSave={async (editedFields) => {
							if (!expandedRecordId) return;
							await handleExpandedRecordSave(
								expandedRecordId,
								editedFields,
							);
						}}
						isViewOnly={isViewOnly}
						// Phase 4: Actions
						onDelete={async (recordId) => {
							await handleDeleteRecords([recordId]);
						}}
						onDuplicate={async (recordId) => {
							handleDuplicateRecord(recordId);
						}}
						onCopyUrl={() => {
							// Copy URL with recordId
							const url = new URL(window.location.href);
							url.searchParams.set("recordId", expandedRecordId);
							navigator.clipboard.writeText(url.toString());
						}}
						onRecordChange={(recordId) => {
							// Phase 4: Navigate to different record
							setExpandedRecordId(recordId);
						}}
					/>
				)}

				{/* Footer Info - Data Stats */}
				{/* <div
					style={{
						padding: "12px 24px",
						backgroundColor: "#fafafa",
						borderTop: "1px solid #e0e0e0",
						fontSize: "12px",
						color: "#666",
						display: "flex",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: "16px",
					}}
				>
					<div>
						<strong>Data:</strong> {statsRecords.length} records ×{" "}
						{statsColumns.length} columns
					</div>
					<div>
						<strong>Types:</strong> {stringCount} String,{" "}
						{numberCount} Number, {mcqCount} MCQ, {phoneCount} Phone
					</div>
				</div> */}

				{/* FieldModal for append column */}
				{creationModal.open && (
					<FieldModal
						creationModal={creationModal}
						setCreationModal={setCreationModal}
						tableId={
							activeTableId ||
							view?.tableId ||
							view?.table_id ||
							""
						}
						baseId={assetId || sheet?.baseId || sheet?.id || ""}
						viewId={activeViewId || view?.id || ""}
						fields={fieldsForModal}
						ref={columnHeaderRefs}
						onFieldSaveSuccess={applyFieldUpdate}
					/>
				)}
			</div>
		</div>
	);
}

export default MainPage;
