import { Input } from "@/components/ui/input";
import { forwardRef, Ref } from "react";
import {
	Controller,
	Control,
	FieldValues,
	RegisterOptions,
} from "react-hook-form";

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
	[key: string]: any;
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
		sx,
		className,
		...rest
	} = props as InputControllerProps;

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, onBlur, value } }) => {
				return (
					<div className="w-full">
						{showLabel && label && (
							<label className="text-sm font-medium text-gray-700 mb-1 block">
								{label}
							</label>
						)}
						<Input
							ref={ref}
							className={`w-full text-[0.8125rem] font-normal text-gray-800 rounded-md bg-white border-gray-300 px-3 py-2 placeholder:text-gray-400 hover:bg-gray-50 hover:border-gray-400 focus:bg-white focus:border-gray-800 focus:ring-1 focus:ring-gray-800 transition-all duration-200 ${errors[name] ? "border-destructive" : ""} ${className ?? ""}`}
							onChange={onChange}
							value={value}
							onBlur={onBlur}
							onKeyDown={(e) => {
								if (e.key === "Enter" && onEnter) {
									onEnter(e);
								}
							}}
							{...rest}
						/>
					</div>
				);
			}}
		/>
	);
}

export default forwardRef<any, InputControllerProps>(InputController);
