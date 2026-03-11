import React from "react";
import type { CoordinateManager } from "@/managers/coordinate-manager";
import type { IRange } from "./selection";

// Inspired by Teable's cell type system
export enum CellType {
	String = "String",
	Number = "Number",
	MCQ = "MCQ",
	SCQ = "SCQ",
	YesNo = "YesNo",
	PhoneNumber = "PhoneNumber",
	ZipCode = "ZipCode",
	Currency = "Currency",
	DropDown = "DropDown",
	Address = "Address",
	DateTime = "DateTime",
	Signature = "Signature",
	Slider = "Slider",
	FileUpload = "FileUpload",
	Time = "Time",
	Ranking = "Ranking",
	Rating = "Rating",
	OpinionScale = "OpinionScale",
	Enrichment = "Enrichment",
	Formula = "Formula",
	List = "List",
	CreatedTime = "CreatedTime",
}

// Inspired by Teable's RowHeightLevel - Preset row heights only
export enum RowHeightLevel {
	Short = "short",
	Medium = "medium",
	Tall = "tall",
	ExtraTall = "extraTall",
}

export const ROW_HEIGHT_DEFINITIONS = {
	[RowHeightLevel.Short]: 32,
	[RowHeightLevel.Medium]: 56,
	[RowHeightLevel.Tall]: 84,
	[RowHeightLevel.ExtraTall]: 108,
};

export interface IStringCell {
	type: CellType.String;
	data: string;
	displayData: string;
}

export interface INumberCell {
	type: CellType.Number;
	data: number | null;
	displayData: string;
	format?: string;
}

export interface IMCQCell {
	type: CellType.MCQ;
	data: string[]; // Array of selected options
	displayData: string; // JSON string representation for display
	options?: {
		options: string[]; // Available options for this cell
	};
}

export interface ISCQCell {
	type: CellType.SCQ;
	data: string | null; // Single selected option (not array)
	displayData: string; // Display text
	options?: {
		options: string[]; // Available options for this cell
	};
}

export interface IYesNoCell {
	type: CellType.YesNo;
	data: "Yes" | "No" | "Other" | string | null; // Allow any string to keep original value intact
	displayData: string;
	options?: {
		options: string[]; // Optional label overrides
	};
	other?: boolean; // Boolean flag indicating if "Other" option is enabled
}

export interface IPhoneNumberCell {
	type: CellType.PhoneNumber;
	data: {
		countryCode: string; // e.g., "IN", "US", "AL" (ISO country code)
		countryNumber: string; // e.g., "91", "1", "355" (dialing code without +)
		phoneNumber: string; // e.g., "210389208" (phone number digits)
	} | null;
	displayData: string; // Formatted display string for rendering (JSON string of data)
}

export interface IZipCodeCell {
	type: CellType.ZipCode;
	data: {
		countryCode: string;
		zipCode: string;
	} | null;
	displayData: string;
}

export interface ICurrencyCell {
	type: CellType.Currency;
	data: {
		countryCode: string;
		currencyCode: string;
		currencySymbol: string;
		currencyValue: string;
		currencyDisplay?: string;
	} | null;
	displayData: string;
}

export interface IDropDownCell {
	type: CellType.DropDown;
	data:
		| string[] // Array of strings: ["A", "B", "C"]
		| Array<{ id: string | number; label: string }> // Array of objects: [{id: 1, label: "A"}]
		| null;
	displayData: string; // JSON string representation for display
	options?: {
		options:
			| string[] // Available options as strings
			| Array<{ id: string | number; label: string }>; // Available options as objects
	};
}

export interface IAddressCell {
	type: CellType.Address;
	data: {
		fullName?: string;
		addressLineOne?: string;
		addressLineTwo?: string;
		zipCode?: string;
		city?: string;
		state?: string;
		country?: string;
	} | null;
	displayData: string; // Comma-separated address string
}

export interface IDateTimeCell {
	type: CellType.DateTime;
	data: string | null; // ISO 8601 datetime string from PostgreSQL
	displayData: string; // Formatted date string (e.g., "15/01/2024 10:30 AM")
	options?: {
		dateFormat?: "DDMMYYYY" | "MMDDYYYY" | "YYYYMMDD";
		separator?: string; // Default: "/"
		includeTime?: boolean; // Default: false
		isTwentyFourHourFormat?: boolean; // Default: false
	};
}

