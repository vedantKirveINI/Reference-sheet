import { useState } from "react";

import YES_NO_OPTIONS from "../../../../../../../../constants/yesNoOptions";
import validateYesNo from "../../../../QuestionType/YesNo/utils/validateYesNo";

const useYesNoFieldHandler = ({
	value = "",
	onChange = () => {},
	field = {},
}) => {
	const { other } = field?.options || {};

	const { newValue = "" } = validateYesNo({ value, other });

	const [selectedOption, setSelectedOption] = useState(newValue);

	const handleChange = (value) => {
		const correctOption = YES_NO_OPTIONS.find(
			(option) => option.value === value,
		);

		setSelectedOption(() => correctOption.value);
		onChange(correctOption.value);
	};

	return {
		selectedOption,
		handleChange,
	};
};

export default useYesNoFieldHandler;
