import { useState } from "react";

import YES_NO_OPTIONS from "../../../../../../../../constants/yesNoOptions";
import { getYesNoColours } from "../../../../../../../../utils/assignColours";
import validateYesNo from "../../utils/validateYesNo";

const optionColourMapping = getYesNoColours();

function useYesNoEditor(props) {
	const {
		initialValue = "",
		onChange = () => {},
		cellProperties = {},
		superClose = () => {},
	} = props;

	const { fieldInfo = {} } = cellProperties?.cellProperties || {};
	const { other } = fieldInfo?.options || [];

	const { newValue = "" } = validateYesNo({ value: initialValue, other });

	const [selectedOption, setSelectedOption] = useState(newValue);

	const handleChange = (value) => {
		const correctOption = YES_NO_OPTIONS.find(
			(option) => option.value === value,
		);

		setSelectedOption(() => correctOption.value);
		onChange(correctOption.value);
	};

	const handleKeyDown = (key) => {
		if (["Enter", "Tab"].includes(key.code)) {
			onChange(selectedOption);

			superClose();
		}
	};
	return {
		selectedOption,
		handleChange,
		handleKeyDown,
		optionColourMapping,
		onChange,
	};
}

export default useYesNoEditor;