export interface ICreatedTimeCell {
	type: CellType.CreatedTime;
	data: string | null; // ISO 8601 datetime string from backend
	displayData: string; // Formatted date string (e.g., "15/01/2024 10:30 AM")
	readOnly: true; // Created Time is always read-only
	options?: {
		dateFormat?: "DDMMYYYY" | "MMDDYYYY" | "YYYYMMDD";
		separator?: string; // Default: "/"
		includeTime?: boolean; // Default: true to match sheets
		isTwentyFourHourFormat?: boolean; // Default: false
	};
}

export interface ISignatureCell {
	type: CellType.Signature;
	data: string | null; // Signature image URL
	displayData: string; // Same as data (URL string)
}

export interface ISliderCell {
	type: CellType.Slider;
	data: number | null; // Selected slider value
	displayData: string; // Display format: "{value}/{maxValue}" e.g., "5/10"
	options?: {
		minValue: number; // Minimum value (0 or 1)
		maxValue: number; // Maximum value (5-10, default 10)
	};
}

export interface IFileUploadCell {
	type: CellType.FileUpload;
	data: Array<{
		url: string; // CDN URL of uploaded file
		size: number; // File size in bytes
		mimeType: string; // MIME type (e.g., "image/png", "application/pdf")
	}> | null;
	displayData: string; // JSON string representation
	options?: {
		maxFileSizeBytes?: number; // Default: 10485760 (10MB)
		allowedFileTypes?: Array<{
			extension: string; // e.g., "pdf", "png", "jpg"
		}>;
		noOfFilesAllowed?: number; // Default: 100
		fieldName?: string; // Field name for dialog title
	};
}

export interface ITimeCell {
	type: CellType.Time;
	data: {
		time: string; // "HH:MM" format (e.g., "09:30", "14:45")
		meridiem: string; // "AM" | "PM" | "" (empty for 24hr format)
		ISOValue: string; // ISO 8601 string (e.g., "2024-01-01T09:30:00.000Z")
		timeZone?: string; // Optional timezone (e.g., "PST", "EST")
	} | null;
	displayData: string; // Formatted display string (e.g., "09:30 AM" or "14:45")
	options?: {
		isTwentyFourHour: boolean; // true for 24hr format, false for 12hr format
	};
}

export interface IRankingCell {
	type: CellType.Ranking;
	data: Array<{
		id: string;
		rank: number; // 1-based ranking (1, 2, 3, ...)
		label: string;
	}> | null;
	displayData: string; // JSON string representation
	options?: {
		options: Array<{
			id: string;
			label: string;
		}>; // Available options to rank
	};
}

export interface IRatingCell {
	type: CellType.Rating;
	data: number | null; // Rating value (1 to maxRating)
	displayData: string; // Formatted display (e.g., "3/5")
	options?: {
		maxRating?: number; // Default: 5, range: 1-10
		icon?: string; // Emoji string, default: "⭐"
		color?: string; // Optional color for filled icons
	};
}

export interface IOpinionScaleCell {
	type: CellType.OpinionScale;
	data: number | null; // Selected value (1 to maxValue)
	displayData: string; // Formatted display (e.g., "4/10")
	options?: {
		maxValue?: number; // Default: 10, range: 1-10
	};
}

export interface IEnrichmentCell {
	type: CellType.Enrichment;
	data: string | null;
	displayData: string;
	readOnly?: boolean; // Enrichment cells are always read-only
	options?: {
		config?: {
			identifier?: Array<{
				field_id: string;
				dbFieldName: string;
				required: boolean;
			}>;
		};
	};
}

export interface IListCell {
	type: CellType.List;
	data: Array<string | number>; // Array of primitives (strings or numbers), NOT objects
	displayData: string; // JSON string representation
}

export interface IFormulaCell {
	type: CellType.String; // Uses String type and StringRenderer
	data: string | null;
	displayData: string;
	readOnly: true; // Formula cells are always read-only
	options?: {
		computedFieldMeta?: {
			hasError?: boolean; // True when formula has errors
			shouldShowLoading?: boolean; // True when formula is recalculating
			expression?: any; // Formula expression blocks
		};
	};
}

