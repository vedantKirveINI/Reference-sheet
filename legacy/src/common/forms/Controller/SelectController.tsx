import ODSAutoComplete from "oute-ds-autocomplete";
import { forwardRef, Ref } from "react";
import {
	Controller,
	Control,
	FieldValues,
	RegisterOptions,
} from "react-hook-form";

// Type definitions
interface SelectOption {
	value: any;
	label: string;
	[key: string]: any;
}

interface SelectControllerProps {
	name?: string;
	defaultValue?: any;
	control?: Control<FieldValues>;
	rules?: RegisterOptions;
	errors?: Record<string, any>;
	options?: SelectOption[];
	onChange?: (event: any, value: any) => void;
	textFieldProps?: Record<string, any>;
	sx?: Record<string, any>;
	[key: string]: any; // For additional props
}

function SelectController(
	props: SelectControllerProps,
	ref: Ref<HTMLInputElement>,
) {
	const {
		name = "",
		defaultValue,
		control = {} as Control<FieldValues>,
		rules = {},
		errors = {},
		options = [],
		...rest
	} = props as SelectControllerProps;

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
						onChange={(e: Event, v: any) => {
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
						ListboxProps={{
							"data-testid": "ods-autocomplete-listbox",
							style: {
								padding: "0.5rem",
								gap: "0.25rem",
								display: "flex",
								flexDirection: "column",
							},
							sx: {
								padding: "0.5rem !important",
								"& .MuiAutocomplete-option": {
									flexShrink: 0,
									minHeight: "unset !important",
									height: "2rem !important",
									padding: "0.5rem 0.625rem !important",
									margin: "0 !important",
									borderRadius: "0.25rem",
									fontSize: "0.8125rem !important",
									lineHeight: 1.25,
									alignItems: "center",
									transition:
										"background-color 0.15s ease, color 0.15s ease",
									"&:hover": {
										backgroundColor:
											"rgba(33, 33, 33, 0.08) !important",
									},
									"&.Mui-focused": {
										backgroundColor:
											"rgba(33, 33, 33, 0.12) !important",
									},
									'&[aria-selected="true"]': {
										color: "#fff !important",
										backgroundColor: "#212121 !important",
									},
									'&[aria-selected="true"]:hover': {
										backgroundColor:
											"rgba(33, 33, 33, 0.85) !important",
									},
								},
							},
							...rest?.ListboxProps,
						}}
						slotProps={{
							...rest?.slotProps,
						}}
					/>
				);
			}}
		/>
	);
}

export default forwardRef<HTMLInputElement, SelectControllerProps>(
	SelectController,
);
