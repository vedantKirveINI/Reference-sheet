import Handsontable from "handsontable";
import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";

import {
	CHEVRON_DOWN_ICON,
	PLUS_ICON,
	ROW_EXPAND_ICON,
} from "../../../../../constants/Icons/commonIcons";
import { getFieldLabel } from "../../../../../utils/stringHelpers";
import truncateName from "../../../../../utils/truncateName";
import {
	HIDDEN_CHIP_SELECTOR_MAPPING,
	LIMIT_CHIP_SELECTOR_MAPPING,
	MAXIMUM_COLUMN_WIDTH_ON_DOUBLE_CLICK,
	MINIMUM_COLUMN_WIDTH,
	PASTE_SUPPORTED_FIELD_TYPES,
} from "../constants";
import styles from "../styles.module.scss";

import {
	createRange,
	getCellRanges,
	getCustomMenuNameHTML,
	isMultipleColumnsSelected,
	shouldHideForMultipleColumns,
	uncheckAllCheckboxes,
} from "./helper";
import { createFieldOrder } from "./order";
import { getPermission } from "./permissionMeta";
import { hideTooltipPopover, showTooltipPopover } from "./toolTipHandler";

function getCellChangeData({
	context = [[]],
	fields = [],
	records = [],
	rowOrderKey = "",
}) {
	const updatesMap = {};

	(context || []).forEach(([rowIndex, columnName, oldData, newData]) => {
		// Skip if data hasn't changed
		if (newData === oldData || (!newData && !oldData)) {
			return;
		}

		// Find the relevant field
		const currentField = fields?.find(
			(field) => field?.dbFieldName === columnName,
		);
		if (!currentField) return;

		// Skip formula fields - don't store their changes
		if (currentField.type === "FORMULA") {
			return;
		}

		const { id: fieldId } = currentField || {};

		// Get the current record based on rowIndex
		const currentRecord = records?.[rowIndex];
		const { __id: rowId = NaN, [rowOrderKey]: currentRowOrder = NaN } =
			currentRecord || {};

		// Check if we already have this rowId in updatesMap or if rowIndex doesn't exist in records
		if (!updatesMap[rowId] && currentRecord) {
			// Initialize the object if rowId exists in records
			updatesMap[rowId] = {
				row_id: rowId || NaN,
				order: currentRowOrder || NaN,
				fields_info: [],
			};
		} else if (!currentRecord) {
			// Handle case when rowIndex is not present in records
			const tempRowId = `new_${rowIndex}`;
			if (!updatesMap[tempRowId]) {
				updatesMap[tempRowId] = {
					fields_info: [],
				};
			}
		}

		// Determine which rowId to use (either existing or temporary)
		const mapKey = currentRecord ? rowId : `new_${rowIndex}`;

		// Append field_id and data to the fields_info array
		updatesMap[mapKey].fields_info.push({
			field_id: fieldId,
			data: newData,
		});
	});

	return updatesMap;
}

const handleCellDataChange = ({
	context = [[]],
	records = [],
	fields = [],
	socket = {},
	tableId = "",
	baseId = "",
	viewId = "",
	rowOrderKey = "",
}) => {
	if (isEmpty(context)) {
		return;
	}

	// Use an object to group updates by rowId
	const updatesMap = getCellChangeData({
		context,
		records,
		fields,
		rowOrderKey,
	});

	const updates = Object.values(updatesMap);

	if (isEmpty(updates)) return;

	const payload = {
		tableId: tableId,
		baseId: baseId,
		viewId: viewId,
		column_values: updates,
	};

	socket.emit("row_update", payload);
};

const handleBeforeCellChange = (
	context = [[]],
	fields = [],
	records = [],
	socket = {},
	tableId = "",
	baseId = "",
	viewId = "",
	rowOrderKey = "",
) => {
	if (isEmpty(context)) {
		return;
	}

	const rowIndexes = [];

	// Use map to check each context and find the first unsupported field type
	const unsupportedField = context
		.map(([rowIndex, columnName]) => {
			rowIndexes.push(rowIndex);

			const currentField = fields?.find(
				(field) => field?.dbFieldName === columnName,
			);

			const { type: fieldType, name = "" } = currentField || {};

			// Return the unsupported fieldType if found
			if (!PASTE_SUPPORTED_FIELD_TYPES.includes(fieldType)) {
				return { name, fieldType };
			}

			return null;
		})
		.filter(Boolean)[0]; // Find the first non-null unsupported field type

	// If any unsupported field is found, show the alert and return false
	if (!isEmpty(unsupportedField)) {
		const { name = "", fieldType = "" } = unsupportedField || {};

		const label = getFieldLabel(fieldType);

		showAlert({
			type: "warning",
			message: `Paste is not supported for field: ${truncateName(name)} of type ${label || ""}`,
		});
		return false;
	}

	const updatesMap = getCellChangeData({
		context,
		records,
		fields,
		rowOrderKey,
	});

	const updates = Object.values(updatesMap);

	if (isEmpty(updates)) return; // if no updates then probably return that there's nothing to update

	const payload = {
		tableId: tableId,
		baseId: baseId,
		viewId: viewId,
		column_values: updates,
	};

	socket.emit("row_update", payload);

	return false;
};

const handleBeforePaste = (data = [[]], coords = [], hotTableRef) => {
	const countColumns = hotTableRef.current?.hotInstance?.countCols(); // Total number of rows in the table
	const lastColumnIndex = countColumns; // Last row index

	const startColumnIndex = coords?.[0]?.startCol || NaN; // Starting column index for the paste operation

	// Calculate pastable rows: how many rows are available for pasting from the starting row to the last row
	const pastableColumns = lastColumnIndex - startColumnIndex;

	if (data.length > 0 && data[0].length > pastableColumns) {
		const excessCols = data[0].length - pastableColumns;
		data.forEach((row) => {
			row.splice(-excessCols, excessCols); // Remove excess columns from each row
		});

		showAlert({
			type: "warning",
			message: `Add ${excessCols} more column(s) to paste the data`,
		});
		return false;
	}

	return true;
};