export type ICell =
	| IStringCell
	| INumberCell
	| IMCQCell
	| ISCQCell
	| IYesNoCell
	| IPhoneNumberCell
	| IZipCodeCell
	| ICurrencyCell
	| IDropDownCell
	| IAddressCell
	| IDateTimeCell
	| ICreatedTimeCell
	| ISignatureCell
	| ISliderCell
	| IFileUploadCell
	| ITimeCell
	| IRankingCell
	| IRatingCell
	| IOpinionScaleCell
	| IEnrichmentCell
	| IFormulaCell;

// ========================================
// TEABLE-STYLE LINEAR ROWS
// ========================================
export enum LinearRowType {
	Row = "Row",
	Group = "Group",
	Append = "Append",
}

export interface ILinearRow {
	type: LinearRowType;
	displayIndex?: number;
	realIndex?: number;
	// Phase 1: Grouping extensions
	id?: string;
	depth?: number;
	value?: unknown;
	isCollapsed?: boolean;
}

export interface IColumn {
	id: string;
	name: string;
	type: CellType;
	width: number;
	isFrozen?: boolean;
	options?: string[]; // Available options for MCQ columns
	order?: number; // Column order value from backend (used for field positioning)
	// Add these for resizing - Inspired by Teable
	minWidth?: number; // Minimum width (default 50px)
	resizable?: boolean; // Can this column be resized? (default true)
	isHidden?: boolean; // Track hidden state in column objects (for UI state management)
}

/**
 * Server-only keys that exist on raw records but may not have a column yet.
 * Used so that when a CREATED_TIME field is added via socket we can show
 * existing __created_time without refetching (inspired by sheets).
 */
export interface IRecordRaw {
	__created_time?: string | null;
}

export interface IRecord {
	id: string;
	cells: Record<string, ICell>;
	/** Server-only fields (e.g. __created_time) for use when adding CREATED_TIME column without refetch */
	_raw?: IRecordRaw;
}

// Row header interface - Updated for preset heights (Inspired by Teable)
export interface IRowHeader {
	id: string;
	rowIndex: number;
	heightLevel: RowHeightLevel; // Use preset levels instead of dynamic height
	displayIndex?: number; // Display number (1, 2, 3, etc.)
	orderValue?: number; // Actual order value from backend (_row_view...)
}

export interface ITableData {
	columns: IColumn[];
	records: IRecord[];
	rowHeaders: IRowHeader[]; // Add row headers for height management
}

// Optional column for option-based cells (SCQ/MCQ/DropDown) - Option A: use column options for validation so new options don't show as error
export interface IColumnOptionsForRenderer {
	options?: string[];
	rawOptions?: { options?: string[] };
}

// Cell renderer interfaces
export interface ICellRenderProps {
	cell: ICell;
	rect: IRectangle;
	theme: IGridTheme;
	isActive: boolean;
	isHovered: boolean;
	isSelected: boolean;
	ctx: CanvasRenderingContext2D;
	hoverCellPosition?: [number, number]; // [x, y] relative to cell (for Rating hover effects)
	cellLoading?: Record<string, Record<string, boolean>>; // Loading state: cellLoading[rowId][fieldId]
	rowId?: string; // Row ID for loading state lookup
	fieldId?: string; // Field ID for loading state lookup
	/** Column (field) for option-based cells; used so validation uses current options and new options don't show as error */
	column?: IColumnOptionsForRenderer;
}

export interface ICellMeasureProps {
	cell: ICell;
	ctx: CanvasRenderingContext2D;
	theme: IGridTheme;
	width: number;
	height: number;
	/** Column (field) for option-based cells; used so validation uses current options */
	column?: IColumnOptionsForRenderer;
}

export interface ICellMeasureResult {
	width: number;
	height: number;
	totalHeight?: number;
}

export interface IRectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface IGridTheme {
	// Cell colors
	cellTextColor: string;
	cellBackgroundColor: string;
	cellBorderColor: string;
	cellHoverColor: string;
	cellSelectedColor: string;
	cellActiveColor: string;

