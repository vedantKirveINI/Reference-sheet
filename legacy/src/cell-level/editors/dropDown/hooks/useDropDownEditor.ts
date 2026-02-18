/**
 * Custom hook for DropDown editor state management
 *
 * PATTERN REFERENCE: This hook follows the same pattern as McqEditor
 * - Updates LOCAL state immediately for UI feedback (chips update instantly)
 * - Does NOT call onChange immediately (prevents full page re-renders)
 * - onChange is called by parent component only on save events (Enter/Tab/blur)
 *
 * Handles both array of strings and array of objects with {id, label}
 */
import { useEffect, useMemo, useState } from "react";
import { getDisplayValue, type DropDownOption } from "../utils/helper";

const ICON_WIDTH = 20 + 6; // icon width + gap
const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

interface UseDropDownEditorProps {
	initialValue:
		| string[]
		| Array<{ id: string | number; label: string }>
		| null;
	options:
		| string[]
		| Array<{ id: string | number; label: string }>
		| undefined;
	containerWidth: number;
	containerHeight: number;
}

export const useDropDownEditor = ({
	initialValue,
	options = [],
	containerWidth,
	containerHeight,
}: UseDropDownEditorProps) => {
	// Validate initial value; if invalid, show blank selection
	const validatedInitialValue = useMemo(() => {
		let parsed: unknown = initialValue;

		// Allow JSON string input (e.g., from displayData)
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

		// Normalize to DropDownOption[]
		const candidate = parsed as DropDownOption[];

		// Validate every entry shape
		const everyOptionHasShape = candidate.every((item) => {
			if (typeof item === "string") return true;
			return (
				item !== null &&
				typeof item === "object" &&
				"label" in item &&
				typeof (item as any).label === "string"
			);
		});

		if (!everyOptionHasShape) {
			return [];
		}

		// If we have provided options, ensure all selected values exist there (match by display value)
		if (Array.isArray(options) && options.length > 0) {
			const optionDisplaySet = new Set(options.map((opt) => getDisplayValue(opt)));
			const allExistInOptions = candidate.every((item) =>
				optionDisplaySet.has(getDisplayValue(item)),
			);
			if (!allExistInOptions) {
				return [];
			}
			// Reuse the canonical option objects from options for consistency
			return candidate.map((item) => {
				const display = getDisplayValue(item);
				const match = options.find(
					(opt) => getDisplayValue(opt) === display,
				);
				return (match ?? item) as DropDownOption;
			});
		}

		return candidate;
	}, [initialValue, options]);

	// Popper state for options list visibility
	const [popper, setPopper] = useState({
		expandedView: false,
		optionsList: false,
	});

	// Local state for selected options (updates immediately for UI feedback)
	// PATTERN: Like McqEditor's `currentOptions` state - updates on every change but doesn't call onChange
	const [currentOptions, setCurrentOptions] = useState<DropDownOption[]>(
		validatedInitialValue,
	);
	// Track if the user actually edited anything; used to skip saving on no-op close
	const [hasUserEdited, setHasUserEdited] = useState(false);

	// Calculate available dimensions for chips layout
	// Match McqEditor approach: account for border (4px total) and padding
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
	 * PATTERN: Like McqEditor's handleSelectOption - updates local state only
	 * Does NOT call onChange - that's handled by parent on save events
	 */
	const handleSelectOption = (optionValue: DropDownOption[]) => {
		setHasUserEdited(true); // Mark as edited when user changes selection
		setCurrentOptions(optionValue);
		// NOTE: onChange is NOT called here - it's called by parent on save (Enter/Tab/blur)
		// This prevents full page re-renders on every selection, matching McqEditor pattern
	};

	// Auto-open options list when editor opens
	useEffect(() => {
		setPopper({
			optionsList: true,
			expandedView: false,
		});
	}, []);

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

