import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
	onChange?: (value: any) => void;
	placeholder?: string;
	className?: string;
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
		placeholder,
		className,
		...rest
	} = props as SelectControllerProps;

	return (
		<Controller
			name={name}
			defaultValue={defaultValue}
			rules={rules}
			control={control}
			render={({ field: { onChange, onBlur, value: newValue } }) => {
				const selectedOption = options.find(
					(opt) => opt.value === newValue || opt.label === newValue,
				);
				const stringValue = selectedOption
					? String(selectedOption.value)
					: newValue
						? String(newValue)
						: undefined;

				return (
					<Select
						value={stringValue}
						onValueChange={(v) => {
							const option = options.find((opt) => String(opt.value) === v);
							const resolvedValue = option || v;
							onChange(resolvedValue);
							if (rest?.onChange) {
								rest.onChange(resolvedValue);
							}
						}}
					>
						<SelectTrigger
							ref={ref}
							className={cn(
								"w-full",
								errors[name] && "border-red-500 focus:ring-red-500",
								className,
							)}
							onBlur={onBlur}
						>
							<SelectValue placeholder={placeholder || "Select..."} />
						</SelectTrigger>
						<SelectContent>
							{options.map((option, index) => (
								<SelectItem
									key={`${option.value}-${index}`}
									value={String(option.value)}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			}}
		/>
	);
}

export default forwardRef<HTMLInputElement, SelectControllerProps>(
	SelectController,
);