	// Header colors (like Teable)
	columnHeaderBg?: string;
	columnHeaderBgHovered?: string;
	rowHeaderTextColor?: string;
	cellLineColor?: string;

	// Group header colors (like Teable)
	groupHeaderBgPrimary?: string;
	groupHeaderBgSecondary?: string;
	groupHeaderBgTertiary?: string;

	// Font settings
	cellActiveBorderColor: string; // Border color for the active cell
	fontFamily: string;
	fontSize: number;
	fontSizeXS?: number; // For footer/statistics (like Teable)
	fontSizeSM?: number; // Small font size (like Teable, default 13)
	lineHeight: number;

	// Icon sizes (like Teable)
	iconSizeSM?: number; // Small icon size (like Teable, default 20)
	iconSizeXS?: number; // Extra small icon size (like Teable, default 16) - for checkboxes

	// Cell padding (like Teable)
	cellHorizontalPadding?: number; // Horizontal padding (like Teable, default 8)
	cellVerticalPaddingSM?: number; // Small vertical padding (like Teable, default 6)

	// Row header icon padding (like Teable)
	rowHeadIconPaddingTop?: number; // Vertical padding for icons in row headers (like Teable, default 8)

	// Checkbox colors (like Teable)
	iconBgSelected?: string; // Background color for selected checkbox (like Teable)
	staticWhite?: string; // White color for checkmark stroke (like Teable)

	// Interaction line colors (like Teable)
	interactionLineColorHighlight?: string; // Color for freeze handler line (default: #1890ff)
	interactionLineColorCommon?: string; // Color for divider line (default: rgba(0,0,0,0.1))

	// Sort and Filter column colors
	sortColumnBg?: string; // Background color for sorted columns (header + cells)
	filterColumnBg?: string; // Background color for filtered columns (header + cells)

	// Footer (summary bar) colors (Airtable-style)
	footerBg?: string;
	footerBorderColor?: string;
	footerTextPrimary?: string; // Value text (e.g. numbers)
	footerTextSecondary?: string; // Label/muted text (e.g. "Sum", "records")
	footerHoverBg?: string; // Hover background for statistic cells
	footerShadowColor?: string; // Optional subtle shadow above footer
	footerRecordCountBg?: string; // Pill/badge background behind record count
	footerDividerColor?: string; // Vertical divider between record count and stats
}

// Editor interfaces
export interface IEditorProps {
	cell: ICell;
	rect: IRectangle;
	theme: IGridTheme;
	isEditing: boolean;
	onChange: (value: unknown) => void;
	onSave: () => void;
	onCancel: () => void;
	readOnly?: boolean; // Whether the cell is read-only
}

export interface IEditorRef {
	focus: () => void;
	blur: () => void;
	getValue: () => unknown;
	setValue: (value: unknown) => void;
}

// Base cell renderer interface
export interface IBaseCellRenderer<T extends ICell> {
	type: T["type"];
	draw: (cell: T, props: ICellRenderProps) => void;
	measure?: (cell: T, props: ICellMeasureProps) => ICellMeasureResult;
	provideEditor?: (cell: T) => React.ComponentType<IEditorProps>;
}

// ========================================
// PHASE 1 ADDITION: Selection-related types
// ========================================

// Position interfaces - Inspired by Teable
export interface IPosition {
	x: number;
	y: number;
}

export interface IRegionPosition extends IPosition {
	rowIndex: number;
	columnIndex: number;
}

// Cell item type - Inspired by Teable
// Format: [colIndex, rowIndex]
export type ICellItem = [colIndex: number, rowIndex: number];

// Selectable type enum - Inspired by Teable
export enum SelectableType {
	All = "all",
	None = "none",
	Column = "column",
	Row = "row",
	Cell = "cell",
}

