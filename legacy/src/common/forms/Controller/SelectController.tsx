import { forwardRef, Ref } from "react";
import {
	Controller,
	Control,
	FieldValues,
	RegisterOptions,
} from "react-hook-form";

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
	[key: string]: any;
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
					<select
						ref={ref}
						className={`flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors[name] ? "border-destructive" : "border-input"}`}
						value={
							typeof newValue === "object" && newValue !== null
								? newValue?.value ?? ""
								: newValue ?? ""
						}
						onChange={(e) => {
							const selectedOption = options.find(
								(opt) => String(opt.value) === String(e.target.value),
							);
							const val = selectedOption || e.target.value;
							onChange(val);
							if (rest?.onChange) {
								rest.onChange(e, val);
							}
						}}
						onBlur={onBlur}
					>
						<option value="">Select...</option>
						{options.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				);
			}}
		/>
	);
}

export default forwardRef<HTMLInputElement, SelectControllerProps>(
	SelectController,
);
