import { useState } from "react";

import YES_NO_OPTIONS from "../../../../constants/yesNoOptions";
import { getYesNoColours } from "../../../../utils/assignColours";

const optionColourMapping = getYesNoColours();

function useYesNoHandler({ defaultValue = "", onChange = () => {} }) {
	const [value, setValue] = useState(defaultValue);

	const handleChange = (val) => {
		const selectedOption = YES_NO_OPTIONS.find(
			(option) => option.value === val,
		);

		setValue(() => selectedOption.value);
		onChange(selectedOption.value);
	};

	return {
		value,
		handleChange,
		options: YES_NO_OPTIONS,
		optionColourMapping,
	};
}

export default useYesNoHandler;
