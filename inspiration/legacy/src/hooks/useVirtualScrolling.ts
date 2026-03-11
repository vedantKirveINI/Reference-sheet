// Inspired by Teable's virtual scrolling implementation
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CoordinateManager } from "../managers/coordinate-manager";
import type { IIndicesMap } from "../managers/coordinate-manager";

export interface IVirtualScrollingConfig {
	containerHeight: number;
	containerWidth: number;
	rowHeight: number; // Default row height
	columnWidth: number; // Default column width
	totalRows: number;
	pureRows?: number;
	totalColumns: number;
	overscan?: number;
	// Variable sizes support
	rowHeightMap?: IIndicesMap; // Map of row index -> height
	columnWidthMap?: IIndicesMap; // Map of column index -> width
	// Frozen region sizes (like Teable's rowInitSize/columnInitSize)
	rowInitSize?: number; // Header height offset (default: 0)
	columnInitSize?: number; // Row header width offset (default: 0)
	freezeColumnCount?: number; // Number of frozen columns (default: 0)
}

export interface IVisibleRange {
	startRow: number;
	endRow: number;
	startColumn: number;
	endColumn: number;
}

export interface IVirtualScrollingState {
	scrollTop: number;
	scrollLeft: number;
	visibleRange: IVisibleRange;
	isScrolling: boolean;
}

