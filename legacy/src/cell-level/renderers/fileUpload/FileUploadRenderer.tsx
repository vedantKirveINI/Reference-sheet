// Cell renderer for FileUpload type - Inspired by sheets project's FilePickerRenderer
import { GRID_DEFAULT } from "@/config/grid";
import type {
	IFileUploadCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { validateFileUpload } from "./utils/validateFileUpload";
import {
	drawFileIconPlaceholder,
	ICON_WIDTH,
	ICON_HEIGHT,
} from "./utils/drawFileIcon";
import { drawChip, CHIP_WIDTH } from "./utils/drawChip";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding, cellVerticalPaddingSM } = GRID_DEFAULT;

// Gap between icons
const ICON_GAP = 4;

export const fileUploadRenderer = {
	type: "FileUpload" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns standard cell dimensions (no special sizing needed for now)
	 */
	measure(
		cell: IFileUploadCell,
		props: ICellMeasureProps,
	): ICellMeasureResult {
		const { width, height } = props;

		// FileUpload cells use standard dimensions
		// Could be enhanced to calculate height based on wrapped icons
		return { width, height, totalHeight: height };
	},

	/**
	 * Draw cell content on canvas
	 * Renders file icons horizontally with overflow chip
	 */
	draw(cell: IFileUploadCell, props: ICellRenderProps) {
		const { data, displayData } = cell;
		const { ctx, rect, theme } = props;
		const { x, y, width, height } = rect;

		// Validate file upload data first
		const cellValue = data || displayData;
		let validationResult: {
			isValid: boolean;
			processedValue: Array<{
				url: string;
				size: number;
				mimeType: string;
			}> | null;
		} | null = null;

		if (data) {
			// Validate data array
			validationResult = validateFileUpload(data);
		} else if (displayData) {
			// Validate displayData (JSON string)
			validationResult = validateFileUpload(displayData);
		}

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
		if (
			validationResult &&
			!validationResult.isValid &&
			cellValue !== null &&
			cellValue !== undefined &&
			cellValue !== ""
		) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value:
					typeof cellValue === "string"
						? cellValue
						: JSON.stringify(cellValue),
			});
			return;
		}

		// Parse file upload data
		let files: Array<{
			url: string;
			size: number;
			mimeType: string;
		}> | null = null;

		if (data) {
			// Use data if available
			files = Array.isArray(data) ? data : null;
		} else if (displayData && validationResult?.isValid) {
			// Use processed value from validation
			files = validationResult.processedValue;
		}

		// If no files, don't render anything
		if (!files || files.length === 0) {
			return;
		}

		// Calculate available width (accounting for padding)
		const availableWidth = width - cellHorizontalPadding * 2;

		// Align icons to the top with standard vertical padding
		const iconY = y + 4;

		// Starting X position
		let currentX = x + cellHorizontalPadding;

		// Calculate how many icons fit
		const totalIcons = files.length;
		const totalIconsWidth =
			totalIcons * ICON_WIDTH + (totalIcons - 1) * ICON_GAP;
		const needsChip = totalIconsWidth + CHIP_WIDTH > availableWidth;

		let visibleIconsCount = totalIcons;
		let hiddenCount = 0;

		if (needsChip) {
			// Calculate how many icons fit with chip
			const availableForIcons = availableWidth - CHIP_WIDTH - ICON_GAP;
			visibleIconsCount = Math.max(
				0,
				Math.floor(availableForIcons / (ICON_WIDTH + ICON_GAP)),
			);
			hiddenCount = totalIcons - visibleIconsCount;
		}

		// Draw visible icons
		const visibleFiles = files.slice(0, visibleIconsCount);
		for (let i = 0; i < visibleFiles.length; i++) {
			const file = visibleFiles[i];
			drawFileIconPlaceholder(
				ctx,
				currentX,
				iconY,
				file.url || "",
				file.mimeType,
			);
			currentX += ICON_WIDTH + ICON_GAP;
		}

		// Draw chip if there are hidden icons
		if (hiddenCount > 0) {
			drawChip(ctx, currentX, iconY, hiddenCount, theme);
		}
	},
};
