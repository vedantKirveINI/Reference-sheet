// Phase 1: Grouping Type Definitions
// Reference: teable/packages/openapi/src/aggregation/type.ts

// Core group point types (matches Teable's structure)
export enum GroupPointType {
	Header = 0,
	Row = 1,
}

export interface IGroupHeaderPoint {
	id: string;
	type: GroupPointType.Header;
	depth: number;
	value: unknown;
	isCollapsed: boolean;
}

export interface IGroupRowPoint {
	type: GroupPointType.Row;
	count: number;
}

export type IGroupPoint = IGroupHeaderPoint | IGroupRowPoint;

// Extended LinearRow for grouping (extends existing ILinearRow)
import { LinearRowType } from "./index";

export interface IGroupLinearRow {
	id?: string;
	type: LinearRowType;
	depth?: number;
	value?: unknown;
	realIndex?: number;
	displayIndex?: number;
	isCollapsed?: boolean;
	itemCount?: number; // Number of items in this group (for Airtable-style display)
}

// Group configuration (matches sheets-backend DTO structure)
export interface IGroupObject {
	fieldId: number;
	order: "asc" | "desc";
	dbFieldName?: string;
	type?: string;
}

export interface IGroupConfig {
	groupObjs: IGroupObject[];
}

// Group collection (for rendering group headers)
export interface IGroupColumn {
	id: number;
	name: string;
	icon?: string;
	width?: number;
	dbFieldName?: string; // Database field name for column matching
}

export interface IGroupCollection {
	groupColumns: IGroupColumn[];
	getGroupCell: (cellValue: unknown, depth: number) => any; // ICell type
}

// Transformation result types
export interface IGroupTransformationResult {
	linearRows: IGroupLinearRow[];
	real2LinearRowMap: Record<number, number> | null;
	rowCount: number;
	pureRowCount: number;
	rowHeightMap: Record<number, number> | undefined;
}
