import { CellRange, CellCoords } from "handsontable";
import isEmpty from "lodash/isEmpty";

import {
	COLUMN_WIDTH_MAPPING,
	getCustomMenuConfig,
	MULTIPLE_COLUMN_HIDDEN_ITEMS,
} from "../constants";
import styles from "../styles.module.scss";

const getRecordsWithoutIdAndViewId = (records = [], rowOrderKey) => {
	return (records || []).map((record) => {
		const {
			__id, //changed key from id to __id and others
			[rowOrderKey]: _row_viewId,
			__created_by,
			__last_updated_by,
			__last_modified_time,
			__version,
			__status,
			...rest
		} = record || {};

		return rest;
	});
};

const addEmptyField = ({ fields }) => {
	const rowHeader = {
		type: "CHECKBOX_ROWHEADER",
		name: "",
	};

	return [rowHeader, ...fields];
};

const createRange = (start, end) => {
	const range = [];
	for (let i = start; i <= end; i++) {
		range.push(i);
	}
	return range;
};

const getCustomMenuNameHTML = (
	key = "",
	isMultipleRowsSelected = false,
	isMultipleColumnsSelected = false,
) => {
	const {
		name = "",
		title = "",
		icon = "",
		alt = "",
		style = "",
		data_test_id = "",
	} = getCustomMenuConfig({
		key,
		isMultipleRowsSelected,
		isMultipleColumnsSelected,
	}) || {};

	return `<div class=${styles.custom_menu_item} title="${title}" data-testid="${data_test_id}">
               <img src=${icon} alt=${alt} style="${style}"/>
              ${name}
            </div>`;
};

const removeDeletedFieldsFromRecords = (
	records = [],
	deletedFieldsDbFieldName = {},
) => {
	return records?.map((record) => {
		Object.keys(record).forEach((key) => {
			if (deletedFieldsDbFieldName.hasOwnProperty(key)) {
				delete record[key];
			}
		});
		return record;
	});
};

const getColumnWidths = ({ fields = [], parsedColumnMeta = {} }) => {
	const columnWidths = fields.map((field) => {
		const meta = parsedColumnMeta?.[field?.id]; // Get column meta for the current field

		if (!isEmpty(meta) && meta?.width) {
			return meta.width; // Use the width from meta if it exists
		} else if (COLUMN_WIDTH_MAPPING[field?.type]) {
			const val = COLUMN_WIDTH_MAPPING[field?.type];

			return val;
		} else {
			return 150; // default column width
		}
	});

	return [...columnWidths, 95]; // 95 default column width for Add field button to avoid text overflow
};

const resizeColumnWidths = ({
	hotTableRef,
	fields = [],
	parsedColumnMeta = {},
}) => {
	const hotInstance = hotTableRef?.current?.hotInstance;
	const updatedColumnWidths = fields.map(
		(field) => parsedColumnMeta?.[field.id]?.width ?? 150, // Default width is 150 if not specified
	);

	if (hotInstance) {
		hotInstance.updateSettings({
			manualColumnResize: [...updatedColumnWidths, 95],
		});
	}
};

const parseColumnMeta = ({ columnMeta = "" }) => {
	try {
		const parsedColumnMeta = JSON.parse(columnMeta);
		return parsedColumnMeta;
	} catch (error) {
		return {};
	}
};

function uncheckAllCheckboxes(checkedRowsRef = {}) {
	checkedRowsRef.current?.checkedRowsMap?.forEach((_, key) => {
		document.querySelectorAll(`#checkbox_${key}`).forEach((checkbox) => {
			checkbox.checked = false;
			checkbox.style.display = "none";
		});

		document.querySelectorAll(`#rowNumber_${key}`).forEach((rowNumber) => {
			rowNumber.style.display = "block";
		});
	});

	document.querySelectorAll(`#corner-header-checkbox`).forEach((checkbox) => {
		checkbox.checked = false;
	});

	checkedRowsRef.current?.checkedRowsMap?.clear();
}

