import ODSTextField from "oute-ds-text-field";
import React from "react";
import { forwardRef } from "react";
import { Controller } from "react-hook-form";

function InputController(props, ref) {
	const {
		name = "",
		control = {},
		defaultValue = "",
		rules = {},
		label = "",
		showLabel = false,
		errors = {},
		onEnter = () => {},
		...rest
	} = props || {};

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, onBlur, value } }) => {
				return (
					<ODSTextField
						inputRef={ref}
						error={errors[name]}
						{...rest}
						className="black"
						label={showLabel ? label : undefined}
						onChange={onChange}
						value={value}
						onBlur={onBlur}
						onEnter={onEnter}
						sx={{
							width: "100%",
							...rest.sx,
						}}
					/>
				);
			}}
		/>
	);
}

export default forwardRef(InputController);
