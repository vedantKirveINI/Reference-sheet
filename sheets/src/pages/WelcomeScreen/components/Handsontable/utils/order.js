function createRowOrder(context, event, records, rowOrderKey) {
	const rowIndex = context[0].start.row;
	let aboveRowIndex = 0;
	let belowRowIndex = 0;

	if (event === "row_above") {
		aboveRowIndex = rowIndex - 1;
		belowRowIndex = rowIndex;
	} else {
		aboveRowIndex = rowIndex;
		belowRowIndex = rowIndex + 1;
	}

	let aboveRowOrderId = records[aboveRowIndex]
		? records[aboveRowIndex][rowOrderKey]
		: undefined;

	let belowRowOrderId = records[belowRowIndex]
		? records[belowRowIndex][rowOrderKey]
		: undefined;

	let newRowOrderId = 0;

	if (!aboveRowOrderId && belowRowOrderId) {
		newRowOrderId = (0 + belowRowOrderId) / 2;
	} else if (aboveRowOrderId && !belowRowOrderId) {
		newRowOrderId = aboveRowOrderId + 1;
	} else {
		newRowOrderId = (aboveRowOrderId + belowRowOrderId) / 2;
	}

	return newRowOrderId;
}

function createFieldOrder(event = "", context = [], fields = []) {
	//handling the case for command bar
	const currentColumnIndex = context[0]?.start?.col || 0;

	let leftColumnIndex = 0;
	let rightColumnIndex = 0;

	if (event === "col_left") {
		leftColumnIndex = currentColumnIndex - 1;
		rightColumnIndex = currentColumnIndex;
	} else {
		leftColumnIndex = currentColumnIndex;
		rightColumnIndex = currentColumnIndex + 1;
	}

	let leftColumnOrderId = fields?.[leftColumnIndex]?.order || NaN;
	let rightColumnOrderId = fields?.[rightColumnIndex]?.order || NaN;

	let newColumnOrderId = 0;

	if (!leftColumnOrderId && rightColumnOrderId) {
		newColumnOrderId = (0 + rightColumnOrderId) / 2;
	} else if (leftColumnOrderId && !rightColumnOrderId) {
		newColumnOrderId = leftColumnOrderId + 1;
	} else {
		newColumnOrderId = (leftColumnOrderId + rightColumnOrderId) / 2;
	}

	return newColumnOrderId;
}

export { createRowOrder, createFieldOrder };
