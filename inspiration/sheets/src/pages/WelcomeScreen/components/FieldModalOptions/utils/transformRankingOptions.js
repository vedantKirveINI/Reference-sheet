import isEmpty from "lodash/isEmpty";
import { v4 as uuidv4 } from "uuid";

function transformedOptions(value = {}) {
	const { options } = value;

	if (isEmpty(options)) {
		return [{ id: uuidv4(), label: "", rank: null }];
	}

	const transformedOptions = options?.options?.map(({ id, label, rank }) => ({
		id: id ?? uuidv4(),
		label: label ?? "",
		rank: rank ?? null,
	}));

	return transformedOptions.length > 0
		? transformedOptions
		: [{ id: uuidv4(), label: "", rank: null }];
}

export default transformedOptions;
