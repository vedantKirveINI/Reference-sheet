import { DateCalendar } from "@mui/x-date-pickers";
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
				return (
					<DateCalendar
						{...rest}
						value={value || null}
						onChange={onChange}
						sx={{
							".MuiPickersSlideTransition-root": {
								minHeight: "16.5rem !important", // Increased to accommodate all dates
								overflow: "visible !important",
								maxHeight: "none !important",
								paddingBottom: "0.5rem !important", // Add bottom padding
							},
							"&.MuiDateCalendar-root": {
								height: "unset !important",
								overflow: "visible !important",
								maxHeight: "none !important",
								padding: "0.5rem !important", // Add padding around calendar
							},
							".MuiDayCalendar-root": {
								overflow: "visible !important",
								maxHeight: "none !important",
								paddingBottom: "0.5rem !important", // Ensure bottom dates aren't clipped
							},
							".MuiPickersCalendarHeader-root": {
								overflow: "visible !important",
								maxHeight: "none !important",
							},
							"& .MuiPickersCalendarHeader-root": {
								overflow: "visible !important",
								maxHeight: "none !important",
							},
							"& .MuiDayCalendar-root": {
								overflow: "visible !important",
								maxHeight: "none !important",
								paddingBottom: "0.5rem !important",
							},
							"& .MuiPickersSlideTransition-root": {
								overflow: "visible !important",
								maxHeight: "none !important",
								minHeight: "16.5rem !important",
								paddingBottom: "0.5rem !important",
							},
							"& .MuiPickersCalendarHeader-root > *": {
								overflow: "visible !important",
							},
							...propSx,
						}}
					/>
				);
			}}
		/>
	);
}

export default DateCalendarController;
