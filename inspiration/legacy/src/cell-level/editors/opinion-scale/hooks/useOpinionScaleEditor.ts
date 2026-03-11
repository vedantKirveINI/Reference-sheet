import { useMemo, useState } from "react";
import { validateOpinionScale } from "@/cell-level/renderers/opinion-scale/utils/validateOpinionScale";

const PADDING_WIDTH = 8;

interface UseOpinionScaleEditorProps {
	initialValue: number | null;
	maxValue: number;
	options: number[];
	containerWidth: number;
	containerHeight: number;
}

export function useOpinionScaleEditor({
	initialValue,
	maxValue,
	containerWidth,
}: UseOpinionScaleEditorProps) {
	// Validate initial value; if invalid, show blank
	const validatedInitialValue = useMemo(() => {
		const { isValid, processedValue } = validateOpinionScale({
			value: initialValue,
			maxValue,
		});
		return isValid ? processedValue : null;
	}, [initialValue, maxValue]);

	const [selectedValue, setSelectedValueState] = useState<number | null>(
		validatedInitialValue,
	);
	// Track if the user actually edited anything; used to skip saving on no-op close
	const [hasUserEdited, setHasUserEdited] = useState(false);
	const [popperOpen, setPopperOpen] = useState(false);

	const availableWidth = useMemo(() => {
		return +(containerWidth - PADDING_WIDTH * 2).toFixed(2);
	}, [containerWidth]);

	const handleSelectOption = (value: number) => {
		setHasUserEdited(true); // Mark as edited when user changes selection
		setSelectedValueState(value);
	};

	return {
		selectedValue,
		handleSelectOption,
		popperOpen,
		setPopperOpen,
		availableWidth,
		hasUserEdited, // Expose to parent so it can skip onChange if no edits
	};
}
