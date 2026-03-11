import { useState, useRef, useEffect } from "react";

const ICON_WIDTH = 20 + 6; // iconWidth + gap
const PADDING_WIDTH = 7 * 2;
const PADDING_HEIGHT = 4;

function useListEditor({
	initialValue = "[]",
	onChange = () => {},
	cellProperties = {},
	editorDimension = {},
	ref,
}) {
	const { fieldInfo = {}, wrapClass = "" } =
		cellProperties?.cellProperties || {};

	// Parse initial value - assuming it's an array of strings
	const parseInitialValue = (value) => {
		if (!value) return [];

		try {
			const parsed = Array.isArray(value) ? value : JSON.parse(value);
			return Array.isArray(parsed) ? parsed : [];
		} catch (e) {
			return [];
		}
	};

	const initialSelectedOptions = parseInitialValue(initialValue);

	const [popper, setPopper] = useState({
		expandedView: false,
		optionsList: false,
	});

	// currentOptions: master list of all options (never remove from this)
	const [currentOptions, setCurrentOptions] = useState(
		initialSelectedOptions || [],
	);

	// selectedOptions: currently selected options (can change)
	const [selectedOptions, setSelectedOptions] = useState(
		initialSelectedOptions || [],
	);

	const expandedViewRef = useRef(null);

	const { width: containerWidth, height: containerHeight } =
		editorDimension || {};

	const availableHeight = +(containerHeight - PADDING_HEIGHT).toFixed(2);
	const availableWidth = +(
		containerWidth -
		ICON_WIDTH -
		PADDING_WIDTH
	).toFixed(2);

	const handleSelectOption = (optionValue) => {
		// Update the selected options (what user has selected)
		setSelectedOptions(optionValue);

		// Also update the parent component
		onChange(JSON.stringify(optionValue));
	};

	// // Function to add new option to currentOptions (master list)
	const handleAddNewOption = (newOption) => {
		if (newOption && !currentOptions.includes(newOption)) {
			// Add to master list (currentOptions)
			setCurrentOptions((prev) => [...prev, newOption]);

			// Also add to selected options
			setSelectedOptions((prev) => [...prev, newOption]);

			// Update parent
			onChange(JSON.stringify([...selectedOptions, newOption]));
		}
	};

	// Auto-open popover when editor opens
	useEffect(() => {
		if (ref.current) {
			setPopper({
				optionsList: true,
				expandedView: false,
			});
		}
	}, [ref, setPopper]);

	return {
		currentOptions, // Master list of all options (never remove)
		selectedOptions, // Currently selected options
		handleSelectOption,
		handleAddNewOption,
		expandedViewRef,
		availableHeight,
		availableWidth,
		fieldInfo,
		popper,
		setPopper,
		wrapClass,
	};
}

export default useListEditor;
