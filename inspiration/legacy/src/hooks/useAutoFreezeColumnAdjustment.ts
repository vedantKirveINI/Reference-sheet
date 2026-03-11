// Hook to automatically adjust frozen columns when window is too narrow
// Inspired by Airtable's frozen column management
import { useState, useEffect, useCallback, useRef } from "react";
import type { CoordinateManager } from "@/managers/coordinate-manager";

interface UseAutoFreezeColumnAdjustmentProps {
	coordinateManager: CoordinateManager;
	containerWidth: number;
	rowHeaderWidth: number;
	zoomLevel: number;
	currentFreezeColumnCount: number;
	onFreezeColumnChange: (newCount: number) => void;
}

interface FreezeColumnWarningState {
	show: boolean;
	requestedCount: number;
	actualCount: number;
}

// Minimum width needed for scrollable content
// Uses a combination of fixed minimum and percentage of container width
// This ensures there's always enough space for scrolling unfrozen columns
// Prevents cases where too many columns are frozen (e.g., 4 out of 5 columns)
// leaving very little room for scrollable content
const MIN_SCROLLABLE_WIDTH_FIXED = 300; // Fixed minimum in logical pixels
const MIN_SCROLLABLE_WIDTH_PERCENT = 0.25; // 25% of available width

/**
 * Calculate the maximum number of frozen columns that can fit in the available space
 * @param coordinateManager - CoordinateManager instance
 * @param containerWidth - Physical container width
 * @param rowHeaderWidth - Width of row header
 * @param zoomLevel - Current zoom level
 * @returns Maximum number of frozen columns that can fit
 */
const calculateMaxFrozenColumns = (
	coordinateManager: CoordinateManager,
	containerWidth: number,
	rowHeaderWidth: number,
	zoomLevel: number,
): number => {
	const zoomScale = zoomLevel / 100;

	// CRITICAL: Convert physical container width to logical space
	// At 200% zoom: 1000px physical = 500px logical (columns take 2x visual space)
	// At 50% zoom: 1000px physical = 2000px logical (columns take 0.5x visual space)
	const logicalContainerWidth = containerWidth / zoomScale;

	// CRITICAL: rowHeaderWidth is in physical pixels, convert to logical space
	// At 200% zoom, row header takes 2x visual space, so in logical space it's smaller
	const logicalRowHeaderWidth = rowHeaderWidth / zoomScale;

	const availableWidthAfterRowHeader =
		logicalContainerWidth - logicalRowHeaderWidth;

	// Calculate minimum scrollable width using both fixed and percentage-based approach
	// This ensures there's always enough space for scrolling unfrozen columns
	// Prevents cases where too many columns are frozen (e.g., 4 out of 5 columns)
	// leaving very little room for scrollable content
	// CRITICAL: minScrollableWidth is in logical space (already accounts for zoom)
	const minScrollableByPercent =
		availableWidthAfterRowHeader * MIN_SCROLLABLE_WIDTH_PERCENT;
	const minScrollableWidth = Math.max(
		MIN_SCROLLABLE_WIDTH_FIXED,
		minScrollableByPercent,
	);

	const availableWidth = availableWidthAfterRowHeader - minScrollableWidth;

	if (availableWidth <= 0) {
		return 0; // No space for frozen columns
	}

	// Calculate how many columns can fit in the available width
	// CRITICAL: columnWidths from coordinateManager are already in logical space
	// So we can directly compare with availableWidth (also in logical space)
	let totalWidth = 0;
	let maxCount = 0;

	for (let i = 0; i < coordinateManager.columnCount; i++) {
		const columnWidth = coordinateManager.getColumnWidth(i);
		totalWidth += columnWidth;

		if (totalWidth <= availableWidth) {
			maxCount = i + 1;
		} else {
			break;
		}
	}

	return maxCount;
};

/**
 * Hook to automatically adjust frozen columns when window is too narrow
 * Similar to Airtable's behavior: reduces frozen columns and shows warning modal
 */
export const useAutoFreezeColumnAdjustment = ({
	coordinateManager,
	containerWidth,
	rowHeaderWidth,
	zoomLevel,
	currentFreezeColumnCount,
	onFreezeColumnChange,
}: UseAutoFreezeColumnAdjustmentProps) => {
	const [warningState, setWarningState] = useState<FreezeColumnWarningState>({
		show: false,
		requestedCount: 0,
		actualCount: 0,
	});

	const hasShownWarningRef = useRef<boolean>(false);
	const lastAdjustedCountRef = useRef<number>(currentFreezeColumnCount);

	// Calculate maximum frozen columns that can fit
	const maxFrozenColumns = calculateMaxFrozenColumns(
		coordinateManager,
		containerWidth,
		rowHeaderWidth,
		zoomLevel,
	);

	// Check if adjustment is needed
	useEffect(() => {
		// Only adjust if we have columns and a valid coordinate manager
		if (
			coordinateManager.columnCount === 0 ||
			containerWidth === 0 ||
			currentFreezeColumnCount === 0
		) {
			return;
		}

		// If current freeze count exceeds maximum, adjust it
		if (
			currentFreezeColumnCount > maxFrozenColumns &&
			maxFrozenColumns > 0
		) {
			const newCount = Math.max(1, maxFrozenColumns); // At least keep 1 frozen column

			// Only show warning if:
			// 1. This is a new adjustment (not already adjusted to this count)
			// 2. User had more than 1 frozen column
			// 3. We haven't shown a warning for this adjustment yet
			if (
				lastAdjustedCountRef.current !== newCount &&
				currentFreezeColumnCount > 1 &&
				!hasShownWarningRef.current
			) {
				setWarningState({
					show: true,
					requestedCount: currentFreezeColumnCount,
					actualCount: newCount,
				});
				hasShownWarningRef.current = true;
			}

			// Automatically adjust the freeze column count
			if (lastAdjustedCountRef.current !== newCount) {
				onFreezeColumnChange(newCount);
				lastAdjustedCountRef.current = newCount;
			}
		} else if (currentFreezeColumnCount <= maxFrozenColumns) {
			// Reset warning flag when there's enough space and count is valid
			hasShownWarningRef.current = false;
			lastAdjustedCountRef.current = currentFreezeColumnCount;
		}
	}, [
		coordinateManager,
		containerWidth,
		rowHeaderWidth,
		zoomLevel,
		currentFreezeColumnCount,
		maxFrozenColumns,
		onFreezeColumnChange,
	]);

	const handleResetToActual = useCallback(() => {
		// Already adjusted, just close the modal
		setWarningState((prev) => ({ ...prev, show: false }));
	}, []);

	const handleCancel = useCallback(() => {
		setWarningState((prev) => ({ ...prev, show: false }));
	}, []);

	return {
		warningState,
		maxFrozenColumns,
		handleResetToActual,
		handleCancel,
	};
};
