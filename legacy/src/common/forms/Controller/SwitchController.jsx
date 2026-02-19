import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";

function SwitchController(props) {
	const {
		name = "",
		defaultValue,
		control = {},
		rules = {},
		label = "",
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
					<div className="flex items-center gap-2">
						<Switch
							{...rest}
							checked={value}
							onCheckedChange={(checked) => {
								onChange(checked);
							}}
							id={name}
						/>
						{label && (
							<Label htmlFor={name} className="text-sm font-normal">
								{label}
							</Label>
						)}
					</div>
				);
			}}
		/>
	);
}

export default SwitchController;
