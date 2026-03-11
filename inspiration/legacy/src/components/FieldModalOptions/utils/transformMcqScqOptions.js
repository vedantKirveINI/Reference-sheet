import { v4 as uuidv4 } from "uuid";

function transformOptions(value = {}) {
	const { options } = value || {};

	if (!options) {
		return [{ id: uuidv4(), label: "" }];
	}

	const transformedOptions = options.options?.map((option) => ({
		id: uuidv4(),
		label: option,
	}));

	return transformedOptions || [{}];
}

export default transformOptions;
