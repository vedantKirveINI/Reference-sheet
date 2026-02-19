import { Input } from "@/components/ui/input";
import React from "react";
import { Controller } from "react-hook-form";

function DateController(props) {
	const {
		name = "",
		control = {},
		defaultValue = "",
		rules = {},
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
				return (
					<Input
						type="date"
						{...rest}
						className={className}
						value={value || ""}
						onChange={(e) => onChange(e.target.value)}
					/>
				);
			}}
		/>
	);
}

export default DateController;
