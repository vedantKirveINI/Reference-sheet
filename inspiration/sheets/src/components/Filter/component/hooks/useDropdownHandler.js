import { useState } from "react";

function useDropdownHandler({
	defaultValue = [],
	onChange = () => {},
	rest = {},
}) {
	const [value, setValue] = useState(defaultValue || []);

	const { options } = rest;

	const handleChange = (value) => {
		setValue(() => value);
		onChange(value);
	};

	return {
		value,
		handleChange,
		options,
	};
}

export default useDropdownHandler;
