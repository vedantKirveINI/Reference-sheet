import ODSAutocomplete from "oute-ds-autocomplete";
import ODSLabel from "oute-ds-label";

import ROLE_OPTIONS from "../constant";

import styles from "./styles.module.scss";

const RoleSelector = (props) => {
	const {
		value,
		onChange,
		disabled = false,
		placeholder = "Select role",
		hideOptions = [],
		sx = {},
		searchable = false,
	} = props || {};

	return (
		<ODSAutocomplete
			{...props}
			variant="black"
			searchable={searchable}
			options={ROLE_OPTIONS}
			value={value}
			onChange={onChange}
			disabled={disabled}
			getOptionLabel={(option) => option.label}
			isOptionEqualToValue={(option, value) =>
				option.value === value.value
			}
			aria-label="Select role"
			renderOption={(props, option, { selected }) => {
				const { key, ...rest } = props;

				if (hideOptions.includes(option.value)) {
					return null;
				}

				return (
					<li key={key} {...rest}>
						<div className={styles.role_container}>
							<ODSLabel
								variant="body1"
								color={selected ? "#ffffff" : "#212121"}
							>
								{option.label}
							</ODSLabel>

							{option.description && (
								<ODSLabel
									variant="caption"
									color={selected ? "#ffffff" : "#607D8B"}
								>
									{option.description}
								</ODSLabel>
							)}
						</div>
					</li>
				);
			}}
			textFieldProps={{
				placeholder,
				inputProps: {
					sx: {
						color:
							value?.value === "remove access"
								? "#ff0000 !important"
								: "#212121 !important",
					},
				},
			}}
			sx={{
				...sx,
			}}
			slotProps={{
				paper: {
					sx: {
						minWidth: "20rem !important",
					},
				},
			}}
		/>
	);
};

export default RoleSelector;
