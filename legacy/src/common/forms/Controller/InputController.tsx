import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
							<Label htmlFor={name} className="mb-1.5 block">
								{label}
							</Label>
						)}
						<Input
							ref={ref}
							id={name}
							{...rest}
							className={cn(
								errors[name] && "border-red-500 focus-visible:ring-red-500",
								className,
							)}
							onChange={onChange}
							value={value}
							onBlur={onBlur}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									onEnter(e);
								}
							}}
						/>
					</div>
				);
			}}
		/>
	);
}

export default forwardRef<any, InputControllerProps>(InputController);