const getCellRanges = ({ checkedRows = [], columnIndex = 0 }) => {
	if (isEmpty(checkedRows)) return [];

	const ranges = [];
	let start = checkedRows[0]; // Start of the range

	for (let index = 1; index < checkedRows.length; index++) {
		if (checkedRows[index] !== checkedRows[index - 1] + 1) {
			// if discontinuity detected, push current range and start a new one
			ranges.push(
				new CellRange(
					new CellCoords(start, 0), // Highlighted cell
					new CellCoords(start, 0), // From (start cell)
					new CellCoords(checkedRows[index - 1], columnIndex), // To (end cell)
				),
			);
			start = checkedRows[index]; // New start
		}
	}

	// Ensure last range is added
	ranges.push(
		new CellRange(
			new CellCoords(start, 0),
			new CellCoords(start, 0),
			new CellCoords(checkedRows[checkedRows.length - 1], columnIndex),
		),
	);

	return ranges;
};

// Utility function to check if multiple columns are selected
const isMultipleColumnsSelected = (hotTableRef) => {
	const selectedColumns = hotTableRef?.current?.hotInstance?.getSelected();

	if (isEmpty(selectedColumns)) {
		return false;
	}

	// If there are multiple selection ranges, it's multiple columns (cmd/ctrl + select)
	if (selectedColumns.length > 1) {
		return true;
	}

	// Check if single selection range consists of multiple columns (shift + select)
	const selection = selectedColumns[0];
	if (selection && selection.length >= 4) {
		const [, startCol, , endCol] = selection;
		return startCol !== endCol;
	}

	return false;
};

// Utility function to check if a menu item should be hidden for multiple column selection
const shouldHideForMultipleColumns = (itemKey, hotTableRef) => {
	return (
		MULTIPLE_COLUMN_HIDDEN_ITEMS.includes(itemKey) &&
		isMultipleColumnsSelected(hotTableRef)
	);
};

function getUpdatedLoadingFields({ records = [], fields = [] }) {
	// Create mapping of dbFieldName to field id
	const fieldMapping = {};
	fields.forEach((field) => {
		const { dbFieldName, id: fieldId, type: fieldType } = field;
		if (fieldType === "FORMULA") {
			fieldMapping[dbFieldName] = fieldId;
		}
	});

	const updateLoadingFields = {};

	// Process each record - only check keys that exist in fieldMapping
	records.forEach((rowData) => {
		// Only iterate through formula field dbFieldNames, not all record keys
		Object.keys(fieldMapping).forEach((dbFieldName) => {
			if (rowData.hasOwnProperty(dbFieldName)) {
				const fieldId = fieldMapping[dbFieldName];
				updateLoadingFields[fieldId] = false;
			}
		});
	});

	return updateLoadingFields;
}

function getEnrichmentLoadingFields({ records = [], fields = [] }) {
	// Get all enrichment fields
	const enrichmentFields = fields.filter(
		(field) => field?.type === "ENRICHMENT",
	);

	const enrichmentLoadingFields = {};

	// Process each record
	records.forEach((rowData) => {
		// Check each enrichment field
		enrichmentFields.forEach((enrichmentField) => {
			const { id: enrichmentFieldId, options = {} } = enrichmentField;
			const { config = {}, autoUpdate } = options;
			const { identifier = [] } = config;

			// Check if autoUpdate is enabled and if any identifier fields have data
			if (autoUpdate && identifier.length > 0) {
				// Check if any of the identifier fields have data in this record
				const hasIdentifierData = identifier.some((identifierField) => {
					const identifierDbFieldName = identifierField.dbFieldName;
					return (
						rowData.hasOwnProperty(identifierDbFieldName) &&
						rowData[identifierDbFieldName] !== null &&
						rowData[identifierDbFieldName] !== undefined
					);
				});

				// If any identifier field has data, set this enrichment field to loading
				if (hasIdentifierData) {
					enrichmentLoadingFields[enrichmentFieldId] = true;
				}
			}
		});
	});

	return enrichmentLoadingFields;
}

function getTextMeasurementCanvas() {
	// Create a reusable canvas for text measurement
	let textMeasurementCanvas = null;

	if (!textMeasurementCanvas) {
		textMeasurementCanvas = document.createElement("canvas");
		textMeasurementCanvas.width = 1;
		textMeasurementCanvas.height = 1;
	}
	return textMeasurementCanvas;
}

