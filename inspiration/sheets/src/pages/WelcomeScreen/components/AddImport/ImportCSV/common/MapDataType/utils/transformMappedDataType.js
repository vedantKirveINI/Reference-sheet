// encode decode string in case of period(.) or apostrophe(')
const encodeKey = (key) =>
	key
		.replace(/\./g, "__dot__")
		.replace(/'/g, "__apostrophe__")
		.replace(/"/g, "__quote__")
		.replace(/\[/g, "__openSquareBracket__")
		.replace(/\]/g, "__closeSquareBracket__")
		.replace(/\|/g, "__pipe__");

const decodeKey = (key) =>
	key
		.replace(/__dot__/g, ".")
		.replace(/__apostrophe__/g, "'")
		.replace(/__quote__/g, '"')
		.replace(/__openSquareBracket__/g, "[")
		.replace(/__closeSquareBracket__/g, "]")
		.replace(/__pipe__/g, "|");

function transformMappedData({
	columnsInfo = [],
	data = {},
	firstRowAsHeader = "No",
}) {
	const { map_type_fields = [] } = data;

	const mappedField = map_type_fields.map(({ field, type }) => ({
		name: field,
		type: type?.value,
	}));

	mappedField.forEach(({ name, type }, newIndex) => {
		// Match against mappedCsvName, name, or unMappedCsvName
		const existingIndex = columnsInfo.findIndex(
			(col) => col?.unMappedCsvName === name,
		);

		if (existingIndex !== -1) {
			const existingCol = columnsInfo[existingIndex];

			const prev =
				existingCol?.prev_index ??
				extractPrefixIndex(
					existingCol?.mappedCsvName ||
						existingCol?.unMappedCsvName ||
						"",
				);

			columnsInfo[existingIndex] = {
				...existingCol,
				name,
				type,
				prev_index: prev,
				new_index: newIndex,
			};
		} else {
			// If not found, it's a new addition
			columnsInfo.push({
				name,
				type,
				prev_index: extractPrefixIndex(name),
				new_index: columnsInfo.length,
			});
		}
	});

	if (firstRowAsHeader === "No") {
		columnsInfo.forEach((field) => {
			if (field?.name) {
				field.name = undefined;
			}
		});
	}

	return columnsInfo;
}

function extractPrefixIndex(str) {
	if (typeof str !== "string") return -1;
	const prefix = str.split("_")[0];
	const num = parseInt(prefix, 10);
	return isNaN(num) ? -1 : num;
}

export { transformMappedData, decodeKey, encodeKey };
