import { useState, useRef, useEffect } from "react";

import validateAndParseInput from "../../utils/validateAndParseInput";

const ICON_WIDTH = 20 + 6; // iconWidth + gap
const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

function useMcqEditor({
	initialValue = "",
	onChange = () => {},
	cellProperties = {},
	superClose = () => {},
	editorDimension = {},
	ref,
}) {
	const { fieldInfo = {}, wrapClass = "" } =
		cellProperties?.cellProperties || {};

	const { options = [] } = fieldInfo?.options || [];

	const { parsedValue = [] } = validateAndParseInput(initialValue, options);

	const initialSelectedOptions = Array.isArray(parsedValue)
		? parsedValue
		: [];

	const [popper, setPopper] = useState({
		expandedView: false,
		optionsList: false,
	});

	const [currentOptions, setCurrentOptions] = useState(
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
		setCurrentOptions(() => optionValue);

		onChange(JSON.stringify(optionValue));
	};

	useEffect(() => {
		if (ref.current) {
			setPopper({
				optionsList: true,
				expandedView: false,
			});
		}
	}, [ref, setPopper]);

	return {
		currentOptions,
		options,
		handleSelectOption,
		// handleKeyDown,
		expandedViewRef,
		availableHeight,
		availableWidth,
		fieldInfo,
		popper,
		setPopper,
		wrapClass,
	};
}

export default useMcqEditor;
