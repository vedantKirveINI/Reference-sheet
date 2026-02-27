import ODSSwitch from "oute-ds-switch";
import { Controller } from "react-hook-form";

function SwitchController(props) {
	const {
		name = "",
		defaultValue,
		control = {},
		rules = {},
		label = "",
		// eslint-disable-next-line no-unused-vars
		type = "",
		variant = "black",
		labelProps = {},
		...rest
	} = props || {};

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, value } }) => {
				return (
					<ODSSwitch
						{...rest}
						variant={variant}
						checked={value}
						onChange={(e) => {
							onChange(e.target.checked);
						}}
						labelProps={{
							variant: labelProps?.variant,
							sx: {
								fontSize: "1rem",
								fontFamily: "Inter",
								...labelProps?.sx,
							},
						}}
						labelText={label}
					/>
				);
			}}
		/>
	);
}

export default SwitchController;
