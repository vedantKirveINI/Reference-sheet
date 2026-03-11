import { useMemo, useState } from "react";

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

interface UseYesNoEditorProps {
	initialValue: string | null;
	options?: string[];
	containerWidth: number;
	containerHeight: number;
}

export const useYesNoEditor = ({
	initialValue,
	options,
	containerWidth,
	containerHeight,
}: UseYesNoEditorProps) => {

	// Validate initial value; if invalid, show blank
	const validatedInitialValue = useMemo(() => {
		let value: unknown = initialValue;

		if (typeof value === "string") {
			value = value.trim();
		}

		// Only strings are allowed; anything else is invalid
		if (typeof value !== "string" && value !== null) {
			return null;
		}

		const candidate = typeof value === "string" ? value : null;

		// If options are provided, ensure the value exists in options
		if (
			typeof candidate === "string" &&
			Array.isArray(options) &&
			options.length > 0 &&
			!options.includes(candidate)
		) {
			return null;
		}

		return candidate;
	}, [initialValue, options]);

	const [selectedOption, setSelectedOptionState] = useState<string | null>(
		validatedInitialValue,
	);
	// Track if the user actually edited anything; used to skip saving on no-op close
	const [hasUserEdited, setHasUserEdited] = useState(false);
	const [popperOpen, setPopperOpen] = useState(false);

	/**
	 * Wrapper setter that also marks the editor as "dirty" when user changes selection.
	 */
	const setSelectedOption = (value: string | null) => {
		setHasUserEdited(true);
		setSelectedOptionState(value);
	};

	const availableHeight = useMemo(() => {
		return Math.max(containerHeight - PADDING_HEIGHT * 2, 0);
	}, [containerHeight]);

	const availableWidth = useMemo(() => {
		return Math.max(containerWidth - PADDING_WIDTH * 2, 0);
	}, [containerWidth]);

	return {
		options,
		selectedOption,
		setSelectedOption,
		popperOpen,
		setPopperOpen,
		availableHeight,
		availableWidth,
		hasUserEdited, // Expose to parent so it can skip onChange if no edits
	};
};