// first row -> 4 row -> shift(isShiftPressed) + click input  --->> onchange (isShiftPresent) (first, row)
function drawCheckboxInRowHeaders({
	row,
	TH,
	checkedRowsRef,
	tableData,
	isViewOnly,
}) {
	// Clear existing content in the row header
	Handsontable.dom.empty(TH);

	// Create a container for the row header content
	const container = document.createElement("div");
	container.style.display = "flex";
	container.style.alignItems = "center";
	container.style.justifyContent = "space-between";
	container.style.width = "100%";
	container.style.height = "100%";
	container.style.padding = "0 6px 0 20px";
	container.style.boxSizing = "border-box";

	const isChecked = checkedRowsRef.current.checkedRowsMap.has(row);

	// Create the row number element
	const rowNumber = document.createElement("span");
	rowNumber.id = `rowNumber_${row}`;
	rowNumber.innerText = row + 1;
	rowNumber.style.fontSize = "13px";
	rowNumber.style.display = isChecked ? "none" : "block";
	rowNumber.style.color = "#455A64";

	container.appendChild(rowNumber);

	if (!isViewOnly) {
		// Create the checkbox element
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = `checkbox_${row}`;
		checkbox.checked = isChecked;
		checkbox.style.margin = "0px";
		checkbox.style.display = isChecked ? "block" : "none";
		checkbox.style.accentColor = "#212121";

		const expandDiv = document.createElement("div");
		expandDiv.id = `expand_${row}`;
		expandDiv.setAttribute("data-type", "expand-icon");
		expandDiv.setAttribute("data-testid", `expand-row-button-${row}`);
		expandDiv.style.cursor = "pointer";

		const expandIcon = document.createElement("img");
		expandIcon.src = ROW_EXPAND_ICON;
		expandIcon.alt = "Expand";
		expandIcon.setAttribute("data-action", "expand-row"); // custom attribute
		expandIcon.style.width = "20px";
		expandIcon.style.height = "20px";
		expandIcon.style.display = "none"; // Hide by default

		expandDiv.appendChild(expandIcon);
		container.appendChild(checkbox);
		container.appendChild(expandDiv);
	}

	// Special handling for the last row (Add Row Icon)
	if (row === tableData.length - 1) {
		const plusIcon = document.createElement("img");
		plusIcon.src = PLUS_ICON;
		plusIcon.alt = "Add Row Icon";

		plusIcon.style.width = "20px";
		plusIcon.style.height = "20px";
		plusIcon.style.cursor = "pointer";
		plusIcon.style.marginLeft = "-4px";

		// Set attributes
		plusIcon.setAttribute("data-testid", "add-row-button");
		plusIcon.setAttribute("data-action", "add-row"); // custom attribute

		container.innerHTML = ""; // Clear existing content
		container.appendChild(plusIcon);
	}

	// Apply styles and append the container to the row header
	TH.className = `${styles.row_header}`;
	TH.appendChild(container);
}

function handleRowInsert({
	event,
	selection,
	records,
	rowOrderKey,
	tableId,
	baseId,
	viewId,
	socket,
}) {
	let rowId;
	let rowOrder;
	const rowIndex = selection[0].start.row;
	let is_above = event === "row_above";

	if (!isEmpty(records) && records[rowIndex]) {
		rowId = records[rowIndex]?.__id || ""; //changed key from id to __id
		rowOrder = records[rowIndex][rowOrderKey];
	}

	let payload = {
		tableId: tableId,
		baseId: baseId,
		viewId: viewId,
		fields_info: [],
	};

	if (!isEmpty(records)) {
		payload = {
			...payload,
			order_info: {
				is_above: is_above,
				__id: rowId, //changed key from id to __id
				order: rowOrder,
			},
		};
	}

	socket.emit("row_create", payload);
}

function onCellSelectionEnd(row, col, hotTableRef) {
	hotTableRef?.current?.hotInstance?.getActiveEditor().enableFullEditMode();

	hotTableRef?.current?.hotInstance
		?.getActiveEditor()
		.beginEditing(
			hotTableRef?.current?.hotInstance?.getDataAtCell(row, col),
		);
}

