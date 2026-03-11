import React from "react";
import type { ICell, IColumn } from "@/types";
import { getCellRenderer } from "../renderers";
import { ErrorDisplay } from "../renderers/common/ErrorDisplay";

interface CellDisplayProps {
	cell: ICell;
	column: IColumn;
}

export const CellDisplay: React.FC<CellDisplayProps> = ({ cell, column }) => {
	if (!cell) {
		return null;
	}

	// Check for error state first (only for displayData showing [object Object])
	const cellValue = cell.data || cell.displayData;
	const displayDataString = String(cell.displayData || "");
	const hasGenericError =
		displayDataString === "[object Object]" ||
		displayDataString === "[object Array]";

	// Show generic error state if detected (before type-specific handling)
	// Format as [{}] for empty objects like grid cells
	if (hasGenericError && cellValue != null) {
		let errorMessage = "[{}]";
		try {
			// Try to stringify to get proper format
			if (Array.isArray(cellValue)) {
				// For arrays, stringify to show [{}] format
				errorMessage = JSON.stringify(cellValue);
			} else if (typeof cellValue === "object" && cellValue !== null) {
				// For single objects, check if empty
				if (Object.keys(cellValue).length === 0) {
					errorMessage = "[{}]";
				} else {
					errorMessage = JSON.stringify(cellValue);
				}
			} else {
				errorMessage = String(cellValue);
			}
		} catch {
			errorMessage = "[{}]";
		}

		return <ErrorDisplay message={errorMessage} />;
	}

	// Get renderer for this cell type using object-based mapping
	const Renderer = getCellRenderer(column.type);

	// Render using the appropriate renderer component
	return <Renderer cell={cell} column={column} />;
};