export const useVirtualScrolling = (config: IVirtualScrollingConfig) => {
	const {
		containerHeight,
		containerWidth,
		rowHeight,
		columnWidth,
		totalRows,
		pureRows = totalRows,
		totalColumns,
		overscan = 5,
		rowHeightMap = {},
		columnWidthMap = {},
		rowInitSize = 0,
		columnInitSize = 0,
		freezeColumnCount = 0,
	} = config;

	// Create CoordinateManager instance - use useMemo (like Teable)
	// When rowHeight changes, new instance is created, triggering dependent hooks automatically
	// This ensures visible range recalculates immediately when row height changes
	const coordinateManager = useMemo<CoordinateManager>(() => {
		return new CoordinateManager({
			rowHeight,
			columnWidth,
			rowCount: totalRows,
			pureRowCount: pureRows,
			columnCount: totalColumns,
			containerWidth,
			containerHeight,
			rowInitSize, // Header height offset (for frozen header region)
			columnInitSize, // Row header width offset (for frozen row header region)
			rowHeightMap,
			columnWidthMap,
			freezeColumnCount, // Number of frozen columns
		});
	}, [
		rowHeight, // ← Key: When this changes, new instance created → reference changes → dependent hooks recalculate
		columnWidth,
		totalRows,
		totalColumns,
		containerWidth,
		containerHeight,
		rowInitSize,
		columnInitSize,
		rowHeightMap,
		columnWidthMap,
		freezeColumnCount,
	]);

	// Initialize scroll state - visible range will be recalculated by useEffect when coordinateManager is ready
	const [scrollState, setScrollState] = useState<IVirtualScrollingState>({
		scrollTop: 0,
		scrollLeft: 0,
		visibleRange: {
			startRow: 0,
			endRow: Math.min(totalRows, Math.ceil(containerHeight / rowHeight)),
			startColumn: 0,
			endColumn: Math.min(
				totalColumns,
				Math.ceil(containerWidth / columnWidth),
			),
		},
		isScrolling: false,
	});

	// Calculate visible range based on scroll position using binary search
	const calculateVisibleRange = useCallback(
		(scrollTop: number, scrollLeft: number): IVisibleRange => {
			// Use CoordinateManager for binary search instead of simple division
			// This correctly handles variable row/column sizes
			const startRow = Math.max(
				0,
				coordinateManager.getRowStartIndex(scrollTop) - overscan,
			);
			// Like Teable: add +1 to ensure last row is included
			// Note: endRow is EXCLUSIVE (used in i < endRow loop), so totalRows (50) includes all rows 0-49
			const stopIndex = coordinateManager.getRowStopIndex(
				startRow,
				scrollTop,
			);
			const endRow = Math.min(
				totalRows, // Exclusive end: totalRows (50) includes all rows 0-49
				stopIndex + 1 + overscan, // Add +1 like Teable's getVerticalRangeInfo to include last row
			);

			const startColumn = Math.max(
				0,
				coordinateManager.getColumnStartIndex(scrollLeft) - overscan,
			);
			const endColumn = Math.min(
				totalColumns,
				coordinateManager.getColumnStopIndex(startColumn, scrollLeft) +
					overscan,
			);

			return { startRow, endRow, startColumn, endColumn };
		},
		[
			containerHeight,
			containerWidth,
			totalRows,
			totalColumns,
			overscan,
			coordinateManager,
		],
	);

	// Update scroll position
	const setScrollPosition = useCallback(
		(scrollTop: number, scrollLeft: number) => {
			setScrollState((prev: IVirtualScrollingState) => {
				const newVisibleRange = calculateVisibleRange(
					scrollTop,
					scrollLeft,
				);

				// Only update if visible range actually changed
				if (
					newVisibleRange.startRow !== prev.visibleRange.startRow ||
					newVisibleRange.endRow !== prev.visibleRange.endRow ||
					newVisibleRange.startColumn !==
						prev.visibleRange.startColumn ||
					newVisibleRange.endColumn !== prev.visibleRange.endColumn
				) {
					return {
						scrollTop,
						scrollLeft,
						visibleRange: newVisibleRange,
						isScrolling: true,
					};
				}

				return {
					...prev,
					scrollTop,
					scrollLeft,
				};
			});
		},
		[calculateVisibleRange],
	);

	// Handle scroll events
	const handleScroll = useCallback(
		(event: Event) => {
			const target = event.target as HTMLElement;
			const scrollTop = target.scrollTop;
			const scrollLeft = target.scrollLeft;

			setScrollPosition(scrollTop, scrollLeft);
		},
		[setScrollPosition],
	);

	// Stop scrolling state after a delay
	useEffect(() => {
		if (scrollState.isScrolling) {
			const timer = setTimeout(() => {
				setScrollState((prev: IVirtualScrollingState) => ({
					...prev,
					isScrolling: false,
				}));
			}, 150);

			return () => clearTimeout(timer);
		}
	}, [scrollState.isScrolling]);

	// CRITICAL FIX: Recalculate visible range when coordinateManager changes (e.g., row height change)
	// When rowHeight changes, coordinateManager is recreated, but visible range isn't recalculated automatically
	// This useEffect ensures visible range is recalculated immediately when coordinateManager changes
	// Match Teable's approach: they use useMemo for visible region, but we need to update state when coordInstance changes
	const prevCoordinateManagerRef = useRef<CoordinateManager | null>(null);
	
	useEffect(() => {
		// Skip if coordinateManager hasn't actually changed (same reference)
		if (prevCoordinateManagerRef.current === coordinateManager) {
			return;
		}
		
		// Update ref to current coordinateManager
		prevCoordinateManagerRef.current = coordinateManager;
		
		// Recalculate visible range using current scroll position
		// This ensures the viewport shows the correct rows after row height change
		// Use the current scrollState from the hook (not from closure) to avoid stale values
		setScrollState((prev) => {
			const newVisibleRange = calculateVisibleRange(
				prev.scrollTop,
				prev.scrollLeft,
			);
			
			// Only update if visible range actually changed
			if (
				newVisibleRange.startRow !== prev.visibleRange.startRow ||
				newVisibleRange.endRow !== prev.visibleRange.endRow ||
				newVisibleRange.startColumn !== prev.visibleRange.startColumn ||
				newVisibleRange.endColumn !== prev.visibleRange.endColumn
			) {
				return {
					...prev,
					visibleRange: newVisibleRange,
				};
			}
			
			// No change needed - return previous state to avoid unnecessary re-render
			return prev;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
		// Only depend on coordinateManager - calculateVisibleRange and setScrollState accessed via closure
		// This prevents infinite loops while ensuring visible range is recalculated when row height changes
	}, [coordinateManager]);

	// Calculate total content dimensions using CoordinateManager
	// Depend on coordinateManager reference (like Teable) - when it changes, recalculate
	const contentDimensions = useMemo(
		() => ({
			totalHeight: coordinateManager.totalHeight,
			totalWidth: coordinateManager.totalWidth,
		}),
		[
			coordinateManager, // ← Depend on reference, not just properties (like Teable)
			totalRows,
			totalColumns,
		],
	);

	// Calculate visible content dimensions
	const visibleDimensions = useMemo(
		() => ({
			visibleHeight:
				(scrollState.visibleRange.endRow -
					scrollState.visibleRange.startRow) *
				rowHeight,
			visibleWidth:
				(scrollState.visibleRange.endColumn -
					scrollState.visibleRange.startColumn) *
				columnWidth,
		}),
		[scrollState.visibleRange, rowHeight, columnWidth],
	);

	// Calculate offset for visible content
	// Use CoordinateManager to get accurate offsets (handles rowInitSize/columnInitSize)
	const contentOffset = useMemo(
		() => ({
			offsetY: coordinateManager.getRowOffset(
				scrollState.visibleRange.startRow,
			),
			offsetX: coordinateManager.getColumnOffset(
				scrollState.visibleRange.startColumn,
			),
		}),
		[coordinateManager, scrollState.visibleRange],
	);

	// Generate visible row and column indices
	const visibleIndices = useMemo(() => {
		const rows: number[] = [];
		const columns: number[] = [];

		for (
			let i = scrollState.visibleRange.startRow;
			i < scrollState.visibleRange.endRow;
			i++
		) {
			rows.push(i);
		}

		for (
			let i = scrollState.visibleRange.startColumn;
			i < scrollState.visibleRange.endColumn;
			i++
		) {
			columns.push(i);
		}

		return { rows, columns };
	}, [scrollState.visibleRange]);

	return {
		scrollState,
		setScrollPosition,
		handleScroll,
		contentDimensions,
		visibleDimensions,
		contentOffset,
		visibleIndices,
		coordinateManager, // Export coordinateManager for editor positioning
	};
};
