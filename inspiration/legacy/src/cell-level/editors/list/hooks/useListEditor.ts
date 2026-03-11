import { useMemo, useState } from "react";
import { validateAndParseList } from "@/cell-level/renderers/list/utils/validateAndParseList";

const ICON_WIDTH = 20 + 6; // icon width + gap
const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

interface UseListEditorProps {
	initialValue: unknown;
	options: string[];
	containerWidth: number;
	containerHeight: number;
}

export const useListEditor = ({
	initialValue,
	options,
	containerWidth,
	containerHeight,
}: UseListEditorProps) => {
	const validatedInitial = useMemo(() => {
		const { isValid, parsedValue } = validateAndParseList(initialValue);
		if (!isValid) return [];
		// Convert to string values for chips
		return parsedValue.map((v) => (typeof v === "number" ? String(v) : v));
	}, [initialValue]);

	// Merge provided options with initial selection to ensure they are available for chips
	const mergedOptions = useMemo(() => {
		const base = Array.isArray(options) ? options.map(String) : [];
		const extra = validatedInitial.filter((v) => !base.includes(v));
		return [...base, ...extra];
	}, [options, validatedInitial]);

	const [popper, setPopper] = useState({
		expandedView: false,
		optionsList: false,
	});

	const [allOptions, setAllOptions] = useState<string[]>(mergedOptions);
	const [currentOptions, setCurrentOptions] =
		useState<string[]>(validatedInitial);
	const [hasUserEdited, setHasUserEdited] = useState(false);

	const availableHeight = +(containerHeight - PADDING_HEIGHT * 2).toFixed(2);
	const availableWidth = +(
		containerWidth -
		ICON_WIDTH -
		PADDING_WIDTH * 2
	).toFixed(2);
	const wrapClass =
		availableHeight > 60 && currentOptions.length > 3 ? "wrap" : "";

	const handleSelectOption = (optionValue: string[]) => {
		setHasUserEdited(true);
		setCurrentOptions(optionValue);
	};

	const handleAddNewOption = (newOption: string) => {
		const option = newOption.trim();
		if (!option) return;
		setHasUserEdited(true);
		setAllOptions((prev) => {
			if (prev.includes(option)) return prev;
			return [...prev, option];
		});
		setCurrentOptions((prev) => {
			if (prev.includes(option)) return prev;
			return [...prev, option];
		});
	};

	return {
		currentOptions,
		allOptions,
		handleSelectOption,
		handleAddNewOption,
		popper,
		setPopper,
		availableHeight,
		availableWidth,
		wrapClass,
		hasUserEdited,
	};
};

