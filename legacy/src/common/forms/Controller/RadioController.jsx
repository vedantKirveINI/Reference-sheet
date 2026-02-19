import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import React from "react";
import { Controller } from "react-hook-form";

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
				return (
					<RadioGroup
						value={String(value)}
						onValueChange={onChange}
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

							return (
								<div
									key={`option_${index}`}
									className="flex items-center space-x-2"
								>
									<RadioGroupItem
										value={String(option)}
										id={`${name}_option_${index}`}
										{...radioProps}
									/>
									<Label
										htmlFor={`${name}_option_${index}`}
										className="font-normal"
									>
										{labelText}
									</Label>
								</div>
							);
						})}
					</RadioGroup>
				);
			}}
		/>
	);
}

export default RadioController;
