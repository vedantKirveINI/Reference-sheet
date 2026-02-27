import Radio from "oute-ds-radio";
import RadioGroup from "oute-ds-radio-group";
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
					<RadioGroup {...rest} value={value} onChange={onChange}>
						{options.map((option, index) => {
							return (
								<Radio
									key={`option_${index}`}
									{...mainRadioProps}
									labelText={option}
									formControlLabelProps={{
										value: option,
									}}
									radioProps={radioProps}
								/>
							);
						})}
					</RadioGroup>
				);
			}}
		/>
	);
}

export default RadioController;
