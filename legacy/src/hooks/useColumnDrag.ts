import { useCallback, useRef, useState } from "react";

import type { CoordinateManager } from "@/managers/coordinate-manager";
import type { CombinedSelection } from "@/managers/selection-manager";
import { flatRanges } from "@/utils/selectionUtils";
import type { IMouseState, IScrollState } from "@/types";
import { DragRegionType, RegionType } from "@/types";
import type { IRange } from "@/types/selection";

export interface IUseColumnDragProps {
	coordinateManager: CoordinateManager;
	scrollState: IScrollState;
	selection: CombinedSelection;
	rowHeaderWidth: number;
	columnCount: number;
}

export interface IColumnDragEndPayload {
	columnIndices: number[];
	dropIndex: number;
}

const DRAG_THRESHOLD = 5;

const DEFAULT_COLUMN_DRAG_STATE = {
	isActive: false,
	isDragging: false,
	columnIndices: [] as number[],
	ranges: [] as IRange[],
	pointerOffset: 0,
	visualLeft: 0,
	width: 0,
	dropIndex: -1,
	type: DragRegionType.None,
};

export const useColumnDrag = ({
	coordinateManager,
	scrollState,
	selection,
	rowHeaderWidth,
	columnCount,
}: IUseColumnDragProps) => {
	const startPointerXRef = useRef(0);
	const [columnDragState, setColumnDragState] = useState(
		DEFAULT_COLUMN_DRAG_STATE,
	);

	const getColumnIndicesFromSelection = useCallback(
		(columnIndex: number): IRange[] => {
			if (
				selection.isColumnSelection &&
				selection.includes([columnIndex, columnIndex])
			) {
				return selection.serialize();
			}
			return [[columnIndex, columnIndex]];
		},
		[selection],
	);

	const calculateDropIndex = useCallback(
		(mouseState: IMouseState) => {
			const pointerX = mouseState.x;
			const { columnIndex } = mouseState;

			if (columnCount <= 0) {
				return 0;
			}

			if (columnIndex != null && columnIndex >= 0 && columnIndex < columnCount) {
				const columnStart =
					coordinateManager.getColumnRelativeOffset(
						columnIndex,
						scrollState.scrollLeft,
					);
				const columnWidth = coordinateManager.getColumnWidth(columnIndex);
				const columnMid = columnStart + columnWidth / 2;
				return pointerX < columnMid ? columnIndex : columnIndex + 1;
			}

			// Pointer outside current columns - decide before first or after last
			const firstColumnStart = coordinateManager.getColumnRelativeOffset(
				0,
				scrollState.scrollLeft,
			);
			if (pointerX < firstColumnStart) {
				return 0;
			}

			const lastIndex = columnCount - 1;
			const lastColumnOffset = coordinateManager.getColumnRelativeOffset(
				lastIndex,
				scrollState.scrollLeft,
			);
			const lastColumnWidth = coordinateManager.getColumnWidth(lastIndex);
			const lastColumnEnd = lastColumnOffset + lastColumnWidth;
			return pointerX > lastColumnEnd ? columnCount : columnCount - 1;
		},
		[columnCount, coordinateManager, rowHeaderWidth, scrollState.scrollLeft],
	);

	const onColumnDragStart = useCallback(
		(mouseState: IMouseState) => {
			if (mouseState.type !== RegionType.ColumnHeader) {
				return;
			}

			const { columnIndex, x } = mouseState;
			if (columnIndex == null || columnIndex < 0 || columnIndex >= columnCount) {
				return;
			}

			const selectionRanges = getColumnIndicesFromSelection(columnIndex);
			const columnIndices = flatRanges(selectionRanges);
			const firstColumnIndex = columnIndices[0];

			const initialOffset =
				coordinateManager.getColumnRelativeOffset(
					firstColumnIndex,
					scrollState.scrollLeft,
				);

			const width = columnIndices.reduce(
				(sum, index) => sum + coordinateManager.getColumnWidth(index),
				0,
			);

			startPointerXRef.current = x;

			setColumnDragState({
				isActive: true,
				isDragging: false,
				columnIndices,
				ranges: selectionRanges,
				pointerOffset: x - initialOffset,
				visualLeft: initialOffset,
				width,
				dropIndex: firstColumnIndex,
				type: DragRegionType.Columns,
			});
		},
		[
			columnCount,
			coordinateManager,
			getColumnIndicesFromSelection,
			rowHeaderWidth,
			scrollState.scrollLeft,
		],
	);

	const onColumnDragChange = useCallback(
		(mouseState: IMouseState) => {
			setColumnDragState((prev) => {
				if (!prev.isActive) {
					return prev;
				}

				const nextState = { ...prev };
				nextState.visualLeft = mouseState.x - prev.pointerOffset;

				if (!prev.isDragging) {
					const delta = Math.abs(mouseState.x - startPointerXRef.current);
					if (delta > DRAG_THRESHOLD) {
						nextState.isDragging = true;
					}
				}

				if (nextState.isDragging) {
					const dropIndex = calculateDropIndex(mouseState);
					nextState.dropIndex = dropIndex;
				}

				return nextState;
			});
		},
		[calculateDropIndex],
	);

	const onColumnDragEnd = useCallback(
		(
			mouseState: IMouseState,
			callback?: (payload: IColumnDragEndPayload) => void,
		) => {
			let payload: IColumnDragEndPayload | null = null;
			setColumnDragState((prev) => {
				if (prev.isActive && prev.isDragging) {
					const dropIndex = calculateDropIndex(mouseState);
					payload = {
						columnIndices: prev.columnIndices,
						dropIndex,
					};
				}
				startPointerXRef.current = 0;
				return DEFAULT_COLUMN_DRAG_STATE;
			});

			if (payload && callback) {
				callback(payload);
			}
		},
		[calculateDropIndex],
	);

	const resetColumnDragState = useCallback(() => {
		startPointerXRef.current = 0;
		setColumnDragState(DEFAULT_COLUMN_DRAG_STATE);
	}, []);

	return {
		columnDragState,
		onColumnDragStart,
		onColumnDragChange,
		onColumnDragEnd,
		resetColumnDragState,
	};
};

