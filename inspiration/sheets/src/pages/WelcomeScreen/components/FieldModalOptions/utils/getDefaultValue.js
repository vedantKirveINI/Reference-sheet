function getDefaultCreatedTimeValue({ value = {} }) {
	const { defaultValue } = value?.options || {};

	return {
		dateFormat: "DDMMYYYY",
		description: value?.description || "",
		separator: "/",
		...value?.options,
		defaultValue,
	};
}

export default getDefaultCreatedTimeValue;
