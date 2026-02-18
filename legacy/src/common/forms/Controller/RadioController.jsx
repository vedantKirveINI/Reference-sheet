import React from "react";
import { Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

function RadioController(props) {
	const {
		name = "",
		control = {},
		defaultValue = "",
		rules = {},
		options = [],
		radioProps = {},
		mainRadioProps,
		optionDetails,
		...rest
	} = props;

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, value } }) => {
				const radioGroupContent = (
					<RadioGroup
						value={String(value)}
						onValueChange={(val) => {
							onChange(val);
						}}
						{...rest}
					>
						{options.map((option, index) => {
							let labelText = option;
							if (optionDetails && optionDetails.length > 0) {
								const optionDetail = optionDetails.find(
									(detail) => String(detail.value) === String(option)
								);
								if (optionDetail && optionDetail.labelText) {
									labelText = optionDetail.labelText;
								}
							}

							const optionId = `${name}-option-${index}`;

							return (
								<div key={`option_${index}`} className="flex items-center gap-2">
									<RadioGroupItem value={String(option)} id={optionId} />
									<Label htmlFor={optionId} className="font-normal">
										{labelText}
									</Label>
								</div>
							);
						})}
					</RadioGroup>
				);

				return radioGroupContent;
			}}
		/>
	);
}

export default RadioController;
