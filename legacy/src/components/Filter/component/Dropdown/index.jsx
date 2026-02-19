import isEmpty from "lodash/isEmpty";
import ODSAutocomplete from "oute-ds-autocomplete";
import CheckBox from "oute-ds-checkbox";
import TextField from "oute-ds-text-field";
import React from "react";

import useDropdownHandler from "../hooks/useDropdownHandler";

const DropdownFilter = ({
	defaultValue = [],
	onChange = () => {},
	...rest
}) => {
	const {
		value = [],
		handleChange = () => {},
		options = [],
	} = useDropdownHandler({
		defaultValue,
		onChange,
		rest,
	});

	return (
		<ODSAutocomplete
			variant="black"
			multiple
			ListboxProps={{
				"data-testid": "ods-autocomplete-listbox",
				style: {
					maxHeight: `18.75rem`,
					padding: "0.375rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.375rem",
				},
			}}
			hideBorders
			value={value}
			options={options.map((item) => item?.label)}
			onChange={(e, val) => {
				handleChange(val);
			}}
			sx={{
				minWidth: "100%",
				width: "100%",
				"&.MuiAutocomplete-root": {
					maxWidth: "32rem",
				},
			}}
			renderOption={(props, option, { selected }) => {
				const { key, ...rest } = props;
				return (
					<li key={key} {...rest}>
						<CheckBox
							key={option?.id}
							labelText={option}
							checked={selected}
							labelProps={{
								variant: "subtitle1",
								sx: {
									color: "inherit",
								},
							}}
							sx={{
								"&.Mui-checked": {
									color: "white",
								},
							}}
						/>
					</li>
				);
			}}
			renderInput={(params) => {
				return (
					<TextField
						{...params}
						placeholder={isEmpty(value) ? "Select Option" : ""}
					/>
				);
			}}
		/>
	);
};

export default DropdownFilter;
