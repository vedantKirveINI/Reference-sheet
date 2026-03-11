import ODSTextField from "oute-ds-text-field";

import { NUMBER_PATTERN } from "../../../../../../../constants/regex";

function NumberField({ value = "", onChange = () => {}, fieldIndex = 0 }) {
	const handleChange = (e) => {
		const newValue = e.target.value;

		// Only allow numbers and empty string
		if (newValue === "" || NUMBER_PATTERN.test(newValue)) {
			onChange(newValue);
		}
	};

	return (
		<ODSTextField
			className="black"
			onChange={handleChange}
			value={value || ""}
			type="number"
			autoFocus={fieldIndex === 0}
			sx={{
				"& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
					{
						WebkitAppearance: "none",
						margin: 0,
					},
				"& input[type=number]": {
					MozAppearance: "textfield",
				},
			}}
			fullWidth
			data-testid="number-expanded-row"
		/>
	);
}

export default NumberField;
