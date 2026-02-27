import { useState, useEffect } from "react";

import { getAssignedColours } from "../../../../../../../../utils/assignColours";
import validateSCQ from "../../utils/validateSCQ";

const paddingWidth = 2 * 7;
const borderWidth = 2 * 2;

function useScqEditor(props, ref) {
	const {
		initialValue = "",
		onChange = () => {},
		cellProperties = {},
		superClose = () => {},
		editorDimension = {},
	} = props || {};

	const { fieldInfo = {} } = cellProperties?.cellProperties || {};

	const { options = [], defaultValue = "" } = fieldInfo?.options || {};

	const { newValue = "" } = validateSCQ(initialValue, options);

	const [selectedOption, setSelectedOption] = useState(newValue);
	const [popperOpen, setPopperOpen] = useState(false);

	const optionBackgroundColour = getAssignedColours(options);

	const { width: containerWidth } = editorDimension || {};

	const availableWidth = +(
		containerWidth -
		paddingWidth -
		borderWidth
	).toFixed(2);

	const handleChange = (value) => {
		const selectedOption = options.find((option) => option === value);

		setSelectedOption(() => selectedOption);

		onChange(selectedOption);
	};

	const handleSelectOption = (option) => {
		setSelectedOption(option);
		onChange(option);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Escape") {
			setPopperOpen(false);
			superClose();
		} else if (e.key === "Enter" && !e.shiftKey) {
			onChange(selectedOption);
			superClose();
		}
	};

	useEffect(() => {
		const { newValue = "" } = validateSCQ(initialValue, options);
		setSelectedOption(newValue);
	}, [initialValue, options]);

	useEffect(() => {
		if (ref.current) {
			setPopperOpen(true);
		}
	}, []);

	return {
		selectedOption,
		handleChange,
		handleKeyDown,
		optionBackgroundColour,
		options,
		defaultValue,
		popperOpen,
		setPopperOpen,
		handleSelectOption,
		availableWidth,
	};
}

export default useScqEditor;
