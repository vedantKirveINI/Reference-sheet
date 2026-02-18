// Transform backend groupPoints to linearRows for canvas rendering
// Backend sends pre-formatted groupPoints, so we only need to convert them to linearRows structure
// Reference: teable/packages/sdk/src/components/grid/Grid.tsx (lines 340-411)

import type {
	IGroupPoint,
	IGroupTransformationResult,
	IGroupLinearRow,
} from "@/types/grouping";
import { GroupPointType } from "@/types/grouping";
import { LinearRowType } from "@/types";

export const groupPointsToLinearRows = (
	groupPoints: IGroupPoint[],
	hasAppendRow: boolean = false,
	groupHeaderHeight: number = 40,
	appendRowHeight: number = 40,
): IGroupTransformationResult => {
	if (!groupPoints || groupPoints.length === 0) {
		return {
			linearRows: [],
			real2LinearRowMap: null,
			rowCount: 0,
			pureRowCount: 0,
			rowHeightMap: undefined,
		};
	}

	let rowIndex = 0; // Current position in sorted records array
	let totalIndex = 0; // Current position in linearRows array
	let currentValue: unknown = null;
	let collapsedDepth = Number.MAX_SAFE_INTEGER;
	const linearRows: IGroupLinearRow[] = [];
	const rowHeightMap: Record<number, number> = {};
	const real2LinearRowMap: Record<number, number> = {};

	// Helper function to calculate item count for a group header
	const calculateItemCount = (
		startIndex: number,
		headerDepth: number,
	): number => {
		let itemCount = 0;
		let lookAheadIndex = startIndex + 1;

		while (lookAheadIndex < groupPoints.length) {
			const nextPoint = groupPoints[lookAheadIndex];

			if (nextPoint.type === GroupPointType.Header) {
				const nextDepth = (nextPoint as Extract<
					IGroupPoint,
					{ type: GroupPointType.Header }
				>).depth ?? 0;
				// Stop when we hit a peer or parent group (same or higher depth)
				if (nextDepth <= headerDepth) {
					break;
				}
			} else if (nextPoint.type === GroupPointType.Row) {
				// Sum the count from Row points
				const rowPoint = nextPoint as Extract<
					IGroupPoint,
					{ type: GroupPointType.Row }
				>;
				itemCount += rowPoint.count ?? 0;
			}

			lookAheadIndex++;
		}

		return itemCount;
	};

	// Use for loop to enable look-ahead for item count calculation
	for (let i = 0; i < groupPoints.length; i++) {
		const point = groupPoints[i];
		const { type } = point;

		if (type === GroupPointType.Header) {
			const { id, value, depth, isCollapsed = false } = point as Extract<
				IGroupPoint,
				{ type: GroupPointType.Header }
			>;

			const isSubGroup = depth > collapsedDepth;

			// Handle collapsed groups
			if (isCollapsed) {
				collapsedDepth = Math.min(collapsedDepth, depth);
				if (isSubGroup) continue; // Skip nested groups inside collapsed parent
			} else if (!isSubGroup) {
				// Reset collapsedDepth when encountering next peer group
				collapsedDepth = Number.MAX_SAFE_INTEGER;
			} else {
				// Skip if parent is collapsed
				continue;
			}

			// Calculate item count for this group header (Airtable-style)
			const itemCount = calculateItemCount(i, depth ?? 0);

			// Add group header to linearRows
			rowHeightMap[totalIndex] = groupHeaderHeight;
			const linearRowEntry: IGroupLinearRow = {
				id,
				type: LinearRowType.Group,
				depth,
				value,
				realIndex: -1, // Group headers don't have a real record index
				isCollapsed: isCollapsed ?? false, // Default to false if undefined
				itemCount, // Store calculated item count
			};

			linearRows.push(linearRowEntry);
			currentValue = value;
			totalIndex++;
		}

		if (type === GroupPointType.Row) {
			const { count } = point as Extract<IGroupPoint, { type: GroupPointType.Row }>;

			// Skip if inside collapsed group
			if (collapsedDepth !== Number.MAX_SAFE_INTEGER) {
				rowIndex += count;
				continue;
			}

			// Add row entries for each record in this group
			for (let j = 0; j < count; j++) {
				real2LinearRowMap[rowIndex + j] = totalIndex + j;
				linearRows.push({
					type: LinearRowType.Row,
					displayIndex: j + 1,
					realIndex: rowIndex + j,
				});
			}

			rowIndex += count;
			totalIndex += count;

			// Add append row if needed
			if (hasAppendRow) {
				rowHeightMap[totalIndex] = appendRowHeight;
				linearRows.push({
					type: LinearRowType.Append,
					value: currentValue,
					realIndex: -1, // Append rows don't have a real record index (they're for creating new records)
				});
				totalIndex++;
			}
		}
	}

	return {
		linearRows,
		real2LinearRowMap,
		pureRowCount: rowIndex,
		rowCount: totalIndex,
		rowHeightMap,
	};
};

