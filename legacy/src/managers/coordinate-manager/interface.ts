// Inspired by Teable's CoordinateManager interface
export enum ItemType {
	Row = "Row",
	Column = "Column",
}

export interface ICellMetaData {
	offset: number;
	size: number;
}

export interface IIndicesMap {
	[index: number]: number;
}

export interface ICellMetaDataMap {
	[index: number]: ICellMetaData;
}

export interface ICoordinate {
	rowHeight: number;
	columnWidth: number;
	rowCount: number;
	pureRowCount: number;
	columnCount: number;
	containerWidth: number;
	containerHeight: number;
	rowInitSize?: number;
	columnInitSize?: number;
	rowHeightMap?: IIndicesMap;
	columnWidthMap?: IIndicesMap;
	freezeColumnCount?: number;
}
