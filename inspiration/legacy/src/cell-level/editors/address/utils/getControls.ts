/**
 * Get form controls configuration for address fields
 * Inspired by sheets project's getControls
 */
import startCase from "lodash/startCase";
import { IGNORE_FIELD, ADDRESS_KEY_MAPPING } from "./constants";

export interface ControlConfig {
	label: string;
	name: string;
	type: "string" | "number";
	placeholder: string;
	rules: {
		required?: boolean;
	};
}

export function getControls({
	settings = {},
}: {
	settings?: Record<string, any>;
}) {
	const controls: ControlConfig[] = [];

	ADDRESS_KEY_MAPPING.forEach((ele) => {
		const commonConfig: ControlConfig = {
			label: startCase(ele),
			name: ele,
			type: ele === "zipCode" ? "number" : "string",
			placeholder: startCase(ele),
			rules: {
				required: settings[ele],
			},
		};

		if (!IGNORE_FIELD.includes(ele as any)) {
			controls.push(commonConfig);
		}
	});

	return {
		controls,
	};
}




