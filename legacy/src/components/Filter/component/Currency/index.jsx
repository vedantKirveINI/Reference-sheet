import React, { useState } from "react";
import { Input } from "@/components/ui/input";

function CurrencyFilter({ defaultValue = "", onChange = () => {}, ...rest }) {
	const [value, setValue] = useState(defaultValue);

	return (
		<Input
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