const dropdownMenuConfig = ({
	fields = [],
	setCreationModal = () => {},
	setIsDeleteFieldOpen = () => {},
	hotTableRef,
	isViewOnly,
	checkedRowsRef,
}) => {
	if (isViewOnly) return false;

	return [
		{
			key: "edit_field",
			name: getCustomMenuNameHTML("edit_field"),
			hidden() {
				return shouldHideForMultipleColumns("edit_field", hotTableRef);
			},
			callback: (key, context) => {
				const currentColumn = context?.[0]?.start?.col;
				const editingField = fields?.[currentColumn];

				setCreationModal({
					open: true,
					editField: editingField,
					colIndex: currentColumn,
				});
			},
		},
		{
			key: "col_left",
			name: getCustomMenuNameHTML("col_left"),
			hidden() {
				return shouldHideForMultipleColumns("col_left", hotTableRef);
			},
			callback: (key, context) => {
				const currentColumn = context?.[0]?.start?.col;
				const newFieldOrder = createFieldOrder(key, context, fields);

				if (isNaN(newFieldOrder)) {
					return showAlert({
						type: "error",
						message: "Could not create field",
					});
				}

				setCreationModal({
					open: true,
					newFieldOrder,
					colIndex: currentColumn,
				});
			},
		},
		{
			key: "col_right",
			name: getCustomMenuNameHTML("col_right"),
			hidden() {
				return shouldHideForMultipleColumns("col_right", hotTableRef);
			},
			callback: (key, context) => {
				const currentColumn = context?.[0]?.start?.col;
				const newFieldOrder = createFieldOrder(key, context, fields);

				if (isNaN(newFieldOrder)) {
					return showAlert({
						type: "error",
						message: "Could not create field",
					});
				}

				setCreationModal({
					open: true,
					newFieldOrder,
					colIndex: currentColumn,
				});
			},
		},
		{
			key: "remove_column",
			name: () => {
				const isMultiple = isMultipleColumnsSelected(hotTableRef);
				return getCustomMenuNameHTML(
					"remove_column",
					false,
					isMultiple,
				);
			},
			hidden() {
				return hotTableRef?.current?.hotInstance?.countCols() === 2; // countCols returns 2 since there is an extra artificial column for AddColumn button.
			},
			callback: (event, columnIndexes) => {
				handleDeleteColumn({
					event,
					fields,
					columnIndexes,
					setIsDeleteFieldOpen,
					checkedRowsRef,
				});
			},
		},
		{
			key: "clear_column",
			name: () => {
				const isMultiple = isMultipleColumnsSelected(hotTableRef);
				return getCustomMenuNameHTML("clear_column", false, isMultiple);
			},
			hidden() {
				// Check if any of the selected columns are formula fields
				const selectedColumns =
					hotTableRef?.current?.hotInstance?.getSelected();

				if (!selectedColumns || selectedColumns.length === 0) {
					return false;
				}

				// Check if any selected column is a formula field
				for (const selection of selectedColumns) {
					if (selection && selection.length >= 4) {
						const [, startCol, , endCol] = selection;

						// Check each column in the selection range
						for (let col = startCol; col <= endCol; col++) {
							if (
								["FORMULA", "CREATED_TIME"].includes(
									fields?.[col]?.type,
								)
							) {
								return true; // Hide clear column option if any formula field is selected
							}
						}
					}
				}

				return false;
			},
			callback: (event, columnIndexes) => {
				handleClearColumn({
					event,
					fields,
					columnIndexes,
					setIsDeleteFieldOpen,
					checkedRowsRef,
				});
			},
		},
	];
};

const handleDeleteRow = ({
	records = [],
	rowIndexes = [],
	checkedRowsRef = {},
	deleteRecordHandler = () => {},
	setIsDeleteFieldOpen = () => {},
}) => {
	const checkedRows = checkedRowsRef.current?.checkedRowsMap || new Map(); // new Map for null handling
	const permissionMeta = getPermission();
	const { record_dont_ask = false } = permissionMeta || {};

	let deleteIndex;

	// if checkedRows is empty (no selection made by ticking checkbox) use row indexes given by HOT
	if (checkedRows.size === 0 && rowIndexes.length > 1) {
		deleteIndex = rowIndexes.map((rowIndex) => {
			const { end } = rowIndex || {};
			return end?.row;
		});
	} else if (checkedRows.size === 0 && rowIndexes.length === 1) {
		const startIndex = rowIndexes[0]?.start?.row;
		const endIndex = rowIndexes[0]?.end?.row;

		deleteIndex = createRange(startIndex, endIndex);
	} else {
		deleteIndex = Array.from(checkedRows.keys()); // if checkedRows not empty, use its keys as indexes
	}

	const deleteRowIds = [];

	for (const index of deleteIndex) {
		const deletedRow = records[index];

		if (deletedRow?.__id) {
			deleteRowIds.push({
				__id: deletedRow.__id,
				__status: "inactive",
			});
		}
	}

	if (record_dont_ask) {
		deleteRecordHandler({ deleteRowIds });
		checkedRowsRef.current.checkedRowsMap.clear();
		return;
	}

	setIsDeleteFieldOpen({ deleteRowIds, checkedRowsRef });
};

const handleAfterRowMove = ({
	movedRows = [],
	dropIndex = 0,
	orderChanged = false,
	records = [],
	socket = {},
	viewId = "",
	baseId = "",
	tableId = "",
	rowOrderKey = "",
}) => {
	if (!orderChanged) return;

	let isAbove = true;
	let rowId;
	let rowOrder;

	const movedRecordsId = movedRows.map((index) => ({
		__id: records[index]?.__id, // changed key from id to __id
	}));

	if (records[dropIndex - 1]) {
		isAbove = false;
		rowId = records[dropIndex - 1]?.__id; // changed key from id to __id
		rowOrder = records[dropIndex - 1][rowOrderKey];
	} else {
		rowId = records[dropIndex]?.__id; // changed key from id to __id
		rowOrder = records[dropIndex][rowOrderKey];
	}

	const payload = {
		baseId,
		tableId,
		viewId,
		moved_rows: movedRecordsId,
		order_info: {
			is_above: isAbove,
			__id: rowId, // changed key from id to __id
			order: rowOrder,
		},
	};

	socket.emit("update_record_orders", payload);
};

const handleDeleteColumn = ({
	fields = [],
	columnIndexes = [],
	setIsDeleteFieldOpen = () => false,
	checkedRowsRef,
}) => {
	let deleteIndexes;
	const selectedColumnsMap =
		checkedRowsRef.current?.selectedColumnsMap || new Map();

	selectedColumnsMap.clear();

	if (columnIndexes.length > 1) {
		deleteIndexes = columnIndexes.map((columnIndex) => {
			const { end } = columnIndex || {};
			selectedColumnsMap.set(end?.col, true);

			return end?.col;
		});
	} else {
		const startIndex = columnIndexes[0]?.start?.col;
		const endIndex = columnIndexes[0]?.end?.col;

		deleteIndexes = createRange(startIndex, endIndex);
	}

	const deleteFieldIds = deleteIndexes.map((idx) => {
		const deleteField = fields[idx];

		return {
			id: deleteField?.id || "",
			status: "inactive",
		};
	});

	setIsDeleteFieldOpen({ deleteFieldIds, checkedRowsRef });
};

