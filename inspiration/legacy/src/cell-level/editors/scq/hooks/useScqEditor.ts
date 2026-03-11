import { useEffect, useMemo, useState } from "react";

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

interface UseScqEditorProps {
	initialValue: string | null;
	options: string[];
	containerWidth: number;
	containerHeight: number;
}

export const useScqEditor = ({
	initialValue,
	options,
	containerWidth,
	containerHeight,
}: UseScqEditorProps) => {
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
		if (candidate === null || candidate === "") return null;

		// If options are provided, resolve to the exact option string from the list
		// so that radio checked state (selectedOption === option) and chip display work.
		// Use strict match first, then trim match so stored value always maps to list option.
		if (Array.isArray(options) && options.length > 0) {
			const exact = options.find((o) => o === candidate);
			if (exact !== undefined) return exact;
			const trimmed = options.find((o) => o.trim() === candidate.trim());
			if (trimmed !== undefined) return trimmed;
			// Stored value not in options (e.g. option was removed); treat as invalid
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

	// When validated initial value changes (e.g. options loaded or cell value resolved), sync selection
	// so that the chip and radio show correctly when opening the editor with an existing value.
	useEffect(() => {
		setSelectedOptionState((prev) => {
			if (validatedInitialValue == null) return prev;
			// Only sync when we have a new valid value and user hasn't changed selection yet,
			// or when the validated value differs from current (e.g. options now include the stored value).
			if (prev === validatedInitialValue) return prev;
			if (hasUserEdited) return prev;
			return validatedInitialValue;
		});
	}, [validatedInitialValue, hasUserEdited]);

	const availableWidth = useMemo(() => {
		return +(containerWidth - PADDING_WIDTH * 2).toFixed(2);
	}, [containerWidth]);

	const availableHeight = useMemo(() => {
		return +(containerHeight - PADDING_HEIGHT * 2).toFixed(2);
	}, [containerHeight]);

	const wrapClass =
		availableHeight > 60 && (selectedOption?.length || 0) > 12
			? "wrap"
			: "";

	const handleSelectOption = (option: string | null) => {
		setHasUserEdited(true); // Mark as edited when user changes selection
		setSelectedOptionState(option);
	};

	return {
		selectedOption,
		setSelectedOption: setSelectedOptionState,
		handleSelectOption,
		popperOpen,
		setPopperOpen,
		availableWidth,
		wrapClass,
		hasUserEdited, // Expose to parent so it can skip onChange if no edits
	};
};
