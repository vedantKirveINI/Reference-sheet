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
		optionDetails, // Support for custom labelText with icons
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
					<RadioGroup {...rest} value={value} onChange={onChange}>
						{options.map((option, index) => {
							// If optionDetails exists, use it to get custom labelText
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
								<Radio
									key={`option_${index}`}
									{...mainRadioProps}
									labelText={labelText}
									formControlLabelProps={{
										value: option,
									}}
									radioProps={radioProps}
								/>
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