const handleClearColumn = ({
	fields = [],
	columnIndexes = [],
	setIsDeleteFieldOpen = () => false,
	checkedRowsRef,
}) => {
	let clearIndexes;
	const selectedColumnsMap =
		checkedRowsRef.current?.selectedColumnsMap || new Map();

	selectedColumnsMap.clear();

	if (columnIndexes.length > 1) {
		clearIndexes = columnIndexes.map((columnIndex) => {
			const { end } = columnIndex || {};
			selectedColumnsMap.set(end?.col, true);

			return end?.col;
		});
	} else {
		const startIndex = columnIndexes[0]?.start?.col;
		const endIndex = columnIndexes[0]?.end?.col;

		clearIndexes = createRange(startIndex, endIndex);
	}

	const clearFieldIds = clearIndexes.map((idx) => {
		const clearField = fields[idx];

		return {
			id: clearField?.id || "",
		};
	});

	setIsDeleteFieldOpen({ clearFieldIds, checkedRowsRef });
};

const contextMenuConfig = ({
	records,
	rowOrderKey,
	tableId,
	baseId,
	viewId,
	socket,
	checkedRowsRef,
	deleteRecordHandler,
	setIsDeleteFieldOpen,
	isViewOnly,
}) => {
	if (isViewOnly) return false;

	return {
		items: {
			row_above: {
				name: getCustomMenuNameHTML("row_above"),

				hidden() {
					return checkedRowsRef?.current?.checkedRowsMap?.size > 1;
				},

				callback: function (event, selection) {
					handleRowInsert({
						event,
						selection,
						records,
						rowOrderKey,
						tableId,
						baseId,
						viewId,
						socket,
					});
				},
			},

			row_below: {
				name: getCustomMenuNameHTML("row_below"),

				hidden() {
					return checkedRowsRef?.current?.checkedRowsMap?.size > 1;
				},

				callback: function (event, selection) {
					handleRowInsert({
						event,
						selection,
						records,
						rowOrderKey,
						tableId,
						baseId,
						viewId,
						socket,
					});
				},
			},

			remove_row: {
				name: () => {
					const isMultipleRowsSelected =
						checkedRowsRef?.current?.checkedRowsMap?.size > 1;

					return getCustomMenuNameHTML(
						"remove_row",
						isMultipleRowsSelected,
					);
				},

				callback: (name, rowIndexes) => {
					handleDeleteRow({
						records,
						rowIndexes,
						checkedRowsRef,
						deleteRecordHandler,
						setIsDeleteFieldOpen,
					});
				},
			},
		},
	};
};

const handleAfterColumnMove = ({
	movedColumns = [],
	dropIndex = 0,
	orderChanged = false,
	socket = {},
	tableId = "",
	baseId = "",
	viewId = "",
	fields = [],
}) => {
	if (!orderChanged) {
		return null;
	}

	const movedFields = movedColumns.map((index) => fields[index]);

	let previousNewOrder = null;

	movedFields.forEach((field, i) => {
		let newOrder;

		const newPosition = dropIndex ? dropIndex - 1 + i : 0;

		if (dropIndex > fields.length - 1) {
			// If moved to the last place
			const lastFieldOrder =
				previousNewOrder !== null
					? previousNewOrder
					: fields[fields.length - 1]?.order;
			newOrder = lastFieldOrder + 1;
		} else if (dropIndex === 0) {
			// If moved to the first place

			if (i === 0) {
				newOrder = fields[0]?.order / 2;
			} else {
				newOrder = (previousNewOrder + fields[0]?.order) / 2;
			}
		} else {
			const prevOrder =
				previousNewOrder !== null
					? previousNewOrder
					: fields[newPosition]?.order;

			const nextOrder = fields[dropIndex]?.order;

			newOrder = (prevOrder + nextOrder) / 2;
		}

		field.order = newOrder;
		previousNewOrder = newOrder;
	});

	const payload = {
		baseId: baseId,
		tableId: tableId,
		viewId: viewId,
		fields: movedFields.map((movedField, index) => ({
			order: movedField?.order,
			field_id: movedField?.id,
			previous_index: movedColumns[index],
			current_index: dropIndex - 1,
		})),
	};

	socket.emit("update_field_order", payload);
};

