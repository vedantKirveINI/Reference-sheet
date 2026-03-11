import { useState, useEffect, useRef } from "react";

import validateAndParseInput from "../../utils/validateAndParseInput";

const htmlFontSize =
	typeof window !== "undefined"
		? parseFloat(window.getComputedStyle(document.documentElement).fontSize)
		: 16;

const iconWidth = 1.5 * htmlFontSize;
const paddingWidth = 2 * 0.38 * htmlFontSize;
const paddingHeight = 2 * 0.31 * htmlFontSize;

function useDropDownStaticEditor({
	initialValue = "",
	onChange = () => {},
	cellProperties = {},
	superClose = () => {},
	editorDimension = {},
	ref,
}) {
	const { fieldInfo = {}, wrapClass = "" } =
		cellProperties?.cellProperties || {};

	const { options = [] } = fieldInfo?.options || {};

	const { parsedValue = [] } = validateAndParseInput(initialValue, options);

	const initialSelectedOptions = Array.isArray(parsedValue)
		? parsedValue
		: [];

	const [currentOptions, setCurrentOptions] = useState(
		initialSelectedOptions || [],
	);
	const [popper, setPopper] = useState({
		expandedView: false,
		optionsList: false,
	});

	const expandedViewRef = useRef(null);

	const { width: containerWidth, height: containerHeight } =
		editorDimension || {};

	const availableHeight = +(containerHeight - paddingHeight).toFixed(2);
	const availableWidth = +(containerWidth - iconWidth - paddingWidth).toFixed(
		2,
	);

	const handleSelectOption = (optionValue) => {
		setCurrentOptions(optionValue);

		onChange(JSON.stringify(optionValue));
	};

	const handleKeyDown = (key) => {
		if (["Enter", "Tab"].includes(key.code)) {
			onChange(JSON.stringify(currentOptions));

			superClose();
		}
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
		handleKeyDown,
		expandedViewRef,
		availableHeight,
		availableWidth,
		popper,
		setPopper,
		wrapClass,
		fieldInfo,
	};
}

export default useDropDownStaticEditor;
