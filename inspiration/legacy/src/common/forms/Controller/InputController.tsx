import ODSTextField from "oute-ds-text-field";
import { forwardRef, Ref } from "react";
import {
	Controller,
	Control,
	FieldValues,
	RegisterOptions,
} from "react-hook-form";

// Type definitions
interface InputControllerProps {
	name?: string;
	control?: Control<FieldValues>;
	defaultValue?: any;
	rules?: RegisterOptions;
	label?: string;
	showLabel?: boolean;
	errors?: Record<string, any>;
	onEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	sx?: Record<string, any>;
	[key: string]: any; // For additional props
}

function InputController(
	props: InputControllerProps,
	ref: Ref<HTMLInputElement>,
) {
	const {
		name = "",
		control = {} as Control<FieldValues>,
		defaultValue = "",
		rules = {},
		label = "",
		showLabel = false,
		errors = {},
		onEnter = () => {},
		...rest
	} = props as InputControllerProps;

	// Default smaller styles for input fields
	const defaultSx = {
		width: "100%",
		"& .MuiInputBase-input": {
			fontSize: "0.8125rem",
			fontFamily:
				"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
			padding: "0.5rem 0.75rem",
			color: "#1f2937",
			fontWeight: 400,
		},
		"& .MuiOutlinedInput-root": {
			borderRadius: "0.375rem",
			backgroundColor: "#ffffff",
			transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
			"&:hover": {
				backgroundColor: "#fafafa",
			},
			"&:hover .MuiOutlinedInput-notchedOutline": {
				borderColor: "#9ca3af",
			},
			"&.Mui-focused": {
				backgroundColor: "#ffffff",
			},
			"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
				borderColor: "#1f2937",
				borderWidth: "0.125rem",
			},
		},
		"& .MuiOutlinedInput-notchedOutline": {
			borderColor: "#d1d5db",
			borderWidth: "0.0625rem",
		},
		"& .MuiInputBase-input::placeholder": {
			color: "#9ca3af",
			opacity: 1,
		},
	};

	// Merge default styles with external sx, external styles take precedence
	const mergedSx = {
		...defaultSx,
		...rest.sx,
		// Deep merge for nested objects to allow partial overrides
		"& .MuiInputBase-input": {
			...defaultSx["& .MuiInputBase-input"],
			...(rest.sx?.["& .MuiInputBase-input"] || {}),
		},
		"& .MuiOutlinedInput-root": {
			...defaultSx["& .MuiOutlinedInput-root"],
			...(rest.sx?.["& .MuiOutlinedInput-root"] || {}),
		},
		"& .MuiOutlinedInput-notchedOutline": {
			...defaultSx["& .MuiOutlinedInput-notchedOutline"],
			...(rest.sx?.["& .MuiOutlinedInput-notchedOutline"] || {}),
		},
		"& .MuiInputBase-input::placeholder": {
			...defaultSx["& .MuiInputBase-input::placeholder"],
			...(rest.sx?.["& .MuiInputBase-input::placeholder"] || {}),
		},
	};

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
						sx={mergedSx}
					/>
				);
			}}
		/>
	);
}

export default forwardRef<any, InputControllerProps>(InputController);
