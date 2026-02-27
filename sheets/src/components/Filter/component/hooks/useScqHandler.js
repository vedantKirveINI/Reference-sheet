import { useState } from "react";

import { getAssignedColours } from "../../../../utils/assignColours";

function useScqHandler({ defaultValue = "", onChange = () => {}, rest = {} }) {
	const [value, setValue] = useState(defaultValue);

	const { options = [] } = rest;

	const handleChange = (value) => {
		const selectedOption = options.find((option) => option === value);

		setValue(() => selectedOption);
		onChange(selectedOption);
	};

	const optionsWithColours = getAssignedColours(options);

	return {
		value,
		handleChange,
		options,
		setValue,
		optionsWithColours,
	};
}

export default useScqHandler;
