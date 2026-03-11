import React from "react";
import { Controller } from "react-hook-form";

import DateTimePicker from "../../components/DateTimePicker";

function DateTimeController(props) {
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
					<DateTimePicker
						{...rest}
						value={value}
						onChange={onChange}
						onSubmit={onChange}
					/>
				);
			}}
		/>
	);
}

export default DateTimeController;
