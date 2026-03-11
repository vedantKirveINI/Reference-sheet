import React, { useState } from "react";
import TextField from "oute-ds-text-field";

function CurrencyFilter({ defaultValue = "", onChange = () => {}, ...rest }) {
	const [value, setValue] = useState(defaultValue);

	return (
		<TextField
			{...rest}
			value={value}
			onChange={(e) => {
				setValue(e.target.value);

				if (onChange) {
					onChange(e.target.value);
				}
			}}
		/>
	);
}

export default CurrencyFilter;
