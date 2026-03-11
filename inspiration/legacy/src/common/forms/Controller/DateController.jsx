import { DateInput } from "@oute/oute-ds.atom.date-input";
import React from "react";
import { Controller } from "react-hook-form";

function DateController(props) {
	const {
		name = "",
		control = {},
		defaultValue = "",
		rules = {},
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
					<DateInput {...rest} value={value} onChange={onChange} />
				);
			}}
		/>
	);
}

export default DateController;
