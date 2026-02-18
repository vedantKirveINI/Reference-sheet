// Context Menu Types - Inspired by Teable
// Phase 1: Foundation - Type definitions for context menu system
// Reference: teable/packages/sdk/src/components/grid-enhancements/store/type.ts

import type { IColumn, IRecord } from "./index";

/**
 * Position interface for context menu placement
 */
export interface IPosition {
	x: number;
	y: number;
}

/**
 * Record Menu (Row/Cell Context Menu)
 * Shown when right-clicking on cells or rows
 */
export interface IRecordMenu {
	// Single selected record (for single row selection)
	record?: IRecord;
	// Neighbor records (for insert above/below)
	neighborRecords?: (IRecord | null)[];
	// Whether multiple rows are selected
	isMultipleSelected?: boolean;
	// Menu position
	position: IPosition;
	// Callback for deleting records
	deleteRecords?: () => Promise<void>;
	// Callback for inserting records
	insertRecord?: (
		anchorId: string,
		position: "before" | "after",
		num: number,
	) => void;
	// Callback for duplicating record
	duplicateRecord?: () => Promise<void>;
}

/**
 * Header Menu (Column Context Menu)
 * Shown when right-clicking on column headers
 */
export interface IHeaderMenu {
	// Selected columns/fields
	columns: IColumn[];
	// Menu position
	position: IPosition;
	// Callback to clear selection
	onSelectionClear?: () => void;
	// Phase 2B: Column operations callbacks
	onEditColumn?: (columnId: string, anchorPosition?: IPosition) => void;
	onDuplicateColumn?: (columnId: string) => void;
	onInsertColumn?: (
		columnId: string,
		position: "left" | "right",
		anchorPosition?: IPosition,
	) => void;
	onDeleteColumns?: (columnIds: number[]) => void;
	// Current sort/filter/groupBy state for context menu actions
	currentSort?: any;
	currentFilter?: any;
	currentGroupBy?: any;
	fields?: Array<{
		id: number | string;
		name: string;
		dbFieldName?: string;
		type?: string;
	}>;
}
