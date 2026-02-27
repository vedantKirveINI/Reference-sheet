import { getRecordsWithoutIdAndViewId } from "./helper";
import { reloadHotTable } from "./reloadHotTable";

function searchByRowOrder(newOrderId, dataReceived, rowOrderKey) {
	const { records = [] } = dataReceived || {};
	let startIndex = 0;
	let endIndex = records?.length - 1;

	while (startIndex <= endIndex) {
		let middleIndex = Math.floor((startIndex + endIndex) / 2);

		if (records[middleIndex][rowOrderKey] === newOrderId) {
			return middleIndex;
		} else if (records[middleIndex][rowOrderKey] < newOrderId) {
			startIndex = middleIndex + 1;
		} else {
			endIndex = middleIndex - 1;
		}
	}

	return startIndex;
}

function searchByFieldOrder(newFieldOrder, dataReceived) {
	const fields = dataReceived?.fields;
	let startIndex = 0;
	let endIndex = fields?.length - 1;
	while (startIndex <= endIndex) {
		const middleIndex = Math.floor((startIndex + endIndex) / 2);

		const middleOrder = fields[middleIndex].order;

		if (middleOrder === newFieldOrder) {
			return middleIndex;
		} else if (middleOrder < newFieldOrder) {
			startIndex = middleIndex + 1;
		} else {
			endIndex = middleIndex - 1;
		}
	}
	return startIndex;
}

const getInsertedRecordIndex = (
	payload,
	setDataReceived,
	setTableData,
	dataReceived,
	rowOrderKey,
) => {
	const { record: newRecord } = payload || {};
	const newRowViewId = newRecord[rowOrderKey];

	// Calculate insert position based on current dataReceived
	const startIndex = searchByRowOrder(
		newRowViewId,
		dataReceived,
		rowOrderKey,
	);

	// Update dataReceived functionally to avoid overwrites
	setDataReceived((prev) => {
		const updatedRecords = [...prev.records];
		updatedRecords.splice(startIndex, 0, newRecord);

		// Update tableData in sync with the latest records
		setTableData(() => {
			const formattedRecords = getRecordsWithoutIdAndViewId(
				updatedRecords,
				rowOrderKey,
			);
			return [...formattedRecords, {}];
		});

		return { ...prev, records: updatedRecords };
	});

	return startIndex;
};

const insertMultipleRecords = ({
	newRecords = [],
	setDataReceived = () => {},
	setTableData = () => {},
	dataReceived = {},
	rowOrderKey = "",
}) => {
	const formattedRecords = getRecordsWithoutIdAndViewId(
		newRecords,
		rowOrderKey,
	);

	const updatedRecords = [...dataReceived?.records, ...newRecords];

	// Use setTableData to insert the new records at the second-to-last index
	setTableData((prevTableData) => {
		const insertIndex = prevTableData.length - 1;

		const updatedTableData = [
			...prevTableData.slice(0, insertIndex), // Keep all items up to the second-to-last index
			...formattedRecords, // Insert new records here
			...prevTableData.slice(insertIndex), // Append the last item after the new records
		];

		return updatedTableData;
	});

	setDataReceived((prev) => ({
		...prev,
		records: updatedRecords,
	}));
};

const insertFieldHelper = ({
	rowOrderKey = "",
	newField = {},
	dataReceived = {},
}) => {
	const newColumnOrder = newField?.order;
	const startIndex = searchByFieldOrder(newColumnOrder, dataReceived);

	const updatedFields = [...dataReceived.fields];
	const updatedRecords = [...dataReceived.records];

	updatedFields.splice(startIndex, 0, newField);

	updatedRecords.forEach((record, index) => {
		let newHash = { ...record };

		newHash.__id = record?.__id; // changed key from id to __id
		newHash[rowOrderKey] = record[rowOrderKey];

		updatedFields.forEach((field) => {
			const { dbFieldName } = field;
			if (!newHash.hasOwnProperty(dbFieldName)) {
				newHash[dbFieldName] = "";
			}
		});

		Object.keys(newHash).forEach((key) => {
			newHash[key] = record[key] !== undefined ? record[key] : null;
		});

		updatedRecords[index] = newHash;
	});

	return {
		updatedFields,
		updatedRecords,
		startIndex,
	};
};

const insertNewField = ({
	rowOrderKey = "",
	payload = {},
	dataReceived = {},
	setDataReceived,
	setTableData,
	hotTableRef,
}) => {
	const {
		updatedFields = [],
		updatedRecords = [],
		startIndex,
	} = insertFieldHelper({
		rowOrderKey,
		newField: payload,
		dataReceived,
	});

	const newRecords = getRecordsWithoutIdAndViewId(updatedRecords);
	setTableData(() => [...newRecords, {}]);

	const newColumns = (updatedFields || []).map((field) => ({
		data: field.dbFieldName,
	}));

	setDataReceived({
		...dataReceived,
		fields: updatedFields,
		records: updatedRecords,
	});

	reloadHotTable(hotTableRef, newRecords, newColumns);

	return startIndex;
};

const insertMultipleFields = ({
	rowOrderKey,
	fieldsArray,
	dataReceived,
	setDataReceived,
	setTableData,
	hotTableRef,
}) => {
	// Sort fields by order to ensure proper insertion order
	const sortedFields = [...fieldsArray].sort((a, b) => a.order - b.order);

	let currentDataReceived = { ...dataReceived };
	let lastInsertedIndex = 0;

	// Insert each field using the helper function
	sortedFields.forEach((newField) => {
		const {
			updatedFields = [],
			updatedRecords = [],
			startIndex,
		} = insertFieldHelper({
			rowOrderKey,
			newField,
			dataReceived: currentDataReceived,
		});

		currentDataReceived = {
			...currentDataReceived,
			fields: updatedFields,
			records: updatedRecords,
		};

		lastInsertedIndex = startIndex;
	});

	// Update the table data and reload only once after all fields are inserted
	const newRecords = getRecordsWithoutIdAndViewId(
		currentDataReceived.records,
	);
	setTableData(() => [...newRecords, {}]);

	const newColumns = (currentDataReceived.fields || []).map((field) => ({
		data: field.dbFieldName,
	}));

	setDataReceived({
		...dataReceived,
		fields: currentDataReceived.fields,
		records: currentDataReceived.records,
	});

	reloadHotTable(hotTableRef, newRecords, newColumns);

	return lastInsertedIndex;
};

function updateCellData({
	currentRowIndex,
	fieldName = "",
	cellData = "",
	dataReceived = {},
}) {
	const { records = [] } = dataReceived || {};
	const updatedRecords = [...records];

	updatedRecords[currentRowIndex][fieldName] = cellData;
	return updatedRecords;
}

export {
	insertNewField,
	getInsertedRecordIndex,
	searchByFieldOrder,
	searchByRowOrder,
	updateCellData,
	insertMultipleRecords,
	insertMultipleFields,
};
