import ODSAutoComplete from "oute-ds-autocomplete";
import { forwardRef } from "react";
import { Controller } from "react-hook-form";

function SelectController(props, ref) {
	const {
		name = "",
		defaultValue,
		control = {},
		rules = {},
		errors = {},
		options = [],
		...rest
	} = props || {};

	return (
		<Controller
			name={name}
			defaultValue={defaultValue}
			rules={rules}
			control={control}
			render={({ field: { onChange, onBlur, value: newValue } }) => {
				return (
					<ODSAutoComplete
						ref={ref}
						{...rest}
						variant="black"
						sx={{
							width: "100%",
							...rest?.sx,
						}}
						options={options}
						onChange={(e, v) => {
							onChange(v);
							if (rest?.onChange) {
								rest.onChange(e, v);
							}
						}}
						textFieldProps={{
							...(rest?.textFieldProps || {}),
							error: errors[name],
							ref: ref,
						}}
						value={newValue}
						onBlur={onBlur}
					/>
				);
			}}
		/>
	);
}

export default forwardRef(SelectController);
