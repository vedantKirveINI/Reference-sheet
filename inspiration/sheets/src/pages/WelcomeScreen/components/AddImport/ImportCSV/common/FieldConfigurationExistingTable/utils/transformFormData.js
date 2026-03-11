const transformFormData = ({ formData = {}, fields = [] }) => {
	const { map_fields: mappedFields = [] } = formData;

	return mappedFields.map((fieldMap, new_index) => {
		const fieldValue = fieldMap?.field?.value;
		const headerLabel = fieldMap?.field?.label;
		const typeId = fieldMap?.type?.value;

		// Extract prev_index from the value like "2_Date"
		let prev_index = -1;
		if (typeof fieldValue === "string" && fieldValue.includes("_")) {
			const prefix = fieldValue.split("_")[0];
			const maybeIndex = parseInt(prefix, 10); // convert the prefix string to number
			if (!isNaN(maybeIndex)) {
				prev_index = maybeIndex;
			}
		}

		if (headerLabel && typeId) {
			const matchedField = fields.find((field) => field.id === typeId);

			if (matchedField) {
				return {
					dbFieldName: matchedField.dbFieldName,
					field_id: matchedField.id,
					name: "", // Keeping name blank
					type: matchedField.type,
					mappedCsvName: headerLabel,
					prev_index,
					new_index,
				};
			}
		}

		return {
			unMappedCsvName: headerLabel,
			prev_index,
			new_index,
		};
	});
};

export default transformFormData;
