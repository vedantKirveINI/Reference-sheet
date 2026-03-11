import { DateCalendar } from "@mui/x-date-pickers";
import React from "react";
import { Controller } from "react-hook-form";

function DateCalendarController(props) {
	const {
		name = "",
		control = {},
		defaultValue = "",
		rules = {},
		...rest
	} = props;
	console.log("rest-->>", rest.sx);

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, value } }) => {
				return (
					<DateCalendar
						{...rest}
						value={value || null}
						onChange={onChange}
						sx={{
							".MuiPickersSlideTransition-root": {
								minHeight: "15rem !important",
							},
							"&.MuiDateCalendar-root": {
								height: "unset !important",
								// backgroundColor: "red !important",
							},
						}}
					/>
				);
			}}
		/>
	);
}

export default DateCalendarController;
