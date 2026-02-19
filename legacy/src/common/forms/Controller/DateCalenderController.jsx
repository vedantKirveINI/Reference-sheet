import { Input } from "@/components/ui/input";
import React from "react";
import { Controller } from "react-hook-form";

function DateCalendarController(props) {
	const {
		name = "",
		control = {},
		defaultValue = "",
		rules = {},
		sx: propSx = {},
		className,
		...rest
	} = props;

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, value } }) => {
				let dateString = "";
				if (value) {
					if (value instanceof Date) {
						dateString = value.toISOString().split("T")[0];
					} else if (typeof value === "string") {
						dateString = value.split("T")[0];
					} else if (value.$d) {
						dateString = new Date(value.$d).toISOString().split("T")[0];
					}
				}

				return (
					<Input
						type="date"
						{...rest}
						className={className}
						value={dateString}
						onChange={(e) => {
							const newDate = e.target.value ? new Date(e.target.value) : null;
							onChange(newDate);
						}}
					/>
				);
			}}
		/>
	);
}

export default DateCalendarController;
