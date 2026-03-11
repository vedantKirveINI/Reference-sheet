// Drag and Drop Utility Functions
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/utils/drag.ts

import type { IStackData } from "@/types/kanban";
import { UNCATEGORIZED_STACK_ID } from "@/types/kanban";

/**
 * Reorders items in an array by moving an item from sourceIndex to targetIndex
 */
export const reorder = <T>(list: T[], sourceIndex: number, targetIndex: number): T[] => {
	const result = Array.from(list);
	const [removed] = result.splice(sourceIndex, 1);
	result.splice(targetIndex, 0, removed);
	return result;
};

/**
 * Moves an item from source array to target array
 */
export const moveTo = <T>({
	source,
	sourceIndex,
	target,
	targetIndex,
}: {
	source: T[];
	sourceIndex: number;
	target: T[];
	targetIndex: number;
}): {
	sourceList: T[];
	targetList: T[];
} => {
	const sourceList = Array.from(source);
	const targetList = Array.from(target);
	const [sourceCard] = sourceList.splice(sourceIndex, 1);

	targetList.splice(targetIndex, 0, sourceCard);

	return {
		sourceList,
		targetList,
	};
};

/**
 * Converts stack data to cell value for backend
 * Returns null for uncategorized stacks, otherwise returns stack.data
 * Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/utils/card.ts
 */
export const getCellValueByStack = (stack: IStackData): unknown => {
	const { id, data } = stack;

	if (id === UNCATEGORIZED_STACK_ID) {
		return null;
	}

	return data;
};
