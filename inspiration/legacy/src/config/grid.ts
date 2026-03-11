/**
 * Grid layout constants
 * Inspired by Teable's grid configuration
 */

export const GRID_CONSTANTS = {
	// Scrollbar Dimensions
	SCROLLBAR_WIDTH: 10,
	SCROLLBAR_HEIGHT: 10,

	// Footer (Column Statistics)
	FOOTER_HEIGHT: 44,
	FOOTER_PADDING_HORIZONTAL: 14,
	FOOTER_RECORD_COUNT_GAP: 20,
	FOOTER_LABEL_VALUE_GAP: 8,
	FOOTER_RECORD_COUNT_PILL_PADDING_H: 10,
	FOOTER_RECORD_COUNT_PILL_PADDING_V: 4,
	FOOTER_RECORD_COUNT_PILL_RADIUS: 6,
	FOOTER_STAT_CELL_PADDING_H: 12,
	FOOTER_STAT_HOVER_RADIUS: 6,
	FOOTER_DIVIDER_OFFSET: 8, // Vertical inset for divider line

	// Append row (add record) height
	APPEND_ROW_HEIGHT: 40,

	// Append column (add field) width
	APPEND_COLUMN_WIDTH: 60,

	// Scroll Buffer (for pre-rendering)
	// Like Teable: Always add this to totalWidth/totalHeight to allow scrolling past content
	SCROLL_BUFFER: 300, // Teable default is 100, we match it

	// Other layout
	COLUMN_RESIZE_HANDLE_WIDTH: 5,
	ROW_RESIZE_HANDLE_HEIGHT: 5,
	// Column freeze handler dimensions (like Teable)
	COLUMN_FREEZE_HANDLER_WIDTH: 10,
	COLUMN_FREEZE_HANDLER_HEIGHT: 20,
};

// Export individual constants for convenience
export const {
	SCROLLBAR_WIDTH,
	SCROLLBAR_HEIGHT,
	FOOTER_HEIGHT,
	FOOTER_PADDING_HORIZONTAL,
	FOOTER_RECORD_COUNT_GAP,
	FOOTER_LABEL_VALUE_GAP,
	FOOTER_RECORD_COUNT_PILL_PADDING_H,
	FOOTER_RECORD_COUNT_PILL_PADDING_V,
	FOOTER_RECORD_COUNT_PILL_RADIUS,
	FOOTER_STAT_CELL_PADDING_H,
	FOOTER_STAT_HOVER_RADIUS,
	FOOTER_DIVIDER_OFFSET,
	APPEND_ROW_HEIGHT,
	APPEND_COLUMN_WIDTH,
	SCROLL_BUFFER,
	COLUMN_RESIZE_HANDLE_WIDTH,
	ROW_RESIZE_HANDLE_HEIGHT,
	COLUMN_FREEZE_HANDLER_WIDTH,
	COLUMN_FREEZE_HANDLER_HEIGHT,
} = GRID_CONSTANTS;

/**
 * Grid rendering defaults
 * Inspired by Teable's GRID_DEFAULT constants
 * Used for consistent cell rendering across all renderers
 */
export const GRID_DEFAULT = {
	// Cell rendering constants
	cellHorizontalPadding: 8, // Horizontal padding inside cells (left/right)
	cellVerticalPaddingSM: 6, // Small vertical padding (like Teable)
	cellVerticalPaddingMD: 10, // Vertical padding for medium cells (top/bottom)
	cellTextLineHeight: 22, // Line height for multi-line text rendering
	maxRowCount: 3, // Maximum visible lines when cell is not active (unlimited when active)
};

// Export individual constants for convenience
export const {
	cellHorizontalPadding,
	cellVerticalPaddingSM,
	cellVerticalPaddingMD,
	cellTextLineHeight,
	maxRowCount,
} = GRID_DEFAULT;
