// Function to convert non-array values to arrays
export const ensureArray = (value) => {
	if (Array.isArray(value)) {
		return value;
	}
	if (value === null || value === undefined) {
		return [];
	}
	// For objects, we might want to handle them differently
	if (typeof value === "object") {
		// For nested objects like company_size, we could flatten them or handle specially
		return [value];
	}
	// For primitive values, wrap in array
	return [value];
};

// Function to create form field mapping from icp data
export const createFormFields = (icpData) => {
	const formFields = [];

	Object.entries(icpData).forEach(([key, value]) => {
		// Convert key to a readable label
		const label = key
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		// Ensure value is an array
		const arrayValue = ensureArray(value);

		// Create form field object
		const formField = {
			key: key,
			label: label,
			value: arrayValue,
			type: "select", // For now, assuming all are select fields
			options: arrayValue, // The values become the select options
		};

		formFields.push(formField);
	});

	return formFields;
};
