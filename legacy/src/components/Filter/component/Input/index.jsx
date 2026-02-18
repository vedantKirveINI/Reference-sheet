import { Input } from "@/components/ui/input";
import React, { useState } from "react";

function InputFilter({ defaultValue = "", onChange, ...rest }) {
	const [value, setValue] = useState(defaultValue);

	return (
		<Input
			{...rest}
			value={value}
			className="w-full"
			onChange={(e) => {
				setValue(e.target.value);

				if (onChange) {
					onChange(e.target.value);
				}
			}}
		/>
	);
}

export default InputFilter;
