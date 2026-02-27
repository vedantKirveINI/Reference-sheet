import React from "react";
import { Controller } from "react-hook-form";

import TimePicker from "../../components/TimePicker";

function TimePickerController(props) {
	const {
		name = "",
		control = {},
		defaultValue = "",
		rules = {},
		...rest
	} = props || {};

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { value, onChange } }) => {
				return (
					<TimePicker {...rest} value={value} onChange={onChange} />
				);
			}}
		/>
	);
}

export default TimePickerController;
