/**
 * Custom hook for MCQ editor state management
 *
 * PATTERN REFERENCE: This hook follows the same pattern as StringEditor
 * - Updates LOCAL state immediately for UI feedback (chips update instantly)
 * - Does NOT call onChange immediately (prevents full page re-renders)
 * - onChange is called by parent component only on save events (Enter/Tab/blur)
 *
 * This pattern ensures:
 * 1. Immediate UI feedback (user sees changes instantly)
 * 2. Better performance (no re-renders on every selection)
 * 3. Consistent behavior across all editors
 */
import { useMemo, useState } from "react";

const ICON_WIDTH = 20 + 6; // icon width + gap
const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

interface UseMcqEditorProps {
	initialValue: string[];
	options: string[];
	containerWidth: number;
	containerHeight: number;
}

export const useMcqEditor = ({
	initialValue,
	options,
	containerWidth,
	containerHeight,
}: UseMcqEditorProps) => {
	// Validate initial value against allowed options; fall back to empty on invalid
	const validatedInitialValue = useMemo(() => {
		let parsed: unknown = initialValue;

		// Support JSON strings in displayData by parsing when needed
		if (typeof parsed === "string") {
			try {
				parsed = JSON.parse(parsed);
			} catch {
				parsed = undefined;
			}
		}

		if (!Array.isArray(parsed)) {
			return [];
		}

		// Only allow string entries
		if (!parsed.every((item) => typeof item === "string")) {
			return [];
		}

		// Ensure every value exists in the provided options list (when options are defined)
		if (
			Array.isArray(options) &&
			options.length > 0 &&
			!parsed.every((value) => options.includes(value))
		) {
			return [];
		}

		return parsed as string[];
	}, [initialValue, options]);

	// Popper state for options list visibility
	const [popper, setPopper] = useState({
		expandedView: false,
		optionsList: false,
	});

	// Local state for selected options (updates immediately for UI feedback)
	// PATTERN: Like StringEditor's `value` state - updates on every change but doesn't call onChange
	const [currentOptions, setCurrentOptions] = useState<string[]>(
		validatedInitialValue,
	);
	// Track if the user actually edited anything; used to skip saving on no-op close
	const [hasUserEdited, setHasUserEdited] = useState(false);

	// Calculate available dimensions for chips layout
	// Match StringEditor approach: account for border (4px total) and padding
	const availableHeight = +(containerHeight - PADDING_HEIGHT * 2).toFixed(2);
	const availableWidth = +(
		containerWidth -
		ICON_WIDTH -
		PADDING_WIDTH * 2
	).toFixed(2);

	// Determine if chips should wrap (based on available height)
	const wrapClass =
		availableHeight > 60 && currentOptions.length > 3 ? "wrap" : "";

	/**
	 * Handle option selection/deselection
	 * PATTERN: Like StringEditor's handleChange - updates local state only
	 * Does NOT call onChange - that's handled by parent on save events
	 */
	const handleSelectOption = (optionValue: string[]) => {
		setHasUserEdited(true); // Mark as edited when user changes selection
		setCurrentOptions(optionValue);
		// NOTE: onChange is NOT called here - it's called by parent on save (Enter/Tab/blur)
		// This prevents full page re-renders on every selection, matching StringEditor pattern
	};

	return {
		currentOptions,
		options,
		handleSelectOption,
		popper,
		setPopper,
		availableHeight,
		availableWidth,
		wrapClass,
		hasUserEdited, // Expose to parent so it can skip onChange if no edits
	};
};
