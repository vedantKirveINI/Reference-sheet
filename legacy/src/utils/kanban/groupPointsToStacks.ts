// Phase 2: Transform groupPoints to stackCollection
// Converts flat groupPoints array into IStackData[] for Kanban view
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/context/KanbanProvider.tsx (lines 135-222)

import type { IGroupPoint } from "@/types/grouping";
import { GroupPointType } from "@/types/grouping";
import type { IStackData } from "@/types/kanban";
import type { IColumn } from "@/types";
import { CellType } from "@/types";

const UNCATEGORIZED_STACK_ID_CONST = 'uncategorized' as const;

/**
 * Transforms groupPoints array into stackCollection for Kanban view
 * 
 * @param groupPoints - Array of group points from backend (Header + Row pairs)
 * @param stackField - The field used for stacking (must be SingleSelect, User, etc.)
 * @param isEmptyStackHidden - Whether to hide empty stacks
 * @returns Array of stack data, or null if invalid input
 */
export function groupPointsToStacks(
	groupPoints: IGroupPoint[] | null | undefined,
	stackField: IColumn | null,
	isEmptyStackHidden: boolean = false
): IStackData[] | null {
	// Early return if no groupPoints or stackField
	if (!groupPoints || groupPoints.length === 0 || !stackField) {
		return null;
	}

	const stackList: IStackData[] = [];
	const stackMap: Record<string, IStackData> = {};

	// Process groupPoints: Header points followed by Row points
	// For Kanban, we only care about depth 0 (single-level grouping)
	for (let i = 0; i < groupPoints.length; i++) {
		const cur = groupPoints[i];

		// Skip non-header points
		if (cur.type !== GroupPointType.Header) continue;

		const headerPoint = cur as Extract<IGroupPoint, { type: GroupPointType.Header }>;
		const { id: groupId, value, depth } = headerPoint;

		// For Kanban, we only process depth 0 (single-level grouping)
		if (depth !== 0) continue;

		// Get the next point which should be a Row point with count
		const rowData = groupPoints[i + 1];
		if (rowData?.type !== GroupPointType.Row) continue;

		const rowPoint = rowData as Extract<IGroupPoint, { type: GroupPointType.Row }>;
		const { count } = rowPoint;

		// Create stack object
		const stackObj: IStackData = {
			id: groupId,
			count,
			data: value, // The grouping value (e.g., "Hello", "Hi", null for uncategorized)
		};

		stackList.push(stackObj);

		// For SingleSelect fields, map by name for later lookup
		if (stackField.type === CellType.SCQ || stackField.type === CellType.DropDown) {
			if (value != null && typeof value === 'string') {
				stackMap[value] = stackObj;
			}
		}
	}

	// Handle SingleSelect fields: ensure all choices are represented
	if (stackField.type === CellType.SCQ || stackField.type === CellType.DropDown) {
		const choices = stackField.options || [];
		
		// Build complete stack list with all choices
		const completeStackList: IStackData[] = choices.map((choice) => {
			// Choice can be string or { id, label } object
			const choiceName = typeof choice === 'string' ? choice : choice?.label || choice?.id;
			const choiceId = typeof choice === 'string' ? `choice_${choice}` : String(choice?.id || choiceName);

			// Check if we have an existing stack for this choice
			const existing = stackMap[choiceName];
			if (existing) {
				return existing;
			}

			// Create empty stack for choice that doesn't have records
			return {
				id: choiceId,
				count: 0,
				data: choiceName,
			};
		});

		// Add uncategorized stack at the beginning
		const uncategorizedStack: IStackData = {
			id: UNCATEGORIZED_STACK_ID_CONST,
			count: 0,
			data: null,
		};

		// Find uncategorized stack from processed groupPoints
		const uncategorizedFromGroupPoints = stackList.find(
			(stack) => stack.id === UNCATEGORIZED_STACK_ID_CONST || stack.data == null
		);
		if (uncategorizedFromGroupPoints) {
			uncategorizedStack.count = uncategorizedFromGroupPoints.count;
		}

		completeStackList.unshift(uncategorizedStack);

		// Filter out empty stacks if needed
		if (isEmptyStackHidden) {
			return completeStackList.filter((stack) => stack.count > 0);
		}

		return completeStackList;
	}

	// For other field types (User, etc.), just add uncategorized at the beginning
	const uncategorizedStack: IStackData = {
		id: UNCATEGORIZED_STACK_ID_CONST,
		count: 0,
		data: null,
	};

	// Find uncategorized stack from processed groupPoints
	const uncategorizedFromGroupPoints = stackList.find(
		(stack) => stack.id === UNCATEGORIZED_STACK_ID_CONST || stack.data == null
	);
	if (uncategorizedFromGroupPoints) {
		uncategorizedStack.count = uncategorizedFromGroupPoints.count;
	}

	stackList.unshift(uncategorizedStack);

	// Filter out empty stacks if needed
	if (isEmptyStackHidden) {
		return stackList.filter((stack) => stack.count > 0);
	}

	return stackList;
}

