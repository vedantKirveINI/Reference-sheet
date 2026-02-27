/**
 * Keyboard utility functions for detecting printable keys and managing keyboard interactions
 * Inspired by Teable's implementation but adapted for our codebase
 */

import { CellType } from "@/types";

/**
 * Key codes for non-printable keys that should not trigger editor
 */
const EXCLUDED_KEY_CODES = new Set([
	8, // Backspace
	9, // Tab
	13, // Enter
	16, // Shift
	17, // Ctrl
	18, // Alt
	19, // Pause
	20, // Caps Lock
	27, // Escape
	33, // Page Up
	34, // Page Down
	35, // End
	36, // Home
	37, // Arrow Left
	38, // Arrow Up
	39, // Arrow Right
	40, // Arrow Down
	45, // Insert
	46, // Delete
	91, // Left Meta (Windows)
	92, // Right Meta (Windows)
	93, // Context Menu
	112, // F1
	113, // F2 (handled separately - opens editor explicitly)
	114, // F3
	115, // F4
	116, // F5
	117, // F6
	118, // F7
	119, // F8
	120, // F9
	121, // F10
	122, // F11
	123, // F12
	144, // Num Lock
	145, // Scroll Lock
]);

/**
 * Cell types that should never open editor on keyboard press
 * These are typically computed or read-only cell types
 */
export const NO_EDITING_CELL_TYPES = new Set<CellType>([
	// Formula cells are always read-only (handled via readOnly flag)
	// Enrichment cells may be read-only (handled via readOnly flag)
	// Add other non-editable types here if needed
]);

/**
 * Check if a keyboard event represents a printable key
 * Printable keys are characters that users would type to enter data
 * 
 * @param event - KeyboardEvent or React.KeyboardEvent
 * @returns true if the key is printable and should trigger editor
 */
export const isPrintableKey = (
	event: KeyboardEvent | React.KeyboardEvent,
): boolean => {
	const nativeEvent = "nativeEvent" in event ? event.nativeEvent : event;
	const { keyCode, key, metaKey, ctrlKey, altKey } = nativeEvent;

	// Exclude modifier key combinations
	if (metaKey || ctrlKey || altKey) {
		return false;
	}

	// Exclude IME composition (for Chinese, Japanese, Korean input methods)
	if ("isComposing" in nativeEvent && nativeEvent.isComposing) {
		return false;
	}

	// Exclude special navigation and function keys
	if (EXCLUDED_KEY_CODES.has(keyCode)) {
		return false;
	}

	// Check for printable character ranges using keyCode
	// Numbers 0-9 (regular and numpad)
	if (
		(keyCode >= 48 && keyCode <= 57) || // 0-9
		(keyCode >= 96 && keyCode <= 105) // Numpad 0-9
	) {
		return true;
	}

	// Letters A-Z
	if (keyCode >= 65 && keyCode <= 90) {
		return true;
	}

	// Symbols and punctuation (semicolon to tilde)
	// This covers: ; : = + , - . / ` [ \ ] '
	if (keyCode >= 186 && keyCode <= 222) {
		return true;
	}

	// Space key (32)
	// Note: Space is included as printable, but can be excluded if used for row expansion
	if (keyCode === 32) {
		return true;
	}

	// Additional symbol keycodes
	// Equals sign (=) on some keyboards
	if (keyCode === 61) {
		return true;
	}
	// Minus/dash (-) on some keyboards
	if (keyCode === 173) {
		return true;
	}

	// Handle IME input (keyCode 229 or 0) - only if it's not Shift
	// This is for input method editors (Chinese, Japanese, Korean)
	if ((keyCode === 229 || keyCode === 0) && key !== "Shift") {
		// Check if the key is actually a printable character
		if (key && key.length === 1) {
			// Exclude control characters (0x00-0x1F and 0x7F-0x9F)
			const charCode = key.charCodeAt(0);
			if (charCode >= 32 && charCode !== 127 && (charCode < 128 || charCode > 159)) {
				return true;
			}
		}
	}

	// Fallback: Check if key is a single printable character
	// This catches Unicode characters and other edge cases
	if (key && key.length === 1) {
		// Exclude control characters and special keys
		const charCode = key.charCodeAt(0);
		// Printable ASCII range: 32-126, and Unicode printable characters
		if (
			(charCode >= 32 && charCode <= 126) || // ASCII printable
			(charCode > 126 && charCode !== 127) // Unicode (excluding DEL)
		) {
			// Double-check it's not a special key name
			const specialKeys = [
				"Shift",
				"Control",
				"Alt",
				"Meta",
				"Enter",
				"Tab",
				"Escape",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
				"Home",
				"End",
				"PageUp",
				"PageDown",
				"Insert",
				"Delete",
				"Backspace",
				"F1",
				"F2",
				"F3",
				"F4",
				"F5",
				"F6",
				"F7",
				"F8",
				"F9",
				"F10",
				"F11",
				"F12",
			];
			if (!specialKeys.includes(key)) {
				return true;
			}
		}
	}

	return false;
};

/**
 * Check if a cell should allow keyboard-triggered editing
 * 
 * @param cell - The cell object to check
 * @param cellType - The type of the cell
 * @returns true if keyboard editing should be allowed
 */
export const shouldAllowKeyboardEdit = (
	cell: any,
	cellType: CellType | string,
): boolean => {
	// Check if cell type is excluded from keyboard editing
	if (NO_EDITING_CELL_TYPES.has(cellType as CellType)) {
		return false;
	}

	// Check if cell is read-only
	// Support both camelCase and lowercase for compatibility
	if (cell?.readOnly || cell?.readonly) {
		return false;
	}

	return true;
};

/**
 * Check if a key is a number key (0-9, including numpad)
 * Useful for number-specific cell types
 * 
 * @param event - KeyboardEvent or React.KeyboardEvent
 * @returns true if the key is a number
 */
export const isNumberKey = (
	event: KeyboardEvent | React.KeyboardEvent,
): boolean => {
	const nativeEvent = "nativeEvent" in event ? event.nativeEvent : event;
	const { keyCode } = nativeEvent;

	// Regular numbers 0-9 (keyCode 48-57)
	// Numpad numbers 0-9 (keyCode 96-105)
	return (
		(keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)
	);
};