function calculateColumnHeaderHeight(fieldName = "", columnWidth = 150) {
	const canvas = getTextMeasurementCanvas();
	const context = canvas.getContext("2d");

	context.font = "13px Inter"; // 0.8125rem = 13px
	context.letterSpacing = "0.1px"; // 0.00625rem ≈ 0.1px

	// Calculate available width
	const availableWidth = columnWidth - 63; // 20px icon + 20px dropdown icon + 16px padding + 6px marginLeft + 1px for border

	// Measure text and calculate lines
	const lines = measureTextWithLineBreaks({
		text: fieldName,
		maxWidth: availableWidth,
		context,
	});
	const numberOfLines = lines.length;

	// ENFORCE 3-LINE LIMIT to match CSS
	const maxLines = 3;
	const actualLines = Math.min(numberOfLines, maxLines);

	// Calculate height
	const lineHeight = 20;
	const padding = 10;
	const totalHeight = Math.ceil(actualLines * lineHeight + padding);

	return Math.max(32, totalHeight);
}

function normalizeBreakPoints(rawText) {
	if (!rawText) return "";
	return rawText
		.replace(/<wbr\s*\/?>/gi, "\u200B") // ZWSP = optional break, no glyph
		.replace(/&shy;/gi, "\u00AD") // soft hyphen marker
		.replace(/\s+/g, " ") // CSS: collapse spaces under white-space: normal
		.trim();
}

function measureTextWithLineBreaks({ text = "", maxWidth, context }) {
	const normalizedText = normalizeBreakPoints(text);
	const lines = [];
	let line = "";

	// Scan characters, track last legal break inside "line"
	const isBreakChar = (char) =>
		char === " " || char === "-" || char === "\u00AD" || char === "\u200B";

	for (let index = 0; index < normalizedText.length; index++) {
		const ch = normalizedText[index];

		// Soft hyphen & ZWSP are zero-width markers: keep in buffer for break lookup, don't affect width
		if (ch === "\u00AD" || ch === "\u200B") {
			line += ch;
			continue;
		}

		const test = line + ch;
		const textWidth = context.measureText(test).width; // keep as number

		if (textWidth > maxWidth && line) {
			// find last break opportunity in current "line"
			let breakIndex = -1;
			for (let j = line.length - 1; j >= 0; j--) {
				if (isBreakChar(line[j])) {
					breakIndex = j;
					break;
				}
			}

			if (breakIndex === -1) {
				// no break point -> push what we have, start new line with current char
				lines.push(line.trimEnd());
				line = ch;
			} else {
				let cut = line.slice(0, breakIndex);
				const breakPoint = line[breakIndex];

				// keep visible glyphs at the end of the broken line
				if (breakPoint === "-") {
					cut += "-";
				} // real hyphen stays
				if (breakPoint === "\u00AD") {
					cut += "-";
				} // soft hyphen becomes visible hyphen

				lines.push(cut.trimEnd());

				// start new line AFTER the break char (spaces/ZWSP/soft hyphen are not carried)
				line = line.slice(breakIndex + 1).trimStart();

				// reprocess current visible char on the new line
				if (index > 0) {
					index--;
				}
			}
		} else {
			line = test;
		}
	}

	if (line) lines.push(line.trimEnd());

	return lines;
}

// Add this function to get the maximum required height for all columns
function getMaxColumnHeaderHeight(fields, columnWidths) {
	if (!fields || !columnWidths) return 60; // Default fallback

	let maxHeight = 32; // Start with minimum height

	fields.forEach((field, index) => {
		const fieldName = field.name || "";
		const columnWidth = columnWidths[index] || 150; // Default width

		const requiredHeight = calculateColumnHeaderHeight(
			fieldName,
			columnWidth,
		);
		maxHeight = Math.max(maxHeight, requiredHeight);
	});

	return maxHeight;
}

export {
	getRecordsWithoutIdAndViewId,
	addEmptyField,
	createRange,
	getCustomMenuNameHTML,
	removeDeletedFieldsFromRecords,
	getColumnWidths,
	resizeColumnWidths,
	parseColumnMeta,
	uncheckAllCheckboxes,
	getCellRanges,
	isMultipleColumnsSelected,
	shouldHideForMultipleColumns,
	getUpdatedLoadingFields,
	getEnrichmentLoadingFields,
	getMaxColumnHeaderHeight,
};
