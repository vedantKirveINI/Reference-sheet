// Cell renderer for Signature type - Inspired by PhoneNumberRenderer and StringRenderer
import { GRID_DEFAULT } from "@/config/grid";
import type {
	ISignatureCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { drawSignaturePlaceholder } from "./utils/loadSignatureImage";

const { cellHorizontalPadding, cellVerticalPaddingMD } = GRID_DEFAULT;

// Constants for signature rendering
const SIGNATURE_MIN_WIDTH = 80; // Minimum width for signature image (matches editor)
const SIGNATURE_MIN_HEIGHT = 24; // Minimum height for signature image (matches editor)
const SIGNATURE_ASPECT_RATIO = 80 / 24; // Width:Height ratio (80px:24px from editor = 3.33:1)
const SIGNATURE_PADDING = 4; // Padding around signature image

export const signatureRenderer = {
	type: "Signature" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns standard cell dimensions (no special sizing needed)
	 */
	measure(
		cell: ISignatureCell,
		props: ICellMeasureProps,
	): ICellMeasureResult {
		const { width, height } = props;

		// Signature cells use standard dimensions
		return { width, height, totalHeight: height };
	},

	/**
	 * Draw cell content on canvas
	 * Renders signature image maintaining aspect ratio, centered vertically
	 */
	draw(cell: ISignatureCell, props: ICellRenderProps) {
		const { data, displayData } = cell;
		const { ctx, rect, theme } = props;
		const { x, y, width, height } = rect;

		// Get signature URL from data or displayData
		const signatureUrl = data || displayData || null;

		// If no signature URL, don't render anything
		if (!signatureUrl) {
			return;
		}

		// Calculate available dimensions (accounting for padding)
		const availableWidth =
			width - cellHorizontalPadding * 2 - SIGNATURE_PADDING * 2;
		const availableHeight =
			height - cellVerticalPaddingMD * 2 - SIGNATURE_PADDING * 2;

		// Calculate image dimensions dynamically based on available space
		// Try to use as much space as possible while maintaining aspect ratio
		// Calculate based on width constraint
		let imgWidthByWidth = Math.min(
			availableWidth,
			availableHeight * SIGNATURE_ASPECT_RATIO,
		);
		let imgHeightByWidth = imgWidthByWidth / SIGNATURE_ASPECT_RATIO;

		// Calculate based on height constraint
		let imgHeightByHeight = Math.min(
			availableHeight,
			availableWidth / SIGNATURE_ASPECT_RATIO,
		);
		let imgWidthByHeight = imgHeightByHeight * SIGNATURE_ASPECT_RATIO;

		// Choose the dimensions that fit best (use the larger size that fits)
		let imgWidth: number;
		let imgHeight: number;

		if (
			imgWidthByWidth <= availableWidth &&
			imgHeightByWidth <= availableHeight
		) {
			// Width-based calculation fits
			imgWidth = imgWidthByWidth;
			imgHeight = imgHeightByWidth;
		} else {
			// Use height-based calculation
			imgWidth = imgWidthByHeight;
			imgHeight = imgHeightByHeight;
		}

		// Ensure minimum dimensions are respected
		imgWidth = Math.max(SIGNATURE_MIN_WIDTH, imgWidth);
		imgHeight = Math.max(SIGNATURE_MIN_HEIGHT, imgHeight);

		// If after applying minimums we exceed available space, scale down proportionally
		if (imgWidth > availableWidth || imgHeight > availableHeight) {
			const widthScale = availableWidth / imgWidth;
			const heightScale = availableHeight / imgHeight;
			const scale = Math.min(widthScale, heightScale);
			imgWidth = imgWidth * scale;
			imgHeight = imgHeight * scale;
			// Re-apply minimums after scaling (might exceed available space slightly, but that's okay)
			imgWidth = Math.max(SIGNATURE_MIN_WIDTH, imgWidth);
			imgHeight = Math.max(SIGNATURE_MIN_HEIGHT, imgHeight);
		}

		// Calculate position (centered horizontally and vertically)
		const imgX = x + cellHorizontalPadding + SIGNATURE_PADDING;
		const imgY = y + (height - imgHeight) / 2; // Center vertically

		// Draw signature image with placeholder fallback
		drawSignaturePlaceholder(
			ctx,
			imgX,
			imgY,
			imgWidth,
			imgHeight,
			signatureUrl,
		);
	},
};