function customColumnHeader({
	col,
	TH,
	hotTableRef,
	fields,
	checkedRowsRef,
	columnHeaderRef,
	isViewOnly,
}) {
	TH.className = `${styles.header_colour}`;

	columnHeaderRef.current[col] = TH;

	// Check if this is the corner header
	if (col < 0 && !isEmpty(fields) && !isViewOnly) {
		// Clear existing content
		Handsontable.dom.empty(TH);
		const hotInstance = hotTableRef?.current?.hotInstance;

		const totalVisibleRows = hotInstance?.countRows();

		// Create the checkbox element
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = "corner-header-checkbox";
		checkbox.checked =
			checkedRowsRef.current.checkedRowsMap.size ===
				totalVisibleRows - 1 &&
			checkedRowsRef.current.checkedRowsMap.size > 1;

		checkbox.style.margin = "8px 0px 0px 20px";
		checkbox.style.accentColor = "#212121";
		TH.style.setProperty("text-align", "left", "important");
		TH.setAttribute("data-testid", "corner-header");
		TH.appendChild(checkbox);
	}

	// Handle column header UI and events
	if (col >= 0 && col < fields?.length) {
		const img = TH.querySelector("#field-type-icon");
		const changeTypeButton = TH.querySelector(".changeType");
		const columnHeaderText = TH.querySelector(".column_header_text");

		// Add tooltip for field type icon - shows field type
		if (img && fields?.[col]?.type) {
			img.removeEventListener("mouseover", showTooltipPopover);
			img.removeEventListener("mouseout", hideTooltipPopover);
			img.addEventListener("mouseover", (e) =>
				showTooltipPopover(e, fields?.[col]?.type, true),
			);
			img.addEventListener("mouseout", hideTooltipPopover);
		}

		// Add tooltip for column header text - shows field name and description
		if (columnHeaderText) {
			columnHeaderText.removeEventListener(
				"mouseover",
				showTooltipPopover,
			);
			columnHeaderText.removeEventListener(
				"mouseout",
				hideTooltipPopover,
			);
			columnHeaderText.addEventListener("mouseover", (e) =>
				showTooltipPopover(e, fields?.[col]?.type, true, {
					name: fields?.[col]?.name,
					description: fields?.[col]?.description,
				}),
			);
			columnHeaderText.addEventListener("mouseout", hideTooltipPopover);
		}

		if (changeTypeButton) {
			if (isViewOnly) {
				changeTypeButton.style.display = "none";
			} else {
				changeTypeButton.innerHTML = `<img src="${CHEVRON_DOWN_ICON}" alt="menu" />`;
				changeTypeButton.style.backgroundColor = "transparent";
				changeTypeButton.style.border = "none";
				changeTypeButton.style.display = "inherit";
			}
		}
	} else if (col && col === fields?.length) {
		const changeTypeButton = TH.querySelector(".changeType");
		const relative = TH.querySelector(".relative");
		const columnHeader = TH.querySelector(".column_header");

		if (changeTypeButton) {
			changeTypeButton.style.display = "none";
		}

		if (relative) {
			relative.style.cursor = "pointer";
		}
		if (columnHeader) {
			columnHeader.style.justifyContent = "center";
		}
	}
}

function updateRowCheckboxes({
	totalVisibleRows = 0,
	isChecked = false,
	checkedRowsRef = {},
}) {
	for (let index = 0; index <= totalVisibleRows - 1; index++) {
		const allRowCheckboxes = document.querySelectorAll(
			`#checkbox_${index}`,
		);

		const rowCheckbox = allRowCheckboxes[1];

		if (rowCheckbox) {
			rowCheckbox.checked = isChecked;
			rowCheckbox.style.display = isChecked ? "block" : "none";
		}

		document
			.querySelectorAll(`#rowNumber_${index}`)
			.forEach((rowNumber) => {
				rowNumber.style.display = isChecked ? "none" : "block";
			});

		if (isChecked) {
			checkedRowsRef.current.checkedRowsMap.set(index, true);
		} else {
			checkedRowsRef.current.checkedRowsMap.delete(index);
		}
	}
}

function handleShiftClickSelection({
	rowIndex = 0,
	checkedRows = [],
	checkedRowsRef = {},
}) {
	const lastCheckedRow = checkedRows.pop();
	const minRow = Math.min(lastCheckedRow, rowIndex);
	const maxRow = Math.max(lastCheckedRow, rowIndex);

	for (let index = minRow; index <= maxRow; index++) {
		checkedRowsRef.current.checkedRowsMap.set(index, true);

		if (index === rowIndex) {
			const checkboxOfLatestRow = document.querySelectorAll(
				`#checkbox_${rowIndex}`,
			);

			document
				.querySelectorAll(`#rowNumber_${rowIndex}`)
				.forEach((rowNumber) => {
					rowNumber.style.display = "none";
				});

			checkboxOfLatestRow.forEach((checkedRow) => {
				checkedRow.checked = false;
				checkedRow.style.display = "block";
			});
			continue;
		}

		// Pick second checkbox in each row
		const allCheckboxes = document.querySelectorAll(`#checkbox_${index}`);

		document
			.querySelectorAll(`#rowNumber_${index}`)
			.forEach((rowNumber) => {
				rowNumber.style.display = "none";
			});

		allCheckboxes.forEach((checkedRow) => {
			checkedRow.checked = true;
			checkedRow.style.display = "block";
		});
	}
}

function updateSelectedCells({ hotInstance = {}, checkedRowsRef = {} }) {
	const checkedRows = Array.from(
		checkedRowsRef?.current?.checkedRowsMap?.keys(),
	);
	const selectionRanges = getCellRanges({
		checkedRows,
		columnIndex: hotInstance.countCols() - 2, // Last visible column
	});

	if (!isEmpty(selectionRanges)) {
		hotInstance.selectCells(selectionRanges, false);
	}
}

