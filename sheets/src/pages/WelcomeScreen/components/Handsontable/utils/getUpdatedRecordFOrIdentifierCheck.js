// Create a merged record with updated data for identifier checking
export const getUpdatedRecordForIdentifierCheck = ({
	currentRecord,
	fieldsInfo,
	fields,
}) => {
	const updatedRecord = { ...currentRecord };

	// Merge the updated field data
	fieldsInfo.forEach((fieldInfo) => {
		const { field_id: fieldId, data } = fieldInfo;
		const field = fields.find((f) => f.id === fieldId);
		if (field?.dbFieldName) {
			updatedRecord[field.dbFieldName] = data;
		}
	});

	return updatedRecord;
};
