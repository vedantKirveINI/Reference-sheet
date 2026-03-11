import startCase from "lodash/startCase";

import { IGNORE_FIELD, ADDRESS_KEY_MAPPING } from "./constant";

function getControls({ settings = {} }) {
	const controls = [];

	ADDRESS_KEY_MAPPING.forEach((ele) => {
		const commonConfig = {
			label: startCase(ele),
			name: ele,
			type: ele === "zipCode" ? "number" : "string",
			placeholder: startCase(ele),
			rules: {
				required: settings[ele],
			},
		};

		if (!IGNORE_FIELD.includes(ele)) {
			controls.push(commonConfig);
		}
	});

	return {
		controls,
	};
}

export default getControls;