function handleBeforeOnCellMouseDown({
	event,
	coords,
	hotTableRef,
	fields,
	setCreationModal,
	checkedRowsRef,
	setExpandedRow,
	isViewOnly,
}) {
	const { row, col } = coords || {};
	const hotInstance = hotTableRef?.current?.hotInstance;
	const dropdownMenuPlugin = hotInstance.getPlugin("dropdownMenu");
	const contextMenuPlugin = hotInstance.getPlugin("contextMenu");

	if (isViewOnly) {
		event.preventDefault();
		event.stopPropagation();
		return;
	}

	if (
		event.target.dataset.type === "expand-icon" ||
		event.target.dataset.action === "expand-row"
	) {
		setExpandedRow({ open: true, rowIndex: row, colIndex: col });
		event.preventDefault();
		event.stopPropagation();
		return;
	}

	// Checkbox logic on corner header click
	if (row === -1 && col === -1) {
		// if not left click then stop propagation
		if (event.button !== 0 || event.which !== 1) {
			event.stopImmediatePropagation();
		} else if (event.button === 0 || event.which === 1) {
			event.preventDefault();
			const cornerHeader = document.querySelectorAll(
				'[data-testid="corner-header"]',
			);
			const totalVisibleRows = hotInstance.countRows() - 1;

			// Determine the checkbox state
			let isChecked = !cornerHeader[1]?.querySelector(
				'input[type="checkbox"]',
			).checked;

			// Handle checkbox click behavior separately
			if (event.target.type === "checkbox") {
				// If clicked on the checkbox directly, use its current state
				isChecked = !event.target.checked;
			} else {
				// If clicked outside the checkbox, manually toggle
				cornerHeader.forEach((header) => {
					const checkbox = header.querySelector(
						'input[type="checkbox"]',
					);
					if (checkbox) {
						checkbox.checked = isChecked;
					}
				});
			}

			updateRowCheckboxes({
				totalVisibleRows,
				isChecked,
				checkedRowsRef,
			});

			// Clear selections when unchecked
			if (!isChecked) {
				checkedRowsRef.current.checkedRowsMap.clear();
				hotInstance.deselectCell();
				event.stopImmediatePropagation();
				contextMenuPlugin.close();
			}
		}

		return;
	}

	// Handle row header checkbox left click
	if (
		col === -1 &&
		event.target.type === "checkbox" &&
		(event.button === 0 || event.which === 1)
	) {
		event.preventDefault();

		const cornerHeader = document.querySelectorAll(
			'[data-testid="corner-header"]',
		);

		cornerHeader.forEach((header) => {
			const checkbox = header.querySelector('input[type="checkbox"]');

			if (checkbox && checkbox.checked) {
				checkbox.checked = false;
			}
		});

		let checkedRows = Array.from(
			checkedRowsRef.current.checkedRowsMap.keys(),
		);

		const isCurrentlyChecked =
			checkedRowsRef.current.checkedRowsMap.has(row);
		const newCheckedState = !isCurrentlyChecked;

		// Shift-click selection logic
		if (event.shiftKey && checkedRows.length > 0) {
			handleShiftClickSelection({
				rowIndex: row,
				checkedRows,
				checkedRowsRef,
			});
		} else {
			// Toggle current row
			if (newCheckedState) {
				checkedRowsRef.current.checkedRowsMap.set(row, true);
			} else {
				checkedRowsRef.current.checkedRowsMap.delete(row);
			}
		}

		updateSelectedCells({ hotInstance, checkedRowsRef });
		contextMenuPlugin.close();
		event.stopImmediatePropagation();
		return;
	}

	// Uncheck all checked rows if left-click on a cell or if the row is not in checkedRowsMap
	if (
		(col !== -1 &&
			event.target.type !== "checkbox" &&
			event.button === 0) ||
		(checkedRowsRef.current?.checkedRowsMap?.size &&
			!checkedRowsRef.current?.checkedRowsMap?.has(row))
	) {
		uncheckAllCheckboxes(checkedRowsRef);
	}

	// uncheck all checked rows and deselect all cells if "+ Add" is clicked
	if (col === hotInstance.countCols() - 1) {
		event.stopImmediatePropagation();
		uncheckAllCheckboxes(checkedRowsRef);
		hotInstance.deselectCell();
		dropdownMenuPlugin.close();
		contextMenuPlugin.close();

		// Handle left-click on last column header to open field creation modal
		if (row === -1 && event.button === 0) {
			const context = [{ start: { col: col - 1 } }];
			const newFieldOrder = createFieldOrder(
				"col_right",
				context,
				fields,
			);

			setCreationModal({
				open: true,
				newFieldOrder,
				colIndex: col,
				fieldType: fields[col]?.type,
			});
		}
	}
}

function handleBeforeSetRangeEnd({ hotTableRef, coords = {} }) {
	const hotInstance = hotTableRef?.current?.hotInstance;
	if (!hotInstance) return;

	const totalVisibleCols = hotInstance.countCols();
	const totalVisibleRows = hotInstance.countRows();

	const [startRow, startCol, endRow, endCol] = hotInstance.getSelectedLast();

	// Only deselect when a row header is clicked and the last column is selected
	const isTopCornerClick =
		startCol === -1 && endCol === -1 && startRow === -1 && endRow === -1;

	const isColumnHeaderClick = startRow === -1;
	const isRowHeaderClick = startCol === -1;

	// Handle column header clicks
	if (
		(isTopCornerClick || isColumnHeaderClick) &&
		coords?.row > totalVisibleRows - 2
	) {
		coords.row = totalVisibleRows - 2;
	}

	// Handle row header clicks
	if (
		(isTopCornerClick || isRowHeaderClick) &&
		coords?.col > totalVisibleCols - 2
	) {
		coords.col = totalVisibleCols - 2;
	}

	// Ensure selection doesn't go beyond second-last column for regular cell selection
	if (coords?.col > totalVisibleCols - 2) {
		coords.col = totalVisibleCols - 2;
	}

	// Ensure selection doesn't go beyond second-last row for regular cell selection
	if (coords?.row > totalVisibleRows - 2) {
		coords.row = totalVisibleRows - 2;
	}
}

// here TD belongs to row header
function highlightRowHeaderOnHover({ TD = {}, row = 0 }) {
	const rowElement = document.querySelector(`[aria-rowindex="${row + 2}"]`);
	const checkbox = TD.querySelector("input[type='checkbox']");
	const rowNum = TD.querySelector("span");
	const expandIcon = TD.querySelector('[data-action="expand-row"]');

	if (TD && rowElement) {
		if (checkbox && rowNum && !checkbox.checked) {
			checkbox.style.display = "block"; // Show the checkbox on hover if not checked
			rowNum.style.display = "none"; // hide the number
		}

		if (expandIcon) {
			expandIcon.style.display = "block"; // Show the chevron icon on hover
		}

		TD.style.setProperty("background-color", "#eceff1", "important");
		rowElement.style.backgroundColor = "#eceff1";
	}
}

