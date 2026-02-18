import TextField from "oute-ds-text-field";
import React, { useState } from "react";

function Input({ defaultValue = "", onChange, ...rest }) {
	const [value, setValue] = useState(defaultValue);

	return (
		<TextField
			{...rest}
			value={value}
			sx={{
				width: "100%",
			}}
			onChange={(e) => {
				setValue(e.target.value);

				if (onChange) {
					onChange(e.target.value);
				}
			}}
		/>
	);
}

export default Input;
