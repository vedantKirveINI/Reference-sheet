import React from "react";

import SingleSelect from "../common/SingleSelect";
import useYesNoHandler from "../hooks/useYesNoHandler";

function YesNo({ defaultValue = "", onChange = () => {} }) {
	const {
		value = "",
		handleChange = () => {},
		options = [],
		optionColourMapping = {},
	} = useYesNoHandler({
		defaultValue,
		onChange,
	});

	return (
		<div className="w-full">
			<SingleSelect
				value={value}
				handleChange={handleChange}
				options={options}
				optionBackgroundColor={optionColourMapping}
			/>
		</div>
	);
}

export default YesNo;