// Column resize interfaces - Inspired by Teable's resize system
export enum RegionType {
	Cell = "Cell",
	ActiveCell = "ActiveCell", // PHASE 1: Added for selection compatibility
	ColumnHeader = "ColumnHeader",
	ColumnHeaderDropdown = "ColumnHeaderDropdown", // Dropdown button in column header
	ColumnResizeHandler = "ColumnResizeHandler",
	ColumnFreezeHandler = "ColumnFreezeHandler",
	RowHeader = "RowHeader", // Row header area
	RowHeaderCheckbox = "RowHeaderCheckbox", // PHASE 1: Added for selection compatibility
	RowHeaderDragHandler = "RowHeaderDragHandler", // PHASE 1: Added for selection compatibility
	AllCheckbox = "AllCheckbox", // PHASE 1: Added for selection compatibility
	AppendRow = "AppendRow", // PHASE 1: Added for selection compatibility
	AppendColumn = "AppendColumn",
	Blank = "Blank", // PHASE 1: Added for selection compatibility
	ColumnStatistic = "ColumnStatistic", // PHASE 1: Added for selection compatibility
	GroupStatistic = "GroupStatistic", // PHASE 1: Added for selection compatibility
	RowGroupControl = "RowGroupControl", // Phase 1: Group header toggle control (like Teable)
	RowGroupHeader = "RowGroupHeader", // Phase 1: Group header content area (like Teable)
	None = "None",
}

export interface IColumnResizeState {
	columnIndex: number; // Which column is being resized
	width: number; // Current width during resize
	x: number; // Mouse X position
	isResizing: boolean; // Are we currently resizing?
}

export interface IColumnFreezeState {
	sourceIndex: number; // Starting column index when drag started
	targetIndex: number; // Target column index during drag
	isFreezing: boolean; // Is currently dragging to freeze?
}

export enum DragRegionType {
	None = "None",
	Columns = "Columns",
}

export interface IColumnDragState {
	isActive: boolean;
	isDragging: boolean;
	columnIndices: number[];
	ranges: IRange[];
	pointerOffset: number;
	visualLeft: number;
	width: number;
	dropIndex: number;
}

// PHASE 1: Updated to match Teable's IMouseState structure
export interface IMouseState extends IRegionPosition {
	type: RegionType; // What part of grid mouse is over
	isOutOfBounds: boolean; // PHASE 1: Added for selection compatibility
}

// Grid configuration
export interface IGridConfig {
	rowHeight: number;
	columnWidth: number;
	headerHeight: number;
	freezeColumns: number;
	virtualScrolling: boolean;
	theme: IGridTheme;
	// Row header configuration - Inspired by Teable
	rowHeaderWidth: number; // Width of row header column
	showRowNumbers: boolean; // Show row numbers in header
}

// ==========================================
// PHASE 1 ADDITION: Scroll-related types
// ==========================================

export interface IScrollState {
	scrollTop: number;
	scrollLeft: number;
	isScrolling: boolean;
}

export interface IColumnStatistics {
	[columnId: string]: {
		sum?: number;
		count?: number;
		avg?: number;
		min?: number;
		max?: number;
	};
}

export interface IInfiniteScrollerProps {
	// Coordinate system
	coordInstance: CoordinateManager; // Changed from: any

	// Container dimensions
	containerWidth: number;
	containerHeight: number;

	// Content dimensions
	scrollWidth: number;
	scrollHeight: number;

	// Refs
	containerRef: React.MutableRefObject<HTMLDivElement | null>;

	// State
	scrollState: IScrollState;
	setScrollState: React.Dispatch<React.SetStateAction<IScrollState>>;

	// Callbacks
	onScrollChanged?: (scrollLeft: number, scrollTop: number) => void;
	onVisibleRegionChanged?: (rect: IRectangle) => void;

	// Options
	smoothScrollX?: boolean;
	smoothScrollY?: boolean;
	scrollBarVisible?: boolean;
	top?: number; // Top offset for scrollbar positioning
	left?: number; // Left offset for scrollbar positioning
	scrollEnable?: boolean; // Controls whether scrolling is enabled
	getLinearRow: (index: number) => ILinearRow; // Required function to convert row indices
	zoomLevel?: number; // Zoom level (default: 100) - used to convert scroll positions from zoomed to logical space
}

export interface IScrollerRef {
	scrollTo: (scrollLeft?: number, scrollTop?: number) => void;
	scrollBy: (deltaX: number, deltaY: number) => void;
}

// ========================================
// PHASE 1: Export selection types
// ========================================
export * from "./selection";

// ========================================
// View Types
// ========================================
export * from "./view";
