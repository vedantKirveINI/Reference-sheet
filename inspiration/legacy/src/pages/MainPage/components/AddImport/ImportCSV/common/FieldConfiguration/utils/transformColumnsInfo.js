import { addIndexInfoToColumns } from "./addIndexInfoToColumns";

export function columnsInfoTransform({ data = {}, firstRowAsHeader = "Yes" }) {
	const fields = data?.fields || [];

	const columnsInfo = fields.map((field) => {
		if (firstRowAsHeader === "Yes") {
			return {
				name: field?.field_select?.label, // use label only
				value: field?.field_select?.value, // keep value for prev_index extraction
				type: field?.type?.value,
			};
		} else {
			return {
				name: field?.field_text,
				type: field?.type?.value,
			};
		}
	});

	if (firstRowAsHeader === "Yes") {
		return addIndexInfoToColumns(columnsInfo);
	}

	return columnsInfo;
}
