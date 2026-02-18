import React from "react";
import { Controller } from "react-hook-form";

function DateCalendarController(props) {
	const {
		name = "",
		control = {},
		defaultValue = "",
		rules = {},
		sx: propSx = {},
		...rest
	} = props;

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, value } }) => {
				const dateValue = value?.format
					? value.format("YYYY-MM-DD")
					: value || "";

				return (
					<input
						type="date"
						className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						value={dateValue}
						onChange={(e) => {
							onChange(e.target.value);
						}}
						{...rest}
					/>
				);
			}}
		/>
	);
}

export default DateCalendarController;
