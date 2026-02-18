import { useState, useCallback } from "react";

function useMcqHandler({ defaultValue = [], onChange = () => {}, ...rest }) {
	const [value, setValue] = useState(defaultValue || []);

	const { options = [] } = rest || {};

	const handleSelectOption = useCallback(
		(option) => {
			setValue(option);
			onChange(option);
		},
		[onChange],
	);

	return {
		value,
		options,
		handleSelectOption,
	};
}

export default useMcqHandler;