// here TD belongs to table data cell
function highlightRowOnHover({ TD = {}, row = 0 }) {
	const cellTrElement = TD.parentElement;
	const rowElements = document.querySelectorAll(
		`[aria-rowindex="${row + 2}"]`,
	);

	if (!isEmpty(rowElements) && cellTrElement) {
		rowElements.forEach((rowElement) => {
			const thElement = rowElement.querySelector("th");
			const checkboxElement = rowElement.querySelector(
				`#checkbox_${row}`,
			);
			const rowNumber = rowElement.querySelector(`#rowNumber_${row}`);
			const expandIcon = rowElement.querySelector(
				'[data-action="expand-row"]',
			);

			if (checkboxElement && !checkboxElement.checked && rowNumber) {
				// Show checkbox and hide row number
				checkboxElement.style.display = "block";
				rowNumber.style.display = "none";
			}

			if (expandIcon) {
				expandIcon.style.display = "block"; // Show the chevron icon on hover
			}

			if (thElement) {
				thElement.style.setProperty(
					"background-color",
					"#eceff1",
					"important",
				);
			}
		});

		// Apply background color to the td cell row container
		cellTrElement.style.backgroundColor = "#eceff1";
	}
}

function handleAfterOnCellMouseOver({
	coords = {},
	TD = {},
	hotTableRef = {},
}) {
	const { row, col } = coords || {};

	// Change background color of the row header and corresponding row when hovering over row header
	if (col === -1 && row > -1) {
		highlightRowHeaderOnHover({ TD, row });
	}
	// Change background color of row annd its row header when hovering over table data cell
	else if (
		col !== hotTableRef.current.hotInstance.countCols() - 1 &&
		row > -1
	) {
		highlightRowOnHover({ TD, row });
	}
}

function handleAfterOnCellMouseOut({ coords = {}, TD = {}, hotTableRef = {} }) {
	const { row, col } = coords || {};

	if (col === -1 && row > -1) {
		const parentRow = TD.parentElement;
		TD.style.setProperty("background-color", "#ffffff", "important");
		const checkbox = TD.querySelector("input[type='checkbox']");
		const rowNum = TD.querySelector("span");
		const expandIcon = TD.querySelector('[data-action="expand-row"]');

		if (checkbox && rowNum) {
			if (!checkbox.checked) {
				checkbox.style.display = "none"; // Hide the checkbox when mouse leaves
				rowNum.style.display = "block";
				parentRow.style.backgroundColor = "#ffffff";
			}
		}

		if (expandIcon) {
			expandIcon.style.display = "none"; // Hide the chevron icon when mouse leaves
		}
	}

	if (col !== hotTableRef.current.hotInstance.countCols() - 1 && row > -1) {
		const rowElements = document.querySelectorAll(
			`[aria-rowindex="${row + 2}"]`,
		);

		if (!isEmpty(rowElements)) {
			rowElements.forEach((rowElement) => {
				const thElement = rowElement.querySelector("th");
				const checkboxElement = rowElement.querySelector(
					`#checkbox_${row}`,
				);
				const rowNumber = rowElement.querySelector(`#rowNumber_${row}`);
				const expandIcon = rowElement.querySelector(
					'[data-action="expand-row"]',
				);
				rowElement.style.backgroundColor = "#ffffff";

				if (thElement) {
					thElement.style.setProperty(
						"background-color",
						"#ffffff",
						"important",
					);
				}

				// Hide checkbox and show row number if unchecked
				if (checkboxElement && rowNumber && !checkboxElement.checked) {
					checkboxElement.style.display = "none";
					rowNumber.style.display = "block";
				}

				// Hide expand icon when mouse leaves
				if (expandIcon) {
					expandIcon.style.display = "none";
				}
			});
		}
	}
}

function handleAfterColumnResize({
	newSize = 0,
	columnIndex = -1,
	fields = [],
	hotTableRef,
	parsedColumnMeta = {},
	socket = {},
	setView = () => {},
	viewId = "",
	baseId = "",
	tableId = "",
	renderHot = () => {},
	isDoubleClick = false,
}) {
	let newColumnWidth = Math.max(newSize, MINIMUM_COLUMN_WIDTH);

	if (
		isDoubleClick &&
		["SHORT_TEXT", "LONG_TEXT", "ADDRESS", "EMAIL"].includes(
			fields?.[columnIndex]?.type,
		)
	) {
		newColumnWidth = Math.min(
			newSize,
			MAXIMUM_COLUMN_WIDTH_ON_DOUBLE_CLICK,
		);
	}

	const fieldId = fields?.[columnIndex]?.id;

	const hotInstance = hotTableRef.current?.hotInstance;

	if (fieldId && hotInstance) {
		const payload = {
			columnMeta: [
				{
					id: fieldId, // fieldID
					width: newColumnWidth, // columnWidth
				},
			],
			viewId: viewId,
			baseId: baseId,
			tableId: tableId,
		};

		parsedColumnMeta[fieldId].width = newColumnWidth;

		socket.emit("update_column_meta", payload);

		setView((prev) => ({
			...prev,
			columnMeta: JSON.stringify(parsedColumnMeta),
		}));

		// Force column width reset if it was below minimum width (120)
		hotInstance
			.getPlugin("manualColumnResize")
			.setManualSize(columnIndex, newColumnWidth);
	}

	renderHot();
}

