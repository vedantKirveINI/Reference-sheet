const processEnrichmentData = ({ formData = {}, prevFieldsEnriched = [] }) => {
	const {
		entityType: selectedEntityType,
		autoUpdate = false,
		fieldDescription = "",
		...configurationValues
	} = formData;

	// Get the output fields from the selected enrichment type
	const {
		outputFields: selectedOutputFields = [],
		inputFields: selectedInputFields = [],
		key: entityKey,
	} = selectedEntityType || {};

	// Create a map of previous fields for easy lookup
	const prevFieldsMap = new Map();
	prevFieldsEnriched.forEach((field) => {
		prevFieldsMap.set(field.key, field);
	});

	// Process each output field
	const fieldsToEnrich = selectedOutputFields
		.map((outputField) => {
			const value = configurationValues[outputField.key];

			// If value is false, exclude this field
			if (value === false) {
				return null;
			}

			// If value is true, use previous data or create new entry
			if (value === true) {
				const prevField = prevFieldsMap.get(outputField.key);
				if (prevField) {
					return prevField; // Keep previous data
				} else {
					return {
						key: outputField.key,
						name: outputField.name,
						type: outputField.type,
						description: outputField.description,
						// field_id and dbFieldName will be assigned later
					};
				}
			}

			// If value is an object with field_id and dbFieldName, use it
			if (
				typeof value === "object" &&
				value?.field_id &&
				value?.dbFieldName
			) {
				return {
					key: outputField.key,
					name: outputField.name,
					type: outputField.type,
					description: outputField.description,
					field_id: value.field_id,
					dbFieldName: value.dbFieldName,
				};
			}

			// If value is undefined/null, keep previous data if it exists
			const prevField = prevFieldsMap.get(outputField.key);
			if (prevField) {
				return prevField;
			}

			return null;
		})
		.filter(Boolean); // Remove null values

	// Transform identifier to the required structure
	const transformedIdentifier = selectedInputFields.map((inputField) => {
		// Construct the identifier control name
		const identifierControlName = `identifier_${entityKey}_${inputField.key}`;

		// Get the selected field from formData
		const selectedField = configurationValues[identifierControlName];

		return {
			key: inputField.key, // Use the key from inputFields
			field_id: selectedField?.id, // Use the selected field's ID
			dbFieldName: selectedField?.dbFieldName, // Use the selected field's dbFieldName
			required: inputField?.required, // Use the selected field's required
		};
	});

	return {
		entityType: entityKey,
		identifier: transformedIdentifier,
		fieldsToEnrich: fieldsToEnrich,
		autoUpdate,
		description: fieldDescription,
	};
};

export default processEnrichmentData;
