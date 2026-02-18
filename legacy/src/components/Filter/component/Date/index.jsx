import React from "react";

import { formatDate } from "../../../../utils/dateHelpers";

const DateFilter = ({
	defaultValue = "",
	onChange = () => {},
	dateFormat,
	useDatePicker,
	separator,
	...rest
}) => {
	const dateValue = formatDate(defaultValue, dateFormat, separator);

	return (
		<div className="w-full">
			<input
				{...rest}
				type="date"
				className="w-full border border-[#d1d5db] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent"
				value={defaultValue || ""}
				onChange={(e) => {
					onChange(e.target.value);
				}}
			/>
		</div>
	);
};

export default DateFilter;
