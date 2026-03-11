import type { IColumn, IRecord, IRowHeader } from "@/types";

/**
 * Binary search to find insert index based on order value
 * Backend returns order in _row_view{viewId} field
 * We use rowHeaders[].displayIndex which stores this order value
 *
 * Reference: sheets/src/pages/WelcomeScreen/components/Handsontable/utils/updateTableData.js
 */
export const searchByRowOrder = (
	newOrderValue: number,
	records: IRecord[],
	rowHeaders: IRowHeader[],
): number => {
	let startIndex = 0;
	let endIndex = records.length - 1;

	while (startIndex <= endIndex) {
		const middleIndex = Math.floor((startIndex + endIndex) / 2);
		const middleHeader = rowHeaders[middleIndex];
		const middleOrder =
			middleHeader?.orderValue ??
			middleHeader?.displayIndex ??
			middleIndex + 1;

		if (middleOrder === newOrderValue) {
			return middleIndex;
		} else if (middleOrder < newOrderValue) {
			startIndex = middleIndex + 1;
		} else {
			endIndex = middleIndex - 1;
		}
	}

	return startIndex;
};

type ColumnInsertPosition = "append" | "left" | "right";

const getColumnOrderAtIndex = (
	columns: IColumn[],
	index: number,
): number | undefined => {
	if (index < 0 || index >= columns.length) {
		return undefined;
	}

	const order = columns[index]?.order;
	if (typeof order === "number") {
		return order;
	}

	// Fallback to positional order if backend order is missing
	return index + 1;
};

const getFallbackOrder = (index: number): number => {
	return index >= 0 ? index + 1 : 0;
};

const calculateOrderBetween = (
	leftOrder: number | undefined,
	rightOrder: number | undefined,
	leftIndex: number,
	rightIndex: number,
): number => {
	if (leftOrder === undefined && rightOrder === undefined) {
		// No neighbors have order information – fallback to positional indices
		const leftFallback = getFallbackOrder(leftIndex);
		const rightFallback =
			rightIndex >= 0 ? getFallbackOrder(rightIndex) : leftFallback + 1;
		return (leftFallback + rightFallback) / 2;
	}

	if (leftOrder === undefined) {
		// Insert before the first column
		return (rightOrder ?? getFallbackOrder(rightIndex)) / 2;
	}

	if (rightOrder === undefined) {
		// Insert after the last column
		return leftOrder + 1;
	}

	return (leftOrder + rightOrder) / 2;
};

const getColumnOrderValue = (
	column: IColumn | undefined,
	index: number,
): number => {
	if (!column) {
		return index + 1;
	}
	if (typeof column.order === "number") {
		return column.order;
	}
	return index + 1;
};

export const findColumnInsertIndex = (
	columns: IColumn[],
	newOrder: number | undefined,
): number => {
	if (typeof newOrder !== "number") {
		return columns.length;
	}

	let start = 0;
	let end = columns.length;

	while (start < end) {
		const middle = Math.floor((start + end) / 2);
		const middleOrder = getColumnOrderValue(columns[middle], middle);

		if (middleOrder < newOrder) {
			start = middle + 1;
		} else {
			end = middle;
		}
	}

	return start;
};

export const calculateFieldOrder = ({
	columns,
	targetIndex,
	position,
}: {
	columns: IColumn[];
	targetIndex?: number;
	position: ColumnInsertPosition;
}): number => {
	if (!columns.length) {
		return 1;
	}

	if (position === "append") {
		const lastColumn = columns[columns.length - 1];
		const lastOrder =
			typeof lastColumn?.order === "number"
				? lastColumn.order
				: columns.length;
		return lastOrder + 1;
	}

	const safeIndex =
		typeof targetIndex === "number"
			? Math.min(Math.max(targetIndex, 0), columns.length - 1)
			: 0;

	if (position === "left") {
		const leftIndex = safeIndex - 1;
		const rightIndex = safeIndex;
		const leftOrder = getColumnOrderAtIndex(columns, leftIndex);
		const rightOrder = getColumnOrderAtIndex(columns, rightIndex);
		return calculateOrderBetween(
			leftOrder,
			rightOrder,
			leftIndex,
			rightIndex,
		);
	}

	// position === "right"
	const leftIndex = safeIndex;
	const rightIndex = safeIndex + 1;
	const leftOrder = getColumnOrderAtIndex(columns, leftIndex);
	const rightOrder = getColumnOrderAtIndex(columns, rightIndex);
	return calculateOrderBetween(leftOrder, rightOrder, leftIndex, rightIndex);
};
