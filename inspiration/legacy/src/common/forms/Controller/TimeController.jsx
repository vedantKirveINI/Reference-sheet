import React from "react";
import { Controller } from "react-hook-form";
import { Time } from "@oute/oute-ds.molecule.time";

function TimeController(props) {
	const {
		name = "",
		defaultValue,
		control = {},
		rules = {},
		label = "",
		...rest
	} = props || {};

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, value } }) => {
				const handleTimeChange = (data) => {
					if (!data?.meridiem && data?.time) {
						onChange({ ...data, meridiem: "AM" });
					} else {
						onChange({
							time: data?.time,
							meridiem: data?.meridiem,
						});
					}
				};

				return (
					<Time {...rest} value={value} onChange={handleTimeChange} />
				);
			}}
		/>
	);
}

export default TimeController;