function handleColumnDoubleClick({ columnIndex = -1, fields = [] }) {
	if (!fields?.[columnIndex]?.type) return;

	const fieldType = fields[columnIndex].type;

	const containers = document.querySelectorAll(
		`[data-column-index="${columnIndex}"]`,
	);

	if (isEmpty(containers)) return;

	const chipSelector = HIDDEN_CHIP_SELECTOR_MAPPING[fieldType];
	const limitChipSelector = LIMIT_CHIP_SELECTOR_MAPPING[fieldType];

	containers.forEach((container) => {
		// Reveal hidden chips
		if (chipSelector) {
			const hiddenChips = container.querySelectorAll(chipSelector);

			hiddenChips.forEach((chip) => {
				if (chip.style.visibility === "hidden") {
					chip.style.visibility = "visible";
				}
			});
		}

		// Hide the overflow (+N) chip
		if (limitChipSelector) {
			const limitChips = container.querySelectorAll(limitChipSelector);

			limitChips.forEach((chip) => {
				chip.style.display = "none";
			});
		}
	});
}

function handleBeforeOnCellContextMenu({ event, coords, TD, hotTableRef }) {
	// dont open the cell context menu on column header click
	const hotInstance = hotTableRef.current?.hotInstance;

	const columnCount = hotInstance?.countCols() - 1;

	const { row: rowIndex, col: colIndex } = coords || {};
	const isTopCornerClick = rowIndex === -1 && colIndex === -1;

	// Only open dropdown menu for header and block default context menu
	if (rowIndex === -1) {
		event.preventDefault();
		event.stopImmediatePropagation();

		// Open your custom dropdown on right click
		const dropdownMenuPlugin = hotInstance?.getPlugin("dropdownMenu");

		if (
			dropdownMenuPlugin &&
			TD &&
			!isTopCornerClick &&
			colIndex < columnCount
		) {
			const rect = TD.getBoundingClientRect();
			const position = {
				top: rect.bottom + window.scrollY,
				left: rect.left + window.scrollX,
			};

			dropdownMenuPlugin.open(position);
		}
	}

	// Optionally disable bottom row / last column menus too
	if (
		coords?.row === hotInstance?.countRows() - 1 ||
		coords?.col === hotInstance?.countCols() - 1
	) {
		event.stopImmediatePropagation();
	}
}

function handleAfterOnCellMouseUp({ event, coords = {}, TD, hotTableRef }) {
	const { row: rowIndex, col: colIndex } = coords || {};
	const isTopCornerClick = rowIndex === -1 && colIndex === -1;

	if (rowIndex !== -1 || isTopCornerClick) return; // Only act on header clicks

	const changeTypeButton = TD.querySelector(".changeType");
	if (!changeTypeButton || !changeTypeButton.contains(event.target)) return;

	const hotInstance = hotTableRef.current?.hotInstance;
	const dropdownMenuPlugin = hotInstance?.getPlugin("dropdownMenu");
	const rect = changeTypeButton.getBoundingClientRect();
	const position = {
		top: rect.bottom + window.scrollY,
		left: rect.left + window.scrollX,
	};

	dropdownMenuPlugin.open(position);
}

function handleBeforeKeyDown({ event, hotTableRef }) {
	const hotInstance = hotTableRef?.current?.hotInstance;
	if (!hotInstance) return;

	const totalVisibleCols = hotInstance.countCols();
	const totalVisibleRows = hotInstance.countRows();
	const [startRow, startCol] = hotInstance.getSelectedLast();

	// Handle Ctrl/Cmd + Right Arrow to select second-to-last column
	if (
		event.key === "ArrowRight" &&
		!event.shiftKey &&
		(event.ctrlKey || event.metaKey)
	) {
		hotInstance.selectCell(
			hotInstance.getSelectedLast()[0],
			totalVisibleCols - 2,
		);
		return false;
	}

	// Handle Ctrl/Cmd + Down Arrow to select second-to-last row
	if (
		event.key === "ArrowDown" &&
		!event.shiftKey &&
		(event.ctrlKey || event.metaKey)
	) {
		hotInstance.selectCell(
			totalVisibleRows - 2,
			hotInstance.getSelectedLast()[1],
		);
		return false;
	}

	// Handle up arrow at top of table, but allow Shift + Arrow Up and Cmd/Ctrl + Shift + Arrow Up
	if (event.key === "ArrowUp" && startRow === 0 && !event.shiftKey) {
		return false;
	}

	// Handle down arrow at second-to-last row
	if (event.key === "ArrowDown" && startRow >= totalVisibleRows - 2) {
		return false;
	}

	// Check if user is trying to navigate to the Add field column
	if (startCol >= totalVisibleCols - 2) {
		// Prevent navigation to last column for arrow keys, but allow Shift + Right Arrow and Cmd/Ctrl + Shift + Right Arrow
		if (event.key === "ArrowRight" && !event.shiftKey) {
			return false;
		}

		// Prevent navigation to Add field column for Tab key
		if (event.key === "Tab" && !event.shiftKey) {
			event.preventDefault();
			return false;
		}
	}
}

export {
	contextMenuConfig,
	drawCheckboxInRowHeaders,
	dropdownMenuConfig,
	handleAfterColumnMove,
	handleAfterRowMove,
	handleCellDataChange,
	handleRowInsert,
	onCellSelectionEnd,
	handleBeforeCellChange,
	handleBeforePaste,
	customColumnHeader,
	handleBeforeOnCellMouseDown,
	handleBeforeSetRangeEnd,
	handleAfterOnCellMouseOver,
	handleAfterOnCellMouseOut,
	handleAfterColumnResize,
	handleColumnDoubleClick,
	handleBeforeOnCellContextMenu,
	handleAfterOnCellMouseUp,
	handleBeforeKeyDown,
};
