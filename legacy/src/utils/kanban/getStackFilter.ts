// Phase 2: Get stack filter for backend queries
// Creates a filter object for a stack (for future backend integration)
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/utils/filter.ts

import type { IStackData } from "@/types/kanban";
import type { IColumn } from "@/types";
import { UNCATEGORIZED_STACK_ID } from "@/types/kanban";

/**
 * Filter operator types (simplified for now)
 * In a real implementation, this would match your backend filter structure
 */
export type FilterOperator = 'is' | 'isEmpty' | 'isExactly';

/**
 * Filter condition structure
 * This is a simplified version - adjust to match your backend's filter structure
 */
export interface IFilterCondition {
	fieldId: string;
	operator: FilterOperator;
	value: string | null;
}

/**
 * Creates a filter object for a stack (for backend queries)
 * 
 * @param stack - The stack to create a filter for
 * @param stackField - The field used for stacking
 * @returns Filter condition object, or null if invalid
 */
export function getStackFilter(
	stack: IStackData,
	stackField: IColumn
): IFilterCondition | null {
	const { id: stackId, data: stackData } = stack;
	const isUncategorized = stackId === UNCATEGORIZED_STACK_ID || stackData == null;

	// Get the field ID (use dbFieldName if available, otherwise use id)
	const fieldId = stackField.id;

	// For uncategorized, use isEmpty operator
	if (isUncategorized) {
		return {
			fieldId,
			operator: 'isEmpty',
			value: null,
		};
	}

	// For categorized records, use 'is' operator for SingleSelect
	// or 'isExactly' for MultipleSelect
	const operator: FilterOperator = 'is'; // Default to 'is' for SingleSelect

	return {
		fieldId,
		operator,
		value: stackData as string,
	};
}

/**
 * Creates a filter object for multiple stacks (OR condition)
 * Useful for filtering records that belong to any of the given stacks
 */
export function getStacksFilter(
	stacks: IStackData[],
	stackField: IColumn
): IFilterCondition[] {
	return stacks
		.map((stack) => getStackFilter(stack, stackField))
		.filter((filter): filter is IFilterCondition => filter !== null);
}

