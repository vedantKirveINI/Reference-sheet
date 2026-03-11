// Extract groupBy values from a record's group context
// Reuses existing functions: groupPointsToLinearRows and extractGroupByFieldValues
// Falls back to processing groupPoints directly if record is in collapsed group
// Reference: extractGroupByFieldValues and GridView append record logic

import { groupPointsToLinearRows } from "./groupPointsToLinearRows";
import { extractGroupByFieldValues } from "./extractGroupByValues";
import type { IGroupPoint, IGroupConfig, IGroupHeaderPoint } from "@/types/grouping";
import type { IRecord, ILinearRow } from "@/types";
import { LinearRowType } from "@/types";
import { GroupPointType } from "@/types/grouping";

/**
 * Extract groupBy field values from a record's group context
 * Follows plan: uses groupPointsToLinearRows and extractGroupByFieldValues
 * Falls back to direct groupPoints processing if record is in collapsed group
 * 
 * @param recordId - ID of the record to extract groupBy values for
 * @param records - Array of all records
 * @param groupPoints - Array of group points from backend
 * @param groupConfig - Group configuration with groupObjs
 * @returns Map of fieldId to value for all groupBy fields
 */
export const extractGroupByValuesFromRecord = (
	recordId: string,
	records: IRecord[],
	groupPoints: IGroupPoint[],
	groupConfig: IGroupConfig,
): { [fieldId: string]: unknown } => {
	// Edge case: No group config
	if (!groupConfig?.groupObjs || groupConfig.groupObjs.length === 0) {
		return {};
	}

	// Edge case: Empty groupPoints
	if (!groupPoints || groupPoints.length === 0) {
		return {};
	}

	// Edge case: Find record index
	const recordIndex = records.findIndex((r) => r.id === recordId);
	if (recordIndex === -1) return {};

	// Step 1: Convert groupPoints to linearRows using existing function
	const transformationResult = groupPointsToLinearRows(
		groupPoints,
		false, // hasAppendRow = false (we don't need append rows for this)
		40, // groupHeaderHeight (default)
		40, // appendRowHeight (default)
	);

	const { linearRows, real2LinearRowMap } = transformationResult;

	// Step 2: Find the record's position in linearRows
	let linearRowIndex: number | undefined;
	if (real2LinearRowMap) {
		linearRowIndex = real2LinearRowMap[recordIndex];
	}

	// If record is not in linearRows (e.g., in collapsed group), fall back to direct processing
	if (linearRowIndex === undefined || linearRowIndex < 0) {
		return extractGroupByValuesFromGroupPointsDirectly(
			recordIndex,
			groupPoints,
			groupConfig,
		);
	}

	// Step 3: Traverse backwards through linearRows to find the nearest group header
	// Same logic as append record in GridView.tsx (line ~4093-4116)
	for (let i = linearRowIndex - 1; i >= 0; i--) {
		const row = linearRows[i];
		if (row.type === LinearRowType.Group) {
			// Found a group header! Use extractGroupByFieldValues to get all parent groups
			return extractGroupByFieldValues(
				row as any, // IGroupLinearRow
				groupConfig,
				linearRows as ILinearRow[],
				i, // currentLinearIndex
			);
		}
	}

	// Edge case: No group header found (record at root level)
	return {};
};

/**
 * Fallback: Extract groupBy values by processing groupPoints directly
 * Used when record is in a collapsed group (not in linearRows)
 */
const extractGroupByValuesFromGroupPointsDirectly = (
	recordIndex: number,
	groupPoints: IGroupPoint[],
	groupConfig: IGroupConfig,
): { [fieldId: string]: unknown } => {
	// Track active group headers at each depth as we iterate
	let currentRecordIndex = 0;
	const activeGroupHeaders = new Map<number, IGroupHeaderPoint>();

	for (let i = 0; i < groupPoints.length; i++) {
		const point = groupPoints[i];

		if (point.type === GroupPointType.Header) {
			const headerPoint = point as IGroupHeaderPoint;
			const depth = headerPoint.depth ?? 0;

			// When we encounter a group header, update active groups
			// Remove all groups at this depth or deeper (they're being replaced)
			const depthsToRemove: number[] = [];
			for (const [existingDepth] of activeGroupHeaders) {
				if (existingDepth >= depth) {
					depthsToRemove.push(existingDepth);
				}
			}
			depthsToRemove.forEach((d) => activeGroupHeaders.delete(d));

			// Add this group header (even if collapsed - we still track it)
			activeGroupHeaders.set(depth, headerPoint);
		} else if (point.type === GroupPointType.Row) {
			const rowPoint = point as Extract<IGroupPoint, { type: GroupPointType.Row }>;
			const count = rowPoint.count ?? 0;

			// Check if our target record is in this row batch
			const recordStartIndex = currentRecordIndex;
			const recordEndIndex = currentRecordIndex + count - 1;

			if (recordIndex >= recordStartIndex && recordIndex <= recordEndIndex) {
				// Found the record! Extract groupBy values from active group headers
				return extractGroupByValuesFromActiveHeaders(
					activeGroupHeaders,
					groupConfig,
				);
			}

			// Move to next batch of records
			currentRecordIndex += count;
		}
	}

	// Edge case: Record not found in groupPoints
	return {};
};

/**
 * Extract groupBy values from active group headers
 * Maps group headers at each depth to their corresponding fieldId in groupConfig
 */
const extractGroupByValuesFromActiveHeaders = (
	activeGroupHeaders: Map<number, IGroupHeaderPoint>,
	groupConfig: IGroupConfig,
): { [fieldId: string]: unknown } => {
	const groupByFieldValues: { [fieldId: string]: unknown } = {};

	// For each groupBy field in the config, get its value from the corresponding depth
	for (
		let targetDepth = 0;
		targetDepth < groupConfig.groupObjs.length;
		targetDepth++
	) {
		const groupObj = groupConfig.groupObjs[targetDepth];
		if (!groupObj) continue;

		const fieldId = String(groupObj.fieldId);
		const groupHeader = activeGroupHeaders.get(targetDepth);

		// Get value from group header, or null if no group at this depth
		groupByFieldValues[fieldId] = groupHeader?.value ?? null;
	}

	return groupByFieldValues;
};

